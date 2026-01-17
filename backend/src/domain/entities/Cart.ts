export interface CartItem {
  id: string;
  userId: string;
  productId: string;
  title: string;
  imageUrl: string;
  price: number;
  quantity: number;
  createdAt: string;
  updatedAt: string;
}

export interface CartItemInput {
  userId: string;
  productId: string;
  title: string;
  imageUrl: string;
  price: number;
  quantity: number;
}

