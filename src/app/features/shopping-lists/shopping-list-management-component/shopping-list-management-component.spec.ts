import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';

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

  describe('Toggle Create Form', () => {
    beforeEach(() => {
      shoppingListService.getActiveShoppingLists.and.returnValue(of(mockLists));
      fixture.detectChanges();
    });

    it('should toggle showCreateForm flag', () => {
      expect(component.showCreateForm()).toBe(false);

      component.toggleCreateForm();

      expect(component.showCreateForm()).toBe(true);
    });

    it('should reset form when closing', () => {
      component.createListForm.patchValue({ title: 'Test', description: 'Description' });

      component.toggleCreateForm();
      component.toggleCreateForm();

      expect(component.createListForm.value).toEqual({
        title: null,
        description: null,
      });
    });

    it('should clear error message when closing', () => {
      component.errorMessage.set('Error message');

      component.toggleCreateForm();
      component.toggleCreateForm();

      expect(component.errorMessage()).toBe('');
    });
  });

  describe('Create Shopping List', () => {
    beforeEach(() => {
      shoppingListService.getActiveShoppingLists.and.returnValue(of(mockLists));
      fixture.detectChanges();
    });

    it('should create new shopping list', () => {
      const newList: ShoppingList = {
        listId: 3,
        title: 'New List',
        description: 'New description',
        isArchived: false,
        createdAt: '2025-01-03T10:00:00',
        updatedAt: '2025-01-03T10:00:00',
      };

      shoppingListService.createShoppingList.and.returnValue(of(newList));
      component.createListForm.patchValue({ title: 'New List', description: 'New description' });

      component.onCreateList();

      expect(shoppingListService.createShoppingList).toHaveBeenCalledWith({
        title: 'New List',
        description: 'New description',
      });
    });

    it('should add new list to active lists', () => {
      const newList: ShoppingList = { ...mockLists[0], listId: 3, title: 'New List' };
      shoppingListService.createShoppingList.and.returnValue(of(newList));
      component.createListForm.patchValue({ title: 'New List' });

      const initialCount = component.activeLists().length;

      component.onCreateList();

      expect(component.activeLists().length).toBe(initialCount + 1);
      expect(component.activeLists()[0]).toEqual(newList);
    });

    it('should show success message after creation', fakeAsync(() => {
      const newList: ShoppingList = { ...mockLists[0], listId: 3, title: 'New List' };
      shoppingListService.createShoppingList.and.returnValue(of(newList));
      component.createListForm.patchValue({ title: 'New List' });

      component.onCreateList();

      expect(component.successMessage()).toBe('Shopping list created successfully!');

      tick(3000);

      expect(component.successMessage()).toBe('');
    }));

    it('should reset form after successful creation', () => {
      const newList: ShoppingList = { ...mockLists[0], listId: 3, title: 'New List' };
      shoppingListService.createShoppingList.and.returnValue(of(newList));
      component.createListForm.patchValue({ title: 'New List', description: 'Description' });

      component.onCreateList();

      expect(component.createListForm.value).toEqual({
        title: null,
        description: null,
      });
    });

    it('should hide create form after successful creation', () => {
      const newList: ShoppingList = { ...mockLists[0], listId: 3, title: 'New List' };
      shoppingListService.createShoppingList.and.returnValue(of(newList));
      component.createListForm.patchValue({ title: 'New List' });
      component.showCreateForm.set(true);

      component.onCreateList();

      expect(component.showCreateForm()).toBe(false);
    });

    it('should not submit invalid form', () => {
      component.createListForm.patchValue({ title: '' });

      component.onCreateList();

      expect(shoppingListService.createShoppingList).not.toHaveBeenCalled();
      expect(component.createListForm.touched).toBe(true);
    });

    it('should handle creation error', () => {
      const error = { message: 'Title already exists' };
      shoppingListService.createShoppingList.and.returnValue(throwError(() => error));
      component.createListForm.patchValue({ title: 'New List' });

      component.onCreateList();

      expect(component.errorMessage()).toBe('Title already exists');
      expect(component.isLoading()).toBe(false);
    });

    it('should create list without description', () => {
      const newList: ShoppingList = {
        ...mockLists[0],
        listId: 3,
        title: 'New List',
        description: '',
      };
      shoppingListService.createShoppingList.and.returnValue(of(newList));
      component.createListForm.patchValue({ title: 'New List', description: '' });

      component.onCreateList();

      expect(shoppingListService.createShoppingList).toHaveBeenCalledWith({
        title: 'New List',
        description: undefined,
      });
    });
  });

  describe('Archive Shopping List', () => {
    beforeEach(() => {
      shoppingListService.getActiveShoppingLists.and.returnValue(of(mockLists));
      fixture.detectChanges();
    });

    it('should archive shopping list', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      shoppingListService.archiveShoppingList.and.returnValue(of(undefined));

      component.onArchiveList(1);

      expect(shoppingListService.archiveShoppingList).toHaveBeenCalledWith(1);
    });

    it('should remove list from active lists after archiving', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      shoppingListService.archiveShoppingList.and.returnValue(of(undefined));

      const initialCount = component.activeLists().length;

      component.onArchiveList(1);

      expect(component.activeLists().length).toBe(initialCount - 1);
      expect(component.activeLists().find(l => l.listId === 1)).toBeUndefined();
    });

    it('should show success message after archiving', fakeAsync(() => {
      spyOn(window, 'confirm').and.returnValue(true);
      shoppingListService.archiveShoppingList.and.returnValue(of(undefined));

      component.onArchiveList(1);

      expect(component.successMessage()).toBe('List archived successfully!');

      tick(3000);

      expect(component.successMessage()).toBe('');
    }));

    it('should not archive if user cancels confirmation', () => {
      spyOn(window, 'confirm').and.returnValue(false);

      component.onArchiveList(1);

      expect(shoppingListService.archiveShoppingList).not.toHaveBeenCalled();
    });

    it('should handle archive error', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      const error = new Error('Failed');
      shoppingListService.archiveShoppingList.and.returnValue(throwError(() => error));

      component.onArchiveList(1);

      expect(component.errorMessage()).toBe('Failed to archive list. Please try again.');
    });
  });

  describe('Delete Shopping List', () => {
    beforeEach(() => {
      shoppingListService.getActiveShoppingLists.and.returnValue(of(mockLists));
      fixture.detectChanges();
    });

    it('should delete shopping list', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      shoppingListService.deleteShoppingList.and.returnValue(of(undefined));

      component.onDeleteList(1);

      expect(shoppingListService.deleteShoppingList).toHaveBeenCalledWith(1);
    });

    it('should remove list from active lists after deletion', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      shoppingListService.deleteShoppingList.and.returnValue(of(undefined));

      const initialCount = component.activeLists().length;

      component.onDeleteList(1);

      expect(component.activeLists().length).toBe(initialCount - 1);
    });

    it('should remove list from archived lists after deletion', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      shoppingListService.deleteShoppingList.and.returnValue(of(undefined));
      component.archivedLists.set([mockArchivedList]);

      component.onDeleteList(3);

      expect(component.archivedLists().length).toBe(0);
    });

    it('should show success message after deletion', fakeAsync(() => {
      spyOn(window, 'confirm').and.returnValue(true);
      shoppingListService.deleteShoppingList.and.returnValue(of(undefined));

      component.onDeleteList(1);

      expect(component.successMessage()).toBe('List deleted successfully!');

      tick(3000);

      expect(component.successMessage()).toBe('');
    }));

    it('should not delete if user cancels confirmation', () => {
      spyOn(window, 'confirm').and.returnValue(false);

      component.onDeleteList(1);

      expect(shoppingListService.deleteShoppingList).not.toHaveBeenCalled();
    });

    it('should handle delete error', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      const error = new Error('Failed');
      shoppingListService.deleteShoppingList.and.returnValue(throwError(() => error));

      component.onDeleteList(1);

      expect(component.errorMessage()).toBe('Failed to delete list. Please try again.');
    });
  });
});
