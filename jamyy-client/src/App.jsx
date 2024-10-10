import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import ChatRoom from './components/ChatRoom';
import './App.css';

const Socket = io(import.meta.env.VITE_API_URL);

function App() {
  const [currentRoom, setCurrentRoom] = useState('');
  const [showRoomForm, setShowRoomForm] = useState(true);
  const [userCount, setUserCount] = useState(0);
  const [welcomeMessage, setWelcomeMessage] = useState('');

  useEffect(() => {
    Socket.on('newUserconnect', ({ message, user }) => {
      if (message) {
        setWelcomeMessage(message);
      }
      if (user !== undefined) {
        setTimeout(() => {
          setUserCount(user);
        }, 2000);
      }
    });

    return () => {
      Socket.off('newUserconnect');
    };
  }, []);

  const handleJoinRoom = (roomName) => {
    if (roomName === 'adavya') {
      Socket.emit('joinRoom', roomName);
    }
    else {
      alert('Invalid Room Name');
      document.getElementById('roomInput').value = '';
      return;
    }

    setCurrentRoom(roomName);
    setShowRoomForm(false);
  };
  
  return (
    <div className="App">
      <h1>Socket.IO Chat</h1>
      {showRoomForm ? (
        <div className="room-form">
          <input
            id="roomInput"
            placeholder="Enter room name"
          />
          <button onClick={() => handleJoinRoom(document.getElementById('roomInput').value.trim())}>
            Join/Create Room
          </button>
        </div>
      ) : (
        <>
          <div id="usercount">Current Users: {userCount}</div>
          <div id="welcomeMessage">{welcomeMessage}</div>
          <ChatRoom Socket={Socket} currentRoom={currentRoom} />
        </>
      )}
    </div>
  );
}

export default App;