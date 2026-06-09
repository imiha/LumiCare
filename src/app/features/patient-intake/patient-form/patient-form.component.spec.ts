import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { PatientFormComponent } from './patient-form.component';
import { PatientService } from '../../../core/services/patient.service';
import { Patient } from '../../../core/models/patient';
import { of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

const VALID_PATIENT: Patient = {
  firstName: 'Marie', lastName: 'Dupont', email: 'marie@example.com',
};
const CREATED_PATIENT: Patient = { ...VALID_PATIENT, id: 1 };

describe('PatientFormComponent', () => {
  let fixture: ComponentFixture<PatientFormComponent>;
  let component: PatientFormComponent;
  let mockService: jasmine.SpyObj<PatientService>;

  beforeEach(async () => {
    mockService = jasmine.createSpyObj('PatientService', ['createPatient']);

    await TestBed.configureTestingModule({
      imports: [PatientFormComponent],
      providers: [{ provide: PatientService, useValue: mockService }],
    }).compileComponents();

    fixture = TestBed.createComponent(PatientFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Story 1.1.1 — Registration Form
  describe('Story 1.1.1 — form validation', () => {
    it('form is invalid when all fields are empty', () => {
      expect(component.form.invalid).toBeTrue();
    });

    it('form is invalid without firstName', () => {
      component.form.patchValue({ lastName: 'Dupont', email: 'marie@example.com' });
      expect(component.form.get('firstName')?.invalid).toBeTrue();
    });

    it('form is invalid without lastName', () => {
      component.form.patchValue({ firstName: 'Marie', email: 'marie@example.com' });
      expect(component.form.get('lastName')?.invalid).toBeTrue();
    });

    it('form is invalid without email', () => {
      component.form.patchValue({ firstName: 'Marie', lastName: 'Dupont' });
      expect(component.form.get('email')?.invalid).toBeTrue();
    });

    it('form is invalid with a malformed email', () => {
      component.form.patchValue({ firstName: 'Marie', lastName: 'Dupont', email: 'not-an-email' });
      expect(component.form.get('email')?.hasError('email')).toBeTrue();
    });

    it('form is valid when all required fields are provided', () => {
      component.form.patchValue(VALID_PATIENT);
      expect(component.form.valid).toBeTrue();
    });

    it('onSubmit() does not call the service when form is invalid', () => {
      component.onSubmit();
      expect(mockService.createPatient).not.toHaveBeenCalled();
    });

    it('submit button is disabled when form is invalid', () => {
      fixture.detectChanges();
      const btn: HTMLButtonElement = fixture.nativeElement.querySelector('button[type="submit"]');
      expect(btn.disabled).toBeTrue();
    });

    it('submit button is enabled when form is valid', () => {
      component.form.patchValue(VALID_PATIENT);
      fixture.detectChanges();
      const btn: HTMLButtonElement = fixture.nativeElement.querySelector('button[type="submit"]');
      expect(btn.disabled).toBeFalse();
    });
  });

  // Story 1.1.2 — Duplicate Email Detection
  describe('Story 1.1.2 — duplicate email detection', () => {
    it('sets emailError signal when API returns 409', fakeAsync(() => {
      mockService.createPatient.and.returnValue(throwError(() =>
        new HttpErrorResponse({ status: 409, error: { error: 'A patient with this email already exists' } })
      ));
      component.form.patchValue(VALID_PATIENT);
      component.onSubmit();
      tick();
      expect(component.emailError()).toBe('A patient with this email already exists');
    }));

    it('uses fallback message when 409 body has no error field', fakeAsync(() => {
      mockService.createPatient.and.returnValue(throwError(() =>
        new HttpErrorResponse({ status: 409, error: {} })
      ));
      component.form.patchValue(VALID_PATIENT);
      component.onSubmit();
      tick();
      expect(component.emailError()).toBe('A patient with this email already exists');
    }));

    it('clears emailError before each new submit', fakeAsync(() => {
      mockService.createPatient.and.returnValue(of(CREATED_PATIENT));
      component.emailError.set('old error');
      component.form.patchValue(VALID_PATIENT);
      component.onSubmit();
      tick();
      expect(component.emailError()).toBeNull();
    }));

    it('renders the email error inline in the template', fakeAsync(() => {
      mockService.createPatient.and.returnValue(throwError(() =>
        new HttpErrorResponse({ status: 409, error: { error: 'A patient with this email already exists' } })
      ));
      component.form.patchValue(VALID_PATIENT);
      component.onSubmit();
      tick();
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toContain('A patient with this email already exists');
    }));

    it('does not set emailError for non-409 errors', fakeAsync(() => {
      mockService.createPatient.and.returnValue(throwError(() =>
        new HttpErrorResponse({ status: 500 })
      ));
      component.form.patchValue(VALID_PATIENT);
      component.onSubmit();
      tick();
      expect(component.emailError()).toBeNull();
    }));
  });

  // Story 1.1.3 — Registration Success State
  describe('Story 1.1.3 — registration success', () => {
    it('emits patientCreated with the new patient on success', fakeAsync(() => {
      mockService.createPatient.and.returnValue(of(CREATED_PATIENT));
      let emitted: Patient | undefined;
      const sub = component.patientCreated.subscribe((p: Patient) => (emitted = p));

      component.form.patchValue(VALID_PATIENT);
      component.onSubmit();
      tick();

      expect(emitted).toEqual(CREATED_PATIENT);
      sub.unsubscribe();
    }));

    it('resets the form to empty after successful registration', fakeAsync(() => {
      mockService.createPatient.and.returnValue(of(CREATED_PATIENT));
      component.form.patchValue(VALID_PATIENT);
      component.onSubmit();
      tick();
      expect(component.form.value.firstName).toBeFalsy();
      expect(component.form.value.email).toBeFalsy();
    }));

    it('sets submitting back to false after success', fakeAsync(() => {
      mockService.createPatient.and.returnValue(of(CREATED_PATIENT));
      component.form.patchValue(VALID_PATIENT);
      component.onSubmit();
      tick();
      expect(component.submitting()).toBeFalse();
    }));

    it('sets submitting back to false after error', fakeAsync(() => {
      mockService.createPatient.and.returnValue(throwError(() =>
        new HttpErrorResponse({ status: 500 })
      ));
      component.form.patchValue(VALID_PATIENT);
      component.onSubmit();
      tick();
      expect(component.submitting()).toBeFalse();
    }));
  });
});
