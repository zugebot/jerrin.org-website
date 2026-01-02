// jerrin-org/src/main.tsx
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import {ErrorBoundary} from "./ErrorBoundary.tsx";

window.addEventListener("error", (e) => {
    console.error("Global error:", e.error ?? e.message);
});
window.addEventListener("unhandledrejection", (e) => {
    console.error("Unhandled promise rejection:", e.reason);
});

createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <ErrorBoundary>
            <App />
        </ErrorBoundary>
    </React.StrictMode>
);

