export interface ShoppingList {
  listId: number;
  title: string;
  description: string;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ShoppingListItem {
  listItemId: number;
  productId: number;
  productName: string;
  quantity: number;
  unit: string;
  priceAtAddition: number;
  isChecked: boolean;
  addedAt: string;
}

export interface CreateShoppingListRequest {
  title: string;
  description?: string;
}

export interface UpdateShoppingListRequest {
  title: string;
}

export interface AddProductToListRequest {
  productId: number;
  quantity: number;
}

export interface UpdateQuantityRequest {
  quantity: number;
}
