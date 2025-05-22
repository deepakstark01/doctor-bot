import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../../components/Layout';
import Modal, { ConfirmModal, FormModal } from '../../../components/Modal';
import { getAuthToken, requireAdmin } from '../../../lib/auth';
import { getAllDoctors, getAllCategories, createDoctor, updateDoctor, deleteDoctor } from '../../../lib/queries';
import { formatCurrency } from '../../../lib/utils';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  Stethoscope, 
  User, 
  Star, 
  DollarSign,
  Clock,
  Eye,
  MoreVertical
} from 'lucide-react';

export default function AdminDoctors() {
  const [user, setUser] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    specialty: '',
    category_id: '',
    details: '',
    experience_years: 0,
    consultation_fee: 0,
    available_days: 'Mon,Tue,Wed,Thu,Fri',
    available_hours: '09:00-17:00'
  });
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
    loadData();
  }, [router]);

  useEffect(() => {
    filterDoctors();
  }, [doctors, searchTerm, selectedCategory]);

  const loadData = async () => {
    try {
      const [doctorsResult, categoriesResult] = await Promise.all([
        getAllDoctors(),
        getAllCategories()
      ]);

      setDoctors(doctorsResult.rows);
      setCategories(categoriesResult.rows);
      setLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      setLoading(false);
    }
  };

  const filterDoctors = () => {
    let filtered = doctors;

    if (searchTerm) {
      filtered = filtered.filter(doctor =>
        doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(doctor => doctor.category_id == selectedCategory);
    }

    setFilteredDoctors(filtered);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      specialty: '',
      category_id: '',
      details: '',
      experience_years: 0,
      consultation_fee: 0,
      available_days: 'Mon,Tue,Wed,Thu,Fri',
      available_hours: '09:00-17:00'
    });
  };

  const handleAdd = () => {
    resetForm();
    setShowAddModal(true);
  };

  const handleEdit = (doctor) => {
    setSelectedDoctor(doctor);
    setFormData({
      name: doctor.name,
      specialty: doctor.specialty,
      category_id: doctor.category_id || '',
      details: doctor.details || '',
      experience_years: doctor.experience_years || 0,
      consultation_fee: doctor.consultation_fee || 0,
      available_days: doctor.available_days || 'Mon,Tue,Wed,Thu,Fri',
      available_hours: doctor.available_hours || '09:00-17:00'
    });
    setShowEditModal(true);
  };

  const handleDelete = (doctor) => {
    setSelectedDoctor(doctor);
    setShowDeleteModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);

    try {
      if (showEditModal) {
        await updateDoctor(selectedDoctor.id, formData);
      } else {
        await createDoctor(formData);
      }

      await loadData();
      setShowAddModal(false);
      setShowEditModal(false);
      resetForm();
    } catch (error) {
      console.error('Error saving doctor:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setActionLoading(true);
    try {
      await deleteDoctor(selectedDoctor.id);
      await loadData();
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Error deleting doctor:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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
            <h1 className="text-3xl font-bold text-gray-900">Manage Doctors</h1>
            <p className="text-gray-600 mt-2">
              Add, edit, and manage doctor profiles and availability
            </p>
          </div>
          <button
            onClick={handleAdd}
            className="mt-4 sm:mt-0 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Doctor</span>
          </button>
        </div>

        {/* Search and Filter */}
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search doctors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="text-sm text-gray-600 flex items-center">
              Showing {filteredDoctors.length} of {doctors.length} doctors
            </div>
          </div>
        </div>

        {/* Doctors Table */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Doctor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Specialty
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Experience
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Availability
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDoctors.map((doctor) => (
                  <tr key={doctor.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Stethoscope className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {doctor.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {doctor.category_name || 'No category'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{doctor.specialty}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Star className="h-4 w-4 text-yellow-400 mr-1" />
                        {doctor.experience_years || 0} years
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <DollarSign className="h-4 w-4 text-green-500 mr-1" />
                        {formatCurrency(doctor.consultation_fee || 0)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 text-blue-500 mr-1" />
                          {doctor.available_hours || '09:00-17:00'}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {(doctor.available_days || 'Mon,Tue,Wed,Thu,Fri').split(',').join(', ')}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleEdit(doctor)}
                          className="text-blue-600 hover:text-blue-900 p-1"
                          title="Edit doctor"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(doctor)}
                          className="text-red-600 hover:text-red-900 p-1"
                          title="Delete doctor"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredDoctors.length === 0 && (
            <div className="text-center py-12">
              <Stethoscope className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No doctors found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || selectedCategory 
                  ? 'Try adjusting your search criteria'
                  : 'Get started by adding your first doctor'
                }
              </p>
              <button
                onClick={handleAdd}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Add Doctor
              </button>
            </div>
          )}
        </div>

        {/* Add/Edit Doctor Modal */}
        <FormModal
          isOpen={showAddModal || showEditModal}
          onClose={() => {
            setShowAddModal(false);
            setShowEditModal(false);
            resetForm();
          }}
          onSubmit={handleSubmit}
          title={showEditModal ? 'Edit Doctor' : 'Add New Doctor'}
          submitText={showEditModal ? 'Update Doctor' : 'Add Doctor'}
          isLoading={actionLoading}
          size="lg"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Doctor Name *
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Dr. John Doe"
              />
            </div>

            {/* Specialty */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Specialty *
              </label>
              <input
                type="text"
                name="specialty"
                required
                value={formData.specialty}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Cardiologist"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                name="category_id"
                value={formData.category_id}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Experience Years */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Experience (Years)
              </label>
              <input
                type="number"
                name="experience_years"
                min="0"
                value={formData.experience_years}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Consultation Fee */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Consultation Fee ($)
              </label>
              <input
                type="number"
                name="consultation_fee"
                min="0"
                step="0.01"
                value={formData.consultation_fee}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Available Hours */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Available Hours
              </label>
              <input
                type="text"
                name="available_hours"
                value={formData.available_hours}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="09:00-17:00"
              />
            </div>
          </div>

          {/* Available Days */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Available Days
            </label>
            <input
              type="text"
              name="available_days"
              value={formData.available_days}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Mon,Tue,Wed,Thu,Fri"
            />
            <p className="text-xs text-gray-500 mt-1">
              Use comma-separated values (e.g., Mon,Tue,Wed,Thu,Fri)
            </p>
          </div>

          {/* Details */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Details
            </label>
            <textarea
              name="details"
              rows={4}
              value={formData.details}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Doctor's qualifications, experience, and specializations..."
            />
          </div>
        </FormModal>

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteConfirm}
          title="Delete Doctor"
          message={`Are you sure you want to delete Dr. ${selectedDoctor?.name}? This action cannot be undone and will affect all related appointments.`}
          confirmText="Delete"
          cancelText="Cancel"
          variant="danger"
          isLoading={actionLoading}
        />
      </div>
    </Layout>
  );
}