import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Appointment } from '../models/appointment';
import { Staff } from '../models/staff';
import { Service } from '../models/service';

@Injectable({ providedIn: 'root' })
export class AppointmentService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:3000/api';

  getAppointments(date: string): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.baseUrl}/appointments?date=${date}`);
  }

  createAppointment(appointment: Partial<Appointment>): Observable<Appointment> {
    return this.http.post<Appointment>(`${this.baseUrl}/appointments`, appointment);
  }

  cancelAppointment(id: number): Observable<Appointment> {
    return this.http.patch<Appointment>(`${this.baseUrl}/appointments/${id}/cancel`, {});
  }

  getStaff(): Observable<Staff[]> {
    return this.http.get<Staff[]>(`${this.baseUrl}/staff`);
  }

  getServices(): Observable<Service[]> {
    return this.http.get<Service[]>(`${this.baseUrl}/services`);
  }
}
