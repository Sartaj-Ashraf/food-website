"use client";

import React, { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

import {
  ComboCard,
  FilterComponent,
  PaginationComponent,
  ProductCard,
} from "@/components";
import { customFetch } from "@/utils/customFetch";

// Fetch function for React Query - gets products using filter params
const fetchProducts = async (filters) => {
  const queryParams = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== "" && value !== null && value !== undefined) {
      queryParams.append(key, value.toString());
    }
  });
  const { data } = await customFetch.get(
    `/products/all?${queryParams.toString()}`
  );
  return data;
};

const ShopPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Parse filters from URL search parameters, with defaults for page & limit
  const filters = React.useMemo(() => {
    const newFilters = {};
    searchParams.forEach((value, key) => {
      if (["page", "limit"].includes(key)) {
        newFilters[key] = parseInt(value) || (key === "page" ? 1 : 9);
      } else {
        newFilters[key] = value;
      }
    });
    if (!newFilters.page) newFilters.page = 1;
    if (!newFilters.limit) newFilters.limit = 9;
    return newFilters;
  }, [searchParams]);

  // Update URL query params on filter change
  const updateURL = React.useCallback(
    (newFilters) => {
      const params = new URLSearchParams();
      Object.entries(newFilters).forEach(([key, value]) => {
        if (value !== "" && value !== null && value !== undefined) {
          params.set(key, value.toString());
        }
      });
      router.push(`${window.location.pathname}?${params.toString()}`, {
        scroll: false,
      });
    },
    [router]
  );

  // Handle filter changes by updating URL
  const handleFilterChange = React.useCallback(
    (newFilters) => {
      updateURL(newFilters);
    },
    [updateURL]
  );

  // Handle page changes for pagination
  const handlePageChange = React.useCallback(
    (newPage) => {
      const newFilters = { ...filters, page: newPage };
      handleFilterChange(newFilters);
    },
    [filters, handleFilterChange]
  );

  // Use React Query's useQuery hook for fetching products with filters as the key
  const { data, error, refetch } = useQuery({
    queryKey: ["products", filters],
    queryFn: () => fetchProducts(filters),
    // keepPreviousData: true,
  });

  // Extract data safely
  const products = data?.items || [];
  const pagination = data?.pagination || null;
  const totalCounts = data?.counts || null;

  return (
    <section className="py-24">
      <div className="container flex items-center text-base text-[var(--primary-color)] mb-10">
        <Link href="/">Home</Link> <ChevronRight size={20} /> <span> Shop</span>
      </div>

      <div className="container mx-auto px-4">
        <div className="md:flex gap-6">
          {/* Filter Sidebar */}
          <FilterComponent
            filters={filters}
            onFilterChange={handleFilterChange}
            totalCounts={totalCounts}
          />

          {/* Main Content */}
          <div className="flex-1">
            {/* Error State */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
                <p className="text-[var(--delete-color)]">
                  {error.message ||
                    "Failed to fetch products. Please try again."}
                </p>
                <button
                  onClick={() => refetch()}
                  className="mt-2 text-[var(--delete-color)] hover:text-[var(--delete-color-hover)] underline"
                >
                  Try again
                </button>
              </div>
            )}

            {/* Results Header */}
            {!error && (
              <div className="flex justify-between items-center mb-6">
                <p className="text-sm text-gray-600">
                  Showing {products.length} of {totalCounts?.total || 0} results
                  {filters.search && ` for "${filters.search}"`}
                </p>
              </div>
            )}

            {/* Products Grid */}
            {!error && (
              <>
                {products.length > 0 ? (
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    {products.map((product) => {
                      if (product.itemType === "product") {
                        return (
                          <ProductCard key={product._id} product={product} />
                        );
                      }
                      if (product.itemType === "combo") {
                        return (
                          <ComboCard key={product._id} product={product} />
                        );
                      }
                      return null;
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500 text-lg mb-2">
                      No products found
                    </p>
                    <p className="text-gray-400">Try adjusting your filters</p>
                  </div>
                )}

                {/* Pagination */}
                <PaginationComponent
                  pagination={pagination}
                  onPageChange={handlePageChange}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ShopPage;
