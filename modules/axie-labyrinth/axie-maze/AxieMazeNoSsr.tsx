import dynamic from 'next/dynamic';
import React from 'react';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export const AxieMaze = dynamic(
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  () => import('./AxieMaze').then(module => module.AxieMaze),
  { ssr: false, loading: () => <></> },
);
