export interface Order {
    _id: string;
    userId: string;
    items: OrderItem[];
    status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
    paymentId?: string;
    totalPrice: number;
    totalDiscountPrice: number;
    address: {
      address?: string;
      location: string;
      city?: string;
      state?: string;
      postalCode?: string;
      country?: string;
      coordinates: [number, number];
    };
    phone: string;
    createdAt: string;
    updatedAt: string;
    
    // Computed fields from backend
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    paymentStatus: string;
    razorpayPaymentId: string;
    razorpayOrderId: string;
    orderValue: number;
    savings: number;
    itemsCount: number;
    deliveryAddress: string;
    
    // Populated fields
    userInfo?: {
      _id: string;
      fullName: string;
      email: string;
      phoneNumber: string;
    };
    paymentInfo?: {
      _id: string;
      razorpay_payment_id: string;
      razorpay_order_id: string;
      status: string;
      amount: number;
      createdAt: string;
    };
  }
  
  export interface OrderItem {
    itemType: "product" | "combo";
    itemId: string;
    quantity: number;
    title: string;
    slug: string;
    price?: number;
    discountPrice?: number;
    comboPrice?: number;
    images: string[];
    description: string;
    quantityLabel?: string;
    numberOfPieces?: number;
    tags?: string[];
  }
  