"use client";

import { useState, useEffect, useRef } from "react";

// Custom hook for debounced search
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

// Reusable Sidebar Content — your filters
function SidebarContent({
  filters,
  searchValue,
  setSearchValue,
  handleInputChange,
  handleReset,
  onClose,
}) {
  return (
    <div className=" sticky top-22 z-10 w-full bg-white p-2 mb-20 md:mb-0 md:p-4 md:rounded-lg border border-[var(--border-color)]">
      {/* Top section for modal (show close only in mobile mode) */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold text-[var(--primary-color)]">Filters</h3>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-[var(--primary-color)] transition-colors text-2xl font-bold focus:outline-none"
            aria-label="Close"
            type="button"
          >
            ×
          </button>
        )}
        {!onClose && (
          <button
            onClick={handleReset}
            className="text-xs cursor-pointer px-2 py-1 rounded bg-[var(--primary-color)] text-[var(--white)] hover:bg-[var(--white)] border border-[var(--primary-color)] hover:text-[var(--primary-color)] transition-colors"
            type="button"
          >
            Reset All
          </button>
        )}
      </div>
     {/* search */}
     <div className="hidden md:block mb-2">
        <label className="block text-sm font-medium text-[var(--text-color)] mb-2">
          Search
        </label>
        <input
          type="text"
          placeholder="Search products..."
          value={searchValue}
          onChange={(e) => handleInputChange("search", e.target.value)}
          className="w-full px-2 py-1.5 border border-[var(--border-color)] rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)] focus:border-transparent"
        />
      </div>
    

      {/* Type Filter */}
      {/* <div className="mb-2">
        <label className="block text-sm font-medium text-[var(--text-color)] mb-2">
          Type
        </label>
        <select
          value={filters.type || "all"}
          onChange={(e) => handleInputChange("type", e.target.value)}
          className="w-full px-2 py-1.5 border border-[var(--border-color)] rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)] focus:border-transparent"
        >
          <option value="all">All</option>
          <option value="products">Single Packs</option>
          <option value="combos">Combos</option>
        </select>
      </div> */}

      {/* Featured Filter */}
      <div className="mb-2">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={filters.isFeatured === "true"}
            onChange={(e) => handleInputChange("isFeatured", e.target.checked ? "true" : "")}
            className="mr-2 h-4 w-4 text-[var(--primary-color)] focus:ring-[var(--primary-color)] border-[var(--border-color)] rounded"
          />
          <span className="text-sm font-medium text-[var(--text-color)]">Featured Only</span>
        </label>
      </div>

      {/* Max Price Filter */}
      <div className="mb-2">
        <label className="block text-sm font-medium text-[var(--text-color)] mb-2">
          Max Price
        </label>
        <input
          type="number"
          placeholder="Enter max price"
          value={filters.maxPrice || ""}
          onChange={(e) => handleInputChange("maxPrice", e.target.value)}
          className="w-full px-2 py-1.5 border border-[var(--border-color)] rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)] focus:border-transparent"
          min="0"
          step="0.01"
        />
      </div>

      {/* Sort By */}
      <div className="mb-2">
        <label className="block text-sm font-medium text-[var(--text-color)] mb-2">
          Sort By
        </label>
        <select
          value={filters.sortBy || "createdAt"}
          onChange={(e) => handleInputChange("sortBy", e.target.value)}
          className="w-full px-2 py-1.5 border border-[var(--border-color)] rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)] focus:border-transparent"
        >
          <option value="createdAt">Latest</option>
          <option value="updatedAt">Recently Updated</option>
          <option value="title">Name</option>
        </select>
      </div>
      {/* Only show reset in modal (mobile) */}
      <div className="flex gap-2">
      {onClose && (
        <button
          className="w-full mt-4 bg-[var(--primary-color)] text-white hover:bg-[var(--primary-color)] hover:text-white font-semibold py-2 rounded transition-all"
          type="button"
          onClick={() => {
            handleReset();
            if (onClose) onClose();
          }}
        >
          Reset All
        </button>
      )}
      {/* {applyFilter} */}
      <button
        className="block md:hidden w-full mt-4 bg-[var(--primary-color)] text-white hover:bg-[var(--primary-color)] hover:text-white font-semibold py-2 rounded transition-all"
        type="button"
        onClick={onClose}
        >
        Apply
      </button>
      </div>
    </div>
  );
}

// Main FilterComponent
const FilterComponent = ({ filters, onFilterChange }) => {
  const [showMobile, setShowMobile] = useState(false);
  const [searchValue, setSearchValue] = useState(filters.search || "");
  const debouncedSearch = useDebounce(searchValue, 1000);
  const searchInitialized = useRef(false);

  // Keep searchValue synced with parent prop
  useEffect(() => {
    if (filters.search !== searchValue && !searchInitialized.current) {
      setSearchValue(filters.search || "");
    }
    // eslint-disable-next-line
  }, [filters.search]);

  // On debounced search change, inform parent
  useEffect(() => {
    if (!searchInitialized.current && debouncedSearch === (filters.search || "")) {
      searchInitialized.current = true;
      return;
    }
    if (searchInitialized.current && debouncedSearch !== filters.search) {
      onFilterChange({ ...filters, search: debouncedSearch, page: 1 });
    }
    // eslint-disable-next-line
  }, [debouncedSearch]);

  // Helpers for input change and resetting
  const handleInputChange = (key, value) => {
    if (key === "search") {
      searchInitialized.current = true;
      setSearchValue(value);
      return;
    }
    onFilterChange({ ...filters, [key]: value, page: 1 });
  };

  const handleReset = () => {
    searchInitialized.current = true;
    setSearchValue("");
    onFilterChange({ page: 1, limit: 9 });
  };

  // Close on escape for modal (mobile)
  useEffect(() => {
    if (!showMobile) return;
    const onKey = (e) => e.key === "Escape" && setShowMobile(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showMobile]);

  return (
    <>
      {/* MOBILE: Filter fixed button */}
      <div className="flex w-full gap-2 items-center justify-between md:hidden py-2">
        <button
          onClick={() => setShowMobile(true)}
          className=" w-fit text-sm bg-[var(--primary-color)] text-white font-semibold py-2 px-2 rounded"
        >
          Filter
        </button>
          {/* Search */}
      <div className="w-full">
       
        <input
          type="text"
          placeholder="Search products..."
          value={searchValue}
          onChange={(e) => handleInputChange("search", e.target.value)}
          className="w-full px-2 py-1.5 border border-[var(--border-color)] rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)] focus:border-transparent"
        />
      </div>
      </div>

      {/* DESKTOP: persistent sidebar */}
      <div className="hidden md:block">
        <SidebarContent
          filters={filters}
          searchValue={searchValue}
          setSearchValue={setSearchValue}
          handleInputChange={handleInputChange}
          handleReset={handleReset}
        />
      </div>

      {/* MOBILE: Overlay + Bottom Sheet */}
      {showMobile && (
        <div
          className="fixed z-40 inset-0 bg-black/50 backdrop-blur-[2px] bg-opacity-30 flex justify-center items-end transition-opacity duration-200 md:hidden"
          onClick={() => setShowMobile(false)}
        >
          {/* Sheet */}
          <div
            className="w-full  bg-white shadow-lg p-0 max-h-[90vh] overflow-auto animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            <SidebarContent
              filters={filters}
              searchValue={searchValue}
              setSearchValue={setSearchValue}
              handleInputChange={handleInputChange}
              handleReset={handleReset}
              onClose={() => setShowMobile(false)}
            />
          </div>
        </div>
      )}

      {/* Animation styles */}
      <style jsx>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0%);
            opacity: 1;
          }
        }
        .animate-slideUp {
          animation: slideUp 0.32s cubic-bezier(0.32,0.72,0,1) both;
        }
      `}</style>
    </>
  );
};

export default FilterComponent;
