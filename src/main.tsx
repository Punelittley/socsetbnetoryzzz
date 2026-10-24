import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import App from "./App"
import ErrorBoundary from "./components/ErrorBoundary"
import "./index.css"
import "./refinements.css"
import "./social-refinements.css"
import "./experience.css"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
