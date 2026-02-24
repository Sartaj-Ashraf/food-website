"use client";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, Trash, X } from "lucide-react";
import { CartActions } from "@/components";
import DeleteModel from "./DeleteModel";

const ProductCard = ({ onClose, product, quantity, onDelete, onUpdateQuantity }) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const baseUrl = "http://localhost:5000";
  const imageUrl = baseUrl + product?.images?.[0];

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
      onUpdateQuantity(newQuantity);
    }
  };

  return (
    <>
      <div className="w-full bg-white border border-[var(--border-color)]/50 rounded-lg overflow-hidden  transition-all duration-300">
        <div className="flex items-center gap-4 p-2">
          {/* Image Container */}
          <Link onClick={onClose} href={`/shop/${product?.slug}`} className="relative w-24 h-24 md:w-28 md:h-28 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
            <Image
              src={imageUrl}
              alt={product?.title || "Product"}
              fill
              className="object-cover transition-transform duration-300 hover:scale-105"
            />
            
            
            {/* Offer Badge */}
            {product?.price && product?.discountPrice && (
              <div className="absolute top-0 left-0 bg-[var(--save-color)] text-white px-2 py-0.5 text-xs ">
                {Math.round(
                  ((product?.price - product?.discountPrice) / product?.price) * 100
                )}% OFF
              </div>
            )}
         
          </Link>

          {/* Content */}
          <div className="flex-1 flex flex-col justify-between min-h-24 md:min-h-28">
            {/* Product Info */}
            <div className="space-y-1">
              <Link onClick={onClose} href={`/shop/${product?.slug}`} className="font-semibold text-[var(--primary-color)] hover:text-[var(--secondary-color)] text-sm md:text-base line-clamp-2 leading-tight">
                {product?.title || "Premium Chocolate Fudge"}
              </Link>
              
              <p className="text-xs md:text-sm text-gray-600 line-clamp-1">
                {product?.numberOfPieces
                  ? `${product?.numberOfPieces} pieces • ${product?.quantity}`
                  : `${product?.quantity} of premium fudge`}
              </p>
              
              {/* Price */}
              <div className="pt-1">
                {product?.discountPrice ? (
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[var(--primary-color)] text-sm md:text-base">
                      ₹{product?.discountPrice*quantity}
                    </span>
                    <span className="text-[var(--text-color)] text-xs md:text-sm line-through">
                      ₹{product?.price*quantity}
                    </span>
                    {product?.discountPrice && (
                      <span className="text-[var(--save-color)] text-xs font-medium">
                        Save ₹{product?.price*quantity - product?.discountPrice*quantity}
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="font-bold text-gray-900 text-sm md:text-base">
                    ₹{product?.price*quantity}  
                  </span>
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

export default ProductCard;