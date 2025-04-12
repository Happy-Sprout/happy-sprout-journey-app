
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { Suspense } from 'react'

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Failed to find the root element");
const root = createRoot(rootElement);

// Wrap with Suspense to handle any loading states properly
root.render(
  <Suspense fallback={<div>Loading application...</div>}>
    <App />
  </Suspense>
);
