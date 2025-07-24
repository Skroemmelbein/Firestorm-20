import "./global.css";
import { createRoot } from "react-dom/client";
import App from "./App";

const container = document.getElementById("root")!;
const root = createRoot(container);

// Render the app
root.render(<App />);

// Hot Module Replacement (HMR) - conditionally handle updates
if (import.meta.hot) {
  import.meta.hot.accept('./App', () => {
    // Re-render the app when App.tsx changes
    root.render(<App />);
  });
}
