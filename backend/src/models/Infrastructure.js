const mongoose = require('mongoose');

const infrastructureSchema = new mongoose.Schema({
  infrastructureType: {
    type: String,
    enum: ['pipeline', 'storage_facility', 'production_plant', 'distribution_hub'],
    required: true,
    index: true
  },
  geometry: {
    // For pipelines (LineString) and complex facilities (Polygon)
    type: {
      type: String,
      enum: ['Point', 'LineString', 'Polygon', 'MultiPolygon'],
      required: true
    },
    coordinates: {
      type: mongoose.Schema.Types.Mixed, // Flexible for different geometries
      required: true,
      validate: {
        validator: function (v) {
          // Basic validation for different geometry types
          console.log('Validating coordinates:', v);
          console.log('Geometry type:', this.geometry?.type);
          console.log('Parent object:', this);

          if (this.geometry.type === 'Point') {
            const isValid = Array.isArray(v) && v.length === 2 &&
              typeof v[0] === 'number' && typeof v[1] === 'number' &&
              v[0] >= -180 && v[0] <= 180 &&
              v[1] >= -90 && v[1] <= 90;
            console.log('Point validation result:', isValid);
            return isValid;
          }
          if (this.geometry.type === 'LineString') {
            return Array.isArray(v) && v.length >= 2 &&
              v.every(coord => Array.isArray(coord) && coord.length === 2);
          }
          if (this.geometry.type === 'Polygon') {
            return Array.isArray(v) && v.length >= 1 &&
              v.every(ring => Array.isArray(ring) && ring.length >= 3);
          }
          if (this.geometry.type === 'MultiPolygon') {
            return Array.isArray(v) && v.every(polygon =>
              Array.isArray(polygon) && polygon.every(ring =>
                Array.isArray(ring) && ring.length >= 3
              )
            );
          }
          return false;
        },
        message: 'Invalid geometry coordinates for the specified type.'
      }
    }
  },
  capacity: {
    value: {
      type: Number,
      required: true,
      min: 0
    },
    unit: {
      type: String,
      default: 'tpa' // tons per annum
    }
  },
  operationalStatus: {
    type: String,
    enum: ['operational', 'under_construction', 'planned', 'decommissioned'],
    default: 'planned',
    index: true
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
    index: true
  },
  connectedInfrastructure: [{
    infrastructureId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Infrastructure'
    },
    connectionType: {
      type: String,
      enum: ['pipeline', 'transport', 'electrical']
    },
    distance: {
      type: Number,
      min: 0 // in kilometers
    }
  }],
  specifications: {
    diameter: {
      type: Number,
      min: 0 // for pipelines
    },
    pressure: {
      type: Number,
      min: 0 // operating pressure
    },
    material: String,
    safetyRating: String
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

// Geospatial index for infrastructure geometry
infrastructureSchema.index({ geometry: '2dsphere' });

// Compound index for type-based geospatial queries
infrastructureSchema.index({ infrastructureType: 1, operationalStatus: 1, geometry: '2dsphere' });

// Index for project relationships
infrastructureSchema.index({ projectId: 1, infrastructureType: 1 });

// Static method to find infrastructure by type and status
infrastructureSchema.statics.findByTypeAndStatus = function (type, status) {
  return this.find({ infrastructureType: type, operationalStatus: status });
};

// Static method to find infrastructure within bounds
infrastructureSchema.statics.findWithinBounds = function (bounds) {
  return this.find({
    geometry: {
      $geoWithin: {
        $box: [
          [bounds.swLng, bounds.swLat],
          [bounds.neLng, bounds.neLat]
        ]
      }
    }
  });
};

// Static method to find infrastructure near a point
infrastructureSchema.statics.findNearPoint = function (longitude, latitude, maxDistanceKm) {
  return this.find({
    geometry: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        $maxDistance: maxDistanceKm * 1000
      }
    }
  });
};

// Static method to find connected infrastructure
infrastructureSchema.statics.findConnected = function (infrastructureId) {
  return this.find({
    'connectedInfrastructure.infrastructureId': infrastructureId
  });
};

// Static method to find infrastructure by capacity range
infrastructureSchema.statics.findByCapacityRange = function (minCapacity, maxCapacity) {
  const query = {};
  if (minCapacity !== undefined) query['capacity.value'] = { $gte: minCapacity };
  if (maxCapacity !== undefined) {
    if (query['capacity.value']) {
      query['capacity.value'].$lte = maxCapacity;
    } else {
      query['capacity.value'] = { $lte: maxCapacity };
    }
  }
  return this.find(query);
};

// Instance method to get total connected capacity
infrastructureSchema.methods.getTotalConnectedCapacity = async function () {
  const connectedIds = this.connectedInfrastructure.map(conn => conn.infrastructureId);
  const connectedInfra = await this.constructor.find({
    _id: { $in: connectedIds }
  });
  return connectedInfra.reduce((total, infra) => total + infra.capacity.value, 0);
};

// Instance method to check if infrastructure is operational
infrastructureSchema.methods.isOperational = function () {
  return this.operationalStatus === 'operational';
};

// Instance method to get connection count
infrastructureSchema.methods.getConnectionCount = function () {
  return this.connectedInfrastructure.length;
};

const Infrastructure = mongoose.model('Infrastructure', infrastructureSchema);

module.exports = Infrastructure;
