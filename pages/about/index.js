import React from "react";
import Layout from "../../components/Layout";
import { Mail, Phone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  Users,
  Shield,
  Activity,
  Heart,
  Clock,
  CheckCircle,
  Award,
  Smile,
  MapPin,
} from "lucide-react";

const About = () => {
  const teamMembers = [
    {
      name: "Dr. Sarah Johnson",
      role: "Chief Medical Officer",
      bio: "Board-certified physician with over 15 years of experience in healthcare innovation.",
      image: "/images/team/sarah.jpg",
    },
    {
      name: "Michael Chen",
      role: "Chief Technology Officer",
      bio: "Former tech lead at major healthcare companies with expertise in secure medical platforms.",
      image: "/images/team/michael.jpg",
    },
    {
      name: "Priya Patel",
      role: "Head of Patient Experience",
      bio: "Dedicated to creating seamless healthcare journeys for patients of all backgrounds.",
      image: "/images/team/priya.jpg",
    },
    {
      name: "James Wilson",
      role: "Chief Operations Officer",
      bio: "Experienced in healthcare operations and scaling digital health platforms globally.",
      image: "/images/team/james.jpg",
    },
  ];

  const values = [
    {
      icon: Heart,
      title: "Patient-Centered Care",
      description:
        "Everything we do is designed with patients' needs and experience in mind.",
    },
    {
      icon: Shield,
      title: "Privacy & Security",
      description:
        "We employ industry-leading security measures to protect your sensitive medical information.",
    },
    {
      icon: Users,
      title: "Accessibility",
      description:
        "Making healthcare accessible to everyone through intuitive technology.",
    },
    {
      icon: Activity,
      title: "Innovation",
      description:
        "Continuously improving our platform to deliver cutting-edge healthcare solutions.",
    },
  ];

  const milestones = [
    {
      year: "2018",
      title: "Foundation",
      description:
        "MedBlock was established with a mission to revolutionize healthcare access.",
    },
    {
      year: "2019",
      title: "First Platform Launch",
      description:
        "Released our first version connecting patients with specialists.",
    },
    {
      year: "2020",
      title: "Telehealth Integration",
      description:
        "Expanded services to include video consultations during the pandemic.",
    },
    {
      year: "2021",
      title: "Blockchain Integration",
      description:
        "Implemented secure blockchain technology for medical records.",
    },
    {
      year: "2022",
      title: "International Expansion",
      description: "Extended our services to multiple countries worldwide.",
    },
    {
      year: "2023",
      title: "Mobile App Launch",
      description: "Released native mobile applications for iOS and Android.",
    },
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              About MedBlock
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Transforming healthcare through secure, accessible and
              patient-centered digital solutions.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                At MedBlock, we're on a mission to transform healthcare delivery
                by creating a secure, accessible platform that connects patients
                with quality healthcare providers while ensuring the privacy and
                integrity of medical records.
              </p>
              <p className="text-lg text-gray-600 mb-6">
                Our blockchain-powered platform ensures that your medical
                information is always secure, accessible only to authorized
                personnel, and completely under your control.
              </p>
              <div className="flex items-center space-x-2 text-blue-600">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Secure medical records</span>
              </div>
              <div className="flex items-center space-x-2 text-blue-600 mt-2">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Easy appointment booking</span>
              </div>
              <div className="flex items-center space-x-2 text-blue-600 mt-2">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">
                  Patient-doctor communication
                </span>
              </div>
            </div>
            <div className="relative h-96 rounded-lg overflow-hidden shadow-xl">
              <div className="absolute inset-0 bg-blue-600 opacity-20"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <Heart className="h-20 w-20 text-white mx-auto" />
                  <h3 className="text-2xl font-bold text-white mt-4">
                    Caring for Your Health
                  </h3>
                  <p className="text-white mt-2 max-w-md mx-auto">
                    We believe that everyone deserves access to quality
                    healthcare
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Our Values
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              The principles that guide everything we do at MedBlock
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-sm p-8 hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <value.icon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {value.title}
                </h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Our Journey
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              The key milestones that have shaped MedBlock
            </p>
          </div>

          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-blue-100"></div>
            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <div
                  key={index}
                  className={`relative flex items-start ${
                    index % 2 === 0 ? "justify-start" : "flex-row-reverse"
                  }`}
                >
                  <div className="w-6 h-6 bg-blue-500 absolute left-1/2 transform -translate-x-1/2 rounded-full border-4 border-white"></div>
                  <div
                    className={`bg-white rounded-lg shadow-sm p-6 max-w-md ${
                      index % 2 === 0 ? "mr-16" : "ml-16"
                    }`}
                  >
                    <span className="text-blue-600 font-bold">
                      {milestone.year}
                    </span>
                    <h3 className="text-xl font-semibold text-gray-900 mt-1">
                      {milestone.title}
                    </h3>
                    <p className="text-gray-600 mt-2">
                      {milestone.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Our Leadership Team
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Meet the dedicated professionals behind MedBlock
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="h-64 bg-gray-200 relative">
                  {/* Uncomment when you have actual images */}
                  <div className="relative w-full h-64 overflow-hidden ">
                    <Image
                      src={member.image}
                      alt={member.name}
                      layout="fill"
                      objectFit="cover"
                      objectPosition="center"
                      className="rounded-t-lg"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-indigo-600/20"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Users className="h-16 w-16 text-white opacity-50" />
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {member.name}
                  </h3>
                  <p className="text-blue-600 font-medium mb-2">
                    {member.role}
                  </p>
                  <p className="text-gray-600 text-sm">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">50,000+</div>
              <div className="text-blue-100">Patients Served</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">1,000+</div>
              <div className="text-blue-100">Doctors</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">20+</div>
              <div className="text-blue-100">Medical Specialties</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">10+</div>
              <div className="text-blue-100">Countries</div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Get in Touch
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Have questions or feedback? We'd love to hear from you.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <MapPin className="h-8 w-8 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Visit Our Office
              </h3>
              <p className="text-gray-600">
                123 Healthcare Avenue
                <br />
                Silicon Valley, CA 94043
                <br />
                United States
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <Mail className="h-8 w-8 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Email Us
              </h3>
              <p className="text-gray-600">
                info@medblock.com
                <br />
                support@medblock.com
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <Phone className="h-8 w-8 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Call Us
              </h3>
              <p className="text-gray-600">
                +1 (800) 123-4567
                <br />
                Monday - Friday, 9am - 5pm PST
              </p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/contact"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default About;
