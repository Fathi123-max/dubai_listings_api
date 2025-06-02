import { formatDate } from '../formatDate.js';

describe('formatDate', () => {
  it('formats a date string correctly', () => {
    const date = '2023-04-01';
    const formatted = formatDate(date);
    expect(formatted).toMatch(/^April \d{1,2}, 2023$/);
  });

  it('handles Date objects', () => {
    const date = new Date('2023-04-01');
    const formatted = formatDate(date);
    expect(formatted).toMatch(/^April \d{1,2}, 2023$/);
  });
});
