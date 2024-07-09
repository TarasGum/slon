interface Category {
  id: number;
  name: string;
}

interface Tag {
  id: number;
  name: string;
}

interface Variant {
  id: number;
  packaging: string;
  inventory: number;
  price: string;
}

interface Recommendation {
  id: number;
  title: string;
  color: string;
}

export type CartItem = {
  id: number;
  qty: number;
  currentVariant: number;
  title: string;
  year: number;
  slug: string;
  description: string;
  category: Category;
  tags: Tag[];
  variants: Variant[];
  recommendations: Recommendation[];
  thumbnail: string;
};
