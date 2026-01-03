import { Component, inject, signal, OnInit } from '@angular/core';
import { ShoppingListService } from '../../../core/services/shopping-list/shopping-list.service';
import { ShoppingList } from '../../../core/models/shopping-list.model';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';

@Component({
  selector: 'app-shopping-list-management-component',
  imports: [CommonModule, ReactiveFormsModule, DatePipe],
  templateUrl: './shopping-list-management-component.html',
  styleUrl: './shopping-list-management-component.scss',
})
export class ShoppingListManagementComponent implements OnInit {
  private shoppingListService = inject(ShoppingListService);

  activeLists = signal<ShoppingList[]>([]);
  archivedLists = signal<ShoppingList[]>([]);
  showArchived = signal(false);
  showCreateForm = signal(false);
  isLoading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  createListForm = new FormGroup({
    title: new FormControl('', [Validators.required, Validators.minLength(3)]),
    description: new FormControl(''),
  });

  ngOnInit(): void {
    this.loadActiveLists();
  }

  loadActiveLists(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.shoppingListService.getActiveShoppingLists().subscribe({
      next: lists => {
        this.activeLists.set(lists);
        this.isLoading.set(false);
      },
      error: error => {
        this.errorMessage.set('Failed to load shopping lists. Please try again.');
        this.isLoading.set(false);
        console.error('Failed to load lists:', error);
      },
    });
  }

  loadArchivedLists(): void {
    this.isLoading.set(true);

    this.shoppingListService.getAllShoppingLists().subscribe({
      next: lists => {
        this.archivedLists.set(lists.filter(list => list.isArchived));
        this.isLoading.set(false);
      },
      error: error => {
        this.errorMessage.set('Failed to load archived lists.');
        this.isLoading.set(false);
        console.error('Failed to load archived lists:', error);
      },
    });
  }

  toggleArchived(): void {
    this.showArchived.update(val => !val);
    if (this.showArchived()) {
      this.loadArchivedLists();
    }
  }

  toggleCreateForm(): void {
    this.showCreateForm.update(val => !val);
    if (!this.showCreateForm()) {
      this.createListForm.reset();
      this.errorMessage.set('');
    }
  }

  onCreateList(): void {
    if (this.createListForm.invalid) {
      this.createListForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const formValue = this.createListForm.value;
    const request = {
      title: formValue.title!,
      description: formValue.description || undefined,
    };

    this.shoppingListService.createShoppingList(request).subscribe({
      next: newList => {
        this.activeLists.update(lists => [newList, ...lists]);
        this.successMessage.set('Shopping list created successfully!');
        this.createListForm.reset();
        this.showCreateForm.set(false);
        this.isLoading.set(false);

        setTimeout(() => this.successMessage.set(''), 3000);
      },
      error: error => {
        this.errorMessage.set(error.message || 'Failed to create list. Please try again.');
        this.isLoading.set(false);
      },
    });
  }

  onArchiveList(listId: number): void {
    if (!confirm('Are you sure you want to archive this list?')) {
      return;
    }

    this.shoppingListService.archiveShoppingList(listId).subscribe({
      next: () => {
        this.activeLists.update(lists => lists.filter(list => list.listId !== listId));
        this.successMessage.set('List archived successfully!');
        setTimeout(() => this.successMessage.set(''), 3000);
      },
      error: error => {
        this.errorMessage.set('Failed to archive list. Please try again.');
        console.error('Failed to archive:', error);
      },
    });
  }

  onDeleteList(listId: number): void {
    if (!confirm('Are you sure you want to permanently delete this list?')) {
      return;
    }

    this.shoppingListService.deleteShoppingList(listId).subscribe({
      next: () => {
        this.activeLists.update(lists => lists.filter(list => list.listId !== listId));
        this.archivedLists.update(lists => lists.filter(list => list.listId !== listId));
        this.successMessage.set('List deleted successfully!');
        setTimeout(() => this.successMessage.set(''), 3000);
      },
      error: error => {
        this.errorMessage.set('Failed to delete list. Please try again.');
        console.error('Failed to delete:', error);
      },
    });
  }

  onViewList(listId: number): void {
    // This will be implemented for navigation to detail view
    console.log('View list:', listId);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.createListForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getErrorMessage(fieldName: string): string {
    const field = this.createListForm.get(fieldName);

    if (!field || !field.errors) {
      return '';
    }

    if (field.errors['required']) {
      return 'Title is required';
    }

    if (field.errors['minlength']) {
      return 'Title must be at least 3 characters';
    }

    return '';
  }
}
