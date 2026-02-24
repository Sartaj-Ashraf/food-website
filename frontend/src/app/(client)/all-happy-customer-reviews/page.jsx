"use client";
import React, { useEffect, useRef, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";

import { getAllTestimonials } from "@/services/testimonialServices";
import {
  LeaveTestimonialModal,
  Testimonial,
  TestimonialCardSkeletonLoading,
} from "@/components";

// API fetcher
const fetchTestimonials = async ({ pageParam = 1 }) => {
  const result = await getAllTestimonials({ pageParam });
  if (!(result?.status === "success"))
    throw new Error("Failed to fetch testimonials");
  return result;
};

const TestimonialsPage = () => {
  const [openTestimonialModal, setOpenTestimonialModal] = useState(false);
  const loadMoreRef = useRef(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    refetch,
    isFetchingNextPage,
    isLoading,
    status,
  } = useInfiniteQuery({
    queryKey: ["testimonials"],
    queryFn: fetchTestimonials,
    initialPageParam: 1,
    getNextPageParam: (lastPage, pages) => {
      if (lastPage.currentPage < lastPage.totalPages) {
        return lastPage.currentPage + 1;
      }
      return undefined;
    },
  });

  const allTestimonials = data?.pages.flatMap((p) => p.testimonials) || [];

  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchNextPage();
        }
      },
      { threshold: 1 }
    );

    if (loadMoreRef.current) observer.observe(loadMoreRef.current);

    return () => {
      if (loadMoreRef.current) observer.unobserve(loadMoreRef.current);
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  return (
    <div className="pt-24 font-sans bg-[var(--background-color)] min-h-screen">
      <div className="container mx-auto space-y-4">
        <div className="text-center space-y-4">
          <h2 className="text-4xl md:text-5xl font-serif text-[var(--primary-color)] mb-4">
            Cherished Memories
          </h2>
          <p className="text-lg text-[var(--primary-color)]">
            Stories from our beloved customers
          </p>
        </div>
        {openTestimonialModal && (
          <LeaveTestimonialModal
            isOpen={openTestimonialModal}
            onClose={() => setOpenTestimonialModal(false)}
            refetch={refetch}
          />
        )}

        {/* Masonry Layout */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 w-full text-center">
          {isLoading &&
            Array.from({ length: 9 }).map((_, i) => (
              <TestimonialCardSkeletonLoading key={i} />
            ))}
          {status === "error" && (
            <p className="text-red-600">Failed to load testimonials</p>
          )}
          {allTestimonials.length === 0 && status === "success" && (
            <p className="text-center">No testimonials found.</p>
          )}
          {status === "success" &&
            allTestimonials?.map((testimonial) => (
              <div key={testimonial._id} className="break-inside-avoid mb-5">
                <Testimonial testimonial={testimonial} />
              </div>
            ))}
          {isFetchingNextPage &&
            Array.from({ length: 3 }).map((_, i) => (
              <TestimonialCardSkeletonLoading key={`loading-${i}`} />
            ))}
        </div>

        {/* Loading More Sentinel */}
        <div
          ref={loadMoreRef}
          className="py-5 text-center text-[var(--primary-color)] font-medium"
        >
          {isFetchingNextPage
            ? "Loading more testimonials..."
            : hasNextPage
            ? "Scroll for more..."
            : "No more testimonials"}
        </div>
      </div>
    </div>
  );
};

export default TestimonialsPage;
