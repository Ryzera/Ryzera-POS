import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/sync'
})
export class SyncGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('SyncGateway');
  private activeConnections = new Map<string, string>();

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    this.activeConnections.delete(client.id);
    this.broadcastActiveNodes();
  }

  @SubscribeMessage('register_node')
  handleRegisterNode(client: Socket, @MessageBody() data: { branchId: string; deviceName: string }) {
    this.activeConnections.set(client.id, `${data.branchId}-${data.deviceName}`);
    this.logger.log(`Node registered: ${data.branchId} - ${data.deviceName}`);
    this.broadcastActiveNodes();
    return { event: 'registered', data: { status: 'success' } };
  }

  broadcast(event: string, payload: any) {
    this.server.emit(event, payload);
  }

  private broadcastActiveNodes() {
    this.server.emit('active_nodes_count', { count: this.activeConnections.size });
  }
}
