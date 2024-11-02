import React, { useState, useEffect, useRef } from 'react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Send, ArrowDown } from "lucide-react";

function ChatRoom({ Socket, currentRoom }) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [showScrollButton, setShowScrollButton] = useState(false);
  const scrollAreaRef = useRef(null);
  const bottomRef = useRef(null);
  const message_limit = 500;
  const scrollThreshold = 100; // Distance from bottom to trigger auto-scroll

  useEffect(() => {
    Socket.on('message', (data) => {
      setMessages((prevMessages) => [...prevMessages, data]);
    });

    return () => {
      Socket.off('message');
    };
  }, [Socket]);

  useEffect(() => {
    const scrollArea = scrollAreaRef.current;

    const handleScroll = () => {
      if (scrollArea) {
        const isAtBottom = scrollArea.scrollTop + scrollArea.clientHeight >= scrollArea.scrollHeight - scrollThreshold;
        setShowScrollButton(!isAtBottom); // Show button if not at bottom
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

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputMessage.length >= message_limit) {
      alert(`Message is too long. Please keep it under ${message_limit} characters.`);
      setInputMessage('');
      return;
    }
    if (inputMessage) {
      Socket.emit('message', { room: currentRoom, message: inputMessage });
      setInputMessage('');
      scrollToBottom();
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value.replace(/[*\\.\\]/g, ''); // escape the backslash
    setInputMessage(value);
  };

  useEffect(() => {
    const scrollArea = scrollAreaRef.current;

    if (scrollArea) {
      const isAtBottom = scrollArea.scrollTop + scrollArea.clientHeight >= scrollArea.scrollHeight - scrollThreshold;
      if (isAtBottom) {
        scrollToBottom(); // Only scroll if within threshold
      }
    }
  }, [messages]);

  return (
    <Card className="w-full h-5/6 mx-auto relative">
      <CardHeader>
        <CardTitle>Chat Room: {currentRoom}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-[300px] w-full bg-transparent overflow-y-auto" ref={scrollAreaRef}>
          <div className="p-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex mb-4 ${msg.socketId === Socket.id ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start ${msg.socketId === Socket.id ? 'flex-row-reverse' : 'flex-row'}`}>
                  <Avatar className="w-8 h-8">
                    <AvatarFallback>{msg.socketId.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className={`mx-2 max-w-md ${msg.socketId === Socket.id ? 'text-right' : 'text-left'}`}>
                    <p className="text-xs text-muted-foreground mb-1">ID: {msg.socketId}</p>
                    <div className={`max-w-56 sm:max-w-sm md:max-w-md rounded-lg p-3 inline-block break-words ${msg.socketId === Socket.id ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>
                      {msg.msg}
                    </div>
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
