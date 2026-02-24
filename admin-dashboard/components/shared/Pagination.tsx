"use client";

import React from "react";
import { Button } from "@/components/ui/button";

import { PaginationProps } from "@/app/types/pagination";

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className = "",
}: PaginationProps) {
  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;
  return (
    <div
      className={`flex items-center justify-between mt-4 ${className}`}
      aria-label="Pagination Navigation"
    >
      <div className="text-sm text-muted-foreground">
        Page {currentPage} of {totalPages}
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => hasPrev && onPageChange(currentPage - 1)}
          disabled={!hasPrev}
          aria-disabled={!hasPrev}
          aria-label="Previous page"
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => hasNext && onPageChange(currentPage + 1)}
          disabled={!hasNext}
          aria-disabled={!hasNext}
          aria-label="Next page"
        >
          Next
        </Button>
      </div>
    </div>
  );
}
