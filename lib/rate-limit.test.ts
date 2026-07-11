import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { isAllowed } from "./rate-limit";

describe("isAllowed", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("allows requests up to the limit within the window", () => {
    const key = `test-${Math.random()}`;
    expect(isAllowed(key, 3, 1000)).toBe(true);
    expect(isAllowed(key, 3, 1000)).toBe(true);
    expect(isAllowed(key, 3, 1000)).toBe(true);
  });

  it("rejects requests once the limit is reached", () => {
    const key = `test-${Math.random()}`;
    isAllowed(key, 2, 1000);
    isAllowed(key, 2, 1000);
    expect(isAllowed(key, 2, 1000)).toBe(false);
  });

  it("resets after the window elapses", () => {
    const key = `test-${Math.random()}`;
    isAllowed(key, 1, 1000);
    expect(isAllowed(key, 1, 1000)).toBe(false);

    vi.advanceTimersByTime(1001);

    expect(isAllowed(key, 1, 1000)).toBe(true);
  });

  it("tracks separate keys independently", () => {
    const keyA = `test-a-${Math.random()}`;
    const keyB = `test-b-${Math.random()}`;
    isAllowed(keyA, 1, 1000);
    expect(isAllowed(keyA, 1, 1000)).toBe(false);
    expect(isAllowed(keyB, 1, 1000)).toBe(true);
  });
});
