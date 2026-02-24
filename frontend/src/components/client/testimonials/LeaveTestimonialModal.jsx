"use client"
import React, { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

import { createTestimonial } from "@/services/testimonialServices";

import { X, Star, User, MessageSquare, Award } from "lucide-react";


const postTestimonial = async (payload) => {
  const result = await createTestimonial(payload);
  if (!(result?.status === "success"))
    throw new Error("Failed to submit testimonial");
  return result;
};

const LeaveTestimonialModal = ({ isOpen, onClose, refetch }) => {
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    review: "",
    rating: 5,
  });

  const mutation = useMutation({
    mutationFn: postTestimonial,
    onSuccess: () => {
      toast.success("Testimonial submitted successfully!");
      setFormData({ name: "", review: "", rating: 5 });
      onClose();
      refetch();
    },
    onError: (e) => toast.error(e.message || "Error submitting testimonial"),
  });

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((d) => ({
      ...d,
      [name]: name === "rating" ? Number(value) : value,
    }));
  };

  // Submit handler
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.review.trim()) {
      toast.error("Name and Review are required");
      return;
    }
    if (formData.rating < 1 || formData.rating > 5) {
      toast.error("Rating must be between 1 and 5");
      return;
    }
    mutation.mutate(formData);
  };

  // Close on ESC key
  useEffect(() => {
    const onEsc = (e) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const renderStars = () => {
    return [...Array(5)].map((_, index) => {
      const starValue = index + 1;
      const isActive = starValue <= (hoverRating || formData.rating);

      return (
        <button
          key={index}
          type="button"
          onClick={() =>
            setFormData((prev) => ({ ...prev, rating: starValue }))
          }
          onMouseEnter={() => setHoverRating(starValue)}
          onMouseLeave={() => setHoverRating(0)}
          className={`transition-all duration-200 transform hover:scale-110 ${
            isActive
              ? "text-[var(--accent-color)]"
              : "text-[var(--border-color)]"
          }`}
        >
          <Star className={`w-8 h-8 ${isActive ? "fill-current" : ""}`} />
        </button>
      );
    });
  };

  return (
    <>
    {/* Backdrop */}
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-all duration-300"
      style={{ zIndex: 50 }}
    ></div>

    {/* Modal container */}
    <div
      className="fixed inset-0 flex items-center justify-center px-4"
      style={{ zIndex: 60 }}
      aria-modal="true"
      role="dialog"
      tabIndex={-1}
    >
      {/* Modal panel */}
      <div
        className="relative bg-white rounded-3xl w-full max-w-lg shadow-2xl transform transition-all duration-300 scale-100 opacity-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-[var(--accent-color)] to-[var(--accent-color)] rounded-t-3xl px-8 py-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
          <div className="relative flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Award className="w-6 h-6 text-[var(--white)]" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[var(--white)]">
                  Share Your Experience
                </h2>
                <p className="text-[var(--white)]/90 text-sm">
                  Help others discover our service
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              aria-label="Close modal"
              className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-[var(--white)] hover:bg-white/30 transition-colors backdrop-blur-sm"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-8 py-6">
          <div className="space-y-6">
            {/* Rating */}
            <div className="flex items-center justify-center flex-col">
              <label className="flex items-center space-x-2 mb-3 font-semibold text-[var(--primary-color)]">
                <Star className="w-4 h-4" />
                <span>Rate Your Experience</span>
                <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center space-x-1 mb-2">
                {renderStars()}
                <span className="ml-3 text-sm text-gray-600 font-medium">
                  {hoverRating || formData.rating} of 5 stars
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Click on the stars to rate your experience
              </p>
            </div>
            {/* Name input */}
            <div className="group">
              <label
                htmlFor="name"
                className="flex items-center space-x-2 mb-3 font-semibold text-[var(--primary-color)]"
              >
                <User className="w-4 h-4" />
                <span>Your Name</span>
                <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border-2 border-[var(--border-color)] rounded-xl outline-none text-sm transition-all duration-200 focus:border-[var(--accent-color)] focus:shadow-lg focus:shadow-[var(--accent-color)]/20 bg-gray-50/50 hover:bg-white"
                  placeholder="Enter your full name"
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[var(--accent-color)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
              </div>
            </div>
            {/* Review textarea */}
            <div className="group">
              <label
                htmlFor="review"
                className="flex items-center space-x-2 mb-3 font-semibold text-[var(--primary-color)]"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Your Testimonial</span>
                <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <textarea
                  id="review"
                  name="review"
                  rows={4}
                  value={formData.review}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border-2 border-[var(--border-color)] rounded-xl outline-none text-sm resize-y transition-all duration-200 focus:border-[var(--accent-color)] focus:shadow-lg focus:shadow-[var(--accent-color)]/20 bg-gray-50/50 hover:bg-white"
                  placeholder="Share your experience with others... What did you love about our service?"
                ></textarea>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[var(--accent-color)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
              </div>
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-gray-500">
                  Be honest and specific about your experience
                </p>
                <span className="text-xs text-gray-400">
                  {formData.review.length}/500
                </span>
              </div>
            </div>

            {/* Submit button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                onClick={handleSubmit}
                className={`w-full py-4 rounded-xl font-bold text-[var(--white)] text-lg transition-all duration-300 transform ${
                  isSubmitting
                    ? "bg-[var(--border-color)] cursor-not-allowed scale-95"
                    : "bg-gradient-to-r from-[var(--accent-color)] to-[var(--accent-color)] hover:shadow-xl hover:shadow-[var(--accent-color)]/30 hover:scale-105 active:scale-95"
                } relative overflow-hidden`}
              >
                <div className="relative z-10 flex items-center justify-center space-x-2">
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Award className="w-5 h-5" />
                      <span>Submit Testimonial</span>
                    </>
                  )}
                </div>
                <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <style jsx>{`
      @keyframes modalEnter {
        from {
          opacity: 0;
          transform: scale(0.95) translateY(20px);
        }
        to {
          opacity: 1;
          transform: scale(1) translateY(0);
        }
      }

      .modal-enter {
        animation: modalEnter 0.3s ease-out forwards;
      }
    `}</style>
  </>
  );
};

export default LeaveTestimonialModal;







// "use client";
// import React, { useState, useEffect } from "react";
// import { X, Star, User, MessageSquare, Award } from "lucide-react";

// const LeaveTestimonialModal = ({ isOpen, onClose, refetch }) => {
//   const [formData, setFormData] = useState({
//     name: "",
//     review: "",
//     rating: 5,
//   });
//   const [hoverRating, setHoverRating] = useState(0);
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   // Simulate mutation for demo
//   const handleSubmitDemo = async (data) => {
//     setIsSubmitting(true);
//     await new Promise((resolve) => setTimeout(resolve, 2000));
//     setIsSubmitting(false);
//     console.log("Testimonial submitted:", data);
//     setFormData({ name: "", review: "", rating: 5 });
//     onClose();
//   };

//   // Handle input change
//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((d) => ({
//       ...d,
//       [name]: name === "rating" ? Number(value) : value,
//     }));
//   };

//   // Submit handler
//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (!formData.name.trim() || !formData.review.trim()) {
//       alert("Name and Review are required");
//       return;
//     }
//     if (formData.rating < 1 || formData.rating > 5) {
//       alert("Rating must be between 1 and 5");
//       return;
//     }
//     handleSubmitDemo(formData);
//   };

//   // Close on ESC key
//   useEffect(() => {
//     const onEsc = (e) => {
//       if (e.key === "Escape" && isOpen) onClose();
//     };
//     window.addEventListener("keydown", onEsc);
//     return () => window.removeEventListener("keydown", onEsc);
//   }, [isOpen, onClose]);

//   // Reset form when modal closes
//   useEffect(() => {
//     if (!isOpen) {
//       setFormData({ name: "", review: "", rating: 5 });
//       setHoverRating(0);
//     }
//   }, [isOpen]);

//   if (!isOpen) return null;

//   const renderStars = () => {
//     return [...Array(5)].map((_, index) => {
//       const starValue = index + 1;
//       const isActive = starValue <= (hoverRating || formData.rating);

//       return (
//         <button
//           key={index}
//           type="button"
//           onClick={() =>
//             setFormData((prev) => ({ ...prev, rating: starValue }))
//           }
//           onMouseEnter={() => setHoverRating(starValue)}
//           onMouseLeave={() => setHoverRating(0)}
//           className={`transition-all duration-200 transform hover:scale-110 ${
//             isActive
//               ? "text-[var(--accent-color)]"
//               : "text-[var(--border-color)]"
//           }`}
//         >
//           <Star className={`w-8 h-8 ${isActive ? "fill-current" : ""}`} />
//         </button>
//       );
//     });
//   };

//   return (
//     <>
//       {/* Backdrop */}
//       <div
//         onClick={onClose}
//         className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-all duration-300"
//         style={{ zIndex: 50 }}
//       ></div>

//       {/* Modal container */}
//       <div
//         className="fixed inset-0 flex items-center justify-center px-4"
//         style={{ zIndex: 60 }}
//         aria-modal="true"
//         role="dialog"
//         tabIndex={-1}
//       >
//         {/* Modal panel */}
//         <div
//           className="relative bg-white rounded-3xl w-full max-w-lg shadow-2xl transform transition-all duration-300 scale-100 opacity-100"
//           onClick={(e) => e.stopPropagation()}
//         >
//           {/* Header with gradient */}
//           <div className="bg-gradient-to-r from-[var(--accent-color)] to-[var(--accent-color)] rounded-t-3xl px-8 py-6 relative overflow-hidden">
//             <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
//             <div className="relative flex items-center justify-between">
//               <div className="flex items-center space-x-3">
//                 <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
//                   <Award className="w-6 h-6 text-[var(--white)]" />
//                 </div>
//                 <div>
//                   <h2 className="text-2xl font-bold text-[var(--white)]">
//                     Share Your Experience
//                   </h2>
//                   <p className="text-[var(--white)]/90 text-sm">
//                     Help others discover our service
//                   </p>
//                 </div>
//               </div>

//               <button
//                 onClick={onClose}
//                 aria-label="Close modal"
//                 className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-[var(--white)] hover:bg-white/30 transition-colors backdrop-blur-sm"
//               >
//                 <X className="w-5 h-5" />
//               </button>
//             </div>
//           </div>

//           {/* Content */}
//           <div className="px-8 py-6">
//             <div className="space-y-6">
//               {/* Rating */}
//               <div className="flex items-center justify-center flex-col">
//                 <label className="flex items-center space-x-2 mb-3 font-semibold text-[var(--primary-color)]">
//                   <Star className="w-4 h-4" />
//                   <span>Rate Your Experience</span>
//                   <span className="text-red-500">*</span>
//                 </label>
//                 <div className="flex items-center space-x-1 mb-2">
//                   {renderStars()}
//                   <span className="ml-3 text-sm text-gray-600 font-medium">
//                     {hoverRating || formData.rating} of 5 stars
//                   </span>
//                 </div>
//                 <p className="text-xs text-gray-500">
//                   Click on the stars to rate your experience
//                 </p>
//               </div>
//               {/* Name input */}
//               <div className="group">
//                 <label
//                   htmlFor="name"
//                   className="flex items-center space-x-2 mb-3 font-semibold text-[var(--primary-color)]"
//                 >
//                   <User className="w-4 h-4" />
//                   <span>Your Name</span>
//                   <span className="text-red-500">*</span>
//                 </label>
//                 <div className="relative">
//                   <input
//                     id="name"
//                     name="name"
//                     type="text"
//                     value={formData.name}
//                     onChange={handleChange}
//                     required
//                     className="w-full px-4 py-3 border-2 border-[var(--border-color)] rounded-xl outline-none text-sm transition-all duration-200 focus:border-[var(--accent-color)] focus:shadow-lg focus:shadow-[var(--accent-color)]/20 bg-gray-50/50 hover:bg-white"
//                     placeholder="Enter your full name"
//                   />
//                   <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[var(--accent-color)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
//                 </div>
//               </div>
//               {/* Review textarea */}
//               <div className="group">
//                 <label
//                   htmlFor="review"
//                   className="flex items-center space-x-2 mb-3 font-semibold text-[var(--primary-color)]"
//                 >
//                   <MessageSquare className="w-4 h-4" />
//                   <span>Your Testimonial</span>
//                   <span className="text-red-500">*</span>
//                 </label>
//                 <div className="relative">
//                   <textarea
//                     id="review"
//                     name="review"
//                     rows={4}
//                     value={formData.review}
//                     onChange={handleChange}
//                     required
//                     className="w-full px-4 py-3 border-2 border-[var(--border-color)] rounded-xl outline-none text-sm resize-y transition-all duration-200 focus:border-[var(--accent-color)] focus:shadow-lg focus:shadow-[var(--accent-color)]/20 bg-gray-50/50 hover:bg-white"
//                     placeholder="Share your experience with others... What did you love about our service?"
//                   ></textarea>
//                   <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[var(--accent-color)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
//                 </div>
//                 <div className="flex justify-between items-center mt-2">
//                   <p className="text-xs text-gray-500">
//                     Be honest and specific about your experience
//                   </p>
//                   <span className="text-xs text-gray-400">
//                     {formData.review.length}/500
//                   </span>
//                 </div>
//               </div>

//               {/* Submit button */}
//               <div className="pt-4">
//                 <button
//                   type="submit"
//                   disabled={isSubmitting}
//                   onClick={handleSubmit}
//                   className={`w-full py-4 rounded-xl font-bold text-[var(--white)] text-lg transition-all duration-300 transform ${
//                     isSubmitting
//                       ? "bg-[var(--border-color)] cursor-not-allowed scale-95"
//                       : "bg-gradient-to-r from-[var(--accent-color)] to-[var(--accent-color)] hover:shadow-xl hover:shadow-[var(--accent-color)]/30 hover:scale-105 active:scale-95"
//                   } relative overflow-hidden`}
//                 >
//                   <div className="relative z-10 flex items-center justify-center space-x-2">
//                     {isSubmitting ? (
//                       <>
//                         <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
//                         <span>Submitting...</span>
//                       </>
//                     ) : (
//                       <>
//                         <Award className="w-5 h-5" />
//                         <span>Submit Testimonial</span>
//                       </>
//                     )}
//                   </div>
//                   <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       <style jsx>{`
//         @keyframes modalEnter {
//           from {
//             opacity: 0;
//             transform: scale(0.95) translateY(20px);
//           }
//           to {
//             opacity: 1;
//             transform: scale(1) translateY(0);
//           }
//         }

//         .modal-enter {
//           animation: modalEnter 0.3s ease-out forwards;
//         }
//       `}</style>
//     </>
//   );
// };

// export default LeaveTestimonialModal;

