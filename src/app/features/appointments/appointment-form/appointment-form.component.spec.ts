import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

import { AppointmentFormComponent } from './appointment-form.component';
import { AppointmentService } from '../../../core/services/appointment.service';
import { PatientService } from '../../../core/services/patient.service';
import { Appointment } from '../../../core/models/appointment';
import { Staff } from '../../../core/models/staff';
import { Service } from '../../../core/models/service';
import { Patient } from '../../../core/models/patient';

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const MOCK_STAFF: Staff[] = [
  { id: 1, firstName: 'Sophie', lastName: 'Laurent', role: 'Naturopath' },
  { id: 2, firstName: 'Pierre', lastName: 'Moreau', role: 'Osteopath' },
];

const MOCK_SERVICES: Service[] = [
  { id: 1, name: 'Initial Consultation', duration: 60 },
  { id: 2, name: 'Follow-up', duration: 30 },
];

const MOCK_PATIENT: Patient = {
  id: 1,
  firstName: 'Marie',
  lastName: 'Dupont',
  email: 'marie@example.com',
};

const MOCK_CREATED: Appointment = {
  id: 10,
  patientId: 1,
  practitionerId: 1,
  serviceId: 1,
  date: '2026-06-09',
  startTime: '09:00',
  endTime: '10:00',
  status: 'scheduled',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function fillForm(component: AppointmentFormComponent): void {
  component.selectPatient(MOCK_PATIENT);
  component.form.patchValue({
    practitionerId: 1,
    serviceId: 1,
    date: '2026-06-09',
    startTime: '09:00',
    endTime: '10:00',
  });
}

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------

describe('AppointmentFormComponent', () => {
  let component: AppointmentFormComponent;
  let fixture: ComponentFixture<AppointmentFormComponent>;
  let apptSpy: jasmine.SpyObj<AppointmentService>;
  let patientSpy: jasmine.SpyObj<PatientService>;

  beforeEach(async () => {
    apptSpy = jasmine.createSpyObj('AppointmentService', [
      'getStaff',
      'getServices',
      'createAppointment',
    ]);
    patientSpy = jasmine.createSpyObj('PatientService', ['getPatients']);

    apptSpy.getStaff.and.returnValue(of(MOCK_STAFF));
    apptSpy.getServices.and.returnValue(of(MOCK_SERVICES));
    patientSpy.getPatients.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [AppointmentFormComponent],
      providers: [
        provideHttpClient(),
        { provide: AppointmentService, useValue: apptSpy },
        { provide: PatientService, useValue: patientSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AppointmentFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // -------------------------------------------------------------------------
  // Story 2.1.1 — Booking Form
  // -------------------------------------------------------------------------

  describe('Story 2.1.1 — Booking Form', () => {
    it('calls getStaff() on init', () => {
      expect(apptSpy.getStaff).toHaveBeenCalledTimes(1);
    });

    it('calls getServices() on init', () => {
      expect(apptSpy.getServices).toHaveBeenCalledTimes(1);
    });

    it('populates the staff signal from the API', () => {
      expect(component.staff()).toEqual(MOCK_STAFF);
    });

    it('populates the services signal from the API', () => {
      expect(component.services()).toEqual(MOCK_SERVICES);
    });

    it('patientSelected is false initially', () => {
      expect(component.patientSelected()).toBeFalse();
    });

    it('patientSelected is true after selectPatient()', () => {
      component.selectPatient(MOCK_PATIENT);
      expect(component.patientSelected()).toBeTrue();
    });

    it('selectPatient() patches patientId in the form', () => {
      component.selectPatient(MOCK_PATIENT);
      expect(component.form.value.patientId).toBe(MOCK_PATIENT.id!);
    });

    it('selectPatient() sets patientSearchText to full name', () => {
      component.selectPatient(MOCK_PATIENT);
      expect(component.patientSearchText()).toBe('Marie Dupont');
    });

    it('selectPatient() clears patientResults', () => {
      component.patientResults.set([MOCK_PATIENT]);
      component.selectPatient(MOCK_PATIENT);
      expect(component.patientResults()).toEqual([]);
    });

    it('onPatientSearch() calls getPatients after 200 ms debounce', fakeAsync(() => {
      component.onPatientSearch('Ma');
      tick(200);
      expect(patientSpy.getPatients).toHaveBeenCalledWith('Ma');
    }));

    it('onPatientSearch() does NOT call getPatients before 200 ms', fakeAsync(() => {
      component.onPatientSearch('Ma');
      tick(199);
      expect(patientSpy.getPatients).not.toHaveBeenCalled();
      // clean up pending timer
      tick(100);
    }));

    it('onPatientSearch() clears results when query is shorter than 2 chars', () => {
      component.patientResults.set([MOCK_PATIENT]);
      component.onPatientSearch('M');
      expect(component.patientResults()).toEqual([]);
    });

    it('onPatientSearch() resets selectedPatient to null', () => {
      component.selectPatient(MOCK_PATIENT);
      component.onPatientSearch('X');
      expect(component.selectedPatient()).toBeNull();
    });

    it('onServiceChange() calculates endTime correctly: 09:00 + 60 min = 10:00', () => {
      component.form.patchValue({ startTime: '09:00' });
      const event = { target: { value: '1' } } as unknown as Event;
      component.onServiceChange(event);
      expect(component.form.value.endTime).toBe('10:00');
    });

    it('onServiceChange() handles boundary: 09:45 + 30 min = 10:15', () => {
      component.form.patchValue({ startTime: '09:45' });
      const event = { target: { value: '2' } } as unknown as Event;
      component.onServiceChange(event);
      expect(component.form.value.endTime).toBe('10:15');
    });

    it('onStartTimeChange() recalculates endTime when service is already set', () => {
      component.form.patchValue({ serviceId: 1, startTime: '14:00' });
      component.onStartTimeChange();
      expect(component.form.value.endTime).toBe('15:00');
    });

    it('submit button is disabled when the form is invalid', () => {
      fixture.detectChanges();
      const btn: HTMLButtonElement = fixture.nativeElement.querySelector('button[type="submit"]');
      expect(btn.disabled).toBeTrue();
    });

    it('submit button is disabled when no patient is selected (form values set directly)', () => {
      // Patch form to nominally valid values without going through selectPatient()
      component.form.patchValue({
        patientId: 1,
        practitionerId: 1,
        serviceId: 1,
        date: '2026-06-09',
        startTime: '09:00',
        endTime: '10:00',
      });
      fixture.detectChanges();
      const btn: HTMLButtonElement = fixture.nativeElement.querySelector('button[type="submit"]');
      // selectedPatient signal is still null → button must remain disabled
      expect(btn.disabled).toBeTrue();
    });
  });

  // -------------------------------------------------------------------------
  // Story 2.1.2 — Conflict Detection
  // -------------------------------------------------------------------------

  describe('Story 2.1.2 — Conflict Detection', () => {
    it('sets conflictError when the API returns 409 with an error body', () => {
      fillForm(component);
      const err = new HttpErrorResponse({ status: 409, error: { error: 'Practitioner is busy' } });
      apptSpy.createAppointment.and.returnValue(throwError(() => err));

      component.onSubmit();

      expect(component.conflictError()).toBe('Practitioner is busy');
    });

    it('uses the fallback message when the 409 body has no error field', () => {
      fillForm(component);
      const err = new HttpErrorResponse({ status: 409, error: {} });
      apptSpy.createAppointment.and.returnValue(throwError(() => err));

      component.onSubmit();

      expect(component.conflictError()).toBe('Time slot conflict for this practitioner');
    });

    it('clears conflictError at the start of each submit attempt (success path)', () => {
      fillForm(component);
      component.conflictError.set('Old conflict');
      apptSpy.createAppointment.and.returnValue(of(MOCK_CREATED));

      component.onSubmit();

      expect(component.conflictError()).toBeNull();
    });

    it('renders the conflict error in the template', () => {
      fillForm(component);
      const err = new HttpErrorResponse({ status: 409, error: { error: 'Slot taken' } });
      apptSpy.createAppointment.and.returnValue(throwError(() => err));

      component.onSubmit();
      fixture.detectChanges();

      const errorEl: HTMLElement = fixture.nativeElement.querySelector('.conflict-error');
      expect(errorEl).toBeTruthy();
      expect(errorEl.textContent).toContain('Slot taken');
    });

    it('does not set conflictError for non-409 errors', () => {
      fillForm(component);
      const err = new HttpErrorResponse({ status: 500, error: { error: 'Server error' } });
      apptSpy.createAppointment.and.returnValue(throwError(() => err));

      component.onSubmit();

      expect(component.conflictError()).toBeNull();
    });
  });

  // -------------------------------------------------------------------------
  // Story 2.1.3 — Appointment Confirmation
  // -------------------------------------------------------------------------

  describe('Story 2.1.3 — Appointment Confirmation', () => {
    it('onSubmit() calls createAppointment with form values', () => {
      fillForm(component);
      apptSpy.createAppointment.and.returnValue(of(MOCK_CREATED));

      component.onSubmit();

      expect(apptSpy.createAppointment).toHaveBeenCalledTimes(1);
    });

    it('emits appointmentCreated with the returned appointment', () => {
      fillForm(component);
      apptSpy.createAppointment.and.returnValue(of(MOCK_CREATED));

      const emitted: Appointment[] = [];
      const outputRef = fixture.componentRef.instance.appointmentCreated;
      // Subscribe via the output's subscribe method (Angular output)
      outputRef.subscribe((appt: Appointment) => emitted.push(appt));

      component.onSubmit();

      expect(emitted).toEqual([MOCK_CREATED]);
    });

    it('resets the form after a successful submission', () => {
      fillForm(component);
      apptSpy.createAppointment.and.returnValue(of(MOCK_CREATED));

      component.onSubmit();

      expect(component.form.value.practitionerId).toBeNull();
      expect(component.form.value.date).toBeFalsy();
    });

    it('resets selectedPatient to null after a successful submission', () => {
      fillForm(component);
      apptSpy.createAppointment.and.returnValue(of(MOCK_CREATED));

      component.onSubmit();

      expect(component.selectedPatient()).toBeNull();
    });

    it('sets submitting to false after a successful submission', () => {
      fillForm(component);
      apptSpy.createAppointment.and.returnValue(of(MOCK_CREATED));

      component.onSubmit();

      expect(component.submitting()).toBeFalse();
    });

    it('sets submitting to false after an error', () => {
      fillForm(component);
      const err = new HttpErrorResponse({ status: 500 });
      apptSpy.createAppointment.and.returnValue(throwError(() => err));

      component.onSubmit();

      expect(component.submitting()).toBeFalse();
    });

    it('does not call createAppointment when no patient is selected', () => {
      component.form.patchValue({
        practitionerId: 1,
        serviceId: 1,
        date: '2026-06-09',
        startTime: '09:00',
        endTime: '10:00',
      });

      component.onSubmit();

      expect(apptSpy.createAppointment).not.toHaveBeenCalled();
    });
  });
});
