export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  phone: string;
  address: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  department: string;
  roomNumber: string;
}

export type ServiceType = 'OPD' | 'Emergency' | 'Ultrasound' | 'ECG' | 'Lab' | 'Pharmacy';
export type PaymentMethod = 'Cash' | 'Card' | 'Online';

export interface PrinterProfile {
  id: string;
  name: string;
  paperSize: 'A4' | 'A5' | 'Thermal';
  isDefault: boolean;
  status: 'Online' | 'Offline' | 'Unknown';
}

export interface Token {
  id: string;
  tokenNumber: number;
  patientId: string;
  doctorId: string;
  createdAt: string;
  status: 'Pending' | 'Called' | 'Completed';
  registrationFee: number;
  serviceFee: number;
  fee: number;
  serviceType: ServiceType;
  paymentMethod: PaymentMethod;
  diagnosis?: string;
  notes?: string;
}

export interface HospitalInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
}
