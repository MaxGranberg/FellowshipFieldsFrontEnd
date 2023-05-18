import React, { useState, useEffect } from 'react'
import socket from '../socket'
import convertToEmoji from './emojiConverter'

function Chat() {
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')

  useEffect(() => {
    socket.on('chatMessage', (message) => {
      setMessages((prevMessages) => [...prevMessages, { id: Date.now(), text: message }])
    })

    return () => {
      socket.off('chatMessage')
    }
  }, [])

  const sendMessage = () => {
    if (inputMessage.trim() === '') {
      return
    }
    const messageWithEmojis = convertToEmoji(inputMessage)
    socket.emit('chatMessage', messageWithEmojis)
    setInputMessage('')
  }
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage()
    }
  }

  return (
    <div className="chat-container">
      <div className="chat-messages">
        {messages.map((message) => (
          <div key={message.id} className="chat-message">
            {message.text}
          </div>
        ))}
      </div>
      <div className="chat-input">
        <input
          type="text"
          placeholder="Type your message here..."
          required
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button type="button" onClick={sendMessage}>
          Send
        </button>
      </div>
    </div>
  )
}

export default Chat
