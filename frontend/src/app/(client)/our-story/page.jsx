"use client"
import { useState, useEffect } from "react"
import {Hazratbal,begining,expYears, Parepora} from "@/assets"
import Image from "next/image"

export default function OurStoryPage() {
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const timelineEvents = [
    {
      year: "1896",
      title: "The Beginning",
      description: "In a small kitchen in Srinagar, our great-grandmother first stirred the magic that would become our legacy.",
      image: begining,
      alt: "Traditional Kashmir kitchen"
    },
    {
      year: `${new Date().getFullYear() - 1896}`,
      title: "Years of Tradition", 
      description: "Four generations have preserved the authentic taste that has become a cherished part of Kashmir's culinary heritage.",
      image: expYears,
      alt: "Kashmir walnuts"
    }
  ]

const ingredients = [
  {
    name: "Honey",
    description: "Natural sweetness and richness that enhances flavor.",
  },
  {
    name: "Dates",
    description: "Nutritious and chewy, adding depth and texture.",
  },
  {
    name: "Saffron",
    description: "A touch of luxury with its unique aroma and color.",
  },
  {
    name: "Walnuts",
    description: "Crunchy goodness for that perfect balance of taste.",
  },
];

  return (
    <div className="min-h-screen bg-amber-50">
      
      {/* A Taste of Memory */}
      <section className="py-12 md:py-16 lg:py-20 px-4 mt-12">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
            <div className="order-2 lg:order-1">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif text-amber-900 mb-6 md:mb-8">
                A Taste of Memory
              </h2>
              <div className="text-base md:text-lg text-amber-800/90 leading-relaxed space-y-4 md:space-y-6">
                <p>
                  In the quiet heart of Kashmir, where the moon bathes the valley in silver light and the scent of
                  Chinar leaves fills the air, a tradition was born - not in factories, but in the warmth of a
                  grandmother's kitchen.
                </p>
                <p>
                  Under the pale moonlight in the valleys of Kashmir, when the mist caresses the earth and the Chinar
                  leaves whisper to the wind, an age-old recipe comes to life - slow-cooked, patiently stirred, and
                  poured with love.
                </p>
                <p>
                  Each winter, as snow blanketed the landscape and silence filled the air, she would prepare a batch of
                  warm walnut fudge for her grandchildren using local ingredients: snow-chilled milk, mountain sugar,
                  and handpicked walnuts.
                </p>
              </div>
            </div>
            <div className="order-1 lg:order-2 flex justify-center">
              <div className="relative w-full ">
                <Image
                  src={Hazratbal}
                  alt="Hazratbal, Srinagar"
                  className="w-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-12 md:py-16 lg:py-20 px-4 bg-amber-100">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif text-amber-900 mb-4">
              A Legacy Through Time
            </h2>
            <p className="text-amber-800/80 text-lg md:text-xl">
              From humble beginnings to cherished tradition
            </p>
          </div>

          <div className="space-y-12 md:space-y-16">
            {timelineEvents.map((event, index) => (
              <div key={event.year} className={`flex flex-col md:flex-row items-center gap-6 md:gap-8 ${
                index % 2 === 1 ? 'md:flex-row-reverse' : ''
              }`}>
                <div className="flex-1 text-center md:text-left">
                  <div className="bg-amber-900 text-white px-4 py-2 rounded-full inline-block mb-4 text-lg font-semibold">
                    {event.year}
                  </div>
                  <h3 className="text-2xl md:text-3xl font-serif text-amber-900 mb-3">
                    {event.title}
                  </h3>
                  <p className="text-amber-800/80 leading-relaxed">
                    {event.description}
                  </p>
                </div>
                <div className="flex-1 w-full">
                  <div className="bg-white border border-amber-200 rounded-xl overflow-hidden shadow-lg">
                    <Image
                      src={event.image}
                      alt={event.alt}
                      className="w-full h-48 md:h-64 object-cover"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Crafted by Moonlight */}
      <section className="py-12 md:py-16 lg:py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
            <div className="flex justify-center">
              <div className="relative w-full h-[90vh]">
                <Image
                  src={Parepora}
                  alt="Traditional fudge making process"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif text-amber-900 mb-6 md:mb-8">
                Crafted by Moonlight
              </h2>
              <div className="text-base md:text-lg text-amber-800/90 leading-relaxed space-y-4 md:space-y-6">
                <p>
                  Each batch of Moonlight Walnut Fudge begins the old-fashioned way: milk stirred slowly over gentle
                  heat, walnuts cracked by hand, and stories passed down as the aroma rises.
                </p>
                <p>
                  Made with premium Kashmiri walnuts and pure milk solids, each bite melts effortlessly, offering a
                  harmonious balance of nutty crunch and creamy smoothness.
                </p>
                <p>
                  What you taste isn't just fudge - it's time, love, and heritage. It's the patience of moonlit nights
                  and the warmth of hands that have stirred this recipe for over a century.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Three Sacred Elements */}
      <section className="py-12 md:py-16 lg:py-20 px-4 bg-amber-100">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif text-amber-900 mb-4">
              Four Sacred Elements
            </h2>
            <p className="text-amber-800/80 text-lg md:text-xl">
              The pure ingredients that make our fudge extraordinary
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {ingredients.map((ingredient, index) => (
              <div key={ingredient.name} className="bg-white border border-amber-200 rounded-xl shadow-lg text-center p-6 md:p-8 hover:shadow-xl transition-shadow duration-300">
                {/* <div className="text-6xl md:text-7xl mb-4 md:mb-6">
                  {ingredient.icon}
                </div> */}
                <h3 className="text-xl md:text-2xl font-serif text-amber-900 mb-3 md:mb-4">
                  {ingredient.name}
                </h3>
                <p className="text-amber-800/80 leading-relaxed">
                  {ingredient.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
            
      {/* From Our Valley to Your Home */}
      <section className="py-12 md:py-16 lg:py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif text-amber-900 mb-6 md:mb-8">
            From Our Valley to Your Home
          </h2>
          <div className="text-lg md:text-xl text-amber-800/90 leading-relaxed max-w-3xl mx-auto space-y-4 md:space-y-6">
            <p>
              Today, we carry forward that legacy, honoring the hands and hearts that started it. What began as a
              familial ritual grew into a cherished tradition, symbolizing warmth, togetherness, and memory.
            </p>
            <p>
              This fudge carries that same legacy - not just a sweet, but a story. Every block is a piece of nostalgia,
              shaped by love, memory, and the magic of moonlight.
            </p>
            <p>
              With every piece of Moonlight Fudge, we invite you into our story - one that began long ago, under the
              moonlight, and continues today in your home, creating new memories with every bite.
            </p>
          </div>

        </div>
      </section>

      {/* Quote Section */}
      <section className="py-12 md:py-16 lg:py-20 px-4 bg-amber-900 text-white">
        <div className="container mx-auto max-w-4xl text-center">
          <blockquote className="text-xl md:text-2xl lg:text-3xl font-serif italic leading-relaxed mb-6 md:mb-8">
            "In the heart of Srinagar, where the morning mist kisses the Dal Lake, our story began in 1896."
          </blockquote>
          <div className="text-base md:text-lg opacity-90">- The Moonlight Family</div>
        </div>
      </section>
    </div>
  )
}