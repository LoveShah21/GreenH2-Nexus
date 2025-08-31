"use client";

import React, { useState, useCallback, useEffect } from "react";
import { MapPin, Search, Loader2, Check, AlertCircle } from "lucide-react";
import { geocodingApi, GeocodeResult } from "@/lib/api/geocoding";
import { Button } from "./Button";

interface AddressInputProps {
  value: string;
  onChange: (address: string) => void;
  onCoordinatesChange: (coordinates: { lat: number; lng: number }) => void;
  onAddressComponentsChange?: (components: any) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  label?: string;
}

export default function AddressInput({
  value,
  onChange,
  onCoordinatesChange,
  onAddressComponentsChange,
  placeholder = "Enter address (e.g., 123 Main St, City, Country)",
  disabled = false,
  required = false,
  error,
  label = "Address",
}: AddressInputProps) {
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geocodeResult, setGeocodeResult] = useState<GeocodeResult | null>(
    null
  );
  const [geocodeError, setGeocodeError] = useState<string | null>(null);
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [lastGeocodedValue, setLastGeocodedValue] = useState<string>("");
  const [lastGeocodeTime, setLastGeocodeTime] = useState<number>(0);

  const handleGeocode = useCallback(
    async (addressToGeocode: string) => {
      if (!addressToGeocode.trim() || addressToGeocode.length < 3) {
        setGeocodeError("Please enter at least 3 characters");
        return;
      }

      const now = Date.now();

      // Prevent duplicate geocoding requests and rate limiting (min 2 seconds between requests)
      if (
        addressToGeocode === lastGeocodedValue ||
        isGeocoding ||
        now - lastGeocodeTime < 2000
      ) {
        return;
      }

      setIsGeocoding(true);
      setGeocodeError(null);
      setGeocodeResult(null);
      setLastGeocodedValue(addressToGeocode);
      setLastGeocodeTime(now);

      try {
        const result = await geocodingApi.geocodeAddress(addressToGeocode);
        setGeocodeResult(result);
        setShowSuggestion(true);
        setGeocodeError(null);
      } catch (error: any) {
        setGeocodeError(error.message || "Failed to find location");
        setGeocodeResult(null);
      } finally {
        setIsGeocoding(false);
      }
    },
    [lastGeocodedValue, isGeocoding, lastGeocodeTime]
  );

  const handleAcceptSuggestion = () => {
    if (geocodeResult) {
      onChange(geocodeResult.formattedAddress);
      onCoordinatesChange(geocodeResult.coordinates);

      if (onAddressComponentsChange) {
        onAddressComponentsChange(geocodeResult.addressComponents);
      }

      setShowSuggestion(false);
    }
  };

  const handleRejectSuggestion = () => {
    setShowSuggestion(false);
    setGeocodeResult(null);
  };

  // Removed auto-geocoding useEffect to prevent infinite loops
  // Users must manually click the search button to geocode

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div className="relative">
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            className={`w-full pl-10 pr-12 py-2 border rounded-lg transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
              error || geocodeError
                ? "border-red-500"
                : "border-gray-300 dark:border-gray-600"
            }`}
          />

          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {isGeocoding ? (
              <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
            ) : (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleGeocode(value)}
                disabled={disabled || !value.trim() || value.length < 3}
                className="p-1 h-6 w-6"
              >
                <Search className="w-3 h-3" />
              </Button>
            )}
          </div>
        </div>

        {/* Geocoding suggestion */}
        {showSuggestion && geocodeResult && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 p-3">
            <div className="flex items-start space-x-2">
              <MapPin className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {geocodeResult.formattedAddress}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Coordinates: {geocodeResult.coordinates.lat.toFixed(6)},{" "}
                  {geocodeResult.coordinates.lng.toFixed(6)}
                </p>
              </div>
            </div>

            <div className="flex space-x-2 mt-3">
              <Button
                type="button"
                size="sm"
                onClick={handleAcceptSuggestion}
                className="flex-1"
              >
                <Check className="w-3 h-3 mr-1" />
                Use This Location
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRejectSuggestion}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Error messages */}
      {(error || geocodeError) && (
        <div className="flex items-center space-x-1 text-sm text-red-600 dark:text-red-400">
          <AlertCircle className="w-4 h-4" />
          <span>{error || geocodeError}</span>
        </div>
      )}

      {/* Coordinates display */}
      {geocodeResult && !showSuggestion && (
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Coordinates: {geocodeResult.coordinates.lat.toFixed(6)},{" "}
          {geocodeResult.coordinates.lng.toFixed(6)}
        </div>
      )}
    </div>
  );
}
