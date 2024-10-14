import { useEffect, useRef } from 'react';

function MessageList({ messages, currentUserId }) {
  const messagesEndRef = useRef(null);

  // if user is interacting then not scroll to bottom
  const isUserInteracting = useRef(false);

  const handleUserInteraction = () => {
    isUserInteracting.current = true;
    setTimeout(() => {
      isUserInteracting.current = false;
    }, 3000); // Reset after 3 seconds of inactivity
  };

  useEffect(() => {
    window.addEventListener('scroll', handleUserInteraction);

    return () => {
      window.removeEventListener('scroll', handleUserInteraction);
    };
  }, []);

  const scrollToBottom = () => {
    if (!isUserInteracting.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
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