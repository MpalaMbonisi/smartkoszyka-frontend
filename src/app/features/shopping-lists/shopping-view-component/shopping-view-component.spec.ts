import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShoppingViewComponent } from './shopping-view-component';
import { of, throwError } from 'rxjs';
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

  describe('Active and Completed Items', () => {
    it('should separate active items', () => {
      expect(component.activeItems().length).toBe(1);
      expect(component.activeItems()[0].productName).toBe('Pomidory');
    });

    it('should separate completed items', () => {
      expect(component.completedItems().length).toBe(1);
      expect(component.completedItems()[0].productName).toBe('Banany');
    });

    it('should update active items when item is checked', () => {
      shoppingListService.toggleItemChecked.and.returnValue(of(undefined));

      const initialActiveCount = component.activeItems().length;
      component.toggleItem(1);

      expect(component.activeItems().length).toBe(initialActiveCount - 1);
    });
  });

  describe('Checked Total Price Calculation', () => {
    it('should calculate checked total price correctly', () => {
      // In mockItems, 'Banany' is checked (2 * 4.99 = 9.98)
      expect(component.checkedTotalPrice()).toBeCloseTo(9.98, 2);
    });

    it('should update checked total when an item is toggled', () => {
      shoppingListService.toggleItemChecked.and.returnValue(of(undefined));

      // Toggle 'Pomidory' (3 * 5.99 = 17.97)
      component.toggleItem(1);

      const expected = 9.98 + 17.97;
      expect(component.checkedTotalPrice()).toBeCloseTo(expected, 2);
    });
  });

  describe('Total Price Calculation', () => {
    it('should calculate total price correctly', () => {
      const expected = 3 * 5.99 + 2 * 4.99;
      expect(component.totalPrice()).toBeCloseTo(expected, 2);
    });

    it('should return 0 for empty list', () => {
      component.items.set([]);
      expect(component.totalPrice()).toBe(0);
    });
  });

  describe('Toggle Item', () => {
    it('should toggle item checked status', () => {
      shoppingListService.toggleItemChecked.and.returnValue(of(undefined));

      component.toggleItem(1);

      expect(shoppingListService.toggleItemChecked).toHaveBeenCalledWith(1);
    });

    it('should update item in list after toggle', () => {
      shoppingListService.toggleItemChecked.and.returnValue(of(undefined));
      const initialStatus = component.items()[0].isChecked;

      component.toggleItem(1);

      const item = component.items().find(i => i.listItemId === 1);
      expect(item?.isChecked).toBe(!initialStatus);
    });

    it('should handle toggle error', () => {
      spyOn(console, 'error');
      const error = new Error('Toggle failed');
      shoppingListService.toggleItemChecked.and.returnValue(throwError(() => error));

      component.toggleItem(1);

      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('Completed Section Toggle', () => {
    it('should start with completed section hidden', () => {
      expect(component.showCompleted()).toBe(false);
    });

    it('should toggle completed section visibility', () => {
      component.toggleCompletedSection();
      expect(component.showCompleted()).toBe(true);

      component.toggleCompletedSection();
      expect(component.showCompleted()).toBe(false);
    });
  });

  describe('Navigation', () => {
    it('should navigate back to dashboard', () => {
      component.goBack();
      expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
    });

    it('should navigate to edit mode', () => {
      component.goToEditMode();
      expect(router.navigate).toHaveBeenCalledWith(['/shopping-lists', 1]);
    });
  });
});
