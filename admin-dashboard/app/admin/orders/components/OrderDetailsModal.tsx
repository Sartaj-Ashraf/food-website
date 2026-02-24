"use client";
import React from "react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Package,
  User,
  MapPin,
  Phone,
  CreditCard,
  Calendar,
  IndianRupee,
  Tag,
} from "lucide-react";

import { Order } from "@/app/types/order";

interface OrderDetailsModalProps {
  order: Order;
  open: boolean;
  onClose: () => void;
  onStatusUpdate: (orderId: string, status: string) => void;
}

export default function OrderDetailsModal({
  order,
  open,
  onClose,
  onStatusUpdate,
}: OrderDetailsModalProps) {
  const statusOptions = [
    { value: "pending", label: "Pending" },
    { value: "confirmed", label: "Confirmed" },
    { value: "shipped", label: "Shipped" },
    { value: "delivered", label: "Delivered" },
    { value: "cancelled", label: "Cancelled" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Order Details</span>
            <Badge
              className={getStatusColor(order.status)}
              variant="secondary"
            >
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Order ID</p>
                  <p className="text-sm font-mono text-muted-foreground">
                    {order._id}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Order Date</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(order.createdAt), "PPP p")}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <IndianRupee className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Order Value</p>
                  <div className="text-sm text-muted-foreground">
                    <p>Total: ₹{order.totalPrice}</p>
                    <p>Discounted: ₹{order.orderValue}</p>
                    <p className="text-green-600">Saved: ₹{order.savings}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Customer</p>
                  <div className="text-sm text-muted-foreground">
                    <p>{order.customerName}</p>
                    <p>{order.customerEmail}</p>
                    <p>{order.customerPhone}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Delivery Address</p>
                  <div className="text-sm text-muted-foreground">
                    {order.address.address ? (
                      <p>{order.address.address}</p>
                    ) : (
                      <p>{order.address.location}</p>
                    )}
                    <p>{order.deliveryAddress}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Contact Phone</p>
                  <p className="text-sm text-muted-foreground">{order.phone}</p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Payment Info */}
          {order.paymentInfo && (
            <>
              <div>
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="font-medium">Payment Status</p>
                    <Badge
                      className="mt-1"
                      variant={
                        order.paymentStatus === "Success"
                          ? "default"
                          : order.paymentStatus === "Failed"
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {order.paymentStatus}
                    </Badge>
                  </div>
                  <div>
                    <p className="font-medium">Amount Paid</p>
                    <p className="text-sm text-muted-foreground">
                      ₹{order.paymentInfo.amount}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium">Razorpay Payment ID</p>
                    <p className="text-sm font-mono text-muted-foreground">
                      {order.razorpayPaymentId}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium">Razorpay Order ID</p>
                    <p className="text-sm font-mono text-muted-foreground">
                      {order.razorpayOrderId}
                    </p>
                  </div>
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Order Items */}
          <div>
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Package className="h-5 w-5" />
              Order Items ({order.itemsCount})
            </h3>
            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex gap-4">
                    {item.images[0] && (
                      <img
                        src={`http://localhost:5000${item.images[0]}`}
                        alt={item.title}
                        className="w-16 h-16 object-cover rounded"
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{item.title}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline">
                              {item.itemType.charAt(0).toUpperCase() +
                                item.itemType.slice(1)}
                            </Badge>
                            {item.quantityLabel && (
                              <span className="text-sm text-muted-foreground">
                                {item.quantityLabel}
                              </span>
                            )}
                            {item.numberOfPieces && (
                              <span className="text-sm text-muted-foreground">
                                {item.numberOfPieces} pieces
                              </span>
                            )}
                          </div>
                          {item.tags && item.tags.length > 0 && (
                            <div className="flex gap-1 mt-2">
                              {item.tags.map((tag, tagIndex) => (
                                <Badge key={tagIndex} variant="secondary" className="text-xs">
                                  <Tag className="h-3 w-3 mr-1" />
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            ₹{item.discountPrice || item.comboPrice || item.price}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Qty: {item.quantity}
                          </p>
                          <p className="font-medium">
                            Total: ₹
                            {(item.discountPrice || item.comboPrice || item.price || 0) *
                              item.quantity}
                          </p>
                        </div>
                      </div>
                      {item.description && (
                        <p className="text-sm text-muted-foreground mt-2">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Status Update */}
          <div>
            <h3 className="font-semibold mb-4">Update Order Status</h3>
            <div className="flex items-center gap-4">
              <Select
                value={order.status}
                onValueChange={(value) => onStatusUpdate(order._id, value)}
              >
                <SelectTrigger className="w-48">
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
              <p className="text-sm text-muted-foreground">
                Last updated: {format(new Date(order.updatedAt), "PPP p")}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
