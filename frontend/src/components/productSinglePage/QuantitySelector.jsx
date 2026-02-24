"use client"

import { Minus, Plus } from "lucide-react"

export function QuantitySelector({ min = 1, max = 10 , value , onChange }) {

  return (
    <div className="flex items-center">
      <label htmlFor="quantity-input" className="text-sm font-medium text-gray-700 mr-3">
        Quantity:
      </label>
      <div className="flex items-center border border-gray-300 rounded">
        <button
          onClick={() => onChange(Math.max(min, value - 1))}
          className="p-2 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={value <= min}
          aria-label="Decrease quantity"
        >
          <Minus className="w-4 h-4" />
        </button>
        <span id="quantity-input" className="px-4 py-2 min-w-12 text-center text-sm font-medium">
          {value}
        </span>
        <button
          onClick={() => onChange(Math.min(max, value + 1))}
          className="p-2 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={value >= max}
          aria-label="Increase quantity"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
