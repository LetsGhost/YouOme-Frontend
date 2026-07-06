import { io, Socket } from "socket.io-client";

const WS_PATH = "/api/ws";

export type WsMessage<TPayload = Record<string, unknown>> = {
  type: string;
  payload?: TPayload;
};

// `auth` as a callback (not a static object) makes socket.io re-read the
// token on every (re)connect attempt, so a connection that drops and comes
// back after a token refresh authenticates with the current token rather
// than whatever was current when the socket was first created.
export function createWebsocketConnection(backendUrl: string, getToken: () => string | undefined): Socket {
  return io(backendUrl, {
    path: WS_PATH,
    autoConnect: false,
    auth: (callback) => callback({ token: getToken() }),
  });
}
