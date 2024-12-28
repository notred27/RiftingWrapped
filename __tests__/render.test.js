import React from 'react';  // Only needed for React < 17
import { render, screen } from '@testing-library/react';
import RiftRecap from '../src/RiftRecap';

test('renders RiftRecap component', () => {
  render(<RiftRecap />);
  expect(screen.getByText(/Rift-Recap isn't endorsed by Riot Games and/i)).toBeInTheDocument();
});