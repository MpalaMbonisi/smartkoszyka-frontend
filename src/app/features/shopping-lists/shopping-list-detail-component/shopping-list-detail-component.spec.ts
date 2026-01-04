import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShoppingListDetailComponent } from './shopping-list-detail-component';
import { ShoppingListService } from '../../../core/services/shopping-list/shopping-list.service';
import { ProductService } from '../../../core/services/product/product.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { Product } from '../../../core/models/product.model';
import { ShoppingList, ShoppingListItem } from '../../../core/models/shopping-list.model';

describe('ShoppingListDetailComponent', () => {
  let component: ShoppingListDetailComponent;
  let fixture: ComponentFixture<ShoppingListDetailComponent>;
  let shoppingListService: jasmine.SpyObj<ShoppingListService>;
  let productService: jasmine.SpyObj<ProductService>;
  let router: jasmine.SpyObj<Router>;
  let activatedRoute: ActivatedRoute;

  const mockList: ShoppingList = {
    listId: 1,
    title: 'Weekly Groceries',
    description: 'Shopping for the week',
    isArchived: false,
    createdAt: '2025-01-01T10:00:00',
    updatedAt: '2025-01-01T10:00:00',
  };

  const mockItems: ShoppingListItem[] = [
    {
      listItemId: 1,
      productId: 1,
      productName: 'Pomidory',
      quantity: 3,
      unit: 'kg',
      priceAtAddition: 5.99,
      isChecked: false,
      addedAt: '2025-01-01T10:00:00',
    },
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

  const mockProducts: Product[] = [
    {
      id: 1,
      name: 'Pomidory',
      price: 5.99,
      unit: 'kg',
      imageUrl: 'https://example.com/pomidory.jpg',
      brand: 'Biedronka',
      categoryId: 1,
      categoryName: 'Warzywa',
      createdAt: '2025-01-01T10:00:00',
      updatedAt: '2025-01-01T10:00:00',
    },
  ];

  beforeEach(async () => {
    const shoppingListServiceSpy = jasmine.createSpyObj('ShoppingListService', [
      'getShoppingListById',
      'getShoppingListItems',
      'addProductToList',
      'updateItemQuantity',
      'toggleItemChecked',
      'removeItemFromList',
      'updateShoppingListTitle',
    ]);

    const productServiceSpy = jasmine.createSpyObj('ProductService', [
      'getAllProducts',
      'searchProducts',
    ]);

    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [ShoppingListDetailComponent, ReactiveFormsModule],
      providers: [
        { provide: ShoppingListService, useValue: shoppingListServiceSpy },
        { provide: ProductService, useValue: productServiceSpy },
        { provide: Router, useValue: routerSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: { get: () => '1' } },
          },
        },
      ],
    }).compileComponents();

    shoppingListService = TestBed.inject(
      ShoppingListService
    ) as jasmine.SpyObj<ShoppingListService>;
    productService = TestBed.inject(ProductService) as jasmine.SpyObj<ProductService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    activatedRoute = TestBed.inject(ActivatedRoute);

    shoppingListService.getShoppingListById.and.returnValue(of(mockList));
    shoppingListService.getShoppingListItems.and.returnValue(of(mockItems));
    productService.getAllProducts.and.returnValue(of(mockProducts));

    fixture = TestBed.createComponent(ShoppingListDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Component Initialization', () => {
    it('should load list details on init', () => {
      expect(shoppingListService.getShoppingListById).toHaveBeenCalledWith(1);
      expect(component.shoppingList()).toEqual(mockList);
    });

    it('should load list items on init', () => {
      expect(shoppingListService.getShoppingListItems).toHaveBeenCalledWith(1);
      expect(component.items()).toEqual(mockItems);
    });

    it('should load all products on init', () => {
      expect(productService.getAllProducts).toHaveBeenCalled();
      expect(component.availableProducts()).toEqual(mockProducts);
    });

    it('should extract listId from route params', () => {
      expect(component.listId).toBe(1);
    });

    it('should handle missing listId in route', () => {
      const invalidRoute = {
        snapshot: { paramMap: { get: () => null } },
      };

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [ShoppingListDetailComponent],
        providers: [
          { provide: ShoppingListService, useValue: shoppingListService },
          { provide: ProductService, useValue: productService },
          { provide: Router, useValue: router },
          { provide: ActivatedRoute, useValue: invalidRoute },
        ],
      }).compileComponents();

      const newFixture = TestBed.createComponent(ShoppingListDetailComponent);
      newFixture.detectChanges();

      expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
    });

    it('should handle error loading list', () => {
      const error = new Error('Not found');
      shoppingListService.getShoppingListById.and.returnValue(throwError(() => error));

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [ShoppingListDetailComponent],
        providers: [
          { provide: ShoppingListService, useValue: shoppingListService },
          { provide: ProductService, useValue: productService },
          { provide: Router, useValue: router },
          { provide: ActivatedRoute, useValue: activatedRoute },
        ],
      }).compileComponents();

      const newFixture = TestBed.createComponent(ShoppingListDetailComponent);
      const newComponent = newFixture.componentInstance;
      newFixture.detectChanges();

      expect(newComponent.errorMessage()).toBe('Failed to load shopping list.');
    });
  });

  describe('Calculate Total', () => {
    it('should calculate total price correctly', () => {
      expect(component.totalPrice()).toBeCloseTo(27.95, 2); // (3 * 5.99) + (2 * 4.99)
    });

    it('should return 0 for empty list', () => {
      component.items.set([]);
      expect(component.totalPrice()).toBe(0);
    });

    it('should update when items change', () => {
      const newItems: ShoppingListItem[] = [{ ...mockItems[0], quantity: 5 }];
      component.items.set(newItems);
      expect(component.totalPrice()).toBeCloseTo(29.95, 2);
    });
  });
});
