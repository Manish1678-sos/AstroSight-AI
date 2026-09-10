import { useEffect, useState, useRef, useCallback } from 'react';

export function useAlertSocket(url = 'ws://localhost:8000/ws/alerts') {
  const [alerts, setAlerts] = useState([]);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);

  const socketRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  const connect = useCallback(() => {
    try {
      const ws = new WebSocket(url);

      ws.onopen = () => {
        setConnected(true);
        setError(null);
      };

      ws.onmessage = (event) => {
        try {
          const incomingAlert = JSON.parse(event.data);

          // Prepends new alerts and keeps maximum 50 records in memory
          setAlerts((prevAlerts) => [incomingAlert, ...prevAlerts].slice(0, 50));
        } catch (err) {
          console.error('Failed to parse incoming WebSocket alert payload:', err);
        }
      };

      ws.onerror = (err) => {
        setError('WebSocket error encountered');
        console.error('AlertSocket Error:', err);
      };

      ws.onclose = () => {
        setConnected(false);
        // Automatic exponential fallback reconnect strategy after 3 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 3000);
      };

      socketRef.current = ws;
    } catch (err) {
      setError('Connection refused');
      setConnected(false);
    }
  }, [url]);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [connect]);

  return { alerts, connected, error };
}