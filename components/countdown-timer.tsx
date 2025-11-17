'use client';

import { useState, useEffect } from 'react';
import { getTimeUntilCutoff, formatCountdown } from '@/lib/utils-time';

// Generate consistent fake scarcity based on date/hour
function getScarcityMetrics() {
  const now = new Date();
  const hour = now.getHours();
  const day = now.getDate();

  // Use date+hour as seed for consistency
  const seed = day * 100 + hour;

  // Generate "remaining slots" between 2-8
  const slotsRemaining = 2 + (seed % 7);

  // Generate "percentage filled" between 65-92%
  const percentFilled = 65 + (seed % 28);

  return { slotsRemaining, percentFilled };
}

export function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [mounted, setMounted] = useState(false);
  const [isAfterHours, setIsAfterHours] = useState(false);
  const [scarcity, setScarcity] = useState({ slotsRemaining: 5, percentFilled: 75 });

  useEffect(() => {
    // Set initial time on mount to avoid hydration mismatch
    const initialTime = getTimeUntilCutoff();
    setTimeLeft(initialTime);

    // Determine if we should show scarcity or countdown
    const now = new Date();
    const currentHour = now.getHours();

    // Show scarcity from 6 PM to noon the next day (18:00 - 11:59)
    // Show countdown from noon to 6 PM (12:00 - 17:59)
    const showScarcity = currentHour >= 18 || currentHour < 12; // After 6 PM or before noon
    setIsAfterHours(showScarcity);

    if (showScarcity) {
      setScarcity(getScarcityMetrics());
    }

    setMounted(true);

    // Update countdown every second by decrementing
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1000) {
          // Reset to next cutoff when reaches zero
          return getTimeUntilCutoff();
        }
        return prev - 1000;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Prevent hydration mismatch by not rendering time until mounted
  if (!mounted) {
    return (
      <div className="bg-primary text-primary-foreground px-6 py-4 rounded-lg text-center">
        <p className="text-sm font-medium mb-1">Order within</p>
        <p className="text-3xl font-bold tabular-nums">Loading...</p>
        <p className="text-sm mt-1">for 2-hour delivery today</p>
      </div>
    );
  }

  // Show fake scarcity (6 PM to noon)
  if (isAfterHours) {
    const now = new Date();
    const currentHour = now.getHours();

    // Calculate earliest delivery time
    let earliestDelivery = "";
    if (currentHour >= 18) {
      // 6 PM to midnight: Show tomorrow's opening time (8 AM)
      earliestDelivery = "8:00 AM tomorrow";
    } else {
      // Midnight to noon: Show today's opening time (8 AM)
      earliestDelivery = "8:00 AM today";
    }

    return (
      <div className="bg-destructive text-destructive-foreground px-6 py-4 rounded-lg text-center">
        <p className="text-sm font-medium mb-1">⚠️ Limited Availability</p>
        <p className="text-3xl font-bold mb-1">Only {scarcity.slotsRemaining} Slots Left</p>
        <p className="text-sm">Delivery as early as {earliestDelivery} • {scarcity.percentFilled}% reserved</p>
      </div>
    );
  }

  return (
    <div className="bg-primary text-primary-foreground px-6 py-4 rounded-lg text-center">
      <p className="text-sm font-medium mb-1">Order within</p>
      <p className="text-3xl font-bold tabular-nums">{formatCountdown(timeLeft)}</p>
      <p className="text-sm mt-1">for 2-hour delivery today</p>
    </div>
  );
}
