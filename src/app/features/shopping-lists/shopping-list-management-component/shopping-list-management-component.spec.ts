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

  const mockArchivedList: ShoppingList = {
    listId: 3,
    title: 'Old List',
    description: 'Archived list',
    isArchived: true,
    createdAt: '2024-12-01T10:00:00',
    updatedAt: '2024-12-01T10:00:00',
  };

  beforeEach(async () => {
    const shoppingListServiceSpy = jasmine.createSpyObj('ShoppingListService', [
      'getActiveShoppingLists',
      'getAllShoppingLists',
      'createShoppingList',
      'archiveShoppingList',
      'deleteShoppingList',
    ]);

    // Safety mocks to prevent 'subscribe' errors during auto-initialization
    shoppingListServiceSpy.getActiveShoppingLists.and.returnValue(of([]));
    shoppingListServiceSpy.getAllShoppingLists.and.returnValue(of([]));

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

  describe('Loading Active Lists', () => {
    beforeEach(() => {
      shoppingListService.getActiveShoppingLists.and.returnValue(of(mockLists));
      fixture.detectChanges();
    });

    it('should display active lists count', () => {
      expect(component.activeLists().length).toBe(2);
    });

    it('should set loading state', () => {
      expect(component.isLoading()).toBe(false);
    });

    it('should clear error message', () => {
      component.errorMessage.set('Previous error');

      component.loadActiveLists();

      expect(component.errorMessage()).toBe('');
    });
  });

  describe('Loading Archived Lists', () => {
    beforeEach(() => {
      shoppingListService.getActiveShoppingLists.and.returnValue(of(mockLists));
      fixture.detectChanges();
    });

    it('should load archived lists', () => {
      shoppingListService.getAllShoppingLists.and.returnValue(of([...mockLists, mockArchivedList]));

      component.loadArchivedLists();

      expect(shoppingListService.getAllShoppingLists).toHaveBeenCalled();
      expect(component.archivedLists()).toEqual([mockArchivedList]);
    });

    it('should filter only archived lists', () => {
      shoppingListService.getAllShoppingLists.and.returnValue(of([...mockLists, mockArchivedList]));

      component.loadArchivedLists();

      expect(component.archivedLists().every(list => list.isArchived)).toBe(true);
    });

    it('should handle error when loading archived lists fails', () => {
      const error = new Error('Failed');
      shoppingListService.getAllShoppingLists.and.returnValue(throwError(() => error));

      component.loadArchivedLists();

      expect(component.errorMessage()).toBe('Failed to load archived lists.');
      expect(component.isLoading()).toBe(false);
    });
  });

  describe('Toggle Archived', () => {
    beforeEach(() => {
      shoppingListService.getActiveShoppingLists.and.returnValue(of(mockLists));
      fixture.detectChanges();
    });

    it('should load archived lists when toggled on', () => {
      shoppingListService.getAllShoppingLists.and.returnValue(of([mockArchivedList]));

      component.toggleArchived();

      expect(shoppingListService.getAllShoppingLists).toHaveBeenCalled();
    });

    it('should toggle showArchived flag', () => {
      expect(component.showArchived()).toBe(false);

      component.toggleArchived();

      expect(component.showArchived()).toBe(true);
    });

    it('should not reload archived lists when toggled off', () => {
      shoppingListService.getAllShoppingLists.and.returnValue(of([mockArchivedList]));

      component.toggleArchived();
      shoppingListService.getAllShoppingLists.calls.reset();

      component.toggleArchived();

      expect(shoppingListService.getAllShoppingLists).not.toHaveBeenCalled();
    });
  });
});
