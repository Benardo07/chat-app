import { WebSocket, WebSocketServer } from 'ws';

interface ChatMessage {
  type: 'message' | 'join' | 'leave';
  roomId: number;
  messageId?: number;
  senderId: string;
  content: string;
  senderName?: string | null;
  senderImage?: string | null;
  createdAt?: Date | null;
  read: boolean;
  replyToId?: number | null;
  deleted: boolean;
}

const wss = new WebSocketServer({ port: 3001 });
const clients = new Map<WebSocket, Set<number>>(); // Maps WebSocket to a set of subscribed room IDs

wss.on('connection', (ws) => {
  const subscriptions = new Set<number>();
  clients.set(ws, subscriptions);

  ws.on('message', (data) => {
    const msg: ChatMessage = JSON.parse(data.toString());

    switch (msg.type) {
      case 'join':
        subscriptions.add(msg.roomId);
        console.log(`Client joined room ${msg.roomId}`);
        break;

      case 'message':
        // Send message to all clients subscribed to this room
        clients.forEach((rooms, client) => {
          if (rooms.has(msg.roomId) && client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(msg));
          }
        });
        break;
    }
  });

  ws.on('close', () => {
    clients.delete(ws);

    subscriptions.forEach(roomId => {
      console.log(`Client removed from room ${roomId}`);
    });
  });
});

console.log('WebSocket server started on ws://localhost:3001');
