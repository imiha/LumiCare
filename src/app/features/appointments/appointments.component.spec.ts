import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AppointmentsComponent } from './appointments.component';
import { AppointmentService } from '../../core/services/appointment.service';
import { PatientService } from '../../core/services/patient.service';
import { Appointment } from '../../core/models/appointment';
import { of, throwError } from 'rxjs';

const TODAY = new Date().toISOString().split('T')[0];

const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: 1,
    patientId: 1,
    patientName: 'Marie Dupont',
    practitionerId: 1,
    practitionerName: 'Dr. Laurent',
    serviceId: 1,
    serviceName: 'Initial Consultation',
    date: TODAY,
    startTime: '09:00',
    endTime: '10:00',
    status: 'scheduled',
  },
  {
    id: 2,
    patientId: 2,
    patientName: 'Jean Martin',
    practitionerId: 2,
    practitionerName: 'Dr. Moreau',
    serviceId: 4,
    serviceName: 'Osteopathy',
    date: TODAY,
    startTime: '10:30',
    endTime: '11:15',
    status: 'confirmed',
  },
];

const NEW_APPOINTMENT: Appointment = {
  id: 3,
  patientId: 3,
  patientName: 'Sophie Bernard',
  practitionerId: 1,
  practitionerName: 'Dr. Laurent',
  serviceId: 3,
  serviceName: 'Massage',
  date: TODAY,
  startTime: '08:00',
  endTime: '09:00',
  status: 'scheduled',
};

describe('AppointmentsComponent', () => {
  let fixture: ComponentFixture<AppointmentsComponent>;
  let component: AppointmentsComponent;
  let mockApptService: jasmine.SpyObj<AppointmentService>;
  let mockPatientService: jasmine.SpyObj<PatientService>;

  beforeEach(async () => {
    mockApptService = jasmine.createSpyObj<AppointmentService>('AppointmentService', [
      'getAppointments',
      'createAppointment',
      'cancelAppointment',
      'getStaff',
      'getServices',
    ]);
    mockPatientService = jasmine.createSpyObj<PatientService>('PatientService', ['getPatients']);

    mockApptService.getAppointments.and.returnValue(of(MOCK_APPOINTMENTS));
    mockApptService.getStaff.and.returnValue(of([]));
    mockApptService.getServices.and.returnValue(of([]));
    mockPatientService.getPatients.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [AppointmentsComponent],
      providers: [
        { provide: AppointmentService, useValue: mockApptService },
        { provide: PatientService, useValue: mockPatientService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AppointmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // ---------------------------------------------------------------------------
  // Init
  // ---------------------------------------------------------------------------
  describe('Init', () => {
    it('calls getAppointments() on init with today\'s date', () => {
      expect(mockApptService.getAppointments).toHaveBeenCalledWith(TODAY);
    });

    it('populates appointments signal from API', () => {
      expect(component.appointments()).toEqual(MOCK_APPOINTMENTS);
    });

    it('sets loading to false after load', () => {
      expect(component.loading()).toBeFalse();
    });

    it('sets loading to false on error', () => {
      mockApptService.getAppointments.and.returnValue(throwError(() => new Error('Network error')));

      component.loadAppointments();

      expect(component.loading()).toBeFalse();
    });
  });

  // ---------------------------------------------------------------------------
  // onDateChanged()
  // ---------------------------------------------------------------------------
  describe('onDateChanged()', () => {
    it('updates selectedDate signal', () => {
      component.onDateChanged('2026-07-15');

      expect(component.selectedDate()).toBe('2026-07-15');
    });

    it('reloads appointments for the new date', () => {
      mockApptService.getAppointments.calls.reset();
      mockApptService.getAppointments.and.returnValue(of([]));

      component.onDateChanged('2026-07-15');

      expect(mockApptService.getAppointments).toHaveBeenCalledWith('2026-07-15');
    });
  });

  // ---------------------------------------------------------------------------
  // onAppointmentCreated()
  // ---------------------------------------------------------------------------
  describe('onAppointmentCreated()', () => {
    it('adds new appointment when its date matches selectedDate', () => {
      component.appointments.set(MOCK_APPOINTMENTS);

      component.onAppointmentCreated(NEW_APPOINTMENT);

      expect(component.appointments().some((a) => a.id === NEW_APPOINTMENT.id)).toBeTrue();
    });

    it('does NOT add appointment when its date differs from selectedDate', () => {
      component.appointments.set(MOCK_APPOINTMENTS);
      const differentDateAppt: Appointment = { ...NEW_APPOINTMENT, date: '2026-06-01' };

      component.onAppointmentCreated(differentDateAppt);

      expect(component.appointments().length).toBe(MOCK_APPOINTMENTS.length);
      expect(component.appointments().some((a) => a.id === differentDateAppt.id)).toBeFalse();
    });

    it('sorts appointments by startTime after adding (new appointment with earlier time is first)', () => {
      component.appointments.set(MOCK_APPOINTMENTS);

      // NEW_APPOINTMENT has startTime '08:00' which is earlier than both existing ones
      component.onAppointmentCreated(NEW_APPOINTMENT);

      expect(component.appointments()[0].id).toBe(NEW_APPOINTMENT.id);
    });

    it('sets showSuccess to true immediately', fakeAsync(() => {
      component.onAppointmentCreated(NEW_APPOINTMENT);

      expect(component.showSuccess()).toBeTrue();

      tick(3000);
    }));

    it('resets showSuccess to false after 3 seconds', fakeAsync(() => {
      component.onAppointmentCreated(NEW_APPOINTMENT);

      tick(3000);

      expect(component.showSuccess()).toBeFalse();
    }));
  });

  // ---------------------------------------------------------------------------
  // onAppointmentCancelled()
  // ---------------------------------------------------------------------------
  describe('onAppointmentCancelled()', () => {
    it('updates appointment status to cancelled in the list', () => {
      component.appointments.set([...MOCK_APPOINTMENTS]);

      component.onAppointmentCancelled(1);

      const updated = component.appointments().find((a) => a.id === 1);
      expect(updated?.status).toBe('cancelled');
    });

    it('leaves other appointments unchanged', () => {
      component.appointments.set([...MOCK_APPOINTMENTS]);

      component.onAppointmentCancelled(1);

      const other = component.appointments().find((a) => a.id === 2);
      expect(other?.status).toBe('confirmed');
    });
  });
});
