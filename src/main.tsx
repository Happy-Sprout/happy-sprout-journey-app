
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { StrictMode } from 'react'

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Failed to find the root element");
const root = createRoot(rootElement);

// Render with StrictMode to help catch potential issues
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
