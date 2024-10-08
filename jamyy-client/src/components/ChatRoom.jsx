import { useState, useEffect } from 'react';
import MessageList from './MessageList';

function ChatRoom({ Socket, currentRoom }) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');

  useEffect(() => {
    Socket.on('message', (data) => {
      setMessages((prevMessages) => [...prevMessages, data]);
    });

    return () => {
      Socket.off('message');
    };
  }, [Socket]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputMessage) {
      Socket.emit('message', { room: currentRoom, message: inputMessage });
      setInputMessage('');
    }
  };
  const handleKeyDown = (e) => {
    if ((e.ctrlKey && e.key === 'c') || (e.ctrlKey && e.key === 'v')) {
      e.preventDefault();
    }
  };

  const handleInputChange = (e) => {
    if (e.key === '*' || e.key === '.' || e.key === '\\') {
      e.preventDefault();  // Prevent the key from being typed
    }
  };
  useEffect(() => {
    const inputElement = document.getElementById('input');
    if (inputElement) {
      inputElement.addEventListener('keypress', handleInputChange);
    }

    return () => {
      if (inputElement) {
        inputElement.removeEventListener('keypress', handleInputChange);
      }
    };
  }, []);
  

  return (
    <div className="chat-room">
      <MessageList messages={messages} currentUserId={Socket.id} />
      <form id="form" onSubmit={handleSubmit}>
        <input
         
          id="input"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyClick={handleInputChange}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          placeholder="Chat"
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}

export default ChatRoom;