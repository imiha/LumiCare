import { Component, inject, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { PatientService } from '../../../core/services/patient.service';
import { Patient } from '../../../core/models/patient';

@Component({
  selector: 'app-patient-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './patient-form.component.html',
  styleUrl: './patient-form.component.scss',
})
export class PatientFormComponent {
  private patientService = inject(PatientService);
  private fb = inject(FormBuilder);

  patientCreated = output<Patient>();

  emailError = signal<string | null>(null);
  submitting = signal(false);

  form = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    dateOfBirth: [''],
    gender: [''],
    emergencyContactName: [''],
    emergencyContactPhone: [''],
  });

  onSubmit(): void {
    if (this.form.invalid || this.submitting()) return;
    this.submitting.set(true);
    this.emailError.set(null);

    this.patientService.createPatient(this.form.value as Patient).subscribe({
      next: (patient) => {
        this.patientCreated.emit(patient);
        this.form.reset();
        this.submitting.set(false);
      },
      error: (err: HttpErrorResponse) => {
        if (err.status === 409) {
          this.emailError.set(err.error?.error ?? 'A patient with this email already exists');
        }
        this.submitting.set(false);
      },
    });
  }
}
