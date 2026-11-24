import { project, rubberband, pickTarget } from './SlideDeck.js';

const W = 400;

test('momentum projection matches scroll deceleration', () => {
    expect(project(0)).toBe(0);
    expect(project(1000)).toBeCloseTo(499, 0);
    expect(project(-1000)).toBeCloseTo(-499, 0);
});

test('rubberband resists more the further past the edge', () => {
    expect(rubberband(0, W)).toBe(0);
    expect(rubberband(100, W)).toBeLessThan(100);
    expect(rubberband(400, W) - rubberband(300, W)).toBeLessThan(rubberband(100, W));
    expect(rubberband(-100, W)).toBeCloseTo(-rubberband(100, W));
});

test('release target', () => {
    // Slow short drag snaps back; long drag commits.
    expect(pickTarget(-1 * W - 40, 0, W, 1, 5)).toBe(1);
    expect(pickTarget(-1 * W - 250, 0, W, 1, 5)).toBe(2);
    // A short fast flick commits in its direction.
    expect(pickTarget(-1 * W - 30, -800, W, 1, 5)).toBe(2);
    expect(pickTarget(-1 * W + 30, 800, W, 1, 5)).toBe(0);
    // A huge flick still only moves one slide, and never past the ends.
    expect(pickTarget(-1 * W, -20000, W, 1, 5)).toBe(2);
    expect(pickTarget(0, 5000, W, 0, 5)).toBe(0);
    expect(pickTarget(-5 * W, -5000, W, 5, 5)).toBe(5);
});
