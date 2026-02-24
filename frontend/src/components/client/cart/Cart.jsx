"use client";

import React, { useEffect, useState } from "react";
import { X, ShoppingBag, Trash2, ShoppingCart } from "lucide-react";
import {
  getCart,
  removeFromCart,
  updateCartItem,
  getCart_localstorage,
  updatecart_localstorage,
  removeFromCart_localstorage,
  clearCart,
  clearCart_localstorage,
} from "@/services/cartServices";
import { useAuth } from "@/hooks/useAuth";
import { useCartCount } from "@/hooks/useCartCount";
import ClearCartModal from "./ClearCartModal";
import { ProductCartCard, ComboCartCard, CheckoutModal, AuthModal } from "@/components";

// Skeleton Loading Components
const CartItemSkeleton = () => (
  <div className="bg-white/50 p-3 rounded-lg animate-pulse">
    <div className="flex gap-3">
      <div className="w-16 h-16 bg-gray-300 rounded-lg flex-shrink-0"></div>
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-300 rounded w-3/4"></div>
        <div className="h-3 bg-gray-300 rounded w-1/2"></div>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-300 rounded"></div>
            <div className="w-6 h-4 bg-gray-300 rounded"></div>
            <div className="w-8 h-8 bg-gray-300 rounded"></div>
          </div>
          <div className="w-8 h-8 bg-gray-300 rounded"></div>
        </div>
      </div>
    </div>
  </div>
);

const CartSkeleton = () => (
  <div className="space-y-3 pb-2">
    {[...Array(3)].map((_, index) => (
      <CartItemSkeleton key={index} />
    ))}
  </div>
);

const Cart = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { refreshCartCount } = useCartCount();
  const isUser = !!(user && user.userId && user.role !== "guest");

  const [cartItems, setCartItems] = useState([]);
  const [totalQuantity, setTotalQuantity] = useState(0);
  const [loading, setLoading] = useState(true);
  const [clearCartLoading, setClearCartLoading] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [price, setPrice] = useState({ totalPrice: 0, discountPrice: 0 });
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  

  const fetchCart = async (addloading = true) => {
    if (addloading) setLoading(true);
    try {
      const { data } = isUser ? await getCart() : await getCart_localstorage();
      setTotalQuantity(data.cart.totalQuantity);
      setPrice({ totalPrice: data.cart.totalPrice, discountPrice: data.cart.discountPrice });
      setCartItems(data.cart.items);
      await refreshCartCount();
    } catch (err) {
      console.error("Fetch cart failed:", err);
    } finally {
      if (addloading) setLoading(false);
    }
  };

  const deleteItem = async (itemId, itemType) => {
    setLoading(true);
    try {
      if (isUser) await removeFromCart(itemId, itemType);
      else await removeFromCart_localstorage(itemId, itemType);
      await fetchCart(false);
      await refreshCartCount();
    } catch (err) {
      console.error("Delete item failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId, itemType, quantity) => {
    setLoading(true);
    try {
      if (isUser) await updateCartItem(itemId, itemType, quantity);
      else await updatecart_localstorage(itemId, itemType, quantity);
      await fetchCart(false);
      await refreshCartCount();
    } catch (err) {
      console.error("Update quantity failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleClearCart = async () => {
    setClearCartLoading(true);
    try {
      if (isUser) await clearCart();
      else await clearCart_localstorage();
      await fetchCart(false);
      await refreshCartCount();
      setShowClearModal(false);
    } catch (err) {
      console.error("Clear cart failed:", err);
    } finally {
      setClearCartLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) fetchCart(true);
  }, [isOpen]);

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
        />
      )}

      {/* Cart Sidebar */}
      <div
        className={`fixed z-50 top-0 right-0 h-screen w-full sm:w-96 shadow-2xl transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="bg-[var(--background-color)] p-2 h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-1 py-3 flex-shrink-0 border-b border-[var(--border-color)]/50">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-[var(--primary-color)]" />
              <h2 className="text-base font-semibold text-[var(--primary-color)]">
                Shopping Cart {totalQuantity > 0 && `- ${totalQuantity} item${totalQuantity > 1 ? "s" : ""}`}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              {cartItems.length > 0 && !loading && (
                <button
                  onClick={() => setShowClearModal(true)}
                  className="p-2 cursor-pointer text-[var(--delete-color)] hover:bg-[var(--delete-color-hover)] rounded-lg transition-colors duration-300"
                  title="Clear Cart"
                >
                  <Trash2 className="w-4.5 h-4.5" />
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 cursor-pointer hover:text-[var(--primary-color)] transition-colors duration-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Cart Content */}
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="flex-1 overflow-y-auto px-1 -mx-1" style={{ scrollbarWidth: "thin" }}>
              {loading ? (
                <CartSkeleton />
              ) : cartItems.length > 0 ? (
                <div className="space-y-2 pb-2">
                  {cartItems.map((item) =>
                    item.itemType === "product" ? (
                      <ProductCartCard
                        key={`product-${item.productId}`}
                        onClose={onClose}
                        product={item.itemId}
                        quantity={item.quantity}
                        onDelete={() => deleteItem(item.itemId._id, item.itemType)}
                        onUpdateQuantity={(newQuantity) => updateQuantity(item.itemId._id, item.itemType, newQuantity)}
                      />
                    ) : item.itemType === "combo" ? (
                      <ComboCartCard
                        key={`combo-${item.productId}`}
                        onClose={onClose}
                        product={item.itemId}
                        quantity={item.quantity}
                        onDelete={() => deleteItem(item.itemId._id, item.itemType)}
                        onUpdateQuantity={(newQuantity) => updateQuantity(item.itemId._id, item.itemType, newQuantity)}
                      />
                    ) : null
                  )}
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg mb-2">Your cart is empty</p>
                    <p className="text-gray-400 text-sm">Add some items to get started</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Price and Checkout */}
          <div className="border-t border-[var(--border-color)]/20 flex-shrink-0 p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[var(--text-color)]">Total</p>
              {loading ? (
                <div className="h-6 bg-gray-300 rounded w-20 animate-pulse"></div>
              ) : (
                <p className="text-[var(--primary-color)] text-lg font-bold">
                  <span className="text-xs font-medium text-[var(--text-color)] line-through">₹{price.totalPrice}</span> ₹{price.discountPrice}
                </p>
              )}
            </div>
           { isUser ?<button
              className={`cursor-pointer w-full py-3 bg-[var(--primary-color)] text-[var(--white)] rounded-lg font-medium transition-opacity duration-300 ${
                loading || cartItems.length === 0 ? "opacity-50 cursor-not-allowed" : "hover:opacity-90"
              }`}
              disabled={loading || cartItems.length === 0}
              onClick={() => setShowCheckoutModal(true)}
            >
              {loading ? "Loading..." : "Checkout"}
            </button> : <button
              className={`cursor-pointer w-full py-3 bg-[var(--primary-color)] text-[var(--white)] rounded-lg font-medium transition-opacity duration-300 ${
                loading || cartItems.length === 0 ? "opacity-50 cursor-not-allowed" : "hover:opacity-90"
              }`}
              disabled={loading || cartItems.length === 0}
              onClick={() => setShowAuthModal(true)}
            >
              login to checkout
            </button> }
          </div>
        </div>

        <ClearCartModal
          isOpen={showClearModal}
          onClose={() => setShowClearModal(false)}
          onConfirm={handleClearCart}
          loading={clearCartLoading}
        />
      </div>

      {/* Checkout Modal */}
      {showCheckoutModal && (
        <CheckoutModal
          onClose={() =>  setShowCheckoutModal(false)}
          price={price}
          cartItems={cartItems}
          closecart={onClose}
        />
      )}
      {/* Auth Modal */}
      {showAuthModal && (
         <AuthModal
              isOpen={showAuthModal}
              onClose={() => setShowAuthModal(false)}
              onSuccess={() => setShowAuthModal(false)}
            />
      )}
    </>
  );
};

export default Cart;
