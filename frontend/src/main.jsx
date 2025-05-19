import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";

// Import Devtools
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

// Create QueryClient instance
const queryClient = new QueryClient();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <App />

        {/* Add Devtools (only in dev) */}
        {import.meta.env.DEV && (
          <ReactQueryDevtools initialIsOpen={false} />
        )}
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>
);
