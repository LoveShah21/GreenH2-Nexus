const axios = require('axios');
const { logger } = require('../utils/logger');

class GeocodingService {
    constructor() {
        // Using OpenStreetMap Nominatim API (free, no API key required)
        this.baseURL = 'https://nominatim.openstreetmap.org';
        this.userAgent = 'GreenH2-Nexus/1.0';
    }

    /**
     * Geocode an address to coordinates
     * @param {string} address - The address to geocode
     * @returns {Promise<{lat: number, lng: number, formattedAddress: string}>}
     */
    async geocodeAddress(address) {
        try {
            if (!address || typeof address !== 'string') {
                throw new Error('Valid address string is required');
            }

            const response = await axios.get(`${this.baseURL}/search`, {
                params: {
                    q: address,
                    format: 'json',
                    limit: 1,
                    addressdetails: 1
                },
                headers: {
                    'User-Agent': this.userAgent
                },
                timeout: 10000 // 10 second timeout
            });

            if (!response.data || response.data.length === 0) {
                throw new Error('No results found for the provided address');
            }

            const result = response.data[0];

            return {
                lat: parseFloat(result.lat),
                lng: parseFloat(result.lon),
                formattedAddress: result.display_name,
                address: result.address || {},
                boundingBox: result.boundingbox ? {
                    south: parseFloat(result.boundingbox[0]),
                    north: parseFloat(result.boundingbox[1]),
                    west: parseFloat(result.boundingbox[2]),
                    east: parseFloat(result.boundingbox[3])
                } : null
            };

        } catch (error) {
            logger.error('Geocoding failed:', error);

            if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
                throw new Error('Geocoding service is currently unavailable');
            }

            if (error.response && error.response.status === 429) {
                throw new Error('Geocoding rate limit exceeded. Please try again later.');
            }

            throw new Error(error.message || 'Failed to geocode address');
        }
    }

    /**
     * Reverse geocode coordinates to address
     * @param {number} lat - Latitude
     * @param {number} lng - Longitude
     * @returns {Promise<{address: string, components: object}>}
     */
    async reverseGeocode(lat, lng) {
        try {
            if (typeof lat !== 'number' || typeof lng !== 'number') {
                throw new Error('Valid latitude and longitude numbers are required');
            }

            if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
                throw new Error('Invalid coordinates provided');
            }

            const response = await axios.get(`${this.baseURL}/reverse`, {
                params: {
                    lat: lat,
                    lon: lng,
                    format: 'json',
                    addressdetails: 1
                },
                headers: {
                    'User-Agent': this.userAgent
                },
                timeout: 10000
            });

            if (!response.data) {
                throw new Error('No address found for the provided coordinates');
            }

            const result = response.data;

            return {
                address: result.display_name,
                components: result.address || {},
                type: result.type,
                importance: result.importance
            };

        } catch (error) {
            logger.error('Reverse geocoding failed:', error);

            if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
                throw new Error('Geocoding service is currently unavailable');
            }

            throw new Error(error.message || 'Failed to reverse geocode coordinates');
        }
    }

    /**
     * Validate and normalize address components
     * @param {object} addressComponents - Address components from geocoding
     * @returns {object} Normalized address components
     */
    normalizeAddressComponents(addressComponents) {
        return {
            address: addressComponents.house_number && addressComponents.road
                ? `${addressComponents.house_number} ${addressComponents.road}`
                : addressComponents.road || '',
            city: addressComponents.city ||
                addressComponents.town ||
                addressComponents.village ||
                addressComponents.municipality || '',
            region: addressComponents.state ||
                addressComponents.province ||
                addressComponents.region || '',
            country: addressComponents.country || '',
            postalCode: addressComponents.postcode || ''
        };
    }

    /**
     * Batch geocode multiple addresses
     * @param {string[]} addresses - Array of addresses to geocode
     * @returns {Promise<Array>} Array of geocoding results
     */
    async batchGeocode(addresses) {
        if (!Array.isArray(addresses)) {
            throw new Error('Addresses must be an array');
        }

        const results = [];

        // Process addresses with delay to respect rate limits
        for (let i = 0; i < addresses.length; i++) {
            try {
                const result = await this.geocodeAddress(addresses[i]);
                results.push({ success: true, data: result, originalAddress: addresses[i] });

                // Add delay between requests to respect rate limits (1 request per second)
                if (i < addresses.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            } catch (error) {
                results.push({
                    success: false,
                    error: error.message,
                    originalAddress: addresses[i]
                });
            }
        }

        return results;
    }
}

module.exports = new GeocodingService();