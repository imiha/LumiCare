import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AppointmentService } from './appointment.service';
import { Appointment } from '../models/appointment';
import { Staff } from '../models/staff';
import { Service } from '../models/service';

describe('AppointmentService', () => {
  let service: AppointmentService;
  let httpMock: HttpTestingController;
  const BASE = 'http://localhost:3000/api';

  const mockAppointment: Appointment = {
    id: 1,
    patientId: 10,
    practitionerId: 2,
    serviceId: 3,
    date: '2026-06-09',
    startTime: '09:00',
    endTime: '09:30',
    status: 'scheduled',
  };

  const mockStaff: Staff[] = [
    { id: 1, firstName: 'Sophie', lastName: 'Laurent', role: 'Physiotherapist' },
    { id: 2, firstName: 'Luc', lastName: 'Bernard', role: 'Massage Therapist' },
  ];

  const mockServices: Service[] = [
    { id: 1, name: 'Deep Tissue Massage', duration: 60 },
    { id: 2, name: 'Facial Treatment', duration: 45 },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(AppointmentService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAppointments()', () => {
    it('calls GET /appointments?date=<date>', () => {
      service.getAppointments('2026-06-09').subscribe(appts => {
        expect(appts).toEqual([mockAppointment]);
      });

      const req = httpMock.expectOne(`${BASE}/appointments?date=2026-06-09`);
      expect(req.request.method).toBe('GET');
      req.flush([mockAppointment]);
    });

    it('returns an empty array when no appointments exist for the date', () => {
      service.getAppointments('2026-12-25').subscribe(appts => {
        expect(appts).toEqual([]);
      });

      httpMock.expectOne(`${BASE}/appointments?date=2026-12-25`).flush([]);
    });
  });

  describe('createAppointment()', () => {
    it('calls POST /appointments with the appointment payload', () => {
      const newAppt: Partial<Appointment> = {
        patientId: 10,
        practitionerId: 2,
        serviceId: 3,
        date: '2026-06-09',
        startTime: '09:00',
        endTime: '09:30',
        status: 'scheduled',
      };

      service.createAppointment(newAppt).subscribe(appt => {
        expect(appt).toEqual(mockAppointment);
      });

      const req = httpMock.expectOne(`${BASE}/appointments`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newAppt);
      req.flush(mockAppointment);
    });

    it('returns the created appointment with a server-assigned id', () => {
      const newAppt: Partial<Appointment> = {
        patientId: 5,
        practitionerId: 1,
        serviceId: 2,
        date: '2026-06-10',
        startTime: '14:00',
        endTime: '14:45',
        status: 'scheduled',
      };

      service.createAppointment(newAppt).subscribe(appt => {
        expect(appt.id).toBe(42);
      });

      httpMock.expectOne(`${BASE}/appointments`).flush({ ...newAppt, id: 42 });
    });
  });

  describe('cancelAppointment()', () => {
    it('calls PATCH /appointments/:id/cancel', () => {
      const cancelled: Appointment = { ...mockAppointment, status: 'cancelled' };

      service.cancelAppointment(1).subscribe(appt => {
        expect(appt.status).toBe('cancelled');
      });

      const req = httpMock.expectOne(`${BASE}/appointments/1/cancel`);
      expect(req.request.method).toBe('PATCH');
      req.flush(cancelled);
    });

    it('sends an empty body with the PATCH request', () => {
      service.cancelAppointment(7).subscribe();

      const req = httpMock.expectOne(`${BASE}/appointments/7/cancel`);
      expect(req.request.body).toEqual({});
      req.flush({ ...mockAppointment, id: 7, status: 'cancelled' });
    });
  });

  describe('getStaff()', () => {
    it('calls GET /staff and returns the staff list', () => {
      service.getStaff().subscribe(staff => {
        expect(staff).toEqual(mockStaff);
      });

      const req = httpMock.expectOne(`${BASE}/staff`);
      expect(req.request.method).toBe('GET');
      req.flush(mockStaff);
    });
  });

  describe('getServices()', () => {
    it('calls GET /services and returns the services list', () => {
      service.getServices().subscribe(services => {
        expect(services).toEqual(mockServices);
      });

      const req = httpMock.expectOne(`${BASE}/services`);
      expect(req.request.method).toBe('GET');
      req.flush(mockServices);
    });
  });
});
