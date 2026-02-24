"use client"
import { Minus, Plus, Trash } from "lucide-react";

const CartActions = ({ quantity, handleQuantityChange, setShowDeleteModal }) => {
  return (
    <div className="flex items-center justify-between pt-2">
    {/* Quantity Controls */}
    <div className="flex items-center gap-1 bg-gray-50 rounded-lg p-1">
      <button 
        className="cursor-pointer p-1.5 hover:bg-gray-200 rounded-md transition-colors duration-200"
        onClick={() => handleQuantityChange(quantity - 1)}
      >
        <Minus size={14} className="text-gray-600" />
      </button>
      <span className="cursor-pointer px-3 py-1 text-sm font-medium min-w-[32px] text-center">
        {quantity}
      </span>
      <button 
        className="cursor-pointer p-1.5 hover:bg-gray-200 rounded-md transition-colors duration-200"
        onClick={() => handleQuantityChange(quantity + 1)}
      >
        <Plus size={14} className="text-gray-600" />
      </button>
    </div>
    
    {/* Delete Button */}
    <button 
      className="cursor-pointer p-2 text-[var(--delete-color)] hover:bg-[var(--delete-color-hover)] rounded-lg transition-colors duration-200"
      onClick={() => setShowDeleteModal(true)}
    >
      <Trash size={16} />
    </button>
  </div>  )
}
export default CartActions