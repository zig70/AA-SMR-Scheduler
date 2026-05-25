import { useCallback, useEffect, useReducer, useState } from 'react';
import { getBranches, getAvailableSlots } from '../api/appointments';
import type { BranchDto, ServiceType, SlotDto } from '../api/types';
import { SERVICE_TYPES } from '../api/types';
import { BookingModal } from './BookingModal';

type BranchState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'loaded'; branches: BranchDto[] };

type BranchAction =
  | { type: 'fetch' }
  | { type: 'success'; branches: BranchDto[] }
  | { type: 'failure' };

function branchReducer(_state: BranchState, action: BranchAction): BranchState {
  switch (action.type) {
    case 'fetch': return { status: 'loading' };
    case 'success': return { status: 'loaded', branches: action.branches };
    case 'failure': return { status: 'error' };
  }
}

type SlotState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'loaded'; slots: SlotDto[] };

type SlotAction =
  | { type: 'idle' }
  | { type: 'fetch' }
  | { type: 'success'; slots: SlotDto[] }
  | { type: 'failure'; message: string };

function slotReducer(_state: SlotState, action: SlotAction): SlotState {
  switch (action.type) {
    case 'idle': return { status: 'idle' };
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
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function SlotGrid() {
  const [branchState, dispatchBranch] = useReducer(branchReducer, { status: 'loading' });
  const [slotState, dispatchSlot] = useReducer(slotReducer, { status: 'idle' });
  const [selectedBranchId, setSelectedBranchId] = useState<string>('');
  const [selectedServiceType, setSelectedServiceType] = useState<ServiceType | ''>('');
  const [selectedSlot, setSelectedSlot] = useState<SlotDto | null>(null);
  const days = getDayLabels();

  useEffect(() => {
    dispatchBranch({ type: 'fetch' });
    getBranches()
      .then((branches) => {
        dispatchBranch({ type: 'success', branches });
        if (branches.length > 0) {
          setSelectedBranchId(branches[0].id);
        }
      })
      .catch(() => dispatchBranch({ type: 'failure' }));
  }, []);

  const fetchSlots = useCallback((branchId: string) => {
    if (!branchId) return;
    dispatchSlot({ type: 'fetch' });
    getAvailableSlots(branchId)
      .then((slots) => dispatchSlot({ type: 'success', slots }))
      .catch(() => dispatchSlot({ type: 'failure', message: 'Failed to load available slots.' }));
  }, []);

  useEffect(() => {
    if (selectedBranchId) fetchSlots(selectedBranchId);
    else dispatchSlot({ type: 'idle' });
  }, [selectedBranchId, fetchSlots]);

  function handleBooked() {
    setSelectedSlot(null);
    fetchSlots(selectedBranchId);
  }

  const allSlots = slotState.status === 'loaded' ? slotState.slots : [];
  const filteredSlots = allSlots;

  return (
    <section aria-label="Available booking slots">
      <div className="flex flex-wrap gap-4 mb-6">
        <div>
          <label htmlFor="branch-select" className="block text-zinc-400 text-xs mb-1 uppercase tracking-wide">
            Branch
          </label>
          {branchState.status === 'loading' && (
            <div className="text-zinc-500 text-sm">Loading branches…</div>
          )}
          {branchState.status === 'error' && (
            <div className="text-red-400 text-sm">Failed to load branches.</div>
          )}
          {branchState.status === 'loaded' && (
            <select
              id="branch-select"
              value={selectedBranchId}
              onChange={(e) => setSelectedBranchId(e.target.value)}
              className="bg-zinc-800 text-white border border-zinc-600 rounded px-3 py-1.5 text-sm
                         focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              {branchState.branches.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          )}
        </div>

        <div>
          <label htmlFor="service-type-select" className="block text-zinc-400 text-xs mb-1 uppercase tracking-wide">
            Service Type
          </label>
          <select
            id="service-type-select"
            value={selectedServiceType}
            onChange={(e) => setSelectedServiceType(e.target.value as ServiceType | '')}
            className="bg-zinc-800 text-white border border-zinc-600 rounded px-3 py-1.5 text-sm
                       focus:outline-none focus:ring-2 focus:ring-amber-400"
          >
            <option value="">All types</option>
            {SERVICE_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      {slotState.status === 'idle' && (
        <div className="flex items-center justify-center h-64 text-zinc-500">
          Select a branch to see available slots.
        </div>
      )}

      {slotState.status === 'loading' && (
        <div className="flex items-center justify-center h-64 text-zinc-400">Loading slots…</div>
      )}

      {slotState.status === 'error' && (
        <div role="alert" className="flex items-center justify-center h-64 text-red-400">
          {slotState.message}
        </div>
      )}

      {slotState.status === 'loaded' && (
        <>
          <p className="text-zinc-400 text-sm mb-4">
            <span className="text-amber-400 font-medium">{filteredSlots.length}</span> slots available
            &mdash; click any slot to book an appointment.
          </p>
          <div className="grid grid-cols-7 gap-2">
            {days.map((day) => {
              const daySlots = filteredSlots.filter((s) => isSameDay(new Date(s.startTime), day));
              const label = day.toLocaleDateString('en-GB', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
              });

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
                            type="button"
                            onClick={() => setSelectedSlot(slot)}
                            className="w-full bg-zinc-700 hover:bg-amber-400 hover:text-zinc-950
                                       text-zinc-100 rounded p-2 text-xs text-left transition-colors
                                       cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-400
                                       group"
                          >
                            <span className="block font-semibold">
                              {new Date(slot.startTime).toLocaleTimeString('en-GB', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                              {' – '}
                              {new Date(slot.endTime).toLocaleTimeString('en-GB', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                            <span className="block text-zinc-400 group-hover:text-zinc-700 mt-0.5">
                              {slot.mechanicName}
                            </span>
                            <span className="block text-amber-400 group-hover:text-zinc-800 text-xs mt-1 font-medium">
                              Book &rarr;
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
        </>
      )}

      {selectedSlot && (
        <BookingModal
          slot={selectedSlot}
          preselectedServiceType={selectedServiceType || undefined}
          onClose={() => setSelectedSlot(null)}
          onBooked={handleBooked}
        />
      )}
    </section>
  );
}
