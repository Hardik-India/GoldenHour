import { io, Socket } from 'socket.io-client';
import { TOKEN_KEY } from './api';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    const token = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;
    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:8000', {
      auth: token ? { token } : {},
      transports: ['websocket', 'polling'],
    });
  }
  return socket;
}

/** Call after login/logout so the socket re-authenticates. */
export function resetSocket() {
  socket?.disconnect();
  socket = null;
}
