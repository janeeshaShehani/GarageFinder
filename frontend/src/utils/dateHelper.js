export const checkIsOpen = (openTime, closeTime, openDays) => {
  if (!openTime || !closeTime || !openDays || openDays.length === 0) {
    return false;
  }
  
  const now = new Date();
  
  // Get current day of the week in full string name (e.g. "Monday")
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const currentDay = dayNames[now.getDay()];
  
  // If today is not in the openDays list, the garage is closed
  if (!openDays.includes(currentDay)) {
    return false;
  }
  
  // Get current time as minutes from midnight
  const currentHours = now.getHours();
  const currentMinutes = now.getMinutes();
  const currentTimeVal = currentHours * 60 + currentMinutes;
  
  // Helper to parse "HH:MM" format into minutes
  const parseTimeToMinutes = (timeStr) => {
    if (!timeStr) return 0;
    const parts = timeStr.split(':');
    if (parts.length < 2) return 0;
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    return hours * 60 + minutes;
  };
  
  const openTimeVal = parseTimeToMinutes(openTime);
  const closeTimeVal = parseTimeToMinutes(closeTime);
  
  // Overnight operating hours support (e.g., open 22:00 to 06:00)
  if (closeTimeVal < openTimeVal) {
    return currentTimeVal >= openTimeVal || currentTimeVal <= closeTimeVal;
  }
  
  return currentTimeVal >= openTimeVal && currentTimeVal <= closeTimeVal;
};
