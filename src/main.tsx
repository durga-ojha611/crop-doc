import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { ThemeProvider } from "./components/ThemeProvider.tsx";
import { GoogleOAuthProvider } from '@react-oauth/google';

console.log("Loaded Google Client ID:", import.meta.env.VITE_GOOGLE_CLIENT_ID);

createRoot(document.getElementById("root")!).render(
  <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || 'dummy_client_id'}>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <App />
    </ThemeProvider>
  </GoogleOAuthProvider>
);
