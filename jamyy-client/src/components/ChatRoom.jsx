import React, { useState, useEffect, useRef } from 'react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Send, ArrowDown } from "lucide-react";

function ChatRoom({ Socket, currentRoom }) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const scrollAreaRef = useRef(null);
  const bottomRef = useRef(null);
  const messageLimit = 500;
  const scrollThreshold = 100; // Distance from bottom to trigger auto-scroll

  // Listen for messages from the socket
  useEffect(() => {
    const handleNewMessage = (data) => {
      setMessages((prevMessages) => [...prevMessages, data]);
    };

    Socket.on('message', handleNewMessage);

    return () => {
      Socket.off('message', handleNewMessage);
    };
  }, [Socket]);

  // Show the scroll button if not at the bottom
  useEffect(() => {
    const scrollArea = scrollAreaRef.current;

    const handleScroll = () => {
      if (scrollArea) {
        const isAtBottom = scrollArea.scrollTop + scrollArea.clientHeight >= scrollArea.scrollHeight - scrollThreshold;
        setShowScrollButton(!isAtBottom);
      }
    };

    if (scrollArea) {
      scrollArea.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (scrollArea) {
        scrollArea.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  // Auto-scroll when new messages are added
  useEffect(() => {
    if (scrollAreaRef.current) {
      const isAtBottom =
        scrollAreaRef.current.scrollTop + scrollAreaRef.current.clientHeight >=
        scrollAreaRef.current.scrollHeight - scrollThreshold;
      if (isAtBottom) {
        scrollToBottom();
      }
    }
  }, [messages]);

  // Scroll to the bottom of the chat
  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Handle message submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputMessage.length > messageLimit) {
      alert(`Message is too long. Please keep it under ${messageLimit} characters.`);
      setInputMessage('');
      return;
    }

    if (inputMessage) {
      Socket.emit('message', {
        room: currentRoom,
        message: inputMessage,
        replyTo: replyingTo ? replyingTo.id : null
      });
      setInputMessage('');
      setReplyingTo(null); // Clear reply state
      scrollToBottom();
    }
  };

  // Handle message input change with sanitation
  const handleInputChange = (e) => {
    const sanitizedValue = e.target.value.replace(/[*\\.\\]/g, ''); // escape unwanted characters
    setInputMessage(sanitizedValue);
  };

  // Function to find a message by its ID
  const findMessageById = (id) => {
    const message = messages.find((msg) => msg.id === id);
    if (!message) {
      console.warn(`Message with ID ${id} not found.`);
    }
    return message;
  };


  return (
    <Card className="w-full h-5/6 mx-auto relative">
      <CardHeader>
        <CardTitle>Chat Room: {currentRoom}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-[300px] w-full bg-transparent overflow-y-auto" ref={scrollAreaRef}>
          <div className="p-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex mb-4 ${msg.socketId === Socket.id ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start ${msg.socketId === Socket.id ? 'flex-row-reverse' : 'flex-row'}`}>
                  <Avatar className="w-8 h-8">
                    <AvatarFallback>{msg.socketId.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className={`mx-2 max-w-md ${msg.socketId === Socket.id ? 'text-right' : 'text-left'}`}>
                    <p className="text-xs text-muted-foreground mb-1">ID: {msg.socketId}</p>
                    {msg.replyTo && (
                      <div className="reply-context bg-gray-100 p-2 mb-1 rounded text-xs">
                        Replying to: {findMessageById(msg.replyTo)?.msg || 'Message not found'}
                      </div>
                    )}
                    <div className={`max-w-56 sm:max-w-sm md:max-w-md rounded-lg p-3 inline-block break-words ${msg.socketId === Socket.id ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>
                      {msg.message || msg.msg}
                    </div>
                    <button 
                      onClick={() => setReplyingTo(msg)} 
                      className="text-xs text-blue-500 mt-1"
                    >
                      Reply
                    </button>
                  </div>
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        </div>
        {showScrollButton && (
          <Button
            className="absolute bottom-20 right-4 rounded-full p-2 z-10"
            size="icon"
            variant="secondary"
            onClick={scrollToBottom}
          >
            <ArrowDown className="h-4 w-4" />
            <span className="sr-only">Scroll to bottom</span>
          </Button>
        )}
      </CardContent>
      <CardFooter className="mt-5">
        {replyingTo && (
          <div className="reply-preview bg-gray-200 p-2 mb-2 rounded">
            <p className="text-sm text-gray-600">Replying to: {replyingTo.msg}</p>
            <button 
              onClick={() => setReplyingTo(null)} 
              className="text-xs text-red-500"
            >
              Cancel
            </button>
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex w-full items-center space-x-2 bg-white">
          <Input
            id="input"
            value={inputMessage}
            onChange={handleInputChange}
            placeholder="Type your message..."
            className="flex-grow"
            required
          />
          <Button type="submit" size="icon">
            <Send className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}

export default ChatRoom;
