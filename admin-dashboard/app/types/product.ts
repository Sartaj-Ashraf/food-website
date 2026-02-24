export interface Product {
  _id: string;
  slug: string;
  title: string;
  description: string;
  numberOfPieces: number;
  category: string;
  price: number;
  discountPrice?: number;
  quantity: string;
  images: string[];
  ingredients: string[];
  isFeatured: boolean;
  isActive: boolean;
  status: "out_of_stock" | "in_stock";
  createdAt: string;
  createdBy: {
    name: string;
    email: string;
  };
}
