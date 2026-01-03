import { Component, inject } from '@angular/core';
import { AuthService } from '../../core/services/auth/auth-service';
import { CommonModule } from '@angular/common';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { ProductCatalogComponent } from '../products/product-catalog-component/product-catalog-component';

@Component({
  selector: 'app-dashboard-component',
  imports: [CommonModule, FooterComponent, ProductCatalogComponent],
  templateUrl: './dashboard-component.html',
  styleUrl: './dashboard-component.scss',
})
export class DashboardComponent {
  private authService = inject(AuthService);

  user$ = this.authService.currentUser$;
  activeView = 'products'; // 'products' | 'lists' | 'overview'

  onLogout(): void {
    this.authService.logout();
  }

  setActiveView(view: string): void {
    this.activeView = view;
  }
}
