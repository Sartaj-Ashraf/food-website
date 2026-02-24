import SendEmail from "./SendEmail.js";

const sendOrderConfirmationEmail = async ({
  customerName,
  customerEmail,
  order,
  payment,
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

  // Generate items list
  const itemsList = items.map(item => {
    const price = item.discountPrice || item.comboPrice || item.price || 0;
    const total = price * item.quantity;
    return `
      <tr style="border-bottom: 1px solid #BDB2A1;">
        <td style="padding: 15px 10px; vertical-align: top;">
          <div style="display: flex; align-items: center; gap: 10px;">
            ${item.images && item.images[0] ? 
              `<img src="<${process.env.BASE_URL}${item.images>[0]}" alt="${item.title}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px;">` 
              : ''
            }
            <div>
              <h4 style="margin: 0; color: #5A432A; font-size: 14px; font-weight: 600;">${item.title}</h4>
              <p style="margin: 5px 0 0 0; color: #a0855c; font-size: 12px;">
                ${item.itemType === 'product' ? 'Product' : 'Combo'} 
                ${item.quantityLabel ? `• ${item.quantityLabel}` : ''}
                ${item.numberOfPieces ? `• ${item.numberOfPieces} pieces` : ''}
              </p>
            </div>
          </div>
        </td>
        <td style="padding: 15px 10px; text-align: center; color: #5A432A; font-weight: 600;">₹${price}</td>
        <td style="padding: 15px 10px; text-align: center; color: #5A432A; font-weight: 600;">${item.quantity}</td>
        <td style="padding: 15px 10px; text-align: center; color: #5A432A; font-weight: 600;">₹${total}</td>
      </tr>
    `;
  }).join('');

  const subtotal = totalDiscountPrice - deliveryCharge;
  const savings = totalPrice - subtotal;
  const orderDate = new Date(createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const emailHTML = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #F7F2E9;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 20px rgba(90, 67, 42, 0.1);">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #5A432A 0%, #8b6f47 100%); padding: 40px 30px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: 1px;">
                    MOONLIGHT FUDGE
                </h1>
            </div>

            <!-- Order Confirmation Banner -->
            <div style="background-color: #c9994d; padding: 20px 30px; text-align: center;">
                <h2 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">
                     Order Confirmed!
                </h2>
                <p style="color: #F7F2E9; margin: 8px 0 0 0; font-size: 16px;">
                    Thank you for your order, ${customerName}!
                </p>
            </div>

            <!-- Order Details -->
            <div style="padding: 30px;">
                
                <!-- Order Info Grid -->
                <div style="background-color: #F7F2E9; padding: 25px; border-radius: 12px; margin-bottom: 30px; border: 2px solid #BDB2A1;">
                    <h3 style="color: #5A432A; margin: 0 0 20px 0; font-size: 20px; font-weight: 600; border-bottom: 2px solid #D9AF6B; padding-bottom: 10px;">
                        📋 Order Information
                    </h3>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
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
                        <div style="display: flex; justify-content: center; align-items: center;">
                            <span style="margin: 0 0 8px 0; color: #a0855c; font-size: 14px; font-weight: 500;">Status:</span>
                            <span style="margin: 0; color: #c9994d; font-size: 16px; font-weight: 600; text-transform: capitalize;">
                                ${status}
                            </span>
                        </div>
                        <div style="display: flex; justify-content: center; align-items: center;">
                            <span style="margin: 0 0 8px 0; color: #a0855c; font-size: 14px; font-weight: 500;">Payment Status:</span>
                            <span style="margin: 0; color: #c9994d; font-size: 16px; font-weight: 600;">
                                ${payment?.status || 'Confirmed'}
                            </span>
                        </div>
                    </div>
                </div>

                <!-- Order Items -->
                <div style="background-color: #ffffff; border: 2px solid #BDB2A1; border-radius: 12px; margin-bottom: 30px; overflow: hidden;">
                    <div style="background-color: #5A432A; padding: 20px; text-align: center;">
                        <h3 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 600;">
                             Your Order Items
                        </h3>
                    </div>
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="background-color: #F7F2E9;">
                                <th style="padding: 15px 10px; text-align: left; color: #5A432A; font-weight: 600; border-bottom: 2px solid #BDB2A1;">Item</th>
                                <th style="padding: 15px 10px; text-align: center; color: #5A432A; font-weight: 600; border-bottom: 2px solid #BDB2A1;">Price</th>
                                <th style="padding: 15px 10px; text-align: center; color: #5A432A; font-weight: 600; border-bottom: 2px solid #BDB2A1;">Qty</th>
                                <th style="padding: 15px 10px; text-align: center; color: #5A432A; font-weight: 600; border-bottom: 2px solid #BDB2A1;">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsList}
                        </tbody>
                    </table>
                </div>

                <!-- Order Summary with Delivery -->
                <div style="background-color: #F7F2E9; padding: 25px; border-radius: 12px; margin-bottom: 30px; border: 2px solid #BDB2A1;">
                    <h3 style="color: #5A432A; margin: 0 0 20px 0; font-size: 20px; font-weight: 600; text-align: center;">
                        Order Summary
                    </h3>
                    <div style="space-y: 10px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #BDB2A1;">
                            <span style="color: #a0855c; font-size: 16px;">Items Subtotal:</span>
                            <span style="color: #5A432A; font-size: 16px; font-weight: 600;">₹${subtotal}</span>
                        </div>
                        ${savings > 0 ? `
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #BDB2A1;">
                            <span style="color: #c9994d; font-size: 16px;">You Saved:</span>
                            <span style="color: #c9994d; font-size: 16px; font-weight: 600;">-₹${savings}</span>
                        </div>
                        ` : ''}
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #BDB2A1;">
                            <span style="color: #a0855c; font-size: 16px;">Delivery Charges:</span>
                            <span style="color: #5A432A; font-size: 16px; font-weight: 600;">₹${deliveryCharge}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px 0; background-color: #5A432A; margin: 15px -25px -25px -25px; padding-left: 25px; padding-right: 25px;">
                            <span style="color: #D9AF6B; font-size: 20px; font-weight: 600;">Total Paid: ₹${finalTotal || totalDiscountPrice}</span>
                        </div>
                    </div>
                </div>

                <!-- Next Steps -->
                <div style="background-color: #c9994d; padding: 25px; border-radius: 12px; text-align: center; color: #ffffff;">
                    <h3 style="margin: 0 0 15px 0; font-size: 20px; font-weight: 600;">
                        🎉 What's Next?
                    </h3>
                    <p style="margin: 0 0 15px 0; font-size: 16px; line-height: 1.6;">
                        We're preparing your delicious fudge with love! You'll receive another email once your order is shipped with tracking details.
                    </p>
                    <p style="margin: 0; font-size: 14px; opacity: 0.9;">
                       Expected delivery: 2 hrs to 24 hrs
                    </p>
                </div>

            </div>

            <!-- Footer -->
            <div style="background-color: #5A432A; padding: 30px; text-align: center;">
                <p style="color: #D9AF6B; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">
                    Thank you for choosing Moonlight Fudge!
                </p>
                <p style="color: #F7F2E9; margin: 0 0 20px 0; font-size: 14px; line-height: 1.6;">
                    Questions about your order? Reply to this email or contact our support team.<br>
                    We're here to make your fudge experience extraordinary!
                </p>
                <div style="border-top: 1px solid #8b6f47; padding-top: 20px; margin-top: 20px;">
                    <p style="color: #a0855c; margin: 0; font-size: 12px;">
                        © 2024 Moonlight Fudge. All rights reserved.<br>
                       Made with Love • Delivered Fresh
                    </p>
                </div>
            </div>

        </div>
    </body>
    </html>
  `;

  return SendEmail({
    to: customerEmail,
    subject: `🍯 Order Confirmed - Thank you ${customerName}! (Order #${orderId.toString().slice(-8).toUpperCase()})`,
    html: emailHTML,
  });
};

export default sendOrderConfirmationEmail;
