const mongoose = require('mongoose');
const AnalyticsData = require('./src/models/AnalyticsData');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/hydrogen_analytics', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function createTestData() {
  try {
    // Create a test project ID
    const testProjectId = new mongoose.Types.ObjectId();
    const testUserId = new mongoose.Types.ObjectId();
    
    console.log('Creating test analytics data...');
    
    // Create sample analytics data for the last hour
    const now = new Date();
    const dataPoints = [];
    
    for (let i = 0; i < 10; i++) {
      const timestamp = new Date(now.getTime() - (i * 6 * 60 * 1000)); // Every 6 minutes
      
      dataPoints.push({
        dataType: 'demand_forecast',
        location: {
          type: 'Point',
          coordinates: [-74.0060, 40.7128]
        },
        timestamp: timestamp,
        timePeriod: 'hourly',
        projectId: testProjectId,
        createdBy: testUserId,
        demandForecast: {
          predictedDemand: 150 + (Math.random() * 50),
          confidenceInterval: {
            lower: 140,
            upper: 160
          }
        },
        capacityUtilization: {
          currentUtilization: 0.7 + (Math.random() * 0.2),
          peakUtilization: 0.8 + (Math.random() * 0.15),
          averageUtilization: 0.65 + (Math.random() * 0.2)
        },
        costAnalysis: {
          operationalCosts: 50000 + (Math.random() * 10000),
          capitalCosts: 1000000 + (Math.random() * 200000),
          maintenanceCosts: 20000 + (Math.random() * 5000),
          energyCosts: 30000 + (Math.random() * 8000),
          levelizedCost: 0.08 + (Math.random() * 0.02)
        },
        environmentalImpact: {
          carbonEmissions: 1000 + (Math.random() * 200),
          waterUsage: 5000 + (Math.random() * 1000),
          landUse: 100 + (Math.random() * 20)
        },
        metadata: {
          source: 'test_data',
          quality: 'high'
        }
      });
    }
    
    // Insert the data
    await AnalyticsData.insertMany(dataPoints);
    
    console.log(`✅ Created ${dataPoints.length} test data points`);
    console.log(`📊 Test Project ID: ${testProjectId}`);
    console.log(`🔗 Test URL: http://localhost:3000/api/analytics/real-time-metrics/${testProjectId}?timeWindow=1h&metrics=efficiency,capacity,demand`);
    
  } catch (error) {
    console.error('❌ Error creating test data:', error);
  } finally {
    mongoose.disconnect();
  }
}

createTestData();
