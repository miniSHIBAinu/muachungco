import { describe, it, expect } from 'vitest';
import { formatCountdown, formatNumber, getProgressPercent } from './utils';

describe('Utility Functions', () => {
    it('formatNumber correctly formats currency', () => {
        expect(formatNumber(1000000)).toBe('1.000.000');
        expect(formatNumber(50000)).toBe('50.000');
    });

    it('getProgressPercent calculates percentage capped at 100', () => {
        const mockMilestones = [
            { id: 'm1', minParticipants: 10, discountPercent: 5 },
            { id: 'm2', minParticipants: 50, discountPercent: 20 }
        ];

        // Below max
        expect(getProgressPercent(25, mockMilestones)).toBe(50);
        // Above max
        expect(getProgressPercent(60, mockMilestones)).toBe(100);
    });

    it('formatCountdown correctly formats future dates', () => {
        // Add 1 extra second to avoid millisecond execution delay causing it to round down to 59 mins
        const oneHourLater = new Date(Date.now() + 3601 * 1000);
        const result = formatCountdown(oneHourLater);

        expect(result.hours).toBe('01');
        expect(result.minutes).toBe('00');
        expect(result.isUrgent).toBe(false);
    });
});
