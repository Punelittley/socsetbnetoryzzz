import { Component, type ErrorInfo, type ReactNode } from "react"

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "32px",
            textAlign: "center",
            fontFamily: "system-ui, -apple-system, sans-serif",
            background: "#0a0a0c",
            color: "#fff",
          }}
        >
          <h2 style={{ fontSize: "22px", marginBottom: "12px" }}>Что-то пошло не так</h2>
          <p
            style={{
              color: "#a1a1aa",
              marginBottom: "20px",
              maxWidth: "420px",
              fontSize: "14px",
              lineHeight: "1.5",
            }}
          >
            Произошла ошибка при отображении интерфейса. Нажмите кнопку ниже, чтобы перезагрузить приложение.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: "10px 24px",
              background: "#9333ea",
              color: "#fff",
              border: "none",
              borderRadius: "9999px",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "14px",
              boxShadow: "0 4px 14px rgba(147, 51, 234, 0.4)",
            }}
          >
            Обновить страницу
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

export default ErrorBoundary
