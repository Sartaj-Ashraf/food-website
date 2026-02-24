import SendEmail from "./SendEmail.js";

const sendOrderNotificationToAdmin = async ({
  order,
  customer,
  adminEmail = process.env.EMAIL_USER || 'admin@moonlightfudge.com'
}) => {
  const {
    _id: orderId,
    items,
    totalPrice,
    totalDiscountPrice,
    deliveryCharge = parseInt(process.env.DELIVERY_CHARGE) || 150,
    finalTotal,
    address,
    phone,
    status,
    createdAt
  } = order;

  const subtotal = totalDiscountPrice - deliveryCharge;
  const savings = totalPrice - subtotal;
  const orderDate = new Date(createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  // Items summary for admin
  const itemsSummary = items.map(item => {
    const price = item.discountPrice || item.comboPrice || item.price || 0;
    const total = price * item.quantity;
    return `
      <tr style="border-bottom: 1px solid #BDB2A1;">
        <td style="padding: 12px 8px;">
          <div style="color: #5A432A; font-weight: 600; font-size: 14px;">${item.title}</div>
          <div style="color: #a0855c; font-size: 12px;">${item.itemType} ${item.quantityLabel ? `• ${item.quantityLabel}` : ''}</div>
        </td>
        <td style="padding: 12px 8px; text-align: center; color: #5A432A; font-weight: 600;">₹${price}</td>
        <td style="padding: 12px 8px; text-align: center; color: #5A432A; font-weight: 600;">${item.quantity}</td>
        <td style="padding: 12px 8px; text-align: center; color: #5A432A; font-weight: 600;">₹${total}</td>
      </tr>
    `;
  }).join('');

  const emailHTML = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Order Alert</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #F7F2E9;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 20px rgba(90, 67, 42, 0.1);">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #5A432A 0%, #8b6f47 100%); padding: 30px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">
                NEW ORDER
                </h1>
                <p style="color: #D9AF6B; margin: 10px 0 0 0; font-size: 14px;">
                    Moonlight Fudge Order Management
                </p>
            </div>

            <!-- Alert Banner -->
            <div style="background-color: #c9994d; padding: 20px 30px; text-align: center;">
                <h2 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 600;">
                    📦 New Order Received!
                </h2>
                <p style="color: #F7F2E9; margin: 8px 0 0 0; font-size: 14px;">
                    Order #${orderId.toString().slice(-8).toUpperCase()} • ${orderDate} • ₹${finalTotal || totalDiscountPrice}
                </p>
            </div>

            <!-- Content -->
            <div style="padding: 25px;">

                <!-- Customer Information -->
                <div style="background-color: #e8ddd0; padding: 20px; border-radius: 10px; margin-bottom: 25px; border: 2px solid #BDB2A1;">
                    <h3 style="color: #5A432A; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">
                        👤 Customer Details
                    </h3>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                        <div>
                            <p style="margin: 0 0 5px 0; color: #a0855c; font-size: 12px; font-weight: 500;">Name:</p>
                            <p style="margin: 0; color: #5A432A; font-size: 16px; font-weight: 600;">${customer?.fullName || 'N/A'}</p>
                        </div>
                        <div>
                            <p style="margin: 0 0 5px 0; color: #a0855c; font-size: 12px; font-weight: 500;">Email:</p>
                            <p style="margin: 0; color: #5A432A; font-size: 14px; font-weight: 600;">${customer?.email || 'N/A'}</p>
                        </div>
                        <div>
                            <p style="margin: 0 0 5px 0; color: #a0855c; font-size: 12px; font-weight: 500;">Phone:</p>
                            <p style="margin: 0; color: #5A432A; font-size: 16px; font-weight: 600;">${phone}</p>
                        </div>
                        <div>
                            <p style="margin: 0 0 5px 0; color: #a0855c; font-size: 12px; font-weight: 500;">Customer Phone:</p>
                            <p style="margin: 0; color: #5A432A; font-size: 14px; font-weight: 600;">${customer?.phoneNumber || 'N/A'}</p>
                        </div>
                    </div>
                </div>

                <!-- Order Summary -->
                <div style="background-color: #F7F2E9; padding: 20px; border-radius: 10px; margin-bottom: 25px; border: 2px solid #BDB2A1;">
                    <h3 style="color: #5A432A; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">
                        📋 Order Summary
                    </h3>
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                        <div style="text-align: center;">
                            <p style="margin: 0 0 5px 0; color: #a0855c; font-size: 12px; font-weight: 500;">Order ID:</p>
                            <p style="margin: 0; color: #5A432A; font-size: 14px; font-weight: 600; font-family: monospace;">#${orderId.toString().slice(-8).toUpperCase()}</p>
                        </div>
                        <div style="text-align: center;">
                            <p style="margin: 0 0 5px 0; color: #a0855c; font-size: 12px; font-weight: 500;">Items:</p>
                            <p style="margin: 0; color: #5A432A; font-size: 16px; font-weight: 600;">${items.length}</p>
                        </div>
                        <div style="text-align: center;">
                            <p style="margin: 0 0 5px 0; color: #a0855c; font-size: 12px; font-weight: 500;">Total:</p>
                            <p style="margin: 0; color: #c9994d; font-size: 18px; font-weight: 700;">₹${finalTotal || totalDiscountPrice}</p>
                        </div>
                    </div>
                    
                    <!-- Financial Breakdown -->
                    <div style="background-color: #ffffff; padding: 15px; border-radius: 8px; border: 1px solid #BDB2A1;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                            <span style="color: #a0855c; font-size: 14px;">Items Subtotal:</span>
                            <span style="color: #5A432A; font-weight: 600;">₹${subtotal}</span>
                        </div>
                        ${savings > 0 ? `
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                            <span style="color: #c9994d; font-size: 14px;">Customer Savings:</span>
                            <span style="color: #c9994d; font-weight: 600;">-₹${savings}</span>
                        </div>
                        ` : ''}
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                            <span style="color: #a0855c; font-size: 14px;">Delivery Charges:</span>
                            <span style="color: #5A432A; font-weight: 600;">₹${deliveryCharge}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; padding-top: 8px; border-top: 2px solid #5A432A;">
                            <span style="color: #5A432A; font-size: 16px; font-weight: 600;">Total Revenue:</span>
                            <span style="color: #5A432A; font-size: 18px; font-weight: 700;">₹${finalTotal || totalDiscountPrice}</span>
                        </div>
                    </div>
                </div>

                <!-- Order Items -->
                <div style="background-color: #ffffff; border: 2px solid #BDB2A1; border-radius: 10px; margin-bottom: 25px; overflow: hidden;">
                    <div style="background-color: #5A432A; padding: 15px; text-align: center;">
                        <h3 style="color: #ffffff; margin: 0; font-size: 16px; font-weight: 600;">
                            🛍️ Items to Prepare
                        </h3>
                    </div>
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="background-color: #F7F2E9;">
                                <th style="padding: 12px 8px; text-align: left; color: #5A432A; font-weight: 600; font-size: 14px;">Item</th>
                                <th style="padding: 12px 8px; text-align: center; color: #5A432A; font-weight: 600; font-size: 14px;">Price</th>
                                <th style="padding: 12px 8px; text-align: center; color: #5A432A; font-weight: 600; font-size: 14px;">Qty</th>
                                <th style="padding: 12px 8px; text-align: center; color: #5A432A; font-weight: 600; font-size: 14px;">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsSummary}
                        </tbody>
                    </table>
                </div>

           <!-- Delivery Information -->
<div style="background-color: #e8ddd0; padding: 20px; border-radius: 10px; margin-bottom: 25px; border: 2px solid #BDB2A1;">
    <h3 style="color: #5A432A; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">
        🚚 Delivery Details
    </h3>
    <div style="background-color: #ffffff; padding: 15px; border-radius: 8px; border: 1px solid #BDB2A1;">
        <p style="margin: 0 0 10px 0; color: #5A432A; font-size: 16px; font-weight: 600; line-height: 1.5;">
       ${address.address}
        </p>
        
        ${address.coordinates && address.coordinates.length === 2 ? `
        <!-- Location Coordinates -->
        <div style="background-color: #F7F2E9; padding: 10px; border-radius: 6px; margin: 10px 0; text-align: center;">
            <p style="margin: 0 0 8px 0; color: #a0855c; font-size: 12px; font-weight: 500;">📍 Coordinates:</p>
            <p style="margin: 0; color: #5A432A; font-size: 14px; font-family: monospace; font-weight: 600;">
                ${address.coordinates[1]}, ${address.coordinates[0]}
            </p>
        </div>
        
      <!-- WhatsApp Share Button -->
<div style="text-align: center; margin: 15px 0;">
    <a href="https://api.whatsapp.com/send?text=${encodeURIComponent(`📍 Delivery Location:\n${address.city}, ${address.state} - ${address.postalCode}\n\nGoogle Maps: https://www.google.com/maps?q=${address.coordinates[1]},${address.coordinates[0]}`)}" 
       target="_blank" 
       style="background-color: #25d366; color: white; padding: 12px 20px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 600; display: inline-block;">
        💬 Share Location on WhatsApp
    </a>
</div>

        ` : ''}
        
        <div style="background-color: #c9994d; color: #ffffff; padding: 10px; border-radius: 6px; margin-top: 10px; text-align: center;">
            <p style="margin: 0; font-size: 14px; font-weight: 600;">
                📞 Delivery Contact: ${phone} • Charges: ₹${deliveryCharge}
            </p>
        </div>
    </div>
</div>

                <!-- Action Required -->
                <div style="background-color: #c9994d; padding: 20px; border-radius: 10px; text-align: center; color: #ffffff;">
                    <h3 style="margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">
                        ⚡ Action Required
                    </h3>
                    <p style="margin: 0 0 15px 0; font-size: 14px; line-height: 1.6;">
                        Please log into your admin dashboard to confirm this order and update the customer about preparation timeline.
                    </p>
                </div>

            </div>

            <!-- Footer -->
            <div style="background-color: #5A432A; padding: 25px; text-align: center;">
                <p style="color: #D9AF6B; margin: 0 0 10px 0; font-size: 16px; font-weight: 600;">
                    Moonlight Fudge Admin Dashboard
                </p>
                <p style="color: #a0855c; margin: 0; font-size: 12px;">
                    This is an automated notification. Please do not reply to this email.
                </p>
            </div>

        </div>
    </body>
    </html>
  `;

  return SendEmail({
    to: adminEmail,
    subject: `🔔 NEW ORDER ALERT #${orderId.toString().slice(-8).toUpperCase()} - ₹${finalTotal || totalDiscountPrice} - ${customer?.fullName || 'Customer'}`,
    html: emailHTML,
  });
};

export default sendOrderNotificationToAdmin;
