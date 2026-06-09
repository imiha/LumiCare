import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientService } from '../../core/services/patient.service';
import { Patient } from '../../core/models/patient';
import { PatientFormComponent } from './patient-form/patient-form.component';
import { PatientListComponent } from './patient-list/patient-list.component';
import { PatientDetailComponent } from './patient-detail/patient-detail.component';

@Component({
  selector: 'app-patient-intake',
  standalone: true,
  imports: [CommonModule, PatientFormComponent, PatientListComponent, PatientDetailComponent],
  templateUrl: './patient-intake.component.html',
  styleUrl: './patient-intake.component.scss',
})
export class PatientIntakeComponent implements OnInit {
  private patientService = inject(PatientService);

  patients = signal<Patient[]>([]);
  selectedPatient = signal<Patient | null>(null);
  loading = signal(false);

  ngOnInit(): void {
    this.loading.set(true);
    this.patientService.getPatients().subscribe({
      next: (patients) => {
        this.patients.set(patients);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onPatientCreated(patient: Patient): void {
    this.patients.update((list) => [patient, ...list]);
  }

  onPatientSelected(patient: Patient): void {
    this.selectedPatient.set(patient);
  }

  onPatientUpdated(updated: Patient): void {
    this.patients.update((list) =>
      list.map((p) => (p.id === updated.id ? updated : p))
    );
    this.selectedPatient.set(updated);
  }
}
