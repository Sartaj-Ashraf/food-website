import { useState } from "react"
import { Order } from "@/app/types/order"

export function useWhatsAppShare(order: Order) {
    const [loading, setLoading] = useState(false)

    const share = async (phone: string) => {
        if (!phone) {
            alert("Please enter a phone number")
            return
        }

        // remove spaces, +, -, etc.
        const formattedPhone = phone.replace(/\D/g, "")

                const message = `
                    *Order Delivery Details*

                    *Phone Number:* ${order.phone}
                    *Customer Name:* ${order.customerName}

                    *Delivery Address:*
                    ${order.address.address}

                    *Google Maps Location:*
                    https://www.google.com/maps?q=${order.address.coordinates[0]},${order.address.coordinates[1]}
                    `.trim()



        const encodedMessage = encodeURIComponent(message)

        setLoading(true)

        // small delay for UX (optional)
        setTimeout(() => {
            window.open(
                `https://wa.me/${formattedPhone}?text=${encodedMessage}`,
                "_blank"
            )
            setLoading(false)
        }, 300)
    }

    return {
        share,
        loading
    }
}
