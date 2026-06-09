import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppointmentService } from '../../core/services/appointment.service';
import { Appointment } from '../../core/models/appointment';
import { AppointmentFormComponent } from './appointment-form/appointment-form.component';
import { AppointmentListComponent } from './appointment-list/appointment-list.component';

@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [CommonModule, AppointmentFormComponent, AppointmentListComponent],
  templateUrl: './appointments.component.html',
  styleUrl: './appointments.component.scss',
})
export class AppointmentsComponent implements OnInit {
  private apptService = inject(AppointmentService);

  appointments = signal<Appointment[]>([]);
  loading = signal(false);
  selectedDate = signal(new Date().toISOString().split('T')[0]);
  showSuccess = signal(false);
  private successTimer: ReturnType<typeof setTimeout> | null = null;

  ngOnInit(): void {
    this.loadAppointments();
  }

  loadAppointments(): void {
    this.loading.set(true);
    this.apptService.getAppointments(this.selectedDate()).subscribe({
      next: (appts) => {
        this.appointments.set(appts);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onDateChanged(date: string): void {
    this.selectedDate.set(date);
    this.loadAppointments();
  }

  onAppointmentCreated(appt: Appointment): void {
    if (appt.date === this.selectedDate()) {
      this.appointments.update((list) => [appt, ...list].sort((a, b) => a.startTime.localeCompare(b.startTime)));
    }
    if (this.successTimer) clearTimeout(this.successTimer);
    this.showSuccess.set(true);
    this.successTimer = setTimeout(() => this.showSuccess.set(false), 3000);
  }

  onAppointmentCancelled(id: number): void {
    this.appointments.update((list) =>
      list.map((a) => (a.id === id ? { ...a, status: 'cancelled' as const } : a))
    );
  }
}
