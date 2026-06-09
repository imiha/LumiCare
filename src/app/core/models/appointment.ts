export type AppointmentStatus = 'scheduled' | 'confirmed' | 'completed' | 'cancelled';

export interface Appointment {
  id?: number;
  patientId: number;
  patientName?: string;
  practitionerId: number;
  practitionerName?: string;
  serviceId: number;
  serviceName?: string;
  serviceDuration?: number;
  date: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  createdAt?: string;
}
