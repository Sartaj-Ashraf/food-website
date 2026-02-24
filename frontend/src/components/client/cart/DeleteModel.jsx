"use client"
import Image from "next/image";
import { X } from "lucide-react";
const DeleteModel = ({showDeleteModal,setShowDeleteModal,product,quantity,handleDelete,imageUrl}) => {

  return (
<div className={`relative w-full max-w-md  bg-white rounded-t-3xl shadow-2xl transform transition-all duration-300 ${
            showDeleteModal ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
          }`}>
            
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 pb-4">
              <h3 className="text-lg font-semibold text-[var(--primary-color)]">Remove Item</h3>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="p-2 cursor-pointer hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            
            {/* Product Preview */}
            <div className="px-6 pb-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-12 h-12 relative bg-gray-200 rounded-md overflow-hidden flex-shrink-0">
                  <Image
                    src={imageUrl}
                    alt={product?.title || "Product"}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm line-clamp-1">
                    {product?.title}
                  </p>
                  <p className="text-xs text-gray-600">
                    Quantity: {quantity}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Modal Content */}
            <div className="px-6 pb-6">
              <p className="text-gray-600 mb-6 text-sm">
                Are you sure you want to remove this item from your cart?
              </p>
              
              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 cursor-pointer px-4 py-2 border border-gray-300 text-gray-700 rounded-md
                         hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 cursor-pointer px-4 py-2 bg-[var(--delete-color)] border border-[var(--delete-color)] cursor-pointer hover:text-[var(--delete-color)] hover:bg-[var(--background-color)] text-white font-medium rounded-lg transition-colors duration-200"
                  >
                  Remove
                </button>
              </div>
            </div>
          </div>  )
}
export default DeleteModel