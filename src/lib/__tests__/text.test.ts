import { plural } from '@/lib/text';

describe('plural', () => {
  it('uses the singular only for exactly one', () => {
    expect(plural(1, 'place')).toBe('1 place');
    expect(plural(0, 'place')).toBe('0 places');
    expect(plural(7, 'day')).toBe('7 days');
    expect(plural(2, 'person', 'people')).toBe('2 people');
  });
});
