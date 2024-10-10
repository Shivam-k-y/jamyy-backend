import React, { useState, useEffect, useRef } from 'react'
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { ScrollArea } from "./ui/scroll-area"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card"
import { Avatar, AvatarFallback } from "./ui/avatar"
import { Send, ArrowDown } from "lucide-react"

function ChatRoom({ Socket, currentRoom }) {
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [showScrollButton, setShowScrollButton] = useState(false)
  const scrollAreaRef = useRef(null)
  const messagesEndRef = useRef(null)
  const isAtBottomRef = useRef(true)
  const scrollBtn = document.getElementById("scrollBtn");

  // Event listener for scrolling, calls the toggleScrollButton function
  window.addEventListener("scroll", toggleScrollButton);

  // Add click event listener for the scroll button
  scrollBtn.addEventListener("click", scrollToBottom);

  useEffect(() => {
    Socket.on('message', (data) => {
      setMessages((prevMessages) => [...prevMessages, data])
    })

    return () => {
      Socket.off('message')
    }
  }, [Socket])

  useEffect(() => {
    const handleScroll = () => {
      if (scrollAreaRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = scrollAreaRef.current
        const isScrolledToBottom = scrollHeight - scrollTop <= clientHeight + 1
        isAtBottomRef.current = isScrolledToBottom
        setShowScrollButton(!isScrolledToBottom)
      }
    }

    const scrollArea = scrollAreaRef.current
    if (scrollArea) {
      scrollArea.addEventListener('scroll', handleScroll)
      return () => scrollArea.removeEventListener('scroll', handleScroll)
    }
  }, [])

  useEffect(() => {
    if (isAtBottomRef.current) {
      scrollToBottom()
    }
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (inputMessage.length >= 250) {
      alert('Message is too long. Please keep it under 250 characters.')
      setInputMessage('')
      return
    }
    if (inputMessage) {
      Socket.emit('message', { room: currentRoom, message: inputMessage })
      setInputMessage('')
      scrollToBottom()
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
    <Card className="w-full h-5/6 mx-auto relative bg-transparent">
      <CardHeader>
        <CardTitle>Chat Room: {currentRoom}</CardTitle>
      </CardHeader>
      <CardContent className="p-0 bg-transparent">
        <ScrollArea className="h-[300px] w-full bg-transparent" ref={scrollAreaRef}>
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
                    <p className="text-xs text-muted-foreground mb-1">ID: {msg.socketId.slice(0, 6)}</p>
                    <div className={`max-w-56 sm:max-w-sm md:max-w-md rounded-lg p-3 inline-block break-words ${msg.socketId === Socket.id ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>
                      {msg.msg}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
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
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            className="flex-grow"
            onpaste="return false;"
            required
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