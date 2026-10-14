// Run tests in a time zone with daylight saving so date math is exercised across DST changes.
module.exports = () => {
  process.env.TZ = 'America/New_York';
};
