# Jamyy - Synchronized Listening Rooms

Jamyy is a service that allows users to create private listening rooms using the Spotify API. Users can invite friends by sharing a unique room code. The host controls the music playback, manages the queue, and can grant participants access to control the music player and queue. All participants in the room hear the song in perfect sync with the host. Additionally, users can chat while listening to music together, making it an interactive and social experience.

## Features

- **Create Listening Rooms**: Users can create private listening rooms and share room codes with friends.
- **Synchronized Playback**: Music playback is synced across all participants' devices, following the host’s player controls (play, pause, skip, seek).
- **Music Queue Management**: Hosts can manage the music queue and grant participants permission to add/remove songs from the queue.
- **Access Control**: Hosts control which participants can access the music player and queue.
- **In-Room Chat**: Participants can chat with each other while listening to music, enhancing the social experience.

## How It Works

1. **Room Creation**: A user creates a room, and a unique room code is generated. This code can be shared with friends who wish to join the room.
2. **Spotify API Integration**: Jamyy integrates with Spotify’s API to control playback, retrieve song information, and manage the user’s music library.
3. **Synchronized Playback**: Jamyy ensures that all participants listen to the same track in sync with the host. When the host seeks, skips, or pauses the track, the same action is mirrored for all participants.
4. **Role Management**: The host can grant and revoke participants' access to control the music player and manage the queue.
5. **Chat Functionality**: Participants can communicate with each other via a real-time chat feature integrated into each room.

## Tech Stack

- **Frontend**: 
  - React.js for building the user interface.
  - Tailwind CSS for styling.
  - WebSockets for real-time chat and event updates.
  
- **Backend**: 
  - Node.js with Express.js to handle API requests and WebSocket communication.
  - FastAPI for handling real-time interactions with the Spotify API.
  
- **Spotify API**: 
  - Integration with the Spotify Web API for music playback and user authentication.
  
- **Database**: 
  - MongoDB for storing user data, room details, and chat history.
  
- **Authentication**:
  - OAuth 2.0 with Spotify for user authentication and authorization.
  
- **Deployment**: 
  - Hosted on Render for both frontend and backend services.

## Installation

1. Clone the repository:

```bash
git clone https://github.com/sarthakg043/jamyy-backend
```

2. Navigate to the project directory:

```bash
cd jamyy
```

3. Install the necessary dependencies:

```bash
npm install
```

4. Set up your environment variables by creating a `.env` file in the root directory and adding your Spotify API credentials:

```bash
SPOTIFY_CLIENT_ID=your_client_id
SPOTIFY_CLIENT_SECRET=your_client_secret
REDIRECT_URI=http://localhost:3000/callback
```

5. Start the development server:

```bash
npm run dev
```

6. Open your browser and navigate to `http://localhost:3000`.

## Usage

1. **Login**: Users log in using their Spotify account via OAuth.
2. **Create a Room**: The host creates a room and receives a unique room code.
3. **Join a Room**: Participants enter the room code to join the listening session.
4. **Control Playback**: The host controls playback, while participants can interact with the chat and potentially manage the queue, depending on permissions.
5. **Chat**: Participants can chat while listening to music in sync with the host.

## Future Improvements

- Adding support for more music services (Apple Music, YouTube).
- Implementing more advanced room management features like voting on the next song.
- Expanding chat features with emojis, reactions, and GIF support.

## License

This project is licensed under the MIT License.

---

Feel free to modify the sections based on any additional details or features you plan to implement in Jamyy!