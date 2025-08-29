const mongoose = require('mongoose');

const renewableSourceSchema = new mongoose.Schema({
  sourceType: {
    type: String,
    enum: ['wind', 'solar', 'hydro', 'biomass'],
    required: true,
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
        validator: function(v) {
          return v.length === 2 && 
                 v[0] >= -180 && v[0] <= 180 && // longitude
                 v[1] >= -90 && v[1] <= 90;     // latitude
        },
        message: 'Invalid coordinates. Longitude must be between -180 and 180, latitude between -90 and 90.'
      }
    }
  },
  capacityMW: {
    type: Number,
    required: true,
    min: 0
  },
  availabilityFactor: {
    type: Number,
    min: 0,
    max: 1, // 0-1 decimal
    default: 0.8
  },
  distanceToGrid: {
    type: Number,
    min: 0 // kilometers
  },
  annualGeneration: {
    type: Number,
    min: 0 // MWh/year
  },
  lcoe: { // Levelized Cost of Energy
    value: {
      type: Number,
      required: true,
      min: 0
    },
    currency: {
      type: String,
      default: 'USD'
    },
    unit: {
      type: String,
      default: 'MWh'
    }
  },
  environmentalData: {
    windSpeed: {
      type: Number,
      min: 0 // m/s average
    },
    solarIrradiance: {
      type: Number,
      min: 0 // kWh/m²/day
    },
    waterFlow: {
      type: Number,
      min: 0 // for hydro, m³/s
    }
  },
  region: {
    type: String,
    required: true,
    index: true
  },
  regulatoryZone: {
    type: String,
    required: true,
    index: true
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
  timestamps: true
});

// Geospatial index for location-based renewable source queries
renewableSourceSchema.index({ location: '2dsphere' });

// Compound index for capacity and type filtering
renewableSourceSchema.index({ sourceType: 1, capacityMW: -1, location: '2dsphere' });

// Index for regional queries
renewableSourceSchema.index({ region: 1, sourceType: 1 });

// Pre-save middleware to calculate annual generation if not provided
renewableSourceSchema.pre('save', function(next) {
  if (!this.annualGeneration && this.capacityMW && this.availabilityFactor) {
    // Calculate annual generation: capacity * availability * hours per year
    this.annualGeneration = this.capacityMW * this.availabilityFactor * 8760; // 8760 hours per year
  }
  next();
});

// Static method to find sources by type and capacity range
renewableSourceSchema.statics.findByTypeAndCapacity = function(sourceType, minCapacity, maxCapacity) {
  const query = { sourceType };
  if (minCapacity !== undefined) query.capacityMW = { $gte: minCapacity };
  if (maxCapacity !== undefined) {
    if (query.capacityMW) {
      query.capacityMW.$lte = maxCapacity;
    } else {
      query.capacityMW = { $lte: maxCapacity };
    }
  }
  return this.find(query);
};

// Static method to find sources within radius
renewableSourceSchema.statics.findNearby = function(longitude, latitude, radiusKm) {
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

// Static method to find sources by region
renewableSourceSchema.statics.findByRegion = function(region) {
  return this.find({ region });
};

// Static method to find sources with high availability
renewableSourceSchema.statics.findHighAvailability = function(minAvailability = 0.8) {
  return this.find({ availabilityFactor: { $gte: minAvailability } });
};

// Instance method to calculate actual annual output
renewableSourceSchema.methods.getActualAnnualOutput = function() {
  return this.capacityMW * this.availabilityFactor * 8760;
};

// Instance method to calculate capacity factor
renewableSourceSchema.methods.getCapacityFactor = function() {
  if (!this.annualGeneration) return this.availabilityFactor;
  return this.annualGeneration / (this.capacityMW * 8760);
};

// Instance method to check if source is high efficiency
renewableSourceSchema.methods.isHighEfficiency = function() {
  return this.availabilityFactor >= 0.8;
};

// Instance method to get environmental rating
renewableSourceSchema.methods.getEnvironmentalRating = function() {
  let rating = 0;
  
  if (this.sourceType === 'solar' || this.sourceType === 'wind') {
    rating += 3; // Renewable sources get high rating
  } else if (this.sourceType === 'hydro') {
    rating += 2; // Hydro gets medium rating
  } else {
    rating += 1; // Biomass gets lower rating
  }
  
  if (this.availabilityFactor >= 0.8) rating += 1;
  if (this.distanceToGrid <= 10) rating += 1;
  
  return Math.min(rating, 5); // Scale of 1-5
};

const RenewableSource = mongoose.model('RenewableSource', renewableSourceSchema);

module.exports = RenewableSource;
