<!-- "use client";
import React, { useState, useEffect } from "react";
import {
  Navigation,
  Search,
  CheckCircle,
  AlertCircle,
  MapPin,
  Home,
} from "lucide-react";

const AddressForm = ({ address, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    location: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
    coordinates: null,
    ...address,
  });
  const [loading, setLoading] = useState(false);
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [validationStatus, setValidationStatus] = useState({});
  const [locationHint, setLocationHint] = useState("");

  // Show alert function (mock)
  const showAlert = (title, message, type) => {
    alert(`${title}: ${message}`);
  };

  // Fetch address details from PIN code
  const fetchAddressFromPincode = async (pincode) => {
    if (pincode.length !== 6) return;

    setPincodeLoading(true);
    try {
      const response = await fetch(
        `https://api.postalpincode.in/pincode/${pincode}`
      );
      const data = await response.json();

      if (data[0]?.Status === "Success" && data[0]?.PostOffice?.length > 0) {
        const postOffice = data[0].PostOffice[0];
        setFormData((prev) => ({
          ...prev,
          city: postOffice.District,
          state: postOffice.State,
          country: postOffice.Country || "India",
        }));

        // Get coordinates for the city
        await getCoordinatesForCity(postOffice.District, postOffice.State);

        setValidationStatus((prev) => ({ ...prev, pincode: "valid" }));
      } else {
        setValidationStatus((prev) => ({ ...prev, pincode: "invalid" }));
      }
    } catch (error) {
      console.error("Error fetching address:", error);
      setValidationStatus((prev) => ({ ...prev, pincode: "error" }));
    } finally {
      setPincodeLoading(false);
    }
  };

  // Get current location using Geolocation API with better error handling
  const getCurrentLocation = () => {
    setLocationLoading(true);

    if (!navigator.geolocation) {
      showLocationError(
        "Geolocation is not supported by your browser. Please enter address manually."
      );
      setLocationLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          // Reverse geocoding using OpenStreetMap Nominatim API
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
          );

          if (!response.ok) {
            throw new Error("Failed to fetch address data");
          }

          const data = await response.json();

          if (data.address) {
            const addr = data.address;

            // Build detailed location string
            const locationParts = [];
            if (addr.house_number) locationParts.push(addr.house_number);
            if (addr.building) locationParts.push(addr.building);
            if (addr.road) locationParts.push(addr.road);
            if (addr.neighbourhood || addr.suburb)
              locationParts.push(addr.neighbourhood || addr.suburb);

            const detailedLocation =
              locationParts.length > 0
                ? locationParts.join(", ")
                : data.display_name.split(",").slice(0, 3).join(", ");

            setFormData((prev) => ({
              ...prev,
              location: detailedLocation,
              city:
                addr.city ||
                addr.town ||
                addr.village ||
                addr.county ||
                addr.district ||
                "",
              state: addr.state || addr.region || "",
              postalCode: addr.postcode || "",
              country: addr.country || "India",
              coordinates: { lat: latitude, lng: longitude },
            }));

            // Validate the fetched PIN code
            if (addr.postcode) {
              await fetchAddressFromPincode(addr.postcode);
            }

            // Show success message
            showLocationSuccess("Location detected successfully!");
          } else {
            showLocationError(
              "Could not determine address from your location. Please enter manually."
            );
          }
        } catch (error) {
          console.error("Error reverse geocoding:", error);
          showLocationError(
            "Failed to get address details. Please try again or enter manually."
          );
        } finally {
          setLocationLoading(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        let errorMessage = "Unable to retrieve your location. ";

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage +=
              "Location access denied. Please enable location access in browser settings.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage +=
              "Location information unavailable. Check your internet connection.";
            break;
          case error.TIMEOUT:
            errorMessage += "Location request timed out. Please try again.";
            break;
          default:
            errorMessage += "Please enter address manually.";
            break;
        }

        showLocationError(errorMessage);
        setLocationLoading(false);
      },
      {
        enableHighAccuracy: false,
        timeout: 15000,
        maximumAge: 300000,
      }
    );
  };

  // Show location error
  const showLocationError = (message) => {
    setValidationStatus((prev) => ({ ...prev, location: "error" }));
    showAlert("Location Error", message, "error");
    setTimeout(() => {
      setValidationStatus((prev) => ({ ...prev, location: null }));
    }, 5000);
  };

  // Show location success
  const showLocationSuccess = (message) => {
    setValidationStatus((prev) => ({ ...prev, location: "success" }));
    showAlert("Location Success", message, "success");
    setTimeout(() => {
      setValidationStatus((prev) => ({ ...prev, location: null }));
    }, 3000);
  };

  // Get coordinates for a city
  const getCoordinatesForCity = async (city, state) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${city}, ${state}, India&limit=1`
      );
      const data = await response.json();

      if (data.length > 0) {
        setFormData((prev) => ({
          ...prev,
          coordinates: {
            lat: parseFloat(data[0].lat),
            lng: parseFloat(data[0].lon),
          },
        }));
      }
    } catch (error) {
      console.error("Error fetching coordinates:", error);
    }
  };

  // Address autocomplete using Nominatim API
  const searchAddressSuggestions = async (query) => {
    if (query.length < 3) {
      setAddressSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${query}, India&limit=5&addressdetails=1`
      );
      const data = await response.json();

      const suggestions = data.map((item) => {
        const addr = item.address;

        // Build detailed suggestion
        const locationParts = [];
        if (addr.house_number) locationParts.push(addr.house_number);
        if (addr.building) locationParts.push(addr.building);
        if (addr.road) locationParts.push(addr.road);
        if (addr.neighbourhood || addr.suburb)
          locationParts.push(addr.neighbourhood || addr.suburb);

        const detailedLocation =
          locationParts.length > 0
            ? locationParts.join(", ")
            : item.display_name.split(",").slice(0, 3).join(", ");

        return {
          display_name: item.display_name,
          detailed_location: detailedLocation,
          address: item.address,
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
        };
      });

      setAddressSuggestions(suggestions);
      setShowSuggestions(true);
    } catch (error) {
      console.error("Error fetching address suggestions:", error);
    }
  };

  // Handle address suggestion selection
  const selectAddressSuggestion = (suggestion) => {
    const addr = suggestion.address;
    setFormData((prev) => ({
      ...prev,
      location: suggestion.detailed_location,
      city: addr.city || addr.town || addr.village || addr.county || "",
      state: addr.state || "",
      postalCode: addr.postcode || "",
      country: addr.country || "India",
      coordinates: { lat: suggestion.lat, lng: suggestion.lng },
    }));

    setShowSuggestions(false);
    setAddressSuggestions([]);

    // Validate PIN code if available
    if (addr.postcode) {
      fetchAddressFromPincode(addr.postcode);
    }
  };

  // Validate delivery availability
  const checkDeliveryAvailability = async (pincode) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const availablePincodes = ["110001", "400001", "192301", "123456"];
        resolve(availablePincodes.includes(pincode));
      }, 1000);
    });
  };

  const handlePincodeChange = async (e) => {
    const pincode = e.target.value.replace(/\D/g, "").slice(0, 6);
    setFormData((prev) => ({ ...prev, postalCode: pincode }));

    if (pincode.length === 6) {
      await fetchAddressFromPincode(pincode);

      const isDeliveryAvailable = await checkDeliveryAvailability(pincode);
      setValidationStatus((prev) => ({
        ...prev,
        delivery: isDeliveryAvailable ? "available" : "unavailable",
      }));
    } else {
      setValidationStatus((prev) => ({
        ...prev,
        pincode: null,
        delivery: null,
      }));
    }
  };

  const handleLocationSearch = (e) => {
    const query = e.target.value;
    setFormData((prev) => ({ ...prev, location: query }));

    // Update hint based on input
    if (query.length === 0) {
      setLocationHint(
        "e.g., House No. 123, ABC Building, Main Road, Sector 15"
      );
    } else if (query.includes(",")) {
      setLocationHint(
        "Great! Use commas to separate different parts of your address"
      );
    } else {
      setLocationHint(
        "Add comma-separated details: House No., Building, Road, Area"
      );
    }

    // Debounce the search
    clearTimeout(window.addressSearchTimeout);
    window.addressSearchTimeout = setTimeout(() => {
      searchAddressSuggestions(query);
    }, 300);
  };

  const handleSubmit = async () => {
    if (
      !formData.location ||
      !formData.city ||
      !formData.state ||
      !formData.postalCode
    ) {
      showAlert(
        "Validation Error",
        "Please fill in all required fields",
        "error"
      );
      return;
    }

    if (validationStatus.pincode === "invalid") {
      showAlert("Validation Error", "Please enter a valid PIN code", "error");
      return;
    }

    setLoading(true);
    try {
      await onSave(formData);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "valid":
      case "available":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "invalid":
      case "unavailable":
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-[var(--white)] rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-[var(--primary-color)] mb-6">
            {address ? "Edit Address" : "Add New Address"}
          </h2>

          {/* Quick Actions */}
          <div className="flex gap-2 mb-6">
            <button
              type="button"
              onClick={getCurrentLocation}
              disabled={locationLoading}
              className={`flex-1 py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm ${
                validationStatus.location === "error"
                  ? "bg-red-50 text-red-700 border border-red-200"
                  : validationStatus.location === "success"
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-blue-50 text-blue-700 hover:bg-blue-100"
              }`}
            >
              {locationLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              ) : (
                <Navigation className="w-4 h-4" />
              )}
              {validationStatus.location === "success"
                ? "Location Detected!"
                : "Use Current Location"}
            </button>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <label className="block text-sm font-medium text-[var(--primary-color)] mb-2">
                House no., Building, Road, Area/Locality{" "}
                <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.location}
                  onChange={handleLocationSearch}
                  onFocus={() =>
                    setShowSuggestions(addressSuggestions.length > 0)
                  }
                  placeholder="House No., Building Name, Road/Street, Area/Locality"
                  className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <Home className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              </div>

              {/* Address Format Hint */}
              <div className="mt-2 p-3 bg-[var(--white)] border border-[var(--primary-color)] rounded-lg">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-blue-800 mb-1">
                      Address Format
                    </p>
                    <p className="text-xs text-blue-600">{locationHint}</p>
                    <p className="text-xs text-blue-500 mt-1">
                      Example: "123, Moonlight , Hyderpora Road, Parrypora"
                    </p>
                  </div>
                </div>
              </div>

              {/* Address Suggestions Dropdown */}
              {showSuggestions && addressSuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-[var(--white)] border border-[var(--primary-color)] rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {addressSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => selectAddressSuggestion(suggestion)}
                      className="w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                    >
                      <div className="font-medium text-gray-900 truncate">
                        {suggestion.detailed_location}
                      </div>
                      <div className="text-sm text-gray-500 truncate">
                        {suggestion.display_name
                          .split(",")
                          .slice(-3)
                          .join(", ")}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--primary-color)] mb-2">
                PIN Code <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.postalCode}
                  onChange={handlePincodeChange}
                  placeholder="Enter 6-digit PIN code"
                  className={`w-full p-3 pr-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    validationStatus.pincode === "invalid"
                      ? "border-red-300"
                      : validationStatus.pincode === "valid"
                      ? "border-green-300"
                      : "border-gray-300"
                  }`}
                  required
                />
                <div className="absolute right-3 top-3 flex items-center gap-1">
                  {pincodeLoading && (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                  )}
                  {getStatusIcon(validationStatus.pincode)}
                </div>
              </div>

              {/* Validation Messages */}
              {validationStatus.pincode === "invalid" && (
                <p className="text-red-600 text-sm mt-1">Invalid PIN code</p>
              )}
              {validationStatus.delivery === "unavailable" && (
                <p className="text-amber-600 text-sm mt-1">
                  ⚠️ Delivery might not be available in this area
                </p>
              )}
              {validationStatus.delivery === "available" && (
                <p className="text-green-600 text-sm mt-1">
                  ✅ Delivery available in this area
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--primary-color)] mb-2">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, city: e.target.value }))
                  }
                  placeholder="City"
                  className="w-full p-3 border border-[var(--primary-color)] rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--primary-color)] mb-2">
                  State <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      state: e.target.value,
                    }))
                  }
                  placeholder="State"
                  className="w-full p-3 border border-[var(--primary-color)] rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--primary-color)] mb-2">
                Country
              </label>
              <input
                type="text"
                value={formData.country}
                disabled
                className="w-full p-3 border border-[var(--primary-color)] rounded-lg bg-[var(--white)] text-[var(--text-color)] cursor-not-allowed"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading || validationStatus.pincode === "invalid"}
                className="flex-1 py-3 px-4 bg-[var(--primary-color)] text-white rounded-lg hover:bg-[var(--primary-color)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>{address ? "Update" : "Save"} Address</>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddressForm; -->
