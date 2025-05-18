'use client';

import { ReactNode } from 'react';
import { RelayEnvironmentProvider } from 'react-relay';
import { createEnvironment } from '../relay/environment';

export function RelayProvider({ children }: { children: ReactNode }) {
  const environment = createEnvironment();
  return (
    <RelayEnvironmentProvider environment={environment}>
      {children}
    </RelayEnvironmentProvider>
  );
}