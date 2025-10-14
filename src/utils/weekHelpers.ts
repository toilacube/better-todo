/**
 * ISO Week utilities for Learning Tracker
 * Week format: "YYYY-Www" (e.g., "2025-W42")
 * ISO weeks start on Monday
 */

/**
 * Get ISO week number for a given date
 * @param date - Date object
 * @returns Week number (1-53)
 */
function getISOWeekNumber(date: Date): number {
  const target = new Date(date.valueOf());
  const dayNum = (date.getDay() + 6) % 7; // Make Monday = 0
  target.setDate(target.getDate() - dayNum + 3); // Set to nearest Thursday
  const firstThursday = new Date(target.getFullYear(), 0, 4);
  const diff = target.getTime() - firstThursday.getTime();
  const oneWeek = 7 * 24 * 60 * 60 * 1000;
  return 1 + Math.round(diff / oneWeek);
}

/**
 * Get ISO week year for a given date
 * (Can differ from calendar year near year boundaries)
 */
function getISOWeekYear(date: Date): number {
  const target = new Date(date.valueOf());
  const dayNum = (date.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNum + 3);
  return target.getFullYear();
}

/**
 * Get current week identifier
 * @returns Week string (e.g., "2025-W42")
 */
export function getCurrentWeekId(): string {
  return getWeekIdFromDate(new Date());
}

/**
 * Get week identifier for a specific date
 * @param date - Date object
 * @returns Week string (e.g., "2025-W42")
 */
export function getWeekIdFromDate(date: Date): string {
  const weekYear = getISOWeekYear(date);
  const weekNum = getISOWeekNumber(date);
  return `${weekYear}-W${String(weekNum).padStart(2, "0")}`;
}

/**
 * Get the Monday (start) of a given week
 * @param weekId - Week identifier (e.g., "2025-W42")
 * @returns Date object for Monday
 */
export function getWeekStartDate(weekId: string): Date {
  const [yearStr, weekStr] = weekId.split("-W");
  const year = parseInt(yearStr, 10);
  const week = parseInt(weekStr, 10);

  // ISO week 1 is the week with the first Thursday of the year
  const jan4 = new Date(year, 0, 4);
  const dayOfWeek = (jan4.getDay() + 6) % 7; // Make Monday = 0
  const weekOneMonday = new Date(jan4);
  weekOneMonday.setDate(jan4.getDate() - dayOfWeek);

  const monday = new Date(weekOneMonday);
  monday.setDate(weekOneMonday.getDate() + (week - 1) * 7);

  return monday;
}

/**
 * Get the Sunday (end) of a given week
 * @param weekId - Week identifier (e.g., "2025-W42")
 * @returns Date object for Sunday
 */
export function getWeekEndDate(weekId: string): Date {
  const monday = getWeekStartDate(weekId);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return sunday;
}

/**
 * Get week bounds as ISO date strings
 * @param weekId - Week identifier (e.g., "2025-W42")
 * @returns Object with start and end ISO date strings
 */
export function getWeekBounds(weekId: string): { start: string; end: string } {
  const startDate = getWeekStartDate(weekId);
  const endDate = getWeekEndDate(weekId);
  return {
    start: startDate.toISOString().split("T")[0],
    end: endDate.toISOString().split("T")[0],
  };
}

/**
 * Check if we've entered a new week since the last week ID
 * @param lastWeekId - Previous week identifier
 * @returns true if current week is different
 */
export function isNewWeek(lastWeekId: string): boolean {
  const currentWeekId = getCurrentWeekId();
  return currentWeekId !== lastWeekId;
}

/**
 * Format week ID for display
 * @param weekId - Week identifier (e.g., "2025-W42")
 * @returns Formatted string (e.g., "Week 42, 2025")
 */
export function formatWeekId(weekId: string): string {
  const [year, week] = weekId.split("-W");
  return `Week ${week}, ${year}`;
}

/**
 * Get week date range as display string
 * @param weekId - Week identifier (e.g., "2025-W42")
 * @returns Formatted string (e.g., "Oct 13 - Oct 19, 2025")
 */
export function getWeekDateRangeString(weekId: string): string {
  const startDate = getWeekStartDate(weekId);
  const endDate = getWeekEndDate(weekId);

  const startMonth = startDate.toLocaleDateString("en-US", { month: "short" });
  const endMonth = endDate.toLocaleDateString("en-US", { month: "short" });
  const startDay = startDate.getDate();
  const endDay = endDate.getDate();
  const year = endDate.getFullYear();

  if (startMonth === endMonth) {
    return `${startMonth} ${startDay} - ${endDay}, ${year}`;
  } else {
    return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${year}`;
  }
}

/**
 * Get full week display string
 * @param weekId - Week identifier (e.g., "2025-W42")
 * @returns Formatted string (e.g., "Week 42, 2025 (Oct 13 - Oct 19)")
 */
export function getWeekDisplayString(weekId: string): string {
  return `${formatWeekId(weekId)} (${getWeekDateRangeString(weekId)})`;
}

/**
 * Add weeks to a week identifier
 * @param weekId - Week identifier (e.g., "2025-W42")
 * @param weeks - Number of weeks to add (can be negative)
 * @returns New week identifier
 */
export function addWeeks(weekId: string, weeks: number): string {
  const monday = getWeekStartDate(weekId);
  monday.setDate(monday.getDate() + weeks * 7);
  return getWeekIdFromDate(monday);
}

/**
 * Get previous week identifier
 * @param weekId - Week identifier (e.g., "2025-W42")
 * @returns Previous week identifier
 */
export function getPreviousWeek(weekId: string): string {
  return addWeeks(weekId, -1);
}

/**
 * Get next week identifier
 * @param weekId - Week identifier (e.g., "2025-W42")
 * @returns Next week identifier
 */
export function getNextWeek(weekId: string): string {
  return addWeeks(weekId, 1);
}

/**
 * Get all week IDs between two weeks (inclusive)
 * @param startWeek - Start week identifier
 * @param endWeek - End week identifier
 * @returns Array of week identifiers
 */
export function getWeeksBetween(startWeek: string, endWeek: string): string[] {
  const weeks: string[] = [];
  let current = startWeek;

  while (current <= endWeek) {
    weeks.push(current);
    current = getNextWeek(current);
  }

  return weeks;
}

/**
 * Check if a week ID is in the future
 * @param weekId - Week identifier
 * @returns true if week is after current week
 */
export function isFutureWeek(weekId: string): boolean {
  return weekId > getCurrentWeekId();
}
