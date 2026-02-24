import SendEmail from "./SendEmail.js";

const sendOrderUpdateEmail = async ({
  customerName,
  customerEmail,
  order,
  newStatus,
  previousStatus
}) => {
  const {
    _id: orderId,
    items,
    totalDiscountPrice,
    deliveryCharge = parseInt(process.env.DELIVERY_CHARGE) || 150   ,
    finalTotal,
    address,
    phone,
    createdAt
  } = order;

  const statusMessages = {
    confirmed: {
      title: "✅ Order Confirmed!",
      message: "Great news! Your order has been confirmed and we're preparing your delicious fudge.",
      color: "#c9994d",
      nextStep: "We'll notify you once your order is shipped with tracking details.",
      icon: "✅"
    },
    shipped: {
      title: "📦 Order Shipped!",
      message: "Your fudge is on its way! Your order has been dispatched and will reach you soon.",
      color: "#8b6f47",
      nextStep: "Track your package and get ready to enjoy your premium fudge!",
      icon: "📦"
    },
    delivered: {
      title: "🎉 Order Delivered!",
      message: "Your delicious fudge has been delivered! We hope you enjoy every bite.",
      color: "#5A432A",
      nextStep: "Don't forget to leave us a review and share your fudge experience!",
      icon: "🎉"
    },
    cancelled: {
      title: "❌ Order Cancelled",
      message: "Your order has been cancelled as requested. If this was unexpected, please contact our support.",
      color: "#d32f2f",
      nextStep: "Any payment made will be refunded within 5-7 business days.",
      icon: "❌"
    }
  };

  const statusInfo = statusMessages[newStatus] || {
    title: `📋 Order ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`,
    message: `Your order status has been updated to ${newStatus}.`,
    color: "#a0855c",
    nextStep: "We'll keep you updated on any further changes.",
    icon: "📋"
  };

  const orderDate = new Date(createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const emailHTML = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Update</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #F7F2E9;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 20px rgba(90, 67, 42, 0.1);">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #5A432A 0%, #8b6f47 100%); padding: 40px 30px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: 1px;">
                    🍯 MOONLIGHT FUDGE
                </h1>
                <p style="color: #D9AF6B; margin: 10px 0 0 0; font-size: 16px; font-weight: 500;">
                    Premium Artisan Fudge
                </p>
            </div>

            <!-- Status Update Banner -->
            <div style="background-color: ${statusInfo.color}; padding: 25px 30px; text-align: center;">
                <h2 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">
                    ${statusInfo.title}
                </h2>
                <p style="color: #F7F2E9; margin: 10px 0 0 0; font-size: 16px; line-height: 1.5;">
                    ${statusInfo.message}
                </p>
            </div>

            <!-- Content -->
            <div style="padding: 30px;">
                
                <!-- Order Summary -->
                <div style="background-color: #F7F2E9; padding: 25px; border-radius: 12px; margin-bottom: 30px; border: 2px solid #BDB2A1;">
                    <h3 style="color: #5A432A; margin: 0 0 20px 0; font-size: 20px; font-weight: 600; text-align: center;">
                        📋 Order Summary
                    </h3>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                        <div>
                            <p style="margin: 0 0 8px 0; color: #a0855c; font-size: 14px; font-weight: 500;">Order ID:</p>
                            <p style="margin: 0; color: #5A432A; font-size: 16px; font-weight: 600; font-family: monospace; background-color: #e8ddd0; padding: 8px; border-radius: 6px;">
                                #${orderId.toString().slice(-8).toUpperCase()}
                            </p>
                        </div>
                        <div>
                            <p style="margin: 0 0 8px 0; color: #a0855c; font-size: 14px; font-weight: 500;">Order Date:</p>
                            <p style="margin: 0; color: #5A432A; font-size: 16px; font-weight: 600;">${orderDate}</p>
                        </div>
                    </div>
                    
                    <!-- Status Timeline -->
                    <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; border: 1px solid #BDB2A1;">
                        <h4 style="margin: 0 0 15px 0; color: #5A432A; font-size: 16px; font-weight: 600;">Status Update:</h4>
                        <div style="display: flex; align-items: center; gap: 15px;">
                            <div style="background-color: ${statusInfo.color}; color: #ffffff; padding: 8px 15px; border-radius: 20px; font-size: 14px; font-weight: 600; text-transform: capitalize;">
                                ${previousStatus}
                            </div>
                            <div style="color: #a0855c; font-size: 18px;">→</div>
                            <div style="background-color: #5A432A; color: #D9AF6B; padding: 8px 15px; border-radius: 20px; font-size: 14px; font-weight: 600; text-transform: capitalize;">
                                ${newStatus}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Order Items Summary -->
                <div style="background-color: #e8ddd0; padding: 25px; border-radius: 12px; margin-bottom: 30px; border: 2px solid #BDB2A1;">
                    <h3 style="color: #5A432A; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">
                        🛍️ Items in this Order (${items.length})
                    </h3>
                    <div style="background-color: #ffffff; padding: 15px; border-radius: 8px; border: 1px solid #BDB2A1;">
                        ${items.slice(0, 3).map(item => `
                            <div style="display: flex; justify-content: between; align-items: center; padding: 10px 0; border-bottom: 1px solid #F7F2E9;">
                                <div style="flex: 1;">
                                    <p style="margin: 0; color: #5A432A; font-size: 14px; font-weight: 600;">${item.title}</p>
                                    <p style="margin: 5px 0 0 0; color: #a0855c; font-size: 12px;">Qty: ${item.quantity} • ₹${item.discountPrice || item.comboPrice || item.price}</p>
                                </div>
                            </div>
                        `).join('')}
                        ${items.length > 3 ? `
                            <div style="text-align: center; padding: 10px 0; color: #a0855c; font-size: 14px;">
                                +${items.length - 3} more items
                            </div>
                        ` : ''}
                        <div style="padding: 15px 0; margin-top: 10px; border-top: 2px solid #5A432A;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                                <span style="color: #a0855c; font-size: 14px;">Items Total:</span>
                                <span style="color: #5A432A; font-weight: 600;">₹${(finalTotal || totalDiscountPrice) - deliveryCharge}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                                <span style="color: #a0855c; font-size: 14px;">Delivery:</span>
                                <span style="color: #5A432A; font-weight: 600;">₹${deliveryCharge}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; border-top: 1px solid #BDB2A1; padding-top: 8px;">
                                <span style="color: #5A432A; font-size: 18px; font-weight: 700;">Total:</span>
                                <span style="color: #5A432A; font-size: 18px; font-weight: 700;">₹${finalTotal || totalDiscountPrice}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Delivery Address -->
                <div style="background-color: #F7F2E9; padding: 25px; border-radius: 12px; margin-bottom: 30px; border: 2px solid #BDB2A1;">
                    <h3 style="color: #5A432A; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">
                        🚚 Delivery Address
                    </h3>
                    <div style="background-color: #ffffff; padding: 15px; border-radius: 8px; border: 1px solid #BDB2A1;">
                        <p style="margin: 0; color: #5A432A; font-size: 16px; font-weight: 600; line-height: 1.5;">
                            ${address.location}<br>
                            ${address.city}, ${address.state} - ${address.postalCode}<br>
                            Phone: ${phone}
                        </p>
                        <div style="background-color: #c9994d; color: #ffffff; padding: 10px; border-radius: 6px; margin-top: 10px; text-align: center;">
                            <p style="margin: 0; font-size: 14px; font-weight: 600;">
                                📦 Delivery Charges: ₹${deliveryCharge} included in total
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Next Steps */}
                <div style="background-color: ${statusInfo.color}; padding: 25px; border-radius: 12px; text-align: center; color: #ffffff; margin-bottom: 20px;">
                    <h3 style="margin: 0 0 15px 0; font-size: 20px; font-weight: 600;">
                        What's Next?
                    </h3>
                    <p style="margin: 0; font-size: 16px; line-height: 1.6;">
                        ${statusInfo.nextStep}
                    </p>
                </div>

            </div>

            <!-- Footer -->
            <div style="background-color: #5A432A; padding: 30px; text-align: center;">
                <p style="color: #D9AF6B; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">
                    Thank you for choosing Moonlight Fudge! 🌙
                </p>
                <p style="color: #F7F2E9; margin: 0 0 20px 0; font-size: 14px; line-height: 1.6;">
                    Questions about your order? Reply to this email or contact our support team.<br>
                    We're here to help make your fudge experience amazing!
                </p>
                <div style="border-top: 1px solid #8b6f47; padding-top: 20px; margin-top: 20px;">
                    <p style="color: #a0855c; margin: 0; font-size: 12px;">
                        © 2024 Moonlight Fudge. All rights reserved.<br>
                        Premium Artisan Fudge • Made with Love • Delivered Fresh
                    </p>
                </div>
            </div>

        </div>
    </body>
    </html>
  `;

  return SendEmail({
    to: customerEmail,
    subject: `🍯 ${statusInfo.title} - Order #${orderId.toString().slice(-8).toUpperCase()}`,
    html: emailHTML,
  });
};

export default sendOrderUpdateEmail;
