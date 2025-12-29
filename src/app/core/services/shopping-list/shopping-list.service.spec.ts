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
});
