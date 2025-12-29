import { TestBed } from '@angular/core/testing';

import { ShoppingListService } from './shopping-list.service';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from '../../../environments/environment.prod';
import { ShoppingList, CreateShoppingListRequest } from '../../models/shopping-list.model';
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
});
