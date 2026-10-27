// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Role } from '../shared/types';
import { roleLabels } from '../src/data/demoData';
import { ExplorePage } from '../src/pages/ExplorePage';
import { LandingPage } from '../src/pages/LandingPage';

const { startDemoMock, beginSignInMock } = vi.hoisted(() => ({ startDemoMock: vi.fn(), beginSignInMock: vi.fn() }));

vi.mock('../src/state/DemoProvider', () => ({ useDemo: () => ({ startDemo: startDemoMock }) }));
vi.mock('../src/auth/AuthProvider', () => ({ useAuth: () => ({ user: null, beginSignIn: beginSignInMock, error: null }) }));

function CurrentRoute() {
  const location = useLocation();
  return <output data-testid="current-route">{location.pathname}</output>;
}

function TestRoutes({ initialPath }: { initialPath: string }) {
  return (
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="*" element={<CurrentRoute />} />
      </Routes>
    </MemoryRouter>
  );
}

const choices: { label: string; role: Role; path: string }[] = [
  { label: 'Overview dashboard', role: 'donor', path: '/dashboard' },
  { label: 'Browse donations', role: 'ngo', path: '/donations' },
  { label: 'List surplus food', role: 'donor', path: '/donations/new' },
  { label: 'Donation details', role: 'ngo', path: '/donations/FL-2419' },
  { label: 'Delivery jobs', role: 'partner', path: '/jobs' },
  { label: 'Live tracking', role: 'partner', path: '/tracking/FL-2418' },
  { label: 'Community impact', role: 'donor', path: '/impact' },
  { label: 'Notifications', role: 'donor', path: '/notifications' },
  { label: 'Help & support', role: 'donor', path: '/support' },
  { label: 'Operations admin', role: 'admin', path: '/admin' },
];

describe('FoodLoop screen selection', () => {
  afterEach(() => { cleanup(); });
  beforeEach(() => { startDemoMock.mockClear(); beginSignInMock.mockClear(); });

  it('takes the landing-page demo action to the separate screen picker', async () => {
    render(<TestRoutes initialPath="/" />);
    fireEvent.click(screen.getByRole('button', { name: /Choose a demo page/i }));
    expect(await screen.findByRole('heading', { name: /Choose a page/i })).not.toBeNull();
    expect(startDemoMock).not.toHaveBeenCalled();
  });

  it('shows ten individually selectable product pages', () => {
    render(<TestRoutes initialPath="/explore" />);
    for (const choice of choices) {
      expect(screen.getByRole('button', { name: `Open ${choice.label} as ${roleLabels[choice.role]}` })).not.toBeNull();
    }
    expect(screen.getAllByRole('button')).toHaveLength(10);
  });

  it.each(choices)('opens $label with the $role demo identity', async (choice) => {
    render(<TestRoutes initialPath="/explore" />);
    fireEvent.click(screen.getByRole('button', { name: `Open ${choice.label} as ${roleLabels[choice.role]}` }));
    expect(startDemoMock).toHaveBeenCalledWith(choice.role);
    expect(await screen.findByTestId('current-route')).toHaveProperty('textContent', choice.path);
  });
});
