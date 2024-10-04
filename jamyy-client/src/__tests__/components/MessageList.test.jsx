import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import MessageList from '../../components/MessageList';

describe('MessageList Component', () => {
  const mockMessages = [
    { msg: 'Hello', socketId: 'user1' },
    { msg: 'Hi there', socketId: 'user2' },
    { msg: 'How are you?', socketId: 'user1' },
  ];

  test('renders messages correctly', () => {
    render(<MessageList messages={mockMessages} currentUserId="user1" />);

    expect(screen.getByText('Hello')).toBeInTheDocument();
    expect(screen.getByText('Hi there')).toBeInTheDocument();
    expect(screen.getByText('How are you?')).toBeInTheDocument();
  });

  test('applies correct classes for current user and other users', () => {
    render(<MessageList messages={mockMessages} currentUserId="user1" />);

    const messageItems = screen.getAllByRole('listitem');
    expect(messageItems[0]).toHaveClass('my-message');
    expect(messageItems[1]).toHaveClass('other-message');
    expect(messageItems[2]).toHaveClass('my-message');
  });

  test('displays socket IDs correctly', () => {
    render(<MessageList messages={mockMessages} currentUserId="user1" />);

    expect(screen.getByText('(ID: user1)')).toBeInTheDocument();
    expect(screen.getByText('(ID: user2)')).toBeInTheDocument();
  });

  test('renders empty list when no messages', () => {
    render(<MessageList messages={[]} currentUserId="user1" />);
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
  });
});