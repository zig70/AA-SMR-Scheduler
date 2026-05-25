import { useState } from 'react';
import { bookAppointment } from '../api/appointments';
import type { SlotDto } from '../api/types';

interface BookingModalProps {
  slot: SlotDto;
  onClose: () => void;
  onBooked: () => void;
}

export function BookingModal({ slot, onClose, onBooked }: BookingModalProps) {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [vehicleReg, setVehicleReg] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startTime = new Date(slot.startTime);
  const endTime = new Date(slot.endTime);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await bookAppointment({ slotId: slot.id, customerName, customerPhone, vehicleReg });
      onBooked();
    } catch {
      setError('Booking failed. The slot may already be taken.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="bg-amber-400 rounded-t-lg px-6 py-4">
          <h2 id="modal-title" className="text-zinc-950 font-bold text-lg">Book Appointment</h2>
          <p className="text-zinc-800 text-sm mt-1">
            {slot.mechanicName} &mdash;{' '}
            {startTime.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}{' '}
            {startTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}–
            {endTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label htmlFor="customer-name" className="block text-sm font-medium text-zinc-700 mb-1">
              Customer Name
            </label>
            <input
              id="customer-name"
              type="text"
              required
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full border border-zinc-300 rounded px-3 py-2 text-sm
                         focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          <div>
            <label htmlFor="customer-phone" className="block text-sm font-medium text-zinc-700 mb-1">
              Phone Number
            </label>
            <input
              id="customer-phone"
              type="tel"
              required
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="w-full border border-zinc-300 rounded px-3 py-2 text-sm
                         focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          <div>
            <label htmlFor="vehicle-reg" className="block text-sm font-medium text-zinc-700 mb-1">
              Vehicle Registration
            </label>
            <input
              id="vehicle-reg"
              type="text"
              required
              value={vehicleReg}
              onChange={(e) => setVehicleReg(e.target.value)}
              className="w-full border border-zinc-300 rounded px-3 py-2 text-sm uppercase
                         focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          {error && (
            <p role="alert" className="text-red-600 text-sm">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-zinc-300 text-zinc-700 rounded px-4 py-2 text-sm
                         hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-amber-400 hover:bg-amber-500 text-zinc-950 font-semibold
                         rounded px-4 py-2 text-sm disabled:opacity-50
                         focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              {loading ? 'Booking…' : 'Confirm Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
