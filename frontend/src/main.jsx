import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "stream-chat-react/dist/css/v2/index.css"; // Stream Chat styles
import "@stream-io/video-react-sdk/dist/css/styles.css"; // Stream Video styles
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Create QueryClient instance
const queryClient = new QueryClient();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>
);
