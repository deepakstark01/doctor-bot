import Link from 'next/link';
import { useState } from 'react';
import { 
  User, 
  Star, 
  Clock, 
  DollarSign, 
  MapPin, 
  Phone, 
  Mail,
  Calendar,
  Badge,
  Heart,
  Share2,
  MoreVertical,
  Award,
  Users
} from 'lucide-react';
import { formatCurrency, generateAvatarColor } from '../lib/utils';

export default function DoctorCard({ 
  doctor, 
  variant = 'default', // 'default', 'compact', 'detailed'
  showActions = true,
  onFavorite,
  onShare,
  className = ''
}) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorited(!isFavorited);
    if (onFavorite) {
      onFavorite(doctor.id, !isFavorited);
    }
  };

  const handleShare = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onShare) {
      onShare(doctor);
    } else {
      // Default share functionality
      if (navigator.share) {
        navigator.share({
          title: `Dr. ${doctor.name}`,
          text: `${doctor.specialty} - ${doctor.details?.substring(0, 100) || 'Experienced doctor'}`,
          url: window.location.origin + `/doctors/${doctor.id}`
        });
      }
    }
  };

  const getDoctorInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const getExperienceLevel = (years) => {
    if (years >= 20) return { label: 'Senior', color: 'text-purple-600 bg-purple-100' };
    if (years >= 10) return { label: 'Expert', color: 'text-blue-600 bg-blue-100' };
    if (years >= 5) return { label: 'Experienced', color: 'text-green-600 bg-green-100' };
    return { label: 'Junior', color: 'text-orange-600 bg-orange-100' };
  };

  const getRating = () => {
    // Simulate rating based on experience and other factors
    const baseRating = 3.5;
    const experienceBonus = Math.min((doctor.experience_years || 0) / 20, 1);
    const rating = baseRating + experienceBonus * 1.5;
    return Math.min(rating, 5).toFixed(1);
  };

  const getPatientCount = () => {
    // Simulate patient count based on experience
    const base = 50;
    const experienceMultiplier = (doctor.experience_years || 1) * 15;
    return base + experienceMultiplier + Math.floor(Math.random() * 100);
  };

  // Compact variant for lists
  if (variant === 'compact') {
    return (
      <Link href={`/doctors/${doctor.id}`}>
        <div className={`bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-blue-300 transition-all duration-200 cursor-pointer ${className}`}>
          <div className="flex items-center space-x-3">
            {/* Avatar */}
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0"
              style={{ backgroundColor: generateAvatarColor(doctor.name) }}
            >
              {getDoctorInitials(doctor.name)}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-gray-900 truncate">
                {doctor.name}
              </h3>
              <p className="text-xs text-blue-600 font-medium truncate">
                {doctor.specialty}
              </p>
              <div className="flex items-center space-x-3 mt-1">
                <div className="flex items-center text-xs text-gray-500">
                  <Star className="h-3 w-3 text-yellow-400 mr-1" />
                  {getRating()}
                </div>
                <div className="text-xs text-gray-500">
                  {doctor.experience_years || 0}y exp
                </div>
                {doctor.consultation_fee > 0 && (
                  <div className="text-xs text-green-600 font-medium">
                    {formatCurrency(doctor.consultation_fee)}
                  </div>
                )}
              </div>
            </div>

            {/* Quick action */}
            <div className="flex-shrink-0">
              <Calendar className="h-4 w-4 text-gray-400" />
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Detailed variant with more information
  if (variant === 'detailed') {
    const experienceLevel = getExperienceLevel(doctor.experience_years || 0);
    
    return (
      <div className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 ${className}`}>
        {/* Header with actions */}
        {showActions && (
          <div className="absolute top-4 right-4 z-10 flex space-x-2">
            <button
              onClick={handleFavorite}
              className={`p-2 rounded-full backdrop-blur-sm transition-colors ${
                isFavorited 
                  ? 'bg-red-100 text-red-600' 
                  : 'bg-white/80 text-gray-600 hover:text-red-600'
              }`}
            >
              <Heart className={`h-4 w-4 ${isFavorited ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={handleShare}
              className="p-2 rounded-full bg-white/80 backdrop-blur-sm text-gray-600 hover:text-blue-600 transition-colors"
            >
              <Share2 className="h-4 w-4" />
            </button>
          </div>
        )}

        <Link href={`/doctors/${doctor.id}`} className="block">
          <div className="relative">
            {/* Background pattern */}
            <div className="h-24 bg-gradient-to-r from-blue-500 to-blue-600 relative overflow-hidden">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full"></div>
              <div className="absolute -bottom-2 -left-2 w-16 h-16 bg-white/10 rounded-full"></div>
            </div>

            {/* Doctor avatar */}
            <div className="absolute -bottom-8 left-6">
              <div 
                className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center text-white font-bold text-lg shadow-lg"
                style={{ backgroundColor: generateAvatarColor(doctor.name) }}
              >
                {getDoctorInitials(doctor.name)}
              </div>
            </div>
          </div>

          <div className="pt-12 pb-6 px-6">
            {/* Doctor info */}
            <div className="mb-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{doctor.name}</h3>
                  <p className="text-blue-600 font-semibold">{doctor.specialty}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${experienceLevel.color}`}>
                  {experienceLevel.label}
                </span>
              </div>

              {doctor.category_name && (
                <span className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-xs">
                  {doctor.category_name}
                </span>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-4 py-3 border-t border-gray-100">
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <Star className="h-4 w-4 text-yellow-400" />
                </div>
                <div className="text-sm font-semibold text-gray-900">{getRating()}</div>
                <div className="text-xs text-gray-500">Rating</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <Award className="h-4 w-4 text-purple-500" />
                </div>
                <div className="text-sm font-semibold text-gray-900">{doctor.experience_years || 0}</div>
                <div className="text-xs text-gray-500">Years</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <Users className="h-4 w-4 text-green-500" />
                </div>
                <div className="text-sm font-semibold text-gray-900">{getPatientCount()}</div>
                <div className="text-xs text-gray-500">Patients</div>
              </div>
            </div>

            {/* Details */}
            {doctor.details && (
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {doctor.details}
              </p>
            )}

            {/* Availability and fee */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="h-4 w-4 mr-2 text-blue-500" />
                <span>{doctor.available_hours || '9:00 AM - 5:00 PM'}</span>
              </div>
              {doctor.consultation_fee > 0 && (
                <div className="flex items-center text-sm text-gray-600">
                  <DollarSign className="h-4 w-4 mr-2 text-green-500" />
                  <span className="font-semibold text-green-600">
                    {formatCurrency(doctor.consultation_fee)} consultation
                  </span>
                </div>
              )}
            </div>

            {/* Available days */}
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

            {/* Action buttons */}
            <div className="flex space-x-2">
              <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                Book Now
              </button>
              <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                View Profile
              </button>
            </div>
          </div>
        </Link>
      </div>
    );
  }

  // Default variant
  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-300 transition-all duration-200 overflow-hidden ${className}`}>
      {/* Actions */}
      {showActions && (
        <div className="absolute top-4 right-4 z-10 flex space-x-1">
          <button
            onClick={handleFavorite}
            className={`p-2 rounded-full backdrop-blur-sm transition-colors ${
              isFavorited 
                ? 'bg-red-100 text-red-600' 
                : 'bg-white/80 text-gray-600 hover:text-red-600'
            }`}
          >
            <Heart className={`h-4 w-4 ${isFavorited ? 'fill-current' : ''}`} />
          </button>
          <button
            onClick={handleShare}
            className="p-2 rounded-full bg-white/80 backdrop-blur-sm text-gray-600 hover:text-blue-600 transition-colors"
          >
            <Share2 className="h-4 w-4" />
          </button>
        </div>
      )}

      <Link href={`/doctors/${doctor.id}`} className="block">
        <div className="p-6">
          {/* Doctor Header */}
          <div className="flex items-start space-x-4 mb-4">
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow-md"
              style={{ backgroundColor: generateAvatarColor(doctor.name) }}
            >
              {getDoctorInitials(doctor.name)}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {doctor.name}
              </h3>
              <p className="text-blue-600 font-medium mb-2">
                {doctor.specialty}
              </p>
              {doctor.category_name && (
                <span className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-xs">
                  {doctor.category_name}
                </span>
              )}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="flex items-center text-sm text-gray-600">
              <Star className="h-4 w-4 mr-2 text-yellow-500" />
              <span>{getRating()} • {doctor.experience_years || 0} years</span>
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
            <div className="flex flex-wrap gap-1">
              {(doctor.available_days || 'Mon,Tue,Wed,Thu,Fri').split(',').slice(0, 4).map((day, index) => (
                <span
                  key={index}
                  className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs"
                >
                  {day.trim()}
                </span>
              ))}
              {(doctor.available_days || 'Mon,Tue,Wed,Thu,Fri').split(',').length > 4 && (
                <span className="bg-gray-50 text-gray-500 px-2 py-1 rounded text-xs">
                  +{(doctor.available_days || 'Mon,Tue,Wed,Thu,Fri').split(',').length - 4} more
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          {doctor.details && (
            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
              {doctor.details}
            </p>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors">
              Book Appointment
            </button>
            <button className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              View Profile
            </button>
          </div>
        </div>
      </Link>
    </div>
  );
}