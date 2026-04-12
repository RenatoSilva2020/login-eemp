export interface ShoppingItem {
  id: string;
  name: string;
  quantity: number;
  category?: string;
  isBought: boolean;
}

export interface CartItem extends ShoppingItem {
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface PurchaseHistory {
  id: string;
  date: string;
  items: CartItem[];
  totalAmount: number;
}
