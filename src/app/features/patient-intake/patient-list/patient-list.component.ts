import { Component, inject, input, output, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PatientService } from '../../../core/services/patient.service';
import { Patient } from '../../../core/models/patient';

@Component({
  selector: 'app-patient-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './patient-list.component.html',
  styleUrl: './patient-list.component.scss',
})
export class PatientListComponent {
  private patientService = inject(PatientService);

  patients = input<Patient[]>([]);
  loading = input<boolean>(false);
  patientSelected = output<Patient>();

  searchQuery = signal('');
  selectedId = signal<number | null>(null);
  private apiResults = signal<Patient[] | null>(null);
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  filteredPatients = computed(() => {
    const apiData = this.apiResults();
    if (apiData !== null) return apiData;
    const query = this.searchQuery();
    if (query.length < 2) return this.patients();
    const q = query.toLowerCase();
    return this.patients().filter(
      (p) =>
        p.firstName.toLowerCase().includes(q) ||
        p.lastName.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q)
    );
  });

  constructor() {
    effect(() => {
      const query = this.searchQuery();
      if (this.debounceTimer) clearTimeout(this.debounceTimer);
      this.apiResults.set(null);
      if (query.length >= 2) {
        this.debounceTimer = setTimeout(() => {
          this.patientService.getPatients(query).subscribe((results) => {
            this.apiResults.set(results);
          });
        }, 300);
      }
    }, { allowSignalWrites: true });
  }

  onSelect(patient: Patient): void {
    this.selectedId.set(patient.id ?? null);
    this.patientSelected.emit(patient);
  }

  fullName(p: Patient): string {
    return `${p.firstName} ${p.lastName}`;
  }
}
