// Using built-in fetch (Node.js 18+)

const API_BASE = 'http://localhost:5000/api';

async function testGeocodingAPI() {
    try {
        console.log('Testing Geocoding API...\n');

        // Test geocoding endpoint
        console.log('1. Testing address geocoding...');
        const geocodeResponse = await fetch(`${API_BASE}/geocoding/geocode`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                address: 'Hamburg, Germany'
            })
        });

        const geocodeResult = await geocodeResponse.json();

        if (geocodeResponse.ok) {
            console.log('Geocoding successful:', geocodeResult);
        } else {
            console.log('Geocoding failed:', geocodeResult);
        }

        // Test reverse geocoding
        console.log('\n2. Testing reverse geocoding...');
        const reverseResponse = await fetch(`${API_BASE}/geocoding/reverse?lat=53.5511&lng=9.9937`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        const reverseResult = await reverseResponse.json();

        if (reverseResponse.ok) {
            console.log('Reverse geocoding successful:', reverseResult);
        } else {
            console.log('Reverse geocoding failed:', reverseResult);
        }

    } catch (error) {
        console.error('Test failed:', error);
    }
}

testGeocodingAPI();