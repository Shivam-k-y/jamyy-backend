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

  return (
    <div className="chat-room">
      <MessageList messages={messages} currentUserId={Socket.id} />
      <form id="form" onSubmit={handleSubmit}>
        <input
          id="input"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          autoComplete="off"
          placeholder="Chat"
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}

export default ChatRoom;