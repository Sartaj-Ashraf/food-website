"use client";
import { useState } from "react";
import { QuantitySelector } from "./QuantitySelector";
import { useAuth } from "@/hooks/useAuth";
import { useCartCount } from "@/hooks/useCartCount";
import { AddBtn, BookBtn } from "..";
import { ShoppingBag } from "lucide-react";

const comboDescription = (product) => {
  return (
    <p className="md:text-lg text-sm text-[var(--text-color)] mb-2">
      {product && product.length > 0 && (
        <>
          {"Includes: "}
          {(() => {
            // Step 1: Create a mapping from product ID to quantity
            const quantityMap = Object.fromEntries(
              product.map((p) => [p.productId, p.quantity])
            );

            // Step 2: Prepare display strings like "2 Moonlight Fudge"
            const items = product.map((item) => {
              const qty = quantityMap[item._id] || 1; // default to 1 if not found
              const name =
                item.productId.name ||
                item.productId.title ||
                "Unnamed Product";
              return `${qty} ${name}`;
            });
            return `${items.join(", ")}`;
          })()}
        </>
      )}
    </p>
  );
};

export default function ProductDetailsSection({
  title,
  price,
  discountPrice,
  itemId,
  itemType,
  product,
  status,
  // Additional props for better direct purchase integration
  images = [],
  name = null,
  slug = null,
  quantity: productQuantity = null, // e.g., "100g"
  numberOfPieces = null,
  originalPrice = null, // for combos
  comboPrice = null, // for combos
  description = null,
}) {
  const { user } = useAuth();
  const isUser = user && user != null && user.userId && user.role !== "guest";
  console.log({ product });
  const { updateCartCount } = useCartCount();
  const [quantity, setQuantity] = useState(1);

  // Prepare item details for CheckoutModal
  const getItemDetails = () => {
    const baseDetails = {
      _id: itemId,
      slug: slug,
      images: images,
      status: status,
    };

    if (itemType === "product") {
      return {
        ...baseDetails,
        title: title || name,
        name: title || name,
        price: price,
        discountPrice: discountPrice,
        quantity: productQuantity, // e.g., "100g"
        numberOfPieces: numberOfPieces,
      };
    } else if (itemType === "combo") {
      return {
        ...baseDetails,
        name: title || name,
        title: title || name,
        originalPrice: originalPrice || price,
        comboPrice: comboPrice || discountPrice || price,
        products: product, // combo products array
        populatedProducts: product, // assuming it's already populated
      };
    }

    return baseDetails;
  };

  // Calculate final price based on item type
  const getFinalPrice = () => {
    if (itemType === "product") {
      return discountPrice || price;
    } else if (itemType === "combo") {
      return comboPrice || discountPrice || price;
    }
    return price;
  };

  return (
    <div className="space-y-6 flex flex-col  justify-center">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--primary-color)] mb-2">
          {title}
        </h1>
        
        {itemType === "combo" ? (
          comboDescription(product)
        ) : (
          <p className="md:text-lg text-sm text-[var(--text-color)] mb-2">
            {product?.numberOfPieces || numberOfPieces
              ? `${product?.numberOfPieces || numberOfPieces} Pieces of Fudge • ${product?.quantity || productQuantity}`
              : `${product?.quantity || productQuantity} of Premium Fudge`}
          </p>
        )}
        
        {discountPrice && (
          <div className="bg-[var(--save-color)] text-white text-xs px-2 py-1 rounded inline-block">
            <span>Save ₹{price - discountPrice} </span>
          </div>
        )}
      </div>

      {/* Pricing */}
      <div className="space-y-2">
        {discountPrice ? (
          <div className="text-sm font-medium text-[var(--text-color)]">
            M.R.P: Rs. <span className="font-medium"> {price}</span>
          </div>
        ) : null}
        
        <div className="flex items-baseline gap-2">
          <span className="text-sm text-[var(--text-color)]">Offer Price:</span>
          {discountPrice ? (
            <span className="text-2xl font-bold text-[var(--primary-color)]">
              Rs. {discountPrice}
            </span>
          ) : (
            <span className="text-2xl font-bold text-[var(--primary-color)]">
              Rs. {price}
            </span>
          )}
          <span className="text-sm text-[var(--text-color)]">
            (incl. of all taxes)
          </span>
        </div>
        <p className="text-[var(--text-color)] leading-relaxed">{description}</p>
      </div>

      {/* Quantity Selector */}
      <div>
        <label className="block text-sm font-medium text-[var(--text-color)] mb-2">
          Quantity:
        </label>
        <QuantitySelector value={quantity} onChange={setQuantity} />
      </div>

      {/* Action Buttons */}
      {status === "out_of_stock" ? (
        <div className="w-full mb-0 flex items-center gap-1 mt-auto p-2 pt-0">
          <p className="w-full text-center text-base font-semibold text-red-500">
            Out of Stock
          </p>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Add to Cart Button */}
          <AddBtn 
            itemId={itemId}
            itemType={itemType} 
            quantity={quantity}
            status={status}
            className="flex items-center justify-center bg-[var(--primary-color)] text-white py-2 px-6 rounded-lg hover:bg-[var(--text-color)] transition-colors font-medium"
          />
          
          {/* Direct Purchase Button */}
          <BookBtn  
            name={`Buy ${quantity > 1 ? `${quantity} ` : ""}Now`}
            icon={<ShoppingBag className="w-5 h-5" />}
            status={status}
            product={getItemDetails()} // Pass complete item details
            itemType={itemType}
            quantity={quantity} // Pass selected quantity
            className="flex gap-2 items-center justify-center bg-[var(--primary-color)] text-white py-2 px-6 rounded-lg hover:bg-[var(--text-color)] transition-colors font-medium" 
          />
        </div>
        
      )}
    </div>
  );
}
