"use client"
import { useState } from "react"
import "./style.css"

const ChevronLeft = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="15,18 9,12 15,6"></polyline>
  </svg>
)

const ChevronRight = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="9,18 15,12 9,6"></polyline>
  </svg>
)

// Extended carousel items - you can add as many as you want
const carouselItems = [
    {
      id: "fresh",
      title: " Party Pack",
      price: "500",
      image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YnJlYWR8ZW58MHx8MHx8fDA%3D",
      imageAlt: "Fresh breads and pastries in basket",
    },
    {
      id: "tasty",
      title: "Celebration Pack",
      price: "550",
      image: "https://images.unsplash.com/photo-1533782654613-826a072dd6f3?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8YnJlYWR8ZW58MHx8MHx8fDA%3D",
      imageAlt: "Tasty bread rolls",
    },
    {
      id: "natural",
      title: "Family Pack",
      price: "300",
      image: "https://images.unsplash.com/photo-1567042661848-7161ce446f85?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGJyZWFkfGVufDB8fDB8fHww",
      imageAlt: "Natural artisan breads in wicker basket",
    },
    {
      id: "organic",
      title: "Custom Pack",
      price: "650",
      image: "https://images.unsplash.com/photo-1590301157172-7ba48dd1c2b2?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fGJyZWFkfGVufDB8fDB8fHww",
      imageAlt: "Organic whole grain breads",
    },
    {
      id: "artisan",
      title: "Customized Pack",
      price: "700",
      image: "https://images.unsplash.com/photo-1536534028025-68598ea8af44?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTl8fGJyZWFkfGVufDB8fDB8fHww",
      imageAlt: "Artisan sourdough breads",
    },
    {
      id: "premium",
      title: "Premium Pack",
      price: "850",
      image: "https://images.unsplash.com/photo-1556471013-0001958d2f12?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fGJyZWFkfGVufDB8fDB8fHww",
      imageAlt: "Premium bakery selection",
    },
  ]

const CircularCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const visibleCards = 3 // Always show 3 cards

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % carouselItems.length)
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + carouselItems.length) % carouselItems.length)
  }

  const getCardPosition = (relativeIndex) => {
    // Calculate position for 3 cards in circular arrangement
    const angle = relativeIndex * (360 / visibleCards) * (Math.PI / 180)
    const radius = 220
    const centerX = -40
    const centerY = 20
    const x = centerX + radius * Math.cos(angle - Math.PI / 2)
    const y = centerY + radius * Math.sin(angle - Math.PI / 2)
    return { x, y }
  }

  const getVisibleCards = () => {
    const visible = []
    for (let i = 0; i < visibleCards; i++) {
      const cardIndex = (currentIndex + i) % carouselItems.length
      visible.push({
        ...carouselItems[cardIndex],
        originalIndex: cardIndex,
        relativeIndex: i,
      })
    }
    return visible
  }

  const visibleCardsData = getVisibleCards()

  return (
    <div className="carousel-container">
      {/* Main carousel container */}
      <div className="carousel-main">
        {/* Carousel items */}
        <div className="carousel-items">
          {visibleCardsData.map((item) => {
            const position = getCardPosition(item.relativeIndex)
            return (
              <div
                key={`${item.id}-${item.originalIndex}`}
                className="carousel-item"
                style={{
                  transform: `translate(${position.x}px, ${position.y}px)`,
                  left: "50%",
                  top: "50%",
                  marginLeft: "-100px",
                  marginTop: "-120px",
                }}
              >
                <div className="item-content">
                  {/* Image */}
                  <div className="item-image">
                    <img src={item.image || "/placeholder.svg"} alt={item.imageAlt} width="180" height="140" />
                  </div>
                  {/* Title */}
                  <h2 className="item-title">{item.title}</h2>
                  {/* Description */}
                  <p className="item-description">₹{item.price}/-</p>
                  <button className="bg-teal-800 text-white px-4 py-2 rounded-md font-medium hover:bg-teal-900 transition-colors">
                    Order now
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Navigation buttons */}
        <button onClick={prevSlide} className="nav-button nav-prev" aria-label="Previous slide">
          <ChevronLeft />
        </button>
        <button onClick={nextSlide} className="nav-button nav-next" aria-label="Next slide">
          <ChevronRight />
        </button>
      </div>

      {/* Dots indicator */}
      <div className="dots-container">
        {carouselItems.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`dot ${index === currentIndex ? "dot-active" : ""}`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}

export default CircularCarousel
