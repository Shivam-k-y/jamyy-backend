import React, { useState, useEffect, useRef } from 'react'
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { ScrollArea } from "./ui/scroll-area"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card"
import { Avatar, AvatarFallback } from "./ui/avatar"
import { Send } from "lucide-react"

function ChatRoom({ Socket, currentRoom }) {
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const scrollAreaRef = useRef(null)

  useEffect(() => {
    Socket.on('message', (data) => {
      setMessages((prevMessages) => [...prevMessages, data])
    })

    return () => {
      Socket.off('message')
    }
  }, [Socket])

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (inputMessage.length >= 100) {
      alert('Message is too long. Please keep it under 100 characters.')
      setInputMessage('')
      return
    }
    if (inputMessage) {
      Socket.emit('message', { room: currentRoom, message: inputMessage })
      setInputMessage('')
    }
  }

  const handleKeyDown = (e) => {
    if ((e.ctrlKey && e.key === 'c') || (e.ctrlKey && e.key === 'v')) {
      e.preventDefault()
    }
  }

  const handleInputChange = (e) => {
    const value = e.target.value
    if (!value.includes('*') && !value.includes('.') && !value.includes('\\')) {
      setInputMessage(value)
    }
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Chat Room: {currentRoom}</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4" ref={scrollAreaRef}>
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex mb-4 ${msg.socketId === Socket.id ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-start ${msg.socketId === Socket.id ? 'flex-row-reverse' : 'flex-row'}`}>
                <Avatar className="w-8 h-8">
                  <AvatarFallback>{msg.socketId.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className={`mx-2 ${msg.socketId === Socket.id ? 'text-right' : 'text-left'}`}>
                  <p className="text-sm text-muted-foreground mb-1">ID: {msg.socketId.slice(0, 6)}</p>
                  <div className={`rounded-lg p-3 inline-block ${msg.socketId === Socket.id ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>
                    {msg.msg}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </ScrollArea>
      </CardContent>
      <CardFooter>
        <form onSubmit={handleSubmit} className="flex w-full items-center space-x-2">
          <Input
            id="input"
            value={inputMessage}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            className="flex-grow"
          />
          <Button type="submit" size="icon">
            <Send className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </CardFooter>
    </Card>
  )
}

export default ChatRoom