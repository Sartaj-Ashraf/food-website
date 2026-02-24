import Addresses from "../models/addressesModel.js";
import Address from "../models/addressModel.js";
import ServiceArea from "../models/serviceAreaModel.js"; // Import ServiceArea model
import { StatusCodes } from "http-status-codes";

const MAX_ADDRESSES_PER_USER = 3;

// Helper function to check if address is within service area
const checkServiceAreaDelivery = async (coordinates) => {
  try {
    console.log('🌍 Checking service area for coordinates:', coordinates);
    
    // Find active service areas that include this location
    const serviceAreas = await ServiceArea.find({
      isActive: true,
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [coordinates.lng, coordinates.lat] // GeoJSON format [lng, lat]
          },
          $maxDistance: 50000 // Maximum 50km search radius
        }
      }
    });

    console.log('📍 Found service areas:', serviceAreas.length);

    // Check if address falls within any service area's delivery radius
    for (let area of serviceAreas) {
      const distance = calculateDistance(
        coordinates.lat,
        coordinates.lng,
        area.location.coordinates[1], // service area latitude
        area.location.coordinates[0]  // service area longitude
      );
      
      console.log(`📏 Distance to ${area.address}: ${distance.toFixed(2)}km (max: ${area.deliveryRadius}km)`);
      
      if (distance <= area.deliveryRadius) {
        return {
          isServiced: true,
          serviceArea: area,
          distance: distance
        };
      }
    }

    return {
      isServiced: false,
      nearestArea: serviceAreas.length > 0 ? serviceAreas[0] : null,
      serviceAreas: serviceAreas
    };
    
  } catch (error) {
    console.error('❌ Service area check error:', error);
    // Don't block address creation if service area check fails
    return { isServiced: true, error: error.message };
  }
};

const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

const transformAddressData = (frontendData) => {
  console.log('📍 Transforming frontend data:', frontendData);
  
  if (!frontendData.coordinates || !frontendData.coordinates.lat || !frontendData.coordinates.lng) {
    throw new Error("Valid coordinates (lat, lng) are required");
  }

  const transformedData = {
    // Map location field to address field for database
    address: frontendData.location, // Full address string from frontend "location" field
    
    // Transform coordinates to GeoJSON format
    location: {
      type: "Point",
      coordinates: [
        frontendData.coordinates.lng, // longitude first (GeoJSON format)
        frontendData.coordinates.lat  // latitude second
      ]
    },
    
    // Map other fields directly
    city: frontendData.city,
    state: frontendData.state,
    postalCode: frontendData.postalCode,
    country: frontendData.country || "India",
    
    // Optional fields
    accuracy: frontendData.accuracy || 'APPROXIMATE',
    placeId: frontendData.place_id || null,
    
    // Keep isDefault if provided
    isDefault: frontendData.isDefault || false
  };

  console.log('✅ Transformed data:', transformedData);
  return transformedData;
};

export const createAddress = async (req, res) => {
    try {
        const { userId } = req.user;
        const { address } = req.body;

        if (!userId) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                status: "error",
                message: "User authentication required",
            });
        }

        const transformedAddress = transformAddressData(address);

        const serviceAreaCheck = await checkServiceAreaDelivery(address.coordinates);

        if (!serviceAreaCheck.isServiced && !serviceAreaCheck.error) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                status: "error",
                message: "Sorry, we don't deliver to this location yet.",
                details: "This address is outside our current service areas. Please try a different address or contact support.",
                nearestServiceArea: serviceAreaCheck.nearestArea ? {
                    address: serviceAreaCheck.nearestArea.address,
                    maxDeliveryRadius: serviceAreaCheck.nearestArea.deliveryRadius
                } : null
            });
        }

        // Find existing addresses document
        let addresses = await Addresses.findOne({ userId });

        if (!addresses) {
            // Create new addresses document only if it doesn't exist
            const newAddressesDoc = await Addresses.create([{
                userId,
                addresses: []
            }]);
            addresses = newAddressesDoc[0];
        }

        // Populate addresses within the same session
        await addresses.populate({ path: 'addresses' });

        // Check maximum addresses limit - return BAD_REQUEST instead of throwing
        if (addresses.addresses.length >= MAX_ADDRESSES_PER_USER) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                status: "error",
                message: "Address limit reached! Please delete one of your existing addresses to add a new one.",
                currentCount: addresses.addresses.length,
                maxAllowed: MAX_ADDRESSES_PER_USER
            });
        }

        // Set default logic
        if (addresses.addresses.length === 0) {
            transformedAddress.isDefault = true;
        } else if (transformedAddress.isDefault) {
            // Remove default from existing addresses
            await Address.updateMany(
                { _id: { $in: addresses.addresses.map(addr => addr._id) } },
                { isDefault: false }
            );
        }

        // Create new address with transformed data
        const [newAddress] = await Address.create([transformedAddress]);
        console.log('✅ Address created in DB:', newAddress);

        // Add to addresses array and save
        addresses.addresses.push(newAddress._id);
        await addresses.save();

        // Transform back to frontend format for response
        const responseAddress = {
            _id: newAddress._id,
            location: newAddress.address, // Map DB address field back to frontend location field
            coordinates: {
                lat: newAddress.location.coordinates[1], // latitude
                lng: newAddress.location.coordinates[0]  // longitude
            },
            city: newAddress.city,
            state: newAddress.state,
            postalCode: newAddress.postalCode,
            country: newAddress.country,
            isDefault: newAddress.isDefault,
            accuracy: newAddress.accuracy,
            place_id: newAddress.placeId,
            createdAt: newAddress.createdAt,
            updatedAt: newAddress.updatedAt,
            // Include service area info in response
            serviceArea: serviceAreaCheck.serviceArea ? {
                name: serviceAreaCheck.serviceArea.address,
                distance: serviceAreaCheck.distance?.toFixed(2) + ' km'
            } : null
        };

        // SUCCESS response
        res.status(StatusCodes.CREATED).json({
            newAddress: responseAddress,
            status: "success",
            message: serviceAreaCheck.serviceArea 
                ? `Address added successfully! You're in our ${serviceAreaCheck.serviceArea.address} service area.`
                : "Address added successfully!",
        });

    } catch (error) {
        console.error("❌ Create address transaction error:", error);

        // Handle specific database errors
        if (error.code === 11000) {
            return res.status(StatusCodes.CONFLICT).json({
                status: "error",
                message: "Duplicate address document detected. Please try again.",
            });
        }

        // Handle validation errors from mongoose
        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map(err => err.message);
            return res.status(StatusCodes.BAD_REQUEST).json({
                status: "error",
                message: "Validation failed: " + validationErrors.join(', '),
                validationErrors: validationErrors
            });
        }

        // Handle cast errors (invalid ObjectId, etc.)
        if (error.name === 'CastError') {
            return res.status(StatusCodes.BAD_REQUEST).json({
                status: "error",
                message: "Invalid data format provided",
            });
        }

        // Handle any other specific errors you might encounter
        if (error.message.includes("User not found")) {
            return res.status(StatusCodes.NOT_FOUND).json({
                status: "error",
                message: "User not found",
            });
        }

        // Generic server error for all other cases
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            status: "error",
            message: error.message || "Failed to create address",
            // Only include error details in development
            ...(process.env.NODE_ENV === 'development' && { 
                errorDetails: error.stack 
            })
        });
    }
};

export const updateAddress = async (req, res) => {
    try {
        const { userId } = req.user;
        const { addressId, updatedAddress } = req.body;

        console.log('📍 Updating address:', addressId);
        console.log('📍 Update data received:', updatedAddress);

        // Verify user has addresses
        const addresses = await Addresses.findOne({ userId });
        if (!addresses) {
            return res.status(StatusCodes.NOT_FOUND).json({
                status: "error",
                message: "User addresses not found",
            });
        }

        // Verify address exists and belongs to user
        const address = await Address.findById(addressId);
        if (!address) {
            return res.status(StatusCodes.NOT_FOUND).json({
                status: "error",
                message: "Address not found",
            });
        }

        // Check if address belongs to user
        if (!addresses.addresses.includes(addressId)) {
            return res.status(StatusCodes.FORBIDDEN).json({
                status: "error",
                message: "Address does not belong to this user",
            });
        }

        // 🚀 NEW: Check if updated address is within service area
        const serviceAreaCheck = await checkServiceAreaDelivery(updatedAddress.coordinates);
        console.log('🌍 Service area check result for update:', serviceAreaCheck);

        if (!serviceAreaCheck.isServiced && !serviceAreaCheck.error) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                status: "error",
                message: "Sorry, we don't deliver to this location yet.",
                details: "This updated address is outside our current service areas. Please try a different location.",
                nearestServiceArea: serviceAreaCheck.nearestArea ? {
                    address: serviceAreaCheck.nearestArea.address,
                    maxDeliveryRadius: serviceAreaCheck.nearestArea.deliveryRadius
                } : null
            });
        }

        // Transform frontend data to database format
        const transformedUpdate = transformAddressData(updatedAddress);
        console.log('📍 Transformed update data:', transformedUpdate);

        // Handle default address logic
        if (transformedUpdate.isDefault && !address.isDefault) {
            // Remove default from all other addresses
            await Address.updateMany(
                { 
                    _id: { $in: addresses.addresses.map(addr => addr._id) },
                    _id: { $ne: addressId } // Exclude current address
                },
                { isDefault: false }
            );
        }

        // Update address with transformed data
        const updatedAddressDoc = await Address.findByIdAndUpdate(
            addressId,
            transformedUpdate,
            { new: true, runValidators: true }
        );

        console.log('✅ Address updated in DB:', updatedAddressDoc);

        // Transform back to frontend format for response
        const responseAddress = {
            _id: updatedAddressDoc._id,
            location: updatedAddressDoc.address, // Map DB address field back to frontend location field
            coordinates: {
                lat: updatedAddressDoc.location.coordinates[1], // latitude
                lng: updatedAddressDoc.location.coordinates[0]  // longitude
            },
            city: updatedAddressDoc.city,
            state: updatedAddressDoc.state,
            postalCode: updatedAddressDoc.postalCode,
            country: updatedAddressDoc.country,
            isDefault: updatedAddressDoc.isDefault,
            accuracy: updatedAddressDoc.accuracy,
            place_id: updatedAddressDoc.placeId,
            createdAt: updatedAddressDoc.createdAt,
            updatedAt: updatedAddressDoc.updatedAt,
            // Include service area info in response
            serviceArea: serviceAreaCheck.serviceArea ? {
                name: serviceAreaCheck.serviceArea.address,
                distance: serviceAreaCheck.distance?.toFixed(2) + ' km'
            } : null
        };

        res.status(StatusCodes.OK).json({
            address: responseAddress,
            status: "success",
            message: serviceAreaCheck.serviceArea 
                ? `Address updated successfully! You're in our ${serviceAreaCheck.serviceArea.address} service area.`
                : "Address updated successfully!",
        });

    } catch (error) {
        console.error("❌ Update address error:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            status: "error",
            message: "Failed to update address",
            error: error.message,
        });
    }
};

// 🚀 NEW: Function to validate all user addresses against service areas
export const validateAllUserAddresses = async (req, res) => {
    try {
        const { userId } = req.user;

        const addresses = await Addresses.findOne({ userId }).populate("addresses");

        if (!addresses || addresses.addresses.length === 0) {
            return res.status(StatusCodes.OK).json({
                status: "success",
                message: "No addresses to validate",
                addressesOutsideServiceArea: []
            });
        }

        const addressesOutsideServiceArea = [];

        // Check each address
        for (let addr of addresses.addresses) {
            const coordinates = {
                lat: addr.location.coordinates[1],
                lng: addr.location.coordinates[0]
            };

            const serviceAreaCheck = await checkServiceAreaDelivery(coordinates);
            
            if (!serviceAreaCheck.isServiced && !serviceAreaCheck.error) {
                addressesOutsideServiceArea.push({
                    _id: addr._id,
                    address: addr.address,
                    city: addr.city,
                    state: addr.state,
                    isDefault: addr.isDefault
                });
            }
        }

        res.status(StatusCodes.OK).json({
            status: "success",
            message: `Validated ${addresses.addresses.length} addresses`,
            totalAddresses: addresses.addresses.length,
            addressesOutsideServiceArea: addressesOutsideServiceArea,
            hasUnservicedAddresses: addressesOutsideServiceArea.length > 0
        });

    } catch (error) {
        console.error("❌ Validate addresses error:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            status: "error",
            message: "Failed to validate addresses",
            error: error.message,
        });
    }
};

// Keep all other existing functions unchanged...
export const getAllAddressesByUserId = async (req, res) => {
    try {
        const { userId } = req.user;

        const addresses = await Addresses.findOne({ userId }).populate("addresses");

        if (!addresses) {
            return res.status(StatusCodes.NOT_FOUND).json({
                status: "error",
                message: "No addresses found for this user",
            });
        }

        // Transform addresses back to frontend format
        const transformedAddresses = addresses.addresses.map(addr => ({
            _id: addr._id,
            location: addr.address, // Map DB address field to frontend location field
            coordinates: {
                lat: addr.location.coordinates[1], // latitude
                lng: addr.location.coordinates[0]  // longitude
            },
            city: addr.city,
            state: addr.state,
            postalCode: addr.postalCode,
            country: addr.country,
            isDefault: addr.isDefault,
            accuracy: addr.accuracy,
            place_id: addr.placeId,
            createdAt: addr.createdAt,
            updatedAt: addr.updatedAt
        }));

        res.status(StatusCodes.OK).json({
            addresses: transformedAddresses,
            status: "success",
            message: "Addresses fetched successfully",
        });

    } catch (error) {
        console.error("❌ Get addresses error:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            status: "error",
            message: "Failed to fetch addresses",
            error: error.message,
        });
    }
};

export const deleteAddress = async (req, res) => {
    try {
        const { userId } = req.user;
        const { addressId } = req.body;

        // Find user's addresses
        const addresses = await Addresses.findOne({ userId }).populate("addresses");
        if (!addresses) {
            return res.status(StatusCodes.NOT_FOUND).json({
                status: "error",
                message: "User addresses not found",
            });
        }

        // Verify address exists and belongs to user
        const addressIndex = addresses.addresses.findIndex(
            addr => addr._id.toString() === addressId
        );

        if (addressIndex === -1) {
            return res.status(StatusCodes.NOT_FOUND).json({
                status: "error",
                message: "Address not found or does not belong to this user",
            });
        }

        const addressToDelete = addresses.addresses[addressIndex];

        // Delete the address document
        await Address.findByIdAndDelete(addressId);

        // Remove address from user's addresses array
        addresses.addresses.splice(addressIndex, 1);

        // If deleted address was default and there are other addresses, set first one as default
        if (addressToDelete.isDefault && addresses.addresses.length > 0) {
            await Address.findByIdAndUpdate(addresses.addresses[0]._id, { isDefault: true });
        }

        await addresses.save();

        res.status(StatusCodes.OK).json({
            status: "success",
            message: "Address deleted successfully",
        });

    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            status: "error",
            message: "Failed to delete address",
            error: error.message,
        });
    }
};

export const deleteAllAddressesByUserId = async (req, res) => {
    try {
        const { userId } = req.user;

        // Find user's addresses
        const addresses = await Addresses.findOne({ userId });
        if (!addresses) {
            return res.status(StatusCodes.NOT_FOUND).json({
                status: "error",
                message: "No addresses found for this user",
            });
        }

        // Delete all address documents for this user
        const deletedAddresses = await Address.deleteMany({
            _id: { $in: addresses.addresses }
        });

        // Clear the addresses array
        addresses.addresses = [];
        await addresses.save();

        res.status(StatusCodes.OK).json({
            deletedCount: deletedAddresses.deletedCount,
            status: "success",
            message: "All addresses deleted successfully",
        });

    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            status: "error",
            message: "Failed to delete addresses",
            error: error.message,
        });
    }
};

export const setAddressToDefault = async (req, res) => {
    try {
        const { userId } = req.user;
        const { addressId } = req.body;

        // Find user's addresses
        const addresses = await Addresses.findOne({ userId }).populate("addresses");
        if (!addresses) {
            return res.status(StatusCodes.NOT_FOUND).json({
                status: "error",
                message: "User addresses not found",
            });
        }

        // Verify address exists and belongs to user
        const addressExists = addresses.addresses.some(
            addr => addr._id.toString() === addressId
        );

        if (!addressExists) {
            return res.status(StatusCodes.NOT_FOUND).json({
                status: "error",
                message: "Address not found or does not belong to this user",
            });
        }

        // Remove default from all user's addresses
        await Address.updateMany(
            { _id: { $in: addresses.addresses.map(addr => addr._id) } },
            { isDefault: false }
        );

        // Set the specified address as default
        const defaultAddress = await Address.findByIdAndUpdate(
            addressId,
            { isDefault: true },
            { new: true }
        );

        // Transform back to frontend format for response
        const responseAddress = {
            _id: defaultAddress._id,
            location: defaultAddress.address, // Map DB address field back to frontend location field
            coordinates: {
                lat: defaultAddress.location.coordinates[1], // latitude
                lng: defaultAddress.location.coordinates[0]  // longitude
            },
            city: defaultAddress.city,
            state: defaultAddress.state,
            postalCode: defaultAddress.postalCode,
            country: defaultAddress.country,
            isDefault: defaultAddress.isDefault,
            accuracy: defaultAddress.accuracy,
            place_id: defaultAddress.placeId,
            createdAt: defaultAddress.createdAt,
            updatedAt: defaultAddress.updatedAt
        };

        res.status(StatusCodes.OK).json({
            address: responseAddress,
            status: "success",
            message: "Address set as default successfully",
        });

    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            status: "error",
            message: "Failed to set address as default",
            error: error.message,
        });
    }
};

export const getDefaultAddress = async (req, res) => {
    try {
        const { userId } = req.user;

        // Find user's addresses
        const addresses = await Addresses.findOne({ userId }).populate("addresses");
        if (!addresses) {
            return res.status(StatusCodes.NOT_FOUND).json({
                status: "error",
                message: "No addresses found for this user",
            });
        }

        // Find default address
        const defaultAddress = addresses.addresses.find(addr => addr.isDefault);

        if (!defaultAddress) {
            return res.status(StatusCodes.NOT_FOUND).json({
                status: "error",
                message: "No default address found",
            });
        }

        // Transform back to frontend format for response
        const responseAddress = {
            _id: defaultAddress._id,
            location: defaultAddress.address, // Map DB address field back to frontend location field
            coordinates: {
                lat: defaultAddress.location.coordinates[1], // latitude
                lng: defaultAddress.location.coordinates[0]  // longitude
            },
            city: defaultAddress.city,
            state: defaultAddress.state,
            postalCode: defaultAddress.postalCode,
            country: defaultAddress.country,
            isDefault: defaultAddress.isDefault,
            accuracy: defaultAddress.accuracy,
            place_id: defaultAddress.placeId,
            createdAt: defaultAddress.createdAt,
            updatedAt: defaultAddress.updatedAt
        };

        res.status(StatusCodes.OK).json({
            address: responseAddress,
            status: "success",
            message: "Default address fetched successfully",
        });

    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            status: "error",
            message: "Failed to fetch default address",
            error: error.message,
        });
    }
};
