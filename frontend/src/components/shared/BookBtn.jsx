"use client";
import React, { useState } from "react";
import { ShoppingBag } from "lucide-react";
import { CheckoutModal } from "@/components";  
import { AuthModal } from "@/components";
import { useAuth } from "@/hooks/useAuth";

const BookBtn = ({ 
  onClick, 
  className, 
  icon, 
  name, 
  status, 
  product = null,
  itemType = "product", 
  quantity = 1 
}) => {
  const [showCheckout, setShowCheckout] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  

    const { user } = useAuth();
    const isUser = user && user != null && user.userId && user.role !== "guest";
  

  const handleDirectPurchase = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (product) {
      setShowCheckout(true);
    } else if (onClick) {
      onClick(); // Fallback to custom onClick if no product provided
    }
  };

  const handleCloseCheckout = () => {
    setShowCheckout(false);
  };

  const getPrice = () => {
    if (!product) return { totalPrice: 0, discountPrice: 0 };
    
    if (itemType === "product") {
      const unitPrice = product.discountPrice || product.price || 0;
      return {
        totalPrice: product.price * quantity,
        discountPrice: unitPrice * quantity
      };
    } else if (itemType === "combo") {
      return {
        totalPrice: product.originalPrice * quantity,
        discountPrice: product.comboPrice * quantity
      };
    }
    
    return { totalPrice: 0, discountPrice: 0 };
  };

  return (
    <>
      {<button 
        onClick={isUser ? handleDirectPurchase : () => setIsAuthModalOpen(true)} 
        className={className}
        disabled={status === "out_of_stock"}
        aria-disabled={status === "out_of_stock"}
      >
        {icon ? icon : <ShoppingBag className="w-4 h-4" />}
        <span>{name}</span>
      </button>}

      {/* Direct Purchase Checkout Modal */}
      {showCheckout && product && (
        <CheckoutModal
          purchaseType="direct"
          itemType={itemType}
          itemId={product._id}
          quantity={quantity}
          price={getPrice()}
          itemDetails={{
            name: product.title || product.name,
            price: itemType === "product" ? (product.discountPrice || product.price) : undefined,
            comboPrice: itemType === "combo" ? product.comboPrice : undefined,
            images: product.images,
            quantity: product.quantity, // e.g., "100g"
            numberOfPieces: product.numberOfPieces,
          }}
          onClose={handleCloseCheckout}
        />
      )}
      <AuthModal
              isOpen={isAuthModalOpen}
              onClose={() => setIsAuthModalOpen(false)}
              onSuccess={() => setIsAuthModalOpen(false)}
            />
    </>
  );
};

export default BookBtn;
