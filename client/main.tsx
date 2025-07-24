import "./global.css";
import { createRoot } from "react-dom/client";
import App from "./App";

// Ensure root element exists
const container = document.getElementById("root");
if (!container) {
  throw new Error("Root element not found");
}

// Create root only once
let root: ReturnType<typeof createRoot>;

function renderApp() {
  if (!root) {
    root = createRoot(container);
  }
  root.render(<App />);
}

// Initial render
renderApp();

// Hot Module Replacement (HMR) - conditionally handle updates
if (import.meta.hot) {
  import.meta.hot.accept("./App", () => {
    // Re-render the app when App.tsx changes
    renderApp();
  });
}
