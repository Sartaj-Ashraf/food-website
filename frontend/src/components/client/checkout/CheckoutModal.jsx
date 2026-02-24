"use client"
import { useState, useEffect } from "react";
import { getAllAddresses, createAddress, deleteAddress } from "@/services/addressServices";
import { 
  createCartRazorpayOrder, 
  createCartOrder, 
  createDirectRazorpayOrder,
  createDirectOrder,
  createPayment,
  validateDeliveryAddress 
} from "@/services/orderPaymentServices";
import { AddressForm, OrderModal, ActionModal } from "@/components";
import { useCartCount } from "@/hooks/useCartCount";
import { Trash2 } from "lucide-react";
import toast from "react-hot-toast";

const CheckoutModal = ({ 
  onClose, 
  price, 
  closecart,
  purchaseType = 'cart', // 'cart' or 'direct'
  itemType = null, // 'product' or 'combo' (required for direct)
  itemId = null, // MongoDB ID (required for direct)
  quantity = 1, // quantity (for direct)
  itemDetails = null, // optional: product/combo details for display
}) => {
  const { refreshCartCount } = useCartCount();
  const [addresses, setAddresses] = useState([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [phoneError, setPhoneError] = useState("");
  const [addressValidation, setAddressValidation] = useState(null);

  // 🗑️ NEW: Delete address states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // 🚛 Delivery charge constant
  const DELIVERY_CHARGE = 1;

  // Determine if this is a cart or direct purchase
  const isCart = purchaseType === 'cart';
  const isDirect = purchaseType === 'direct';

  // Calculate total amounts with delivery charges
  const calculateTotalAmounts = () => {
    if (isDirect && itemDetails) {
      const itemTotal = (itemDetails?.price || itemDetails?.comboPrice || 0) * quantity;
      return {
        itemTotal,
        deliveryCharge: DELIVERY_CHARGE,
        finalTotal: itemTotal + DELIVERY_CHARGE
      };
    } else if (isCart && price) {
      return {
        itemTotal: price.discountPrice,
        deliveryCharge: DELIVERY_CHARGE,
        finalTotal: price.discountPrice + DELIVERY_CHARGE
      };
    }
    return {
      itemTotal: 0,
      deliveryCharge: DELIVERY_CHARGE,
      finalTotal: DELIVERY_CHARGE
    };
  };

  const { itemTotal, deliveryCharge, finalTotal } = calculateTotalAmounts();

  // Handle click outside to close modal
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !loading && !showAddressForm && !deleteLoading && !showDeleteModal) {
      onClose();
    }
  };

  // Validation for direct purchase props
  useEffect(() => {
    if (isDirect) {
      if (!itemType || !itemId || !quantity) {
        console.error("Direct purchase requires itemType, itemId, and quantity props");
        toast.error("Invalid purchase configuration. Please refresh and try again.");
      }
    }
  }, [isDirect, itemType, itemId, quantity]);

  useEffect(() => {
    async function fetchAddresses() {
      try {
        const { data } = await getAllAddresses();
        if (data?.addresses) {
          setAddresses(data.addresses);
          const defaultAddress = data.addresses.find(a => a.isDefault) || data.addresses[0] || null;
          setSelectedAddress(defaultAddress);
          
          // Validate default address
          if (defaultAddress) {
            validateSelectedAddress(defaultAddress._id);
          }
        }
      } catch (error) {
        console.error("Failed to fetch addresses:", error);
      }
    }
    fetchAddresses();
  }, []);

  // Validate address when selected
  const validateSelectedAddress = async (addressId) => {
    if (!addressId) return;
    
    try {
      const { data, error } = await validateDeliveryAddress(addressId);
      
      if (error) {
        console.warn("Address validation failed:", error);
        setAddressValidation(null);
        return;
      }
      
      setAddressValidation({
        isDeliverable: data.isDeliverable,
        serviceArea: data.serviceArea,
        message: data.message
      });
      
      // Clear any previous delivery errors if address is now valid
      if (data.isDeliverable && error?.type === 'delivery') {
        setError(null);
      }
      
    } catch (err) {
      console.warn("Address validation error:", err);
      setAddressValidation(null);
    }
  };

  // 🗑️ NEW: Handle delete address
  const handleDeleteAddress = async () => {
    if (!addressToDelete) return;

    setDeleteLoading(true);
    try {
      const { data } = await deleteAddress(addressToDelete._id);
      
      // Remove from local state
      const updatedAddresses = addresses.filter(addr => addr._id !== addressToDelete._id);
      setAddresses(updatedAddresses);
      
      // If deleted address was selected, select another one
      if (selectedAddress?._id === addressToDelete._id) {
        const newSelectedAddress = updatedAddresses[0] || null;
        setSelectedAddress(newSelectedAddress);
        if (newSelectedAddress) {
          validateSelectedAddress(newSelectedAddress._id);
        }
      }
      
      toast.success(data.message || "Address deleted successfully!");
      
    } catch (error) {
      const errorMessage = error.error?.response?.data?.message || error.message || "Failed to delete address";
      toast.error(errorMessage);
      console.error('Delete address error:', error);
    } finally {
      setDeleteLoading(false);
      setAddressToDelete(null);
      setShowDeleteModal(false);
    }
  };

  // 🗑️ NEW: Open delete confirmation
  const openDeleteConfirmation = (address) => {
    setAddressToDelete(address);
    setShowDeleteModal(true);
  };

  const handleSaveAddress = async (addressData) => {
    try {
      const { data } = await createAddress(addressData);
      if (data?.newAddress) {
        setAddresses(prev => [...prev, data.newAddress]);
        setSelectedAddress(data.newAddress);
        setShowAddressForm(false);
        
        // Validate the new address
        validateSelectedAddress(data.newAddress._id);
        
        toast.success(data.message || "Address saved successfully!");
      }
    } catch (error) {
      const errorMessage = error.error?.response?.data?.message || error.message || "Failed to save address";
      toast.error(errorMessage);
      console.error('Save address error:', error);
    }
  };

  const validatePhone = (phoneNumber) => {
    if (!phoneNumber) {
      setPhoneError("Phone number is required");
      return false;
    }
    if (!phoneNumber.match(/^\d{10}$/)) {
      setPhoneError("Enter a valid 10-digit phone number");
      return false;
    }
    setPhoneError("");
    return true;
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/[^\d]/g, "").slice(0, 10);
    setPhone(value);
    if (value.length === 10) {
      validatePhone(value);
    } else {
      setPhoneError("");
    }
  };

  const handleAddressSelection = (address) => {
    setSelectedAddress(address);
    setError(null); // Clear any previous errors
    validateSelectedAddress(address._id);
  };

  const handlePayment = async () => {
    setError(null);
    
    // Validation
    if (!selectedAddress) {
      toast.error("Please select a delivery address!");
      return;
    }
    
    if (!validatePhone(phone)) {
      return;
    }

    // Check if address validation failed
    if (addressValidation && !addressValidation.isDeliverable) {
      setError({
        type: 'delivery',
        message: addressValidation.message || "Delivery not available to this address",
        address: selectedAddress.location
      });
      toast.error("Please select a different delivery address");
      return;
    }

    setLoading(true);
    
    try {
      console.log(`🛒 Starting ${purchaseType} checkout process...`);
      
      // Step 1: Create Razorpay order based on purchase type with delivery charges
      let response;
      if (isCart) {
        response = await createCartRazorpayOrder(finalTotal, selectedAddress._id);
        console.log("💳 Cart Razorpay order response:", response);
      } else {
        response = await createDirectRazorpayOrder(itemType, itemId, quantity, selectedAddress._id, finalTotal);
        console.log("💳 Direct Razorpay order response:", response);
      }
      
      const razorpayData = response.data;
      
      // Handle API errors
      if (!razorpayData && response?.error?.response?.data) {
        const errorData = response.error.response.data;
        throw new Error(errorData.message || "Unable to create order");
      }

      // Validate razorpay order creation
      if (!razorpayData?.razorpayOrderId) {
        throw new Error("Failed to create payment order. Please try again.");
      }

      const razorpayOrderId = razorpayData.razorpayOrderId;
      console.log(`✅ ${purchaseType} Razorpay order created:`, razorpayOrderId);

      // Step 2: Setup Razorpay payment options
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY,
        amount: finalTotal * 100,
        currency: "INR",
        order_id: razorpayOrderId,
        handler: async function (razorpayResponse) {
          try {
            console.log(`💰 ${purchaseType} payment successful, creating order...`);
            
            // Step 3: Create order in database based on purchase type
            let orderResp;
            if (isCart) {
              const { data } = await createCartOrder(
                razorpayResponse.razorpay_order_id,
                price.totalPrice + deliveryCharge,
                finalTotal,
                selectedAddress._id,
                phone,
                [selectedAddress.coordinates.lng, selectedAddress.coordinates.lat],
                deliveryCharge
              );
              orderResp = data;
            } else {
              const { data } = await createDirectOrder(
                razorpayResponse.razorpay_order_id,
                itemType,
                itemId,
                quantity,
                selectedAddress._id,
                phone,
                [selectedAddress.coordinates.lng, selectedAddress.coordinates.lat],
                deliveryCharge
              );
              orderResp = data;
            }
        
            console.log(`📦 ${purchaseType} order created:`, orderResp.order._id);
        
            // Step 4: Create payment record
            await createPayment({
              customerId: orderResp.order.userId,
              orderId: orderResp.order._id,
              razorpay_payment_id: razorpayResponse.razorpay_payment_id,
              razorpay_order_id: razorpayResponse.razorpay_order_id,
              razorpay_signature: razorpayResponse.razorpay_signature,
              amount: finalTotal,
              status: "Success",
            });
        
            console.log("💳 Payment record created");
        
            // Step 5: Success actions
            if (isCart) {
              await refreshCartCount();
            }
            
            toast.success(
              isCart 
                ? "Order placed successfully!" 
                : `${itemType === 'product' ? 'Product' : 'Combo'} order placed successfully!`,
              {
                duration: 3000
              }
            );
            
            // 🎯 SIMPLE SOLUTION: Just navigate to orders page
            setLoading(false);
            onClose(); // Close checkout modal
            
            if (isCart && closecart) {
              closecart(); // Close cart if it's a cart purchase
            }
            
            // Navigate to orders page after a short delay
            setTimeout(() => {
              window.location.href = '/user/orders';
              // OR if you're using Next.js router:
              // router.push('/orders');
            }, 1000);
            
          } catch (orderError) {
            console.error(`❌ ${purchaseType} order creation error:`, orderError);
            setLoading(false);
            toast.error("Payment successful but order creation failed. Please contact support.", {
              duration: 6000
            });
          }
        },
        
        modal: {
          ondismiss: function() {
            console.log("Payment modal closed by user");
            setLoading(false);
          }
        },
        prefill: {
          contact: phone,
        },
        theme: {
          color: "var(--primary-color)"
        }
      };

      // Step 6: Open Razorpay payment modal
      console.log(`🚀 Opening ${purchaseType} Razorpay payment modal...`);
      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err) {
      console.error(`❌ ${purchaseType} payment error:`, err);
      
      let errorMessage = "Something went wrong. Please try again.";
      
      // Handle API response errors
      if (err.response?.data) {
        const errorData = err.response.data;
        
        // Service area delivery errors
        if (errorData.message?.includes("Delivery not available") || 
            errorData.message?.includes("outside our current service areas")) {
          errorMessage = `Delivery not available at selected address. Please choose a different address or contact support.`;
          
          // Show detailed error message
          setError({
            type: 'delivery',
            message: errorData.message,
            address: errorData.deliveryAddress?.address || selectedAddress.location,
            nearestServiceArea: errorData.nearestServiceArea
          });
        } 
        // Other API errors
        else if (errorData.message) {
          errorMessage = errorData.message;
        }
      } 
      // Handle direct error messages
      else if (err.message) {
        errorMessage = err.message;
      }
      
      toast.error(errorMessage, {
        duration: 5000,
        position: 'top-center'
      });
      
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        onClick={handleBackdropClick}
      >
        <div 
          className="bg-[var(--background-color)] h-screen ml-auto p-6 max-w-lg w-full overflow-y-auto border-l-2 border-[var(--border-color)] shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl text-[var(--primary-color)] font-bold">
              {isCart ? "Cart Checkout" : `${itemType === 'product' ? 'Product' : 'Combo'} Checkout`}
            </h2>
            <button 
              onClick={onClose}
              className="text-[var(--text-color)] hover:text-[var(--primary-color)] transition-colors p-1"
              disabled={loading || deleteLoading}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {!showAddressForm ? (
            <>
              {/* Purchase Type Indicator */}
              <div className="mb-4 p-3 bg-[var(--background-second-color)] border border-[var(--border-color)] rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="flex-shrink-0">
                    {isCart ? (
                      <svg className="w-5 h-5 text-[var(--secondary-color)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m-2.4 0L5 21h14" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-[var(--secondary-color)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-[var(--primary-color)] text-sm">
                      {isCart ? "Cart Purchase" : "Direct Purchase"}
                    </h3>
                    <p className="text-[var(--text-color)] text-sm">
                      {isCart 
                        ? "Purchasing all items from your cart" 
                        : `${itemType === 'product' ? 'Product' : 'Combo'}: ${itemDetails?.name || itemDetails?.title || 'Selected item'} (Qty: ${quantity})`
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Enhanced Error Display */}
              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <svg className="w-5 h-5 text-red-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-red-800 text-sm">
                        {error.type === 'delivery' ? 'Delivery Not Available' : 'Order Error'}
                      </h4>
                      <p className="text-red-700 text-sm mt-1">{error.message}</p>
                      {error.address && (
                        <p className="text-red-600 text-xs mt-2">
                          <strong>Address:</strong> {error.address}
                        </p>
                      )}
                      {error.nearestServiceArea && (
                        <p className="text-red-600 text-xs mt-1">
                          <strong>Nearest Service Area:</strong> {error.nearestServiceArea.address} 
                          (Max radius: {error.nearestServiceArea.maxDeliveryRadius}km)
                        </p>
                      )}
                    </div>
                    <button 
                      onClick={() => setError(null)}
                      className="flex-shrink-0 text-red-600 hover:text-red-800"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}

              {/* Address Selection with Delete Functionality */}
              <div className="mb-4">
                <label className="font-medium text-[var(--primary-color)]">Select Delivery Address</label>
                <div className="space-y-2 mt-2">
                  {addresses.length > 0 ? (
                    addresses.map(addr => (
                      <div key={addr._id} className={`flex items-start gap-2 p-3 border rounded-lg transition-colors ${
                        selectedAddress?._id === addr._id 
                          ? 'border-[var(--secondary-color)] bg-[var(--background-second-color)]' 
                          : 'border-[var(--border-color)] hover:bg-[var(--background-second-color)]'
                      }`}>
                        <input
                          type="radio"
                          checked={selectedAddress?._id === addr._id}
                          onChange={() => handleAddressSelection(addr)}
                          className="mt-1 accent-[var(--secondary-color)]"
                          disabled={deleteLoading}
                        />
                        <div className="flex-1">
                          <div className="text-sm text-[var(--primary-color)]">
                            {addr.location}, {addr.city}, {addr.state} ({addr.postalCode})
                          </div>
                          <div className="flex gap-2 mt-1">
                            {addr.isDefault && (
                              <span className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                                Default
                              </span>
                            )}
                            {selectedAddress?._id === addr._id && addressValidation && (
                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                addressValidation.isDeliverable 
                                  ? 'text-green-600 bg-green-100' 
                                  : 'text-red-600 bg-red-100'
                              }`}>
                                {addressValidation.isDeliverable 
                                  ? `✓ Delivery Available${addressValidation.serviceArea ? ` (${addressValidation.serviceArea.name})` : ''}` 
                                  : '✗ Delivery Not Available'
                                }
                              </span>
                            )}
                          </div>
                        </div>
                        {/* 🗑️ NEW: Delete Address Button */}
                        <button
                          onClick={() => openDeleteConfirmation(addr)}
                          disabled={deleteLoading || addresses.length === 1}
                          className={`p-1 rounded transition-colors ${
                            addresses.length === 1
                              ? 'text-gray-300 cursor-not-allowed'
                              : 'text-[var(--text-color)] hover:text-red-600'
                          }`}
                          title={addresses.length === 1 ? "Cannot delete last address" : "Delete address"}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-[var(--text-color)] text-sm">No addresses found. Please add an address.</p>
                  )}
                </div>
                
                {/* 🏠 NEW: Add New Address Button with 3 Address Limit */}
                {addresses.length < 3 ? (
                  <button 
                    className="mt-3 text-[var(--secondary-color)] hover:text-[var(--primary-color)] hover:underline text-sm font-medium" 
                    onClick={() => setShowAddressForm(true)}
                    disabled={deleteLoading}
                  >
                    + Add New Address
                  </button>
                ) : (
                  <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-amber-700 text-sm">
                      <strong>Maximum 3 addresses allowed.</strong> Please delete an existing address to add a new one.
                    </p>
                  </div>
                )}
              </div>

              {/* Phone Number */}
              <div className="mb-4">
                <label className="font-medium text-[var(--primary-color)]">Phone Number</label>
                <input
                  className={`w-full border rounded-lg p-3 mt-1 transition-colors bg-[var(--background-second-color)] ${
                    phoneError 
                      ? 'border-red-300 focus:border-red-500' 
                      : 'border-[var(--border-color)] focus:border-[var(--secondary-color)]'
                  }`}
                  type="tel"
                  value={phone}
                  maxLength={10}
                  placeholder="Enter 10-digit phone number"
                  onChange={handlePhoneChange}
                  disabled={deleteLoading}
                  required
                />
                {phoneError ? (
                  <p className="text-sm text-red-500 mt-1">{phoneError}</p>
                ) : (
                  <p className="text-sm text-[var(--text-color)] mt-1">
                    Required for delivery coordination
                  </p>
                )}
              </div>

              {/* Order Summary with Delivery Charges */}
              <div className="mb-6 p-4 bg-[var(--background-second-color)] border border-[var(--border-color)] rounded-lg">
                <h3 className="font-medium mb-2 text-[var(--primary-color)]">Order Summary</h3>
                {isDirect && itemDetails && (
                  <div className="mb-3 pb-3 border-b border-[var(--border-color)]">
                    <div className="flex gap-3">
                      {itemDetails.images?.[0] && (
                        <img 
                          src={process.env.NEXT_PUBLIC_BASE_URL + itemDetails.images[0]} 
                          alt={itemDetails.name || itemDetails.title}
                          className="w-12 h-12 object-cover rounded border border-[var(--border-color)]"
                        />
                      )}
                      <div className="flex-1">
                        <h4 className="font-medium text-sm text-[var(--primary-color)]">{itemDetails.name || itemDetails.title}</h4>
                        <p className="text-xs text-[var(--text-color)]">Quantity: {quantity}</p>
                        {itemType === 'product' && itemDetails.quantity && (
                          <p className="text-xs text-[var(--text-color)]">Size: {itemDetails.quantity}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                <div className="space-y-1 text-sm">
                  {isDirect ? (
                    <>
                      <div className="flex justify-between">
                        <span className="text-[var(--text-color)]">Unit Price:</span>      
                        <span className="text-[var(--primary-color)] font-medium">₹{itemDetails?.price || itemDetails?.comboPrice || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--text-color)]">Quantity:</span>
                        <span className="text-[var(--primary-color)] font-medium">{quantity}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--text-color)]">Subtotal:</span>
                        <span className="text-[var(--primary-color)] font-medium">₹{itemTotal}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between">
                        <span className="text-[var(--text-color)]">Total Price:</span>
                        <span className="text-[var(--primary-color)] font-medium">₹{price.totalPrice}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--text-color)]">Discount:</span>
                        <span className="text-[var(--save-color)] font-medium">-₹{price.totalPrice - price.discountPrice}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--text-color)]">Subtotal:</span>
                        <span className="text-[var(--primary-color)] font-medium">₹{itemTotal}</span>
                      </div>
                    </>
                  )}
                  
                  {/* Delivery charges row */}
                  <div className="flex justify-between">
                    <span className="text-[var(--text-color)]">Delivery Charges:</span>
                    <span className="text-[var(--primary-color)] font-medium">₹{deliveryCharge}</span>
                  </div>
                  
                  {/* Final total */}
                  <div className="flex justify-between font-semibold text-base border-t border-[var(--border-color)] pt-2 mt-2">
                    <span className="text-[var(--primary-color)]">Total Amount:</span>
                    <span className="text-[var(--secondary-color)] font-bold">₹{finalTotal}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  className={`w-full py-3 rounded-lg font-medium transition-all duration-300 ${
                    loading || deleteLoading || !selectedAddress || phone.length !== 10 || phoneError || (addressValidation && !addressValidation.isDeliverable)
                      ? 'bg-gray-400 cursor-not-allowed text-white' 
                      : 'bg-[var(--primary-color)] hover:bg-[var(--primary-second-color)] text-white shadow-md hover:shadow-lg'
                  }`}
                  disabled={loading || deleteLoading || !selectedAddress || phone.length !== 10 || phoneError || (addressValidation && !addressValidation.isDeliverable)}
                  onClick={handlePayment}
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Processing...</span>
                    </div>
                  ) : (
                    `Pay ₹${finalTotal}`
                  )}
                </button>
                
                <button
                  className="w-full py-2 text-[var(--text-color)] hover:text-[var(--primary-color)] hover:underline transition-colors"
                  onClick={onClose}
                  disabled={loading || deleteLoading}
                >
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <AddressForm
              onSave={handleSaveAddress}
              onCancel={() => setShowAddressForm(false)}
            />
          )}
        </div>
        
        <OrderModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          message={`Your ${isCart ? 'cart' : itemType} order has been placed successfully! Thank you for shopping with us.`}
        />
      </div>

      {/* 🗑️ NEW: Delete Address Confirmation Modal */}
      <ActionModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setAddressToDelete(null);
        }}
        onConfirm={handleDeleteAddress}
        title="Delete Address"
        message={`Are you sure you want to delete this address?\n\n${addressToDelete?.location}, ${addressToDelete?.city}, ${addressToDelete?.state} - ${addressToDelete?.postalCode}`}
      />
    </>
  );
};

export default CheckoutModal;
