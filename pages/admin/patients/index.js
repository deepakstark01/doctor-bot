import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../../components/Layout';
import Modal, { ConfirmModal } from '../../../components/Modal';
import { getAuthToken, requireAdmin } from '../../../lib/auth';
import { executeQuery } from '../../../lib/database';
import { formatDate } from '../../../lib/utils';
import { 
  Search, 
  Filter, 
  Users, 
  User, 
  Mail, 
  Phone,
  Calendar,
  Eye,
  Ban,
  CheckCircle,
  AlertTriangle,
  MoreVertical,
  Download,
  FileText
} from 'lucide-react';

export default function AdminPatients() {
  const [user, setUser] = useState(null);
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientAppointments, setPatientAppointments] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const currentUser = getAuthToken();
    if (!currentUser) {
      router.push('/login');
      return;
    }
    if (currentUser.role !== 'admin') {
      router.push('/');
      return;
    }
    
    setUser(currentUser);
    loadPatients();
  }, [router]);

  useEffect(() => {
    filterPatients();
  }, [patients, searchTerm, statusFilter]);

  const loadPatients = async () => {
    try {
      const result = await executeQuery(`
        SELECT u.*, 
               COUNT(a.id) as appointment_count,
               MAX(a.appointment_date) as last_appointment_date,
               COUNT(CASE WHEN a.status = 'completed' THEN 1 END) as completed_appointments,
               COUNT(CASE WHEN a.status = 'cancelled' THEN 1 END) as cancelled_appointments
        FROM users u
        LEFT JOIN appointments a ON u.id = a.patient_id
        WHERE u.role = 'patient'
        GROUP BY u.id, u.username, u.email, u.full_name, u.phone, u.is_active, u.created_at, u.updated_at
        ORDER BY u.created_at DESC
      `);

      setPatients(result.rows);
      setLoading(false);
    } catch (error) {
      console.error('Error loading patients:', error);
      setLoading(false);
    }
  };

  const filterPatients = () => {
    let filtered = patients;

    if (searchTerm) {
      filtered = filtered.filter(patient =>
        (patient.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      if (statusFilter === 'active') {
        filtered = filtered.filter(patient => patient.is_active);
      } else if (statusFilter === 'blocked') {
        filtered = filtered.filter(patient => !patient.is_active);
      }
    }

    setFilteredPatients(filtered);
  };

  const handleViewDetails = async (patient) => {
    setSelectedPatient(patient);
    setActionLoading(true);
    
    try {
      // Load patient's appointments
      const appointmentsResult = await executeQuery(`
        SELECT a.*, d.name as doctor_name, d.specialty as doctor_specialty
        FROM appointments a
        JOIN doctors d ON a.doctor_id = d.id
        WHERE a.patient_id = $1
        ORDER BY a.appointment_date DESC, a.appointment_time DESC
        LIMIT 10
      `, [patient.id]);

      setPatientAppointments(appointmentsResult.rows);
      setShowDetailsModal(true);
    } catch (error) {
      console.error('Error loading patient details:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleBlockUnblock = (patient) => {
    setSelectedPatient(patient);
    setShowBlockModal(true);
  };

  const handleBlockConfirm = async () => {
    setActionLoading(true);
    try {
      const newStatus = !selectedPatient.is_active;
      await executeQuery(
        'UPDATE users SET is_active = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [newStatus, selectedPatient.id]
      );

      await loadPatients();
      setShowBlockModal(false);
    } catch (error) {
      console.error('Error updating patient status:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const exportPatients = () => {
    const csvData = filteredPatients.map(patient => ({
      'Full Name': patient.full_name || '',
      'Username': patient.username,
      'Email': patient.email,
      'Phone': patient.phone || '',
      'Status': patient.is_active ? 'Active' : 'Blocked',
      'Appointments': patient.appointment_count || 0,
      'Completed': patient.completed_appointments || 0,
      'Cancelled': patient.cancelled_appointments || 0,
      'Joined': formatDate(patient.created_at),
      'Last Appointment': patient.last_appointment_date ? formatDate(patient.last_appointment_date) : 'Never'
    }));

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `patients-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusBadge = (isActive) => {
    if (isActive) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="h-3 w-3 mr-1" />
          Active
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <Ban className="h-3 w-3 mr-1" />
          Blocked
        </span>
      );
    }
  };

  const getAppointmentStatusColor = (status) => {
    switch (status) {
      case 'booked':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manage Patients</h1>
            <p className="text-gray-600 mt-2">
              View and manage patient accounts and their activity
            </p>
          </div>
          <button
            onClick={exportPatients}
            className="mt-4 sm:mt-0 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Export CSV</span>
          </button>
        </div>

        {/* Search and Filter */}
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search patients by name, username, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
              >
                <option value="all">All Patients</option>
                <option value="active">Active Only</option>
                <option value="blocked">Blocked Only</option>
              </select>
            </div>

            <div className="text-sm text-gray-600 flex items-center">
              Showing {filteredPatients.length} of {patients.length} patients
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">Total Patients</p>
                <p className="text-lg font-semibold text-gray-900">{patients.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-lg font-semibold text-gray-900">
                  {patients.filter(p => p.is_active).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <Ban className="h-4 w-4 text-red-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">Blocked</p>
                <p className="text-lg font-semibold text-gray-900">
                  {patients.filter(p => !p.is_active).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <Calendar className="h-4 w-4 text-purple-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">Total Appointments</p>
                <p className="text-lg font-semibold text-gray-900">
                  {patients.reduce((sum, p) => sum + (parseInt(p.appointment_count) || 0), 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Patients Table */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Appointments
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPatients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {patient.full_name || 'No name provided'}
                          </div>
                          <div className="text-sm text-gray-500">
                            @{patient.username}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div className="flex items-center mb-1">
                          <Mail className="h-4 w-4 text-gray-400 mr-2" />
                          {patient.email}
                        </div>
                        {patient.phone && (
                          <div className="flex items-center">
                            <Phone className="h-4 w-4 text-gray-400 mr-2" />
                            {patient.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(patient.is_active)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div className="font-medium">{patient.appointment_count || 0} total</div>
                        <div className="text-xs text-gray-500">
                          {patient.completed_appointments || 0} completed, {patient.cancelled_appointments || 0} cancelled
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>{formatDate(patient.created_at)}</div>
                      {patient.last_appointment_date && (
                        <div className="text-xs">
                          Last: {formatDate(patient.last_appointment_date)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleViewDetails(patient)}
                          className="text-blue-600 hover:text-blue-900 p-1"
                          title="View details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleBlockUnblock(patient)}
                          className={`p-1 ${
                            patient.is_active 
                              ? 'text-red-600 hover:text-red-900' 
                              : 'text-green-600 hover:text-green-900'
                          }`}
                          title={patient.is_active ? 'Block patient' : 'Unblock patient'}
                        >
                          {patient.is_active ? <Ban className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredPatients.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No patients found</h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter !== 'all'
                  ? 'Try adjusting your search criteria'
                  : 'No patients have registered yet'
                }
              </p>
            </div>
          )}
        </div>

        {/* Patient Details Modal */}
        <Modal
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          title={`Patient Details - ${selectedPatient?.full_name || selectedPatient?.username}`}
          size="xl"
        >
          {selectedPatient && (
            <div className="space-y-6">
              {/* Patient Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Full Name:</span>
                      <span className="text-sm font-medium">{selectedPatient.full_name || 'Not provided'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Username:</span>
                      <span className="text-sm font-medium">@{selectedPatient.username}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Email:</span>
                      <span className="text-sm font-medium">{selectedPatient.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Phone:</span>
                      <span className="text-sm font-medium">{selectedPatient.phone || 'Not provided'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Status:</span>
                      {getStatusBadge(selectedPatient.is_active)}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Account Information</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Joined:</span>
                      <span className="text-sm font-medium">{formatDate(selectedPatient.created_at)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Last Updated:</span>
                      <span className="text-sm font-medium">{formatDate(selectedPatient.updated_at)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Total Appointments:</span>
                      <span className="text-sm font-medium">{selectedPatient.appointment_count || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Completed:</span>
                      <span className="text-sm font-medium text-green-600">{selectedPatient.completed_appointments || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Cancelled:</span>
                      <span className="text-sm font-medium text-red-600">{selectedPatient.cancelled_appointments || 0}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Appointments */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Appointments</h3>
                {patientAppointments.length > 0 ? (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {patientAppointments.map((appointment) => (
                      <div key={appointment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">
                            Dr. {appointment.doctor_name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {appointment.doctor_specialty}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {formatDate(appointment.appointment_date)} at {appointment.appointment_time}
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getAppointmentStatusColor(appointment.status)}`}>
                          {appointment.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    <Calendar className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p>No appointments found</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </Modal>

        {/* Block/Unblock Confirmation Modal */}
        <ConfirmModal
          isOpen={showBlockModal}
          onClose={() => setShowBlockModal(false)}
          onConfirm={handleBlockConfirm}
          title={selectedPatient?.is_active ? 'Block Patient' : 'Unblock Patient'}
          message={
            selectedPatient?.is_active
              ? `Are you sure you want to block ${selectedPatient?.full_name || selectedPatient?.username}? They will not be able to log in or book appointments.`
              : `Are you sure you want to unblock ${selectedPatient?.full_name || selectedPatient?.username}? They will be able to log in and book appointments again.`
          }
          confirmText={selectedPatient?.is_active ? 'Block' : 'Unblock'}
          cancelText="Cancel"
          variant={selectedPatient?.is_active ? 'danger' : 'success'}
          isLoading={actionLoading}
        />
      </div>
    </Layout>
  );
}