"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { AddBtn, BookBtn } from "@/components";
const ProductCard = ({ product }) => {
  const baseUrl = "http://localhost:5000";
  const imageUrl = baseUrl + product?.images?.[0];
  return (
    <div
        // href={`/shop/${product?.slug}?type=product`}
      className="w-full h-full flex flex-col  bg-white border border-gray-100 rounded-xl overflow-hidden transition-all duration-300 hover:border-gray-200"
    >
      {/* Image Container */}
      <div className="relative w-full h-32 md:h-48 bg-gray-50 overflow-hidden ">
        <Link href={`/shop/${product?.slug}?type=product`}>
        <Image
          src={imageUrl}
          alt={product?.title || "Product"}
          fill
          className="object-cover transition-transform duration-300 hover:scale-105"
        />
        </Link>

        {/* Featured Badge */}
        {product?.isFeatured && (
          <div className="absolute top-0 right-0 z-10 bg-[var(--primary-color)] text-white px-2 py-1 text-[10px] md:text-xs">
            Featured
          </div>
        )}

        {/* Offer Badge */}
        {product?.price && product?.discountPrice && (
          <div className="absolute top-0 left-0 z-10 bg-[var(--save-color)] text-white px-2 py-1 text-[10px] md:text-xs">
            {Math.round(
              ((product?.price - product?.discountPrice) / product?.price) * 100
            )}
            % Off
          </div>
        )}

        {/* Out of Stock Badge */}
        {product?.status === "out_of_stock" && (
          <div className="absolute inset-0 z-10 bg-[var(--primary-color)]/50 backdrop-blur-[1px] text-white flex items-center justify-center text-lg font-semibold">
            Out of Stock
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-2 flex flex-col justify-between md:gap-1  ">
       <Link href={`/shop/${product?.slug}?type=product`}>
       <h3 className="md:text-lg text-sm font-semibold text-[var(--primary-color)] line-clamp-2">
          {product?.title || "Premium Chocolate Fudge"}
        </h3>
        <p className="md:text-[15px] text-[10px] text-[var(--text-color)] italic">
          {product?.numberOfPieces
            ? `${product?.numberOfPieces} pieces of fudge • ${product?.quantity}`
            : `${product?.quantity} of premium fudge`}
        </p>

        <div>
          {product?.discountPrice ? (
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-1">
              <p className="md:text-lg text-sm font-semibold text-[var(--primary-color)]">
                ₹{product?.discountPrice}
                <span className="text-[var(--text-color)] text-sm font-medium line-through ml-1">
                  ₹{product?.price}
                </span>
              </p>
              <p className=" py-0.5 px-1 rounded text-[var(--save-color)] text-xs ">
                Save ₹{product?.price - product?.discountPrice}
              </p>
            </div>
          ) : (
            <p className="md:text-lg text-sm font-semibold text-[var(--primary-color)]">
              ₹{product?.price}
            </p>
          )}
        </div>
       </Link>
      
      </div>
          {/* Action Buttons */}
          {product?.status === "out_of_stock" ? (
            <div className="w-full mb-0 flex items-center  gap-1 mt-auto p-2 pt-0">
              <p className="w-full text-center text-sm font-semibold text-red-500">Out of Stock</p>
            </div>
          ) : (
          <div className=" w-full mb-0 flex flex-col sm:flex-row items-center  gap-1 mt-auto p-2 pt-0">
           <AddBtn itemId={product._id} status={product?.status}
           itemType="product" 
           quantity={1}
           className="flex text-nowrap items-center justify-center w-full bg-[var(--primary-color)] px-2 py-1 text-white border border-[var(--primary-color)] rounded-md cursor-pointer  text-xs transition-colors duration-200 hover:bg-[var(--white)] hover:text-[var(--primary-color)] active:bg-[var(--primary-color)]"            />
           <BookBtn 
            name="Buy Now" 
            status={product?.status} 
            product={product} // Pass the entire product object
            itemType="product"
            quantity={1}
            className="flex text-nowrap items-center w-full gap-1 justify-center bg-[var(--text-color)] px-2 py-1 h-full text-white border border-[var(--text-color)] rounded-md cursor-pointer text-xs transition-colors duration-200 hover:bg-[var(--white)] hover:text-[var(--primary-color)] active:bg-[var(--primary-color)]" 
          />          </div>
          )}
    </div>
  );  
};

export default ProductCard;
