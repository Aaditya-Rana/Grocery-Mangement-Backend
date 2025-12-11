import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/realtime',
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('subscribe')
  handleSubscribe(
    @MessageBody() data: { listId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const room = `list_${data.listId}`;
    void client.join(room);
    console.log(`Client ${client.id} subscribed to ${room}`);
    return { event: 'subscribed', data: { listId: data.listId } };
  }

  @SubscribeMessage('unsubscribe')
  handleUnsubscribe(
    @MessageBody() data: { listId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const room = `list_${data.listId}`;
    void client.leave(room);
    console.log(`Client ${client.id} unsubscribed from ${room}`);
    return { event: 'unsubscribed', data: { listId: data.listId } };
  }

  // Event emitters
  emitListUpdated(listId: string, data: any) {
    this.server.to(`list_${listId}`).emit('list.updated', data);
  }

  emitItemUpdated(listId: string, data: any) {
    this.server.to(`list_${listId}`).emit('item.updated', data);
  }

  emitListCompleted(listId: string, data: any) {
    this.server.to(`list_${listId}`).emit('list.completed', data);
  }

  emitShareRevoked(listId: string, data: any) {
    this.server.to(`list_${listId}`).emit('share.revoked', data);
  }
}
