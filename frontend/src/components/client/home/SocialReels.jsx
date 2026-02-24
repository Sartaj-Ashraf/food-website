"use client";
import React, { useEffect, useRef, useState } from 'react'
import { Instagram, Play, Loader2 } from 'lucide-react'

const SocialReels = () => {
  const reelsContainerRef = useRef(null)
  const [isLoading, setIsLoading] = useState(true)
  const [embedsLoaded, setEmbedsLoaded] = useState(false)

  // Replace these URLs with actual reel URLs from moonlight_thewalnutfudge_shop
  const reelData = [
    {
      id: 1,
      url: "https://www.instagram.com/reel/DNVx9pLvj1I/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==",
      caption: "Behind the scenes of fudge making",
      fallbackImage: "/api/placeholder/300/400"
    },
    {
      id: 2,
      url: "https://www.instagram.com/reel/DONykMpiQTg/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==",
      caption: "Crafting the perfect walnut fudge",
      fallbackImage: "/api/placeholder/300/400"
    },
    {
      id: 3,
      url: "https://www.instagram.com/reel/DN0Xti-XIRw/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==",
      caption: "Moonlight kitchen magic",
      fallbackImage: "/api/placeholder/300/400"
    }
  ]

  // Generate embed codes from URLs
  const generateEmbedCode = (url) => {
    return `
      <blockquote class="instagram-media w-full max-w-full mx-auto" 
        data-instgrm-permalink="${url}?utm_source=ig_embed&amp;utm_campaign=loading" 
        data-instgrm-version="14" 
        style="background:#FFF; border:0; border-radius:16px; box-shadow:0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); margin: 0; max-width:100%; min-width:280px; padding:0; width:100%;">
        <div style="padding:16px;">
          <a href="${url}?utm_source=ig_embed&amp;utm_campaign=loading" 
             style="background:#FFFFFF; line-height:0; padding:0 0; text-align:center; text-decoration:none; width:100%; display:block;" 
             target="_blank">
          </a>
        </div>
      </blockquote>
    `
  }

  useEffect(() => {
    const loadInstagramScript = () => {
      const existingScript = document.querySelector('script[src="//www.instagram.com/embed.js"]')

      if (!existingScript) {
        const script = document.createElement('script')
        script.src = '//www.instagram.com/embed.js'
        script.async = true
        script.onload = () => {
          setIsLoading(false)
          setTimeout(() => {
            if (window.instgrm) {
              window.instgrm.Embeds.process()
              setEmbedsLoaded(true)
            }
          }, 500)
        }
        script.onerror = () => {
          setIsLoading(false)
          console.error('Failed to load Instagram embed script')
        }
        document.body.appendChild(script)
      } else {
        setIsLoading(false)
        if (window.instgrm) {
          setTimeout(() => {
            window.instgrm.Embeds.process()
            setEmbedsLoaded(true)
          }, 500)
        }
      }
    }

    loadInstagramScript()
  }, [])

  // Iframe embed component
  const IframeEmbed = ({ reel }) => {
    const [loaded, setLoaded] = useState(false)

    return (
      <div className="relative aspect-[9/16] rounded-2xl overflow-hidden bg-gray-100">
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-pink-100 to-purple-100">
            <Loader2 className="h-8 w-8 animate-spin text-pink-600" />
          </div>
        )}
        <iframe
          src={`${reel.url}embed/`}
          className={`w-full h-full border-0 transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
          allowFullScreen
          scrolling="no"
          title={reel.caption}
          onLoad={() => setLoaded(true)}
          style={{
            border: 'none',
            overflow: 'hidden'
          }}
        />
      </div>
    )
  }


  return (
    <section className="py-16 md:py-24 bg-[var(--background-color)] overflow-hidden">
      <div className="container px-4 sm:px-6 mx-auto max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[var(--primary-color)] mb-4 leading-tight">
            Moments of Indulgence
          </h2>
          <p className="text-base md:text-lg text-[var(--text-color)] max-w-2xl mx-auto leading-relaxed">
            Customers savoring the magic of Moonlight Walnut Fudge
          </p>
        </div>

        {/* Reels Grid */}
        <div
          ref={reelsContainerRef}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 mb-12 md:mb-16"
        >
          {reelData.map((reel, index) => (
            <div key={reel.id} className="group w-full">
              <div className="relative bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-4 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 w-full">

                {/* Instagram Native Embed */}
                {!isLoading && (
                  <div
                    className="w-full overflow-hidden rounded-xl sm:rounded-2xl"
                    style={{
                      maxWidth: '100%',
                      minHeight: '400px'
                    }}
                  >
                    <div
                      dangerouslySetInnerHTML={{
                        __html: generateEmbedCode(reel.url)
                      }}
                      className="w-full h-full min-h-[400px] flex items-center justify-center"
                    />
                  </div>
                )}

                {/* Loading State */}
                {isLoading && (
                  <div className="aspect-[9/16] bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl sm:rounded-2xl flex items-center justify-center min-h-[400px]">
                    <div className="text-center p-4">
                      <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-[var(--primary-color)] mx-auto mb-2" />
                      <p className="text-xs sm:text-sm text-black font-medium">Loading reel...</p>
                    </div>
                  </div>
                )}

                {/* Hover Overlay */}
                <div className="absolute inset-3 sm:inset-4 bg-black/10 rounded-xl sm:rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
                  <div className="bg-white/90 backdrop-blur-sm rounded-full p-3 sm:p-4 shadow-lg transform scale-90 group-hover:scale-100 transition-transform duration-300">
                    <Play className="h-6 w-6 sm:h-8 sm:w-8 text-[var(--primary-color)] fill-current" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Visit Instagram CTA */}
        <div className="text-center">
          <a
            href="https://instagram.com/moonlight_thewalnutfudge_shop"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-[var(--primary-color)] to-[var(--primary-second-color)] text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full font-semibold text-sm sm:text-base hover:shadow-lg hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-pink-200"
          >
            <Instagram className="h-4 w-4 sm:h-5 sm:w-5" />
            <span>Follow us on Instagram</span>
          </a>
        </div>
      </div>

      {/* Custom CSS for Instagram embeds - injected via style tag */}
      <style jsx>{`
        .instagram-media {
          max-width: 100% !important;
          min-width: 280px !important;
          width: 100% !important;
          margin: 0 auto !important;
          border-radius: 16px !important;
          overflow: hidden !important;
        }
        
        .instagram-media iframe {
          border-radius: 16px !important;
          width: 100% !important;
        }
        
        @media (max-width: 640px) {
          .instagram-media {
            min-width: 260px !important;
            max-width: 100% !important;
          }
        }
        
        @media (min-width: 640px) and (max-width: 1024px) {
          .instagram-media {
            min-width: 300px !important;
            max-width: 380px !important;
          }
        }
        
        @media (min-width: 1024px) {
          .instagram-media {
            min-width: 320px !important;
            max-width: 400px !important;
          }
        }
        
        .instagram-media::-webkit-scrollbar {
          display: none;
        }
        
        .instagram-media {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  )
}

export default SocialReels
