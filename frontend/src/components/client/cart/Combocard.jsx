"use client";
import React, { useState } from "react";
import Image from "next/image";
import { CartActions } from "@/components";
import DeleteModel from "./DeleteModel";
import Link from "next/link";
const Combocard = ({ onClose, product, quantity, onDelete, onUpdateQuantity }) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const baseUrl = "http://localhost:5000";
  const imageUrl = baseUrl + product?.images?.[0];

  console.log({product})

  const handleDelete = () => {
    if (onDelete) {
      onDelete();
    }
    setShowDeleteModal(false);
  };

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity <= 0) {
      setShowDeleteModal(true);
    } else if (onUpdateQuantity) {
      onUpdateQuantity( newQuantity);
    }
  };

  return (
    <>
      <div className="w-full bg-white border  border-[var(--border-color)]/50 rounded-lg overflow-hidden  transition-all duration-300">
        <div className="flex items-center gap-4 p-2 py-auto">
          {/* Image Container */}
          <Link onClick={onClose} href={`/shop/${product?.slug}`} className="relative w-28 h-28 md:w-28 md:h-28 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
            <Image
              src={imageUrl}
              alt={product?.name || "Combo Pack"}
              fill
              className="object-cover transition-transform duration-300 hover:scale-105"
            />
            {/* Combo Badge */}
            <div className="absolute bottom-0 left-0 bg-gradient-to-r from-amber-500 to-amber-600 text-white px-2 py-0.5 text-xs ">
              COMBO
            </div>
            
            {/* Offer Badge */}
            {product?.originalPrice && product?.comboPrice && product?.originalPrice > product?.comboPrice && (
              <div className="absolute top-0 left-0 bg-[var(--save-color)] text-white px-2 py-0.5 text-xs ">
                {Math.round(
                  ((product?.originalPrice - product?.comboPrice) / product?.originalPrice) * 100
                )}% OFF
              </div>
            )}
          </Link>

          {/* Content */}
          <div className="flex-1 flex flex-col justify-between min-h-24 md:min-h-28">
            {/* Product Info */}
            <div className="space-y-1">
              <Link onClick={onClose} href={`/shop/${product?.slug}`} className="font-semibold text-gray-900 text-sm md:text-base line-clamp-2 leading-tight">
                {product?.name || "Premium Fudge Combo Pack"}
              </Link>
              
              {/* Combo Items Description */}
              <p className="text-xs md:text-sm text-gray-600 line-clamp-2">
                {product?.products && 
                 Array.isArray(product.products) && 
                 product.products.length > 0 &&
                 (() => {
                   // Prepare item descriptions with quantity
                   const items = product.products.map((item) => {
                     const qty = item.quantity || 1;
                     const name = item.productId?.name || item.productId?.title || 'Product';
                     return `${qty} ${name}`;
                   });

                   // Show first 2 items + remaining count
                   return `Includes: ${items.slice(0, 2).join(", ")}${
                     items.length > 2 ? ` and ${items.length - 2} more` : ""
                   }`;
                 })()}
              </p>
              
              {/* Price */}
              <div className="pt-1">
                {product?.originalPrice && product?.originalPrice > product?.comboPrice ? (
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[var(--primary-color)] text-sm md:text-base">
                      ₹{product?.comboPrice*quantity}
                    </span>
                    <span className="text-[var(--text-color)] text-xs md:text-sm line-through">
                      ₹{product?.originalPrice*quantity}
                    </span>
                    <span className="text-[var(--save-color)] text-xs font-medium">
                      Save ₹{product?.originalPrice*quantity - product?.comboPrice*quantity}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900 text-sm md:text-base">
                      ₹{product?.comboPrice*quantity}
                    </span>
                    {product?.originalPrice && (
                      <span className="text-[var(--save-color)] text-xs font-medium">
                        Save ₹{product?.originalPrice*quantity - product?.comboPrice*quantity}  
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Cart Actions */}
            <CartActions
              quantity={quantity}
              handleQuantityChange={handleQuantityChange}
              setShowDeleteModal={setShowDeleteModal}
            />
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
       {/* Delete Confirmation Modal */}
       {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/10 backdrop-blur-xs"
            onClick={() => setShowDeleteModal(false)}
          />
          
          {/* Modal Content */}
          <DeleteModel
            showDeleteModal={showDeleteModal}
            setShowDeleteModal={setShowDeleteModal}
            product={product}
            quantity={quantity}
            handleDelete={handleDelete}
            imageUrl={imageUrl}
          />
        </div>
      )}
    </>
  );
};

export default Combocard;