import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  SchedulingConfig,
  MeetingType,
  TimeSlot,
  Booking,
  BookingFormData,
  AvailabilityResponse,
  CalendarIntegration
} from '@/types/scheduling';
import { calendarApiService } from '@/lib/scheduling/calendar-api';

export const useScheduling = (pageId?: string) => {
  const [config, setConfig] = useState<SchedulingConfig | null>(null);
  const [meetingTypes, setMeetingTypes] = useState<MeetingType[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  // Load scheduling configuration
  const loadConfig = useCallback(async () => {
    if (!pageId) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('scheduling_configs')
        .select('*')
        .eq('page_id', pageId)
        .single();

      if (error && error.code !== 'PGRST116') { // Not found error
        throw error;
      }

      if (data) {
        setConfig(data as SchedulingConfig);
      } else {
        // Create default config
        const defaultConfig: Omit<SchedulingConfig, 'id'> = {
          pageId,
          isEnabled: false,
          meetingTypes: [],
          integrations: [],
          defaultTimezone: 'UTC',
          businessHours: {
            start: '09:00',
            end: '17:00',
            workingDays: [1, 2, 3, 4, 5] // Monday to Friday
          },
          bookingSettings: {
            requireName: true,
            requireEmail: true,
            requirePhone: false,
            allowGuests: false,
            maxGuests: 0,
            cancellationPolicy: '',
            confirmationMessage: 'Your booking has been confirmed!'
          },
          notifications: {
            emailEnabled: true,
            smsEnabled: false,
            emailTemplate: 'Hi {customerName},\n\nYour booking for {meetingType} on {date} at {time} has been confirmed.',
            smsTemplate: 'Your booking for {meetingType} on {date} at {time} has been confirmed.'
          }
        };

        const { data: newConfig, error: createError } = await supabase
          .from('scheduling_configs')
          .insert(defaultConfig)
          .select()
          .single();

        if (createError) throw createError;
        setConfig(newConfig as SchedulingConfig);
      }
    } catch (err) {
      console.error('Error loading scheduling config:', err);
      setError(err instanceof Error ? err.message : 'Failed to load configuration');
    } finally {
      setLoading(false);
    }
  }, [pageId, supabase]);

  // Load meeting types
  const loadMeetingTypes = useCallback(async () => {
    if (!pageId) return;

    try {
      const { data, error } = await supabase
        .from('meeting_types')
        .select('*')
        .eq('page_id', pageId)
        .eq('is_active', true)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMeetingTypes(data || []);
    } catch (err) {
      console.error('Error loading meeting types:', err);
    }
  }, [pageId, supabase]);

  // Load bookings
  const loadBookings = useCallback(async (startDate?: string, endDate?: string) => {
    if (!pageId) return;

    try {
      let query = supabase
        .from('bookings')
        .select('*')
        .eq('page_id', pageId);

      if (startDate) {
        query = query.gte('start_time', startDate);
      }
      if (endDate) {
        query = query.lte('start_time', endDate);
      }

      const { data, error } = await query.order('start_time', { ascending: true });

      if (error) throw error;
      setBookings(data || []);
    } catch (err) {
      console.error('Error loading bookings:', err);
    }
  }, [pageId, supabase]);

  // Update scheduling configuration
  const updateConfig = useCallback(async (updates: Partial<SchedulingConfig>) => {
    if (!config) return { success: false, error: 'No configuration loaded' };

    try {
      const { data, error } = await supabase
        .from('integrations')
        .update({ config: { ...config, ...updates } })
        .eq('page_id', config.pageId)
        .eq('type', 'calendly')
        .select()
        .single();

      if (error) throw error;

      setConfig(data.config as SchedulingConfig);
      return { success: true };
    } catch (err) {
      console.error('Error updating config:', err);
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to update configuration'
      };
    }
  }, [config, supabase]);

  // Create meeting type
  const createMeetingType = useCallback(async (meetingType: Omit<MeetingType, 'id'>) => {
    if (!pageId) return { success: false, error: 'No page ID' };

    try {
      const { data, error } = await supabase
        .from('meeting_types')
        .insert({ ...meetingType, page_id: pageId })
        .select()
        .single();

      if (error) throw error;

      setMeetingTypes(prev => [...prev, data as MeetingType]);
      return { success: true, meetingType: data as MeetingType };
    } catch (err) {
      console.error('Error creating meeting type:', err);
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to create meeting type'
      };
    }
  }, [pageId, supabase]);

  // Update meeting type
  const updateMeetingType = useCallback(async (id: string, updates: Partial<MeetingType>) => {
    try {
      const { data, error } = await supabase
        .from('meeting_types')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setMeetingTypes(prev =>
        prev.map(mt => mt.id === id ? data as MeetingType : mt)
      );
      return { success: true };
    } catch (err) {
      console.error('Error updating meeting type:', err);
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to update meeting type'
      };
    }
  }, [supabase]);

  // Delete meeting type
  const deleteMeetingType = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('meeting_types')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setMeetingTypes(prev => prev.filter(mt => mt.id !== id));
      return { success: true };
    } catch (err) {
      console.error('Error deleting meeting type:', err);
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to delete meeting type'
      };
    }
  }, [supabase]);

  // Get availability for a specific date
  const getAvailability = useCallback(async (
    meetingTypeId: string,
    date: string,
    timezone: string
  ): Promise<AvailabilityResponse> => {
    if (!config) {
      return { date, slots: [], timezone };
    }

    const meetingType = meetingTypes.find(mt => mt.id === meetingTypeId);
    if (!meetingType) {
      return { date, slots: [], timezone };
    }

    // Get existing bookings for this date
    const startOfDay = new Date(`${date}T00:00:00Z`);
    const endOfDay = new Date(`${date}T23:59:59Z`);

    const existingBookings = bookings.filter(booking => {
      const bookingStart = new Date(booking.startTime);
      return bookingStart >= startOfDay && bookingStart <= endOfDay;
    });

    // Generate time slots based on availability schedule
    const dayOfWeek = startOfDay.getDay() as 0 | 1 | 2 | 3 | 4 | 5 | 6;
    const dayAvailability = meetingType.availability.find(a => a.dayOfWeek === dayOfWeek);

    if (!dayAvailability || !dayAvailability.isActive) {
      return { date, slots: [], timezone };
    }

    const startTime = `${date}T${dayAvailability.startTime}:00`;
    const endTime = `${date}T${dayAvailability.endTime}:00`;

    const allSlots = calendarApiService.generateTimeSlots(
      startTime,
      endTime,
      meetingType.duration,
      15, // 15-minute intervals
      existingBookings.map(b => b.startTime)
    );

    const availableSlots = allSlots.filter(slot =>
      calendarApiService.isTimeSlotAvailable(slot, existingBookings, meetingType.bufferTime)
    );

    return {
      date,
      slots: availableSlots,
      timezone
    };
  }, [config, meetingTypes, bookings]);

  // Create booking
  const createBooking = useCallback(async (formData: BookingFormData) => {
    if (!config) return { success: false, error: 'Scheduling not configured' };

    try {
      const meetingType = meetingTypes.find(mt => mt.id === formData.meetingTypeId);
      if (!meetingType) {
        return { success: false, error: 'Meeting type not found' };
      }

      // Check if slot is still available
      const availability = await getAvailability(
        formData.meetingTypeId,
        formData.preferredDate,
        formData.timezone
      );

      const requestedSlot = availability.slots.find(slot => {
        const slotTime = new Date(slot.startTime);
        const requestedTime = new Date(`${formData.preferredDate}T${formData.preferredTime}:00`);
        return slotTime.getTime() === requestedTime.getTime();
      });

      if (!requestedSlot || !requestedSlot.available) {
        return { success: false, error: 'Time slot is no longer available' };
      }

      // Create booking
      const bookingData = {
        page_id: pageId,
        customer_name: formData.customerName,
        customer_email: formData.customerEmail,
        customer_phone: formData.customerPhone,
        start_time: requestedSlot.startTime,
        end_time: requestedSlot.endTime,
        duration: meetingType.duration,
        timezone: formData.timezone,
        status: 'confirmed',
        notes: formData.notes,
        meeting_type_id: formData.meetingTypeId,
      };

      const { data, error } = await supabase
        .from('bookings')
        .insert(bookingData)
        .select()
        .single();

      if (error) throw error;

      // Reload bookings
      await loadBookings();

      return { success: true, bookingId: data.id };
    } catch (err) {
      console.error('Error creating booking:', err);
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to create booking'
      };
    }
  }, [config, meetingTypes, pageId, getAvailability, supabase, loadBookings]);

  // Connect calendar integration
  const connectCalendar = useCallback(async (
    provider: 'calendly' | 'google' | 'outlook',
    settings: any
  ) => {
    try {
      let result;

      switch (provider) {
        case 'calendly':
          result = await calendarApiService.connectCalendly(settings.apiKey);
          break;
        case 'google':
          result = await calendarApiService.connectGoogleCalendar(settings.accessToken);
          break;
        default:
          result = { success: false, error: 'Provider not supported yet' };
      }

      if (result.success && config) {
        const updatedIntegrations = [...config.integrations];
        const existingIndex = updatedIntegrations.findIndex(i => i.provider === provider);

        const integration: CalendarIntegration = {
          provider,
          isConnected: true,
          lastSync: new Date().toISOString(),
          settings: { ...settings, syncEnabled: true }
        };

        if (existingIndex >= 0) {
          updatedIntegrations[existingIndex] = integration;
        } else {
          updatedIntegrations.push(integration);
        }

        await updateConfig({ integrations: updatedIntegrations });
      }

      return result;
    } catch (err) {
      console.error('Error connecting calendar:', err);
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to connect calendar'
      };
    }
  }, [config, updateConfig]);

  // Initialize on mount
  useEffect(() => {
    loadConfig();
    loadMeetingTypes();
    loadBookings();
  }, [loadConfig, loadMeetingTypes, loadBookings]);

  return {
    config,
    meetingTypes,
    bookings,
    loading,
    error,
    updateConfig,
    createMeetingType,
    updateMeetingType,
    deleteMeetingType,
    getAvailability,
    createBooking,
    loadBookings,
    connectCalendar,
    refreshData: () => {
      loadConfig();
      loadMeetingTypes();
      loadBookings();
    }
  };
};
