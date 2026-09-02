import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/sync',
})
export class SyncGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('SyncGateway');
  private activeConnections = new Map<string, string>();

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    client.on('register_node', (data: { branchId: string; deviceName: string }) => {
      this.registerNode(client, data);
    });
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    this.activeConnections.delete(client.id);
    this.broadcastActiveNodes();
  }

  private registerNode(client: Socket, data: { branchId: string; deviceName: string }) {
    this.activeConnections.set(client.id, `${data.branchId}-${data.deviceName}`);
    this.logger.log(`Node registered: ${data.branchId} - ${data.deviceName}`);
    client.emit('registered', { status: 'success' });
    this.broadcastActiveNodes();
  }

  broadcast(event: string, payload: any) {
    this.server.emit(event, payload);
  }

  private broadcastActiveNodes() {
    this.server.emit('active_nodes_count', { count: this.activeConnections.size });
  }
}
