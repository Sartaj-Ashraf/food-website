"use client"
import { useState, useEffect } from "react";
import { getUserOrders } from "@/services/orderPaymentServices";
import toast from "react-hot-toast";
import Image from "next/image";

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  const [statusFilter, setStatusFilter] = useState("");
  const [expandedOrder, setExpandedOrder] = useState(null);

  // Fetch orders function
  const fetchOrders = async (page = 1, status = null) => {
    setLoading(true);
    try {
      const { data, error } = await getUserOrders(page, pagination.limit, status);
      console.log(data);
      if (error) {
        console.error("Failed to fetch orders:", error);
        toast.error(error.response?.data?.message || "Failed to load orders");
        return;
      }

      if (data && data.success) {
        setOrders(data.orders || []);
        setPagination({
          ...pagination,
          page: data.pagination.page,
          total: data.pagination.total,
          pages: data.pagination.pages
        });
      } else {
        setOrders([]);
        toast.info("No orders found");
      }
    } catch (err) {
      console.error("Orders fetch error:", err);
      toast.error("Failed to load orders. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchOrders(1, statusFilter || null);
  }, [statusFilter]);

  // Status badge styling
  const getStatusBadge = (status) => {
    const statusStyles = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
      confirmed: "bg-blue-100 text-blue-800 border-blue-300",
      shipped: "bg-purple-100 text-purple-800 border-purple-300",
      delivered: "bg-green-100 text-green-800 border-green-300",
      cancelled: "bg-red-100 text-red-800 border-red-300"
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${statusStyles[status] || statusStyles.pending}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      fetchOrders(newPage, statusFilter || null);
    }
  };

  // Toggle order expansion
  const toggleOrderExpansion = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  return (
    <div className=" bg-gradient-to-br from-orange-50 to-amber-50 pt-24">
      <div className="container mx-auto px-4 py-8 ">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[var(--primary-color)] mb-2">
            My Orders
          </h1>
          <p className="text-gray-600">Track and manage your order history</p>
        </div>

        {/* Filters */}
        <div className="mb-6 bg-white p-4 rounded-lg shadow-xs border border-gray-200">
          <div className="flex flex-wrap gap-3 items-center">
            <label className="text-sm font-medium text-gray-700">Filter by Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)]"
            >
              <option value="">All Orders</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
            
            {orders.length > 0 && (
              <div className="ml-auto text-sm text-gray-600">
                Showing {orders.length} of {pagination.total} orders
              </div>
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary-color)]"></div>
            <span className="ml-3 text-gray-600">Loading orders...</span>
          </div>
        ) : orders.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-lg shadow-xs border border-gray-200 p-12 text-center">
            <div className="mb-4">
              <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Orders Found</h3>
            <p className="text-gray-600 mb-6">
              {statusFilter ? `No ${statusFilter} orders found.` : "You haven't placed any orders yet."}
            </p>
            <button
              onClick={() => window.location.href = '/products'}
              className="px-6 py-3 bg-[var(--primary-color)] text-white rounded-lg hover:bg-[var(--primary-color)]/90 transition-colors font-medium"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          /* Orders List */
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-white rounded-lg shadow-xs border border-gray-200 hover:shadow-sm transition-shadow"
              >
                {/* Order Header */}
                <div 
                  className="p-4 cursor-pointer"
                  onClick={() => toggleOrderExpansion(order._id)}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900">
                          Order #{order._id.slice(-8).toUpperCase()}
                        </h3>
                        {getStatusBadge(order.status)}
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <span>📅 {formatDate(order.createdAt)}</span>
                        <span>📦 {order.items.length} item{order.items.length > 1 ? 's' : ''}</span>
                        <span>💰 ₹{order.finalTotal}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleOrderExpansion(order._id);
                        }}
                        className="text-[var(--primary-color)] hover:text-[var(--primary-color)]/80 font-medium text-sm"
                      >
                        {expandedOrder === order._id ? 'Hide Details' : 'View Details'}
                      </button>
                      <svg 
                        className={`w-5 h-5 text-gray-400 transition-transform ${
                          expandedOrder === order._id ? 'rotate-180' : ''
                        }`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Expanded Order Details */}
                {expandedOrder === order._id && (
                  <div className="border-t border-gray-200">
                    
                    {/* Order Items */}
                    <div className="p-4">
                      <h4 className="font-medium text-gray-900 mb-3">Order Items</h4>
                      <div className="space-y-3">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                            {item.images && item.images[0] && (
                              <div className="relative w-16 h-16 flex-shrink-0">
                                <Image
                                  src={process.env.NEXT_PUBLIC_BASE_URL + item.images[0]}
                                  alt={item.title}
                                  fill
                                  className="object-cover rounded-md"
                                />
                              </div>
                            )}
                            <div className="flex-1">
                              <h5 className="font-medium text-gray-900 text-sm">{item.title}</h5>
                              <div className="flex flex-wrap gap-2 text-xs text-gray-600 mt-1">
                                <span className="bg-white px-2 py-1 rounded border">
                                  {item.itemType === 'product' ? '📦 Product' : '🎁 Combo'}
                                </span>
                                <span className="bg-white px-2 py-1 rounded border">
                                  Qty: {item.quantity}
                                </span>
                                {item.quantityLabel && (
                                  <span className="bg-white px-2 py-1 rounded border">
                                    {item.quantityLabel}
                                  </span>
                                )}
                              </div>
                              <div className="mt-2">
                                <span className="font-semibold text-gray-900">
                                  ₹{item.price || item.comboPrice || 0}
                                </span>
                                {item.discountPrice && item.discountPrice < (item.price || item.comboPrice || 0) && (
                                  <span className="ml-2 text-xs text-gray-500 line-through">
                                    ₹{item.price || item.comboPrice}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Order Summary */}
                    <div className="p-4 bg-gray-50 border-t border-gray-200">
                      <div className="grid md:grid-cols-2 gap-6">
                        
                        {/* Delivery Address */}
                        <div>
                          <h5 className="font-medium text-gray-900 mb-2">Delivery Address</h5>
                          <div className="text-sm text-gray-600 space-y-1">
                            <p>{order.address.address}</p>
                            {/* <p>{order.address.city}, {order.address.state} - {order.address.postalCode}</p>
                            <p>{order.address.country}</p> */}
                            <p className="font-medium text-gray-900">📞 {order.phone}</p>
                          </div>
                        </div>

                        {/* Price Breakdown */}
                        <div>
                          <h5 className="font-medium text-gray-900 mb-2">Price Details</h5>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Subtotal:</span>
                              <span>₹{order.totalDiscountPrice}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Delivery Charges:</span>
                              <span>₹{order.deliveryCharge}</span>
                            </div>
                            {order.totalPrice > order.totalDiscountPrice && (
                              <div className="flex justify-between text-green-600">
                                <span>Discount:</span>
                                <span>-₹{order.totalPrice - order.totalDiscountPrice}</span>
                              </div>
                            )}
                            <div className="flex justify-between font-semibold text-base border-t pt-1 mt-2">
                              <span>Final Total:</span>
                              <span>₹{order.finalTotal}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Payment Status */}
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-700">Payment Status:</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            order.paymentId 
                              ? 'bg-green-100 text-green-800 border border-green-300' 
                              : 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                          }`}>
                            {order.paymentId ? 'Paid' : 'Pending'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && orders.length > 0 && pagination.pages > 1 && (
          <div className="mt-8 flex justify-center items-center gap-2">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            <div className="flex gap-1">
              {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                const page = i + 1;
                const isCurrentPage = page === pagination.page;
                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-2 text-sm font-medium rounded-md ${
                      isCurrentPage
                        ? 'bg-[var(--primary-color)] text-white'
                        : 'border border-gray-300 text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
            </div>
            
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.pages}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
            
            <span className="ml-4 text-sm text-gray-600">
              Page {pagination.page} of {pagination.pages}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
