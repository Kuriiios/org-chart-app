import React from 'react';
import { EventType, PublicClientApplication } from "@azure/msal-browser";
import type { AuthenticationResult } from "@azure/msal-browser";
import { msalConfig } from "../authConfig";
import { MsalProvider } from "@azure/msal-react";
import type { ReactNode } from 'react';

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
    // Create the MSAL instance once per component lifecycle
    const msalInstance = React.useMemo(() => new PublicClientApplication(msalConfig), []);

    // Allow a dev/test bypass so the app can run without interactive MSAL
    const authBypass = import.meta.env.VITE_AUTH_BYPASS === 'true';
    const isTestEnv = import.meta.env.MODE === 'test';

    // If bypass is enabled, set a fake account synchronously so children
    // that call `getActiveAccount()` during first render see a truthy account.
    // Do NOT do this in test environments because tests mock MSAL and expect
    // `setActiveAccount` not to be called implicitly.
    if (authBypass && !isTestEnv) {
        const fakeAccount = {
            homeAccountId: 'bypass-home',
            localAccountId: 'bypass-local',
            environment: 'bypass',
            tenantId: 'bypass',
            username: 'dev@example.com',
            name: 'Dev User',
        } as any;
        try {
            const anyInstance = msalInstance as any;
            if (typeof anyInstance.getActiveAccount === 'function' && typeof anyInstance.setActiveAccount === 'function') {
                if (!msalInstance.getActiveAccount()) anyInstance.setActiveAccount(fakeAccount);
            }
        } catch (e) {
            // best-effort; ignore failures in stubbed/test environments
            // eslint-disable-next-line no-console
            console.warn('Could not set fake MSAL account synchronously', e);
        }
    }

    React.useEffect(() => {
        let callbackId: unknown;

        // Initialize MSAL, handle redirect responses, and ensure an active account
        async function initMsal() {
            try {
                // If bypass enabled, set a fake account so `getActiveAccount()` returns truthy
                if (authBypass && !isTestEnv) {
                    const fakeAccount = {
                        homeAccountId: 'bypass-home',
                        localAccountId: 'bypass-local',
                        environment: 'bypass',
                        tenantId: 'bypass',
                        username: 'dev@example.com',
                        name: 'Dev User',
                    } as any;
                    try {
                        if (!msalInstance.getActiveAccount()) msalInstance.setActiveAccount(fakeAccount);
                    } catch (e) {
                        // best-effort; some stubbed environments may not support setActiveAccount
                        // eslint-disable-next-line no-console
                        console.warn('Could not set fake MSAL account', e);
                    }
                }

                // Ensure MSAL internal initialization completes before calling APIs
                const anyInstance = msalInstance as any;
                if (typeof anyInstance.initialize === 'function') {
                    try {
                        await anyInstance.initialize();
                    } catch (initErr) {
                        // eslint-disable-next-line no-console
                        console.warn('MSAL initialize failed', initErr);
                    }
                }

                // Handle redirect result if returning from an auth redirect (guard if stubbed)
                if (typeof anyInstance.handleRedirectPromise === 'function') {
                    try {
                        const redirectResult = await anyInstance.handleRedirectPromise();
                        if ((redirectResult as AuthenticationResult)?.account) {
                            const account = (redirectResult as AuthenticationResult).account;
                            msalInstance.setActiveAccount(account);
                        }
                    } catch (e) {
                        // Non-fatal; log and proceed
                        // eslint-disable-next-line no-console
                        console.warn('Error handling MSAL redirect result', e);
                    }
                }

                // Default to first account if none is active
                if (!msalInstance.getActiveAccount() && msalInstance.getAllAccounts().length > 0) {
                    msalInstance.setActiveAccount(msalInstance.getAllAccounts()[0]);
                }

                // If not bypass and still no active account, redirect the user to MSAL login
                if (!authBypass && !msalInstance.getActiveAccount()) {
                    if (typeof (msalInstance as any).loginRedirect === 'function') {
                        // Trigger redirect to Microsoft login page (will navigate away)
                        try {
                            await (msalInstance as any).loginRedirect();
                            return;
                        } catch (e) {
                            // eslint-disable-next-line no-console
                            console.warn('MSAL loginRedirect failed', e);
                            return;
                        }
                    } else {
                        // In test or stubbed environments the loginRedirect function may not exist.
                        // Skip redirect so test environment can continue and allow event registration.
                        // eslint-disable-next-line no-console
                        console.warn('MSAL loginRedirect is not available in this environment; skipping redirect');
                    }
                }
            } catch (e) {
                // eslint-disable-next-line no-console
                console.warn('Error during MSAL initialization', e);
            }

            // Register event callback and keep the returned id for cleanup
            callbackId = msalInstance.addEventCallback((event: any) => {
                const authenticationResult = event?.payload as AuthenticationResult;
                if (event.eventType === EventType.LOGIN_SUCCESS && authenticationResult?.account) {
                    const account = authenticationResult.account;
                    msalInstance.setActiveAccount(account);
                    window.location.reload();
                }
            });
        }

        initMsal();

        return () => {
            // removeEventCallback is optional on some MSAL versions; guard before calling
            const anyInstance = msalInstance as any;
            if (typeof anyInstance.removeEventCallback === 'function') {
                try {
                    anyInstance.removeEventCallback(callbackId);
                } catch {
                    // ignore removal errors
                }
            }
        };
    }, [msalInstance, authBypass]);

    return <MsalProvider instance={msalInstance}>{children}</MsalProvider>;
};

export function useAuthProvider() {
    return { AuthProvider };
}