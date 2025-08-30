const express = require('express');
const analyticsController = require('../controllers/analyticsController');

const router = express.Router();

// Advanced Analytics Endpoints

// Geospatial Analysis
router.post('/geospatial', analyticsController.performGeospatialAnalysis);

// Demand Forecasting
router.post('/demand-forecast', analyticsController.performDemandForecasting);

// Cost Optimization
router.post('/cost-optimization', analyticsController.performCostOptimization);

// Network Analysis
router.post('/network-analysis', analyticsController.performNetworkAnalysis);

// Environmental Assessment
router.post('/environmental-assessment', analyticsController.performEnvironmentalAssessment);

// Real-time Metrics
router.get('/real-time-metrics/:projectId', analyticsController.getRealTimeMetrics);

// Multi-Criteria Decision Analysis
router.post('/mcda', analyticsController.performMultiCriteriaAnalysis);

// Genetic Algorithm Optimization
router.post('/genetic-optimization', analyticsController.performGeneticOptimization);

// Cost Surface Modeling
router.post('/cost-surface', analyticsController.performCostSurfaceModeling);

// Capacity Planning
router.post('/capacity-planning', analyticsController.performCapacityPlanning);

// Analytics Data Management
router.get('/data', analyticsController.getAnalyticsData);
router.post('/data', analyticsController.createAnalyticsData);

// Optimization Scenarios
router.get('/scenarios', analyticsController.getOptimizationScenarios);
router.post('/scenarios', analyticsController.createOptimizationScenario);
router.get('/scenarios/:id', analyticsController.getOptimizationScenario);
router.get('/scenarios/:id/history', analyticsController.getScenarioHistory);
router.put('/scenarios/:id', analyticsController.updateOptimizationScenario);
router.delete('/scenarios/:id', analyticsController.deleteOptimizationScenario);

// Analytics Summary
router.get('/summary', analyticsController.getAnalyticsSummary);

module.exports = router;
