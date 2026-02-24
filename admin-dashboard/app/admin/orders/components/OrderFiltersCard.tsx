"use client";
import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface OrderFiltersCardProps {
  filters: {
    status: string;
    sortBy: string;
    startDate: string;
    endDate: string;
    minAmount: string;
    maxAmount: string;
    city: string;
    state: string;
    paymentId: string;
  };
  statusOptions: { value: string; label: string }[];
  sortOptions: { value: string; label: string }[];
  onFilterChange: (key: string, value: string) => void;
  onResetFilters: () => void;
}

export default function OrderFiltersCard({
  filters,
  statusOptions,
  sortOptions,
  onFilterChange,
  onResetFilters,
}: OrderFiltersCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Filters</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium mb-2">Status</label>
            <Select
              value={filters.status}
              onValueChange={(value) => onFilterChange("status", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-sm font-medium mb-2">Sort By</label>
            <Select
              value={filters.sortBy}
              onValueChange={(value) => onFilterChange("sortBy", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium mb-2">Start Date</label>
            <Input
              type="date"
              value={filters.startDate}
              onChange={(e) => onFilterChange("startDate", e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">End Date</label>
            <Input
              type="date"
              value={filters.endDate}
              onChange={(e) => onFilterChange("endDate", e.target.value)}
            />
          </div>

          {/* Amount Range */}
          <div>
            <label className="block text-sm font-medium mb-2">Min Amount</label>
            <Input
              type="number"
              placeholder="₹ 0"
              value={filters.minAmount}
              onChange={(e) => onFilterChange("minAmount", e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Max Amount</label>
            <Input
              type="number"
              placeholder="₹ 10000"
              value={filters.maxAmount}
              onChange={(e) => onFilterChange("maxAmount", e.target.value)}
            />
          </div>

          {/* Location Filters */}
          <div>
            <label className="block text-sm font-medium mb-2">City</label>
            <Input
              placeholder="Mumbai, Delhi..."
              value={filters.city}
              onChange={(e) => onFilterChange("city", e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">State</label>
            <Input
              placeholder="Maharashtra, Delhi..."
              value={filters.state}
              onChange={(e) => onFilterChange("state", e.target.value)}
            />
          </div>
        </div>

        {/* Payment ID Filter */}
        <div className="mt-4">
          <label className="block text-sm font-medium mb-2">Payment ID</label>
          <Input
            placeholder="Search by Razorpay Payment ID or Order ID"
            value={filters.paymentId}
            onChange={(e) => onFilterChange("paymentId", e.target.value)}
          />
        </div>

        {/* Reset Button */}
        <div className="mt-6">
          <Button variant="outline" onClick={onResetFilters}>
            Reset All Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
