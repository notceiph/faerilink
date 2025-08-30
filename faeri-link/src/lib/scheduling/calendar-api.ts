import {
  CalendarIntegration,
  MeetingType,
  TimeSlot,
  Booking,
  AvailabilitySchedule,
  CalendlyEventType
} from '@/types/scheduling';

class CalendarApiService {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || '';

  // Calendly Integration
  async connectCalendly(apiKey: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch('https://api.calendly.com/users/me', {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Invalid Calendly API key');
      }

      const userData = await response.json();
      return { success: true };
    } catch (error) {
      console.error('Calendly connection error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to connect to Calendly'
      };
    }
  }

  async getCalendlyEventTypes(apiKey: string): Promise<CalendlyEventType[]> {
    try {
      const response = await fetch('https://api.calendly.com/event_types', {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch Calendly event types');
      }

      const data = await response.json();
      return data.collection || [];
    } catch (error) {
      console.error('Error fetching Calendly event types:', error);
      return [];
    }
  }

  async createCalendlyEventType(
    apiKey: string,
    eventTypeData: Partial<CalendlyEventType>
  ): Promise<CalendlyEventType | null> {
    try {
      const response = await fetch('https://api.calendly.com/event_types', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventTypeData),
      });

      if (!response.ok) {
        throw new Error('Failed to create Calendly event type');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating Calendly event type:', error);
      return null;
    }
  }

  // Google Calendar Integration (placeholder - would need OAuth setup)
  async connectGoogleCalendar(accessToken: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch('https://www.googleapis.com/calendar/v3/users/me/calendarList', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Invalid Google Calendar access token');
      }

      return { success: true };
    } catch (error) {
      console.error('Google Calendar connection error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to connect to Google Calendar'
      };
    }
  }

  // Manual Calendar Management
  async getManualAvailability(
    pageId: string,
    date: string,
    timezone: string
  ): Promise<TimeSlot[]> {
    try {
      const response = await fetch(`/api/scheduling/availability`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pageId, date, timezone }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch availability');
      }

      const data = await response.json();
      return data.slots || [];
    } catch (error) {
      console.error('Error fetching manual availability:', error);
      return [];
    }
  }

  async createManualBooking(
    pageId: string,
    bookingData: {
      customerName: string;
      customerEmail: string;
      customerPhone?: string;
      startTime: string;
      endTime: string;
      meetingTypeId: string;
      notes?: string;
      timezone: string;
    }
  ): Promise<{ success: boolean; bookingId?: string; error?: string }> {
    try {
      const response = await fetch(`/api/scheduling/book`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pageId, ...bookingData }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create booking');
      }

      return { success: true, bookingId: result.bookingId };
    } catch (error) {
      console.error('Error creating manual booking:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create booking'
      };
    }
  }

  async getBookings(
    pageId: string,
    startDate?: string,
    endDate?: string
  ): Promise<Booking[]> {
    try {
      const params = new URLSearchParams({ pageId });
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await fetch(`/api/scheduling/bookings?${params}`);

      if (!response.ok) {
        throw new Error('Failed to fetch bookings');
      }

      const data = await response.json();
      return data.bookings || [];
    } catch (error) {
      console.error('Error fetching bookings:', error);
      return [];
    }
  }

  async updateBooking(
    bookingId: string,
    updates: Partial<Booking>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`/api/scheduling/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update booking');
      }

      return { success: true };
    } catch (error) {
      console.error('Error updating booking:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update booking'
      };
    }
  }

  async cancelBooking(
    bookingId: string,
    reason?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`/api/scheduling/bookings/${bookingId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to cancel booking');
      }

      return { success: true };
    } catch (error) {
      console.error('Error canceling booking:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to cancel booking'
      };
    }
  }

  // Utility functions
  generateTimeSlots(
    startTime: string,
    endTime: string,
    duration: number,
    interval: number = 15,
    bookedSlots: string[] = []
  ): TimeSlot[] {
    const slots: TimeSlot[] = [];
    const start = new Date(startTime);
    const end = new Date(endTime);

    let current = new Date(start);

    while (current < end) {
      const slotEnd = new Date(current.getTime() + duration * 60000);

      if (slotEnd <= end) {
        const slotId = current.toISOString();
        const isBooked = bookedSlots.includes(slotId);

        slots.push({
          id: slotId,
          startTime: current.toISOString(),
          endTime: slotEnd.toISOString(),
          duration,
          available: !isBooked,
          booked: isBooked,
        });
      }

      current = new Date(current.getTime() + interval * 60000);
    }

    return slots;
  }

  isTimeSlotAvailable(
    slot: TimeSlot,
    existingBookings: Booking[],
    bufferMinutes: number = 0
  ): boolean {
    const slotStart = new Date(slot.startTime);
    const slotEnd = new Date(slot.endTime);

    // Add buffer time
    const bufferStart = new Date(slotStart.getTime() - bufferMinutes * 60000);
    const bufferEnd = new Date(slotEnd.getTime() + bufferMinutes * 60000);

    return !existingBookings.some(booking => {
      const bookingStart = new Date(booking.startTime);
      const bookingEnd = new Date(booking.endTime);

      return (
        (bookingStart < bufferEnd && bookingEnd > bufferStart) ||
        (bookingStart <= slotStart && bookingEnd >= slotEnd)
      );
    });
  }

  formatTimeForDisplay(time: string, timezone: string): string {
    return new Date(time).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      timeZone: timezone,
    });
  }

  getNextAvailableDate(
    availability: AvailabilitySchedule[],
    fromDate: Date = new Date()
  ): Date {
    const date = new Date(fromDate);
    const maxDays = 90; // Look ahead up to 3 months

    for (let i = 0; i < maxDays; i++) {
      const dayOfWeek = date.getDay() as 0 | 1 | 2 | 3 | 4 | 5 | 6;
      const dayAvailability = availability.find(a => a.dayOfWeek === dayOfWeek && a.isActive);

      if (dayAvailability) {
        return new Date(date);
      }

      date.setDate(date.getDate() + 1);
    }

    return fromDate; // Fallback
  }
}

// Export singleton instance
export const calendarApiService = new CalendarApiService();
