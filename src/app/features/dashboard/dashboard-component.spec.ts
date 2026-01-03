import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardComponent } from './dashboard-component';
import { BehaviorSubject } from 'rxjs';
import { AuthService, User } from '../../core/services/auth/auth-service';
import { Router } from '@angular/router';
import { ProductService } from '../../core/services/product/product.service';
import { ProductCatalogComponent } from '../products/product-catalog-component/product-catalog-component';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let productService: jasmine.SpyObj<ProductService>;
  let currentUserSubject: BehaviorSubject<User | null>;

  const mockUser = {
    email: 'nicolesmith@example.com',
    firstName: 'Nicole',
    lastName: 'Smith',
  };

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

    await TestBed.configureTestingModule({
      imports: [DashboardComponent, ProductCatalogComponent],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ProductService, useValue: productServiceSpy },
      ],
    }).compileComponents();

    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    productService = TestBed.inject(ProductService) as jasmine.SpyObj<ProductService>;

    // Setup default return values for product service
    productService.getAllProducts.and.returnValue(new BehaviorSubject([]).asObservable());
    productService.getAllCategories.and.returnValue(new BehaviorSubject([]).asObservable());

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Component Initialization', () => {
    it('should initialize with products view active', () => {
      expect(component.activeView).toBe('products');
    });

    it('should have user$ observable', done => {
      component.user$.subscribe(user => {
        expect(user).toEqual(mockUser);
        done();
      });
    });
  });

  describe('View Navigation', () => {
    it('should switch to overview view', () => {
      component.setActiveView('overview');

      expect(component.activeView).toBe('overview');
    });

    it('should switch to products view', () => {
      component.setActiveView('products');

      expect(component.activeView).toBe('products');
    });

    it('should switch to lists view', () => {
      component.setActiveView('lists');

      expect(component.activeView).toBe('lists');
    });

    it('should update UI when view changes', () => {
      component.setActiveView('overview');
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const overviewSection = compiled.querySelector('.welcome-section');

      expect(overviewSection).toBeTruthy();
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

    it('should update display when user changes', () => {
      const newUser = {
        email: 'mbonisimpala@example.com',
        firstName: 'Mbonisi',
        lastName: 'Mpala',
      };

      currentUserSubject.next(newUser);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const userName = compiled.querySelector('.user-name');

      expect(userName?.textContent).toContain('Mbonisi Mpala');
    });
  });

  describe('Navigation UI', () => {
    it('should display all navigation items', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const navItems = compiled.querySelectorAll('.nav-item');

      expect(navItems.length).toBe(3);
      expect(navItems[0].textContent?.trim()).toBe('Overview');
      expect(navItems[1].textContent?.trim()).toBe('Products');
      expect(navItems[2].textContent?.trim()).toBe('Shopping Lists');
    });

    it('should highlight active navigation item', () => {
      component.setActiveView('overview');
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const activeNav = compiled.querySelector('.nav-item.active');

      expect(activeNav?.textContent?.trim()).toBe('Overview');
    });

    it('should update active nav when clicked', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const overviewNav = compiled.querySelectorAll('.nav-item')[0] as HTMLButtonElement;

      overviewNav.click();
      fixture.detectChanges();

      expect(component.activeView).toBe('overview');
      expect(overviewNav.classList.contains('active')).toBe(true);
    });
  });

  describe('Overview View', () => {
    beforeEach(() => {
      component.setActiveView('overview');
      fixture.detectChanges();
    });

    it('should display stat cards', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const statCards = compiled.querySelectorAll('.stat-card');

      expect(statCards.length).toBe(3);
    });

    it('should display active lists stat', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const statCards = compiled.querySelectorAll('.stat-card');
      const activeListsStat = statCards[0];

      expect(activeListsStat.textContent).toContain('Active Lists');
      expect(activeListsStat.textContent).toContain('0');
    });

    it('should display total items stat', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const statCards = compiled.querySelectorAll('.stat-card');
      const totalItemsStat = statCards[1];

      expect(totalItemsStat.textContent).toContain('Total Items');
    });

    it('should display completed items stat', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const statCards = compiled.querySelectorAll('.stat-card');
      const completedItemsStat = statCards[2];

      expect(completedItemsStat.textContent).toContain('Completed Items');
    });

    it('should display quick action cards', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const actionCards = compiled.querySelectorAll('.action-card');

      expect(actionCards.length).toBe(2);
    });

    it('should navigate to products when browse products clicked', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const browseProductsCard = compiled.querySelectorAll('.action-card')[0] as HTMLButtonElement;

      browseProductsCard.click();

      expect(component.activeView).toBe('products');
    });

    it('should navigate to lists when create list clicked', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const createListCard = compiled.querySelectorAll('.action-card')[1] as HTMLButtonElement;

      createListCard.click();

      expect(component.activeView).toBe('lists');
    });
  });

  describe('Products View', () => {
    beforeEach(() => {
      component.setActiveView('products');
      fixture.detectChanges();
    });

    it('should display product catalog component', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const productCatalog = compiled.querySelector('app-product-catalog-component');

      expect(productCatalog).toBeTruthy();
    });

    it('should not display overview content', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const welcomeSection = compiled.querySelector('.welcome-section');

      expect(welcomeSection).toBeFalsy();
    });
  });

  describe('Lists View', () => {
    beforeEach(() => {
      component.setActiveView('lists');
      fixture.detectChanges();
    });

    it('should display coming soon message', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const comingSoon = compiled.querySelector('.coming-soon-section');

      expect(comingSoon).toBeTruthy();
      expect(comingSoon?.textContent).toContain('Shopping Lists');
      expect(comingSoon?.textContent).toContain('coming soon');
    });

    it('should have button to browse products instead', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const button = compiled.querySelector(
        '.coming-soon-section .btn-secondary'
      ) as HTMLButtonElement;

      expect(button).toBeTruthy();
      expect(button.textContent).toContain('Browse Products Instead');
    });

    it('should navigate to products when button clicked', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const button = compiled.querySelector(
        '.coming-soon-section .btn-secondary'
      ) as HTMLButtonElement;

      button.click();

      expect(component.activeView).toBe('products');
    });
  });

  describe('Logo Display', () => {
    it('should display SmartKoszyka logo', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const logo = compiled.querySelector('.logo');

      expect(logo?.textContent).toContain('Smart');
      expect(logo?.textContent).toContain('Koszyka');
    });

    it('should have separate spans for logo parts', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const logoSmart = compiled.querySelector('.logo-smart');
      const logoKoszyka = compiled.querySelector('.logo-koszyka');

      expect(logoSmart?.textContent).toBe('Smart');
      expect(logoKoszyka?.textContent).toBe('Koszyka');
    });
  });

  describe('Logout Functionality', () => {
    it('should call authService.logout when logout button clicked', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const logoutButton = compiled.querySelector('.btn-logout') as HTMLButtonElement;

      logoutButton.click();

      expect(authService.logout).toHaveBeenCalled();
    });

    it('should have logout button in user menu', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const logoutButton = compiled.querySelector('.btn-logout');

      expect(logoutButton).toBeTruthy();
      expect(logoutButton?.textContent?.trim()).toBe('Logout');
    });

    it('should call onLogout method', () => {
      spyOn(component, 'onLogout');
      const compiled = fixture.nativeElement as HTMLElement;
      const logoutButton = compiled.querySelector('.btn-logout') as HTMLButtonElement;

      logoutButton.click();

      expect(component.onLogout).toHaveBeenCalled();
    });
  });

  describe('Null User Handling', () => {
    it('should handle null user gracefully', () => {
      currentUserSubject.next(null);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const userMenu = compiled.querySelector('.user-menu');

      expect(userMenu).toBeFalsy();
    });

    it('should not display welcome section when user is null on overview', () => {
      currentUserSubject.next(null);
      component.setActiveView('overview');
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const welcomeSection = compiled.querySelector('.welcome-section');

      expect(welcomeSection).toBeFalsy();
    });
  });

  describe('Header Structure', () => {
    it('should have sticky header', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const header = compiled.querySelector('.dashboard-header');

      expect(header).toBeTruthy();
    });

    it('should have header content wrapper', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const headerContent = compiled.querySelector('.header-content');

      expect(headerContent).toBeTruthy();
    });

    it('should have navigation in header', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const nav = compiled.querySelector('.dashboard-nav');

      expect(nav).toBeTruthy();
    });

    it('should display logo and user menu in same header', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const header = compiled.querySelector('.dashboard-header');
      const logo = header?.querySelector('.logo');
      const userMenu = header?.querySelector('.user-menu');

      expect(logo).toBeTruthy();
      expect(userMenu).toBeTruthy();
    });
  });

  describe('Responsive Behavior', () => {
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

  describe('View Switching Integration', () => {
    it('should maintain state when switching between views', () => {
      component.setActiveView('overview');
      fixture.detectChanges();

      component.setActiveView('products');
      fixture.detectChanges();

      component.setActiveView('overview');
      fixture.detectChanges();

      expect(component.activeView).toBe('overview');
    });

    it('should properly clean up views when switching', () => {
      component.setActiveView('overview');
      fixture.detectChanges();

      let compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('.welcome-section')).toBeTruthy();

      component.setActiveView('products');
      fixture.detectChanges();

      compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('.welcome-section')).toBeFalsy();
      expect(compiled.querySelector('app-product-catalog-component')).toBeTruthy();
    });
  });
});
