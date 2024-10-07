import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import ChatRoom from './components/ChatRoom';
// import axios from 'axios';
import './App.css';

const Socket = io(import.meta.env.VITE_API_URL);

function App() {
  const [currentRoom, setCurrentRoom] = useState('');
  const [showRoomForm, setShowRoomForm] = useState(true);
  const [userCount, setUserCount] = useState(0);
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [token, setToken] = useState('');

  // I don't know how to use it from client side to backend side

  // const handleGetToken = async () => {
  //   try {
  //     const response = await axios.get('http://localhost:3000/generate-token');
  //     setToken(response.data.token);
  //     console.log('JWT Token:', response.data.token);
  //   } catch (error) {
  //     console.error('Error fetching token:', error);
  //   }
  // };



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
    Socket.emit('joinRoom', roomName);
    setCurrentRoom(roomName);
    setShowRoomForm(false);
  };

  // Decide what to display when token generation occur.
  // <div className="App">
  //     <h1>Socket.IO Chat</h1>
  //     <button onClick={handleGetToken}>Get JWT Token</button>
  //     {token && <p>Your token: {token}</p>}
  //   </div>

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