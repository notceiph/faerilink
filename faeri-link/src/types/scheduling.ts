export interface TimeSlot {
  id: string;
  startTime: string; // ISO string
  endTime: string; // ISO string
  duration: number; // in minutes
  available: boolean;
  booked?: boolean;
  bookingId?: string;
}

export interface Booking {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  startTime: string;
  endTime: string;
  duration: number;
  timezone: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  notes?: string;
  meetingType: string;
  createdAt: string;
  updatedAt: string;
}

export interface AvailabilitySchedule {
  id: string;
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  isActive: boolean;
  timezone: string;
}

export interface MeetingType {
  id: string;
  name: string;
  description?: string;
  duration: number; // in minutes
  price?: number;
  currency?: string;
  color?: string;
  isActive: boolean;
  availability: AvailabilitySchedule[];
  bufferTime: number; // minutes before/after
  maxAdvanceBooking: number; // days in advance
  minNotice: number; // hours notice required
}

export interface CalendarIntegration {
  provider: 'calendly' | 'google' | 'outlook' | 'manual';
  isConnected: boolean;
  lastSync?: string;
  settings: {
    apiKey?: string;
    calendarId?: string;
    syncEnabled: boolean;
    autoConfirm: boolean;
    reminderEnabled: boolean;
    reminderMinutes: number;
  };
}

export interface SchedulingConfig {
  pageId: string;
  isEnabled: boolean;
  meetingTypes: MeetingType[];
  integrations: CalendarIntegration[];
  defaultTimezone: string;
  businessHours: {
    start: string; // HH:mm
    end: string; // HH:mm
    workingDays: (0 | 1 | 2 | 3 | 4 | 5 | 6)[];
  };
  bookingSettings: {
    requireName: boolean;
    requireEmail: boolean;
    requirePhone: boolean;
    allowGuests: boolean;
    maxGuests: number;
    cancellationPolicy: string;
    confirmationMessage: string;
  };
  notifications: {
    emailEnabled: boolean;
    smsEnabled: boolean;
    emailTemplate: string;
    smsTemplate: string;
  };
}

export interface BookingFormData {
  meetingTypeId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  preferredDate: string; // YYYY-MM-DD
  preferredTime: string; // HH:mm
  timezone: string;
  notes?: string;
  guests?: string[]; // email addresses
}

export interface BookingResponse {
  success: boolean;
  bookingId?: string;
  error?: string;
  message?: string;
}

export interface AvailabilityResponse {
  date: string;
  slots: TimeSlot[];
  timezone: string;
}

export interface CalendlyEventType {
  id: string;
  name: string;
  description?: string;
  duration: number;
  scheduling_url: string;
  color: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CalendlyWebhook {
  id: string;
  user_id: string;
  organization_id: string;
  url: string;
  events: string[];
  active: boolean;
  created_at: string;
  updated_at: string;
}
