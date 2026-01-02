import { Component, inject, signal, OnInit } from '@angular/core';
import { ShoppingListService } from '../../../core/services/shopping-list/shopping-list.service';
import { ShoppingList } from '../../../core/models/shopping-list.model';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-shopping-list-management-component',
  imports: [],
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
