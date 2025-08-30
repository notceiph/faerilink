import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import {
  Calendar,
  Plus,
  Settings,
  Clock,
  Users,
  Edit3,
  Trash2,
  CheckCircle,
  XCircle,
  ToggleLeft,
  ToggleRight,
  Save,
  RefreshCw
} from 'lucide-react';
import { useScheduling } from '@/hooks/useScheduling';
import { MeetingType, AvailabilitySchedule } from '@/types/scheduling';

interface SchedulingManagementProps {
  pageId: string;
}

export const SchedulingManagement: React.FC<SchedulingManagementProps> = ({ pageId }) => {
  const {
    config,
    meetingTypes,
    bookings,
    loading,
    error,
    updateConfig,
    createMeetingType,
    updateMeetingType,
    deleteMeetingType,
    refreshData
  } = useScheduling(pageId);

  const [activeTab, setActiveTab] = useState<'overview' | 'meeting-types' | 'settings' | 'bookings'>('overview');
  const [editingMeetingType, setEditingMeetingType] = useState<MeetingType | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<Partial<MeetingType>>({});
  const [saving, setSaving] = useState(false);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Calendar },
    { id: 'meeting-types', label: 'Meeting Types', icon: Clock },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'bookings', label: 'Bookings', icon: Users }
  ];

  const handleCreateMeetingType = () => {
    setFormData({
      name: '',
      description: '',
      duration: 30,
      color: '#3B82F6',
      isActive: true,
      bufferTime: 0,
      maxAdvanceBooking: 30,
      minNotice: 1,
      availability: [],
      price: undefined,
      currency: 'USD'
    });
    setIsCreating(true);
    setEditingMeetingType(null);
  };

  const handleEditMeetingType = (meetingType: MeetingType) => {
    setFormData({ ...meetingType });
    setEditingMeetingType(meetingType);
    setIsCreating(false);
  };

  const handleSaveMeetingType = async () => {
    if (!formData.name || !formData.duration) {
      alert('Please fill in all required fields');
      return;
    }

    setSaving(true);
    try {
      let result;

      if (isCreating) {
        result = await createMeetingType(formData as Omit<MeetingType, 'id'>);
      } else if (editingMeetingType) {
        result = await updateMeetingType(editingMeetingType.id, formData);
      }

      if (result?.success) {
        setFormData({});
        setIsCreating(false);
        setEditingMeetingType(null);
      } else {
        alert(result?.error || 'Failed to save meeting type');
      }
    } catch (error) {
      console.error('Error saving meeting type:', error);
      alert('Error saving meeting type');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMeetingType = async (id: string) => {
    if (!confirm('Are you sure you want to delete this meeting type?')) return;

    try {
      const result = await deleteMeetingType(id);
      if (!result.success) {
        alert(result.error || 'Failed to delete meeting type');
      }
    } catch (error) {
      console.error('Error deleting meeting type:', error);
      alert('Error deleting meeting type');
    }
  };

  const toggleSchedulingEnabled = async () => {
    if (!config) return;

    try {
      await updateConfig({ isEnabled: !config.isEnabled });
    } catch (error) {
      console.error('Error updating scheduling status:', error);
    }
  };

  const generateDefaultAvailability = (): AvailabilitySchedule[] => {
    const days = [1, 2, 3, 4, 5]; // Monday to Friday
    return days.map(dayOfWeek => ({
      id: `avail-${dayOfWeek}`,
      dayOfWeek: dayOfWeek as 0 | 1 | 2 | 3 | 4 | 5 | 6,
      startTime: '09:00',
      endTime: '17:00',
      isActive: true,
      timezone: config?.defaultTimezone || 'UTC'
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-red-600">Error: {error}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Scheduling Management</h2>
          <p className="text-muted-foreground">
            Configure meeting types, availability, and booking settings
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${config?.isEnabled ? 'bg-green-500' : 'bg-gray-400'}`} />
            <span className="text-sm text-gray-600">
              {config?.isEnabled ? 'Enabled' : 'Disabled'}
            </span>
          </div>
          <Button
            onClick={toggleSchedulingEnabled}
            variant={config?.isEnabled ? 'outline' : 'default'}
          >
            {config?.isEnabled ? (
              <>
                <ToggleRight className="w-4 h-4 mr-2" />
                Disable
              </>
            ) : (
              <>
                <ToggleLeft className="w-4 h-4 mr-2" />
                Enable
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Meeting Types</p>
                    <p className="text-2xl font-bold">{meetingTypes.length}</p>
                  </div>
                  <Clock className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Bookings</p>
                    <p className="text-2xl font-bold">{bookings.length}</p>
                  </div>
                  <Calendar className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Upcoming Today</p>
                    <p className="text-2xl font-bold">
                      {bookings.filter(b => {
                        const today = new Date().toDateString();
                        const bookingDate = new Date(b.startTime).toDateString();
                        return bookingDate === today && b.status === 'confirmed';
                      }).length}
                    </p>
                  </div>
                  <Users className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">This Week</p>
                    <p className="text-2xl font-bold">
                      {bookings.filter(b => {
                        const weekFromNow = new Date();
                        weekFromNow.setDate(weekFromNow.getDate() + 7);
                        const bookingDate = new Date(b.startTime);
                        return bookingDate <= weekFromNow && b.status === 'confirmed';
                      }).length}
                    </p>
                  </div>
                  <Calendar className="w-8 h-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Meeting Types Tab */}
        {activeTab === 'meeting-types' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Meeting Types</h3>
              <Button onClick={handleCreateMeetingType}>
                <Plus className="w-4 h-4 mr-2" />
                Add Meeting Type
              </Button>
            </div>

            {/* Meeting Type Form */}
            {(isCreating || editingMeetingType) && (
              <Card>
                <CardHeader>
                  <CardTitle>
                    {isCreating ? 'Create Meeting Type' : 'Edit Meeting Type'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Name *</label>
                      <Input
                        value={formData.name || ''}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="30-minute meeting"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Duration (minutes) *</label>
                      <Input
                        type="number"
                        value={formData.duration || 30}
                        onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                        min="15"
                        max="480"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1 block">Description</label>
                    <textarea
                      value={formData.description || ''}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md"
                      rows={3}
                      placeholder="Brief description of this meeting type"
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Price (optional)</label>
                      <Input
                        type="number"
                        value={formData.price || ''}
                        onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || undefined })}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Currency</label>
                      <select
                        value={formData.currency || 'USD'}
                        onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                        className="w-full px-3 py-2 border rounded-md bg-background"
                      >
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                        <option value="CAD">CAD</option>
                        <option value="AUD">AUD</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Color</label>
                      <Input
                        type="color"
                        value={formData.color || '#3B82F6'}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive ?? true}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    />
                    <label htmlFor="isActive" className="text-sm font-medium">
                      Active
                    </label>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handleSaveMeetingType} disabled={saving}>
                      {saving ? (
                        <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <Save className="w-4 h-4 mr-2" />
                      )}
                      {isCreating ? 'Create' : 'Update'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsCreating(false);
                        setEditingMeetingType(null);
                        setFormData({});
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Meeting Types List */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {meetingTypes.map((meetingType) => (
                <Card key={meetingType.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: meetingType.color }}
                      />
                      <div className="flex items-center gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleEditMeetingType(meetingType)}
                        >
                          <Edit3 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDeleteMeetingType(meetingType.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <h3 className="font-semibold mb-2">{meetingType.name}</h3>
                    {meetingType.description && (
                      <p className="text-sm text-gray-600 mb-3">{meetingType.description}</p>
                    )}

                    <div className="space-y-1 text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        <span>{meetingType.duration} minutes</span>
                      </div>
                      {meetingType.price && (
                        <div className="flex items-center gap-2">
                          <span>${meetingType.price} {meetingType.currency?.toUpperCase()}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-3">
                      {meetingType.isActive ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-gray-400" />
                      )}
                      <span className="text-xs">
                        {meetingType.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && config && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Default Timezone</label>
                  <select
                    value={config.defaultTimezone}
                    onChange={(e) => updateConfig({ defaultTimezone: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md bg-background"
                  >
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Chicago">Central Time</option>
                    <option value="America/Denver">Mountain Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                    <option value="Europe/London">London</option>
                    <option value="Europe/Paris">Paris</option>
                    <option value="Asia/Tokyo">Tokyo</option>
                  </select>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Business Hours Start</label>
                    <Input
                      type="time"
                      value={config.businessHours.start}
                      onChange={(e) => updateConfig({
                        businessHours: { ...config.businessHours, start: e.target.value }
                      })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Business Hours End</label>
                    <Input
                      type="time"
                      value={config.businessHours.end}
                      onChange={(e) => updateConfig({
                        businessHours: { ...config.businessHours, end: e.target.value }
                      })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Booking Requirements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="requireName"
                      checked={config.bookingSettings.requireName}
                      onChange={(e) => updateConfig({
                        bookingSettings: { ...config.bookingSettings, requireName: e.target.checked }
                      })}
                    />
                    <label htmlFor="requireName" className="text-sm font-medium">
                      Require Name
                    </label>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="requireEmail"
                      checked={config.bookingSettings.requireEmail}
                      onChange={(e) => updateConfig({
                        bookingSettings: { ...config.bookingSettings, requireEmail: e.target.checked }
                      })}
                    />
                    <label htmlFor="requireEmail" className="text-sm font-medium">
                      Require Email
                    </label>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="requirePhone"
                      checked={config.bookingSettings.requirePhone}
                      onChange={(e) => updateConfig({
                        bookingSettings: { ...config.bookingSettings, requirePhone: e.target.checked }
                      })}
                    />
                    <label htmlFor="requirePhone" className="text-sm font-medium">
                      Require Phone
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="emailEnabled"
                    checked={config.notifications.emailEnabled}
                    onChange={(e) => updateConfig({
                      notifications: { ...config.notifications, emailEnabled: e.target.checked }
                    })}
                  />
                  <label htmlFor="emailEnabled" className="text-sm font-medium">
                    Enable Email Notifications
                  </label>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Email Template</label>
                  <textarea
                    value={config.notifications.emailTemplate}
                    onChange={(e) => updateConfig({
                      notifications: { ...config.notifications, emailTemplate: e.target.value }
                    })}
                    className="w-full px-3 py-2 border rounded-md"
                    rows={4}
                    placeholder="Email template with variables like {customerName}, {meetingType}, {date}, {time}"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Recent Bookings</h3>
              <Button onClick={refreshData} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>

            <div className="space-y-4">
              {bookings.length > 0 ? (
                bookings.slice(0, 10).map((booking) => (
                  <Card key={booking.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-medium">{booking.customerName}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              booking.status === 'confirmed'
                                ? 'bg-green-100 text-green-800'
                                : booking.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {booking.status}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <div>{booking.customerEmail}</div>
                            <div>
                              {new Date(booking.startTime).toLocaleDateString()} at{' '}
                              {new Date(booking.startTime).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                            <div>{booking.meetingType} ({booking.duration} minutes)</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline">
                            View Details
                          </Button>
                          <Button size="sm" variant="outline">
                            Reschedule
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Bookings Yet</h3>
                    <p className="text-gray-600">
                      Bookings will appear here once customers schedule meetings with you.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
