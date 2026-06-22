import { StrictMode } from "react";
import { renderToString } from "react-dom/server";
import App from "./App";

/**
 * Render the full app to an HTML string for static-site generation.
 * Called at build time by prerender.js — no server runtime required.
 */
export function render(): string {
  return renderToString(
    <StrictMode>
      <App />
    </StrictMode>
  );
}
