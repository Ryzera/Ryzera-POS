import { WebSocketGateway, WebSocketServer, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

/**
 * WebSocket gateway for real-time notifications.
 * CORS enabled for frontend connections.
 * Uses polling fallback for environments where WebSocket is blocked.
 */
@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  transports: ['websocket', 'polling'],
})
export class NotificationGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  private logger = new Logger('NotificationGateway');

  @WebSocketServer()
  server: Server;

  /** Called after gateway initialization. Logs startup confirmation. */
  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway initialized on port 3000');
  }

  /** Called when client connects. Logs for debugging. */
  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  /** Called when client disconnects. Logs for debugging. */
  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  /** Emit event to all connected clients. Used for real-time notifications. */
  sendNotification(event: string, data: any) {
    this.logger.log(`Emitting event: ${event}`);
    this.server.emit(event, data);
  }
}