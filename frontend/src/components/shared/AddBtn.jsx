"use client"
import { ShoppingCart } from 'lucide-react';
import React from 'react'
import { useAuth } from '@/hooks/useAuth';
import { useCartCount } from '@/hooks/useCartCount';
import { addToCart, additemtoCart_localstorage } from '@/services/cartServices';
import toast from 'react-hot-toast';

const AddBtn = ({ itemId, itemType, quantity=1, className, status }) => {
    const { user } = useAuth();
    const isUser = user && user.userId && user.role !== "guest"
    const { updateCartCount,cartCount } = useCartCount();
    const handleAddToCart = async (e) => {
        console.log("quantity: ",quantity)
        e.stopPropagation();
        e.preventDefault();

        //Make sure only 10 items will be added to the cart
        if(cartCount>10 || quantity+cartCount>10){
          toast.error("Only 10 items can be added to the cart!",{
            style:{
              backgroundColor:"red",
              opacity:"0.1"
            },
          });
          return;
        }


        if (isUser) {
          const data = await addToCart(itemId, itemType, quantity);
          if (data?.data?.success) {
            toast.success(`${quantity} Item added to cart successfully`);
            updateCartCount();
          } else {
            toast.error(data.error.response.data.message);
          }
        } else {
          const data = await additemtoCart_localstorage(itemId, itemType, quantity);
          toast.success(`${quantity} Item added to cart successfully`);
          updateCartCount();
        }
      };
  return (
    <button 
          onClick={(e)=>handleAddToCart(e)}
          className={`${className}`}
        >
          <ShoppingCart className="w-5 h-5 mr-2" />
          <span>Add to cart</span>
        </button>
  )
}

export default AddBtn