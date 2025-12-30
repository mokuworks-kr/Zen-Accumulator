export const formatDuration = (totalMinutes: number): { major: string, label: string } => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  // Pad hours and minutes with '0' to ensure they are at least 2 digits (e.g., "00h 05m", "01h 30m")
  const hoursStr = String(hours).padStart(2, '0');
  const minutesStr = String(minutes).padStart(2, '0');

  return {
    major: `${hoursStr}h ${minutesStr}m`,
    label: 'accumulated'
  };
};

// Key for local storage
export const STORAGE_KEY = 'zen_accumulator_data_v1';