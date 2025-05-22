import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../../components/AdminLayout';
import { getDb } from '../../../lib/database';
import { getAuthToken } from '../../../lib/auth';
import { 
  Calendar, 
  Clock, 
  User, 
  ChevronDown, 
  Search, 
  Filter, 
  Check, 
  X, 
  AlertCircle, 
  Download,
  RefreshCw,
  PlusCircle,
  Trash,
  Edit
} from 'lucide-react';
import { format, parseISO } from 'date-fns';

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [isExporting, setIsExporting] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated and is an admin
    const user = getAuthToken();
    if (!user || user.role !== 'admin') {
      router.push('/login?redirect=/admin/appointments');
      return;
    }

    fetchAppointments();
  }, [router]);

  const fetchAppointments = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const db = await getDb();
      const result = await db.query(`
  SELECT a.*, 
    d.name as doctor_name, 
    d.specialty as doctor_specialty, 
    c.name as category_name, 
    u.full_name as patient_name, 
    u.email as patient_email
  FROM appointments a
  JOIN doctors d ON a.doctor_id = d.id
  LEFT JOIN categories c ON d.category_id = c.id
  JOIN users u ON a.patient_id = u.id
  ORDER BY a.appointment_date DESC, a.appointment_time DESC
`);

      
      setAppointments(result.rows);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError('Failed to load appointments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAppointment = async () => {
    if (!selectedAppointment) return;
    
    try {
      const db = await getDb();
      await db.query('DELETE FROM appointments WHERE id = $1', [selectedAppointment.id]);
      
      // Update the local state
      setAppointments(appointments.filter(appt => appt.id !== selectedAppointment.id));
      setIsDeleteModalOpen(false);
      setSelectedAppointment(null);
      
    } catch (err) {
      console.error('Error deleting appointment:', err);
      setError('Failed to delete appointment. Please try again.');
    }
  };

  const handleStatusChange = async (appointmentId, newStatus) => {
    try {
      const db = await getDb();
      await db.query(
        'UPDATE appointments SET status = $1 WHERE id = $2',
        [newStatus, appointmentId]
      );
      
      // Update the local state
      setAppointments(appointments.map(appt => 
        appt.id === appointmentId ? { ...appt, status: newStatus } : appt
      ));
      
    } catch (err) {
      console.error('Error updating appointment status:', err);
      setError('Failed to update appointment status. Please try again.');
    }
  };

  const exportToCSV = () => {
    setIsExporting(true);
    
    try {
      // Filter and transform appointments for export
      const filteredData = getFilteredAppointments().map(appt => ({
        ID: appt.id,
        Date: format(parseISO(appt.appointment_date), 'yyyy-MM-dd HH:mm'),
        Patient: appt.patient_name,
        Doctor: appt.doctor_name,
        Specialty: appt.specialty,
        Status: appt.status,
        Reason: appt.reason
      }));
      
      // Convert to CSV
      const headers = Object.keys(filteredData[0]).join(',');
      const rows = filteredData.map(obj => 
        Object.values(obj).map(value => `"${value}"`).join(',')
      );
      const csv = [headers, ...rows].join('\n');
      
      // Create download link
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `appointments_${format(new Date(), 'yyyy-MM-dd')}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
    } catch (err) {
      console.error('Error exporting appointments:', err);
      setError('Failed to export appointments. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const getFilteredAppointments = () => {
    return appointments.filter(appointment => {
      // Apply search filter
      const searchMatch = 
        appointment.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment.doctor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment.reason?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment.id.toString().includes(searchTerm);
      
      // Apply status filter
      const statusMatch = statusFilter === 'all' || appointment.status === statusFilter;
      
      // Apply date filter
      let dateMatch = true;
      const appointmentDate = appointment.appointment_date;

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (dateFilter === 'today') {
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        dateMatch = appointmentDate >= today && appointmentDate < tomorrow;
      } else if (dateFilter === 'upcoming') {
        dateMatch = appointmentDate >= today;
      } else if (dateFilter === 'past') {
        dateMatch = appointmentDate < today;
      }
      
      return searchMatch && statusMatch && dateMatch;
    });
  };

  const getSortedAppointments = () => {
    const filtered = getFilteredAppointments();
    
    return filtered.sort((a, b) => {
      let comparison = 0;
      
      if (sortBy === 'date') {
        comparison = new Date(a.appointment_date) - new Date(b.appointment_date);
      } else if (sortBy === 'patient') {
        comparison = a.patient_name.localeCompare(b.patient_name);
      } else if (sortBy === 'doctor') {
        comparison = a.doctor_name.localeCompare(b.doctor_name);
      } else if (sortBy === 'status') {
        comparison = a.status.localeCompare(b.status);
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'no-show':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredAndSortedAppointments = getSortedAppointments();

  return (
    <AdminLayout title="Appointment Management | Admin">
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <div className="flex flex-wrap items-center justify-between">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Appointment Management
            </h3>
            <div className="flex items-center mt-2 sm:mt-0">
              <button
                onClick={fetchAppointments}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-3"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </button>
              <button
                onClick={() => router.push('/admin/appointments/create')}
                className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                New Appointment
              </button>
            </div>
          </div>
        </div>
        
        {/* Filters Section */}
        <div className="px-4 py-4 sm:px-6 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Search */}
            <div className="relative flex-1 min-w-[250px]">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Search appointments..."
              />
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              {/* Status Filter */}
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="block pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="all">All Status</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="pending">Pending</option>
                  <option value="no-show">No Show</option>
                </select>
              </div>
              
              {/* Date Filter */}
              <div className="relative">
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="block pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="all">All Dates</option>
                  <option value="today">Today</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="past">Past</option>
                </select>
              </div>
              
              {/* Export Button */}
              <button
                onClick={exportToCSV}
                disabled={isExporting || filteredAndSortedAppointments.length === 0}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isExporting ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
        
        {/* Appointments Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-6 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
              <p className="mt-4 text-gray-600">Loading appointments...</p>
            </div>
          ) : error ? (
            <div className="p-6 text-center">
              <AlertCircle className="h-10 w-10 mx-auto text-red-500" />
              <p className="mt-4 text-red-600">{error}</p>
              <button 
                onClick={fetchAppointments}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </button>
            </div>
          ) : filteredAndSortedAppointments.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-gray-600">No appointments found matching your criteria.</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('date')}
                  >
                    <div className="flex items-center">
                      <span>Date & Time</span>
                      {sortBy === 'date' && (
                        <ChevronDown
                          className={`ml-1 h-4 w-4 transform ${sortOrder === 'asc' ? 'rotate-180' : ''}`}
                        />
                      )}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('patient')}
                  >
                    <div className="flex items-center">
                      <span>Patient</span>
                      {sortBy === 'patient' && (
                        <ChevronDown
                          className={`ml-1 h-4 w-4 transform ${sortOrder === 'asc' ? 'rotate-180' : ''}`}
                        />
                      )}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('doctor')}
                  >
                    <div className="flex items-center">
                      <span>Doctor</span>
                      {sortBy === 'doctor' && (
                        <ChevronDown
                          className={`ml-1 h-4 w-4 transform ${sortOrder === 'asc' ? 'rotate-180' : ''}`}
                        />
                      )}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Reason
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center">
                      <span>Status</span>
                      {sortBy === 'status' && (
                        <ChevronDown
                          className={`ml-1 h-4 w-4 transform ${sortOrder === 'asc' ? 'rotate-180' : ''}`}
                        />
                      )}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAndSortedAppointments.map((appointment) => (
                  <tr key={appointment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {format(appointment.appointment_date, 'MMM dd, yyyy')}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {format(appointment.appointment_date, 'h:mm a')}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                          <User className="h-4 w-4 text-gray-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {appointment.patient_name}
                          </div>
                          {appointment.patient_email && (
                            <div className="text-xs text-gray-500">
                              {appointment.patient_email}
                            </div>
                          )}
                          {appointment.patient_phone && (
                            <div className="text-xs text-gray-500">
                              {appointment.patient_phone}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        Dr. {appointment.doctor_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {appointment.specialty}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {appointment.reason || 'No reason specified'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(appointment.status)}`}>
                        {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => {
                            setSelectedAppointment(appointment);
                            setIsDetailsModalOpen(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View
                        </button>
                        <button
                          onClick={() => router.push(`/admin/appointments/edit/${appointment.id}`)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            setSelectedAppointment(appointment);
                            setIsDeleteModalOpen(true);
                          }}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      
      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && selectedAppointment && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <AlertCircle className="h-6 w-6 text-red-600" aria-hidden="true" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Delete Appointment
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete the appointment for{' '}
                        <span className="font-semibold">{selectedAppointment.patient_name}</span> on{' '}
                        <span className="font-semibold">
                          {format(parseISO(selectedAppointment.appointment_date), 'MMMM dd, yyyy')}
                        </span>?
                        This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleDeleteAppointment}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Delete
                </button>
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Appointment Details Modal */}
      {isDetailsModalOpen && selectedAppointment && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    Appointment Details
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsDetailsModalOpen(false)}
                    className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                  >
                    <X className="h-5 w-5" aria-hidden="true" />
                  </button>
                </div>
                
                <div className="border-t border-gray-200 pt-4">
                  <dl className="divide-y divide-gray-200">
                    <div className="py-3 flex justify-between">
                      <dt className="text-sm font-medium text-gray-500">Appointment ID</dt>
                      <dd className="text-sm text-gray-900 font-medium">{selectedAppointment.id}</dd>
                    </div>
                    <div className="py-3 flex justify-between">
                      <dt className="text-sm font-medium text-gray-500">Date & Time</dt>
                      <dd className="text-sm text-gray-900">{format(parseISO(selectedAppointment.appointment_date), 'PPPp')}</dd>
                    </div>
                    <div className="py-3 flex justify-between">
                      <dt className="text-sm font-medium text-gray-500">Status</dt>
                      <dd className="text-sm text-gray-900">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(selectedAppointment.status)}`}>
                          {selectedAppointment.status.charAt(0).toUpperCase() + selectedAppointment.status.slice(1)}
                        </span>
                      </dd>
                    </div>
                    <div className="py-3 space-y-1">
                      <dt className="text-sm font-medium text-gray-500">Patient Information</dt>
                      <dd className="text-sm text-gray-900">{selectedAppointment.patient_name}</dd>
                      {selectedAppointment.patient_email && (
                        <dd className="text-sm text-gray-500">{selectedAppointment.patient_email}</dd>
                      )}
                      {selectedAppointment.patient_phone && (
                        <dd className="text-sm text-gray-500">{selectedAppointment.patient_phone}</dd>
                      )}
                    </div>
                    <div className="py-3 space-y-1">
                      <dt className="text-sm font-medium text-gray-500">Doctor Information</dt>
                      <dd className="text-sm text-gray-900">Dr. {selectedAppointment.doctor_name}</dd>
                      <dd className="text-sm text-gray-500">{selectedAppointment.specialty}</dd>
                    </div>
                    <div className="py-3 space-y-1">
                      <dt className="text-sm font-medium text-gray-500">Reason for Visit</dt>
                      <dd className="text-sm text-gray-900">{selectedAppointment.reason || 'No reason specified'}</dd>
                    </div>
                    {selectedAppointment.notes && (
                      <div className="py-3 space-y-1">
                        <dt className="text-sm font-medium text-gray-500">Notes</dt>
                        <dd className="text-sm text-gray-900 whitespace-pre-wrap">{selectedAppointment.notes}</dd>
                      </div>
                    )}
                    <div className="py-3 space-y-1">
                      <dt className="text-sm font-medium text-gray-500">Created At</dt>
                      <dd className="text-sm text-gray-900">
                        {format(parseISO(selectedAppointment.created_at), 'PPPp')}
                      </dd>
                    </div>
                  </dl>
                </div>
                
                <div className="mt-5 border-t border-gray-200 pt-4">
                  <h4 className="text-sm font-medium text-gray-500 mb-3">Change Status</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        handleStatusChange(selectedAppointment.id, 'scheduled');
                        setSelectedAppointment({...selectedAppointment, status: 'scheduled'});
                      }}
                      className={`py-2 px-3 rounded-md text-sm font-medium ${
                        selectedAppointment.status === 'scheduled' 
                          ? 'bg-blue-100 text-blue-800 border border-blue-300' 
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      Scheduled
                    </button>
                    <button
                      onClick={() => {
                        handleStatusChange(selectedAppointment.id, 'completed');
                        setSelectedAppointment({...selectedAppointment, status: 'completed'});
                      }}
                      className={`py-2 px-3 rounded-md text-sm font-medium ${
                        selectedAppointment.status === 'completed' 
                          ? 'bg-green-100 text-green-800 border border-green-300' 
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      Completed
                    </button>
                    <button
                      onClick={() => {
                        handleStatusChange(selectedAppointment.id, 'cancelled');
                        setSelectedAppointment({...selectedAppointment, status: 'cancelled'});
                      }}
                      className={`py-2 px-3 rounded-md text-sm font-medium ${
                        selectedAppointment.status === 'cancelled' 
                          ? 'bg-red-100 text-red-800 border border-red-300' 
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      Cancelled
                    </button>
                    <button
                      onClick={() => {
                        handleStatusChange(selectedAppointment.id, 'no-show');
                        setSelectedAppointment({...selectedAppointment, status: 'no-show'});
                      }}
                      className={`py-2 px-3 rounded-md text-sm font-medium ${
                        selectedAppointment.status === 'no-show' 
                          ? 'bg-gray-100 text-gray-800 border border-gray-300' 
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      No Show
                    </button>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={() => router.push(`/admin/appointments/edit/${selectedAppointment.id}`)}
                  className="w-full inline-flex justify-center items-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  <Edit className="h-4 w-4 mr-2" /> Edit Appointment
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsDetailsModalOpen(false);
                    setSelectedAppointment(null);
                  }}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}