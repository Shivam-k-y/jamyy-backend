import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ChatRoom from '../../components/ChatRoom';

const mockSocket = {
  emit: jest.fn(),
  on: jest.fn(),
  off: jest.fn(),
  id: 'test-socket-id',
};

describe('ChatRoom Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders message input and send button', () => {
    render(<ChatRoom Socket={mockSocket} currentRoom="test-room" />);
    expect(screen.getByPlaceholderText('Chat')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Send' })).toBeInTheDocument();
  });

  test('emits message when form is submitted', () => {
    render(<ChatRoom Socket={mockSocket} currentRoom="test-room" />);
    const input = screen.getByPlaceholderText('Chat');
    const sendButton = screen.getByRole('button', { name: 'Send' });

    fireEvent.change(input, { target: { value: 'Hello, world!' } });
    fireEvent.click(sendButton);

    expect(mockSocket.emit).toHaveBeenCalledWith('message', {
      room: 'test-room',
      message: 'Hello, world!',
    });
    expect(input.value).toBe('');
  });

  test('adds new message to the list when received', () => {
    render(<ChatRoom Socket={mockSocket} currentRoom="test-room" />);
    
    // Simulate receiving a message
    const messageHandler = mockSocket.on.mock.calls.find(call => call[0] === 'message')[1];
    messageHandler({ msg: 'Test message', socketId: 'other-socket-id' });

    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  test('cleans up socket listener on unmount', () => {
    const { unmount } = render(<ChatRoom Socket={mockSocket} currentRoom="test-room" />);
    unmount();
    expect(mockSocket.off).toHaveBeenCalledWith('message');
  });
});