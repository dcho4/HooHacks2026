import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Auth0Provider } from '@auth0/auth0-react';
import './index.css';
import App from './App.jsx';

const domain = import.meta.env.VITE_AUTH0_DOMAIN;
const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID;
const audience = import.meta.env.VITE_AUTH0_AUDIENCE;

const root = createRoot(document.getElementById('root'));

if (domain && clientId) {
  root.render(
    <StrictMode>
      <Auth0Provider
        domain={domain}
        clientId={clientId}
        authorizationParams={{
          redirect_uri: window.location.origin,
          audience: audience,
        }}
        cacheLocation="localstorage"
      >
        <App />
      </Auth0Provider>
    </StrictMode>
  );
} else {
  // Fallback: run without Auth0 (local-only mode)
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}
