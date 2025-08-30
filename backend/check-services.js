#!/usr/bin/env node

/**
 * Simple Service Checker
 * Checks if all required services are running
 */

// Import fetch for Node.js compatibility
let fetch;
try {
    fetch = require('node-fetch');
} catch (error) {
    if (typeof globalThis.fetch !== 'undefined') {
        fetch = globalThis.fetch;
    } else {
        console.error('❌ fetch is not available. Please install node-fetch: npm install node-fetch@2');
        process.exit(1);
    }
}

const services = [
    { name: 'Backend', url: 'http://localhost:5000/health', required: true },
    { name: 'ML Service', url: 'http://localhost:8000/health', required: true },
    { name: 'Frontend', url: 'http://localhost:3000', required: false }
];

const checkService = async (service) => {
    try {
        console.log(`Checking ${service.name} at ${service.url}...`);

        const response = await fetch(service.url, {
            method: 'GET',
            timeout: 5000
        });

        if (response.ok) {
            console.log(`✅ ${service.name} is running`);
            return true;
        } else {
            console.log(`❌ ${service.name} returned HTTP ${response.status}`);
            return false;
        }
    } catch (error) {
        console.log(`❌ ${service.name} is not accessible: ${error.message}`);
        return false;
    }
};

const checkAllServices = async () => {
    console.log('🔍 Checking service status...\n');

    let allRunning = true;
    let requiredRunning = true;

    for (const service of services) {
        const isRunning = await checkService(service);

        if (!isRunning) {
            allRunning = false;
            if (service.required) {
                requiredRunning = false;
            }
        }

        console.log(''); // Empty line for readability
    }

    console.log('📊 Summary:');
    console.log('='.repeat(30));

    if (allRunning) {
        console.log('🎉 All services are running!');
    } else if (requiredRunning) {
        console.log('✅ Required services are running');
        console.log('⚠️  Some optional services are not running');
    } else {
        console.log('❌ Some required services are not running');
        console.log('\n💡 To start services:');
        console.log('   Backend: cd backend && npm run dev');
        console.log('   ML Service: cd project && python main.py');
        console.log('   Frontend: cd frontend && npm run dev');
    }

    return requiredRunning;
};

// Run the check
checkAllServices().then(success => {
    process.exit(success ? 0 : 1);
}).catch(error => {
    console.error('Error checking services:', error);
    process.exit(1);
});