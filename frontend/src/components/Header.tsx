import { useIdentity } from '../context/IdentityContext';
import type { Identity } from '../context/IdentityContext';

export function Header() {
  const { identity, identities, setIdentity } = useIdentity();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const found = identities.find((id) => id.name === e.target.value);
    if (found) setIdentity(found);
  }

  return (
    <header className="bg-zinc-900 border-b border-zinc-700 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-amber-400 rounded-sm flex items-center justify-center">
          <span className="text-zinc-950 font-bold text-sm">AA</span>
        </div>
        <span className="text-white font-semibold text-lg tracking-tight">SMR Scheduler</span>
      </div>

      <div className="flex items-center gap-3">
        <label htmlFor="identity-select" className="text-zinc-400 text-sm">
          Act As:
        </label>
        <select
          id="identity-select"
          value={identity.name}
          onChange={handleChange}
          className="bg-zinc-800 text-white border border-zinc-600 rounded px-3 py-1.5 text-sm
                     focus:outline-none focus:ring-2 focus:ring-amber-400"
        >
          {identities.map((id: Identity) => (
            <option key={id.name} value={id.name}>
              {id.role === 'Admin' ? 'Admin' : `Mechanic — ${id.name}`}
            </option>
          ))}
        </select>
      </div>
    </header>
  );
}
