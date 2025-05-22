import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import { getDoctorById, createAppointment, isAppointmentSlotAvailable } from '../../lib/queries';
import { getAuthToken } from '../../lib/auth';
import { formatCurrency, formatDate, formatTime, generateTimeSlots, getMinBookingDate, getMaxBookingDate } from '../../lib/utils';
import { User, Star, Clock, DollarSign, Calendar, ArrowLeft, CheckCircle, AlertCircle, Phone, Mail, MapPin } from 'lucide-react';
import Link from 'next/link';

export default function DoctorDetail() {
  const [doctor, setDoctor] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    appointment_date: '',
    appointment_time: '',
    reason: ''
  });
  const [availableSlots, setAvailableSlots] = useState([]);
  const [checkingSlots, setCheckingSlots] = useState(false);
  const router = useRouter();
  const { id } = router.query;


useEffect(() => {
  const user = getAuthToken();
  if (!user) {
    router.replace('/login');
  }
}, [router]);

  useEffect(() => {
    setUser(getAuthToken());
    if (id) {
      loadDoctor();
    }
  }, [id]);

  useEffect(() => {
    if (formData.appointment_date) {
      checkAvailableSlots();
    }
  }, [formData.appointment_date]);

  const loadDoctor = async () => {
    try {
      const result = await getDoctorById(id);

      if (result.rows.length === 0) {
        setError('Doctor not found');
      } else {
        setDoctor(result.rows[0]);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading doctor:', error);
      setError('Failed to load doctor information');
      setLoading(false);
    }
  };

  const checkAvailableSlots = async () => {
    if (!formData.appointment_date || !doctor) return;

    setCheckingSlots(true);
    try {
      const timeSlots = generateTimeSlots(9, 17, 30); // 9 AM to 5 PM, 30 min intervals
      const available = [];

      for (const time of timeSlots) {
        const isAvailable = await isAppointmentSlotAvailable(
          doctor.id,
          formData.appointment_date,
          time
        );
        if (isAvailable) {
          available.push(time);
        }
      }

      setAvailableSlots(available);
    } catch (error) {
      console.error('Error checking available slots:', error);
    } finally {
      setCheckingSlots(false);
    }
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      router.push('/login');
      return;
    }

    if (user.role !== 'patient') {
      setError('Only patients can book appointments');
      return;
    }

    if (!formData.appointment_date || !formData.appointment_time || !formData.reason.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    setBookingLoading(true);
    setError('');

    try {
      // Double-check slot availability
      const isAvailable = await isAppointmentSlotAvailable(
        id,
        formData.appointment_date,
        formData.appointment_time
      );

      if (!isAvailable) {
        setError('This time slot is no longer available. Please choose another time.');
        await checkAvailableSlots(); // Refresh available slots
        setBookingLoading(false);
        return;
      }

      // Create appointment
      await createAppointment({
        patient_id: user.id,
        doctor_id: id,
        appointment_date: formData.appointment_date,
        appointment_time: formData.appointment_time,
        reason: formData.reason.trim()
      });

      setBookingSuccess(true);
      setShowBookingForm(false);
      setFormData({ appointment_date: '', appointment_time: '', reason: '' });
      
    } catch (error) {
      console.error('Error booking appointment:', error);
      setError('Failed to book appointment. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const getRating = () => {
    // Simulate rating based on experience
    const baseRating = 3.5;
    const experienceBonus = Math.min((doctor?.experience_years || 0) / 20, 1);
    const rating = baseRating + experienceBonus * 1.5;
    return Math.min(rating, 5).toFixed(1);
  };

  const getPatientCount = () => {
    // Simulate patient count based on experience
    const base = 50;
    const experienceMultiplier = (doctor?.experience_years || 1) * 15;
    return base + experienceMultiplier + Math.floor(Math.random() * 100);
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

  if (error && !doctor) {
    return (
      <Layout>
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link
            href="/doctors"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Back to Doctors
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Back Button */}
        <Link
          href="/doctors"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Doctors
        </Link>

        {/* Success Message */}
        {bookingSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4 flex items-center space-x-2 fade-in">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <div>
              <p className="text-green-800 font-medium">Appointment Booked Successfully!</p>
              <p className="text-green-700 text-sm">
                Your appointment has been confirmed. You can view it in{' '}
                <Link href="/appointments" className="underline">
                  your appointments
                </Link>
                .
              </p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        {doctor && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Doctor Information */}
            <div className="lg:col-span-2 space-y-6">
              {/* Doctor Profile */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-start space-x-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="h-12 w-12 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                      {doctor.name}
                    </h1>
                    <p className="text-lg text-blue-600 font-medium mb-4">
                      {doctor.specialty}
                    </p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                      {doctor.category_name && (
                        <div className="flex items-center text-sm text-gray-600">
                          <span className="bg-gray-100 px-3 py-1 rounded-full">
                            {doctor.category_name}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex items-center text-sm text-gray-600">
                        <Star className="h-4 w-4 mr-2 text-yellow-400" />
                        <span>{getRating()} rating • {doctor.experience_years || 0} years experience</span>
                      </div>
                      
                      {doctor.consultation_fee > 0 && (
                        <div className="flex items-center text-sm text-gray-600">
                          <DollarSign className="h-4 w-4 mr-2 text-green-500" />
                          <span className="font-semibold text-green-600">{formatCurrency(doctor.consultation_fee)} consultation fee</span>
                        </div>
                      )}
                      
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="h-4 w-4 mr-2 text-blue-500" />
                        <span>{doctor.available_hours || '9:00 AM - 5:00 PM'}</span>
                      </div>
                    </div>

                    {/* Statistics */}
                    <div className="flex items-center space-x-6 text-sm text-gray-600 pt-4 border-t">
                      <div className="text-center">
                        <div className="font-semibold text-gray-900">{getPatientCount()}</div>
                        <div>Patients Treated</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-gray-900">{doctor.experience_years || 0}</div>
                        <div>Years Experience</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-gray-900">{getRating()}</div>
                        <div>Patient Rating</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* About Doctor */}
              {doctor.details && (
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    About Dr. {doctor.name.split(' ').pop()}
                  </h2>
                  <p className="text-gray-600 leading-relaxed">
                    {doctor.details}
                  </p>
                </div>
              )}

              {/* Availability */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Availability
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Available Days</h3>
                    <div className="flex flex-wrap gap-2">
                      {(doctor.available_days || 'Mon,Tue,Wed,Thu,Fri').split(',').map((day, index) => (
                        <span
                          key={index}
                          className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                        >
                          {day.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Available Hours</h3>
                    <p className="text-gray-600">{doctor.available_hours || '9:00 AM - 5:00 PM'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Booking Form */}
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Book an Appointment
                </h2>
                <form onSubmit={handleBookingSubmit} className="space-y-4">
                  <div>
                    <label
                      htmlFor="appointment_date"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Date
                    </label>
                    <input
                      type="date"
                      id="appointment_date"
                      name="appointment_date"
                      value={formData.appointment_date}
                      onChange={handleChange}
                      min={getMinBookingDate()}
                      max={getMaxBookingDate()}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="appointment_time"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Time
                    </label>
                    <select
                      id="appointment_time"
                      name="appointment_time"
                      value={formData.appointment_time}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      required
                    >
                      <option value="">Select a time</option>
                      {checkingSlots ? (
                        <option>Loading...</option>
                      ) : (
                        availableSlots.map((slot, index) => (
                          <option key={index} value={slot}>
                            {formatTime(slot)}
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor="reason"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Reason for Visit
                    </label>
                    <textarea
                      id="reason"
                      name="reason"
                      value={formData.reason}
                      onChange={handleChange}
                      rows="4"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      required
                    ></textarea>
                  </div>
                  <div>
                    <button
                      type="submit"
                      className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                      disabled={bookingLoading}
                    >
                      {bookingLoading ? 'Booking...' : 'Book Appointment'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}