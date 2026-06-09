import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AppointmentListComponent } from './appointment-list.component';
import { AppointmentService } from '../../../core/services/appointment.service';
import { Appointment } from '../../../core/models/appointment';
import { of, throwError } from 'rxjs';

const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: 1,
    patientId: 1,
    patientName: 'Marie Dupont',
    practitionerId: 1,
    practitionerName: 'Dr. Sophie Laurent',
    serviceId: 1,
    serviceName: 'Initial Consultation',
    date: '2026-06-09',
    startTime: '09:00',
    endTime: '10:00',
    status: 'scheduled',
  },
  {
    id: 2,
    patientId: 2,
    patientName: 'Jean Martin',
    practitionerId: 2,
    practitionerName: 'Dr. Pierre Moreau',
    serviceId: 4,
    serviceName: 'Osteopathy Session',
    date: '2026-06-09',
    startTime: '10:30',
    endTime: '11:15',
    status: 'confirmed',
  },
];

const CANCELLED_APPT: Appointment = { ...MOCK_APPOINTMENTS[0], status: 'cancelled' };
const COMPLETED_APPT: Appointment = { ...MOCK_APPOINTMENTS[0], status: 'completed' };

describe('AppointmentListComponent', () => {
  let fixture: ComponentFixture<AppointmentListComponent>;
  let component: AppointmentListComponent;
  let mockApptService: jasmine.SpyObj<AppointmentService>;

  beforeEach(async () => {
    mockApptService = jasmine.createSpyObj<AppointmentService>('AppointmentService', [
      'cancelAppointment',
    ]);

    await TestBed.configureTestingModule({
      imports: [AppointmentListComponent],
      providers: [{ provide: AppointmentService, useValue: mockApptService }],
    }).compileComponents();

    fixture = TestBed.createComponent(AppointmentListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // ---------------------------------------------------------------------------
  // Story 2.2.1 — Appointment List
  // ---------------------------------------------------------------------------
  describe('Story 2.2.1 — Appointment List', () => {
    it('shows empty state "No appointments for this date." when list is empty and loading is false', () => {
      fixture.componentRef.setInput('appointments', []);
      fixture.componentRef.setInput('loading', false);
      fixture.detectChanges();

      const el: HTMLElement = fixture.nativeElement;
      expect(el.textContent).toContain('No appointments for this date.');
    });

    it('shows "Loading appointments..." when loading is true', () => {
      fixture.componentRef.setInput('loading', true);
      fixture.detectChanges();

      const el: HTMLElement = fixture.nativeElement;
      expect(el.textContent).toContain('Loading appointments...');
    });

    it('renders one tbody row per appointment', () => {
      fixture.componentRef.setInput('appointments', MOCK_APPOINTMENTS);
      fixture.detectChanges();

      const rows = fixture.nativeElement.querySelectorAll('tbody tr');
      expect(rows.length).toBe(MOCK_APPOINTMENTS.length);
    });

    it('displays patient name in row', () => {
      fixture.componentRef.setInput('appointments', MOCK_APPOINTMENTS);
      fixture.detectChanges();

      const el: HTMLElement = fixture.nativeElement;
      expect(el.textContent).toContain('Marie Dupont');
      expect(el.textContent).toContain('Jean Martin');
    });

    it('displays practitioner name in row', () => {
      fixture.componentRef.setInput('appointments', MOCK_APPOINTMENTS);
      fixture.detectChanges();

      const el: HTMLElement = fixture.nativeElement;
      expect(el.textContent).toContain('Dr. Sophie Laurent');
      expect(el.textContent).toContain('Dr. Pierre Moreau');
    });

    it('displays service name in row', () => {
      fixture.componentRef.setInput('appointments', MOCK_APPOINTMENTS);
      fixture.detectChanges();

      const el: HTMLElement = fixture.nativeElement;
      expect(el.textContent).toContain('Initial Consultation');
      expect(el.textContent).toContain('Osteopathy Session');
    });

    it('timeRange() returns correct string with em dash', () => {
      const result = component.timeRange(MOCK_APPOINTMENTS[0]);
      expect(result).toBe('09:00 – 10:00');
    });

    it('renders app-status-badge per appointment row', () => {
      fixture.componentRef.setInput('appointments', MOCK_APPOINTMENTS);
      fixture.detectChanges();

      const badges = fixture.nativeElement.querySelectorAll('app-status-badge');
      expect(badges.length).toBe(MOCK_APPOINTMENTS.length);
    });

    it('displays appointment count', () => {
      fixture.componentRef.setInput('appointments', MOCK_APPOINTMENTS);
      fixture.detectChanges();

      const countEl: HTMLElement = fixture.nativeElement.querySelector('.count');
      expect(countEl?.textContent?.trim()).toBe(String(MOCK_APPOINTMENTS.length));
    });
  });

  // ---------------------------------------------------------------------------
  // Story 2.2.2 — Date Filter
  // ---------------------------------------------------------------------------
  describe('Story 2.2.2 — Date Filter', () => {
    it('emits dateChanged when onDateChange() is called', () => {
      let emitted: string | undefined;
      component.dateChanged.subscribe((d) => (emitted = d));

      component.onDateChange('2026-07-01');

      expect(emitted).toBe('2026-07-01');
    });

    it('renders a date input[type="date"] element', () => {
      const input: HTMLInputElement | null = fixture.nativeElement.querySelector('input[type="date"]');
      expect(input).toBeTruthy();
    });
  });

  // ---------------------------------------------------------------------------
  // Story 2.2.3 — Cancel Appointment
  // ---------------------------------------------------------------------------
  describe('Story 2.2.3 — Cancel Appointment', () => {
    it('shows .btn-cancel for scheduled appointments', () => {
      fixture.componentRef.setInput('appointments', [MOCK_APPOINTMENTS[0]]);
      fixture.detectChanges();

      const btn = fixture.nativeElement.querySelector('.btn-cancel');
      expect(btn).toBeTruthy();
    });

    it('shows .btn-cancel for confirmed appointments', () => {
      fixture.componentRef.setInput('appointments', [MOCK_APPOINTMENTS[1]]);
      fixture.detectChanges();

      const btn = fixture.nativeElement.querySelector('.btn-cancel');
      expect(btn).toBeTruthy();
    });

    it('hides .btn-cancel for cancelled appointments', () => {
      fixture.componentRef.setInput('appointments', [CANCELLED_APPT]);
      fixture.detectChanges();

      const btn = fixture.nativeElement.querySelector('.btn-cancel');
      expect(btn).toBeNull();
    });

    it('hides .btn-cancel for completed appointments', () => {
      fixture.componentRef.setInput('appointments', [COMPLETED_APPT]);
      fixture.detectChanges();

      const btn = fixture.nativeElement.querySelector('.btn-cancel');
      expect(btn).toBeNull();
    });

    it('onCancel() calls cancelAppointment with the appointment id', fakeAsync(() => {
      mockApptService.cancelAppointment.and.returnValue(of({ ...MOCK_APPOINTMENTS[0], status: 'cancelled' }));

      component.onCancel(MOCK_APPOINTMENTS[0]);
      tick();

      expect(mockApptService.cancelAppointment).toHaveBeenCalledWith(1);
    }));

    it('onCancel() emits appointmentCancelled with the appointment id', fakeAsync(() => {
      mockApptService.cancelAppointment.and.returnValue(of({ ...MOCK_APPOINTMENTS[0], status: 'cancelled' }));

      let emittedId: number | undefined;
      component.appointmentCancelled.subscribe((id) => (emittedId = id));

      component.onCancel(MOCK_APPOINTMENTS[0]);
      tick();

      expect(emittedId).toBe(1);
    }));

    it('sets cancelling to the appointment id during the request', fakeAsync(() => {
      let cancellingDuringRequest: number | null = null;

      mockApptService.cancelAppointment.and.callFake(() => {
        cancellingDuringRequest = component.cancelling();
        return of({ ...MOCK_APPOINTMENTS[0], status: 'cancelled' });
      });

      component.onCancel(MOCK_APPOINTMENTS[0]);
      tick();

      expect(cancellingDuringRequest!).toBe(1);
    }));

    it('resets cancelling to null after successful cancel', fakeAsync(() => {
      mockApptService.cancelAppointment.and.returnValue(of({ ...MOCK_APPOINTMENTS[0], status: 'cancelled' }));

      component.onCancel(MOCK_APPOINTMENTS[0]);
      tick();

      expect(component.cancelling()).toBeNull();
    }));

    it('resets cancelling to null after failed cancel', fakeAsync(() => {
      mockApptService.cancelAppointment.and.returnValue(throwError(() => new Error('Server error')));

      component.onCancel(MOCK_APPOINTMENTS[0]);
      tick();

      expect(component.cancelling()).toBeNull();
    }));

    it('does nothing when cancelling is already in progress', fakeAsync(() => {
      component.cancelling.set(99);

      component.onCancel(MOCK_APPOINTMENTS[0]);
      tick();

      expect(mockApptService.cancelAppointment).not.toHaveBeenCalled();

      component.cancelling.set(null);
    }));
  });
});
