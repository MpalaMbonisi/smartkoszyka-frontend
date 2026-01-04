import { Component, inject, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ShoppingList } from '../../../core/models/shopping-list.model';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductSelectionService } from '../../../core/services/product-selection/product-selection-service';
import { ShoppingListService } from '../../../core/services/shopping-list/shopping-list.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-list-selector-modal',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './list-selector-modal.html',
  styleUrl: './list-selector-modal.scss',
})
export class ListSelectorModal implements OnInit {
  productSelectionService = inject(ProductSelectionService);
  private shoppingListService = inject(ShoppingListService);
  private router = inject(Router);

  activeLists = signal<ShoppingList[]>([]);
  isLoading = signal(false);
  isSubmitting = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  addToListForm = new FormGroup({
    listId: new FormControl<number | null>(null, [Validators.required]),
    quantity: new FormControl(1, [Validators.required, Validators.min(1)]),
  });

  get selectedProduct() {
    return this.productSelectionService.getSelectedProduct();
  }

  ngOnInit(): void {
    this.loadActiveLists();
  }

  private loadActiveLists(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.shoppingListService.getActiveShoppingLists().subscribe({
      next: lists => {
        this.activeLists.set(lists);
        this.isLoading.set(false);
      },
      error: error => {
        this.errorMessage.set('Failed to load shopping lists.');
        this.isLoading.set(false);
        console.error('Failed to load lists:', error);
      },
    });
  }

  onAddToList(): void {
    if (this.addToListForm.invalid || !this.selectedProduct) {
      this.addToListForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const { listId, quantity } = this.addToListForm.value;
    if (!listId || !quantity) return;

    const request = {
      productId: this.selectedProduct.id,
      quantity,
    };

    this.shoppingListService.addProductToList(listId, request).subscribe({
      next: () => {
        this.successMessage.set('Product added successfully!');
        this.isSubmitting.set(false);
        this.addToListForm.reset({ quantity: 1 });

        setTimeout(() => {
          this.onClose();
        }, 1500);
      },
      error: error => {
        this.errorMessage.set(error.message || 'Failed to add product to list.');
        this.isSubmitting.set(false);
      },
    });
  }

  onCreateNewList(): void {
    this.router.navigate(['/shopping-lists']);
    this.onClose();
  }

  onClose(): void {
    this.productSelectionService.clearSelection();
    this.addToListForm.reset({ quantity: 1 });
    this.errorMessage.set('');
    this.successMessage.set('');
  }
}
