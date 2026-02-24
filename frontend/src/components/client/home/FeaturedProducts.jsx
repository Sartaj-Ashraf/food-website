"use client";
import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { customFetch } from "@/utils/customFetch";
import { ProductCard } from "@/components";
import { AlertTriangle } from "lucide-react";

const SkeletonProductCard = () => {
  return (
    <div className="animate-pulse w-full h-full flex flex-col bg-white border border-gray-100 rounded-xl overflow-hidden">
      {/* Image placeholder */}
      <div className="relative w-full h-32 md:h-48 bg-gray-200" />

      {/* Content */}
      <div className="p-2 flex flex-col justify-between gap-2 flex-1">
        {/* Title */}
        <div className="h-4 md:h-5 bg-gray-200 rounded w-3/4" />
        {/* Pieces / quantity */}
        <div className="h-3 bg-gray-200 rounded w-1/2" />

        {/* Price */}
        <div className="mt-2 space-y-1">
          <div className="h-4 bg-gray-200 rounded w-1/3" />
          <div className="h-3 bg-gray-200 rounded w-1/4" />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="w-full flex items-center gap-1 p-2 pt-0">
        <div className="h-8 bg-gray-200 rounded-md w-full" />
        <div className="h-8 bg-gray-200 rounded-md w-full" />
      </div>
    </div>
  );
};
const ErrorState = ({ message = "Something went wrong.", onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-4 bg-red-50 border border-red-200 rounded-xl max-w-md mx-auto">
      <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
      <h2 className="text-lg font-semibold text-red-600 mb-2">Error</h2>
      <p className="text-sm text-red-700 mb-6">{message}</p>

      {onRetry && (
        <button
          onClick={onRetry}
          className="bg-[var(--primary-color)] text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-[var(--primary-color)]/90 transition-colors"
        >
          Retry
        </button>
      )}
    </div>
  );
};

const FeaturedProducts = () => {
  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ["featured-products"],
    queryFn: () => customFetch.get("products/featured"),
  });

  const products = data?.data?.products || [];
  if (!products.length && !isLoading) return null

  return (
    <div className="py-16 container mx-auto">
      <h2 className="text-4xl md:text-5xl text-center font-serif text-[var(--primary-color)] py-8">
        Featured Products
      </h2>
      {error && (
        <ErrorState
          message="Error loading products"
          onRetry={() => refetch()}
        />
      )}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {isLoading ? (
          <>
            {Array.from({ length: 4 }).map((_, index) => (
              <SkeletonProductCard key={index} />
            ))}
          </>
        ) : (
          products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))
        )}
      </div>
    </div>
  );
};

export default FeaturedProducts;
