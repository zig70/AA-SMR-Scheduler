import { useCallback, useEffect, useReducer, useState } from 'react';
import { getAvailableSlots } from '../api/appointments';
import type { SlotDto } from '../api/types';
import { BookingModal } from './BookingModal';

const DEMO_BRANCH_ID = '00000000-0000-0000-0000-000000000001';

type SlotState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'loaded'; slots: SlotDto[] };

type SlotAction =
  | { type: 'fetch' }
  | { type: 'success'; slots: SlotDto[] }
  | { type: 'failure'; message: string };

function slotReducer(_state: SlotState, action: SlotAction): SlotState {
  switch (action.type) {
    case 'fetch': return { status: 'loading' };
    case 'success': return { status: 'loaded', slots: action.slots };
    case 'failure': return { status: 'error', message: action.message };
  }
}

function getDayLabels(): Date[] {
  const days: Date[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push(d);
  }
  return days;
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

export function SlotGrid() {
  const [state, dispatch] = useReducer(slotReducer, { status: 'loading' });
  const [selectedSlot, setSelectedSlot] = useState<SlotDto | null>(null);
  const days = getDayLabels();

  const fetchSlots = useCallback(() => {
    dispatch({ type: 'fetch' });
    getAvailableSlots(DEMO_BRANCH_ID)
      .then((slots) => dispatch({ type: 'success', slots }))
      .catch(() => dispatch({ type: 'failure', message: 'Failed to load available slots.' }));
  }, []);

  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  function handleBooked() {
    setSelectedSlot(null);
    fetchSlots();
  }

  if (state.status === 'loading') {
    return <div className="flex items-center justify-center h-64 text-zinc-400">Loading slots…</div>;
  }

  if (state.status === 'error') {
    return (
      <div role="alert" className="flex items-center justify-center h-64 text-red-400">
        {state.message}
      </div>
    );
  }

  const { slots } = state;

  return (
    <section aria-label="Available booking slots">
      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => {
          const daySlots = slots.filter((s) => isSameDay(new Date(s.startTime), day));
          const label = day.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });

          return (
            <div key={day.toISOString()} className="bg-zinc-800 rounded-lg p-3">
              <h3 className="text-amber-400 text-xs font-semibold uppercase tracking-wide mb-2 text-center">
                {label}
              </h3>
              {daySlots.length === 0 ? (
                <p className="text-zinc-500 text-xs text-center">No slots</p>
              ) : (
                <ul className="space-y-1.5">
                  {daySlots.map((slot) => (
                    <li key={slot.id}>
                      <button
                        onClick={() => setSelectedSlot(slot)}
                        className="w-full bg-zinc-700 hover:bg-amber-400 hover:text-zinc-950
                                   text-zinc-100 rounded p-2 text-xs text-left transition-colors
                                   focus:outline-none focus:ring-2 focus:ring-amber-400"
                      >
                        <span className="block font-medium">
                          {new Date(slot.startTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                          –
                          {new Date(slot.endTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="block text-zinc-400 mt-0.5">
                          {slot.mechanicName}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>

      {selectedSlot && (
        <BookingModal
          slot={selectedSlot}
          onClose={() => setSelectedSlot(null)}
          onBooked={handleBooked}
        />
      )}
    </section>
  );
}
