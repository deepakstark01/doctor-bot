import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import { getAllDoctors, getAllCategories } from '../../lib/queries';
import { formatCurrency } from '../../lib/utils';
import { Search, Filter, Star, Clock, DollarSign, User, MapPin, Calendar } from 'lucide-react';
import Link from 'next/link';
import { getAuthToken } from '../../lib/auth'; // adjust the path as needed

export default function DoctorsList() {
  const [doctors, setDoctors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('name'); // name, experience, fee
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const router = useRouter();


useEffect(() => {
  const user = getAuthToken();
  if (!user) {
    router.replace('/login');
  }
}, [router]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // Apply filters when search term, category, or sort changes
    filterDoctors();
  }, [doctors, searchTerm, selectedCategory, sortBy]);

  useEffect(() => {
    // Check for specialty filter from URL
    if (router.query.specialty) {
      setSelectedCategory(router.query.specialty);
    }
  }, [router.query.specialty]);

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
    let filtered = [...doctors];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(doctor =>
        doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (doctor.category_name && doctor.category_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (doctor.details && doctor.details.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(doctor =>
        doctor.category_name === selectedCategory ||
        doctor.specialty.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Sort doctors
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'experience':
          return (b.experience_years || 0) - (a.experience_years || 0);
        case 'fee':
          return (a.consultation_fee || 0) - (b.consultation_fee || 0);
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

    setFilteredDoctors(filtered);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSortBy('name');
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
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Find Your Doctor</h1>
          <p className="text-gray-600 mt-2 max-w-2xl mx-auto">
            Browse our qualified doctors across various specialties and book an appointment that fits your schedule
          </p>
        </div>

        {/* Search and Filter */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search doctors, specialties..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="">All Specialties</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="name">Sort by Name</option>
                <option value="experience">Sort by Experience</option>
                <option value="fee">Sort by Fee (Low to High)</option>
              </select>
            </div>
          </div>

          {/* Active Filters */}
          {(searchTerm || selectedCategory || sortBy !== 'name') && (
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm text-gray-600">Active filters:</span>
              {searchTerm && (
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                  Search: "{searchTerm}"
                  <button
                    onClick={() => setSearchTerm('')}
                    className="hover:text-blue-600 ml-1"
                  >
                    ×
                  </button>
                </span>
              )}
              {selectedCategory && (
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                  Category: {selectedCategory}
                  <button
                    onClick={() => setSelectedCategory('')}
                    className="hover:text-blue-600 ml-1"
                  >
                    ×
                  </button>
                </span>
              )}
              {sortBy !== 'name' && (
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                  Sort: {sortBy}
                  <button
                    onClick={() => setSortBy('name')}
                    className="hover:text-blue-600 ml-1"
                  >
                    ×
                  </button>
                </span>
              )}
              <button
                onClick={clearFilters}
                className="text-sm text-gray-500 hover:text-gray-700 underline"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {filteredDoctors.length} doctor{filteredDoctors.length !== 1 ? 's' : ''}
            {selectedCategory && ` in ${selectedCategory}`}
          </div>
          {filteredDoctors.length > 0 && (
            <div className="text-sm text-gray-500">
              Sorted by {sortBy === 'name' ? 'name' : sortBy === 'experience' ? 'experience' : 'consultation fee'}
            </div>
          )}
        </div>

        {/* Doctors Grid */}
        {filteredDoctors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDoctors.map((doctor) => (
              <div
                key={doctor.id}
                className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-all duration-200 overflow-hidden"
              >
                <div className="p-6">
                  {/* Doctor Header */}
                  <div className="flex items-start space-x-4 mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {doctor.name}
                      </h3>
                      <p className="text-blue-600 font-medium text-sm">
                        {doctor.specialty}
                      </p>
                      {doctor.category_name && (
                        <span className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-xs mt-1">
                          {doctor.category_name}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Doctor Stats */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Star className="h-4 w-4 mr-2 text-yellow-500" />
                      <span>{doctor.experience_years || 0} years exp.</span>
                    </div>
                    
                    {doctor.consultation_fee > 0 && (
                      <div className="flex items-center text-sm text-gray-600">
                        <DollarSign className="h-4 w-4 mr-2 text-green-500" />
                        <span className="font-semibold text-green-600">
                          {formatCurrency(doctor.consultation_fee)}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex items-center text-sm text-gray-600 col-span-2">
                      <Clock className="h-4 w-4 mr-2 text-blue-500" />
                      <span>{doctor.available_hours || '9:00 AM - 5:00 PM'}</span>
                    </div>
                  </div>

                  {/* Available Days */}
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-2">Available Days:</p>
                    <div className="flex flex-wrap gap-1">
                      {(doctor.available_days || 'Mon,Tue,Wed,Thu,Fri').split(',').map((day, index) => (
                        <span
                          key={index}
                          className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-medium"
                        >
                          {day.trim()}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Doctor Description */}
                  {doctor.details && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                      {doctor.details}
                    </p>
                  )}

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    <Link
                      href={`/doctors/${doctor.id}`}
                      className="block w-full bg-blue-600 text-white text-center py-2 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium"
                    >
                      Book Appointment
                    </Link>
                    <Link
                      href={`/doctors/${doctor.id}`}
                      className="block w-full bg-gray-100 text-gray-700 text-center py-2 px-4 rounded-md hover:bg-gray-200 transition-colors text-sm"
                    >
                      View Profile
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No doctors found
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || selectedCategory
                ? 'Try adjusting your search criteria or browse all doctors.'
                : 'No doctors are currently available.'
              }
            </p>
            {(searchTerm || selectedCategory) && (
              <button
                onClick={clearFilters}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear filters
              </button>
            )}
          </div>
        )}

        {/* Popular Specialties */}
        {!searchTerm && !selectedCategory && (
          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Popular Specialties</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {categories.slice(0, 10).map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.name)}
                  className="p-3 bg-white rounded-lg border text-center hover:shadow-md hover:border-blue-300 transition-all text-sm"
                >
                  <div className="font-medium text-gray-900">{category.name}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {doctors.filter(d => d.category_name === category.name).length} doctors
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Why Choose Us */}
        <div className="bg-blue-50 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Why Choose Our Doctors?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Star className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-medium text-gray-900 mb-2">Experienced Professionals</h3>
              <p className="text-sm text-gray-600">
                All our doctors are board-certified with years of experience in their specialties.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-medium text-gray-900 mb-2">Easy Scheduling</h3>
              <p className="text-sm text-gray-600">
                Book appointments online with flexible time slots that fit your schedule.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <MapPin className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-medium text-gray-900 mb-2">Quality Care</h3>
              <p className="text-sm text-gray-600">
                Receive personalized, high-quality medical care from trusted healthcare providers.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}