import React from 'react'

const ProductSection = () => {
  return (
    <section id="products" className="py-24 bg-[var(--background-color)]">
    <div className="container px-6">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-serif text-[var(--primary-color)] mb-4">
          Our Collection
        </h2>
      </div>
      <div className="grid md:grid-cols-3 gap-8">
        {[
          {
            name: "Daily Treat",
            weight: "100g",
            price: "₹299",
            description: "Perfect for your everyday indulgence",
            image: "https://pbs.twimg.com/media/FQxZ-qjaQAExOGP.jpg:large",
          },
          {
            name: "Celebration Treat",
            weight: "500g",
            price: "₹1,299",
            description: "Ideal for special occasions and gifting",
            image:
              "https://media-assets.swiggy.com/swiggy/image/upload/f_auto,q_auto,fl_lossy/RX_THUMBNAIL/IMAGES/VENDOR/2025/4/25/d36939e6-8514-4979-86ca-14dfdde50069_1081261.jpg.jpg",
            featured: true,
          },
          {
            name: "Family Treat",
            weight: "1kg",
            price: "₹2,399",
            image:
              "https://i0.wp.com/yummraj.com/wp-content/uploads/2022/07/img_6940.jpg?resize=720%2C960&ssl=1",
            description: "Share the joy with your loved ones",
          },
        ].map((product, index) => (
          <div
            key={product.name}
            className={`group relative bg-white rounded-3xl p-8 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 ${
              product.featured ? "ring-2 ring-[var(--accent-color)] scale-105" : ""
            }`}
          >
            {product.featured && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-[var(--accent-color)] text-[var(--primary-color)] px-6 py-2 rounded-full text-sm font-medium">
                Most Popular
              </div>
            )}
            <div className="text-center">
              <img
                src={product.image || "/placeholder.svg"}
                alt={product.name}
                className="w-full h-48 object-cover rounded-2xl mb-6 group-hover:scale-105 transition-transform duration-300"
              />
              <h3 className="text-2xl font-serif text-[var(--primary-color)] mb-2">
                {product.name}
              </h3>
              <p className="text-[var(--secondary-color)] font-medium text-lg mb-2">
                {product.weight}
              </p>
              <p className="text-[var(--text-color)] mb-4 leading-relaxed">
                {product.description}
              </p>
              <div className="text-3xl font-serif text-[var(--primary-color)] mb-6">
                {product.price}
              </div>
              <button className="w-full bg-[var(--primary-color)] hover:bg-[var(--primary-second-color)] text-white rounded-full py-3 transition-all duration-300 hover:scale-105">
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>  )
}

export default ProductSection