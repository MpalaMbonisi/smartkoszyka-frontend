import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShoppingListManagementComponent } from './shopping-list-management-component';
import { ShoppingListService } from '../../../core/services/shopping-list/shopping-list.service';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { ShoppingList } from '../../../core/models/shopping-list.model';

describe('ShoppingListManagementComponent', () => {
  let component: ShoppingListManagementComponent;
  let fixture: ComponentFixture<ShoppingListManagementComponent>;
  let shoppingListService: jasmine.SpyObj<ShoppingListService>;

  const mockLists: ShoppingList[] = [
    {
      listId: 1,
      title: 'Weekly Groceries',
      description: 'Shopping for the week',
      isArchived: false,
      createdAt: '2025-01-01T10:00:00',
      updatedAt: '2025-01-01T10:00:00',
    },
    {
      listId: 2,
      title: 'Party Supplies',
      description: 'Items for birthday',
      isArchived: false,
      createdAt: '2025-01-02T10:00:00',
      updatedAt: '2025-01-02T10:00:00',
    },
  ];

  beforeEach(async () => {
    const shoppingListServiceSpy = jasmine.createSpyObj('ShoppingListService', [
      'getActiveShoppingLists',
      'getAllShoppingLists',
      'createShoppingList',
      'archiveShoppingList',
      'deleteShoppingList',
    ]);

    await TestBed.configureTestingModule({
      imports: [ShoppingListManagementComponent, ReactiveFormsModule],
      providers: [{ provide: ShoppingListService, useValue: shoppingListServiceSpy }],
    }).compileComponents();

    shoppingListService = TestBed.inject(
      ShoppingListService
    ) as jasmine.SpyObj<ShoppingListService>;
    fixture = TestBed.createComponent(ShoppingListManagementComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Component Initialization', () => {
    it('should load active lists on init', () => {
      shoppingListService.getActiveShoppingLists.and.returnValue(of(mockLists));

      fixture.detectChanges();

      expect(shoppingListService.getActiveShoppingLists).toHaveBeenCalled();
      expect(component.activeLists()).toEqual(mockLists);
    });

    it('should initialize with correct default values', () => {
      shoppingListService.getActiveShoppingLists.and.returnValue(of([]));

      fixture.detectChanges();

      expect(component.showArchived()).toBe(false);
      expect(component.showCreateForm()).toBe(false);
      expect(component.isLoading()).toBe(false);
      expect(component.errorMessage()).toBe('');
    });

    it('should handle error when loading active lists fails', () => {
      const error = new Error('Failed to load');
      shoppingListService.getActiveShoppingLists.and.returnValue(throwError(() => error));

      fixture.detectChanges();

      expect(component.errorMessage()).toBe('Failed to load shopping lists. Please try again.');
      expect(component.isLoading()).toBe(false);
    });

    it('should initialize create form with empty values', () => {
      shoppingListService.getActiveShoppingLists.and.returnValue(of([]));

      fixture.detectChanges();

      expect(component.createListForm.value).toEqual({
        title: '',
        description: '',
      });
    });
  });
});
