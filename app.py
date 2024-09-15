import socketio
import eventlet
from flask import Flask

# Create a Socket.IO server instance
sio = socketio.Server()
app = Flask(__name__)

# Attach the Socket.IO server to the Flask app
@app.route('/')
def index():
    return "Socket.IO Chat Server is Running"

# Event when a client connects
@sio.event
def connect(sid, environ):
    print(f"Client {sid} connected.")
    sio.emit('message', f"Welcome Client {sid}", to=sid)

# Event when a message is received from the client
@sio.event
def message(sid, data):
    print(f"Message from {sid}: {data}")
    # Broadcast the message to all connected clients
    sio.emit('message', f"{sid}: {data}")

# Event when a client disconnects
@sio.event
def disconnect(sid):
    print(f"Client {sid} disconnected.")

# Wrap Flask app with Socket.IO middleware
app = socketio.WSGIApp(sio, app)

if __name__ == '__main__':
    # Use eventlet to run the server
    eventlet.wsgi.server(eventlet.listen(('localhost', 5000)), app)
