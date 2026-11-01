import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

let mockMode = 'success';

jest.mock('../../resources/UserResourceContext.js', () => ({
  __esModule: true,
  useStatsResources: () => {
    if (mockMode === 'error') {
      return { user: { read: () => { throw Object.assign(new Error('boom'), { status: 500 }) } } };
    }
    if (mockMode === 'empty') {
      return { user: { read: () => { throw Object.assign(new Error('no data'), { status: 404 }) } } };
    }
    return {
      user: { read: () => ({ displayName: 'Alice', tag: '1234', icon: 'avatar.png', level: 30 }) },
    };
  },
}));

jest.mock('../../resources/analytics.js', () => ({
  __esModule: true,
  trackEvent: jest.fn(),
}));

import UserIntro from './UserIntro';
import ErrorBoundary from '../error/ErrorBoundary.js';
import StatDisplayError from '../error/StatDisplayError.js';

/**
 * Mirrors how SlideDeck actually mounts a slide: inside an ErrorBoundary whose
 * fallback is StatDisplayError. Rendering UserIntro bare would just let the
 * thrown error escape, which tests nothing a user would ever see.
 */
function renderSlide() {
  return render(
    <MemoryRouter>
      <ErrorBoundary fallback={(err) => <StatDisplayError error={err} />}>
        <UserIntro year="2025" />
      </ErrorBoundary>
    </MemoryRouter>
  );
}

afterEach(() => {
  mockMode = 'success';
  jest.clearAllMocks();
});

it('renders the player name when the user resource resolves', () => {
  mockMode = 'success';
  renderSlide();
  expect(screen.getByText('Alice#1234')).toBeInTheDocument();
});

it('shows the error fallback when the user resource fails', () => {
  mockMode = 'error';
  renderSlide();
  expect(screen.getByText("We couldn't load this stat")).toBeInTheDocument();
});

it('shows the empty state rather than an error when there is no data', () => {
  mockMode = 'empty';
  renderSlide();
  expect(screen.getByText('Nothing to show here')).toBeInTheDocument();
});
