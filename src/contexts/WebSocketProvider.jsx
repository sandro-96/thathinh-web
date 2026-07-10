import { useEffect, useRef, useState, useCallback } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { WebSocketContext } from "./WebSocketContext";
import { useAuth } from "@/hooks/useAuth";

const WS_URL = import.meta.env.VITE_WS_URL || "http://localhost:8080/ws";

export function WebSocketProvider({ children }) {
  const { user } = useAuth();
  const stompClientRef = useRef(null);
  const handlersRef = useRef(new Map());
  const [connected, setConnected] = useState(false);
  const messageQueue = useRef([]);

  const resubscribeAll = useCallback((client) => {
    handlersRef.current.forEach((handler) => {
      handler.subscription?.unsubscribe();
      handler.subscription = client.subscribe(handler.destination, (msg) => {
        try {
          handler.callback(JSON.parse(msg.body));
        } catch {
          handler.callback(msg.body);
        }
      });
    });
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!user?.id || !token) {
      stompClientRef.current?.deactivate();
      stompClientRef.current = null;
      setConnected(false);
      handlersRef.current.forEach((h) => {
        h.subscription?.unsubscribe();
        h.subscription = null;
      });
      return undefined;
    }

    const client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      reconnectDelay: 3000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      beforeConnect: () => {
        const freshToken = localStorage.getItem("accessToken") || "";
        client.connectHeaders = freshToken ? { Authorization: `Bearer ${freshToken}` } : {};
      },
      onConnect: () => {
        setConnected(true);
        resubscribeAll(client);
        messageQueue.current.forEach((msg) => client.publish(msg));
        messageQueue.current = [];
      },
      onDisconnect: () => {
        setConnected(false);
        handlersRef.current.forEach((h) => {
          h.subscription = null;
        });
      },
      onStompError: (frame) => {
        console.error("[WS] STOMP error:", frame.headers?.message);
      },
      onWebSocketClose: () => setConnected(false),
    });

    client.activate();
    stompClientRef.current = client;

    return () => {
      client.deactivate();
      stompClientRef.current = null;
      setConnected(false);
      handlersRef.current.forEach((h) => {
        h.subscription?.unsubscribe();
        h.subscription = null;
      });
    };
  }, [user?.id, resubscribeAll]);

  const subscribe = useCallback((destination, callback) => {
    const id = Symbol("ws-sub");
    const handler = { destination, callback, subscription: null };
    handlersRef.current.set(id, handler);

    const client = stompClientRef.current;
    if (client?.connected) {
      handler.subscription = client.subscribe(destination, (msg) => {
        try {
          callback(JSON.parse(msg.body));
        } catch {
          callback(msg.body);
        }
      });
    }

    return () => {
      handler.subscription?.unsubscribe();
      handlersRef.current.delete(id);
    };
  }, []);

  const send = useCallback((destination, body) => {
    const client = stompClientRef.current;
    const payload = { destination, body: JSON.stringify(body) };
    if (client?.connected) client.publish(payload);
    else messageQueue.current.push(payload);
  }, []);

  return (
    <WebSocketContext.Provider value={{ subscribe, send, connected }}>
      {children}
    </WebSocketContext.Provider>
  );
}
