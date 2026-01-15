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

  describe('UI Rendering', () => {
    it('should display list title', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const title = compiled.querySelector('.shopping-header h2');

      expect(title?.textContent).toContain('Weekly Groceries');
    });

    it('should display total price', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const totalPrice = compiled.querySelector('.total-price');

      expect(totalPrice?.textContent).toContain('27.95');
    });

    it('should display active items count', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const sectionTitle = compiled.querySelector('.section-title');

      expect(sectionTitle?.textContent).toContain('Shopping List (1)');
    });

    it('should display completed items count', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const completedHeader = compiled.querySelector('.completed-header');

      expect(completedHeader?.textContent).toContain('Completed (1)');
    });

    it('should display item details', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const firstItem = compiled.querySelector('.item-row');

      expect(firstItem?.textContent).toContain('Pomidory');
      expect(firstItem?.textContent).toContain('3 kg');
    });

    it('should show empty message when all items checked', () => {
      component.items.set([mockItems[1]]); // Only checked item
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const emptyMessage = compiled.querySelector('.empty-message');

      expect(emptyMessage?.textContent).toContain('All items checked');
    });

    it('should hide completed section by default', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const completedList = compiled.querySelector('.completed-list');

      expect(completedList).toBeFalsy();
    });

    it('should show completed section when toggled', () => {
      component.toggleCompletedSection();
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const completedList = compiled.querySelector('.completed-list');

      expect(completedList).toBeTruthy();
    });

    it('should display back button', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const backBtn = compiled.querySelector('.btn-back');

      expect(backBtn?.textContent).toContain('Back');
    });

    it('should display edit button', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const editBtn = compiled.querySelector('.btn-edit');

      expect(editBtn?.textContent).toContain('Edit');
    });
  });

  describe('User Interactions', () => {
    it('should toggle item when clicked', () => {
      shoppingListService.toggleItemChecked.and.returnValue(of(undefined));
      const compiled = fixture.nativeElement as HTMLElement;
      const itemRow = compiled.querySelector('.item-row') as HTMLButtonElement;

      itemRow.click();

      expect(shoppingListService.toggleItemChecked).toHaveBeenCalled();
    });

    it('should toggle completed section when header clicked', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const completedHeader = compiled.querySelector('.completed-header') as HTMLButtonElement;

      completedHeader.click();

      expect(component.showCompleted()).toBe(true);
    });

    it('should navigate back when back button clicked', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const backBtn = compiled.querySelector('.btn-back') as HTMLButtonElement;

      backBtn.click();

      expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
    });

    it('should navigate to edit when edit button clicked', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const editBtn = compiled.querySelector('.btn-edit') as HTMLButtonElement;

      editBtn.click();

      expect(router.navigate).toHaveBeenCalledWith(['/shopping-lists', 1]);
    });
  });

  describe('Mobile Optimization', () => {
    it('should have large touch targets', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const itemRow = compiled.querySelector('.item-row') as HTMLElement;

      const computedStyle = window.getComputedStyle(itemRow);
      const padding = computedStyle.padding;

      expect(padding).toBeTruthy();
    });

    it('should display minimal information per item', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const itemInfo = compiled.querySelector('.item-info');
      const children = itemInfo?.children;

      // Should only have name and meta (quantity + unit)
      expect(children?.length).toBe(2);
    });
  });

  describe('Loading State', () => {
    it('should show loading state initially', () => {
      component.isLoading.set(true);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const loading = compiled.querySelector('.loading');

      expect(loading?.textContent).toContain('Loading');
    });

    it('should hide loading state after data loads', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const loading = compiled.querySelector('.loading');

      expect(loading).toBeFalsy();
    });
  });

  describe('Error Handling', () => {
    it('should handle error loading list', () => {
      spyOn(console, 'error');
      const error = new Error('Not found');
      shoppingListService.getShoppingListById.and.returnValue(throwError(() => error));

      component.ngOnInit();

      expect(console.error).toHaveBeenCalled();
    });

    it('should handle error loading items', () => {
      spyOn(console, 'error');
      const error = new Error('Failed');
      shoppingListService.getShoppingListItems.and.returnValue(throwError(() => error));

      component.ngOnInit();

      expect(console.error).toHaveBeenCalled();
    });
  });
});
