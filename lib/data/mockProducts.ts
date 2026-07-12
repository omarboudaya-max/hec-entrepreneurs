import { Product } from "@/store/cartStore";

export const MOCK_PRODUCTS: Product[] = [
  {
    id: "1",
    name: "T-Shirt HEC Entrepreneurs Classique",
    description: "T-shirt en coton bio avec le logo IHEC Entrepreneurs brodé.",
    price: 35.0,
    image_url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80",
    category: "Vêtements",
    stock: 50,
    is_available: true,
  },
  {
    id: "2",
    name: "Hoodie HEC Premium",
    description: "Sweat à capuche ultra-confortable pour l'hiver.",
    price: 65.0,
    discount_price: 55.0,
    image_url: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80",
    category: "Vêtements",
    stock: 20,
    is_available: true,
  },
  {
    id: "3",
    name: "Mug HEC Entrepreneurs",
    description: "Commencez votre journée avec l'esprit entrepreneurial.",
    price: 15.0,
    image_url: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=800&q=80",
    category: "Accessoires",
    stock: 100,
    is_available: true,
  },
  {
    id: "4",
    name: "Carnet de Notes Moleskine Edition HEC",
    description: "Idéal pour noter vos prochaines grandes idées de startup.",
    price: 25.0,
    image_url: "https://images.unsplash.com/photo-1531346878377-244c428fc49d?w=800&q=80",
    category: "Papeterie",
    stock: 10,
    is_available: true,
  }
];
