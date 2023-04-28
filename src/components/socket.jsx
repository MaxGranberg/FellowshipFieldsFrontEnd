import { io } from 'socket.io-client'

const socket = io('http://localhost:8080', {
  autoConnect: false, // Anslut inte automatiskt vid import
  withCredentials: true,
})

export default socket
