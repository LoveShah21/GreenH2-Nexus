const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  projectType: {
    type: String,
    enum: ['production', 'storage', 'distribution', 'hub'],
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['concept', 'planning', 'construction', 'operational'],
    default: 'concept',
    index: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
      validate: {
        validator: function (v) {
          return v.length === 2 &&
            v[0] >= -180 && v[0] <= 180 && // longitude
            v[1] >= -90 && v[1] <= 90;     // latitude
        },
        message: 'Invalid coordinates. Longitude must be between -180 and 180, latitude between -90 and 90.'
      }
    },
    address: {
      type: String,
      trim: true
    },
    city: {
      type: String,
      trim: true
    },
    region: {
      type: String,
      trim: true
    },
    country: {
      type: String,
      trim: true
    },
    postalCode: {
      type: String,
      trim: true
    }
  },
  capacityTPA: {
    type: Number,
    min: 0,
    required: true
  },
  stakeholders: [{
    type: String,
    trim: true
  }],
  startDate: {
    type: Date
  },
  completionDate: {
    type: Date
  },
  cost: {
    estimated: {
      type: Number,
      min: 0
    },
    actual: {
      type: Number,
      min: 0
    },
    currency: {
      type: String,
      default: 'USD'
    }
  },
  metadata: {
    tags: [{
      type: String,
      trim: true
    }],
    customFields: {
      type: mongoose.Schema.Types.Mixed
    }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for id field
projectSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

// Geospatial index for location-based queries
projectSchema.index({ location: '2dsphere' });

// Compound index for filtered geospatial queries
projectSchema.index({ projectType: 1, status: 1, location: '2dsphere' });

// Text index for search functionality
projectSchema.index({ name: 'text', 'metadata.tags': 'text' });

// Validation for completion date
projectSchema.pre('save', function (next) {
  if (this.completionDate && this.startDate && this.completionDate < this.startDate) {
    return next(new Error('Completion date cannot be before start date'));
  }
  next();
});

// Static method to find projects by type and status
projectSchema.statics.findByTypeAndStatus = function (projectType, status) {
  return this.find({ projectType, status });
};

// Static method to find projects within radius
projectSchema.statics.findNearby = function (longitude, latitude, radiusKm) {
  return this.find({
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        $maxDistance: radiusKm * 1000 // Convert km to meters
      }
    }
  });
};

// Static method to find projects within bounds
projectSchema.statics.findWithinBounds = function (bounds) {
  return this.find({
    location: {
      $geoWithin: {
        $box: [
          [bounds.swLng, bounds.swLat], // Southwest coordinates
          [bounds.neLng, bounds.neLat]  // Northeast coordinates
        ]
      }
    }
  });
};

// Static method to find projects by capacity range
projectSchema.statics.findByCapacityRange = function (minCapacity, maxCapacity) {
  const query = {};
  if (minCapacity !== undefined) query.capacityTPA = { $gte: minCapacity };
  if (maxCapacity !== undefined) {
    if (query.capacityTPA) {
      query.capacityTPA.$lte = maxCapacity;
    } else {
      query.capacityTPA = { $lte: maxCapacity };
    }
  }
  return this.find(query);
};

// Instance method to calculate project duration
projectSchema.methods.getDuration = function () {
  if (!this.startDate) return null;
  const endDate = this.completionDate || new Date();
  return Math.ceil((endDate - this.startDate) / (1000 * 60 * 60 * 24)); // days
};

// Instance method to check if project is overdue
projectSchema.methods.isOverdue = function () {
  if (!this.completionDate || this.status === 'operational') return false;
  return new Date() > this.completionDate;
};

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;
