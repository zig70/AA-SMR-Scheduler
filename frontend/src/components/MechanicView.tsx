import { useEffect, useReducer } from 'react';
import { getMechanicAppointments } from '../api/appointments';
import type { MechanicAppointmentDto } from '../api/types';
import { useIdentity } from '../context/IdentityContext';

type ApptState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'loaded'; appointments: MechanicAppointmentDto[] };

type ApptAction =
  | { type: 'fetch' }
  | { type: 'success'; appointments: MechanicAppointmentDto[] }
  | { type: 'failure'; message: string };

function reducer(_state: ApptState, action: ApptAction): ApptState {
  switch (action.type) {
    case 'fetch': return { status: 'loading' };
    case 'success': return { status: 'loaded', appointments: action.appointments };
    case 'failure': return { status: 'error', message: action.message };
  }
}

export function MechanicView() {
  const { identity } = useIdentity();
  const [state, dispatch] = useReducer(reducer, { status: 'idle' });

  useEffect(() => {
    if (!identity.mechanicId) return;
    dispatch({ type: 'fetch' });
    getMechanicAppointments(identity.mechanicId)
      .then((appointments) => dispatch({ type: 'success', appointments }))
      .catch(() => dispatch({ type: 'failure', message: 'Failed to load appointments.' }));
  }, [identity.mechanicId]);

  if (!identity.mechanicId) {
    return (
      <p className="text-zinc-400 text-center mt-12">
        Select a mechanic identity to view appointments.
      </p>
    );
  }

  if (state.status === 'loading' || state.status === 'idle') {
    return <p className="text-zinc-400 text-center mt-12">Loading appointments…</p>;
  }

  if (state.status === 'error') {
    return <p role="alert" className="text-red-400 text-center mt-12">{state.message}</p>;
  }

  const { appointments } = state;

  return (
    <section aria-label="Mechanic appointments">
      <h2 className="text-white font-semibold text-xl mb-4">
        {identity.name}&apos;s Appointments
      </h2>

      {appointments.length === 0 ? (
        <p className="text-zinc-400">No upcoming appointments.</p>
      ) : (
        <ul className="space-y-3">
          {appointments.map((appt) => {
            const start = new Date(appt.startTime);
            const end = new Date(appt.endTime);
            return (
              <li key={appt.appointmentId} className="bg-zinc-800 rounded-lg p-4 flex items-start gap-4">
                <div className="bg-amber-400 text-zinc-950 rounded p-2 text-center min-w-[52px]">
                  <span className="block text-xs font-medium">
                    {start.toLocaleDateString('en-GB', { weekday: 'short' })}
                  </span>
                  <span className="block text-lg font-bold leading-none">
                    {start.getDate()}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-white font-semibold">{appt.customerName}</p>
                  <p className="text-zinc-400 text-sm">{appt.vehicleReg}</p>
                  <p className="text-zinc-400 text-sm mt-1">
                    {start.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}–
                    {end.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
