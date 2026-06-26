import { useEffect, useRef, useState } from 'react';
import type { ClientWebSocketMessage } from '../../../src/types';

type ConnectionStatus = 'connecting' | 'connected' | 'disconnected';

export function useWebSocket(
  url: string,
  onMessage: (msg: ClientWebSocketMessage) => void
): { status: ConnectionStatus; send: (data: unknown) => void } {
  const [status, setStatus] = useState<ConnectionStatus>('connecting');
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<number | null>(null);
  const pingTimerRef = useRef<number | null>(null);
  const lastPongRef = useRef<number>(0);
  const onMessageRef = useRef(onMessage);

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    let active = true;

    function scheduleReconnect() {
      if (reconnectTimerRef.current) return;
      reconnectTimerRef.current = window.setTimeout(() => {
        reconnectTimerRef.current = null;
        if (active) connect();
      }, 3000);
    }

    function startPing(ws: WebSocket) {
      stopPing();
      lastPongRef.current = Date.now();
      pingTimerRef.current = window.setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'ping' }));
        }
        if (Date.now() - lastPongRef.current > 35000) {
          ws.close();
        }
      }, 15000);
    }

    function stopPing() {
      if (pingTimerRef.current) {
        clearInterval(pingTimerRef.current);
        pingTimerRef.current = null;
      }
    }

    function connect() {
      setStatus('connecting');
      try {
        const ws = new WebSocket(url);
        wsRef.current = ws;

        ws.addEventListener('open', () => {
          if (!active) {
            ws.close();
            return;
          }
          setStatus('connected');
          startPing(ws);
        });

        ws.addEventListener('message', (event) => {
          let msg: ClientWebSocketMessage;
          try {
            msg = JSON.parse(event.data);
          } catch {
            return;
          }
          if ((msg as { type: string }).type === 'pong') {
            lastPongRef.current = Date.now();
            return;
          }
          onMessageRef.current(msg);
        });

        ws.addEventListener('close', () => {
          setStatus('disconnected');
          stopPing();
          if (active) scheduleReconnect();
        });

        ws.addEventListener('error', () => {
          ws.close();
        });
      } catch {
        setStatus('disconnected');
        scheduleReconnect();
      }
    }

    connect();

    return () => {
      active = false;
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
      stopPing();
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [url]);

  const send = (data: unknown) => {
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(data));
    }
  };

  return { status, send };
}
