import { EventType, PublicClientApplication } from "@azure/msal-browser";
import type { AuthenticationResult } from "@azure/msal-browser";
import { msalConfig } from "../auth-config";
import { MsalProvider } from "@azure/msal-react";
import type { ReactNode } from 'react';

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider = ({ children } : AuthProviderProps) => {
    const msalInstance = new PublicClientApplication(msalConfig);

    if (!msalInstance.getActiveAccount() && msalInstance.getAllAccounts().length > 0) {
        msalInstance.setActiveAccount(msalInstance.getAllAccounts()[0]);
    }

    msalInstance.addEventCallback((event) => {
        var authenticationResult = event?.payload as AuthenticationResult;
        if (event.eventType === EventType.LOGIN_SUCCESS && authenticationResult?.account) {
            const account = authenticationResult?.account;
            msalInstance.setActiveAccount(account);
            window.location.reload();
        }
    });

    return <MsalProvider instance={msalInstance}>{children}</MsalProvider>;
};

export function useAuthProvider() {
    return { AuthProvider };
}