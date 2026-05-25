export type ServiceType = 'Inspection' | 'Service' | 'Repair' | 'Diagnostics';

export const SERVICE_TYPES: ServiceType[] = ['Inspection', 'Service', 'Repair', 'Diagnostics'];

export interface BranchDto {
  id: string;
  name: string;
}

export interface SlotDto {
  id: string;
  mechanicName: string;
  startTime: string;
  endTime: string;
}

export interface AppointmentDto {
  appointmentId: string;
  slotId: string;
  mechanicName: string;
  startTime: string;
  endTime: string;
  customerName: string;
  vehicleReg: string;
  serviceType: ServiceType;
  notes: string | null;
  reference: string;
}

export interface MechanicAppointmentDto {
  appointmentId: string;
  mechanicName: string;
  startTime: string;
  endTime: string;
  customerName: string;
  vehicleReg: string;
  serviceType: ServiceType;
  notes: string | null;
  reference: string;
}

export interface BookAppointmentRequest {
  slotId: string;
  customerName: string;
  customerPhone: string;
  vehicleReg: string;
  serviceType: ServiceType;
  notes?: string;
}
