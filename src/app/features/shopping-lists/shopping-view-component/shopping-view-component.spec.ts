import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShoppingViewComponent } from './shopping-view-component';
import { of } from 'rxjs';
import { ShoppingListService } from '../../../core/services/shopping-list/shopping-list.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ShoppingList, ShoppingListItem } from '../../../core/models/shopping-list.model';

describe('ShoppingViewComponent', () => {
  let component: ShoppingViewComponent;
  let fixture: ComponentFixture<ShoppingViewComponent>;
  let shoppingListService: jasmine.SpyObj<ShoppingListService>;
  let router: jasmine.SpyObj<Router>;

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

  beforeEach(async () => {
    const shoppingListServiceSpy = jasmine.createSpyObj('ShoppingListService', [
      'getShoppingListById',
      'getShoppingListItems',
      'toggleItemChecked',
    ]);

    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [ShoppingViewComponent],
      providers: [
        { provide: ShoppingListService, useValue: shoppingListServiceSpy },
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
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    shoppingListService.getShoppingListById.and.returnValue(of(mockList));
    shoppingListService.getShoppingListItems.and.returnValue(of(mockItems));

    fixture = TestBed.createComponent(ShoppingViewComponent);
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

    it('should extract listId from route params', () => {
      expect(component.listId).toBe(1);
    });

    it('should navigate to dashboard if listId is missing', () => {
      const invalidRoute = {
        snapshot: { paramMap: { get: () => null } },
      };

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [ShoppingViewComponent],
        providers: [
          { provide: ShoppingListService, useValue: shoppingListService },
          { provide: Router, useValue: router },
          { provide: ActivatedRoute, useValue: invalidRoute },
        ],
      }).compileComponents();

      const newFixture = TestBed.createComponent(ShoppingViewComponent);
      newFixture.detectChanges();

      expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
    });
  });
});
