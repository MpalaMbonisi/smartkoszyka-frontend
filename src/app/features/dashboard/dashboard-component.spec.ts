import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardComponent } from './dashboard-component';
import { BehaviorSubject, of } from 'rxjs';
import { AuthService, User } from '../../core/services/auth/auth-service';
import { Router } from '@angular/router';
import { ProductService } from '../../core/services/product/product.service';
import { ShoppingListService } from '../../core/services/shopping-list/shopping-list.service';
import { ProductCatalogComponent } from '../products/product-catalog-component/product-catalog-component';
import { ShoppingList, ShoppingListItem } from '../../core/models/shopping-list.model';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let shoppingListService: jasmine.SpyObj<ShoppingListService>;
  let productService: jasmine.SpyObj<ProductService>;
  let router: jasmine.SpyObj<Router>;
  let currentUserSubject: BehaviorSubject<User | null>;

  const mockUser = {
    email: 'nicolesmith@example.com',
    firstName: 'Nicole',
    lastName: 'Smith',
  };

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

  const mockItems: ShoppingListItem[] = [
    {
      listItemId: 1,
      productId: 1,
      productName: 'Pomidory',
      quantity: 3,
      unit: 'kg',
      priceAtAddition: 5.99,
      isChecked: false,
      addedAt: '2025-01-01T10:00:00',
    },
    {
      listItemId: 2,
      productId: 2,
      productName: 'Banany',
      quantity: 2,
      unit: 'kg',
      priceAtAddition: 4.99,
      isChecked: true,
      addedAt: '2025-01-01T10:05:00',
    },
  ];

  beforeEach(async () => {
    currentUserSubject = new BehaviorSubject<User | null>(mockUser);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['logout'], {
      currentUser$: currentUserSubject.asObservable(),
    });
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const productServiceSpy = jasmine.createSpyObj('ProductService', [
      'getAllProducts',
      'getAllCategories',
      'searchProducts',
      'getProductsByCategory',
    ]);
    const shoppingListServiceSpy = jasmine.createSpyObj('ShoppingListService', [
      'getActiveShoppingLists',
      'getShoppingListItems',
    ]);

    await TestBed.configureTestingModule({
      imports: [DashboardComponent, ProductCatalogComponent],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ProductService, useValue: productServiceSpy },
        { provide: ShoppingListService, useValue: shoppingListServiceSpy },
      ],
    }).compileComponents();

    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    productService = TestBed.inject(ProductService) as jasmine.SpyObj<ProductService>;
    shoppingListService = TestBed.inject(
      ShoppingListService
    ) as jasmine.SpyObj<ShoppingListService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    productService.getAllProducts.and.returnValue(of([]));
    productService.getAllCategories.and.returnValue(of([]));
    shoppingListService.getActiveShoppingLists.and.returnValue(of(mockLists));
    shoppingListService.getShoppingListItems.and.callFake((listId: number) => {
      if (listId === 1) {
        return of([mockItems[0]]); // List 1 has 1 item
      } else if (listId === 2) {
        return of([mockItems[1]]); // List 2 has 1 item
      }
      return of([]);
    });

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Component Initialization', () => {
    it('should initialize with overview view active', () => {
      expect(component.activeView()).toBe('overview');
    });

    it('should have user$ observable', done => {
      component.user$.subscribe(user => {
        expect(user).toEqual(mockUser);
        done();
      });
    });

    it('should load dashboard data on init', () => {
      expect(shoppingListService.getActiveShoppingLists).toHaveBeenCalled();
    });

    it('should load items for each list', () => {
      expect(shoppingListService.getShoppingListItems).toHaveBeenCalledWith(1);
      expect(shoppingListService.getShoppingListItems).toHaveBeenCalledWith(2);
    });
  });

  describe('Statistics Calculation', () => {
    it('should calculate total active lists count', () => {
      expect(component.totalActiveListsCount()).toBe(2);
    });

    it('should calculate total items count', () => {
      expect(component.totalItemsCount()).toBe(2);
    });

    it('should calculate checked items count', () => {
      expect(component.checkedItemsCount()).toBe(1);
    });

    it('should calculate total estimated cost', () => {
      const expectedCost = 3 * 5.99 + 2 * 4.99; // 27.95
      expect(component.totalEstimatedCost()).toBeCloseTo(expectedCost, 2);
    });

    it('should return 0 for empty lists', () => {
      component.activeLists.set([]);
      component.allItems.set([]);

      expect(component.totalActiveListsCount()).toBe(0);
      expect(component.totalItemsCount()).toBe(0);
      expect(component.checkedItemsCount()).toBe(0);
      expect(component.totalEstimatedCost()).toBe(0);
    });
  });

  describe('View Navigation', () => {
    it('should switch to overview view', () => {
      component.setActiveView('overview');
      expect(component.activeView()).toBe('overview');
    });

    it('should switch to products view', () => {
      component.setActiveView('products');
      expect(component.activeView()).toBe('products');
    });

    it('should switch to lists view', () => {
      component.setActiveView('lists');
      expect(component.activeView()).toBe('lists');
    });

    it('should update UI when view changes', () => {
      component.setActiveView('overview');
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const overviewSection = compiled.querySelector('.welcome-section');

      expect(overviewSection).toBeTruthy();
    });
  });

  describe('Navigation Methods', () => {
    it('should navigate to shopping lists', () => {
      component.navigateToLists();
      expect(router.navigate).toHaveBeenCalledWith(['/shopping-lists']);
    });

    it('should navigate to specific list', () => {
      component.navigateToList(1);
      expect(router.navigate).toHaveBeenCalledWith(['/shopping-lists', 1]);
    });
  });

  describe('User Display', () => {
    it('should display user name in header', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const userName = compiled.querySelector('.user-name');

      expect(userName?.textContent).toContain('Nicole Smith');
    });

    it('should display user first name in welcome message when on overview', () => {
      component.setActiveView('overview');
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const welcomeSection = compiled.querySelector('.welcome-section h1');

      expect(welcomeSection?.textContent).toContain('Hello, Nicole!');
    });
  });

  describe('Statistics Display', () => {
    it('should display active lists count', () => {
      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      const statCards = compiled.querySelectorAll('.stat-card');
      const activeListsStat = statCards[0];

      expect(activeListsStat.textContent).toContain('Active Lists');
      expect(activeListsStat.textContent).toContain('2');
    });

    it('should display total items count', () => {
      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      const statCards = compiled.querySelectorAll('.stat-card');
      const totalItemsStat = statCards[1];

      expect(totalItemsStat.textContent).toContain('Total Items');
      expect(totalItemsStat.textContent).toContain('2');
    });

    it('should display checked items count', () => {
      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      const statCards = compiled.querySelectorAll('.stat-card');
      const checkedItemsStat = statCards[2];

      expect(checkedItemsStat.textContent).toContain('Completed Items');
      expect(checkedItemsStat.textContent).toContain('1');
    });

    it('should display estimated cost', () => {
      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      const statCards = compiled.querySelectorAll('.stat-card');
      const costStat = statCards[3];

      expect(costStat.textContent).toContain('Estimated Cost');
      expect(costStat.textContent).toContain('27.95');
    });
  });

  describe('Recent Lists Section', () => {
    it('should display recent lists section when lists exist', () => {
      component.setActiveView('overview');
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const recentSection = compiled.querySelector('.recent-lists-section');

      expect(recentSection).toBeTruthy();
    });

    it('should display up to 3 recent lists', () => {
      component.setActiveView('overview');
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const listCards = compiled.querySelectorAll('.recent-list-card');

      expect(listCards.length).toBeLessThanOrEqual(3);
    });

    it('should navigate to list detail when card is clicked', () => {
      component.setActiveView('overview');
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const firstCard = compiled.querySelector('.recent-list-card') as HTMLElement;

      firstCard.click();

      expect(router.navigate).toHaveBeenCalledWith(['/shopping-lists', 1]);
    });

    it('should not display recent lists when no lists exist', () => {
      component.activeLists.set([]);
      component.setActiveView('overview');
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const recentSection = compiled.querySelector('.recent-lists-section');

      expect(recentSection).toBeFalsy();
    });
  });

  describe('Loading State', () => {
    it('should show loading state while fetching data', () => {
      component.isLoadingStats.set(true);
      component.setActiveView('overview');
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const loadingState = compiled.querySelector('.stats-loading');

      expect(loadingState).toBeTruthy();
    });

    it('should hide loading state after data is loaded', () => {
      component.isLoadingStats.set(false);
      component.setActiveView('overview');
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const loadingState = compiled.querySelector('.stats-loading');

      expect(loadingState).toBeFalsy();
    });
  });

  describe('Quick Actions', () => {
    it('should display quick action cards', () => {
      component.setActiveView('overview');
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const actionCards = compiled.querySelectorAll('.action-card');

      expect(actionCards.length).toBe(2);
    });

    it('should navigate to products when browse products clicked', () => {
      component.setActiveView('overview');
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const browseProductsCard = compiled.querySelectorAll('.action-card')[0] as HTMLButtonElement;

      browseProductsCard.click();

      expect(component.activeView()).toBe('products');
    });

    it('should navigate to lists when manage lists clicked', () => {
      component.setActiveView('overview');
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const manageListsCard = compiled.querySelectorAll('.action-card')[1] as HTMLButtonElement;

      manageListsCard.click();

      expect(router.navigate).toHaveBeenCalledWith(['/shopping-lists']);
    });
  });

  describe('Logout Functionality', () => {
    it('should call authService.logout when logout button clicked', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const logoutButton = compiled.querySelector('.btn-logout') as HTMLButtonElement;

      logoutButton.click();

      expect(authService.logout).toHaveBeenCalled();
    });
  });

  describe('Responsive Layout', () => {
    it('should render footer', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const footer = compiled.querySelector('app-footer');

      expect(footer).toBeTruthy();
    });

    it('should have main content area', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const mainContent = compiled.querySelector('.dashboard-content');

      expect(mainContent).toBeTruthy();
    });
  });
});
