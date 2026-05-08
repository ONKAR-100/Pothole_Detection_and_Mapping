import { useCallback, useState } from 'react'

export default function useRealtimeAlerts() {
  const [alerts] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const clearUnread = useCallback(() => setUnreadCount(0), [])

  return { alerts, unreadCount, clearUnread }
}
