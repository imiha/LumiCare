import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StatusBadgeComponent } from './status-badge.component';

describe('StatusBadgeComponent', () => {
  let fixture: ComponentFixture<StatusBadgeComponent>;
  let compiled: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatusBadgeComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(StatusBadgeComponent);
  });

  it('should create', () => {
    fixture.componentRef.setInput('status', 'scheduled');
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  describe('rendered text', () => {
    it('displays the status text inside the span', () => {
      fixture.componentRef.setInput('status', 'confirmed');
      fixture.detectChanges();
      compiled = fixture.nativeElement as HTMLElement;
      const span = compiled.querySelector('span.badge') as HTMLElement;
      expect(span.textContent?.trim()).toBe('confirmed');
    });
  });

  describe('CSS class per status', () => {
    const statuses = ['scheduled', 'confirmed', 'completed', 'cancelled'] as const;

    statuses.forEach(status => {
      it(`applies badge--${status} class when status is "${status}"`, () => {
        fixture.componentRef.setInput('status', status);
        fixture.detectChanges();
        compiled = fixture.nativeElement as HTMLElement;
        const span = compiled.querySelector('span') as HTMLElement;
        expect(span.classList.contains(`badge--${status}`)).toBeTrue();
      });
    });

    it('does not apply a sibling status class when a specific status is set', () => {
      fixture.componentRef.setInput('status', 'scheduled');
      fixture.detectChanges();
      compiled = fixture.nativeElement as HTMLElement;
      const span = compiled.querySelector('span') as HTMLElement;
      expect(span.classList.contains('badge--confirmed')).toBeFalse();
      expect(span.classList.contains('badge--completed')).toBeFalse();
      expect(span.classList.contains('badge--cancelled')).toBeFalse();
    });
  });

  describe('signal input reactivity', () => {
    it('updates the rendered text when the input changes', () => {
      fixture.componentRef.setInput('status', 'scheduled');
      fixture.detectChanges();
      compiled = fixture.nativeElement as HTMLElement;
      let span = compiled.querySelector('span') as HTMLElement;
      expect(span.textContent?.trim()).toBe('scheduled');

      fixture.componentRef.setInput('status', 'cancelled');
      fixture.detectChanges();
      span = compiled.querySelector('span') as HTMLElement;
      expect(span.textContent?.trim()).toBe('cancelled');
    });

    it('updates the CSS class when the input changes', () => {
      fixture.componentRef.setInput('status', 'scheduled');
      fixture.detectChanges();
      compiled = fixture.nativeElement as HTMLElement;
      let span = compiled.querySelector('span') as HTMLElement;
      expect(span.classList.contains('badge--scheduled')).toBeTrue();

      fixture.componentRef.setInput('status', 'completed');
      fixture.detectChanges();
      span = compiled.querySelector('span') as HTMLElement;
      expect(span.classList.contains('badge--completed')).toBeTrue();
      expect(span.classList.contains('badge--scheduled')).toBeFalse();
    });
  });
});
