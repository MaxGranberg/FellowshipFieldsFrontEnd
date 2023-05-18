import { io } from 'socket.io-client'

const socket = io('https://fellowshipfields-realtime.herokuapp.com', {
  autoConnect: false, // Anslut inte automatiskt vid import
  withCredentials: true,
})

export default socket
