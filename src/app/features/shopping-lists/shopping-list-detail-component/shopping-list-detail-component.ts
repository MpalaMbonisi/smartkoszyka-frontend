import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { ShoppingListService } from '../../../core/services/shopping-list/shopping-list.service';
import { ProductService } from '../../../core/services/product/product.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ShoppingList, ShoppingListItem } from '../../../core/models/shopping-list.model';
import { Category, Product } from '../../../core/models/product.model';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { HeaderComponent } from '../../../shared/components/header-component/header-component';

@Component({
  selector: 'app-shopping-list-detail-component',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FooterComponent, HeaderComponent],
  templateUrl: './shopping-list-detail-component.html',
  styleUrl: './shopping-list-detail-component.scss',
})
export class ShoppingListDetailComponent implements OnInit {
  private shoppingListService = inject(ShoppingListService);
  private productService = inject(ProductService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  listId!: number;
  shoppingList = signal<ShoppingList | null>(null);
  items = signal<ShoppingListItem[]>([]);
  categories = signal<Category[]>([]);
  categoryProducts = signal<Product[]>([]);
  filteredProducts = signal<Product[]>([]);
  showAddProduct = signal(false);
  isLoading = signal(false);
  isLoadingProducts = signal(false);
  errorMessage = signal('');
  successMessage = signal('');
  isEditingTitle = signal(false);

  productSearchControl = new FormControl('');
  categoryFilterControl = new FormControl<number | null>(null);
  editTitleControl = new FormControl('', [Validators.required, Validators.minLength(3)]);

  addProductForm = new FormGroup({
    productId: new FormControl<number | null>(null, [Validators.required]),
    quantity: new FormControl(1, [Validators.required, Validators.min(1)]),
  });

  totalPrice = computed(() => {
    return this.items().reduce((total, item) => {
      return total + item.quantity * item.priceAtAddition;
    }, 0);
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/dashboard']);
      return;
    }

    this.listId = parseInt(id, 10);
    this.loadShoppingList();
    this.loadItems();
    this.loadCategories();
    this.setupCategoryFilter();
    this.setupProductSearch();
  }

  private loadShoppingList(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.shoppingListService.getShoppingListById(this.listId).subscribe({
      next: list => {
        this.shoppingList.set(list);
        this.editTitleControl.setValue(list.title);
        this.isLoading.set(false);
      },
      error: error => {
        this.errorMessage.set('Failed to load shopping list.');
        this.isLoading.set(false);
        console.error('Failed to load list:', error);
      },
    });
  }

  private loadItems(): void {
    this.shoppingListService.getShoppingListItems(this.listId).subscribe({
      next: items => {
        this.items.set(items);
      },
      error: error => {
        this.errorMessage.set('Failed to load items.');
        console.error('Failed to load items:', error);
      },
    });
  }

  private loadCategories(): void {
    this.productService.getAllCategories().subscribe({
      next: categories => this.categories.set(categories),
      error: error => console.error('Failed to load categories:', error),
    });
  }

  private setupCategoryFilter(): void {
    this.categoryFilterControl.valueChanges.subscribe(categoryId => {
      if (categoryId) {
        this.loadProductsByCategory(categoryId);
      } else {
        this.categoryProducts.set([]);
        this.filteredProducts.set([]);
      }
      // Reset product selection when category changes
      this.addProductForm.patchValue({ productId: null });
    });
  }

  private loadProductsByCategory(categoryId: number): void {
    this.isLoadingProducts.set(true);
    this.productSearchControl.setValue('', { emitEvent: false });

    this.productService.getProductsByCategory(categoryId).subscribe({
      next: products => {
        this.categoryProducts.set(products);
        this.filteredProducts.set(products);
        this.isLoadingProducts.set(false);
      },
      error: error => {
        console.error('Failed to load products:', error);
        this.errorMessage.set('Failed to load products for this category.');
        this.isLoadingProducts.set(false);
      },
    });
  }

  private setupProductSearch(): void {
    this.productSearchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(query => {
        if (query && query.trim()) {
          this.filterProducts(query.trim());
        } else {
          this.filteredProducts.set(this.categoryProducts());
        }
      });
  }

  private filterProducts(query: string): void {
    const searchTerm = query.toLowerCase();
    const filtered = this.categoryProducts().filter(product =>
      product.name.toLowerCase().includes(searchTerm)
    );
    this.filteredProducts.set(filtered);
  }

  toggleAddProduct(): void {
    this.showAddProduct.update(val => !val);
    if (!this.showAddProduct()) {
      this.categoryFilterControl.setValue(null);
      this.productSearchControl.setValue('');
      this.addProductForm.reset({ quantity: 1 });
      this.errorMessage.set('');
    }
  }

  onAddProduct(): void {
    if (this.addProductForm.invalid) {
      this.addProductForm.markAllAsTouched();
      return;
    }

    this.errorMessage.set('');
    this.successMessage.set('');

    const { productId, quantity } = this.addProductForm.value;
    if (!productId || !quantity) return;

    this.shoppingListService.addProductToList(this.listId, { productId, quantity }).subscribe({
      next: newItem => {
        this.items.update(items => [newItem, ...items]);
        this.successMessage.set('Product added successfully!');
        this.addProductForm.reset({ quantity: 1 });
        this.categoryFilterControl.setValue(null);
        this.showAddProduct.set(false);
        setTimeout(() => this.successMessage.set(''), 3000);
      },
      error: error => {
        this.errorMessage.set(error.message || 'Failed to add product.');
      },
    });
  }

  onUpdateQuantity(itemId: number, quantity: number): void {
    if (quantity < 1) return;

    this.shoppingListService.updateItemQuantity(itemId, { quantity }).subscribe({
      next: updatedItem => {
        this.items.update(items =>
          items.map(item => (item.listItemId === itemId ? updatedItem : item))
        );
      },
      error: error => {
        this.errorMessage.set('Failed to update quantity.');
        console.error('Update quantity failed:', error);
      },
    });
  }

  onRemoveItem(itemId: number): void {
    if (!confirm('Are you sure you want to remove this item?')) {
      return;
    }

    this.shoppingListService.removeItemFromList(itemId).subscribe({
      next: () => {
        this.items.update(items => items.filter(item => item.listItemId !== itemId));
        this.successMessage.set('Item removed successfully!');
        setTimeout(() => this.successMessage.set(''), 3000);
      },
      error: error => {
        this.errorMessage.set('Failed to remove item.');
        console.error('Remove item failed:', error);
      },
    });
  }

  enableEditTitle(): void {
    this.isEditingTitle.set(true);
  }

  cancelEditTitle(): void {
    this.isEditingTitle.set(false);
    this.editTitleControl.setValue(this.shoppingList()?.title || '');
  }

  saveTitle(): void {
    if (this.editTitleControl.invalid) {
      return;
    }

    const newTitle = this.editTitleControl.value?.trim();
    if (!newTitle) return;

    this.shoppingListService.updateShoppingListTitle(this.listId, { title: newTitle }).subscribe({
      next: updatedList => {
        this.shoppingList.set(updatedList);
        this.isEditingTitle.set(false);
        this.successMessage.set('List title updated successfully!');
        setTimeout(() => this.successMessage.set(''), 3000);
      },
      error: error => {
        this.errorMessage.set('Failed to update list title.');
        console.error('Update title failed:', error);
      },
    });
  }

  goToShopMode(): void {
    this.router.navigate(['/shopping-lists', this.listId, 'shop']);
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}
