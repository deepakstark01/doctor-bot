import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../components/Layout';
import { getAuthToken } from '../lib/auth';
import { 
  Calendar, 
  Clock, 
  Users, 
  Shield, 
  Star, 
  CheckCircle, 
  ArrowRight,
  Heart,
  Stethoscope,
  Activity,
  Phone,
  Mail,
  MapPin,
  ChevronRight
} from 'lucide-react';

export default function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalDoctors: 0,
    totalAppointments: 0,
    totalPatients: 0,
    specialties: 0
  });
  const router = useRouter();

  useEffect(() => {
    const currentUser = getAuthToken();
    setUser(currentUser);
    setLoading(false);
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // These would be actual API calls in a real application
      setStats({
        totalDoctors: 150,
        totalAppointments: 2500,
        totalPatients: 1200,
        specialties: 12
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const features = [
    {
      icon: Calendar,
      title: 'Easy Booking',
      description: 'Book appointments with your preferred doctors in just a few clicks'
    },
    {
      icon: Clock,
      title: '24/7 Access',
      description: 'Access our platform anytime, anywhere to manage your healthcare'
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your medical information is protected with industry-standard security'
    },
    {
      icon: Users,
      title: 'Expert Doctors',
      description: 'Connect with qualified healthcare professionals across various specialties'
    }
  ];

  const specialties = [
    { name: 'Cardiology', icon: Heart, color: 'bg-red-100 text-red-600' },
    { name: 'General Medicine', icon: Stethoscope, color: 'bg-blue-100 text-blue-600' },
    { name: 'Pediatrics', icon: Users, color: 'bg-green-100 text-green-600' },
    { name: 'Orthopedics', icon: Activity, color: 'bg-purple-100 text-purple-600' },
    { name: 'Dermatology', icon: Shield, color: 'bg-yellow-100 text-yellow-600' },
    { name: 'Neurology', icon: Activity, color: 'bg-indigo-100 text-indigo-600' }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Patient',
      content: 'This platform made it so easy to find and book appointments with specialists. Highly recommended!',
      rating: 5
    },
    {
      name: 'Dr. Michael Chen',
      role: 'Cardiologist',
      content: 'The system is intuitive and helps me manage my practice more efficiently.',
      rating: 5
    },
    {
      name: 'Emily Davis',
      role: 'Patient',
      content: 'Great experience! The doctors are professional and the booking process is seamless.',
      rating: 5
    }
  ];

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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-indigo-600/10"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                Your Health,{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  Our Priority
                </span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                Connect with qualified healthcare professionals and book appointments effortlessly. 
                Experience healthcare that's convenient, secure, and patient-centered.
              </p>
              
              {!user && (
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
                  <Link
                    href="/register"
                    className="bg-blue-600 text-white px-8 py-4 rounded-xl hover:bg-blue-700 transition-all transform hover:scale-105 flex items-center space-x-2 text-lg font-semibold"
                  >
                    <span>Get Started Today</span>
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                  <Link
                    href="/doctors"
                    className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-xl hover:bg-gray-50 transition-colors text-lg font-semibold"
                  >
                    Browse Doctors
                  </Link>
                </div>
              )}

              {user && user.role === 'patient' && (
                <div className="mb-12">
                  <Link
                    href="/doctors"
                    className="bg-blue-600 text-white px-8 py-4 rounded-xl hover:bg-blue-700 transition-all transform hover:scale-105 inline-flex items-center space-x-2 text-lg font-semibold"
                  >
                    <Calendar className="h-5 w-5" />
                    <span>Book Your Appointment</span>
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">{stats.totalDoctors}+</div>
                  <div className="text-gray-600">Expert Doctors</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">{stats.totalPatients}+</div>
                  <div className="text-gray-600">Happy Patients</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">{stats.totalAppointments}+</div>
                  <div className="text-gray-600">Appointments</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">{stats.specialties}+</div>
                  <div className="text-gray-600">Specialties</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Why Choose Our Platform?
              </h2>
              <p className="text-xl text-gray-600">
                Experience healthcare that's designed around your needs
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="text-center group hover:transform hover:scale-105 transition-all duration-300">
                  <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-600 transition-colors">
                    <feature.icon className="h-8 w-8 text-blue-600 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Specialties Section */}
        <section id="specialties" className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Medical Specialties
              </h2>
              <p className="text-xl text-gray-600">
                Find doctors across various medical specialties
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {specialties.map((specialty, index) => (
                <Link
                  key={index}
                  href="/doctors"
                  className="bg-white rounded-xl p-6 hover:shadow-lg transition-all duration-300 transform hover:scale-105 group"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${specialty.color}`}>
                      <specialty.icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{specialty.name}</h3>
                      <p className="text-gray-600">Find specialists</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                What Our Users Say
              </h2>
              <p className="text-xl text-gray-600">
                Real experiences from patients and healthcare providers
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="bg-gray-50 rounded-xl p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-4">"{testimonial.content}"</p>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-gray-600 text-sm">{testimonial.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        {!user && (
          <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to Get Started?
              </h2>
              <p className="text-xl text-blue-100 mb-8">
                Join thousands of patients who trust us with their healthcare needs
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/register"
                  className="bg-white text-blue-600 px-8 py-4 rounded-xl hover:bg-gray-100 transition-colors font-semibold"
                >
                  Create Your Account
                </Link>
                <Link
                  href="/doctors"
                  className="border-2 border-white text-white px-8 py-4 rounded-xl hover:bg-white hover:text-blue-600 transition-colors font-semibold"
                >
                  Browse Doctors
                </Link>
              </div>
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
}