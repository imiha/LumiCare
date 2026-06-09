import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'patients', pathMatch: 'full' },
  {
    path: 'patients',
    loadComponent: () =>
      import('./features/patient-intake/patient-intake.component').then(
        (m) => m.PatientIntakeComponent
      ),
  },
  {
    path: 'appointments',
    loadComponent: () =>
      import('./features/appointments/appointments.component').then(
        (m) => m.AppointmentsComponent
      ),
  },
];
