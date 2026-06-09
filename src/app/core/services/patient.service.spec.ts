import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PatientService } from './patient.service';
import { Patient } from '../models/patient';

describe('PatientService', () => {
  let service: PatientService;
  let httpMock: HttpTestingController;
  const BASE = 'http://localhost:3000/api';

  const mockPatient: Patient = {
    id: 1, firstName: 'Marie', lastName: 'Dupont', email: 'marie@example.com',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(PatientService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getPatients()', () => {
    it('calls GET /patients with no query param', () => {
      service.getPatients().subscribe(patients => expect(patients).toEqual([mockPatient]));
      httpMock.expectOne(`${BASE}/patients`).flush([mockPatient]);
    });

    it('appends ?search= when search term is provided', () => {
      service.getPatients('mar').subscribe();
      httpMock.expectOne(`${BASE}/patients?search=mar`).flush([]);
    });

    it('URL-encodes the search term', () => {
      service.getPatients('marie dupont').subscribe();
      httpMock.expectOne(`${BASE}/patients?search=marie%20dupont`).flush([]);
    });
  });

  describe('getPatient()', () => {
    it('calls GET /patients/:id', () => {
      service.getPatient(1).subscribe(p => expect(p).toEqual(mockPatient));
      httpMock.expectOne(`${BASE}/patients/1`).flush(mockPatient);
    });
  });

  describe('createPatient()', () => {
    it('calls POST /patients with the patient payload', () => {
      const newPatient = { firstName: 'Jean', lastName: 'Martin', email: 'jean@example.com' };
      service.createPatient(newPatient).subscribe(p => expect(p.id).toBe(2));
      const req = httpMock.expectOne(`${BASE}/patients`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newPatient);
      req.flush({ ...newPatient, id: 2 });
    });
  });

  describe('updatePatient()', () => {
    it('calls PUT /patients/:id with the partial payload', () => {
      const patch = { phone: '+31 6 00000000' };
      service.updatePatient(1, patch).subscribe();
      const req = httpMock.expectOne(`${BASE}/patients/1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(patch);
      req.flush(mockPatient);
    });
  });
});
