import axios from 'axios';
import type { AppointmentDto, BookAppointmentRequest, BranchDto, MechanicAppointmentDto, SlotDto } from './types';

const BASE = '/api/v1';

export async function getBranches(): Promise<BranchDto[]> {
  const res = await axios.get<BranchDto[]>(`${BASE}/branches`);
  return res.data;
}

export async function getAvailableSlots(branchId: string): Promise<SlotDto[]> {
  const res = await axios.get<SlotDto[]>(`${BASE}/slots`, { params: { branchId } });
  return res.data;
}

export async function bookAppointment(payload: BookAppointmentRequest): Promise<AppointmentDto> {
  const res = await axios.post<AppointmentDto>(`${BASE}/appointments`, payload);
  return res.data;
}

export async function getMechanicAppointments(mechanicId: string): Promise<MechanicAppointmentDto[]> {
  const res = await axios.get<MechanicAppointmentDto[]>(`${BASE}/appointments`, { params: { mechanicId } });
  return res.data;
}
