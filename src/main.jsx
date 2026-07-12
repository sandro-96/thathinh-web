import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

if (import.meta.env.PROD) {
  // Kiểm tra đã nhận bản deploy mới: mở DevTools → Console, so với commit trên GitHub.
  console.info(`[Thả Thính] build ${__APP_BUILD__}`);
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
