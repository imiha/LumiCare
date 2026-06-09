export interface Patient {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  allergies?: string;
  medications?: string;
  conditions?: string;
  notes?: string;
  createdAt?: string;
}
