import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import {
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  MessageSquare,
  CheckCircle,
  XCircle,
  Loader2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useScheduling } from '@/hooks/useScheduling';
import {
  MeetingType,
  TimeSlot,
  BookingFormData,
  AvailabilityResponse
} from '@/types/scheduling';

interface BookingCalendarProps {
  pageId: string;
  meetingTypes?: MeetingType[];
  onBookingComplete?: (bookingId: string) => void;
  theme?: {
    primaryColor?: string;
    backgroundColor?: string;
    textColor?: string;
  };
}

export const BookingCalendar: React.FC<BookingCalendarProps> = ({
  pageId,
  meetingTypes: propMeetingTypes,
  onBookingComplete,
  theme = {}
}) => {
  const {
    config,
    meetingTypes: hookMeetingTypes,
    loading,
    error,
    getAvailability,
    createBooking
  } = useScheduling(pageId);

  const meetingTypes = propMeetingTypes || hookMeetingTypes;

  const [selectedMeetingType, setSelectedMeetingType] = useState<MeetingType | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [availability, setAvailability] = useState<AvailabilityResponse | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [bookingStep, setBookingStep] = useState<'type' | 'date' | 'time' | 'details' | 'confirm'>('type');
  const [formData, setFormData] = useState<BookingFormData>({
    meetingTypeId: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    preferredDate: '',
    preferredTime: '',
    timezone: 'UTC',
    notes: '',
    guests: []
  });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

  // Initialize with first available meeting type
  useEffect(() => {
    if (meetingTypes.length > 0 && !selectedMeetingType) {
      setSelectedMeetingType(meetingTypes[0]);
      setFormData(prev => ({ ...prev, meetingTypeId: meetingTypes[0].id }));
    }
  }, [meetingTypes, selectedMeetingType]);

  // Get user's timezone
  useEffect(() => {
    setFormData(prev => ({ ...prev, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone }));
  }, []);

  // Load availability when date is selected
  useEffect(() => {
    if (selectedDate && selectedMeetingType) {
      loadAvailability();
    }
  }, [selectedDate, selectedMeetingType]);

  const loadAvailability = async () => {
    if (!selectedMeetingType || !selectedDate) return;

    try {
      const avail = await getAvailability(
        selectedMeetingType.id,
        selectedDate,
        formData.timezone
      );
      setAvailability(avail);
    } catch (error) {
      console.error('Error loading availability:', error);
    }
  };

  const handleMeetingTypeSelect = (meetingType: MeetingType) => {
    setSelectedMeetingType(meetingType);
    setFormData(prev => ({ ...prev, meetingTypeId: meetingType.id }));
    setSelectedDate('');
    setSelectedTime('');
    setAvailability(null);
    setBookingStep('date');
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setFormData(prev => ({ ...prev, preferredDate: date }));
    setSelectedTime('');
    setBookingStep('time');
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setFormData(prev => ({ ...prev, preferredTime: time }));
    setBookingStep('details');
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedMeetingType || !selectedDate || !selectedTime) {
      setBookingError('Please select meeting type, date, and time');
      return;
    }

    if (!formData.customerName || !formData.customerEmail) {
      setBookingError('Please fill in all required fields');
      return;
    }

    setBookingLoading(true);
    setBookingError(null);

    try {
      const result = await createBooking(formData);

      if (result.success && result.bookingId) {
        setBookingStep('confirm');
        onBookingComplete?.(result.bookingId);
      } else {
        setBookingError(result.error || 'Booking failed');
      }
    } catch (error) {
      console.error('Booking error:', error);
      setBookingError('An unexpected error occurred');
    } finally {
      setBookingLoading(false);
    }
  };

  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()));

    const days = [];
    const day = new Date(startDate);

    while (day <= endDate) {
      days.push(new Date(day));
      day.setDate(day.getDate() + 1);
    }

    return days;
  };

  const isDateAvailable = (date: Date): boolean => {
    if (!selectedMeetingType) return false;

    const dayOfWeek = date.getDay() as 0 | 1 | 2 | 3 | 4 | 5 | 6;
    const availability = selectedMeetingType.availability.find(a => a.dayOfWeek === dayOfWeek);

    return availability?.isActive || false;
  };

  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  const formatDisplayDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (time: string): string => {
    const [hours, minutes] = time.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Error</h3>
          <p className="text-gray-600">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!config?.isEnabled) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Scheduling Not Available</h3>
          <p className="text-gray-600">This page doesn't have scheduling enabled yet.</p>
        </CardContent>
      </Card>
    );
  }

  if (meetingTypes.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Meeting Types</h3>
          <p className="text-gray-600">No meeting types are configured for this page.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-8">
        {['type', 'date', 'time', 'details', 'confirm'].map((step, index) => (
          <div key={step} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              bookingStep === step
                ? 'bg-blue-600 text-white'
                : bookingStep === 'confirm' || ['type', 'date', 'time', 'details'].indexOf(bookingStep) > index
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-600'
            }`}>
              {bookingStep === 'confirm' && step === 'confirm' ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                index + 1
              )}
            </div>
            {index < 4 && (
              <div className={`w-12 h-1 mx-2 ${
                bookingStep === 'confirm' || ['type', 'date', 'time', 'details'].indexOf(bookingStep) > index
                ? 'bg-green-600'
                : 'bg-gray-200'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Meeting Type Selection */}
      {bookingStep === 'type' && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {meetingTypes.map((meetingType) => (
            <Card
              key={meetingType.id}
              className={`cursor-pointer transition-all hover:shadow-lg ${
                selectedMeetingType?.id === meetingType.id ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => handleMeetingTypeSelect(meetingType)}
            >
              <CardContent className="p-6">
                <div className="text-center">
                  <div
                    className="w-12 h-12 rounded-lg mx-auto mb-4 flex items-center justify-center"
                    style={{ backgroundColor: meetingType.color || '#3B82F6' }}
                  >
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold mb-2">{meetingType.name}</h3>
                  {meetingType.description && (
                    <p className="text-sm text-gray-600 mb-3">{meetingType.description}</p>
                  )}
                  <div className="text-sm text-gray-500">
                    <div>{meetingType.duration} minutes</div>
                    {meetingType.price && (
                      <div className="font-medium">
                        ${meetingType.price} {meetingType.currency?.toUpperCase() || 'USD'}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Step 2: Date Selection */}
      {bookingStep === 'date' && selectedMeetingType && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Select Date for {selectedMeetingType.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="outline"
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <h3 className="font-semibold">
                {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h3>
              <Button
                variant="outline"
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                  {day}
                </div>
              ))}

              {generateCalendarDays().map((date, index) => {
                const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
                const isToday = formatDate(date) === formatDate(new Date());
                const isSelected = formatDate(date) === selectedDate;
                const available = isDateAvailable(date);
                const isPast = date < new Date();

                return (
                  <button
                    key={index}
                    onClick={() => available && !isPast && handleDateSelect(formatDate(date))}
                    disabled={!available || isPast}
                    className={`p-2 text-center rounded-lg transition-colors ${
                      !isCurrentMonth
                        ? 'text-gray-300'
                        : isSelected
                        ? 'bg-blue-600 text-white'
                        : available && !isPast
                        ? 'hover:bg-blue-100 text-gray-900'
                        : 'text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>

            <Button
              variant="outline"
              onClick={() => setBookingStep('type')}
              className="w-full"
            >
              Back to Meeting Types
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Time Selection */}
      {bookingStep === 'time' && availability && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Select Time for {formatDisplayDate(new Date(selectedDate))}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {availability.slots.length > 0 ? (
              <div className="grid gap-2 md:grid-cols-3 lg:grid-cols-4">
                {availability.slots.map((slot) => (
                  <button
                    key={slot.id}
                    onClick={() => handleTimeSelect(slot.startTime.split('T')[1].substring(0, 5))}
                    className={`p-3 border rounded-lg text-center transition-colors ${
                      slot.startTime.split('T')[1].substring(0, 5) === selectedTime
                        ? 'bg-blue-600 text-white border-blue-600'
                        : slot.available
                        ? 'hover:bg-blue-50 border-gray-300'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                    disabled={!slot.available}
                  >
                    {formatTime(slot.startTime.split('T')[1].substring(0, 5))}
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No available time slots for this date.</p>
              </div>
            )}

            <div className="flex gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setBookingStep('date')}
                className="flex-1"
              >
                Back to Date Selection
              </Button>
              {availability.slots.length > 0 && (
                <Button
                  onClick={() => setBookingStep('details')}
                  disabled={!selectedTime}
                  className="flex-1"
                >
                  Continue
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Booking Details */}
      {bookingStep === 'details' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Enter Your Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleBookingSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium mb-1 block">Name *</label>
                  <Input
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Email *</label>
                  <Input
                    type="email"
                    value={formData.customerEmail}
                    onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                    required
                  />
                </div>
              </div>

              {config?.bookingSettings.requirePhone && (
                <div>
                  <label className="text-sm font-medium mb-1 block">Phone</label>
                  <Input
                    type="tel"
                    value={formData.customerPhone}
                    onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                  />
                </div>
              )}

              <div>
                <label className="text-sm font-medium mb-1 block">Notes (Optional)</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  rows={3}
                  placeholder="Any additional information..."
                />
              </div>

              {bookingError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 text-red-800">
                    <XCircle className="w-4 h-4" />
                    <span className="text-sm">{bookingError}</span>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setBookingStep('time')}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  disabled={bookingLoading}
                  className="flex-1"
                >
                  {bookingLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <CheckCircle className="w-4 h-4 mr-2" />
                  )}
                  Book Meeting
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Step 5: Confirmation */}
      {bookingStep === 'confirm' && (
        <Card>
          <CardContent className="p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Booking Confirmed!</h2>
            <p className="text-gray-600 mb-6">
              Your meeting has been scheduled successfully.
            </p>

            {selectedMeetingType && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                <h3 className="font-semibold mb-2">Booking Details</h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <div><strong>Meeting:</strong> {selectedMeetingType.name}</div>
                  <div><strong>Date:</strong> {formatDisplayDate(new Date(selectedDate))}</div>
                  <div><strong>Time:</strong> {formatTime(selectedTime)}</div>
                  <div><strong>Duration:</strong> {selectedMeetingType.duration} minutes</div>
                </div>
              </div>
            )}

            <div className="text-sm text-gray-600">
              {config?.bookingSettings.confirmationMessage ||
                'You will receive a confirmation email with the meeting details.'}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
