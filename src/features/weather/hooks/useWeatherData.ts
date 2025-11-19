export function useWeatherData() {
  const data = {
    temperature: 34,
    humidity: 74,
    minTemp: 28,
    feelLike: 35,
    windSpeed: 19,
    visibility: 10,

    forecastHourly: [
      { time: 'Now', temp: 34, icon: '🌤' },
      { time: '14:00', temp: 33, icon: '🌤' },
      { time: '15:00', temp: 33, icon: '🌤' },
      { time: '16:00', temp: 32, icon: '🌥' },
      { time: '17:00', temp: 30, icon: '🌥' },
    ],

    forecastWeekly: [
      { day: 'MON', temp: 34, icon: '🌤' },
      { day: 'TUE', temp: 33, icon: '🌤' },
      { day: 'WED', temp: 32, icon: '🌤' },
      { day: 'THU', temp: 29, icon: '🌧' },
      { day: 'FRI', temp: 30, icon: '🌧' },
      { day: 'SAT', temp: 31, icon: '🌤' },
      { day: 'SUN', temp: 32, icon: '🌤' },
    ],

    warning: 'Storm Warning',
    warningDetail: 'Possibility 80% and 70% to have flood',
  };

  return { data };
}
