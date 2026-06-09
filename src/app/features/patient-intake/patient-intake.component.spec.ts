import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { PatientIntakeComponent } from './patient-intake.component';
import { PatientService } from '../../core/services/patient.service';
import { Patient } from '../../core/models/patient';
import { of, throwError } from 'rxjs';
import { provideHttpClient } from '@angular/common/http';

const SEED_PATIENTS: Patient[] = [
  { id: 1, firstName: 'Sophie', lastName: 'Bernard', email: 'sophie@example.com' },
  { id: 2, firstName: 'Marie', lastName: 'Dupont', email: 'marie@example.com' },
  { id: 3, firstName: 'Jean', lastName: 'Martin', email: 'jean@example.com' },
];

describe('PatientIntakeComponent', () => {
  let fixture: ComponentFixture<PatientIntakeComponent>;
  let component: PatientIntakeComponent;
  let mockService: jasmine.SpyObj<PatientService>;

  beforeEach(async () => {
    mockService = jasmine.createSpyObj('PatientService', ['getPatients', 'createPatient', 'updatePatient']);
    mockService.getPatients.and.returnValue(of(SEED_PATIENTS));

    await TestBed.configureTestingModule({
      imports: [PatientIntakeComponent],
      providers: [
        provideHttpClient(),
        { provide: PatientService, useValue: mockService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PatientIntakeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Story 1.3.1 — 3 seeded patients visible on first load
  describe('Story 1.3.1 — initial patient load', () => {
    it('calls getPatients() on init', () => {
      expect(mockService.getPatients).toHaveBeenCalled();
    });

    it('populates the patients signal with API results', () => {
      expect(component.patients().length).toBe(3);
      expect(component.patients()).toEqual(SEED_PATIENTS);
    });

    it('sets loading to false after patients have loaded', fakeAsync(() => {
      tick();
      expect(component.loading()).toBeFalse();
    }));

    it('sets loading to false even when API returns an error', fakeAsync(() => {
      mockService.getPatients.and.returnValue(throwError(() => new Error('Network error')));
      component.ngOnInit();
      tick();
      expect(component.loading()).toBeFalse();
    }));
  });

  // Story 1.1.3 — new patient appears at top of list via signal
  describe('Story 1.1.3 — patient list signal updates', () => {
    it('onPatientCreated() prepends the new patient to the list', () => {
      const newPatient: Patient = { id: 4, firstName: 'Test', lastName: 'User', email: 'test@example.com' };
      component.onPatientCreated(newPatient);
      expect(component.patients()[0]).toEqual(newPatient);
      expect(component.patients().length).toBe(4);
    });

    it('onPatientCreated() does not affect the rest of the list', () => {
      const newPatient: Patient = { id: 4, firstName: 'Test', lastName: 'User', email: 'test@example.com' };
      component.onPatientCreated(newPatient);
      expect(component.patients().slice(1)).toEqual(SEED_PATIENTS);
    });
  });

  // Story 1.2.2 — selecting and updating a patient record
  describe('Story 1.2.2 — patient selection and update', () => {
    it('onPatientSelected() sets the selectedPatient signal', () => {
      component.onPatientSelected(SEED_PATIENTS[0]);
      expect(component.selectedPatient()).toEqual(SEED_PATIENTS[0]);
    });

    it('detail panel is hidden when no patient is selected', () => {
      fixture.detectChanges();
      const detail = fixture.nativeElement.querySelector('app-patient-detail');
      expect(detail).toBeNull();
    });

    it('detail panel is shown after a patient is selected', fakeAsync(() => {
      component.onPatientSelected(SEED_PATIENTS[0]);
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      const detail = fixture.nativeElement.querySelector('app-patient-detail');
      expect(detail).not.toBeNull();
    }));

    it('onPatientUpdated() replaces the matching patient in the list', () => {
      const updated: Patient = { ...SEED_PATIENTS[1], phone: '+31 6 99999999' };
      component.onPatientUpdated(updated);
      const inList = component.patients().find(p => p.id === 2);
      expect(inList?.phone).toBe('+31 6 99999999');
    });

    it('onPatientUpdated() does not change list length', () => {
      const updated: Patient = { ...SEED_PATIENTS[1], phone: '+31 6 99999999' };
      component.onPatientUpdated(updated);
      expect(component.patients().length).toBe(3);
    });

    it('onPatientUpdated() also refreshes selectedPatient', () => {
      component.onPatientSelected(SEED_PATIENTS[1]);
      const updated: Patient = { ...SEED_PATIENTS[1], phone: '+31 6 99999999' };
      component.onPatientUpdated(updated);
      expect(component.selectedPatient()?.phone).toBe('+31 6 99999999');
    });
  });
});
