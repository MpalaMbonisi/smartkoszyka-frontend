import { Component, inject, OnInit, signal } from '@angular/core';
import { AuthService } from '../../core/services/auth/auth-service';
import { CommonModule } from '@angular/common';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { ProductCatalogComponent } from '../products/product-catalog-component/product-catalog-component';
import { ShoppingListManagementComponent } from '../shopping-lists/shopping-list-management-component/shopping-list-management-component';
import { ShoppingListService } from '../../core/services/shopping-list/shopping-list.service';
import { Router } from '@angular/router';
import { ShoppingList } from '../../core/models/shopping-list.model';

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

  ngOnInit(): void {
    this.loadActiveLists();
  }

  private loadActiveLists(): void {
    this.shoppingListService.getActiveShoppingLists().subscribe({
      next: lists => {
        this.activeLists.set(lists);
      },
      error: error => {
        console.error('Failed to load dashboard data:', error);
      },
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
