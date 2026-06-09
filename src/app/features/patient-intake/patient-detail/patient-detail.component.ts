import { Component, inject, input, output, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { PatientService } from '../../../core/services/patient.service';
import { Patient } from '../../../core/models/patient';

@Component({
  selector: 'app-patient-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './patient-detail.component.html',
  styleUrl: './patient-detail.component.scss',
})
export class PatientDetailComponent {
  private patientService = inject(PatientService);
  private fb = inject(FormBuilder);

  patient = input<Patient | null>(null);
  patientUpdated = output<Patient>();

  saving = signal(false);
  historyExpanded = signal(true);
  saveSuccess = signal(false);

  form = this.fb.group({
    firstName: [''],
    lastName: [''],
    email: [''],
    phone: [''],
    dateOfBirth: [''],
    gender: [''],
    emergencyContactName: [''],
    emergencyContactPhone: [''],
    allergies: [''],
    medications: [''],
    conditions: [''],
    notes: [''],
  });

  constructor() {
    effect(() => {
      const p = this.patient();
      if (p) {
        this.form.patchValue({
          firstName: p.firstName ?? '',
          lastName: p.lastName ?? '',
          email: p.email ?? '',
          phone: p.phone ?? '',
          dateOfBirth: p.dateOfBirth ?? '',
          gender: p.gender ?? '',
          emergencyContactName: p.emergencyContactName ?? '',
          emergencyContactPhone: p.emergencyContactPhone ?? '',
          allergies: p.allergies ?? '',
          medications: p.medications ?? '',
          conditions: p.conditions ?? '',
          notes: p.notes ?? '',
        });
      }
    });
  }

  toggleHistory(): void {
    this.historyExpanded.update((v) => !v);
  }

  onSave(): void {
    const p = this.patient();
    if (!p?.id || this.saving()) return;

    this.saving.set(true);
    this.patientService.updatePatient(p.id, this.form.value as Partial<Patient>).subscribe({
      next: (updated) => {
        this.patientUpdated.emit(updated);
        this.saving.set(false);
        this.saveSuccess.set(true);
        setTimeout(() => this.saveSuccess.set(false), 3000);
      },
      error: () => this.saving.set(false),
    });
  }
}
