import { TestBed } from '@angular/core/testing';

import { ShoppingListService } from './shopping-list.service';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from '../../../environments/environment.prod';
import {
  ShoppingList,
  CreateShoppingListRequest,
  UpdateShoppingListRequest,
  ShoppingListItem,
  AddProductToListRequest,
  UpdateQuantityRequest,
} from '../../models/shopping-list.model';
import { provideHttpClient } from '@angular/common/http';

describe('ShoppingListService', () => {
  let service: ShoppingListService;
  let httpMock: HttpTestingController;
  const baseUrl = `${environment.apiUrl}${environment.apiEndpoints.shoppingLists}`;

  const mockShoppingList: ShoppingList = {
    listId: 1,
    title: 'Weekly Groceries',
    description: 'Shopping list for this week',
    isArchived: false,
    createdAt: '2025-01-01T10:00:00',
    updatedAt: '2025-01-01T10:00:00',
  };

  const mockShoppingLists: ShoppingList[] = [
    mockShoppingList,
    {
      listId: 2,
      title: 'Party Supplies',
      description: 'Items for birthday party',
      isArchived: false,
      createdAt: '2025-01-02T10:00:00',
      updatedAt: '2025-01-02T10:00:00',
    },
  ];

  const mockShoppingListItem: ShoppingListItem = {
    listItemId: 1,
    productId: 1,
    productName: 'Pomidory',
    quantity: 3,
    unit: 'kg',
    priceAtAddition: 5.99,
    isChecked: false,
    addedAt: '2025-01-01T10:00:00',
  };

  const mockShoppingListItems: ShoppingListItem[] = [
    mockShoppingListItem,
    {
      listItemId: 2,
      productId: 2,
      productName: 'Banany',
      quantity: 2,
      unit: 'kg',
      priceAtAddition: 4.99,
      isChecked: true,
      addedAt: '2025-01-01T10:05:00',
    },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ShoppingListService, provideHttpClient(), provideHttpClientTesting()],
    });
    httpMock = TestBed.inject(HttpTestingController);
    service = TestBed.inject(ShoppingListService);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('createShoppingList', () => {
    it('should create a new shopping list', () => {
      const request: CreateShoppingListRequest = {
        title: 'Weekly Groceries',
        description: 'Shopping list for this week',
      };

      service.createShoppingList(request).subscribe(list => {
        expect(list).toEqual(mockShoppingList);
        expect(list.title).toBe(request.title);
      });

      const req = httpMock.expectOne(baseUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(request);
      req.flush(mockShoppingList);
    });

    it('should create shopping list without description', () => {
      const request: CreateShoppingListRequest = {
        title: 'Simple List',
      };

      service.createShoppingList(request).subscribe(list => {
        expect(list).toBeDefined();
      });

      const req = httpMock.expectOne(baseUrl);
      expect(req.request.body).toEqual(request);
      req.flush({ ...mockShoppingList, title: 'Simple List', description: '' });
    });

    it('should handle validation error for empty title', () => {
      const request: CreateShoppingListRequest = {
        title: '',
      };

      service.createShoppingList(request).subscribe({
        error: error => {
          expect(error.status).toBe(400);
        },
      });

      const req = httpMock.expectOne(baseUrl);
      req.flush({ message: 'Title cannot be empty' }, { status: 400, statusText: 'Bad Request' });
    });

    it('should handle unauthorized error', () => {
      const request: CreateShoppingListRequest = {
        title: 'Test List',
      };

      service.createShoppingList(request).subscribe({
        error: error => {
          expect(error.status).toBe(401);
        },
      });

      const req = httpMock.expectOne(baseUrl);
      req.flush({ message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });
    });
  });

  describe('getActiveShoppingLists', () => {
    it('should fetch all active shopping lists', () => {
      service.getActiveShoppingLists().subscribe(lists => {
        expect(lists).toEqual(mockShoppingLists);
        expect(lists.length).toBe(2);
        expect(lists.every(list => !list.isArchived)).toBe(true);
      });

      const req = httpMock.expectOne(`${baseUrl}/active`);
      expect(req.request.method).toBe('GET');
      req.flush(mockShoppingLists);
    });

    it('should return empty array when no active lists exist', () => {
      service.getActiveShoppingLists().subscribe(lists => {
        expect(lists).toEqual([]);
      });

      const req = httpMock.expectOne(`${baseUrl}/active`);
      req.flush([]);
    });

    it('should handle server error', () => {
      service.getActiveShoppingLists().subscribe({
        error: error => {
          expect(error.status).toBe(500);
        },
      });

      const req = httpMock.expectOne(`${baseUrl}/active`);
      req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });
    });
  });

  describe('getAllShoppingLists', () => {
    it('should fetch all shopping lists including archived', () => {
      const allLists = [...mockShoppingLists, { ...mockShoppingList, listId: 3, isArchived: true }];

      service.getAllShoppingLists().subscribe(lists => {
        expect(lists).toEqual(allLists);
        expect(lists.length).toBe(3);
      });

      const req = httpMock.expectOne(`${baseUrl}/all`);
      expect(req.request.method).toBe('GET');
      req.flush(allLists);
    });

    it('should return empty array when no lists exist', () => {
      service.getAllShoppingLists().subscribe(lists => {
        expect(lists).toEqual([]);
      });

      const req = httpMock.expectOne(`${baseUrl}/all`);
      req.flush([]);
    });
  });

  describe('getShoppingListById', () => {
    it('should fetch shopping list by id', () => {
      const listId = 1;

      service.getShoppingListById(listId).subscribe(list => {
        expect(list).toEqual(mockShoppingList);
        expect(list.listId).toBe(listId);
      });

      const req = httpMock.expectOne(`${baseUrl}/${listId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockShoppingList);
    });

    it('should handle 404 when list not found', () => {
      const listId = 999;

      service.getShoppingListById(listId).subscribe({
        error: error => {
          expect(error.status).toBe(404);
        },
      });

      const req = httpMock.expectOne(`${baseUrl}/${listId}`);
      req.flush('Shopping list not found', { status: 404, statusText: 'Not Found' });
    });
  });

  describe('updateShoppingListTitle', () => {
    it('should update shopping list title', () => {
      const listId = 1;
      const request: UpdateShoppingListRequest = {
        title: 'Updated Weekly Groceries',
      };

      service.updateShoppingListTitle(listId, request).subscribe(list => {
        expect(list.title).toBe(request.title);
      });

      const req = httpMock.expectOne(`${baseUrl}/${listId}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(request);
      req.flush({ ...mockShoppingList, title: request.title });
    });

    it('should handle validation error for empty title', () => {
      const listId = 1;
      const request: UpdateShoppingListRequest = {
        title: '',
      };

      service.updateShoppingListTitle(listId, request).subscribe({
        error: error => {
          expect(error.status).toBe(400);
        },
      });

      const req = httpMock.expectOne(`${baseUrl}/${listId}`);
      req.flush({ message: 'Title cannot be empty' }, { status: 400, statusText: 'Bad Request' });
    });

    it('should handle 404 when list not found', () => {
      const listId = 999;
      const request: UpdateShoppingListRequest = {
        title: 'Updated Title',
      };

      service.updateShoppingListTitle(listId, request).subscribe({
        error: error => {
          expect(error.status).toBe(404);
        },
      });

      const req = httpMock.expectOne(`${baseUrl}/${listId}`);
      req.flush('Shopping list not found', { status: 404, statusText: 'Not Found' });
    });
  });

  describe('archiveShoppingList', () => {
    it('should archive shopping list', () => {
      const listId = 1;

      service.archiveShoppingList(listId).subscribe(response => {
        expect(response).toBeNull();
      });

      const req = httpMock.expectOne(`${baseUrl}/${listId}/archive`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual({});
      req.flush(null);
    });

    it('should handle 404 when list not found', () => {
      const listId = 999;

      service.archiveShoppingList(listId).subscribe({
        error: error => {
          expect(error.status).toBe(404);
        },
      });

      const req = httpMock.expectOne(`${baseUrl}/${listId}/archive`);
      req.flush('Shopping list not found', { status: 404, statusText: 'Not Found' });
    });
  });

  describe('deleteShoppingList', () => {
    it('should delete shopping list', () => {
      const listId = 1;

      service.deleteShoppingList(listId).subscribe(response => {
        expect(response).toBeNull();
      });

      const req = httpMock.expectOne(`${baseUrl}/${listId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });

    it('should handle 404 when list not found', () => {
      const listId = 999;

      service.deleteShoppingList(listId).subscribe({
        error: error => {
          expect(error.status).toBe(404);
        },
      });

      const req = httpMock.expectOne(`${baseUrl}/${listId}`);
      req.flush('Shopping list not found', { status: 404, statusText: 'Not Found' });
    });
  });

  describe('addProductToList', () => {
    it('should add product to shopping list', () => {
      const listId = 1;
      const request: AddProductToListRequest = {
        productId: 1,
        quantity: 3,
      };

      service.addProductToList(listId, request).subscribe(item => {
        expect(item).toEqual(mockShoppingListItem);
        expect(item.productId).toBe(request.productId);
        expect(item.quantity).toBe(request.quantity);
      });

      const req = httpMock.expectOne(`${baseUrl}/${listId}/items`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(request);
      req.flush(mockShoppingListItem);
    });

    it('should handle validation error for invalid quantity', () => {
      const listId = 1;
      const request: AddProductToListRequest = {
        productId: 1,
        quantity: 0,
      };

      service.addProductToList(listId, request).subscribe({
        error: error => {
          expect(error.status).toBe(400);
        },
      });

      const req = httpMock.expectOne(`${baseUrl}/${listId}/items`);
      req.flush(
        { message: 'Quantity must be at least 1' },
        { status: 400, statusText: 'Bad Request' }
      );
    });

    it('should handle error when product already in list', () => {
      const listId = 1;
      const request: AddProductToListRequest = {
        productId: 1,
        quantity: 2,
      };

      service.addProductToList(listId, request).subscribe({
        error: error => {
          expect(error.status).toBe(400);
        },
      });

      const req = httpMock.expectOne(`${baseUrl}/${listId}/items`);
      req.flush({ message: 'Product already in list' }, { status: 400, statusText: 'Bad Request' });
    });

    it('should handle non-existent product', () => {
      const listId = 1;
      const request: AddProductToListRequest = {
        productId: 999,
        quantity: 1,
      };

      service.addProductToList(listId, request).subscribe({
        error: error => {
          expect(error.status).toBe(404);
        },
      });

      const req = httpMock.expectOne(`${baseUrl}/${listId}/items`);
      req.flush('Product not found', { status: 404, statusText: 'Not Found' });
    });
  });

  describe('getShoppingListItems', () => {
    it('should fetch all items in shopping list', () => {
      const listId = 1;

      service.getShoppingListItems(listId).subscribe(items => {
        expect(items).toEqual(mockShoppingListItems);
        expect(items.length).toBe(2);
      });

      const req = httpMock.expectOne(`${baseUrl}/${listId}/items`);
      expect(req.request.method).toBe('GET');
      req.flush(mockShoppingListItems);
    });

    it('should return empty array when list has no items', () => {
      const listId = 1;

      service.getShoppingListItems(listId).subscribe(items => {
        expect(items).toEqual([]);
      });

      const req = httpMock.expectOne(`${baseUrl}/${listId}/items`);
      req.flush([]);
    });

    it('should handle non-existent list', () => {
      const listId = 999;

      service.getShoppingListItems(listId).subscribe({
        error: error => {
          expect(error.status).toBe(404);
        },
      });

      const req = httpMock.expectOne(`${baseUrl}/${listId}/items`);
      req.flush('Shopping list not found', { status: 404, statusText: 'Not Found' });
    });
  });

  describe('updateItemQuantity', () => {
    it('should update item quantity', () => {
      const itemId = 1;
      const request: UpdateQuantityRequest = {
        quantity: 5,
      };

      service.updateItemQuantity(itemId, request).subscribe(item => {
        expect(item.quantity).toBe(request.quantity);
      });

      const req = httpMock.expectOne(`${baseUrl}/items/${itemId}/quantity`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(request);
      req.flush({ ...mockShoppingListItem, quantity: request.quantity });
    });

    it('should handle validation error for invalid quantity', () => {
      const itemId = 1;
      const request: UpdateQuantityRequest = {
        quantity: 0,
      };

      service.updateItemQuantity(itemId, request).subscribe({
        error: error => {
          expect(error.status).toBe(400);
        },
      });

      const req = httpMock.expectOne(`${baseUrl}/items/${itemId}/quantity`);
      req.flush(
        { message: 'Quantity must be at least 1' },
        { status: 400, statusText: 'Bad Request' }
      );
    });

    it('should handle non-existent item', () => {
      const itemId = 999;
      const request: UpdateQuantityRequest = {
        quantity: 5,
      };

      service.updateItemQuantity(itemId, request).subscribe({
        error: error => {
          expect(error.status).toBe(404);
        },
      });

      const req = httpMock.expectOne(`${baseUrl}/items/${itemId}/quantity`);
      req.flush('Item not found', { status: 404, statusText: 'Not Found' });
    });
  });
});
