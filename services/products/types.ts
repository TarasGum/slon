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
interface Image {
  image: string;
  product: number;
}

export type Product = {
  id: number;
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

export type ProductQueryParams = {
  categories: number[];
  ordering: string;
  search: string;
  years: number[];
};

export type InputCreateProduct = {
  title: string;
  year: number;
  slug: string;
  description: string;
  category: Category;
  tags: Tag[];
  variants: Variant[];
  recommendations: Recommendation[];
  thumbnail: string;
  full_description: string;
  images: Image[];
};

export type InputUpdateProduct = {
  title: string;
  year: number;
  slug: string;
  description: string;
  category: Category;
  tags: Tag[];
  variants: Variant[];
  recommendations: Recommendation[];
  thumbnail: string;
  full_description: string;
  images: Image[];
};
