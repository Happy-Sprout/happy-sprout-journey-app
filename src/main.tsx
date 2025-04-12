
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { StrictMode } from 'react'

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Failed to find the root element");
const root = createRoot(rootElement);

// Remove StrictMode temporarily to help debug the hook issue
// Will reintroduce once the error is fixed
root.render(
  <App />
);
