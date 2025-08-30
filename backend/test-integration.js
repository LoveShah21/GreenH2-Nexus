#!/usr/bin/env node

/**
 * Integration Test Script
 * Tests all API endpoints and ML model integration
 */

// Import fetch for Node.js compatibility
let fetch;
try {
    // Try to use node-fetch for older Node.js versions
    fetch = require('node-fetch');
} catch (error) {
    // Fallback for newer Node.js versions with built-in fetch
    if (typeof globalThis.fetch !== 'undefined') {
        fetch = globalThis.fetch;
    } else {
        console.error('❌ fetch is not available. Please install node-fetch: npm install node-fetch@2');
        process.exit(1);
    }
}

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000/api';
const ML_API_URL = process.env.ML_API_URL || 'http://localhost:8000';

let authToken = null;

// Test utilities
const log = (message, type = 'info') => {
    const colors = {
        info: '\x1b[36m',
        success: '\x1b[32m',
        error: '\x1b[31m',
        warning: '\x1b[33m'
    };
    console.log(`${colors[type]}[${type.toUpperCase()}]\x1b[0m ${message}`);
};

const apiCall = async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    if (authToken) {
        headers.Authorization = `Bearer ${authToken}`;
    }

    try {
        const response = await fetch(url, {
            ...options,
            headers
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${data.error || 'Unknown error'}`);
        }

        return data;
    } catch (error) {
        throw new Error(`API call failed: ${error.message}`);
    }
};

const mlCall = async (endpoint, options = {}) => {
    const url = `${ML_API_URL}${endpoint}`;

    try {
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json'
            },
            ...options
        });

        if (!response.ok) {
            throw new Error(`ML API HTTP ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        throw new Error(`ML API call failed: ${error.message}`);
    }
};

// Connectivity test
const testConnectivity = async () => {
    log('Testing basic connectivity...');

    // Test if services are reachable
    const services = [
        { name: 'Backend', url: API_BASE_URL.replace('/api', '') },
        { name: 'ML Service', url: ML_API_URL }
    ];

    for (const service of services) {
        try {
            const response = await fetch(service.url, {
                method: 'GET',
                timeout: 5000
            });
            log(`✓ ${service.name} is reachable at ${service.url}`, 'success');
        } catch (error) {
            log(`✗ ${service.name} is not reachable at ${service.url}: ${error.message}`, 'error');
            return false;
        }
    }

    return true;
};

// Test functions
const testHealthCheck = async () => {
    log('Testing health check endpoint...');
    try {
        const healthUrl = `${API_BASE_URL.replace('/api', '')}/health`;
        log(`Checking: ${healthUrl}`);

        const response = await fetch(healthUrl, {
            method: 'GET',
            timeout: 10000
        });

        if (!response.ok) {
            log(`✗ Backend health check failed: HTTP ${response.status}`, 'error');
            return false;
        }

        const data = await response.json();

        if (data.success) {
            log('✓ Backend health check passed', 'success');
            return true;
        } else {
            log('✗ Backend health check failed - success: false', 'error');
            return false;
        }
    } catch (error) {
        log(`✗ Backend health check failed: ${error.message}`, 'error');
        log('Make sure the backend server is running on http://localhost:5000', 'warning');
        return false;
    }
};

const testMLHealth = async () => {
    log('Testing ML service health...');
    try {
        const healthUrl = `${ML_API_URL}/health`;
        log(`Checking: ${healthUrl}`);

        const data = await mlCall('/health');

        if (data.status === 'healthy') {
            log('✓ ML service health check passed', 'success');
            return true;
        } else {
            log(`✗ ML service health check failed - status: ${data.status}`, 'error');
            return false;
        }
    } catch (error) {
        log(`✗ ML service health check failed: ${error.message}`, 'error');
        log('Make sure the ML service is running on http://localhost:8000', 'warning');
        return false;
    }
};

const testAuthentication = async () => {
    log('Testing authentication...');
    try {
        // Test registration (might fail if user exists, that's ok)
        try {
            await apiCall('/auth/register', {
                method: 'POST',
                body: JSON.stringify({
                    firstName: 'Test',
                    lastName: 'User',
                    email: 'test@example.com',
                    password: 'testpassword123',
                    organization: 'Test Organization',
                    role: 'analyst'
                })
            });
            log('✓ User registration successful', 'success');
        } catch (error) {
            log('User might already exist, continuing...', 'warning');
        }

        // Test login
        const loginResponse = await apiCall('/auth/login', {
            method: 'POST',
            body: JSON.stringify({
                email: 'test@example.com',
                password: 'testpassword123'
            })
        });

        if (loginResponse.data && loginResponse.data.tokens && loginResponse.data.tokens.accessToken) {
            authToken = loginResponse.data.tokens.accessToken;
            log('✓ Authentication successful', 'success');
            return true;
        } else {
            log('✗ Authentication failed - no token received', 'error');
            return false;
        }
    } catch (error) {
        log(`✗ Authentication failed: ${error.message}`, 'error');
        return false;
    }
};

const testMLPrediction = async () => {
    log('Testing ML zone prediction...');
    try {
        // Test single prediction
        const prediction = await apiCall('/ml-predictions/predict-zone?lat=51.505&lng=-0.09');

        if (prediction.success && prediction.data) {
            const { lat, lng, efficiency, cost, zone } = prediction.data;

            if (lat && lng && efficiency !== undefined && cost !== undefined && zone) {
                log(`✓ ML prediction successful: Zone=${zone}, Efficiency=${(efficiency * 100).toFixed(1)}%, Cost=$${cost}/kg`, 'success');
                return true;
            } else {
                log('✗ ML prediction returned incomplete data', 'error');
                return false;
            }
        } else {
            log('✗ ML prediction failed', 'error');
            return false;
        }
    } catch (error) {
        log(`✗ ML prediction failed: ${error.message}`, 'error');
        return false;
    }
};

const testBatchPrediction = async () => {
    log('Testing ML batch prediction...');
    try {
        const locations = [
            { lat: 51.505, lng: -0.09 },
            { lat: 51.515, lng: -0.1 },
            { lat: 51.495, lng: -0.08 }
        ];

        const batchResponse = await apiCall('/ml-predictions/predict-zones/batch', {
            method: 'POST',
            body: JSON.stringify({ locations })
        });

        if (batchResponse.success && batchResponse.data && batchResponse.data.predictions) {
            const predictions = batchResponse.data.predictions;

            if (predictions.length === locations.length) {
                log(`✓ Batch prediction successful: ${predictions.length} predictions returned`, 'success');
                return true;
            } else {
                log(`✗ Batch prediction returned wrong number of results: expected ${locations.length}, got ${predictions.length}`, 'error');
                return false;
            }
        } else {
            log('✗ Batch prediction failed', 'error');
            return false;
        }
    } catch (error) {
        log(`✗ Batch prediction failed: ${error.message}`, 'error');
        return false;
    }
};

const testAreaAnalysis = async () => {
    log('Testing area analysis...');
    try {
        const analysisRequest = {
            bounds: {
                north: 51.52,
                south: 51.48,
                east: -0.05,
                west: -0.15
            },
            gridSize: 5
        };

        const analysisResponse = await apiCall('/ml-predictions/analyze-area', {
            method: 'POST',
            body: JSON.stringify(analysisRequest)
        });

        if (analysisResponse.success && analysisResponse.data) {
            const { totalPoints, zoneDistribution, averageEfficiency, averageCost } = analysisResponse.data;

            if (totalPoints > 0 && zoneDistribution && averageEfficiency !== undefined && averageCost !== undefined) {
                log(`✓ Area analysis successful: ${totalPoints} points, ${zoneDistribution.green} green zones`, 'success');
                return true;
            } else {
                log('✗ Area analysis returned incomplete data', 'error');
                return false;
            }
        } else {
            log('✗ Area analysis failed', 'error');
            return false;
        }
    } catch (error) {
        log(`✗ Area analysis failed: ${error.message}`, 'error');
        return false;
    }
};

const testProjectsAPI = async () => {
    log('Testing projects API...');
    try {
        // Test getting projects
        const projectsResponse = await apiCall('/projects?limit=10');

        if (projectsResponse.data && Array.isArray(projectsResponse.data)) {
            log(`✓ Projects API successful: ${projectsResponse.data.length} projects retrieved`, 'success');
            return true;
        } else {
            log('✗ Projects API failed - invalid response format', 'error');
            return false;
        }
    } catch (error) {
        log(`✗ Projects API failed: ${error.message}`, 'error');
        return false;
    }
};

const testInfrastructureAPI = async () => {
    log('Testing infrastructure API...');
    try {
        // Test getting infrastructure
        const infraResponse = await apiCall('/infrastructure?limit=10');

        if (infraResponse.success !== false) {
            log('✓ Infrastructure API accessible', 'success');
            return true;
        } else {
            log('✗ Infrastructure API failed', 'error');
            return false;
        }
    } catch (error) {
        log(`✗ Infrastructure API failed: ${error.message}`, 'error');
        return false;
    }
};

const testAnalyticsAPI = async () => {
    log('Testing analytics API...');
    try {
        // First, try to get projects to use a valid project ID
        let projectId = 'test-project-id';

        try {
            const projectsResponse = await apiCall('/projects?limit=1');
            if (projectsResponse.data && projectsResponse.data.length > 0) {
                projectId = projectsResponse.data[0]._id || projectsResponse.data[0].id;
            }
        } catch (error) {
            // If no projects exist, use a test project ID
            log('No existing projects found, using test project ID', 'warning');
        }

        // Test analytics summary with project ID
        const analyticsResponse = await apiCall(`/analytics/summary?projectId=${projectId}`);

        if (analyticsResponse.success !== false) {
            log('✓ Analytics API accessible', 'success');
            return true;
        } else {
            log('✗ Analytics API failed', 'error');
            return false;
        }
    } catch (error) {
        // If the error is about project not found, that's expected for a test project ID
        if (error.message.includes('Project not found') || error.message.includes('No data found')) {
            log('✓ Analytics API accessible (no data for test project)', 'success');
            return true;
        }
        log(`✗ Analytics API failed: ${error.message}`, 'error');
        return false;
    }
};

const testMLHealthEndpoint = async () => {
    log('Testing ML health endpoint through backend...');
    try {
        const healthResponse = await apiCall('/ml-predictions/health');

        if (healthResponse.success && healthResponse.data) {
            const { ml_service_status, cache_size } = healthResponse.data;
            log(`✓ ML health endpoint successful: Status=${ml_service_status}, Cache=${cache_size || 0}`, 'success');
            return true;
        } else {
            log('✗ ML health endpoint failed', 'error');
            return false;
        }
    } catch (error) {
        log(`✗ ML health endpoint failed: ${error.message}`, 'error');
        return false;
    }
};

// Main test runner
const runTests = async () => {
    log('Starting integration tests...', 'info');
    log('='.repeat(50), 'info');

    const tests = [
        { name: 'Connectivity Test', fn: testConnectivity },
        { name: 'Backend Health Check', fn: testHealthCheck },
        { name: 'ML Service Health', fn: testMLHealth },
        { name: 'Authentication', fn: testAuthentication },
        { name: 'ML Zone Prediction', fn: testMLPrediction },
        { name: 'ML Batch Prediction', fn: testBatchPrediction },
        { name: 'Area Analysis', fn: testAreaAnalysis },
        { name: 'Projects API', fn: testProjectsAPI },
        { name: 'Infrastructure API', fn: testInfrastructureAPI },
        { name: 'Analytics API', fn: testAnalyticsAPI },
        { name: 'ML Health Endpoint', fn: testMLHealthEndpoint }
    ];

    let passed = 0;
    let failed = 0;

    for (const test of tests) {
        log(`\nRunning: ${test.name}`, 'info');
        try {
            const result = await test.fn();
            if (result) {
                passed++;
            } else {
                failed++;
            }
        } catch (error) {
            log(`✗ ${test.name} threw an error: ${error.message}`, 'error');
            failed++;
        }
    }

    log('\n' + '='.repeat(50), 'info');
    log(`Test Results: ${passed} passed, ${failed} failed`, passed === tests.length ? 'success' : 'warning');

    if (passed === tests.length) {
        log('🎉 All integration tests passed!', 'success');
        process.exit(0);
    } else {
        log('❌ Some tests failed. Check the logs above.', 'error');
        process.exit(1);
    }
};

// Performance test
const runPerformanceTest = async () => {
    log('Running performance test...', 'info');

    const startTime = Date.now();
    const promises = [];

    // Test concurrent predictions
    for (let i = 0; i < 10; i++) {
        const lat = 51.5 + (Math.random() - 0.5) * 0.1;
        const lng = -0.1 + (Math.random() - 0.5) * 0.1;
        promises.push(apiCall(`/ml-predictions/predict-zone?lat=${lat}&lng=${lng}`));
    }

    try {
        await Promise.all(promises);
        const duration = Date.now() - startTime;
        log(`✓ Performance test completed: 10 concurrent predictions in ${duration}ms`, 'success');
    } catch (error) {
        log(`✗ Performance test failed: ${error.message}`, 'error');
    }
};

// Command line interface
const args = process.argv.slice(2);

if (args.includes('--performance')) {
    runPerformanceTest();
} else if (args.includes('--help')) {
    console.log(`
Integration Test Script

Usage:
  node test-integration.js              Run all integration tests
  node test-integration.js --performance  Run performance tests
  node test-integration.js --help         Show this help

Environment Variables:
  API_BASE_URL    Backend API URL (default: http://localhost:5000/api)
  ML_API_URL      ML service URL (default: http://localhost:8000)
  `);
} else {
    runTests();
}