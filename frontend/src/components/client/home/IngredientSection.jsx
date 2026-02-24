"use client"
import React, { useState } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Honey, saffron, walnut, dates } from '@/assets'
const IngredientSection = () => {
    const [currentIngredient, setCurrentIngredient] = useState(0);
    const ingredients = [
        {
          name: "Kashmir Walnuts",
          image: walnut,
          description:
            "Hand-selected from ancient groves where each walnut carries the essence of mountain purity",
          origin: "Srinagar Valley",
          season: "October - November",
        },
        {
          name: "Mountain Honey",
          image: Honey,
          description:
            "Golden nectar from wildflowers that bloom in the pristine meadows of Kashmir",
          origin: "High Meadows",
          season: "Spring - Summer",
        },
        {
          name: "Premium Dates",
          image: dates,
          description:
            "Sweet dates that bind our legacy together with natural sweetness and ancient tradition",
          origin: "Selected Orchards",
          season: "Year Round",
        },
        {
          name: "Kashmir Saffron",
          image: saffron,
          description:
            "Kashmir Saffron is the finest in the world.",
          origin: "Kashmir Valley",
          season: "Year Round",
        },
      ];

  return (
    <section className="py-24 bg-[var(--background-color)]">
    <div className="container px-6">
      {/* Section Header */}
      <div className="text-center mb-10">
        <div className="text-sm uppercase tracking-[0.3em] text-[var(--text-color)] mb-3">
          Pure Ingredients
        </div>
        <h2 className=" text-4xl md:text-5xl  font-serif text-[var(--primary-color)] font-light ">
          Four Sacred Elements
        </h2>
      </div>

      {/* Interactive Ingredient Display */}
      <div className="grid lg:grid-cols-2 gap-8 items-center">
        {/* Left - Large Image Display */}
        <div className="relative">
          <div className=" rounded-3xl overflow-hidden bg-[var(--background-second-color)]">
            <img
              src={
                ingredients[currentIngredient].image.src || "/placeholder.svg"
              }
              alt={ingredients[currentIngredient].name}
              className="w-full h-full object-cover transition-all duration-700"
            />
          </div>
        </div>

        {/* Right - Content */}
        <div className="">
          <div className="space-y-3">
            <div className="flex items-center space-x-4">
              <div className="text-6xl font-serif text-[var(--accent-color)] font-light">
                {String(currentIngredient + 1).padStart(2, "0")}
              </div>
              <div className="w-16 h-px bg-[var(--accent-color)]"></div>
            </div>

            <h3 className="text-4xl font-serif text-[var(--primary-color)] font-light">
              {ingredients[currentIngredient].name}
            </h3>

            <p className="text-lg text-[var(--text-color)] leading-relaxed">
              {ingredients[currentIngredient].description}
            </p>
          </div>

          {/* Details */}
          <div className="grid grid-cols-2 gap-8 pt-6 border-t border-[var(--border-color)]/20">
            <div>
              <div className="text-sm uppercase tracking-wider text-[var(--text-color)] mb-2">
                Origin
              </div>
              <div className="text-[var(--primary-color)] font-medium">
                {ingredients[currentIngredient].origin}
              </div>
            </div>
            <div>
              <div className="text-sm uppercase tracking-wider text-[var(--text-color)] mb-2">
                Season
              </div>
              <div className="text-[var(--primary-color)] font-medium">
                {ingredients[currentIngredient].season}
              </div>
            </div>
          </div>

          {/* Navigation Arrows */}
          <div className="flex space-x-4 pt-8">
            <button
              onClick={() =>
                setCurrentIngredient(
                  currentIngredient === 0
                    ? ingredients.length - 1
                    : currentIngredient - 1
                )
              }
              className="flex items-center cursor-pointer justify-center w-12 h-12 rounded-full border border-[var(--border-color)]/30 hover:border-[var(--accent-color)] hover:text-[var(--accent-color)] transition-colors duration-300"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() =>
                setCurrentIngredient(
                  currentIngredient === ingredients.length - 1
                    ? 0
                    : currentIngredient + 1
                )
              }
              className="flex items-center cursor-pointer justify-center w-12 h-12 rounded-full border border-[var(--border-color)]/30 hover:border-[var(--accent-color)] hover:text-[var(--accent-color)] transition-colors duration-300"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>  )
}

export default IngredientSection