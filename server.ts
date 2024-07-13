// Correct use of WebSocket from 'ws' in Node.js
import { WebSocketServer, WebSocket } from 'ws';

interface ChatMessage {
  type: 'message' | 'join' | 'leave';
  roomId: number;
  messageId?: number; // Assuming you might also want the message ID
  senderId?: string;
  content?: string;
  senderName?: string | null;
  senderImage?: string | null;
  createdAt?: Date | null;
  read: boolean;
  replyToId?: number | null; // This is optional, referencing another message ID
  deleted: boolean;
}

const wss = new WebSocketServer({ port: 3001 });
const clients = new Map<number, Set<WebSocket>>(); // roomId to clients

wss.on('connection', ws => {
  ws.on('message', data => {
    const msg: ChatMessage = JSON.parse(data.toString());

    if (msg.type === 'join') {
      let room = clients.get(msg.roomId);
      if (!room) {
        room = new Set();
        clients.set(msg.roomId, room);
      }
      room.add(ws);
      console.log(`Client joined room ${msg.roomId}`);
    } else if (msg.type === 'message') {
      // Send message to all clients in the same room
      clients.get(msg.roomId)?.forEach(client => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(msg));
        }
      });
    }
  });

  ws.on('close', () => {
    clients.forEach((set, roomId) => {
      set.delete(ws);
      if (set.size === 0) {
        clients.delete(roomId);
      }
    });
  });
});

console.log('WebSocket server started on ws://localhost:3001');
