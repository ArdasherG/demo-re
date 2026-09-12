import { describe, it, expect } from 'vitest';
import {
  calculateCurrentStreak,
  calculateBestStreak,
  calculateCompletionRate,
  getIsoDayOfWeek,
  addDays,
  formatDate
} from './calculations';
import { Habit } from '../types/habit';

describe('Habit Calculations', () => {
  const createTestHabit = (overrides?: Partial<Habit>): Habit => ({
    id: 'test-1',
    title: 'Ежедневное чтение',
    emoji: '📖',
    color: '#3B82F6',
    schedule: [1, 2, 3, 4, 5, 6, 7], // Every day
    order: 0,
    createdAt: '2026-09-01',
    completions: [],
    ...overrides
  });

  describe('Current Streak Calculation', () => {
    it('returns 0 when habit has no completions', () => {
      const habit = createTestHabit({ completions: [] });
      expect(calculateCurrentStreak(habit, '2026-09-12')).toBe(0);
    });

    it('returns 1 on the first day when completed today', () => {
      const habit = createTestHabit({
        createdAt: '2026-09-12',
        completions: ['2026-09-12']
      });
      expect(calculateCurrentStreak(habit, '2026-09-12')).toBe(1);
    });

    it('retains yesterday streak if today is scheduled but not yet marked', () => {
      // 2026-09-10 and 2026-09-11 marked. Today is 2026-09-12 (not yet marked)
      const habit = createTestHabit({
        createdAt: '2026-09-01',
        completions: ['2026-09-10', '2026-09-11']
      });
      expect(calculateCurrentStreak(habit, '2026-09-12')).toBe(2);
    });

    it('increments streak when today is marked', () => {
      const habit = createTestHabit({
        createdAt: '2026-09-01',
        completions: ['2026-09-10', '2026-09-11', '2026-09-12']
      });
      expect(calculateCurrentStreak(habit, '2026-09-12')).toBe(3);
    });

    it('breaks streak when a previous scheduled day is missed', () => {
      // Missed 2026-09-10
      const habit = createTestHabit({
        createdAt: '2026-09-01',
        completions: ['2026-09-08', '2026-09-09', '2026-09-11', '2026-09-12']
      });
      // 10 was missed, so streak is 11 and 12 = 2
      expect(calculateCurrentStreak(habit, '2026-09-12')).toBe(2);
    });

    it('does NOT break streak for unscheduled days (e.g. Mon, Wed, Fri schedule)', () => {
      // 2026-09-07 is Monday (1)
      // 2026-09-08 is Tuesday (2) - unscheduled
      // 2026-09-09 is Wednesday (3)
      // 2026-09-10 is Thursday (4) - unscheduled
      // 2026-09-11 is Friday (5)
      // 2026-09-12 is Saturday (6) - unscheduled
      const habit = createTestHabit({
        schedule: [1, 3, 5], // Mon, Wed, Fri
        createdAt: '2026-09-01',
        completions: ['2026-09-07', '2026-09-09', '2026-09-11']
      });

      // Today is Saturday (not scheduled)
      expect(calculateCurrentStreak(habit, '2026-09-12')).toBe(3);

      // Now suppose next Monday (2026-09-14) is marked
      habit.completions.push('2026-09-14');
      expect(calculateCurrentStreak(habit, '2026-09-14')).toBe(4);
    });

    it('correctly calculates streak across month boundary', () => {
      // Transition from August to September
      const habit = createTestHabit({
        createdAt: '2026-08-25',
        completions: ['2026-08-30', '2026-08-31', '2026-09-01', '2026-09-02']
      });
      expect(calculateCurrentStreak(habit, '2026-09-02')).toBe(4);
    });

    it('correctly calculates streak across leap year (February 2024)', () => {
      // 2024 is a leap year with Feb 29
      const habit = createTestHabit({
        createdAt: '2024-02-25',
        completions: ['2024-02-27', '2024-02-28', '2024-02-29', '2024-03-01']
      });
      expect(calculateCurrentStreak(habit, '2024-03-01')).toBe(4);
    });
  });

  describe('Best Streak Calculation', () => {
    it('calculates historical best streak accurately', () => {
      const habit = createTestHabit({
        createdAt: '2026-09-01',
        completions: [
          '2026-09-01', '2026-09-02', '2026-09-03', '2026-09-04', '2026-09-05', // 5 days run
          // missed 06
          '2026-09-07', '2026-09-08' // 2 days current run
        ]
      });
      expect(calculateCurrentStreak(habit, '2026-09-08')).toBe(2);
      expect(calculateBestStreak(habit, '2026-09-08')).toBe(5);
    });
  });

  describe('Completion Rate Calculation', () => {
    it('returns 0 when no applicable days or no completions', () => {
      const habit = createTestHabit({ completions: [] });
      expect(calculateCompletionRate(habit, '2026-09-12', 30)).toBe(0);
    });

    it('calculates 100% when all scheduled days are completed', () => {
      const completions: string[] = [];
      for (let i = 0; i < 10; i++) {
        completions.push(addDays('2026-09-01', i));
      }
      const habit = createTestHabit({
        createdAt: '2026-09-01',
        completions
      });
      // 10 scheduled days completed out of 10
      expect(calculateCompletionRate(habit, '2026-09-10', 30)).toBe(100);
    });

    it('calculates percentage accurately for partial completion', () => {
      // 5 completions out of 10 days since creation = 50%
      const completions = [
        '2026-09-01', '2026-09-03', '2026-09-05', '2026-09-07', '2026-09-09'
      ];
      const habit = createTestHabit({
        createdAt: '2026-09-01',
        completions
      });
      expect(calculateCompletionRate(habit, '2026-09-10', 30)).toBe(50);
    });
  });

  describe('Date Helpers', () => {
    it('identifies ISO days of week correctly (Mon=1, Sun=7)', () => {
      expect(getIsoDayOfWeek('2026-09-07')).toBe(1); // Monday
      expect(getIsoDayOfWeek('2026-09-11')).toBe(5); // Friday
      expect(getIsoDayOfWeek('2026-09-12')).toBe(6); // Saturday
      expect(getIsoDayOfWeek('2026-09-13')).toBe(7); // Sunday
    });
  });
});
