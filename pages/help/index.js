import React, { useState } from 'react';
import Layout from '../../components/Layout';
import { 
  Search, 
  ChevronDown, 
  ChevronUp, 
  MessageCircle, 
  Phone, 
  Mail, 
  HelpCircle,
  FileText,
  Shield,
  Calendar,
  CreditCard
} from 'lucide-react';
import Link from 'next/link';

export default function Help() {
  const [activeCategory, setActiveCategory] = useState('general');
  const [openQuestions, setOpenQuestions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleQuestion = (id) => {
    if (openQuestions.includes(id)) {
      setOpenQuestions(openQuestions.filter(q => q !== id));
    } else {
      setOpenQuestions([...openQuestions, id]);
    }
  };

  const faqCategories = [
    { id: 'general', name: 'General', icon: HelpCircle },
    { id: 'appointments', name: 'Appointments', icon: Calendar },
    { id: 'payment', name: 'Payment', icon: CreditCard },
    { id: 'privacy', name: 'Privacy & Security', icon: Shield },
    { id: 'policies', name: 'Policies', icon: FileText }
  ];

  const faqs = {
    general: [
      {
        id: 'general-1',
        question: 'What is MediCare?',
        answer: 'MediCare is a healthcare platform that connects patients with qualified doctors for online and in-person consultations. Our platform makes it easy to find doctors, schedule appointments, and manage your healthcare needs.'
      },
      {
        id: 'general-2',
        question: 'How do I create an account?',
        answer: 'To create an account, click on the "Get Started" button in the top right corner of the homepage. Fill in your personal details in the registration form, agree to the terms of service, and click "Sign Up". You\'ll receive a verification email to activate your account.'
      },
      {
        id: 'general-3',
        question: 'Is MediCare available in all locations?',
        answer: 'Currently, MediCare services are available in select regions. We are continuously expanding our network of healthcare providers to serve more locations. Please check our coverage area page or contact our support team for specific information about availability in your area.'
      }
    ],
    appointments: [
      {
        id: 'appointments-1',
        question: 'How do I book an appointment?',
        answer: 'To book an appointment, log in to your account, browse or search for doctors, select your preferred doctor, choose an available date and time slot, provide a reason for your visit, and confirm your booking. You\'ll receive a confirmation email with your appointment details.'
      },
      {
        id: 'appointments-2',
        question: 'How can I cancel or reschedule an appointment?',
        answer: 'To cancel or reschedule an appointment, go to the "My Appointments" section in your dashboard, find the appointment you wish to modify, and click on the "Cancel" or "Reschedule" button. Please note that cancellations made less than 24 hours before the appointment may incur a cancellation fee.'
      },
      {
        id: 'appointments-3',
        question: 'What should I do if I can\'t attend an appointment?',
        answer: 'If you can\'t attend an appointment, please cancel or reschedule as soon as possible to allow other patients to use that time slot. You can cancel through your dashboard or by contacting our support team. Late cancellations may be subject to our cancellation policy.'
      }
    ],
    payment: [
      {
        id: 'payment-1',
        question: 'What payment methods are accepted?',
        answer: 'We accept major credit and debit cards, PayPal, and mobile payment solutions. Payment is typically collected at the time of booking to confirm your appointment.'
      },
      {
        id: 'payment-2',
        question: 'Are there any additional fees?',
        answer: 'The appointment fee shown during booking includes all standard charges. There may be additional costs for specialized services, late cancellations, or no-shows. These will be clearly communicated before any charges are made.'
      }
    ],
    privacy: [
      {
        id: 'privacy-1',
        question: 'How is my medical information protected?',
        answer: 'We take data protection seriously. All medical information is encrypted and stored securely in compliance with healthcare privacy regulations. Access to your information is strictly limited to authorized healthcare providers involved in your care.'
      },
      {
        id: 'privacy-2',
        question: 'Who can see my health records?',
        answer: 'Only healthcare providers directly involved in your care have access to your health records. You can control and view who has accessed your information through the privacy settings in your account dashboard.'
      }
    ],
    policies: [
      {
        id: 'policies-1',
        question: 'What is the cancellation policy?',
        answer: 'Appointments can be cancelled or rescheduled up to 24 hours before the scheduled time without penalty. Late cancellations or no-shows may result in a fee of up to 50% of the appointment cost.'
      },
      {
        id: 'policies-2',
        question: 'What is the refund policy?',
        answer: 'Refunds are processed for cancelled appointments according to our cancellation policy. If you experience technical issues that prevent the consultation from taking place, you\'re eligible for a full refund or free rebooking.'
      }
    ]
  };

  const filteredFaqs = searchQuery
    ? Object.values(faqs).flat().filter(faq => 
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : faqs[activeCategory];

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Help Center</h1>
          <p className="text-gray-600 mt-2">
            Find answers to your questions and learn how to use our platform
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-8">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search for answers..."
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Categories */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Categories</h2>
              <nav className="space-y-1">
                {faqCategories.map((category) => {
                  const CategoryIcon = category.icon;
                  return (
                    <button
                      key={category.id}
                      className={`flex items-center px-4 py-3 w-full rounded-lg text-left ${
                        activeCategory === category.id && !searchQuery
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                      onClick={() => {
                        setActiveCategory(category.id);
                        setSearchQuery('');
                      }}
                    >
                      <CategoryIcon className={`h-5 w-5 mr-2 ${
                        activeCategory === category.id && !searchQuery
                          ? 'text-blue-500'
                          : 'text-gray-500'
                      }`} />
                      <span>{category.name}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-4 mt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Us</h2>
              <div className="space-y-4">
                <div className="flex items-start">
                  <MessageCircle className="h-5 w-5 text-gray-500 mt-0.5 mr-3" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Live Chat</h3>
                    <p className="text-xs text-gray-600">
                      Available 9:00 AM - 6:00 PM
                    </p>
                    <button className="text-blue-600 text-sm font-medium mt-1 hover:text-blue-700">
                      Start Chat
                    </button>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Mail className="h-5 w-5 text-gray-500 mt-0.5 mr-3" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Email</h3>
                    <p className="text-xs text-gray-600">
                      Response within 24 hours
                    </p>
                    <a href="mailto:support@medicare.com" className="text-blue-600 text-sm font-medium mt-1 hover:text-blue-700">
                      support@medicare.com
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Phone className="h-5 w-5 text-gray-500 mt-0.5 mr-3" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Phone</h3>
                    <p className="text-xs text-gray-600">
                      Mon-Fri 8:00 AM - 8:00 PM
                    </p>
                    <a href="tel:+1800123456" className="text-blue-600 text-sm font-medium mt-1 hover:text-blue-700">
                      +1 (800) 123-456
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ Content */}
          <div className="md:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                {searchQuery ? 'Search Results' : `Frequently Asked Questions - ${faqCategories.find(c => c.id === activeCategory).name}`}
              </h2>

              {filteredFaqs.length === 0 && (
                <div className="text-center py-8">
                  <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No results found
                  </h3>
                  <p className="text-gray-600">
                    We couldn't find answers matching your search. Try different keywords or contact our support team.
                  </p>
                </div>
              )}

              <dl className="space-y-6">
                {filteredFaqs.map((faq) => (
                  <div key={faq.id} className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0">
                    <dt className="text-lg font-medium text-gray-900">
                      <button
                        onClick={() => toggleQuestion(faq.id)}
                        className="flex justify-between items-center w-full text-left"
                      >
                        <span>{faq.question}</span>
                        {openQuestions.includes(faq.id) ? (
                          <ChevronUp className="h-5 w-5 text-gray-500" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-gray-500" />
                        )}
                      </button>
                    </dt>
                    {openQuestions.includes(faq.id) && (
                      <dd className="mt-4 text-gray-600">
                        <p>{faq.answer}</p>
                      </dd>
                    )}
                  </div>
                ))}
              </dl>
            </div>

            <div className="bg-blue-50 rounded-lg border border-blue-200 p-6 mt-6">
              <h3 className="text-lg font-medium text-blue-800 mb-2">Need more help?</h3>
              <p className="text-blue-700 mb-4">
                Can't find what you're looking for? Our support team is ready to assist you.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/contact"
                  className="bg-white text-blue-600 border border-blue-200 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                >
                  Contact Support
                </Link>
                <Link
                  href="/doctors"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  Find a Doctor
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};
