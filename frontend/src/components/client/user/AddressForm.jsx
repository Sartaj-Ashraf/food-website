"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { APIProvider, Map, Marker, useMapsLibrary, useMap } from '@vis.gl/react-google-maps';
import { CheckCircle, AlertCircle, RefreshCw, X, MapPin, FileText, Edit3 } from "lucide-react";
import toast from "react-hot-toast";
import { customFetch } from "@/utils/customFetch";

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

// Custom Circle Component using native Google Maps API
const ServiceAreaCircles = ({ serviceAreas, selectedAreaIndex }) => {
  const map = useMap();
  const circlesRef = useRef([]);
  const markersRef = useRef([]);

  useEffect(() => {
    if (!map || !window.google || !serviceAreas.length) {
      console.log('⚠️ Map, Google API, or service areas not ready:', { 
        map: !!map, 
        google: !!window.google, 
        serviceAreas: serviceAreas.length 
      });
      return;
    }

    console.log('🔵 Creating service area circles:', serviceAreas);

    // Clear existing circles and markers
    circlesRef.current.forEach(circle => circle.setMap(null));
    markersRef.current.forEach(marker => marker.setMap(null));
    circlesRef.current = [];
    markersRef.current = [];

    // Create new circles and markers
    serviceAreas.forEach((area, index) => {
      if (!area.coordinates || typeof area.coordinates.lat !== 'number' || typeof area.coordinates.lng !== 'number') {
        console.warn(`❌ Invalid coordinates for area ${index}:`, area.coordinates);
        return;
      }

      const radius = (area.deliveryRadius || 5) * 1000; // Convert km to meters
      const isSelected = selectedAreaIndex === index;
      
      console.log(`🔵 Creating circle ${index}:`, {
        center: area.coordinates,
        radius: radius,
        isSelected
      });

      // Create circle - NOT CLICKABLE
      const circle = new window.google.maps.Circle({
        map: map,
        center: {
          lat: area.coordinates.lat,
          lng: area.coordinates.lng
        },
        radius: radius,
        strokeColor: isSelected ? '#EF4444' : '#3B82F6', // Red if selected, blue if not
        strokeOpacity: isSelected ? 1.0 : 0.8,
        strokeWeight: isSelected ? 3 : 2,
        fillColor: isSelected ? '#EF4444' : '#3B82F6',
        fillOpacity: isSelected ? 0.25 : 0.15,
        clickable: false // FIXED: Not clickable
      });

      // Create marker for service area center - NOT CLICKABLE
      const marker = new window.google.maps.Marker({
        map: map,
        position: {
          lat: area.coordinates.lat,
          lng: area.coordinates.lng
        },
        title: area.address || `Service Area ${index + 1}`,
        clickable: false, // FIXED: Not clickable
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          fillColor: isSelected ? '#EF4444' : '#3B82F6',
          fillOpacity: 1,
          strokeColor: '#FFFFFF',
          strokeWeight: 2,
          scale: isSelected ? 10 : 8
        }
      });

      circlesRef.current.push(circle);
      markersRef.current.push(marker);
    });

    // Cleanup function
    return () => {
      circlesRef.current.forEach(circle => circle.setMap(null));
      markersRef.current.forEach(marker => marker.setMap(null));
      circlesRef.current = [];
      markersRef.current = [];
    };
  }, [map, serviceAreas, selectedAreaIndex]);

  return null;
};

// Separate component that uses the geocoding library
const GeocodingService = ({ children, onGeocodingReady }) => {
  const geocodingLibrary = useMapsLibrary('geocoding');
  const [geocoder, setGeocoder] = useState(null);

  useEffect(() => {
    if (geocodingLibrary && !geocoder) {
      const geocoderInstance = new geocodingLibrary.Geocoder();
      setGeocoder(geocoderInstance);
      onGeocodingReady(geocoderInstance);
    }
  }, [geocodingLibrary, geocoder, onGeocodingReady]);

  return <>{children}</>;
};

// Main AddressForm component
const AddressFormContent = ({ address = {}, onSave, onCancel }) => {
  // Form state management
  const [formData, setFormData] = useState({
    location: "",
    // city: "",
    // state: "",
    // postalCode: "",
    // country: "India",
    coordinates: null,
    ...address,
  });

  const [loading, setLoading] = useState(false);
  const [validationStatus, setValidationStatus] = useState({});
  const [activeTab, setActiveTab] = useState("form");
  const [serviceAreas, setServiceAreas] = useState([]);
  const [selectedAreaIndex, setSelectedAreaIndex] = useState(null);
  
  // NEW: Track if form has been modified after coordinates were set
  const [isFormModified, setIsFormModified] = useState(false);
  const [coordinatesUpToDate, setCoordinatesUpToDate] = useState(false);
  
  // Use controlled camera state with proper event handlers
  const [cameraProps, setCameraProps] = useState({
    center: { lat: 28.6139, lng: 77.2090 }, // Delhi default
    zoom: 10
  });

  // Map ref for Google Maps
  const mapRef = useRef(null);
  const geocoderService = useRef(null);

  // Handle geocoder initialization
  const handleGeocodingReady = useCallback((geocoder) => {
    geocoderService.current = geocoder;
    console.log('✅ Geocoding service ready!');
  }, []);

  // Handle service area cycling
  const handleServiceAreaCycle = useCallback(() => {
    if (serviceAreas.length === 0) return;
    
    let nextIndex;
    if (selectedAreaIndex === null || selectedAreaIndex === serviceAreas.length - 1) {
      nextIndex = 0; // Go to first area
    } else {
      nextIndex = selectedAreaIndex + 1; // Go to next area
    }
    
    console.log('🔄 Cycling to service area:', nextIndex);
    setSelectedAreaIndex(nextIndex);
    
    const area = serviceAreas[nextIndex];
    if (area && area.coordinates) {
      // Center map on selected service area
      setCameraProps({
        center: area.coordinates,
        zoom: 12
      });
      
      toast.success(`Showing: ${area.address || `Service Area ${nextIndex + 1}`}`);
    }
  }, [selectedAreaIndex, serviceAreas]);

  // Extract address components from Google response
  const extractAddressComponent = (result, type) => {
    const component = result.address_components.find(
      comp => comp.types.includes(type)
    );
    return component ? component.long_name : '';
  };

  // Forward geocoding with Google Maps
  const forwardGeocode = async (address) => {
    return new Promise((resolve, reject) => {
      if (!geocoderService.current) {
        reject(new Error('Geocoder service not ready. Please wait and try again.'));
        return;
      }

      console.log('🔍 Forward geocoding:', address);
      geocoderService.current.geocode(
        {
          address: address,
          region: 'IN',
          language: 'en'
        },
        (results, status) => {
          console.log('📍 Geocoding result:', { results, status });
          
          if (status === 'OK' && results && results.length > 0) {
            const result = results[0];
            
            const geocodedData = {
              location: result.formatted_address,
              coordinates: {
                lat: parseFloat(result.geometry.location.lat().toFixed(6)),
                lng: parseFloat(result.geometry.location.lng().toFixed(6))
              },
              city: extractAddressComponent(result, 'locality') || 
                    extractAddressComponent(result, 'sublocality_level_1'),
              // state: extractAddressComponent(result, 'administrative_area_level_1'),
              // postalCode: extractAddressComponent(result, 'postal_code'),
              // country: extractAddressComponent(result, 'country') || 'India',
              accuracy: result.geometry.location_type,
              confidence: result.geometry.location_type === 'ROOFTOP' ? 1.0 : 0.8,
              place_id: result.place_id
            };
            
            console.log('✅ Geocoding successful:', geocodedData);
            resolve(geocodedData);
          } else {
            console.error('❌ Geocoding failed:', status);
            reject(new Error(`Geocoding failed: ${status}`));
          }
        }
      );
    });
  };

  // Reverse geocoding with Google Maps
  const reverseGeocode = async (coords) => {
    return new Promise((resolve, reject) => {
      if (!geocoderService.current) {
        console.warn('⚠️ Geocoder service not ready for reverse geocoding');
        reject(new Error('Geocoder service not ready'));
        return;
      }

      console.log('🔄 Reverse geocoding:', coords);
      geocoderService.current.geocode(
        {
          location: { lat: coords.lat, lng: coords.lng },
          language: 'en'
        },
        (results, status) => {
          console.log('📍 Reverse geocoding result:', { results, status });
          
          if (status === 'OK' && results && results.length > 0) {
            const result = results[0];
            
            const city = extractAddressComponent(result, 'locality') || 
                        extractAddressComponent(result, 'sublocality_level_1');
            const state = extractAddressComponent(result, 'administrative_area_level_1');
            const postalCode = extractAddressComponent(result, 'postal_code');
            const country = extractAddressComponent(result, 'country') || 'India';

            setFormData((prev) => ({
              ...prev,
              location: result.formatted_address,
              city,
              state,
              country,
              postalCode,
              coordinates: coords,
            }));

            setValidationStatus((prev) => ({
              ...prev,
              delivery: "available",
              pincode: postalCode && postalCode.length === 6 ? "valid" : "invalid",
              accuracy: result.geometry.location_type
            }));

            // UPDATED: Mark coordinates as up-to-date and form as not modified
            setCoordinatesUpToDate(true);
            setIsFormModified(false);

            // FIXED: Navigate to address details tab on mobile after pinning location
            if (window.innerWidth < 1024) {
              setTimeout(() => setActiveTab("form"), 500);
            }
            
            console.log('✅ Reverse geocoding successful');
            resolve();
          } else {
            console.error('❌ Reverse geocoding failed:', status);
            reject(new Error(`Reverse geocoding failed: ${status}`));
          }
        }
      );
    });
  };

  // API Functions - FIXED: Service areas fetch
  const fetchServiceAreas = async () => {
    try {
      const res = await customFetch.get("/serviceAreas/all");
      const areas = res.data || [];
      console.log('📍 Service areas loaded:', areas);
      
      // Transform the areas to ensure proper coordinate structure
      const transformedAreas = areas.map(area => ({
        ...area,
        coordinates: {
          lat: area.location?.coordinates?.[1] || 0, // latitude is at index 1 in GeoJSON
          lng: area.location?.coordinates?.[0] || 0  // longitude is at index 0 in GeoJSON
        },
        color: "#3B82F6" // Blue color for all service areas
      }));
      
      console.log('📍 Transformed service areas:', transformedAreas);
      setServiceAreas(transformedAreas);
    } catch (error) {
      console.error('❌ Failed to fetch service areas:', error);
      // Mock data for testing
      setServiceAreas([
        {
          _id: "mock1",
          address: "Central Delhi",
          coordinates: { lat: 28.6139, lng: 77.2090 },
          deliveryRadius: 15,
          color: "#3B82F6"
        },
        {
          _id: "mock2", 
          address: "Gurgaon",
          coordinates: { lat: 28.4595, lng: 77.0266 },
          deliveryRadius: 12,
          color: "#3B82F6"
        },
        {
          _id: "mock3",
          address: "Noida",
          coordinates: { lat: 28.5355, lng: 77.3910 },
          deliveryRadius: 10,
          color: "#3B82F6"
        }
      ]);
    }
  };

  // Location handlers
  const fetchCurrentLocation = () => {
    const defaultCoords = { lat: 28.6139, lng: 77.2090 }; // Delhi
    
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = { 
            lat: pos.coords.latitude, 
            lng: pos.coords.longitude 
          };
          setFormData((prev) => ({ ...prev, coordinates: coords }));
          setCameraProps({ center: coords, zoom: 15 });
          reverseGeocode(coords).catch(error => {
            console.error('Reverse geocoding failed:', error);
            toast.error('Unable to get address for current location');
          });
        },
        (error) => {
          console.error('Geolocation failed:', error);
          setFormData((prev) => ({ ...prev, coordinates: defaultCoords }));
          setCameraProps({ center: defaultCoords, zoom: 10 });
          reverseGeocode(defaultCoords).catch(error => {
            console.error('Default location reverse geocoding failed:', error);
          });
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setFormData((prev) => ({ ...prev, coordinates: defaultCoords }));
      setCameraProps({ center: defaultCoords, zoom: 10 });
      reverseGeocode(defaultCoords).catch(error => {
        console.error('Default location reverse geocoding failed:', error);
      });
    }
  };

  // UPDATED: Manual input handlers with modification tracking
  const handleManualInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    
    // NEW: Mark form as modified when user changes input
    if (coordinatesUpToDate) {
      setIsFormModified(true);
      setCoordinatesUpToDate(false);
      console.log('🔄 Form modified - coordinates need to be refreshed');
    }
  };

  const handleGeocodeManualInput = async () => {
    const location = formData.location?.trim() || '';
    // const city = formData.city?.trim() || '';
    // const state = formData.state?.trim() || '';
    // const postalCode = formData.postalCode?.trim() || '';
    // const country = formData.country?.trim() || 'India';
    
    if (!location && !city) {
      toast.error("Please enter at least a location or city");
      return;
    }
    
    if (!geocoderService.current) {
      toast.error("Geocoding service is not ready. Please wait a moment and try again.");
      return;
    }
    
    // const addressParts = [location, city, state, postalCode, country]
    //   .filter(part => part && part.length > 0);

    let fullAddress="";
    if(location && location.length>0)
     fullAddress+= location;
    
    console.log('🔍 Manual geocoding address:', fullAddress);
    setLoading(true);
    
    try {
      const result = await forwardGeocode(fullAddress);
      
      if (result) {
        setFormData(result);
        setValidationStatus((prev) => ({
          ...prev,
          delivery: "available",
          pincode: result.postalCode && result.postalCode.length === 6 ? "valid" : "invalid",
          accuracy: result.accuracy
        }));
        
        // Update map center
        setCameraProps({ center: result.coordinates, zoom: 16 });
        
        // NEW: Mark coordinates as up-to-date and form as not modified
        setCoordinatesUpToDate(true);
        setIsFormModified(false);
        
        toast.success(`Address found with ${result.accuracy.toLowerCase().replace('_', ' ')} accuracy!`);
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      toast.error("Failed to find coordinates. Please check your address and try again.");
    } finally {
      setLoading(false);
    }
  };

  // ENHANCED: Submit handler with coordinate validation and modification check
  const handleSubmit = async () => {
    // Check if all required fields are filled
    if (!formData.location ) {
      toast.error("Please fill in all required fields.");
      return;
    }

    // Check PIN code validation
    // if (validationStatus.pincode === "invalid") {
    //   toast.error("Please enter a valid 6-digit PIN code");
    //   return;
    // }

    // Check if coordinates exist

    if (!formData.coordinates) {
      toast.error("Please get coordinates for your address by clicking 'Find Coordinates' button before saving.");
      return;
    }

    // NEW: Check if form has been modified after coordinates were set
    if (isFormModified || !coordinatesUpToDate) {
      toast.error("Address details have been modified. Please click 'Find Coordinates' to update coordinates before saving.");
      return;
    }

    setLoading(true);
    try {
      await onSave(formData);
    } finally {
      setLoading(false);
    }
  };

  // Camera change handler for controlled map
  const handleCameraChanged = useCallback((ev) => {
    console.log('🎥 Camera changed:', ev.detail);
    setCameraProps(ev.detail);
  }, []);

  // Map click handler with proper event structure
  const handleMapClick = useCallback(async (event) => {
    console.log('🗺️ Map clicked:', event);
    
    // For @vis.gl/react-google-maps, coordinates are in event.detail.latLng
    const clickedLocation = event.detail?.latLng;
    
    if (!clickedLocation) {
      console.error('❌ Could not extract coordinates from click event');
      return;
    }
    
    const coords = {
      lat: clickedLocation.lat,
      lng: clickedLocation.lng
    };
    
    console.log('📍 Extracted coordinates:', coords);
    
    setFormData((prev) => ({ ...prev, coordinates: coords }));
    
    try {
      await reverseGeocode(coords);
      toast.success('Address found for selected location!');
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
      toast.error('Unable to get address for selected location');
    }
  }, []);

  // Drag end handler for marker
  const handleMarkerDragEnd = useCallback(async (event) => {
    console.log('🚚 Marker dragged:', event);
    
    const coords = {
      lat: event.latLng.lat(),
      lng: event.latLng.lng()
    };
    
    console.log('📍 Marker coordinates:', coords);
    
    setFormData(prev => ({ ...prev, coordinates: coords }));
    
    try {
      await reverseGeocode(coords);
      toast.success('Address updated for new marker position!');
    } catch (error) {
      console.error('Marker drag reverse geocoding failed:', error);
      toast.error('Unable to get address for marker position');
    }
  }, []);

  // Utility functions
  const getStatusIcon = (status) =>
    status === "valid" || status === "available" ? (
      <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 inline ml-1" />
    ) : status === "invalid" || status === "unavailable" ? (
      <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 text-red-500 inline ml-1" />
    ) : null;

  // Effects
  useEffect(() => {
    fetchServiceAreas();
  }, []);

  useEffect(() => {
    if (!formData.coordinates && geocoderService.current) {
      // Delay initial location fetch to ensure geocoder is ready
      setTimeout(() => {
        fetchCurrentLocation();
      }, 500);
    }
  }, [geocoderService.current]);

  // NEW: Set initial state if editing existing address with coordinates
  useEffect(() => {
    if (address && address.coordinates) {
      setCoordinatesUpToDate(true);
      setIsFormModified(false);
    }
  }, [address]);

  // Component rendering functions
  const renderFormFields = () => (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Full Address <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData.location || ''}
          onChange={(e) => handleManualInputChange('location', e.target.value)}
          placeholder="Enter full address (e.g., 123 Main Street, Apartment 4B)"
          rows={2}
          className="w-full p-2.5 border border-gray-300 rounded-md text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            City <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.city || ''}
            onChange={(e) => handleManualInputChange('city', e.target.value)}
            placeholder="Enter city"
            className="w-full p-2.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            State <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.state || ''}
            onChange={(e) => handleManualInputChange('state', e.target.value)}
            placeholder="Enter state"
            className="w-full p-2.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div> */}

      {/* <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            PIN Code <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={formData.postalCode || ''}
              onChange={(e) => handleManualInputChange('postalCode', e.target.value)}
              placeholder="Enter 6-digit PIN code"
              maxLength={6}
              className={`w-full p-2.5 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                validationStatus.pincode === "invalid" 
                  ? "border-red-400" 
                  : "border-gray-300"
              }`}
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
              {getStatusIcon(validationStatus.pincode)}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Country <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.country || 'India'}
            onChange={(e) => handleManualInputChange('country', e.target.value)}
            className="w-full p-2.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div> */}

      {/* Geocode Button - Always visible with coordinate status */}
      <div className="space-y-2">
        {isFormModified?<button
          onClick={handleGeocodeManualInput}
          disabled={loading || !geocoderService.current}
          type="button"
          className="w-full px-4 py-2 bg-[var(--primary-color)]/90 text-white rounded-md hover:bg-[var(--primary-color)] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-medium flex items-center justify-center gap-1.5 text-sm"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white" />
              <span>Finding Location...</span>
            </>
          ) : !geocoderService.current ? (
            <span>Loading Geocoder...</span>
          ) : (
            <>
              <MapPin className="w-4 h-4" />
              <span>Find Coordinates</span>
            </>
          )}
        </button>:
          <button onClick={handleSubmit} disabled={isSaveDisabled} type="button"
          className="w-full px-4 py-2 bg-[var(--primary-color)]/90 text-white rounded-md hover:bg-[var(--primary-color)] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-medium flex items-center justify-center gap-1.5 text-sm">
             {address && Object.keys(address).length > 0 ? "Edit Address" : "Add New Address"}
          </button>}
        
        {/* ENHANCED: Coordinate Status Indicator with modification warning */}
        <div className={`p-2 rounded-md text-xs text-center ${
          coordinatesUpToDate && !isFormModified
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : isFormModified 
            ? 'bg-orange-50 text-orange-800 border border-orange-200'
            : 'bg-yellow-50 text-yellow-800 border border-yellow-200'
        }`}>
          {coordinatesUpToDate && !isFormModified ? (
            <div className="flex items-center justify-center gap-1">
              <CheckCircle className="w-3 h-3" />
              <span>Coordinates up-to-date - Ready to save</span>
            </div>
          ) : isFormModified ? (
            <div className="flex items-center justify-center gap-1">
              <AlertCircle className="w-3 h-3" />
              <span>Address modified - Click 'Find Coordinates' to update</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-1">
              <AlertCircle className="w-3 h-3" />
              <span>Coordinates required before saving</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // MOVED: Service areas info card for desktop only
  const renderDesktopInfoCards = () => (
    <>
      {/* SIMPLIFIED: One-liner Service Areas with cycling - DESKTOP ONLY */}
      <div 
        onClick={handleServiceAreaCycle}
        className="bg-green-50 border border-green-200 rounded-lg p-3 cursor-pointer hover:bg-green-100 transition-colors duration-200"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="text-green-500 text-sm font-medium">
              {serviceAreas.length > 0 
                ? `${serviceAreas.length} Service Areas - Click to View`
                : "Loading service areas..."
              }
            </span>
          </div>
          {selectedAreaIndex !== null && (
            <div className="flex items-center gap-1">
              <div 
                className="w-3 h-3 rounded-full border-2" 
                style={{ 
                  backgroundColor: '#EF4444',
                  borderColor: '#FFFFFF'
                }}
              ></div>
              <span className="text-red-800 text-xs font-medium">
                {serviceAreas[selectedAreaIndex]?.address || `Area ${selectedAreaIndex + 1}`}
              </span>
            </div>
          )}
        </div>
      </div>
    </>
  );

  // NEW: Service areas info card for mobile map tab
  const renderMobileMapServiceAreas = () => (
    <div 
      onClick={handleServiceAreaCycle}
      className="bg-green-50 border border-green-200 rounded-lg p-3 cursor-pointer hover:bg-green-100 transition-colors duration-200 mb-3"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-600" />
          <span className="text-green-800 text-sm font-medium">
            {serviceAreas.length > 0 
              ? `${serviceAreas.length} Service Areas - Click to View`
              : "Loading service areas..."
            }
          </span>
        </div>
        {selectedAreaIndex !== null && (
          <div className="flex items-center gap-1">
            <div 
              className="w-3 h-3 rounded-full border-2" 
              style={{ 
                backgroundColor: '#EF4444',
                borderColor: '#FFFFFF'
              }}
            ></div>
            <span className="text-red-800 text-xs font-medium">
              {serviceAreas[selectedAreaIndex]?.address || `Area ${selectedAreaIndex + 1}`}
            </span>
          </div>
        )}
      </div>
    </div>
  );

  // NEW: Check if save should be disabled
  const isSaveDisabled = loading || 
                        !formData.location || 
                        !formData.coordinates ||
                        isFormModified || 
                        !coordinatesUpToDate;

  return (
    <GeocodingService onGeocodingReady={handleGeocodingReady}>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-1 sm:p-3 z-50">
        <div className="bg-white rounded-lg w-full max-w-6xl h-[98vh] sm:max-h-[95vh] overflow-hidden flex flex-col relative shadow-2xl">
          
          {/* Header */}
          <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
              {address ? "Edit Address" : "Add New Address"}
            </h2>
            <button
              aria-label="Close address form"
              onClick={onCancel}
              className="p-1.5 rounded-full hover:bg-gray-200 transition-colors duration-200"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* Mobile Tabs */}
          <div className="lg:hidden border-b border-gray-200 bg-white">
            <div className="flex">
              <button
                onClick={() => setActiveTab("form")}
                className={`flex-1 px-4 py-3 text-sm font-medium text-center border-b-2 transition-colors duration-200 ${
                  activeTab === "form"
                    ? "border-blue-500 text-blue-600 bg-blue-50"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center justify-center gap-1.5">
                  <FileText className="w-4 h-4" />
                  <span>Address Details</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab("map")}
                className={`flex-1 px-4 py-3 text-sm font-medium text-center border-b-2 transition-colors duration-200 ${
                  activeTab === "map"
                    ? "border-blue-500 text-blue-600 bg-blue-50"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center justify-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  <span>Search Location</span>
                </div>
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {/* Desktop layout */}
            <div className="hidden lg:flex flex-row min-h-full">
              
              {/* Form Section */}
              <div className="flex-1 p-4 space-y-4">
                {renderDesktopInfoCards()}
                
                {/* Control Button - Only Current Location */}
                <div className="flex">
                  <button
                    onClick={fetchCurrentLocation}
                    type="button"
                    disabled={!geocoderService.current}
                    className="flex-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-md flex items-center justify-center gap-1.5 hover:bg-blue-200 transition-colors duration-200 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Use Current Location</span>
                  </button>
                </div>

                {/* Form Fields */}
                {renderFormFields()}
              </div>

              {/* Map Section */}
              <div className="flex-1 border-l border-gray-200">
                <div className="p-4 h-full flex flex-col">
                  <div className="mb-3">
                    <h3 className="font-medium text-gray-800 text-sm mb-1.5">
                      Search & Select Location
                    </h3>
                    <p className="text-xs text-gray-600">
                      Click anywhere to select location. Blue circles show normal service areas, red shows selected area.
                    </p>
                  </div>
                  
                  <div className="flex-1 rounded-md border border-gray-300 min-h-[350px]">
                    <Map
                      {...cameraProps}
                      onCameraChanged={handleCameraChanged}
                      onClick={handleMapClick}
                      style={{width: '100%', height: '100%'}}
                      mapId="address-selection-map"
                      options={{
                        mapTypeControl: true,
                        streetViewControl: false,
                        fullscreenControl: false,
                      }}
                    >
                      {/* Service Area Circles - NOT CLICKABLE */}
                      <ServiceAreaCircles 
                        serviceAreas={serviceAreas} 
                        selectedAreaIndex={selectedAreaIndex}
                      />
                      
                      {/* User Location Marker */}
                      {formData.coordinates && (
                        <Marker
                          position={formData.coordinates}
                          draggable={true}
                          onDragEnd={handleMarkerDragEnd}
                          title="Your selected location - drag to move"
                        />
                      )}
                    </Map>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Layout */}
            <div className="lg:hidden h-full">
              {/* Form Tab Content */}
              {activeTab === "form" && (
                <div className="p-3 space-y-3 h-full">
                  {/* Control Button - Only Current Location */}
                  <div className="flex">
                    <button
                      onClick={fetchCurrentLocation}
                      type="button"
                      disabled={!geocoderService.current}
                      className="flex-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-md flex items-center justify-center gap-1.5 hover:bg-blue-200 transition-colors duration-200 font-medium text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Current Location</span>
                    </button>
                  </div>

                  {/* Mobile form fields */}
                  {renderFormFields()}
                </div>
              )}

              {/* Map Tab Content */}
              {activeTab === "map" && (
                <div className="p-3 h-full flex flex-col">
                  {/* FIXED: Service areas moved to map tab */}
                  {renderMobileMapServiceAreas()}
                  
                  <div className="mb-3">
                    <h3 className="font-medium text-gray-800 text-sm mb-1.5">
                      Search & Select Location
                    </h3>
                    <p className="text-xs text-gray-600">
                      Click anywhere to select location. Blue circles show normal service areas, red shows selected area.
                    </p>
                  </div>
                  
                  {/* FIXED: Map container with proper height for mobile */}
                  <div className="flex-1 rounded-md border border-gray-300" style={{ minHeight: "300px", height: "calc(100vh - 280px)" }}>
                    <Map
                      {...cameraProps}
                      onCameraChanged={handleCameraChanged}
                      onClick={handleMapClick}
                      style={{width: '100%', height: '100%'}}
                      mapId="mobile-address-selection-map"
                      options={{
                        mapTypeControl: true,
                        streetViewControl: false,
                        fullscreenControl: false,
                      }}
                    >
                      {/* Service Area Circles - NOT CLICKABLE for mobile */}
                      <ServiceAreaCircles 
                        serviceAreas={serviceAreas} 
                        selectedAreaIndex={selectedAreaIndex}
                      />
                      
                      {/* User Location Marker */}
                      {formData.coordinates && (
                        <Marker
                          position={formData.coordinates}
                          draggable={true}
                          onDragEnd={handleMarkerDragEnd}
                          title="Your selected location - drag to move"
                        />
                      )}
                    </Map>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 p-3 sm:p-4 bg-gray-50">
            <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
              <button
                onClick={onCancel}
                type="button"
                className="order-2 sm:order-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition-colors duration-200 font-medium text-xs sm:text-sm"
              >
                Cancel
              </button>
              
              {/* <button
                onClick={handleSubmit}
                disabled={isSaveDisabled}
                className="order-1 sm:order-2 px-4 py-2 bg-[var(--primary-color)]/90 text-white rounded-md hover:bg-[var(--primary-color)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-medium flex items-center justify-center gap-1.5 text-xs sm:text-sm"
                title={isFormModified ? "Address modified - please update coordinates first" : ""}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white" />
                    <span>Saving...</span>
                  </>
                ) : (
                  address && Object.keys(address).length > 0 ? "Edit Address" : "Add New Address"
                )}
              </button> */}
            </div>
          </div>
        </div>
      </div>
    </GeocodingService>
  );
};

// Main wrapper component with APIProvider
const AddressForm = (props) => {
  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-3 z-50">
        <div className="bg-white rounded-lg p-6 max-w-md mx-auto">
          <div className="flex items-center gap-3 text-red-600 mb-4">
            <AlertCircle className="w-6 h-6" />
            <h3 className="text-lg font-semibold">API Key Missing</h3>
          </div>
          <p className="text-gray-700 mb-4">
            Google Maps API key is not configured. Please add <code className="bg-gray-100 px-2 py-1 rounded text-sm">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> to your environment variables.
          </p>
          <button
            onClick={props.onCancel}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <APIProvider 
      apiKey={GOOGLE_MAPS_API_KEY} 
      libraries={['geocoding', 'places']}
      onLoad={() => console.log('✅ Google Maps API loaded successfully')}
    >
      <AddressFormContent {...props} />
    </APIProvider>
  );
};

export default AddressForm;
