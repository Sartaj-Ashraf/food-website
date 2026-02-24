import { ProductDescriptionSection } from "@/components/productSinglePage/ProductDescriptionSection";
import { RelatedProductsSection } from "@/components/productSinglePage/RelatedProductsSection";
import { customFetch } from "@/utils/customFetch";
import { ProductDetailsSection, ProductImageGallery } from "@/components";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

const page = async ({ params , searchParams }) => {
  const type = searchParams.type;
  const { id } = params;
  const url = type === "combo" ? "combos/combo" : "products"
  const { data } = await customFetch.get(`/${url}/slug/${id}`);


  return (
    <div className="mt-20 container min-h-screen ">
         <div className="flex items-center text-base text-[var(--primary-color)] mb-10">
        <Link href="/">Home</Link> <ChevronRight size={20} /> <span> Shop</span> <ChevronRight size={20} /> <span className="capitalize"> {type ==="combo" ? data.combo.name : data.product.title} </span>
      </div>
      <div className="bg-white">
        <div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <ProductImageGallery
                images={type ==="combo" ? data.combo.images : data.product.images}
                productName={type ==="combo" ? data.combo.name : data.product.title}
              />
            </div>
            <ProductDetailsSection 
            itemId={type ==="combo" ? data.combo._id : data.product._id}
            itemType={type}
            title={type ==="combo" ? data.combo.name : data.product.title} 
            price={type ==="combo" ? data.combo.originalPrice : data.product.price} 
            discountPrice={type ==="combo" ? data.combo.comboPrice : data.product.discountPrice} 
            product={type ==="combo" ? data.combo.products : data.product}
            status={type ==="combo" ? data.combo.status : data.product.status}
            description={type ==="combo" ? data.combo.description : data.product.description} 
            />
          </div>
        </div>
      </div>
      {/* Description Section */}
      {/* Related Products */}
      {/* <RelatedProductsSection product={data.product} /> */}
    </div>
  );
};

export default page;
