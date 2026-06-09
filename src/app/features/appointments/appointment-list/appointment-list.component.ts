import { Component, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppointmentService } from '../../../core/services/appointment.service';
import { Appointment } from '../../../core/models/appointment';
import { StatusBadgeComponent } from '../../../shared/status-badge/status-badge.component';

@Component({
  selector: 'app-appointment-list',
  standalone: true,
  imports: [CommonModule, FormsModule, StatusBadgeComponent],
  templateUrl: './appointment-list.component.html',
  styleUrl: './appointment-list.component.scss',
})
export class AppointmentListComponent {
  private apptService = inject(AppointmentService);

  appointments = input<Appointment[]>([]);
  loading = input<boolean>(false);
  selectedDate = input<string>(new Date().toISOString().split('T')[0]);

  dateChanged = output<string>();
  appointmentCancelled = output<number>();

  cancelling = signal<number | null>(null);

  onDateChange(date: string): void {
    this.dateChanged.emit(date);
  }

  onCancel(appt: Appointment): void {
    if (!appt.id || this.cancelling() !== null) return;
    this.cancelling.set(appt.id);
    this.apptService.cancelAppointment(appt.id).subscribe({
      next: () => {
        this.appointmentCancelled.emit(appt.id!);
        this.cancelling.set(null);
      },
      error: () => this.cancelling.set(null),
    });
  }

  timeRange(appt: Appointment): string {
    return `${appt.startTime} – ${appt.endTime}`;
  }
}
