# Scheduling System Setup Guide

## Overview

The scheduling system allows you to:
1. View a daily calendar showing all orders with their time slots
2. Block time slots when you're unavailable (doctor's appointments, breaks, etc.)
3. Blocked time slots automatically hide from the checkout page

---

## Setup Instructions

### Step 1: Run Database Migration

1. Open your Supabase project dashboard
2. Go to the SQL Editor
3. Open the file `add-scheduling-system.sql`
4. Copy and paste the entire contents into the Supabase SQL Editor
5. Click "Run" to execute the migration

This will:
- Create the `blocked_time_slots` table
- Set up proper permissions and policies
- Add necessary indexes for performance

### Step 2: Verify Installation (Optional)

Run this query in Supabase SQL Editor to verify the table was created:

```sql
SELECT * FROM blocked_time_slots;
```

You should see an empty table (no errors).

---

## Using the Scheduling System

### Accessing the Schedule

1. Log in to the admin dashboard at `/admin`
2. Click the **"Schedule"** link in the top navigation
3. You'll see a day-by-day calendar view

### Viewing Orders

- The schedule shows all orders grouped by their delivery time slots
- Each time slot displays:
  - Order number
  - Recipient name and city
  - Package type and total price
  - Order status badge
- Click any order to view full details

### Blocking Time Slots

**Example: You have a doctor's appointment from 2 PM to 5 PM tomorrow**

1. Navigate to the desired date using:
   - "Previous" button (go back one day)
   - "Today" button (return to current date)
   - "Next" button (go forward one day)

2. Click the **"Block Time Slot"** button

3. Fill in the dialog:
   - **Start Time:** 14:00 (2:00 PM)
   - **End Time:** 17:00 (5:00 PM)
   - **Reason:** "Doctor's appointment" (optional but recommended)

4. Click "Block Time Slot"

5. The blocked period will immediately appear in red on the schedule

### What Happens When You Block a Time Slot?

- **On the admin schedule:** The blocked period shows up highlighted in red with your reason
- **On the checkout page:** Customers cannot select any time within the blocked period
- **Example:** If you block 2 PM - 5 PM, customers will see:
  - Available: 8 AM, 9 AM, 10 AM, 11 AM, 12 PM, 1 PM, 6 PM, 7 PM, 8 PM
  - Not available: 2 PM, 3 PM, 4 PM (hidden from the dropdown)

### Unblocking Time Slots

If your plans change:
1. Go to the schedule page
2. Navigate to the date with the blocked slot
3. Find the red blocked period
4. Click the trash icon (🗑️) next to the block
5. Confirm the deletion
6. The time slots immediately become available for customers again

---

## Navigation

The schedule page includes:
- **Previous/Next buttons** - Navigate day by day
- **Today button** - Jump back to current date
- **Date display** - Shows current date being viewed (e.g., "Friday, November 22, 2025")
- **Badges** - Quick stats showing number of orders and blocked slots for the day

---

## Tips & Best Practices

### Blocking Time in Advance
- Block time slots as soon as you know you'll be unavailable
- Use descriptive reasons ("Lunch break", "Family appointment", "Travel time")
- Consider blocking buffer time around appointments

### Multiple Blocks Per Day
- You can block multiple time periods on the same day
- Example: Block 12 PM - 1 PM for lunch AND 3 PM - 4 PM for a meeting

### Recurring Unavailability
- Currently, you need to block each day individually
- Set a reminder to block future dates for recurring commitments
- (Future enhancement: Recurring blocks feature)

### Order Capacity
- The system doesn't limit orders per time slot (yet)
- If you want to limit capacity, manually block slots when you reach your limit
- (Future enhancement: Automatic capacity limits)

---

## Technical Details

### Time Slot Resolution
- Time slots are generated every **1 hour**
- Delivery hours: **8 AM - 8 PM** (configurable in `lib/constants.ts`)
- Minimum advance booking: **2 hours**

### Blocking Granularity
- You can block any time period (doesn't have to align with hourly slots)
- Example: Block 2:30 PM - 4:45 PM
- The system will hide all overlapping time slots (2 PM, 3 PM, 4 PM)

### Data Persistence
- Blocked slots are stored in the database
- They persist until you manually unblock them
- Old blocked slots (past dates) remain in the database but don't affect checkout

---

## Troubleshooting

### Issue: Blocked slots not showing on schedule
**Solution:** Refresh the page. The schedule loads data on page load.

### Issue: Customers can still see blocked time slots
**Solution:**
1. Verify the block was created (check schedule page)
2. Check the block date matches the delivery date
3. Clear browser cache and try checkout again
4. Check browser console for any API errors

### Issue: Can't block overlapping times
**Solution:** The system allows overlapping blocks. If you get an error:
- Ensure start time is before end time
- Use 24-hour format (14:00, not 2:00)
- Check for JavaScript console errors

### Issue: Schedule page is slow
**Solution:**
- The page loads all orders for the selected day
- If you have hundreds of orders, consider filtering by status in the Orders page instead
- Performance optimizations are already in place (indexed queries)

---

## Database Schema

For reference, here's the blocked time slots structure:

```sql
blocked_time_slots
├── id (UUID) - Unique identifier
├── block_date (DATE) - Date of the block
├── start_time (TIME) - Start time (e.g., 14:00:00)
├── end_time (TIME) - End time (e.g., 17:00:00)
├── reason (TEXT) - Optional reason
├── created_by (VARCHAR) - Who created the block
├── created_at (TIMESTAMP) - When it was created
└── updated_at (TIMESTAMP) - When it was last updated
```

---

## Support

For technical issues:
1. Check `progress.md` for implementation details
2. Review console logs in browser DevTools
3. Check Supabase logs for database errors
4. Verify the SQL migration ran successfully

---

**Last Updated:** 2025-11-22
