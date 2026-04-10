import { LogLevel } from '@azure/msal-common';

 /**
 * Configuration object to be passed to MSAL instance on creation. 
 * For a full list of MSAL.js configuration parameters, visit:
 * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/configuration.md 
 */

 export const msalConfig = {
     auth: {
         clientId: import.meta.env.VITE_APP_CLIENT_ID, // This is the ONLY mandatory field that you need to supply.
         authority: `https://login.microsoftonline.com/${import.meta.env.VITE_APP_TENANT_ID}`, // Replace the placeholder with your tenant info
         redirectUri: "/", // Points to window.location.origin. You must register this URI on Microsoft Entra admin center/App Registration.
         postLogoutRedirectUri: '/', // Indicates the page to navigate after logout.
         navigateToLoginRequestUrl: false, // If "true", will navigate back to the original request location before processing the auth code response.
     },
    cache: {
        cacheLocation: 'sessionStorage', 
        storeAuthStateInCookie: false, 
    },
    system: {
        loggerOptions: {
            loggerCallback: (level: LogLevel, message: string, containsPii: boolean) => {
                if (containsPii) {
                    return;
                }
                switch (level) {
                    case LogLevel.Error:
                        console.error(message);
                        return;
                    case LogLevel.Info:
                        console.info(message);
                        return;
                    case LogLevel.Verbose:
                        console.debug(message);
                        return;
                    case LogLevel.Warning:
                        console.warn(message);
                        return;
                    default:
                        return;
                }
            },
        },
    },
 };

 export const loginRequest = {
     scopes: [],
 };