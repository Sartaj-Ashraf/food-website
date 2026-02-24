import { ProductCard } from "..";


export  function RelatedProductsSection({product}) {
  return (
    <div className="py-10">
      <div >
        <h2 className="text-xl font-semibold text-gray-900 mb-8">You may also like</h2>
        <div className="grid grid-cols-2 md:grid-cols-4  gap-6">
            <ProductCard key={product.id} product={product} />
        </div>
      </div>
    </div>
  )
}