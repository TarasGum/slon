interface Category {
  id: number;
  name: string;
}

interface Order {
  id: number;
  status: string;
  customer: Customer;
  waybill: string;
  order_items: OrderItem[];
  comments: Comment[];
}

interface OrderItem {
  id: number;
  order: number;
  variant: Variant;
  price: string;
  quantity: number;
}
interface Customer {
  id: number;
  first_name: string;
  last_name: string;
  surname: string;
  phone: string;
  email: string;
}

interface Tag {
  id: number;
  name: string;
}

interface Variant {
  id?: number;
  packaging: string;
  inventory: number;
  price: string;
  product?: Product;
}

interface Recommendation {
  id?: number;
  title: string;
  color: string;
}
interface Image {
  image: string;
  product: number;
}
interface Comment {
  id: number;
  order: number;
  text: string;
  created_at: string;
  updated_at: string;
}
type Product = {
  id: number;
  title: string;
  year: number;
  slug: string;
  description: string;
  full_description: strind;
  category: Category;
  tags: Tag[];
  variants: Variant[];
  recommendations: Recommendation[];
  thumbnail: string;
  images: any;
};
