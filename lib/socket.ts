import { Server as SocketIOServer } from 'socket.io'
import type { Server as HTTPServer } from 'http'

let io: SocketIOServer | null = null

export const initSocket = (server: HTTPServer): SocketIOServer => {
  if (!io) {
    io = new SocketIOServer(server, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST']
      }
    })

    io.on('connection', (socket) => {
      console.log('Client connected:', socket.id)

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id)
      })
    })
  }
  return io
}

export const getIO = (): SocketIOServer => {
  if (!io) {
    throw new Error('Socket.io not initialized')
  }
  return io
}
