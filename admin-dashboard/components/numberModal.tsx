import { Order } from "@/app/types/order"
import { useState } from "react"
import { useWhatsAppShare } from "@/hooks/use-whatsAppShare"

interface NumberModalProps {
  onClose: () => void
  order: Order
}

export default function NumberModal({ onClose, order }: NumberModalProps) {
  const [phone, setPhone] = useState("")
  const { share, loading } = useWhatsAppShare(order)

  const handleShare = async () => {
    await share(phone)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <h2 className="mb-2 text-lg font-semibold">
          Share Address via WhatsApp
        </h2>

        <p className="mb-4 text-sm text-gray-600">
          Enter the phone number to send address & map details.
        </p>

        <input
          type="tel"
          placeholder="e.g. 919876543210"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="mb-4 w-full rounded border px-3 py-2 outline-none focus:ring-2 focus:ring-green-500"
        />

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded px-4 py-2 text-sm text-gray-600 hover:bg-gray-100"
            disabled={loading}
          >
            Cancel
          </button>

          <button
            onClick={handleShare}
            disabled={loading}
            className="rounded bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? "Opening WhatsApp..." : "Open WhatsApp"}
          </button>
        </div>
      </div>
    </div>
  )
}
