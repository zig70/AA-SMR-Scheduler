import { createContext, useContext, useState } from 'react';

export type Role = 'Admin' | 'BookingAgent' | 'Mechanic';

export interface Identity {
  role: Role;
  name: string;
  mechanicId: string | null;
}

const IDENTITIES: Identity[] = [
  { role: 'Admin', name: 'Admin', mechanicId: null },
  { role: 'BookingAgent', name: 'Booking Agent', mechanicId: null },
  { role: 'Mechanic', name: 'Dave', mechanicId: '00000002-0000-0000-0000-000000000000' },
  { role: 'Mechanic', name: 'Sarah', mechanicId: '00000003-0000-0000-0000-000000000000' },
  { role: 'Mechanic', name: 'Tom', mechanicId: '00000004-0000-0000-0000-000000000000' },
];

interface IdentityContextValue {
  identity: Identity;
  identities: Identity[];
  setIdentity: (identity: Identity) => void;
}

const IdentityContext = createContext<IdentityContextValue | null>(null);

export function IdentityProvider({ children }: { children: React.ReactNode }) {
  const [identity, setIdentity] = useState<Identity>(IDENTITIES[0]);

  return (
    <IdentityContext.Provider value={{ identity, identities: IDENTITIES, setIdentity }}>
      {children}
    </IdentityContext.Provider>
  );
}

export function useIdentity(): IdentityContextValue {
  const ctx = useContext(IdentityContext);
  if (!ctx) throw new Error('useIdentity must be used within IdentityProvider');
  return ctx;
}
