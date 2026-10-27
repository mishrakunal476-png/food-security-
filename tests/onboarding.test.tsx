// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { OnboardingPage } from '../src/pages/AuthPages';

const mocks = vi.hoisted(() => ({ useAuth: vi.fn(), useDemo: vi.fn(), refresh: vi.fn(), setRole: vi.fn(), fetch: vi.fn() }));
vi.mock('../src/auth/AuthProvider', () => ({ useAuth: mocks.useAuth }));
vi.mock('../src/state/DemoProvider', () => ({ useDemo: mocks.useDemo }));

function OnboardingTestApp() {
  return (
    <MemoryRouter initialEntries={['/onboarding']}>
      <Routes>
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/dashboard" element={<main>Workspace opened</main>} />
        <Route path="/login" element={<main>Sign in</main>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('FoodLoop onboarding', () => {
  beforeEach(() => {
    mocks.refresh.mockReset();
    mocks.refresh.mockResolvedValue({ id: 'u1', name: 'Nisha', email: null, role: 'ngo', organizationName: null, onboardingComplete: true });
    mocks.setRole.mockReset();
    mocks.fetch.mockReset();
    mocks.fetch.mockResolvedValue({ ok: true, json: async () => ({ ok: true }) });
    vi.stubGlobal('fetch', mocks.fetch);
    mocks.useAuth.mockReturnValue({ user: { id: 'u1', name: 'Nisha', email: null, role: 'donor', organizationName: null, onboardingComplete: false }, refresh: mocks.refresh });
    mocks.useDemo.mockReturnValue({ demoActive: false, role: 'donor', setRole: mocks.setRole });
  });
  afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

  it('saves the selected NGO role and advances without an organization name', async () => {
    render(<OnboardingTestApp />);
    fireEvent.change(screen.getByLabelText('Your role'), { target: { value: 'ngo' } });
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    expect(await screen.findByText('Workspace opened')).not.toBeNull();
    expect(mocks.fetch).toHaveBeenCalledWith('/api/auth/onboarding', expect.objectContaining({ body: JSON.stringify({ role: 'ngo' }) }));
    expect(mocks.refresh).toHaveBeenCalledOnce();
  });

  it('shows an accessible inline error when the onboarding API rejects the save', async () => {
    mocks.fetch.mockResolvedValueOnce({ ok: false, json: async () => ({ error: 'Try again shortly.' }) });
    render(<OnboardingTestApp />);
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    const error = await screen.findByRole('alert');
    expect(error.textContent).toContain('Try again shortly.');
    expect(screen.queryByText('Workspace opened')).toBeNull();
  });

  it('keeps demo role selection local and continues straight to the sample dashboard', async () => {
    mocks.useDemo.mockReturnValue({ demoActive: true, role: 'donor', setRole: mocks.setRole });
    render(<OnboardingTestApp />);
    fireEvent.change(screen.getByLabelText('Your role'), { target: { value: 'ngo' } });
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    expect(await screen.findByText('Workspace opened')).not.toBeNull();
    expect(mocks.setRole).toHaveBeenCalledWith('ngo');
    expect(mocks.fetch).not.toHaveBeenCalled();
  });
});
