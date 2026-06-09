import { Component, OnInit, inject, signal, computed, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { AppointmentService } from '../../../core/services/appointment.service';
import { PatientService } from '../../../core/services/patient.service';
import { Appointment } from '../../../core/models/appointment';
import { Staff } from '../../../core/models/staff';
import { Service } from '../../../core/models/service';
import { Patient } from '../../../core/models/patient';

@Component({
  selector: 'app-appointment-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './appointment-form.component.html',
  styleUrl: './appointment-form.component.scss',
})
export class AppointmentFormComponent implements OnInit {
  private apptService = inject(AppointmentService);
  private patientService = inject(PatientService);
  private fb = inject(FormBuilder);

  appointmentCreated = output<Appointment>();

  staff = signal<Staff[]>([]);
  services = signal<Service[]>([]);
  patientResults = signal<Patient[]>([]);
  selectedPatient = signal<Patient | null>(null);
  patientSearchText = signal('');
  conflictError = signal<string | null>(null);
  submitting = signal(false);
  private searchTimer: ReturnType<typeof setTimeout> | null = null;

  patientSelected = computed(() => this.selectedPatient() !== null);

  form = this.fb.group({
    patientId: [null as number | null, Validators.required],
    practitionerId: [null as number | null, Validators.required],
    serviceId: [null as number | null, Validators.required],
    date: ['', Validators.required],
    startTime: ['', Validators.required],
    endTime: ['', Validators.required],
  });

  ngOnInit(): void {
    this.apptService.getStaff().subscribe((s) => this.staff.set(s));
    this.apptService.getServices().subscribe((s) => this.services.set(s));
  }

  onPatientSearch(query: string): void {
    this.patientSearchText.set(query);
    this.selectedPatient.set(null);
    this.form.patchValue({ patientId: null });
    if (this.searchTimer) clearTimeout(this.searchTimer);
    if (query.length >= 2) {
      this.searchTimer = setTimeout(() => {
        this.patientService.getPatients(query).subscribe((p) => this.patientResults.set(p));
      }, 200);
    } else {
      this.patientResults.set([]);
    }
  }

  selectPatient(p: Patient): void {
    this.selectedPatient.set(p);
    this.patientSearchText.set(`${p.firstName} ${p.lastName}`);
    this.patientResults.set([]);
    this.form.patchValue({ patientId: p.id ?? null });
  }

  onPatientInputBlur(): void {
    setTimeout(() => this.patientResults.set([]), 200);
  }

  onServiceChange(event: Event): void {
    const serviceId = Number((event.target as HTMLSelectElement).value);
    this.form.patchValue({ serviceId });
    this.recalcEndTime(serviceId);
  }

  onStartTimeChange(): void {
    const serviceId = this.form.value.serviceId;
    if (serviceId) this.recalcEndTime(serviceId);
  }

  private recalcEndTime(serviceId: number): void {
    const service = this.services().find((s) => s.id === serviceId);
    const startTime = this.form.value.startTime;
    if (!service || !startTime) return;
    const [h, m] = startTime.split(':').map(Number);
    const endMin = h * 60 + m + service.duration;
    const endH = Math.floor(endMin / 60).toString().padStart(2, '0');
    const endM = (endMin % 60).toString().padStart(2, '0');
    this.form.patchValue({ endTime: `${endH}:${endM}` });
  }

  onSubmit(): void {
    if (this.form.invalid || this.submitting() || !this.patientSelected()) return;
    this.submitting.set(true);
    this.conflictError.set(null);

    this.apptService.createAppointment(this.form.value as Partial<Appointment>).subscribe({
      next: (appt) => {
        this.appointmentCreated.emit(appt);
        this.form.reset();
        this.selectedPatient.set(null);
        this.patientSearchText.set('');
        this.submitting.set(false);
      },
      error: (err: HttpErrorResponse) => {
        if (err.status === 409) {
          this.conflictError.set(err.error?.error ?? 'Time slot conflict for this practitioner');
        }
        this.submitting.set(false);
      },
    });
  }
}
