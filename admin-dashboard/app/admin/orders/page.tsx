"use client";
import { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, Download, BarChart3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import OrderTable from "./components/OrderTable";
import OrderDetailsModal from "./components/OrderDetailsModal";
import OrderFiltersCard from "./components/OrderFiltersCard";
import PaginationComponent from "@/components/shared/Pagination";

// Types
import { Order } from "@/app/types/order";
import { Pagination } from "@/app/types/pagination";

import { customFetch } from "@/utils/customFetch";

const STATUS_OPTIONS = [
  { value: "all", label: "All Status" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "amount_high", label: "Amount: High to Low" },
  { value: "amount_low", label: "Amount: Low to High" },
  { value: "status", label: "Status" },
];

export default function AdminOrdersPage() {
  // State
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    totalPages: 1,
    totalDocs: 0,
    hasNext: false,
    hasPrev: false,
  });

  // Search and Filters
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    status: "all",
    sortBy: "newest",
    startDate: "",
    endDate: "",
    minAmount: "",
    maxAmount: "",
    city: "",
    state: "",
    paymentId: "",
  });
  const [showFilters, setShowFilters] = useState(false);

  // Modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  // Stats
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
    totalSavings: 0,
  });

  const { toast } = useToast();

  // Fetch orders
  const fetchOrders = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "10",
        ...(search && { search }),
        ...(filters.status !== "all" && { status: filters.status }),
        ...(filters.sortBy && { sortBy: filters.sortBy }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
        ...(filters.minAmount && { minAmount: filters.minAmount }),
        ...(filters.maxAmount && { maxAmount: filters.maxAmount }),
        ...(filters.city && { city: filters.city }),
        ...(filters.state && { state: filters.state }),
        ...(filters.paymentId && { paymentId: filters.paymentId }),
      });

      const res = await customFetch.get(`/orderPayment/all/orders?${params}`);
      const data = res.data;
      
      setOrders(data.orders || []);
      setPagination({
        currentPage: data.pagination.currentPage,
        totalPages: data.pagination.totalPages,
        totalDocs: data.pagination.totalDocs,
        hasNext: data.pagination.hasNextPage,
        hasPrev: data.pagination.hasPrevPage,
      });
    } catch (err) {
      console.error("Fetch orders error:", err);
      setOrders([]);
      toast({ title: "Failed to fetch orders", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // Fetch order statistics
  const fetchOrderStats = async () => {
    try {
      const res = await customFetch.get("/orderPayment/orders/stats");
      if (res.data?.stats) {
        setStats(res.data.stats);
      }
    } catch (err) {
      console.error("Fetch stats error:", err);
    }
  };

  useEffect(() => {
    fetchOrders(1);
    fetchOrderStats();
    // eslint-disable-next-line
  }, [search, filters]);

  useEffect(() => {
    fetchOrders(pagination.currentPage);
    // eslint-disable-next-line
  }, [pagination.currentPage]);

  // Handlers
  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      status: "all",
      sortBy: "newest",
      startDate: "",
      endDate: "",
      minAmount: "",
      maxAmount: "",
      city: "",
      state: "",
      paymentId: "",
    });
    setSearch("");
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  };

  const openOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      await customFetch.patch(`/orderPayment/orders/${orderId}/status`, {
        status: newStatus,
      });
      toast({ title: "Order status updated successfully" });
      fetchOrders(pagination.currentPage);
    } catch (err) {
      toast({ title: "Failed to update order status", variant: "destructive" });
    }
  };

  const exportOrders = async () => {
    try {
      // Implementation for export functionality
      toast({ title: "Export functionality coming soon!" });
    } catch (err) {
      toast({ title: "Export failed", variant: "destructive" });
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Order Management</h1>
          <p className="text-muted-foreground">
            Manage and monitor all customer orders
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportOrders}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>

    
      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-4 h-4" />
            Search Orders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Search by customer name, email, phone, order ID, payment ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="min-w-[300px]"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => setSearch("")}
            >
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      {showFilters && (
        <OrderFiltersCard
          filters={filters}
          statusOptions={STATUS_OPTIONS}
          sortOptions={SORT_OPTIONS}
          onFilterChange={handleFilterChange}
          onResetFilters={handleResetFilters}
        />
      )}

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Orders ({pagination.totalDocs})</CardTitle>
          <CardDescription>
            Showing {orders.length} of {pagination.totalDocs} orders
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OrderTable
            orders={orders}
            loading={loading}
            onOrderClick={openOrderDetails}
            onStatusUpdate={handleStatusUpdate}
          />
          <PaginationComponent
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
          />
        </CardContent>
      </Card>

      {/* Order Details Modal */}
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          open={showOrderDetails}
          onClose={() => setShowOrderDetails(false)}
          onStatusUpdate={handleStatusUpdate}
        />
      )}
    </div>
  );
}
