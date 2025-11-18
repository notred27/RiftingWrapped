import { render, screen} from '@testing-library/react';

afterEach(() => {
  jest.clearAllTimers();
  jest.resetAllMocks();
});


jest.mock('../../resources/UserResourceContext.js', () => ({
  __esModule: true,
  useStatsResources: () => ({
    user: {
      read: () => ({
        displayName: 'Alice',
        tag: '1234',
        icon: 'avatar.png',
        level: 30,
      }),
    },
  }),
}));


import UserIntro from './UserIntro';

describe('UserIntro', () => {
  it('renders user info from useStatsResources', () => {
    render(<UserIntro year="2025" />);

    // Image src
    const img = screen.getByAltText('user icon');
    expect(img).toHaveAttribute('src', 'avatar.png');

    // Name
    const name = screen.getByText('Alice#1234');
    expect(name).toBeInTheDocument();

    // Level
    const level = screen.getByText('Level 30');
    expect(level).toBeInTheDocument();

    // Year in heading
    const heading = screen.getByText(/2025/);
    expect(heading).toBeInTheDocument();
  });
});
