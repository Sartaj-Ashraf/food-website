import React from "react";
import Image from "next/image";
import Link from "next/link";
import { AddBtn, BookBtn } from "@/components";

const ComboCard = ({ product }) => {
  const baseUrl = "http://localhost:5000";

  return (
    <div className="w-full h-full flex flex-col bg-white border border-gray-100 rounded-xl overflow-hidden transition-all duration-300 hover:border-gray-200">
      {/* Clickable Link Area - Image and Content Only */}
      <Link href={`/shop/${product?.slug}?type=combo`} className="flex-1 flex flex-col">
        {/* Image Container */}
        <div className="relative w-full h-32 md:h-48 bg-gray-50 overflow-hidden">
          <Image
            src={`${baseUrl}${product?.images[0]}`}
            alt={product?.name || "Combo Pack"}
            fill
            className="object-cover transition-transform duration-300 hover:scale-105"
          />

          {/* Featured Badge - Top Right */}
          {product?.isFeatured && (
            <div className="absolute top-0 right-0 z-10 bg-[var(--primary-color)] text-white px-2 py-1 text-[10px] md:text-xs">
              Featured
            </div>
          )}

          {/* Combo Badge - Bottom */}
          <div className="flex items-center justify-between absolute bottom-0 w-full left-0 z-10 bg-gradient-to-r from-amber-500/80 to-amber-600/90 text-white px-2 py-1 text-[10px] md:text-xs text-xs font-medium">
            <span>COMBO</span>
            <p className="text-[var(--white)] text-xs font-medium">
              Save ₹{product?.originalPrice - product?.comboPrice}        
            </p>
          </div>

          {/* Discount Badge - Top Left */}
          {product?.comboPrice &&
            product?.originalPrice &&
            product?.originalPrice > product?.comboPrice && (
              <div className="absolute top-0 left-0 z-10 bg-[var(--save-color)] text-white px-2 py-1 text-[10px] md:text-xs">
                {Math.round(
                  ((product?.originalPrice - product?.comboPrice) /
                    product?.originalPrice) *
                    100
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
        <div className="p-2 flex flex-col justify-between md:gap-1 flex-1">
          <div className="flex flex-col justify-between">
            <h3 className="md:text-lg text-sm font-semibold text-[var(--primary-color)] line-clamp-2">
              {product?.name || "Premium Fudge Combo Pack"}
            </h3>

            {/* Combo Items Description */}
            <p className="md:text-[15px] text-[10px] text-[var(--text-color)] italic">
              {product?.products &&
                product?.populatedProducts &&
                product.populatedProducts.length > 0 &&
                (() => {
                  // Map productId to quantity
                  const quantityMap = Object.fromEntries(
                    product.products.map((p) => [p.productId, p.quantity])
                  );

                  // Prepare item descriptions with quantity
                  const items = product.populatedProducts.map((item) => {
                    const qty = quantityMap[item._id] || 1;
                    const name = item.name || item.title;
                    return `${qty} ${name}`;
                  });

                  // Show first 2 items + remaining count
                  return `Includes: ${items.slice(0, 2).join(" , ")}${
                    items.length > 2 ? ` and ${items.length - 2} more` : ""
                  }`;
                })()}
            </p>
          </div>

          <div className="pt-2">
            {product?.originalPrice &&
            product?.originalPrice > product?.comboPrice ? (
              <div className="flex items-center gap-2 justify-between">
                <div className="flex items-center gap-2">
                  <p className="md:text-xl text-base font-semibold text-[var(--primary-color)]">
                    ₹{product?.comboPrice}
                  </p>
                  <span className="text-[var(--text-color)] text-sm font-semibold line-through">
                    ₹{product?.originalPrice}
                  </span>
                </div>
              </div>
            ) : (
              <p className="md:text-xl text-base font-semibold text-[var(--primary-color)] flex items-center justify-between gap-2">
                ₹{product?.comboPrice}
                <p className="text-[var(--text-color)] text-sm font-medium">
                  save ₹{product?.originalPrice - product?.comboPrice}
                </p>
              </p>
            )}
          </div>
        </div>
      </Link>

      {/* Action Buttons - Outside Link (No Navigation Conflict) */}
      {product?.status === "out_of_stock" ? (
        <div className="w-full mb-0 flex items-center gap-1 p-2 pt-0">
          <p className="w-full text-center text-sm font-semibold text-red-500">Out of Stock</p>
        </div>
      ) : (
        <div className="w-full mb-0 flex flex-col sm:flex-row items-center justify-between gap-1 p-2 pt-0">
          {/* Add to Cart Button */}
          <AddBtn 
            itemId={product._id}
            status={product?.status}
            itemType="combo" 
            quantity={1}
            className="flex text-nowrap items-center justify-center w-full bg-[var(--primary-color)] px-2 py-1 text-white border border-[var(--primary-color)] rounded-md cursor-pointer text-xs transition-colors duration-200 hover:bg-[var(--white)] hover:text-[var(--primary-color)] active:bg-[var(--primary-color)]"
          />
          
          {/* Direct Purchase Button for Combo */}
          <BookBtn 
            name="Buy Now" 
            status={product?.status}
            product={product} // Pass the entire combo object
            itemType="combo" // Specify it's a combo
            quantity={1}
            className="flex text-nowrap items-center w-full gap-1 justify-center bg-[var(--text-color)] px-2 py-1 h-full text-white border border-[var(--text-color)] rounded-md cursor-pointer text-xs transition-colors duration-200 hover:bg-[var(--white)] hover:text-[var(--primary-color)] active:bg-[var(--primary-color)]" 
          />
        </div>
      )}
    </div>
  );
};

export default ComboCard;
