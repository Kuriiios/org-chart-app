import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';

// Prepare mocks for @azure/msal-browser before importing the component
const mockGetActiveAccount = vi.fn();
const mockGetAllAccounts = vi.fn();
const mockSetActiveAccount = vi.fn();
let savedEventCallback: ((event: any) => void) | null = null;
const mockAddEventCallback = vi.fn((cb: (event: any) => void) => { savedEventCallback = cb; });

vi.mock('@azure/msal-browser', () => ({
  PublicClientApplication: function () {
    return {
      getActiveAccount: mockGetActiveAccount,
      getAllAccounts: mockGetAllAccounts,
      setActiveAccount: mockSetActiveAccount,
      addEventCallback: mockAddEventCallback,
    };
  },
  EventType: { LOGIN_SUCCESS: 'LOGIN_SUCCESS' },
}));

// Avoid invoking the real MsalProvider implementation (it expects a full msal instance)
vi.mock('@azure/msal-react', () => ({
  MsalProvider: ({ children }: { children?: any }) => <div>{children}</div>,
}));

import { AuthProvider } from '../auth/hooks/AuthProvider';

describe('AuthProvider', () => {
  const originalLocation = window.location;

  beforeEach(() => {
    vi.clearAllMocks();
    savedEventCallback = null;
  });

  afterEach(() => {
    // restore original location object if we stubbed it
    try {
      Object.defineProperty(window, 'location', { configurable: true, value: originalLocation });
    } catch (e) {
      // ignore in case restore is unnecessary
    }
  });

  it('sets active account on mount when none is active and accounts exist', () => {
    const account = { homeAccountId: 'a1', username: 'alice@example.com' };
    mockGetActiveAccount.mockReturnValue(null);
    mockGetAllAccounts.mockReturnValue([account]);

    render(
      <AuthProvider>
        <div>children</div>
      </AuthProvider>,
    );

    expect(mockSetActiveAccount).toHaveBeenCalledWith(account);
  });

  it('registers login-success callback and reloads page on login', () => {
    mockGetActiveAccount.mockReturnValue(null);
    mockGetAllAccounts.mockReturnValue([]);

    // stub window.location.reload
    const reloadMock = vi.fn();
    Object.defineProperty(window, 'location', { configurable: true, value: { reload: reloadMock } });

    render(
      <AuthProvider>
        <div>children</div>
      </AuthProvider>,
    );

    // ensure the event callback was registered
    expect(mockAddEventCallback).toHaveBeenCalled();
    expect(savedEventCallback).not.toBeNull();

    const fakeAccount = { homeAccountId: 'a2', username: 'bob@example.com' };
    const event = { eventType: 'LOGIN_SUCCESS', payload: { account: fakeAccount } };

    // invoke the saved callback to simulate a successful login event
    savedEventCallback && savedEventCallback(event);

    expect(mockSetActiveAccount).toHaveBeenCalledWith(fakeAccount);
    expect(reloadMock).toHaveBeenCalled();
  });

  it('does not set active account when an active account already exists', () => {
    const existing = { homeAccountId: 'existing' };
    mockGetActiveAccount.mockReturnValue(existing);
    mockGetAllAccounts.mockReturnValue([{ homeAccountId: 'a1' }]);

    render(
      <AuthProvider>
        <div>children</div>
      </AuthProvider>,
    );

    expect(mockSetActiveAccount).not.toHaveBeenCalled();
  });

  it('does not call setActiveAccount or reload when LOGIN_SUCCESS payload has no account', () => {
    mockGetActiveAccount.mockReturnValue(null);
    mockGetAllAccounts.mockReturnValue([]);

    const reloadMock = vi.fn();
    Object.defineProperty(window, 'location', { configurable: true, value: { reload: reloadMock } });

    render(
      <AuthProvider>
        <div>children</div>
      </AuthProvider>,
    );

    expect(mockAddEventCallback).toHaveBeenCalled();
    expect(savedEventCallback).not.toBeNull();

    const event = { eventType: 'LOGIN_SUCCESS', payload: {} };
    savedEventCallback && savedEventCallback(event);

    expect(mockSetActiveAccount).not.toHaveBeenCalled();
    expect(reloadMock).not.toHaveBeenCalled();
  });
});
