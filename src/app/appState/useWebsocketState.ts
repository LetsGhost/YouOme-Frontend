import { useCallback, useEffect, useRef, useState } from "react";
import type { Socket } from "socket.io-client";

import { createWebsocketConnection, WsMessage } from "../../shared/api/websocket";

type EventHandler = (payload: unknown) => void;

export function useWebsocketState(backendUrl: string, accessToken: string | undefined) {
  const [wsConnected, setWsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const tokenRef = useRef(accessToken);
  const subscribersRef = useRef(new Map<string, Set<EventHandler>>());

  useEffect(() => {
    tokenRef.current = accessToken;
  }, [accessToken]);

  useEffect(() => {
    if (!accessToken) {
      setWsConnected(false);
      return;
    }

    const socket = createWebsocketConnection(backendUrl, () => tokenRef.current);
    socketRef.current = socket;

    socket.on("connect", () => setWsConnected(true));
    socket.on("disconnect", () => setWsConnected(false));
    socket.on("message", (msg: WsMessage) => {
      const handlers = subscribersRef.current.get(msg.type);
      handlers?.forEach((handler) => handler(msg.payload));
    });

    socket.connect();

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setWsConnected(false);
    };
    // Reconnecting only needs to happen when there's a backend to point at or
    // when auth presence flips (login/logout) - the token *value* changes
    // every ~12 minutes via the background refresh in useSessionState, but
    // socket.io only checks auth at handshake time, so a healthy connection
    // doesn't need to be torn down for that; tokenRef above keeps any future
    // reconnect using the freshest token regardless.
  }, [backendUrl, !!accessToken]);

  const sendWsMessage = useCallback((type: string, payload?: Record<string, unknown>) => {
    socketRef.current?.emit("message", { type, payload });
  }, []);

  const subscribeWsEvent = useCallback((type: string, handler: EventHandler) => {
    const handlers = subscribersRef.current.get(type) ?? new Set<EventHandler>();
    handlers.add(handler);
    subscribersRef.current.set(type, handlers);

    return () => {
      handlers.delete(handler);
    };
  }, []);

  return { wsConnected, sendWsMessage, subscribeWsEvent };
}
