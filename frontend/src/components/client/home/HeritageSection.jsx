import React from 'react'
import {heritage} from '@/assets'

const HeritageSection = () => {
  return (
    <section
      id="heritage"
      className="py-24 bg-[var(--background-color)] relative  h-screen overflow-hidden"
      style={{
        backgroundImage: `url(${heritage.src})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed"
      }}
    >
       <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-[var(--background-color)] to-transparent z-10 pointer-events-none"></div>
              {/* Bottom fade overlay */}
              <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[var(--background-color)] to-transparent z-10 pointer-events-none"></div>
      {/* Overlay for opacity and color */}
      <div className="absolute inset-0 bg-[var(--background-color)] opacity-90 z-0"></div>
      
      {/* Content layer */}
      <div className="relative z-10 container px-4 sm:px-6">
        {/* Elegant divider */}
        <div className="flex items-center justify-center mb-8">
          <div className="h-px bg-[var(--primary-color)]/30 flex-1 max-w-24"></div>
          <div className="mx-8">
            <div className="w-2 h-2 bg-[var(--accent-color)] rounded-full"></div>
          </div>
          <div className="h-px bg-[var(--primary-color)]/30 flex-1 max-w-24"></div>
        </div>

        {/* Main heading */}
        <div className="text-center mb-10">
          <h2 className="text-4xl md:text-5xl font-serif text-[var(--primary-color)] mb-3 leading-tight">
            Moonlight
          </h2>
          <p className="text-xl md:text-2xl font-light italic text-[var(--accent-color)] tracking-wide">
            A Heritage of 127 Years
          </p>
        </div>

        {/* Story content */}
        <div className="mx-auto">
          {/* Opening quote */}
          <div className="text-center mb-8">
            <p className="text-2xl md:text-3xl font-serif text-[var(--primary-color)] leading-relaxed italic">
              "In the heart of Srinagar, where the morning mist kisses the Dal
              Lake, our story began in 1896."
            </p>
          </div>

          {/* Main story */}
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <p className="text-lg md:text-xl text-[var(--primary-color)] leading-relaxed">
                Four generations have lovingly crafted each piece of Moonlight
                Walnut Fudge, preserving the authentic taste that has become a
                cherished part of Kashmir's culinary heritage.
              </p>
              <p className="text-lg text-[var(--text-color)] leading-relaxed">
                Every bite carries the warmth of our ancestors' hands and the
                purity of ingredients that have remained unchanged for over a
                century.
              </p>
            </div>

            {/* Heritage timeline */}
            <div className="space-y-8">
              <div className="flex items-center space-x-6">
                <div className="text-4xl font-serif text-[var(--accent-color)]">1896</div>
                <div className="h-px bg-[var(--border-color)]/30 flex-1"></div>
                <div className="text-sm text-[var(--text-color)] uppercase tracking-wider">
                  Founded
                </div>
              </div>
              <div className="flex items-center space-x-6">
                <div className="text-4xl font-serif text-[var(--accent-color)]">4</div>
                <div className="h-px bg-[var(--border-color)]/30 flex-1"></div>
                <div className="text-sm text-[var(--text-color)] uppercase tracking-wider">
                  Generations
                </div>
              </div>
              <div className="flex items-center space-x-6">
                <div className="text-4xl font-serif text-[var(--accent-color)]">127</div>
                <div className="h-px bg-[var(--border-color)]/30 flex-1"></div>
                <div className="text-sm text-[var(--text-color)] uppercase tracking-wider">
                  Years
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeritageSection