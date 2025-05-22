import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../components/Layout';
import { setAuthToken, getAuthToken } from '../lib/auth';
import { findActiveUserByUsernameAndRole } from '../lib/queries';
import { Stethoscope, Eye, EyeOff, AlertCircle, User, Lock } from 'lucide-react';

export default function Login() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'patient'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Redirect if already logged in
    const user = getAuthToken();
    if (user) {
      router.push(user.role === 'admin' ? '/admin' : '/');
    }
  }, [router]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      let bcrypt;
      
      try {
        bcrypt = await import('bcryptjs');
      } catch (error) {
        setErrors({ submit: 'Login is currently unavailable. Please try again later.' });
        setLoading(false);
        return;
      }
      
      // Find user by username and role using the new query function
      const result = await findActiveUserByUsernameAndRole(formData.username, formData.role);

      if (result.rows.length === 0) {
        setErrors({ 
          submit: 'Invalid username or password. Please check your credentials and try again.' 
        });
        setLoading(false);
        return;
      }

      const user = result.rows[0];
      
      // Verify password
      const isValidPassword = await bcrypt.default.compare(formData.password, user.password_hash);
      
      if (!isValidPassword) {
        setErrors({ 
          submit: 'Invalid username or password. Please check your credentials and try again.' 
        });
        setLoading(false);
        return;
      }

      // Set auth token with remember me option
      setAuthToken(user, rememberMe);
      
      // Redirect based on role
      const redirectPath = user.role === 'admin' ? '/admin' : '/';
      router.push(redirectPath);
      
    } catch (error) {
      console.error('Login error:', error);
      setErrors({ 
        submit: 'An unexpected error occurred. Please try again.' 
      });
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

  const handleRoleChange = (role) => {
    setFormData(prev => ({
      ...prev,
      role
    }));
    setErrors({}); // Clear errors when switching roles
  };

  const getFieldError = (fieldName) => {
    return errors[fieldName];
  };

  const hasFieldError = (fieldName) => {
    return !!errors[fieldName];
  };

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <Stethoscope className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Welcome back
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Sign in to your MediCare account
            </p>
          </div>

          {/* Login Form */}
          <div className="bg-white py-8 px-6 shadow-lg rounded-lg border">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Global Error */}
              {errors.submit && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-start space-x-2">
                  <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium text-red-800">Login Failed</h3>
                    <p className="text-sm text-red-700 mt-1">{errors.submit}</p>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {/* Role Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    I am signing in as
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      className={`relative p-4 border rounded-lg text-sm font-medium transition-all duration-200 ${
                        formData.role === 'patient'
                          ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                      }`}
                      onClick={() => handleRoleChange('patient')}
                    >
                      <div className="flex flex-col items-center space-y-2">
                        <User className="h-5 w-5" />
                        <span>Patient</span>
                      </div>
                      {formData.role === 'patient' && (
                        <div className="absolute top-2 right-2 w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </button>
                    <button
                      type="button"
                      className={`relative p-4 border rounded-lg text-sm font-medium transition-all duration-200 ${
                        formData.role === 'admin'
                          ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                      }`}
                      onClick={() => handleRoleChange('admin')}
                    >
                      <div className="flex flex-col items-center space-y-2">
                        <Stethoscope className="h-5 w-5" />
                        <span>Admin</span>
                      </div>
                      {formData.role === 'admin' && (
                        <div className="absolute top-2 right-2 w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </button>
                  </div>
                </div>

                {/* Username */}
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                    Username
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="username"
                      name="username"
                      type="text"
                      autoComplete="username"
                      required
                      value={formData.username}
                      onChange={handleChange}
                      className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        hasFieldError('username') 
                          ? 'border-red-300 bg-red-50' 
                          : 'border-gray-300 bg-white'
                      }`}
                      placeholder="Enter your username"
                      style={{ color: '#111827' }}
                    />
                  </div>
                  {hasFieldError('username') && (
                    <p className="mt-1 text-sm text-red-600">{getFieldError('username')}</p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className={`block w-full pl-10 pr-10 py-2 border rounded-md shadow-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        hasFieldError('password') 
                          ? 'border-red-300 bg-red-50' 
                          : 'border-gray-300 bg-white'
                      }`}
                      placeholder="Enter your password"
                      style={{ color: '#111827' }}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                      )}
                    </button>
                  </div>
                  {hasFieldError('password') && (
                    <p className="mt-1 text-sm text-red-600">{getFieldError('password')}</p>
                  )}
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                      Remember me
                    </label>
                  </div>

                  <div className="text-sm">
                    <Link href="/forgot-password" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
                      Forgot password?
                    </Link>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    <span>Sign in</span>
                  )}
                </button>
              </div>
            </form>

            {/* Sign Up Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
                  Create one now
                </Link>
              </p>
            </div>
          </div>

          {/* Demo Credentials */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-900 mb-3">Demo Credentials</h3>
            <div className="space-y-2 text-xs text-blue-700">
              <div className="flex justify-between items-center p-2 bg-white rounded border">
                <div>
                  <div className="font-medium text-gray-900">Admin Access</div>
                  <div className="text-blue-600">Username: admin | Password: admin123</div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setFormData({
                      username: 'admin',
                      password: 'admin123',
                      role: 'admin'
                    });
                  }}
                  className="text-blue-600 hover:text-blue-800 font-medium text-xs px-2 py-1 bg-blue-100 rounded hover:bg-blue-200 transition-colors"
                >
                  Use
                </button>
              </div>
              <div className="p-2 bg-white rounded border">
                <div className="font-medium text-gray-900">Patient Access</div>
                <div className="text-blue-600">Register a new patient account or use any created account</div>
              </div>
            </div>
          </div>

          {/* Security Notice */}
          <div className="text-center text-xs text-gray-500">
            <p>
              Your account security is important to us. We use industry-standard encryption 
              to protect your personal information.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}