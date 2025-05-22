import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../../components/Layout';
import { getDb } from '../../lib/db';
import { getAuthToken } from '../../lib/auth';
import { Calendar, Clock, User, AlertCircle, CheckCircle, X } from 'lucide-react';

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filter, setFilter] = useState('all'); // all, upcoming, past, cancelled
  const router = useRouter();

  useEffect(() => {
    const currentUser = getAuthToken();
    if (!currentUser) {
      router.push('/login');
      return;
    }
    if (currentUser.role !== 'patient') {
      router.push('/');
      return;
    }
    setUser(currentUser);
    loadAppointments(currentUser.id);
  }, [router]);

const loadAppointments = async (patientId) => {
  try {
    const db = await getDb();
    const result = await db.query(`
      SELECT a.*, d.name as doctor_name, c.name as category_name
      FROM appointments a
      JOIN doctors d ON a.doctor_id = d.id
      LEFT JOIN categories c ON d.category_id = c.id
      WHERE a.patient_id = $1
      ORDER BY a.appointment_date DESC, a.appointment_time DESC
    `, [patientId]);
    
    setAppointments(result.rows);
    setLoading(false);
  } catch (error) {
    console.error('Error loading appointments:', error);
    setError('Failed to load appointments');
    setLoading(false);
  }
};

  const handleCancelAppointment = async (appointmentId) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) {
      return;
    }

    setActionLoading(appointmentId);
    setError('');

    try {
      const db = await getDb();
      await db.query(
        'UPDATE appointments SET status = $1 WHERE id = $2',
        ['cancelled', appointmentId]
      );

      setAppointments(appointments.map(apt => 
        apt.id === appointmentId ? { ...apt, status: 'cancelled' } : apt
      ));
      setSuccess('Appointment cancelled successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      setError('Failed to cancel appointment');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'booked':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const isUpcoming = (appointmentDate, appointmentTime) => {
    const appointmentDateTime = new Date(`${appointmentDate} ${appointmentTime}`);
    return appointmentDateTime > new Date();
  };

  const filteredAppointments = appointments.filter(appointment => {
    const upcoming = isUpcoming(appointment.appointment_date, appointment.appointment_time);
    
    switch (filter) {
      case 'upcoming':
        return upcoming && appointment.status === 'booked';
      case 'past':
        return !upcoming || appointment.status === 'completed';
      case 'cancelled':
        return appointment.status === 'cancelled';
      default:
        return true;
    }
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01 ${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-64">
          <div className="loading-spinner h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Appointments</h1>
            <p className="text-gray-600 mt-2">
              Manage your upcoming and past appointments
            </p>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4 flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-400" />
            <p className="text-sm text-green-600">{success}</p>
          </div>
        )}
        {appointments.length === 0 && (
          <div className="bg-white border border-gray-200 rounded-md p-4">
            <p className="text-gray-600">No appointments found.</p>
          </div>
        )}
        {appointments.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-md p-4">
            <p className="text-gray-600">You have {appointments.length} appointments.</p>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {[
                { key: 'all', label: 'All Appointments', count: appointments.length },
                { key: 'upcoming', label: 'Upcoming', count: appointments.filter(apt => isUpcoming(apt.appointment_date, apt.appointment_time) && apt.status === 'booked').length },
                { key: 'past', label: 'Past', count: appointments.filter(apt => !isUpcoming(apt.appointment_date, apt.appointment_time) || apt.status === 'completed').length },
                { key: 'cancelled', label: 'Cancelled', count: appointments.filter(apt => apt.status === 'cancelled').length }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    filter === tab.key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                      filter === tab.key
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Appointments List */}
          <div className="p-6">
            {filteredAppointments.length > 0 ? (
              <div className="space-y-4">
                {filteredAppointments.map((appointment) => {
                  const upcoming = isUpcoming(appointment.appointment_date, appointment.appointment_time);
                  return (
                    <div
                      key={appointment.id}
                      className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                              <User className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">
                                {appointment.doctor_name}
                              </h3>
                              <p className="text-blue-600 font-medium">
                                {appointment.doctor_specialty}
                              </p>
                              {appointment.category_name && (
                                <p className="text-sm text-gray-500">
                                  {appointment.category_name}
                                </p>
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
                        </div>

                        <div className="flex flex-col items-end space-y-3">
                          {/* Status Badge */}
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(appointment.status)}`}>
                            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                          </span>

                          {/* Action Buttons */}
                          {upcoming && appointment.status === 'booked' && (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleCancelAppointment(appointment.id)}
                                disabled={actionLoading === appointment.id}
                                className="flex items-center space-x-1 px-3 py-1 text-sm text-red-600 hover:text-red-700 border border-red-200 rounded hover:bg-red-50 transition-colors disabled:opacity-50"
                              >
                                {actionLoading === appointment.id ? (
                                  <div className="loading-spinner h-3 w-3 border-2 border-red-600 border-t-transparent rounded-full"></div>
                                ) : (
                                  <X className="h-3 w-3" />
                                )}
                                <span>Cancel</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Appointment Footer */}
                      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                        <span>
                          Booked on {new Date(appointment.created_at).toLocaleDateString()}
                        </span>
                        {upcoming && appointment.status === 'booked' && (
                          <span className="text-green-600 font-medium">
                            {appointment.appointment_date === new Date().toISOString().split('T')[0] 
                              ? 'Today'
                              : `${Math.ceil((new Date(appointment.appointment_date) - new Date()) / (1000 * 60 * 60 * 24))} days to go`
                            }
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {filter === 'all' && 'No appointments found'}
                  {filter === 'upcoming' && 'No upcoming appointments'}
                  {filter === 'past' && 'No past appointments'}
                  {filter === 'cancelled' && 'No cancelled appointments'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {filter === 'upcoming' 
                    ? "You don't have any upcoming appointments. Book one with your preferred doctor."
                    : "You haven't made any appointments yet. Start by browsing our qualified doctors."
                  }
                </p>
                <Link
                  href="/doctors"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Book Appointment
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        {appointments.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-blue-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-lg font-semibold text-gray-900">{appointments.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Clock className="h-4 w-4 text-green-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-600">Upcoming</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {appointments.filter(apt => isUpcoming(apt.appointment_date, apt.appointment_time) && apt.status === 'booked').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-gray-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {appointments.filter(apt => apt.status === 'completed').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <X className="h-4 w-4 text-red-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-600">Cancelled</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {appointments.filter(apt => apt.status === 'cancelled').length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}