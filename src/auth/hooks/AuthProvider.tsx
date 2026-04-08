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

    React.useEffect(() => {
        // Default to first account if none is active
        if (!msalInstance.getActiveAccount() && msalInstance.getAllAccounts().length > 0) {
            msalInstance.setActiveAccount(msalInstance.getAllAccounts()[0]);
        }

        // Register event callback and keep the returned id for cleanup
        const callbackId: unknown = msalInstance.addEventCallback((event: any) => {
            const authenticationResult = event?.payload as AuthenticationResult;
            if (event.eventType === EventType.LOGIN_SUCCESS && authenticationResult?.account) {
                const account = authenticationResult.account;
                msalInstance.setActiveAccount(account);
                window.location.reload();
            }
        });

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
    }, [msalInstance]);

    return <MsalProvider instance={msalInstance}>{children}</MsalProvider>;
};

export function useAuthProvider() {
    return { AuthProvider };
}