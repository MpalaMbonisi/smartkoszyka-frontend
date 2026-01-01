import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.prod';
import {
  AddProductToListRequest,
  CreateShoppingListRequest,
  ShoppingList,
  ShoppingListItem,
  UpdateQuantityRequest,
  UpdateShoppingListRequest,
} from '../../models/shopping-list.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ShoppingListService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;
  private baseUrl = `${this.apiUrl}${environment.apiEndpoints.shoppingLists}`;

  // Shopping List CRUD Operations
  createShoppingList(request: CreateShoppingListRequest): Observable<ShoppingList> {
    return this.http.post<ShoppingList>(this.baseUrl, request);
  }

  getActiveShoppingLists(): Observable<ShoppingList[]> {
    return this.http.get<ShoppingList[]>(`${this.baseUrl}/active`);
  }

  getAllShoppingLists(): Observable<ShoppingList[]> {
    return this.http.get<ShoppingList[]>(`${this.baseUrl}/all`);
  }

  getShoppingListById(listId: number): Observable<ShoppingList> {
    return this.http.get<ShoppingList>(`${this.baseUrl}/${listId}`);
  }

  updateShoppingListTitle(
    listId: number,
    request: UpdateShoppingListRequest
  ): Observable<ShoppingList> {
    return this.http.put<ShoppingList>(`${this.baseUrl}/${listId}`, request);
  }

  archiveShoppingList(listId: number): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${listId}/archive`, {});
  }

  deleteShoppingList(listId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${listId}`);
  }

  // Shopping List Items Operations
  addProductToList(listId: number, request: AddProductToListRequest): Observable<ShoppingListItem> {
    return this.http.post<ShoppingListItem>(`${this.baseUrl}/${listId}/items`, request);
  }

  getShoppingListItems(listId: number): Observable<ShoppingListItem[]> {
    return this.http.get<ShoppingListItem[]>(`${this.baseUrl}/${listId}/items`);
  }

  updateItemQuantity(itemId: number, request: UpdateQuantityRequest): Observable<ShoppingListItem> {
    return this.http.put<ShoppingListItem>(`${this.baseUrl}/items/${itemId}/quantity`, request);
  }

  toggleItemChecked(itemId: number): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/items/${itemId}/toggle`, {});
  }

  removeItemFromList(itemId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/items/${itemId}`);
  }
}
