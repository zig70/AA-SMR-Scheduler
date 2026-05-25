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
}

export interface MechanicAppointmentDto {
  appointmentId: string;
  mechanicName: string;
  startTime: string;
  endTime: string;
  customerName: string;
  vehicleReg: string;
}

export interface BookAppointmentRequest {
  slotId: string;
  customerName: string;
  customerPhone: string;
  vehicleReg: string;
}
