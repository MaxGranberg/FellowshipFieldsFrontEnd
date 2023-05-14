import React, { useState, useEffect } from 'react'
import socket from '../socket'

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

  const convertToEmoji = (inputString) => {
    let string = inputString
    string = string.replace(/:\)/g, String.fromCodePoint(0x1F603))
    string = string.replace(/<3/g, String.fromCodePoint(0x2764))
    string = string.replace(/:hmm/g, String.fromCodePoint(0x1F914))
    string = string.replace(/:party/g, String.fromCodePoint(0x1F389))
    string = string.replace(/:cool/g, String.fromCodePoint(0x1F60E))
    string = string.replace(/:sleep/g, String.fromCodePoint(0x1F634))
    string = string.replace(/:\(/g, String.fromCodePoint(0x1F61E))
    return string
  }

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
