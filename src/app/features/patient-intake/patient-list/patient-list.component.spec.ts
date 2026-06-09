import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { PatientListComponent } from './patient-list.component';
import { PatientService } from '../../../core/services/patient.service';
import { Patient } from '../../../core/models/patient';
import { of } from 'rxjs';

const DEMO_PATIENTS: Patient[] = [
  { id: 1, firstName: 'Sophie', lastName: 'Bernard', email: 'sophie@example.com', phone: '+31 6 1' },
  { id: 2, firstName: 'Marie', lastName: 'Dupont', email: 'marie@example.com', phone: '+31 6 2' },
  { id: 3, firstName: 'Jean', lastName: 'Martin', email: 'jean@example.com', phone: '+31 6 3' },
];

describe('PatientListComponent', () => {
  let fixture: ComponentFixture<PatientListComponent>;
  let component: PatientListComponent;
  let mockService: jasmine.SpyObj<PatientService>;

  beforeEach(async () => {
    mockService = jasmine.createSpyObj('PatientService', ['getPatients']);
    mockService.getPatients.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [PatientListComponent],
      providers: [{ provide: PatientService, useValue: mockService }],
    }).compileComponents();

    fixture = TestBed.createComponent(PatientListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  // Story 1.3.1 — Patient List
  describe('Story 1.3.1 — patient list display', () => {
    it('shows all patients when no search is active', () => {
      fixture.componentRef.setInput('patients', DEMO_PATIENTS);
      fixture.detectChanges();
      expect(component.filteredPatients().length).toBe(3);
    });

    it('renders one table row per patient', () => {
      fixture.componentRef.setInput('patients', DEMO_PATIENTS);
      fixture.detectChanges();
      const rows = fixture.nativeElement.querySelectorAll('.patient-row');
      expect(rows.length).toBe(3);
    });

    it('displays patient full name, email, phone in each row', () => {
      fixture.componentRef.setInput('patients', [DEMO_PATIENTS[0]]);
      fixture.detectChanges();
      const text: string = fixture.nativeElement.textContent;
      expect(text).toContain('Sophie Bernard');
      expect(text).toContain('sophie@example.com');
      expect(text).toContain('+31 6 1');
    });

    it('shows loading message while patients are being fetched', () => {
      fixture.componentRef.setInput('patients', []);
      fixture.componentRef.setInput('loading', true);
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toContain('Loading patients');
    });

    it('shows empty state when patients list is empty', () => {
      fixture.componentRef.setInput('patients', []);
      fixture.componentRef.setInput('loading', false);
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toContain('No patients found');
    });

    it('displays patient count in the header', () => {
      fixture.componentRef.setInput('patients', DEMO_PATIENTS);
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toContain('3');
    });

    it('emits patientSelected when a row is clicked', () => {
      fixture.componentRef.setInput('patients', DEMO_PATIENTS);
      fixture.detectChanges();
      let selected: Patient | undefined;
      const sub = component.patientSelected.subscribe((p: Patient) => (selected = p));
      const row = fixture.nativeElement.querySelector('.patient-row') as HTMLElement;
      row.click();
      expect(selected).toEqual(DEMO_PATIENTS[0]);
      sub.unsubscribe();
    });

    it('sets selectedId when a row is clicked', () => {
      fixture.componentRef.setInput('patients', DEMO_PATIENTS);
      fixture.detectChanges();
      component.onSelect(DEMO_PATIENTS[1]);
      expect(component.selectedId()).toBe(2);
    });
  });

  // Story 1.3.2 — Live Search
  describe('Story 1.3.2 — live search', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('patients', DEMO_PATIENTS);
      fixture.detectChanges();
    });

    it('shows all patients when search query is empty', () => {
      component.searchQuery.set('');
      expect(component.filteredPatients().length).toBe(3);
    });

    it('shows all patients when search query has 1 character', () => {
      component.searchQuery.set('m');
      expect(component.filteredPatients().length).toBe(3);
    });

    it('filters by lastName client-side when query >= 2 chars', () => {
      component.searchQuery.set('du');
      const names = component.filteredPatients().map(p => p.lastName);
      expect(names).toContain('Dupont');
      expect(names).not.toContain('Bernard');
      expect(names).not.toContain('Martin');
    });

    it('filters by firstName client-side', () => {
      component.searchQuery.set('so');
      const names = component.filteredPatients().map(p => p.firstName);
      expect(names).toContain('Sophie');
      expect(names).not.toContain('Marie');
    });

    it('filters by email client-side', () => {
      component.searchQuery.set('jean@');
      const names = component.filteredPatients().map(p => p.firstName);
      expect(names).toContain('Jean');
      expect(names).not.toContain('Marie');
    });

    it('filter is case-insensitive', () => {
      component.searchQuery.set('DU');
      expect(component.filteredPatients().some(p => p.lastName === 'Dupont')).toBeTrue();
    });

    it('does NOT call getPatients() API before 300ms', fakeAsync(() => {
      mockService.getPatients.calls.reset();
      component.searchQuery.set('jean');
      fixture.detectChanges();
      tick(299);
      expect(mockService.getPatients).not.toHaveBeenCalledWith('jean');
      tick(100); // clean up timer
    }));

    it('calls getPatients() API with the search term after 300ms debounce', fakeAsync(() => {
      mockService.getPatients.calls.reset();
      mockService.getPatients.and.returnValue(of([DEMO_PATIENTS[2]]));
      component.searchQuery.set('jean');
      fixture.detectChanges();
      tick(300);
      expect(mockService.getPatients).toHaveBeenCalledWith('jean');
    }));

    it('updates filteredPatients with API results after debounce', fakeAsync(() => {
      mockService.getPatients.and.returnValue(of([DEMO_PATIENTS[2]]));
      component.searchQuery.set('jean');
      fixture.detectChanges();
      tick(300);
      expect(component.filteredPatients()).toEqual([DEMO_PATIENTS[2]]);
    }));

    it('resets to client-side results when query is cleared', fakeAsync(() => {
      mockService.getPatients.and.returnValue(of([DEMO_PATIENTS[2]]));
      component.searchQuery.set('jean');
      fixture.detectChanges();
      tick(300);
      component.searchQuery.set('');
      fixture.detectChanges();
      expect(component.filteredPatients().length).toBe(3);
    }));
  });
});
