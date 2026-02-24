"use client";
import React from "react";
import { ChevronRight } from "lucide-react";
import { chinarBackground, Honey, saffron, walnut, dates } from "@/assets";
import Link from "next/link";
const HeroSection = () => {
  return (
    <section className="min-h-screen flex items-center pt-20">
      <div className="container px-6 w-full">
        <div className=" grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Side - Typography */}
          <div className="  relative space-y-12">
            <div
              style={{
                backgroundImage: `url(${chinarBackground.src})`,
                backgroundSize: "contain",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }}
              className=" width-[100%] h-[100%] scale-250  absolute left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] inset-0 opacity-10 rotate-45 "
            ></div>

            <div className="space-y-8">
              <div className="space-y-4">
                <div className="text-sm uppercase tracking-[0.3em] text-[var(--text-color)] font-medium">
                  Est. 1896
                </div>
                <h1 className="text-7xl md:text-6xl lg:text-7xl font-serif font-light leading-[0.85] text-[var(--primary-color)]">
                  <span className="text-8xl font-serif font-light text-[var(--primary-color)] ">
                    M
                  </span>
                  oonlight
                  <br />
                  <span className="text-4xl font-serif font-light text-[var(--primary-color)] ">
                    The Walnut Fudge
                  </span>
                </h1>
              </div>

              <div className="space-y-6">
                <div className="w-24 h-px bg-[var(--secondary-color)]"></div>
                <p className="text-xl md:text-2xl text-[var(--text-color)] leading-relaxed max-w-md">
                  Four generations of authentic Kashmiri walnut fudge, crafted
                  with the same love since 1896.
                </p>
              </div>
            </div>

            <div className="relative  z-10 flex items-center space-x-8">
              <Link
                href="/shop"
                className="bg-[var(--primary-color)] rounded-lg cursor-pointer text-white px-8 py-4 text-sm uppercase tracking-wider hover:bg-[var(--primary-color)]/90 transition-colors duration-300"
              >
                Shop Collection
              </Link>
              <Link
                href="/our-story"
                className="text-[var(--primary-color)] rounded-lg cursor-pointer text-sm uppercase tracking-wider hover:text-[var(--secondary-color)] transition-colors duration-300 flex items-center"
              >
                Our Story
                <ChevronRight className="ml-2 w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Right Side - Image Grid */}
          <div className="relative">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-6">
                <div className="aspect-[5/3] rounded-2xl overflow-hidden">
                  <img
                    src={saffron.src}
                    alt="Moonlight Fudge"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                  />
                </div>
                <div className="aspect-[4/3] rounded-2xl overflow-hidden">
                  <img
                    src={walnut.src}
                    alt="Kashmir Walnuts"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                  />
                </div>
              </div>
              <div className="space-y-6 pt-12">
                <div className="aspect-[4/3] rounded-2xl overflow-hidden">
                  <img
                    src={Honey.src}
                    alt="Mountain Honey"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                  />
                </div>
                <div className="aspect-[5/3] rounded-2xl overflow-hidden">
                  <img
                    src={dates.src}
                    alt="Fudge Making"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                  />
                </div>
              </div>
            </div>

            {/* Floating Stats */}
            <div className="absolute bottom-[50%] left-[50%] translate-x-[-50%] translate-y-[50%]  bg-[var(--primary-color)]/70 rounded-2xl p-5  ">
              <div className="text-3xl font-serif text-center text-white mb-1">
                {new Date().getFullYear() - 1896}
              </div>
              <div className="text-sm text-center text-white uppercase tracking-wider">
                Years of Heritage
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
