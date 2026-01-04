import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { ShoppingListService } from '../../../core/services/shopping-list/shopping-list.service';
import { ProductService } from '../../../core/services/product/product.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ShoppingList, ShoppingListItem } from '../../../core/models/shopping-list.model';
import { Product } from '../../../core/models/product.model';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-shopping-list-detail-component',
  imports: [],
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
  availableProducts = signal<Product[]>([]);
  filteredProducts = signal<Product[]>([]);
  showAddProduct = signal(false);
  isLoading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');
  isEditingTitle = signal(false);

  productSearchControl = new FormControl('');
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

  checkedCount = computed(() => {
    return this.items().filter(item => item.isChecked).length;
  });

  uncheckedCount = computed(() => {
    return this.items().filter(item => !item.isChecked).length;
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
    this.loadProducts();
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

  private loadProducts(): void {
    this.productService.getAllProducts().subscribe({
      next: products => {
        this.availableProducts.set(products);
        this.filteredProducts.set(products);
      },
      error: error => {
        console.error('Failed to load products:', error);
      },
    });
  }

  private setupProductSearch(): void {
    this.productSearchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(query => {
        if (query && query.trim()) {
          this.searchProducts(query.trim());
        } else {
          this.filteredProducts.set(this.availableProducts());
        }
      });
  }

  private searchProducts(query: string): void {
    this.productService.searchProducts(query).subscribe({
      next: products => {
        this.filteredProducts.set(products);
      },
      error: error => {
        this.errorMessage.set('Failed to search products.');
        console.error('Search failed:', error);
      },
    });
  }
}
