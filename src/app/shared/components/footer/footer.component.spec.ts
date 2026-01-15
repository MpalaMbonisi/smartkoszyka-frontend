import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FooterComponent } from './footer.component';
describe('FooterComponent', () => {
  let component: FooterComponent;
  let fixture: ComponentFixture<FooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FooterComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display current year', () => {
    const currentYear = new Date().getFullYear();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).toContain(currentYear.toString());
  });

  it('should display copyright text', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).toContain('SmartKoszyka');
    expect(compiled.textContent).toContain('All rights reserved');
  });

  describe('responsive layout', () => {
    it('should have footer-content container', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const footerContent = compiled.querySelector('.footer-content');

      expect(footerContent).toBeTruthy();
    });
  });
});
