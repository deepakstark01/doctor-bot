import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import { getDb } from '../../lib/db';
import { getAuthToken, setAuthToken, requireAuth } from '../../lib/auth';
import { isValidEmail, isValidPhone } from '../../lib/utils';
import { User, Mail, Phone, Lock, Save, Edit, AlertCircle, CheckCircle } from 'lucide-react';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
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
    setFormData({
      full_name: currentUser.full_name || '',
      email: currentUser.email || '',
      phone: currentUser.phone || '',
      current_password: '',
      new_password: '',
      confirm_password: ''
    });
  }, [router]);

  const validateForm = () => {
    const newErrors = {};

    // Full name validation
    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Full name is required';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone validation (optional)
    if (formData.phone && !isValidPhone(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    // Password validation (only if changing password)
    if (isChangingPassword) {
      if (!formData.current_password) {
        newErrors.current_password = 'Current password is required';
      }

      if (!formData.new_password) {
        newErrors.new_password = 'New password is required';
      } else if (formData.new_password.length < 6) {
        newErrors.new_password = 'Password must be at least 6 characters';
      }

      if (formData.new_password !== formData.confirm_password) {
        newErrors.confirm_password = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setSuccess('');

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      const db = await getDb();

      // Check if email is already taken by another user
      if (formData.email !== user.email) {
        const existingUser = await db.query(
          'SELECT id FROM users WHERE email = $1 AND id != $2',
          [formData.email.trim().toLowerCase(), user.id]
        );

        if (existingUser.rows.length > 0) {
          setErrors({ email: 'Email is already taken by another user' });
          setLoading(false);
          return;
        }
      }

      // If changing password, verify current password
      if (isChangingPassword) {
        let bcrypt;
        try {
          bcrypt = await import('bcryptjs');
        } catch (error) {
          setErrors({ submit: 'Password change is currently unavailable' });
          setLoading(false);
          return;
        }

        const userResult = await db.query(
          'SELECT password_hash FROM users WHERE id = $1',
          [user.id]
        );

        const isValidPassword = await bcrypt.default.compare(
          formData.current_password, 
          userResult.rows[0].password_hash
        );

        if (!isValidPassword) {
          setErrors({ current_password: 'Current password is incorrect' });
          setLoading(false);
          return;
        }

        // Hash new password
        const newPasswordHash = await bcrypt.default.hash(formData.new_password, 12);

        // Update user with new password
        await db.query(
          `UPDATE users 
           SET full_name = $1, email = $2, phone = $3, password_hash = $4, updated_at = CURRENT_TIMESTAMP
           WHERE id = $5`,
          [
            formData.full_name.trim(),
            formData.email.trim().toLowerCase(),
            formData.phone.trim() || null,
            newPasswordHash,
            user.id
          ]
        );

        setSuccess('Profile and password updated successfully!');
        setIsChangingPassword(false);
        setFormData(prev => ({
          ...prev,
          current_password: '',
          new_password: '',
          confirm_password: ''
        }));
      } else {
        // Update user without password change
        await db.query(
          `UPDATE users 
           SET full_name = $1, email = $2, phone = $3, updated_at = CURRENT_TIMESTAMP
           WHERE id = $4`,
          [
            formData.full_name.trim(),
            formData.email.trim().toLowerCase(),
            formData.phone.trim() || null,
            user.id
          ]
        );

        setSuccess('Profile updated successfully!');
      }

      // Get updated user data
      const updatedUserResult = await db.query(
        'SELECT * FROM users WHERE id = $1',
        [user.id]
      );

      const updatedUser = updatedUserResult.rows[0];
      
      // Update auth token
      setAuthToken(updatedUser);
      setUser(updatedUser);
      setIsEditing(false);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);

    } catch (error) {
      console.error('Profile update error:', error);
      setErrors({ submit: 'Failed to update profile. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear specific field error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setIsChangingPassword(false);
    setErrors({});
    setSuccess('');
    
    // Reset form data
    setFormData({
      full_name: user.full_name || '',
      email: user.email || '',
      phone: user.phone || '',
      current_password: '',
      new_password: '',
      confirm_password: ''
    });
  };

  if (!user) {
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
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="h-10 w-10 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-2">
            Manage your personal information and account settings
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4 flex items-center space-x-2 fade-in">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span className="text-green-700">{success}</span>
          </div>
        )}

        {/* Profile Form */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 transition-colors"
              >
                <Edit className="h-4 w-4" />
                <span>Edit</span>
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <span className="text-red-700 text-sm">{errors.submit}</span>
              </div>
            )}

            <div className="grid grid-cols-1 gap-6">
              {/* Username (Read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-600">
                  {user.username}
                </div>
                <p className="mt-1 text-xs text-gray-500">Username cannot be changed</p>
              </div>

              {/* Full Name */}
              <div>
                <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="full_name"
                    name="full_name"
                    type="text"
                    required
                    disabled={!isEditing}
                    value={formData.full_name}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      !isEditing 
                        ? 'bg-gray-50 text-gray-600 border-gray-200' 
                        : errors.full_name 
                          ? 'border-red-300 bg-red-50' 
                          : 'border-gray-300'
                    }`}
                  />
                </div>
                {errors.full_name && (
                  <p className="mt-1 text-sm text-red-600">{errors.full_name}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    disabled={!isEditing}
                    value={formData.email}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      !isEditing 
                        ? 'bg-gray-50 text-gray-600 border-gray-200' 
                        : errors.email 
                          ? 'border-red-300 bg-red-50' 
                          : 'border-gray-300'
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    disabled={!isEditing}
                    value={formData.phone}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      !isEditing 
                        ? 'bg-gray-50 text-gray-600 border-gray-200' 
                        : errors.phone 
                          ? 'border-red-300 bg-red-50' 
                          : 'border-gray-300'
                    }`}
                    placeholder={!isEditing ? 'Not provided' : 'Enter your phone number'}
                  />
                </div>
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                )}
              </div>
            </div>

            {/* Password Change Section */}
            {isEditing && (
              <div className="border-t border-gray-200 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Change Password</h3>
                  <button
                    type="button"
                    onClick={() => setIsChangingPassword(!isChangingPassword)}
                    className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    {isChangingPassword ? 'Cancel' : 'Change Password'}
                  </button>
                </div>

                {isChangingPassword && (
                  <div className="space-y-4">
                    {/* Current Password */}
                    <div>
                      <label htmlFor="current_password" className="block text-sm font-medium text-gray-700 mb-2">
                        Current Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          id="current_password"
                          name="current_password"
                          type="password"
                          value={formData.current_password}
                          onChange={handleChange}
                          className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors.current_password ? 'border-red-300 bg-red-50' : 'border-gray-300'
                          }`}
                          placeholder="Enter your current password"
                        />
                      </div>
                      {errors.current_password && (
                        <p className="mt-1 text-sm text-red-600">{errors.current_password}</p>
                      )}
                    </div>

                    {/* New Password */}
                    <div>
                      <label htmlFor="new_password" className="block text-sm font-medium text-gray-700 mb-2">
                        New Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          id="new_password"
                          name="new_password"
                          type="password"
                          value={formData.new_password}
                          onChange={handleChange}
                          className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors.new_password ? 'border-red-300 bg-red-50' : 'border-gray-300'
                          }`}
                          placeholder="Enter your new password"
                        />
                      </div>
                      {errors.new_password && (
                        <p className="mt-1 text-sm text-red-600">{errors.new_password}</p>
                      )}
                    </div>

                    {/* Confirm New Password */}
                    <div>
                      <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          id="confirm_password"
                          name="confirm_password"
                          type="password"
                          value={formData.confirm_password}
                          onChange={handleChange}
                          className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors.confirm_password ? 'border-red-300 bg-red-50' : 'border-gray-300'
                          }`}
                          placeholder="Confirm your new password"
                        />
                      </div>
                      {errors.confirm_password && (
                        <p className="mt-1 text-sm text-red-600">{errors.confirm_password}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            {isEditing && (
              <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="loading-spinner h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Account Info */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Account Type:</span>
              <span className="ml-2 capitalize font-medium text-gray-900">{user.role}</span>
            </div>
            <div>
              <span className="text-gray-500">Member Since:</span>
              <span className="ml-2 font-medium text-gray-900">
                {user.created_at}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}