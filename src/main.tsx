
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { StrictMode } from 'react'

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Failed to find the root element");
const root = createRoot(rootElement);

// Render without Suspense at the root level to avoid hook ordering issues
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
