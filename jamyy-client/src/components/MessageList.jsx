import { useEffect, useRef } from 'react';

function MessageList({ messages, currentUserId }) {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  return (
    <ul id="messages">
      {messages.map((msg, index) => (
        <li
          key={index}
          className={`message-item ${msg.socketId === currentUserId ? 'my-message' : 'other-message'}`}
        >
          <div className="id-container">
            <span className="socket-id">(ID: {msg.socketId})</span>
          </div>
          <span className="message-content">{msg.msg}</span>
        </li>
      ))}
      <div ref={messagesEndRef} />
    </ul>
  );
}

export default MessageList;