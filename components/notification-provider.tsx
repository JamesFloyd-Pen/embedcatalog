"use client"

import * as React from "react"
import { Check, X } from "lucide-react"

type Notification = {
  id: number
  message: string
}

type NotificationContextValue = {
  notify: (message: string) => void
}

const NotificationContext = React.createContext<
  NotificationContextValue | undefined
>(undefined)

function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notification, setNotification] = React.useState<Notification | null>(
    null
  )
  const [visible, setVisible] = React.useState(false)
  const removalTimer = React.useRef<number | null>(null)

  function notify(message: string) {
    if (removalTimer.current !== null) {
      window.clearTimeout(removalTimer.current)
      removalTimer.current = null
    }
    setNotification({ id: Date.now(), message })
    setVisible(true)
  }

  const dismiss = React.useCallback(() => {
    if (!notification) return

    setVisible(false)
    if (removalTimer.current !== null) {
      window.clearTimeout(removalTimer.current)
    }

    const notificationId = notification.id
    removalTimer.current = window.setTimeout(() => {
      setNotification((current) =>
        current?.id === notificationId ? null : current
      )
      removalTimer.current = null
    }, 500)
  }, [notification])

  React.useEffect(() => {
    if (!notification) return

    const timeout = window.setTimeout(dismiss, 4000)

    return () => window.clearTimeout(timeout)
  }, [dismiss, notification])

  return (
    <NotificationContext.Provider value={{ notify }}>
      {children}
      {notification && (
        <div
          key={notification.id}
          className={`${visible ? "notification-enter" : "notification-exit"} fixed right-4 bottom-4 z-[100] flex max-w-sm items-center gap-3 rounded-lg border bg-background px-4 py-3 text-sm text-foreground shadow-lg`}
        >
          <Check className="size-4 shrink-0 text-green-600" />
          <span className="flex-1">{notification.message}</span>
          <button
            type="button"
            aria-label="Dismiss notification"
            title="Dismiss notification"
            onClick={dismiss}
            className="cursor-pointer text-muted-foreground hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>
      )}
    </NotificationContext.Provider>
  )
}

function useNotification() {
  const context = React.useContext(NotificationContext)
  if (!context) {
    throw new Error("useNotification must be used within NotificationProvider")
  }
  return context
}

export { NotificationProvider, useNotification }
