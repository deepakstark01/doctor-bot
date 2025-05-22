import { useState } from 'react';
import Link from 'next/link';
import { 
  Calendar, 
  Clock, 
  User, 
  MapPin, 
  Phone,
  Video,
  Edit3,
  Trash2,
  X,
  CheckCircle,
  AlertCircle,
  Info,
  MessageSquare,
  Navigation,
  Star,
  DollarSign
} from 'lucide-react';
import { formatDate, formatTime, getStatusColor, isUpcoming, getRelativeTime } from '../lib/utils';

export default function AppointmentCard({ 
  appointment, 
  variant = 'default', // 'default', 'compact', 'detailed', 'admin'
  showActions = true,
  onCancel,
  onReschedule,
  onComplete,
  onAddNotes,
  userRole = 'patient',
  className = ''
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showNotes, setShowNotes] = useState(false);

  const upcoming = isUpcoming(appointment.appointment_date, appointment.appointment_time);
  const isPast = !upcoming;
  const isToday = appointment.appointment_date === new Date().toISOString().split('T')[0];
  
  const handleAction = async (action, ...args) => {
    setIsLoading(true);
    try {
      await action(...args);
    } catch (error) {
      console.error('Action failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'booked':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'cancelled':
        return <X className="h-4 w-4 text-red-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'no-show':
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      default:
        return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTimeUntil = () => {
    if (!upcoming) return null;
    
    const appointmentDateTime = new Date(`${appointment.appointment_date} ${appointment.appointment_time}`);
    const now = new Date();
    const diffMs = appointmentDateTime.getTime() - now.getTime();
    const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (isToday) {
      if (diffHours <= 1) return 'Starting soon';
      if (diffHours <= 24) return `In ${diffHours} hours`;
    }
    
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays <= 7) return `In ${diffDays} days`;
    
    return null;
  };

  // Compact variant for mobile/list views
  if (variant === 'compact') {
    return (
      <div className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {userRole === 'admin' ? appointment.patient_name || appointment.patient_username : appointment.doctor_name}
              </p>
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <span>{formatDate(appointment.appointment_date)}</span>
                <span>•</span>
                <span>{formatTime(appointment.appointment_time)}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(appointment.status)}`}>
              {appointment.status}
            </span>
            {showActions && upcoming && appointment.status === 'booked' && (
              <button
                onClick={() => onCancel && handleAction(onCancel, appointment.id)}
                disabled={isLoading}
                className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Admin variant with additional controls
  if (variant === 'admin') {
    return (
      <div className={`bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow ${className}`}>
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Patient: {appointment.patient_name || appointment.patient_username}
                </h3>
                <p className="text-blue-600 font-medium">
                  Dr. {appointment.doctor_name} - {appointment.doctor_specialty}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {getStatusIcon(appointment.status)}
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(appointment.status)}`}>
                {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="h-4 w-4 mr-2" />
              <span>{formatDate(appointment.appointment_date)}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Clock className="h-4 w-4 mr-2" />
              <span>{formatTime(appointment.appointment_time)}</span>
            </div>
            <div className="text-sm text-gray-500">
              ID: #{appointment.id}
            </div>
            <div className="text-sm text-gray-500">
              Booked: {new Date(appointment.created_at).toLocaleDateString()}
            </div>
          </div>

          {appointment.reason && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-700">
                <strong>Reason:</strong> {appointment.reason}
              </p>
            </div>
          )}

          {appointment.notes && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Notes:</strong> {appointment.notes}
              </p>
            </div>
          )}

          {showActions && (
            <div className="flex flex-wrap gap-2">
              {appointment.status === 'booked' && (
                <>
                  <button
                    onClick={() => onComplete && handleAction(onComplete, appointment.id)}
                    disabled={isLoading}
                    className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                  >
                    Mark Complete
                  </button>
                  <button
                    onClick={() => onReschedule && handleAction(onReschedule, appointment.id)}
                    disabled={isLoading}
                    className="px-3 py-1 border border-blue-600 text-blue-600 text-sm rounded hover:bg-blue-50 transition-colors"
                  >
                    Reschedule
                  </button>
                  <button
                    onClick={() => onCancel && handleAction(onCancel, appointment.id)}
                    disabled={isLoading}
                    className="px-3 py-1 border border-red-600 text-red-600 text-sm rounded hover:bg-red-50 transition-colors"
                  >
                    Cancel
                  </button>
                </>
              )}
              <button
                onClick={() => setShowNotes(!showNotes)}
                className="px-3 py-1 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50 transition-colors"
              >
                {showNotes ? 'Hide' : 'Add'} Notes
              </button>
            </div>
          )}

          {showNotes && (
            <div className="mt-4 p-3 border border-gray-200 rounded-lg">
              <textarea
                placeholder="Add notes about this appointment..."
                className="w-full p-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
              <div className="flex justify-end space-x-2 mt-2">
                <button
                  onClick={() => setShowNotes(false)}
                  className="px-3 py-1 text-gray-600 text-sm hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={() => onAddNotes && onAddNotes(appointment.id)}
                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                >
                  Save Notes
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Detailed variant with rich information
  if (variant === 'detailed') {
    const timeUntil = getTimeUntil();
    
    return (
      <div className={`bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden ${className}`}>
        {/* Header with status indicator */}
        <div className={`h-2 ${
          appointment.status === 'booked' && upcoming ? 'bg-green-500' :
          appointment.status === 'completed' ? 'bg-blue-500' :
          appointment.status === 'cancelled' ? 'bg-red-500' : 'bg-gray-400'
        }`}></div>

        <div className="p-6">
          {/* Time indicator for upcoming appointments */}
          {timeUntil && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center">
                <Clock className="h-4 w-4 text-yellow-600 mr-2" />
                <span className="text-sm font-medium text-yellow-800">{timeUntil}</span>
              </div>
            </div>
          )}

          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {userRole === 'admin' ? appointment.patient_name || appointment.patient_username : appointment.doctor_name}
                </h3>
                <p className="text-blue-600 font-semibold">
                  {userRole === 'admin' ? `Dr. ${appointment.doctor_name}` : appointment.doctor_specialty}
                </p>
                {appointment.category_name && (
                  <span className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-xs mt-1">
                    {appointment.category_name}
                  </span>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-2 mb-2">
                {getStatusIcon(appointment.status)}
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(appointment.status)}`}>
                  {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                </span>
              </div>
              {isToday && (
                <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded">
                  Today
                </span>
              )}
            </div>
          </div>

          {/* Appointment details grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-blue-500 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Date</p>
                <p className="font-semibold text-gray-900">{formatDate(appointment.appointment_date)}</p>
              </div>
            </div>
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-green-500 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Time</p>
                <p className="font-semibold text-gray-900">{formatTime(appointment.appointment_time)}</p>
              </div>
            </div>
          </div>

          {/* Reason and notes */}
          {appointment.reason && (
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Reason for Visit</h4>
              <p className="text-gray-700 bg-blue-50 p-3 rounded-lg">{appointment.reason}</p>
            </div>
          )}

          {appointment.notes && (
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Notes</h4>
              <p className="text-gray-700 bg-yellow-50 p-3 rounded-lg">{appointment.notes}</p>
            </div>
          )}

          {/* Metadata */}
          <div className="flex items-center justify-between text-xs text-gray-500 mb-4 pt-4 border-t border-gray-100">
            <span>Appointment ID: #{appointment.id}</span>
            <span>Booked on {new Date(appointment.created_at).toLocaleDateString()}</span>
          </div>

          {/* Actions */}
          {showActions && (
            <div className="flex flex-wrap gap-2">
              {upcoming && appointment.status === 'booked' && (
                <>
                  <button
                    onClick={() => onReschedule && handleAction(onReschedule, appointment.id)}
                    disabled={isLoading}
                    className="flex items-center space-x-2 px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    <Edit3 className="h-4 w-4" />
                    <span>Reschedule</span>
                  </button>
                  <button
                    onClick={() => onCancel && handleAction(onCancel, appointment.id)}
                    disabled={isLoading}
                    className="flex items-center space-x-2 px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Cancel</span>
                  </button>
                </>
              )}
              
              {userRole === 'patient' && (
                <Link
                  href={`/doctors/${appointment.doctor_id}`}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <User className="h-4 w-4" />
                  <span>View Doctor</span>
                </Link>
              )}

              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                {isExpanded ? 'Show Less' : 'Show More'}
              </button>
            </div>
          )}

          {/* Expanded details */}
          {isExpanded && (
            <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
              <div className="text-sm">
                <span className="font-medium text-gray-900">Created:</span>
                <span className="text-gray-600 ml-2">{getRelativeTime(appointment.created_at)}</span>
              </div>
              {appointment.updated_at !== appointment.created_at && (
                <div className="text-sm">
                  <span className="font-medium text-gray-900">Last Updated:</span>
                  <span className="text-gray-600 ml-2">{getRelativeTime(appointment.updated_at)}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 ${className}`}>
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {userRole === 'admin' ? appointment.patient_name || appointment.patient_username : appointment.doctor_name}
              </h3>
              <p className="text-blue-600 font-medium">
                {userRole === 'admin' ? appointment.doctor_specialty : appointment.doctor_specialty}
              </p>
              {appointment.category_name && (
                <p className="text-sm text-gray-500">{appointment.category_name}</p>
              )}
            </div>
          </div>
          <div className="text-right">
            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(appointment.status)}`}>
              {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
            </span>
            {upcoming && appointment.status === 'booked' && getTimeUntil() && (
              <p className="text-xs text-green-600 font-medium mt-1">{getTimeUntil()}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="h-4 w-4 mr-2" />
            <span>{formatDate(appointment.appointment_date)}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Clock className="h-4 w-4 mr-2" />
            <span>{formatTime(appointment.appointment_time)}</span>
          </div>
        </div>

        {appointment.reason && (
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              <strong>Reason:</strong> {appointment.reason}
            </p>
          </div>
        )}

        {appointment.notes && (
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              <strong>Notes:</strong> {appointment.notes}
            </p>
          </div>
        )}

        {showActions && upcoming && appointment.status === 'booked' && (
          <div className="flex space-x-2">
            {onReschedule && (
              <button
                onClick={() => handleAction(onReschedule, appointment.id)}
                disabled={isLoading}
                className="flex items-center space-x-1 px-3 py-1 text-sm text-blue-600 hover:text-blue-700 border border-blue-200 rounded hover:bg-blue-50 transition-colors"
              >
                <Edit3 className="h-3 w-3" />
                <span>Reschedule</span>
              </button>
            )}
            {onCancel && (
              <button
                onClick={() => handleAction(onCancel, appointment.id)}
                disabled={isLoading}
                className="flex items-center space-x-1 px-3 py-1 text-sm text-red-600 hover:text-red-700 border border-red-200 rounded hover:bg-red-50 transition-colors"
              >
                <X className="h-3 w-3" />
                <span>Cancel</span>
              </button>
            )}
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <span>Booked on {new Date(appointment.created_at).toLocaleDateString()}</span>
          <span>ID: #{appointment.id}</span>
        </div>
      </div>
    </div>
  );
}