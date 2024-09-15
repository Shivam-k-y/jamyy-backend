import socketio

# Create a Socket.IO client instance
sio = socketio.Client()

# Event when connected to the server
@sio.event
def connect():
    print('Connection established')

# Event when receiving a message from the server
@sio.event
def message(data):
    print(f"Received message: {data}")

# Event when disconnected from the server
@sio.event
def disconnect():
    print('Disconnected from server')

if __name__ == '__main__':
    # Connect to the Socket.IO server
    sio.connect('http://127.0.0.1:5000')

    # Chat loop
    while True:
        msg = input("Enter message: ")
        sio.send(msg)
        if msg.lower() == 'exit':
            break

    sio.disconnect()
