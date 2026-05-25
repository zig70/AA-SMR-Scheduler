import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom';
import { Header } from './components/Header';
import { SlotGrid } from './components/SlotGrid';
import { MechanicView } from './components/MechanicView';
import { IdentityProvider, useIdentity } from './context/IdentityContext';

function Nav() {
  const { identity } = useIdentity();
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `px-4 py-2 rounded text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400 ${
      isActive
        ? 'bg-amber-400 text-zinc-950'
        : 'text-zinc-300 hover:text-white hover:bg-zinc-700'
    }`;

  const canBook = identity.role === 'Admin' || identity.role === 'BookingAgent';
  const isMechanic = identity.role === 'Mechanic';

  return (
    <nav className="bg-zinc-900 border-b border-zinc-700 px-6 py-2 flex gap-2">
      {(canBook || isMechanic) && (
        <NavLink to="/" end className={linkClass}>
          Book a Slot
        </NavLink>
      )}
      {(identity.role === 'Admin' || isMechanic) && (
        <NavLink to="/my-appointments" className={linkClass}>
          My Appointments
        </NavLink>
      )}
    </nav>
  );
}

function AppShell() {
  return (
    <div className="min-h-screen bg-zinc-900 flex flex-col">
      <Header />
      <Nav />
      <main className="flex-1 px-6 py-6 max-w-7xl mx-auto w-full">
        <Routes>
          <Route path="/" element={<SlotGrid />} />
          <Route path="/my-appointments" element={<MechanicView />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <IdentityProvider>
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </IdentityProvider>
  );
}
