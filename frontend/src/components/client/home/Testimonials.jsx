import React from "react";
import { LeaveTestimonialModal, Testimonial } from "@/components";
import { useQuery } from "@tanstack/react-query";
import { getFeaturedTestimonials } from "@/services/testimonialServices";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

const Testimonials = () => {
  const [openTestimonialModal, setOpenTestimonialModal] = React.useState(false);
  // Use React Query for fetching
  const { data: testimonials = [], isLoading } = useQuery({
    queryKey: ["featuredTestimonials"],
    queryFn: getFeaturedTestimonials,
    refetchOnWindowFocus: false,
  });

   if (!testimonials.length && !isLoading) return null


  // Split testimonials into 3 columns
  const column1 = testimonials.slice(0, 3);
  const column2 = testimonials.slice(3, 6);
  const column3 = testimonials.slice(6, 9);

  return (
    <section className="py-24 bg-[var(--background-color)] overflow-hidden border-b border-t border-[var(--border-color)]/30">
      <div className="container mx-auto px-6 space-y-16">
        <div className="text-center">
          <h2 className="text-4xl md:text-5xl font-serif text-[var(--primary-color)] mb-4">
            Cherished Memories
          </h2>
          <p className="text-lg text-[var(--text-color)]">
            Stories from our beloved customers
          </p>
        </div>
        {/* Desktop: 3 columns */}
        <div className="hidden md:grid md:grid-cols-3 gap-8 h-screen">
          {/* Column 1 */}
          <div className="relative overflow-hidden">
            {/* Top fade overlay */}
            <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-[var(--background-color)] to-transparent z-10 pointer-events-none"></div>
            {/* Bottom fade overlay */}
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[var(--background-color)] to-transparent z-10 pointer-events-none"></div>

            <div className="animate-scroll-up-slow">
              {isLoading
                ? Array(3)
                    .fill(0)
                    .map((_, idx) => (
                      <div key={idx} className="py-6 opacity-50 animate-pulse">
                        {/* skeleton or placeholder here if you want */}
                        <div className="h-24 bg-gray-200 rounded-xl" />
                      </div>
                    ))
                : [...column1, ...column1].map((testimonial, index) => (
                    <Testimonial key={index} testimonial={testimonial} />
                  ))}
            </div>
          </div>
          {/* Column 2 */}
          <div className="relative overflow-hidden">
            {/* Top & bottom fade overlays */}
            <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-[var(--background-color)] to-transparent z-10 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[var(--background-color)] to-transparent z-10 pointer-events-none"></div>
            <div className="animate-scroll-up-medium">
              {isLoading
                ? Array(3)
                    .fill(0)
                    .map((_, idx) => (
                      <div key={idx} className="py-6 opacity-50 animate-pulse">
                        <div className="h-24 bg-gray-200 rounded-xl" />
                      </div>
                    ))
                : [...column2, ...column2].map((testimonial, index) => (
                    <Testimonial key={index} testimonial={testimonial} />
                  ))}
            </div>
          </div>
          {/* Column 3 */}
          <div className="relative overflow-hidden">
            {/* Top & bottom fade overlays */}
            <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-[var(--background-color)] to-transparent z-10 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[var(--background-color)] to-transparent z-10 pointer-events-none"></div>
            <div className="animate-scroll-up-fast">
              {isLoading
                ? Array(3)
                    .fill(0)
                    .map((_, idx) => (
                      <div key={idx} className="py-6 opacity-50 animate-pulse">
                        <div className="h-24 bg-gray-200 rounded-xl" />
                      </div>
                    ))
                : [...column3, ...column3].map((testimonial, index) => (
                    <Testimonial key={index} testimonial={testimonial} />
                  ))}
            </div>
          </div>
        </div>
        {/* Mobile: Single column */}
        <div className="md:hidden">
          <div className="relative overflow-hidden h-screen">
            {/* Top fade overlay */}
            <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-[var(--background-color)] to-transparent z-10 pointer-events-none"></div>
            {/* Bottom fade overlay */}
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[var(--background-color)] to-transparent z-10 pointer-events-none"></div>

            <div className="animate-scroll-up-medium">
              {isLoading
                ? Array(4)
                    .fill(0)
                    .map((_, idx) => (
                      <div key={idx} className="py-6 opacity-50 animate-pulse">
                        <div className="h-24 bg-gray-200 rounded-xl" />
                      </div>
                    ))
                : [
                    ...testimonials.slice(0, 4),
                    ...testimonials.slice(0, 4),
                  ].map((testimonial, index) => (
                    <Testimonial key={index} testimonial={testimonial} />
                  ))}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center space-x-8">
          <Link
            href="/all-happy-customer-reviews"
            className="text-[var(--primary-color)] rounded-lg cursor-pointer text-sm uppercase tracking-wider hover:text-[var(--secondary-color)] transition-colors duration-300 flex items-center"
          >
            View All Testimonials
            <ChevronRight className="ml-2 w-4 h-4" />
          </Link>
        </div>
      </div>

      {openTestimonialModal && (
        <LeaveTestimonialModal
          isOpen={openTestimonialModal}
          onClose={() => setOpenTestimonialModal(false)}
        />
      )}
    </section>
  );
};

export default Testimonials;
