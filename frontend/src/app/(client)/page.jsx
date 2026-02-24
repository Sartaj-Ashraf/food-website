"use client";
import { useState, useEffect } from "react";

import {
  HeritageSection,
  FeaturedProducts,
  HeroSection,
  IngredientSection,
  ProductSection,
  SocialReels,
  Testimonials,
} from "../../components";

export default function MoonlightFudgeHomepage() {
  return (
    <div className="min-h-screen bg-[#F7F2E9] text-[#5A432A] overflow-x-hidden">

      {/* Hero Section - Split Screen Design */}
      <HeroSection />
      {/* Featured Products */}
      <FeaturedProducts />
      {/* Product Variants */}
      {/* <ProductSection  /> */}

      {/* Ingredients Section - Interactive Showcase */}
      <IngredientSection />

      {/* Heritage Section */}
      <HeritageSection />

      {/* Premium Infinite Scrolling Testimonials */}
      <Testimonials />
      {/* Social Reels */}
      <SocialReels />
    </div>
  );
}
