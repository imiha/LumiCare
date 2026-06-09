import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { PatientDetailComponent } from './patient-detail.component';
import { PatientService } from '../../../core/services/patient.service';
import { Patient } from '../../../core/models/patient';
import { of, throwError } from 'rxjs';

const MOCK_PATIENT: Patient = {
  id: 1,
  firstName: 'Marie',
  lastName: 'Dupont',
  email: 'marie@example.com',
  phone: '+31 6 12345678',
  dateOfBirth: '1985-03-15',
  gender: 'F',
  emergencyContactName: 'Jean Dupont',
  emergencyContactPhone: '+31 6 87654321',
  allergies: 'Penicillin',
  medications: '',
  conditions: 'Hypertension',
  notes: 'Morning appointments preferred',
};

describe('PatientDetailComponent', () => {
  let fixture: ComponentFixture<PatientDetailComponent>;
  let component: PatientDetailComponent;
  let mockService: jasmine.SpyObj<PatientService>;

  beforeEach(async () => {
    mockService = jasmine.createSpyObj('PatientService', ['updatePatient']);

    await TestBed.configureTestingModule({
      imports: [PatientDetailComponent],
      providers: [{ provide: PatientService, useValue: mockService }],
    }).compileComponents();

    fixture = TestBed.createComponent(PatientDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Story 1.2.1 — Medical History Fields
  describe('Story 1.2.1 — medical history section', () => {
    it('historyExpanded signal is true by default', () => {
      expect(component.historyExpanded()).toBeTrue();
    });

    it('toggleHistory() sets historyExpanded to false', () => {
      component.toggleHistory();
      expect(component.historyExpanded()).toBeFalse();
    });

    it('toggleHistory() called twice restores historyExpanded to true', () => {
      component.toggleHistory();
      component.toggleHistory();
      expect(component.historyExpanded()).toBeTrue();
    });

    it('allergies field has no required validator (optional)', () => {
      expect(component.form.get('allergies')?.validator).toBeNull();
    });

    it('medications field has no required validator (optional)', () => {
      expect(component.form.get('medications')?.validator).toBeNull();
    });

    it('conditions field has no required validator (optional)', () => {
      expect(component.form.get('conditions')?.validator).toBeNull();
    });

    it('notes field has no required validator (optional)', () => {
      expect(component.form.get('notes')?.validator).toBeNull();
    });

    it('hides textareas when history section is collapsed', fakeAsync(() => {
      fixture.componentRef.setInput('patient', MOCK_PATIENT);
      fixture.detectChanges();
      tick();
      component.toggleHistory();
      fixture.detectChanges();
      const textareas = fixture.nativeElement.querySelectorAll('textarea');
      expect(textareas.length).toBe(0);
    }));

    it('shows textareas when history section is expanded', fakeAsync(() => {
      fixture.componentRef.setInput('patient', MOCK_PATIENT);
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      const textareas = fixture.nativeElement.querySelectorAll('textarea');
      expect(textareas.length).toBeGreaterThan(0);
    }));
  });

  // Story 1.2.2 — View / Edit Patient Record
  describe('Story 1.2.2 — view and edit patient record', () => {
    it('shows empty state text when no patient is provided', () => {
      expect(fixture.nativeElement.textContent).toContain('Select a patient');
    });

    it('shows patient name in the panel header', fakeAsync(() => {
      fixture.componentRef.setInput('patient', MOCK_PATIENT);
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toContain('Marie Dupont');
    }));

    it('patches form with patient personal details when patient input changes', fakeAsync(() => {
      fixture.componentRef.setInput('patient', MOCK_PATIENT);
      fixture.detectChanges();
      tick();
      expect(component.form.value.firstName).toBe('Marie');
      expect(component.form.value.lastName).toBe('Dupont');
      expect(component.form.value.email).toBe('marie@example.com');
    }));

    it('patches form with medical history fields when patient input changes', fakeAsync(() => {
      fixture.componentRef.setInput('patient', MOCK_PATIENT);
      fixture.detectChanges();
      tick();
      expect(component.form.value.allergies).toBe('Penicillin');
      expect(component.form.value.conditions).toBe('Hypertension');
    }));

    it('updates form when patient input is replaced with a different patient', fakeAsync(() => {
      fixture.componentRef.setInput('patient', MOCK_PATIENT);
      fixture.detectChanges();
      tick();
      const otherPatient: Patient = { id: 2, firstName: 'Jean', lastName: 'Martin', email: 'jean@example.com' };
      fixture.componentRef.setInput('patient', otherPatient);
      fixture.detectChanges();
      tick();
      expect(component.form.value.firstName).toBe('Jean');
    }));

    it('onSave() calls updatePatient with the correct id', fakeAsync(() => {
      mockService.updatePatient.and.returnValue(of(MOCK_PATIENT));
      fixture.componentRef.setInput('patient', MOCK_PATIENT);
      fixture.detectChanges();
      tick();
      component.onSave();
      tick(3000);
      expect(mockService.updatePatient).toHaveBeenCalledWith(1, jasmine.any(Object));
    }));

    it('onSave() emits patientUpdated with the updated patient', fakeAsync(() => {
      const updated: Patient = { ...MOCK_PATIENT, phone: '+31 6 99999999' };
      mockService.updatePatient.and.returnValue(of(updated));
      fixture.componentRef.setInput('patient', MOCK_PATIENT);
      fixture.detectChanges();
      tick();

      let emitted: Patient | undefined;
      const sub = component.patientUpdated.subscribe((p: Patient) => (emitted = p));
      component.onSave();
      tick(3000);

      expect(emitted).toEqual(updated);
      sub.unsubscribe();
    }));

    it('saveSuccess signal is true immediately after save', fakeAsync(() => {
      mockService.updatePatient.and.returnValue(of(MOCK_PATIENT));
      fixture.componentRef.setInput('patient', MOCK_PATIENT);
      fixture.detectChanges();
      tick();
      component.onSave();
      tick();
      expect(component.saveSuccess()).toBeTrue();
      tick(3000);
    }));

    it('saveSuccess signal resets to false after 3 seconds', fakeAsync(() => {
      mockService.updatePatient.and.returnValue(of(MOCK_PATIENT));
      fixture.componentRef.setInput('patient', MOCK_PATIENT);
      fixture.detectChanges();
      tick();
      component.onSave();
      tick(3000);
      expect(component.saveSuccess()).toBeFalse();
    }));

    it('onSave() does nothing when no patient is set', () => {
      component.onSave();
      expect(mockService.updatePatient).not.toHaveBeenCalled();
    });

    it('sets saving back to false after a successful save', fakeAsync(() => {
      mockService.updatePatient.and.returnValue(of(MOCK_PATIENT));
      fixture.componentRef.setInput('patient', MOCK_PATIENT);
      fixture.detectChanges();
      tick();
      component.onSave();
      tick(3000);
      expect(component.saving()).toBeFalse();
    }));

    it('sets saving back to false after a failed save', fakeAsync(() => {
      mockService.updatePatient.and.returnValue(throwError(() => new Error('Server error')));
      fixture.componentRef.setInput('patient', MOCK_PATIENT);
      fixture.detectChanges();
      tick();
      component.onSave();
      tick();
      expect(component.saving()).toBeFalse();
    }));
  });
});
