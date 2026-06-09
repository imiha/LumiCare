import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Patient } from '../models/patient';

@Injectable({ providedIn: 'root' })
export class PatientService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:3000/api';

  getPatients(search?: string): Observable<Patient[]> {
    const url = search
      ? `${this.baseUrl}/patients?search=${encodeURIComponent(search)}`
      : `${this.baseUrl}/patients`;
    return this.http.get<Patient[]>(url);
  }

  getPatient(id: number): Observable<Patient> {
    return this.http.get<Patient>(`${this.baseUrl}/patients/${id}`);
  }

  createPatient(patient: Patient): Observable<Patient> {
    return this.http.post<Patient>(`${this.baseUrl}/patients`, patient);
  }

  updatePatient(id: number, patient: Partial<Patient>): Observable<Patient> {
    return this.http.put<Patient>(`${this.baseUrl}/patients/${id}`, patient);
  }
}
