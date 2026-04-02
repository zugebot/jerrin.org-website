import React from "react";
import { createRoot } from "react-dom/client";
import MudaePage from "./pages/MudaePage";
import "./index.css";
import { ErrorBoundary } from "./ErrorBoundary.tsx";

window.addEventListener("error", (e) => {
    console.error("Global error:", e.error ?? e.message);
});
window.addEventListener("unhandledrejection", (e) => {
    console.error("Unhandled promise rejection:", e.reason);
});

createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <ErrorBoundary>
            <MudaePage />
        </ErrorBoundary>
    </React.StrictMode>
);