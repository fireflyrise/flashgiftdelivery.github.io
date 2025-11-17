import { addHours, addMinutes, format, isAfter, isBefore, setHours, setMinutes, startOfDay, addDays } from 'date-fns';
import { DELIVERY_HOURS } from './constants';

export type TimeSlot = {
  value: string;
  label: string;
  datetime: Date;
};

/**
 * Generates available delivery time slots based on current time
 * Earliest: 2 hours from now, rounded to nearest 30 minutes
 * Latest: Closing time - 2 hours
 */
export function getAvailableTimeSlots(): {
  todaySlots: TimeSlot[];
  tomorrowSlots: TimeSlot[];
} {
  const now = new Date();
  const currentHour = now.getHours();
  const twoHoursFromNow = addHours(now, DELIVERY_HOURS.deliveryBuffer);

  // Store opening and closing times for today
  const openingTime = setMinutes(setHours(now, DELIVERY_HOURS.open), 0);
  const closingTime = setMinutes(setHours(now, DELIVERY_HOURS.close), 0);
  const lastDeliveryToday = closingTime; // Last delivery slot is at closing time

  const todaySlots: TimeSlot[] = [];
  const tomorrowSlots: TimeSlot[] = [];

  // If before opening time (midnight to 8 AM), generate today's slots starting at opening time
  if (currentHour < DELIVERY_HOURS.open) {
    let currentSlot = openingTime;
    while (isBefore(currentSlot, lastDeliveryToday) || currentSlot.getTime() === lastDeliveryToday.getTime()) {
      todaySlots.push({
        value: format(currentSlot, 'yyyy-MM-dd HH:mm'),
        label: format(currentSlot, 'h:mm a'),
        datetime: currentSlot,
      });
      currentSlot = addMinutes(currentSlot, 60);
    }
  }
  // If during business hours, generate remaining today's slots
  else if (currentHour >= DELIVERY_HOURS.open && currentHour < (DELIVERY_HOURS.close - DELIVERY_HOURS.deliveryBuffer)) {
    // Round up to next hour
    const earliestSlot = setMinutes(addHours(twoHoursFromNow, 1), 0);

    // Generate today's slots
    let currentSlot = earliestSlot;
    while (isBefore(currentSlot, lastDeliveryToday) || currentSlot.getTime() === lastDeliveryToday.getTime()) {
      todaySlots.push({
        value: format(currentSlot, 'yyyy-MM-dd HH:mm'),
        label: format(currentSlot, 'h:mm a'),
        datetime: currentSlot,
      });
      currentSlot = addMinutes(currentSlot, 60);
    }
  }

  // Always generate tomorrow's slots (actual next calendar day)
  const tomorrow = addDays(startOfDay(now), 1);
  const tomorrowOpen = setMinutes(setHours(tomorrow, DELIVERY_HOURS.open), 0);
  const tomorrowClose = setMinutes(setHours(tomorrow, DELIVERY_HOURS.close), 0);
  const tomorrowLastDelivery = tomorrowClose; // Last delivery slot is at closing time

  let currentSlot = tomorrowOpen;
  while (isBefore(currentSlot, tomorrowLastDelivery) || currentSlot.getTime() === tomorrowLastDelivery.getTime()) {
    tomorrowSlots.push({
      value: format(currentSlot, 'yyyy-MM-dd HH:mm'),
      label: format(currentSlot, 'h:mm a'),
      datetime: currentSlot,
    });
    currentSlot = addMinutes(currentSlot, 60);
  }

  return { todaySlots, tomorrowSlots };
}

/**
 * Calculate countdown to next delivery cutoff
 * Returns time remaining in milliseconds until next order cutoff
 * If past today's cutoff, returns time until tomorrow's cutoff
 */
export function getTimeUntilCutoff(): number {
  const now = new Date();
  const closingTime = setMinutes(setHours(now, DELIVERY_HOURS.close), 0);
  const lastOrderTime = addHours(closingTime, -DELIVERY_HOURS.deliveryBuffer);

  // If past today's cutoff, calculate time until tomorrow's cutoff
  if (isAfter(now, lastOrderTime)) {
    const tomorrow = addDays(startOfDay(now), 1);
    const tomorrowClosing = setMinutes(setHours(tomorrow, DELIVERY_HOURS.close), 0);
    const tomorrowCutoff = addHours(tomorrowClosing, -DELIVERY_HOURS.deliveryBuffer);
    return tomorrowCutoff.getTime() - now.getTime();
  }

  return lastOrderTime.getTime() - now.getTime();
}

/**
 * Format milliseconds to HH:MM:SS countdown format
 */
export function formatCountdown(milliseconds: number): string {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Get the earliest available delivery time display text
 * Returns the time 2 hours from now if store is open, or tomorrow's first slot if closed
 */
export function getEarliestDeliveryDisplay(): string {
  const now = new Date();
  const currentHour = now.getHours();
  const closingTime = DELIVERY_HOURS.close;
  const lastOrderHour = closingTime - DELIVERY_HOURS.deliveryBuffer;

  // If past last order time or before opening, show tomorrow
  if (currentHour >= lastOrderHour || currentHour < DELIVERY_HOURS.open) {
    const tomorrow = addDays(startOfDay(now), 1);
    const tomorrowOpen = setMinutes(setHours(tomorrow, DELIVERY_HOURS.open), 0);
    return format(tomorrowOpen, 'h:mm a') + ' tomorrow';
  }

  // Store is open, show 2 hours from now
  const twoHoursFromNow = addHours(now, DELIVERY_HOURS.deliveryBuffer);
  return format(twoHoursFromNow, 'h:mm a');
}

/**
 * Get the next delivery window opening time
 * Returns formatted string like "tomorrow at 8:00 AM" or "today at 8:00 AM"
 */
export function getNextDeliveryTime(): string {
  const now = new Date();
  const currentHour = now.getHours();
  const closingTime = DELIVERY_HOURS.close;
  const lastOrderHour = closingTime - DELIVERY_HOURS.deliveryBuffer;

  // If past last order time (after 5 PM), show tomorrow at opening
  if (currentHour >= lastOrderHour) {
    const tomorrow = addDays(startOfDay(now), 1);
    const tomorrowOpen = setMinutes(setHours(tomorrow, DELIVERY_HOURS.open), 0);
    return 'tomorrow at ' + format(tomorrowOpen, 'h:mm a');
  }

  // If before opening (before 8 AM), show today at opening
  if (currentHour < DELIVERY_HOURS.open) {
    const todayOpen = setMinutes(setHours(now, DELIVERY_HOURS.open), 0);
    return 'today at ' + format(todayOpen, 'h:mm a');
  }

  // Should not reach here, but fallback
  return 'soon';
}

/**
 * Format delivery time slot for human-readable display
 * Converts "2025-11-16 17:00" to "November 16th, 2025 at 5PM"
 */
export function formatDeliveryTimeSlot(timeSlot: string): string {
  try {
    // Parse the time slot (format: "yyyy-MM-dd HH:mm")
    const [datePart, timePart] = timeSlot.split(' ');
    const [year, month, day] = datePart.split('-').map(Number);
    const [hour, minute] = timePart.split(':').map(Number);

    const date = new Date(year, month - 1, day, hour, minute);

    // Get ordinal suffix for day
    const dayNum = date.getDate();
    const suffix = (dayNum: number) => {
      if (dayNum > 3 && dayNum < 21) return 'th';
      switch (dayNum % 10) {
        case 1: return 'st';
        case 2: return 'nd';
        case 3: return 'rd';
        default: return 'th';
      }
    };

    // Format month
    const monthName = format(date, 'MMMM');

    // Format time as "5PM" or "12PM" (no minutes if :00)
    let timeStr = '';
    if (hour === 0) {
      timeStr = '12AM';
    } else if (hour < 12) {
      timeStr = `${hour}AM`;
    } else if (hour === 12) {
      timeStr = '12PM';
    } else {
      timeStr = `${hour - 12}PM`;
    }

    return `${monthName} ${dayNum}${suffix(dayNum)}, ${year} at ${timeStr}`;
  } catch (error) {
    // Fallback if parsing fails
    return timeSlot;
  }
}
