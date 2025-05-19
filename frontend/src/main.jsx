import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router";

import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
    <QueryClientProvider client={QueryClient}> 
      <App />
    </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>
);
