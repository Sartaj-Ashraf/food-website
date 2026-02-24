"use client";
import React from "react";
import { useState } from "react";
import NumberModal from "@/components/numberModal";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Eye, MoreHorizontal, Package, User, CreditCard } from "lucide-react";

import { Order } from "@/app/types/order";

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

const getPaymentStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "success":
      return "bg-green-100 text-green-800";
    case "failed":
      return "bg-red-100 text-red-800";
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

interface OrderTableProps {
  orders: Order[];
  loading: boolean;
  onOrderClick: (order: Order) => void;
  onStatusUpdate: (orderId: string, status: string) => void;
}


export default function OrderTable({
  orders,
  loading,
  onOrderClick,
  onStatusUpdate,
}: OrderTableProps) {
  const statusOptions = [
    { value: "pending", label: "Pending" },
    { value: "confirmed", label: "Confirmed" },
    { value: "shipped", label: "Shipped" },
    { value: "delivered", label: "Delivered" },
    { value: "cancelled", label: "Cancelled" },
    {value:"share",label: "share"}
  ];
  
  const [shareModal,setShareModal]=useState(false);
  const [shareOrder, setShareOrder] = useState<Order | null>(null);

  function handleShare(order:Order){
    setShareOrder(order);
    setShareModal(true);
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Items</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Payment</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center">
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              </TableCell>
            </TableRow>
          ) : orders.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={8}
                className="text-center text-muted-foreground py-8"
              >
                No orders found.
              </TableCell>
            </TableRow>
          ) : (
            orders.map((order) => (
              <TableRow key={order._id} className="hover:bg-gray-50">
                <TableCell className="font-mono text-sm">
                  {order._id.slice(-8).toUpperCase()}
                </TableCell>
                
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{order.customerName}</span>
                    <span className="text-sm text-muted-foreground">
                      {order.customerEmail}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {order.customerPhone}
                    </span>
                  </div>
                </TableCell>
                
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{order.itemsCount}</span>
                    <span className="text-sm text-muted-foreground">
                      {order.itemsCount === 1 ? "item" : "items"}
                    </span>
                  </div>
                </TableCell>
                
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">₹{order.orderValue}</span>
                    {order.savings > 0 && (
                      <span className="text-sm text-green-600">
                        Saved ₹{order.savings}
                      </span>
                    )}
                  </div>
                </TableCell>
                
                <TableCell>
                  <Badge
                    className={getStatusColor(order.status)}
                    variant="secondary"
                  >
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </Badge>
                </TableCell>
                
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <Badge
                      className={getPaymentStatusColor(order.paymentStatus)}
                      variant="secondary"
                    >
                      {order.paymentStatus}
                    </Badge>
                    {order.razorpayPaymentId !== "N/A" && (
                      <span className="text-xs font-mono text-muted-foreground">
                        {order.razorpayPaymentId.slice(-8)}
                      </span>
                    )}
                  </div>
                </TableCell>
                
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-sm">
                      {format(new Date(order.createdAt), "MMM dd")}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(order.createdAt), "hh:mm a")}
                    </span>
                  </div>
                </TableCell>
                
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onOrderClick(order)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        {statusOptions
                          .filter(status => status.value !== order.status)
                          .map((status) => (
                            <DropdownMenuItem
                              key={status.value}
                              onClick={() => {
                                      if (status.value === "share") {
                                        handleShare(order)
                                      } else {
                                        onStatusUpdate(order._id, status.value)
                                      }
                                    }}
                            >
                             { status.label=="share"?`${status.label} address details`:`update to ${status.label}`}                           
                             
                            </DropdownMenuItem>
                          ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      {shareModal && <NumberModal onClose={()=>setShareModal(false)} order={shareOrder!}/>}
    </div>
  );
}
