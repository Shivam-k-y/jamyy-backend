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
  const scrollAreaViewportRef = useRef(null)

  useEffect(() => {
    Socket.on('message', (data) => {
      setMessages((prevMessages) => [...prevMessages, data])
    })

    return () => {
      Socket.off('message')
    }
  }, [Socket])

  useEffect(() => {
    const scrollAreaViewport = scrollAreaViewportRef.current
    if (scrollAreaViewport) {
      const handleScroll = () => {
        const { scrollTop, scrollHeight, clientHeight } = scrollAreaViewport
        const isScrolledUp = scrollHeight - scrollTop > clientHeight + 100
        setShowScrollButton(isScrolledUp)
      }

      scrollAreaViewport.addEventListener('scroll', handleScroll)
      return () => scrollAreaViewport.removeEventListener('scroll', handleScroll)
    }
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    if (scrollAreaViewportRef.current) {
      scrollAreaViewportRef.current.scrollTop = scrollAreaViewportRef.current.scrollHeight
    }
  }

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
    <Card className="w-full h-full mx-auto relative bg-transparent">
      <CardHeader>
        <CardTitle>Chat Room: {currentRoom}</CardTitle>
      </CardHeader>
      <CardContent className="p-0 bg-transparent">
        <ScrollArea className="h-[65vh] w-full bg-transparent" ref={scrollAreaRef}>
          <div className="p-4" ref={scrollAreaViewportRef}>
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
      <CardFooter>
        <form onSubmit={handleSubmit} className="flex w-full items-center space-x-2 bg-white">
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