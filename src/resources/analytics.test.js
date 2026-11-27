import { trackReturnVisit } from './analytics.js';

const DAY = 86400000;
const START = 1700000000000;

beforeEach(() => {
	localStorage.clear();
	window.gtag = jest.fn();
});

test('first visit and same-session reloads are not return visits', () => {
	trackReturnVisit(START);
	trackReturnVisit(START + DAY / 4);
	expect(window.gtag).not.toHaveBeenCalled();
});

test('coming back after the session gap reports days away', () => {
	trackReturnVisit(START);
	trackReturnVisit(START + 3 * DAY);
	expect(window.gtag).toHaveBeenCalledWith('event', 'return_visit', { days_since_last: 3 });
});
