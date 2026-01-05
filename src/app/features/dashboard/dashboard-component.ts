import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { AuthService } from '../../core/services/auth/auth-service';
import { CommonModule } from '@angular/common';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { ProductCatalogComponent } from '../products/product-catalog-component/product-catalog-component';
import { ShoppingListManagementComponent } from '../shopping-lists/shopping-list-management-component/shopping-list-management-component';
import { ShoppingListService } from '../../core/services/shopping-list/shopping-list.service';
import { Router } from '@angular/router';
import { ShoppingList, ShoppingListItem } from '../../core/models/shopping-list.model';

@Component({
  selector: 'app-dashboard-component',
  imports: [
    CommonModule,
    FooterComponent,
    ProductCatalogComponent,
    ShoppingListManagementComponent,
  ],
  templateUrl: './dashboard-component.html',
  styleUrl: './dashboard-component.scss',
})
export class DashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private shoppingListService = inject(ShoppingListService);
  private router = inject(Router);

  user$ = this.authService.currentUser$;
  activeView = signal<'overview' | 'products' | 'lists'>('overview');

  activeLists = signal<ShoppingList[]>([]);
  allItems = signal<ShoppingListItem[]>([]);
  isLoadingStats = signal(false);

  totalActiveListsCount = computed(() => this.activeLists().length);
  totalItemsCount = computed(() => this.allItems().length);
  checkedItemsCount = computed(() => this.allItems().filter(item => item.isChecked).length);
  totalEstimatedCost = computed(() => {
    return this.allItems().reduce((total, item) => {
      return total + item.quantity * item.priceAtAddition;
    }, 0);
  });

  ngOnInit(): void {
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    this.isLoadingStats.set(true);

    this.shoppingListService.getActiveShoppingLists().subscribe({
      next: lists => {
        this.activeLists.set(lists);
        this.loadAllItems(lists);
      },
      error: error => {
        console.error('Failed to load dashboard data:', error);
        this.isLoadingStats.set(false);
      },
    });
  }

  private loadAllItems(lists: ShoppingList[]): void {
    if (lists.length === 0) {
      this.isLoadingStats.set(false);
      return;
    }

    let completedRequests = 0;
    const allItems: ShoppingListItem[] = [];

    lists.forEach(list => {
      this.shoppingListService.getShoppingListItems(list.listId).subscribe({
        next: items => {
          allItems.push(...items);
          completedRequests++;

          if (completedRequests === lists.length) {
            this.allItems.set(allItems);
            this.isLoadingStats.set(false);
          }
        },
        error: error => {
          console.error(`Failed to load items for list ${list.listId}:`, error);
          completedRequests++;

          if (completedRequests === lists.length) {
            this.allItems.set(allItems);
            this.isLoadingStats.set(false);
          }
        },
      });
    });
  }

  onLogout(): void {
    this.authService.logout();
  }

  setActiveView(view: 'overview' | 'products' | 'lists'): void {
    this.activeView.set(view);
  }

  navigateToLists(): void {
    this.router.navigate(['/shopping-lists']);
  }

  navigateToList(listId: number): void {
    this.router.navigate(['/shopping-lists', listId]);
  }
}
