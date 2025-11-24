import { render, screen} from '@testing-library/react';

let mockMode = 'success';

jest.mock('../../resources/UserResourceContext.js', () => ({
  __esModule: true,
  useStatsResources: () => {
    if (mockMode === 'error') {
      return { user: { read: () => { throw new Error('boom') } } };
    }
    return {
      user: { read: () => ({ displayName: 'Alice', tag: '1234', icon: 'avatar.png', level: 30 }) },
    };
  },
}));

import UserIntro from './UserIntro';

afterEach(() => {
  mockMode = 'success';
  jest.resetAllMocks();
});

it('API success', () => {
  mockMode = 'success';
  render(<UserIntro year="2025" />);
  expect(screen.getByText('Alice#1234')).toBeInTheDocument();
});

it('API 404/500 error', () => {
  mockMode = 'error';
  render(<UserIntro year="2025" />);
  expect(screen.getByText('Failed to load user.')).toBeInTheDocument();
});