import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

const rootEl = document.getElementById("root");

if (!rootEl) {
  document.body.innerHTML =
    "<p style='font-family:sans-serif;padding:2rem'>Root element missing.</p>";
} else {
  try {
    ReactDOM.createRoot(rootEl).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (err) {
    rootEl.innerHTML = `<div style="font-family:sans-serif;padding:2rem;color:#b91c1c">
      <h1>App failed to start</h1>
      <pre style="white-space:pre-wrap;background:#fef2f2;padding:1rem;border-radius:8px">${String(err)}</pre>
    </div>`;
    console.error(err);
  }
}