import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';
import ChatRoom from './components/ChatRoom';

// Mock socket.io-client
jest.mock('socket.io-client', () => {
  const emit = jest.fn();
  const on = jest.fn();
  const off = jest.fn();
  return jest.fn(() => ({
    emit,
    on,
    off,
    id: 'test-socket-id',
  }));
});

describe('App Component', () => {
  test('renders without crashing', () => {
    render(<App />);
    expect(screen.getByText('Socket.IO Chat')).toBeInTheDocument();
  });

  test('shows room form initially', () => {
    render(<App />);
    expect(screen.getByPlaceholderText('Enter room name')).toBeInTheDocument();
    expect(screen.getByText('Join/Create Room')).toBeInTheDocument();
  });

  test('joins a room when form is submitted', async () => {
    render(<App />);
    const input = screen.getByPlaceholderText('Enter room name');
    const button = screen.getByText('Join/Create Room');

    fireEvent.change(input, { target: { value: 'test-room' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.queryByText('Join/Create Room')).not.toBeInTheDocument();
      expect(screen.getByText('Current Users: 0')).toBeInTheDocument();
    });
  });
});

describe('ChatRoom Component', () => {
  const mockSocket = {
    emit: jest.fn(),
    on: jest.fn(),
    off: jest.fn(),
    id: 'test-socket-id',
  };

  test('renders message input and send button', () => {
    render(<ChatRoom Socket={mockSocket} currentRoom="test-room" />);
    expect(screen.getByPlaceholderText('Chat')).toBeInTheDocument();
    expect(screen.getByText('Send')).toBeInTheDocument();
  });

  test('emits message when form is submitted', () => {
    render(<ChatRoom Socket={mockSocket} currentRoom="test-room" />);
    const input = screen.getByPlaceholderText('Chat');
    const form = screen.getByRole('form');

    fireEvent.change(input, { target: { value: 'Hello, world!' } });
    fireEvent.submit(form);

    expect(mockSocket.emit).toHaveBeenCalledWith('message', {
      room: 'test-room',
      message: 'Hello, world!',
    });
    expect(input.value).toBe('');
  });

  test('displays received messages', () => {
    render(<ChatRoom Socket={mockSocket} currentRoom="test-room" />);
    
    // Simulate receiving a message
    const messageHandler = mockSocket.on.mock.calls.find(call => call[0] === 'message')[1];
    messageHandler({ msg: 'Test message', socketId: 'other-socket-id' });

    expect(screen.getByText('Test message')).toBeInTheDocument();
    expect(screen.getByText('(ID: other-socket-id)')).toBeInTheDocument();
  });
});