import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import ChatRoom from './components/ChatRoom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription } from "@/components/ui/alert-dialog";
import { UserIcon, Users, AlertTriangle } from "lucide-react";
import axios from 'axios';

function App() {
  const [currentRoom, setCurrentRoom] = useState('');
  const [showRoomForm, setShowRoomForm] = useState(true);
  const [userCount, setUserCount] = useState(0);
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [roomInput, setRoomInput] = useState('');
  const [isBanned, setIsBanned] = useState(false);
  const [banMessage, setBanMessage] = useState('');
  const [showBanAlert, setShowBanAlert] = useState(false);

  const [Socket, setSocket] = useState(null);

  useEffect(() => {
    const initializeSocket = async () => {
      try {
        // Fetch token from the server or cookies
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/generate-token`, { withCredentials: true });
        const token = response.data.token;

        // Establish the socket connection with the token in the handshake auth
        const newSocket = io(import.meta.env.VITE_API_URL, {
          withCredentials: true,
        });

        setSocket(newSocket);

        newSocket.on('newUserconnect', ({ message, user }) => {
          if (message) {
            setWelcomeMessage(message);
          }
          if (user !== undefined) {
            setTimeout(() => {
              setUserCount(user);
            }, 2000);
          }
        });

        newSocket.on('banned', ({ message }) => {
          setIsBanned(true);
          setBanMessage(message);
          setShowRoomForm(true);
          setCurrentRoom('');
          setShowBanAlert(true);
        });

        return () => {
          newSocket.off('newUserconnect');
          newSocket.off('banned');
        };
      } catch (error) {
        console.error('Error initializing socket:', error);
      }
    };

    initializeSocket();
  }, []);

  const handleJoinRoom = () => {
    if (roomInput.trim() === 'adavya' && Socket) {
      Socket.emit('joinRoom', roomInput.trim());
      setCurrentRoom(roomInput.trim());
      setShowRoomForm(false);
      setIsBanned(false);
      setBanMessage('');
    } else {
      alert('Invalid Room Name');
      setRoomInput('');
    }
  };

  return (
    <div className="min-h-screen bg-transparent flex items-center justify-center p-4">
      <Card className="w-full max-w-7xl bg-white bg-opacity-10 backdrop-blur-lg shadow-lg border border-white border-opacity-20">
        <CardHeader >
          <CardTitle className="text-sm font-bold text-center">Anonymous Chat of IIITK</CardTitle>
          <CardDescription className=" text-sm  text-center ">Connect and chat in real-time</CardDescription>
        </CardHeader>
        <CardContent>
          {showRoomForm ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="roomInput">Room Name for today is <span className='font-bold underline'>{`${import.meta.env.VITE_ROOM_NAME}`}</span></Label>
                <Input
                  id="roomInput"
                  placeholder="Enter room name"
                  className="bg-white"
                  value={roomInput}
                  onChange={(e) => setRoomInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleJoinRoom();
                    }
                  }}
                />
              </div>
              <Button className="w-full" onClick={handleJoinRoom}>
                Join/Create Room
              </Button>
            </div>
          ) : (
            <>
              <Alert className="pd-4">
                <UserIcon className="h-4 w-4" />
                <AlertTitle>Welcome!</AlertTitle>
                <AlertDescription>{welcomeMessage}</AlertDescription>
              </Alert>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-blue-500" />
                  <span className="font-medium">Current Users: {userCount}</span>
                </div>
                <span className="text-sm text-gray-500">Room: {currentRoom}</span>
              </div>
              <ChatRoom Socket={Socket} currentRoom={currentRoom} />
            </>
          )}
        </CardContent>
        <CardFooter className="text-center text-sm text-gray-500">
          &copy; 2024 Anonymous Chat-IIITK. All rights reserved.
        </CardFooter>
      </Card>

      <AlertDialog open={showBanAlert} onOpenChange={setShowBanAlert}>
        <AlertDialogContent className="bg-red-500 text-white animate-zoom-expand">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-bold flex items-center">
              <AlertTriangle className="mr-2" /> You've been banned
            </AlertDialogTitle>
            <AlertDialogDescription className="text-white text-lg">
              {banMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
        </AlertDialogContent>
      </AlertDialog>

      <style jsx global>{`
        @keyframes zoomExpand {
          0% {
            transform: scale(0.5);
            opacity: 0;
          }
          70% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-zoom-expand {
          animation: zoomExpand 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

export default App;
