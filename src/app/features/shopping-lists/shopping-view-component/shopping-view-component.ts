import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ShoppingList, ShoppingListItem } from '../../../core/models/shopping-list.model';
import { ShoppingListService } from '../../../core/services/shopping-list/shopping-list.service';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { HeaderComponent } from '../../../shared/components/header-component/header-component';

@Component({
  selector: 'app-shopping-view-component',
  imports: [CommonModule, FooterComponent, HeaderComponent],
  templateUrl: './shopping-view-component.html',
  styleUrl: './shopping-view-component.scss',
})
export class ShoppingViewComponent implements OnInit {
  private shoppingListService = inject(ShoppingListService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  listId!: number;
  shoppingList = signal<ShoppingList | null>(null);
  items = signal<ShoppingListItem[]>([]);
  isLoading = signal(false);
  showCompleted = signal(false);

  activeItems = computed(() => this.items().filter(item => !item.isChecked));

  completedItems = computed(() => this.items().filter(item => item.isChecked));

  checkedTotalPrice = computed(() => {
    return this.items()
      .filter(item => item.isChecked)
      .reduce((total, item) => {
        return total + item.quantity * item.priceAtAddition;
      }, 0);
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
    this.loadData();
  }

  private loadData(): void {
    this.isLoading.set(true);

    this.shoppingListService.getShoppingListById(this.listId).subscribe({
      next: list => this.shoppingList.set(list),
      error: error => console.error('Failed to load list:', error),
    });

    this.shoppingListService.getShoppingListItems(this.listId).subscribe({
      next: items => {
        this.items.set(items);
        this.isLoading.set(false);
      },
      error: error => {
        console.error('Failed to load items:', error);
        this.isLoading.set(false);
      },
    });
  }

  toggleItem(itemId: number): void {
    this.shoppingListService.toggleItemChecked(itemId).subscribe({
      next: () => {
        this.items.update(items =>
          items.map(item =>
            item.listItemId === itemId ? { ...item, isChecked: !item.isChecked } : item
          )
        );
      },
      error: error => console.error('Failed to toggle item:', error),
    });
  }

  toggleCompletedSection(): void {
    this.showCompleted.update(val => !val);
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  goToEditMode(): void {
    this.router.navigate(['/shopping-lists', this.listId]);
  }
}
