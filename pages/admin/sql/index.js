import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../../components/Layout';
import Modal, { ConfirmModal } from '../../../components/Modal';
import { getAuthToken, requireAdmin } from '../../../lib/auth';
import { executeQuery, getDatabaseHealth, resetDatabase, clearDatabase } from '../../../lib/db';
import { 
  Play, 
  Database, 
  Download, 
  Upload, 
  Trash2, 
  RefreshCw, 
  AlertTriangle,
  CheckCircle,
  Copy,
  History,
  BookOpen,
  Terminal,
  FileText,
  Save,
  Eye,
  EyeOff
} from 'lucide-react';

export default function AdminSQLConsole() {
  const [user, setUser] = useState(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [dbHealth, setDbHealth] = useState(null);
  const [queryHistory, setQueryHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [resetType, setResetType] = useState('clear');
  const router = useRouter();

  // Predefined queries for common operations
  const presetQueries = [
    {
      name: 'All Users',
      description: 'Get all users with their details',
      query: 'SELECT id, username, email, full_name, role, is_active, created_at FROM users ORDER BY created_at DESC;'
    },
    {
      name: 'All Doctors',
      description: 'Get all doctors with categories',
      query: `SELECT d.id, d.name, d.specialty, c.name as category, d.experience_years, d.consultation_fee, d.is_active 
              FROM doctors d 
              LEFT JOIN categories c ON d.category_id = c.id 
              ORDER BY d.name;`
    },
    {
      name: 'Recent Appointments',
      description: 'Get appointments from last 30 days',
      query: `SELECT a.id, u.full_name as patient, d.name as doctor, a.appointment_date, a.appointment_time, a.status
              FROM appointments a
              JOIN users u ON a.patient_id = u.id
              JOIN doctors d ON a.doctor_id = d.id
              WHERE a.appointment_date >= CURRENT_DATE - INTERVAL '30 days'
              ORDER BY a.appointment_date DESC, a.appointment_time DESC;`
    },
    {
      name: 'Appointment Statistics',
      description: 'Get appointment counts by status',
      query: `SELECT status, COUNT(*) as count, 
                     ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
              FROM appointments 
              GROUP BY status 
              ORDER BY count DESC;`
    },
    {
      name: 'Top Doctors by Appointments',
      description: 'Doctors with most appointments',
      query: `SELECT d.name, d.specialty, COUNT(a.id) as appointment_count
              FROM doctors d
              LEFT JOIN appointments a ON d.id = a.doctor_id
              WHERE d.is_active = true
              GROUP BY d.id, d.name, d.specialty
              ORDER BY appointment_count DESC
              LIMIT 10;`
    },
    {
      name: 'Database Schema',
      description: 'Show all tables and columns',
      query: `SELECT table_name, column_name, data_type, is_nullable
              FROM information_schema.columns
              WHERE table_schema = 'public'
              ORDER BY table_name, ordinal_position;`
    },
    {
      name: 'User Activity Summary',
      description: 'Patient registration and appointment activity',
      query: `SELECT 
                DATE_TRUNC('month', u.created_at) as month,
                COUNT(u.id) as new_patients,
                COUNT(a.id) as appointments_made
              FROM users u
              LEFT JOIN appointments a ON u.id = a.patient_id AND DATE_TRUNC('month', a.created_at) = DATE_TRUNC('month', u.created_at)
              WHERE u.role = 'patient'
              GROUP BY DATE_TRUNC('month', u.created_at)
              ORDER BY month DESC
              LIMIT 12;`
    },
    {
      name: 'Doctor Availability',
      description: 'Show doctor schedules and availability',
      query: `SELECT name, specialty, available_days, available_hours, is_active
              FROM doctors
              ORDER BY is_active DESC, name;`
    }
  ];

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
    loadDatabaseHealth();
    loadQueryHistory();
  }, [router]);

  const loadDatabaseHealth = async () => {
    try {
      const health = await getDatabaseHealth();
      setDbHealth(health);
    } catch (error) {
      console.error('Error loading database health:', error);
    }
  };

  const loadQueryHistory = () => {
    const saved = localStorage.getItem('sql_query_history');
    if (saved) {
      setQueryHistory(JSON.parse(saved));
    }
  };

  const saveQueryToHistory = (queryText, result) => {
    const historyItem = {
      id: Date.now(),
      query: queryText,
      timestamp: new Date().toISOString(),
      success: !result.error,
      rowCount: result.rows ? result.rows.length : 0
    };

    const newHistory = [historyItem, ...queryHistory.slice(0, 49)]; // Keep last 50
    setQueryHistory(newHistory);
    localStorage.setItem('sql_query_history', JSON.stringify(newHistory));
  };

  const executeSQL = async () => {
    if (!query.trim()) {
      setError('Please enter a SQL query');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    setResults(null);

    try {
      const result = await executeQuery(query);
      setResults(result);
      setSuccess(`Query executed successfully. ${result.rows?.length || 0} rows returned.`);
      saveQueryToHistory(query, result);
      await loadDatabaseHealth(); // Refresh health after query
    } catch (err) {
      console.error('SQL Error:', err);
      setError(`Error: ${err.message}`);
      saveQueryToHistory(query, { error: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.ctrlKey && e.key === 'Enter') {
      executeSQL();
    }
  };

  const copyQuery = (queryText) => {
    navigator.clipboard.writeText(queryText);
    setSuccess('Query copied to clipboard');
    setTimeout(() => setSuccess(''), 2000);
  };

  const loadPresetQuery = (preset) => {
    setQuery(preset.query);
    setShowPresets(false);
  };

  const loadHistoryQuery = (historyItem) => {
    setQuery(historyItem.query);
    setShowHistory(false);
  };

  const exportResults = () => {
    if (!results || !results.rows) return;

    const csvData = [
      Object.keys(results.rows[0]).join(','),
      ...results.rows.map(row => Object.values(row).map(val => 
        typeof val === 'string' && val.includes(',') ? `"${val}"` : val
      ).join(','))
    ].join('\n');

    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sql_results_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleReset = async () => {
    setLoading(true);
    try {
      if (resetType === 'clear') {
        await clearDatabase();
        setSuccess('Database cleared successfully. All data removed but structure preserved.');
      } else {
        await resetDatabase();
        setSuccess('Database reset successfully. All data restored to initial state.');
      }
      await loadDatabaseHealth();
      setShowResetModal(false);
      setShowClearModal(false);
    } catch (error) {
      setError(`Reset failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = () => {
    setQueryHistory([]);
    localStorage.removeItem('sql_query_history');
    setSuccess('Query history cleared');
    setTimeout(() => setSuccess(''), 2000);
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">SQL Console</h1>
            <p className="text-gray-600 mt-2">
              Execute SQL queries and manage database directly
            </p>
          </div>
          <div className="flex items-center space-x-2 mt-4 sm:mt-0">
            <button
              onClick={() => setShowPresets(!showPresets)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <BookOpen className="h-4 w-4" />
              <span>Presets</span>
            </button>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors flex items-center space-x-2"
            >
              <History className="h-4 w-4" />
              <span>History</span>
            </button>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4 flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span className="text-green-700">{success}</span>
          </div>
        )}

        {/* Database Health */}
        {dbHealth && (
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Database Status</h2>
              <button
                onClick={loadDatabaseHealth}
                className="text-blue-600 hover:text-blue-700 p-1"
                title="Refresh status"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className={`text-2xl font-bold ${dbHealth.status === 'healthy' ? 'text-green-600' : 'text-red-600'}`}>
                  {dbHealth.status === 'healthy' ? '✓' : '✗'}
                </div>
                <div className="text-sm text-gray-600">Status</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{dbHealth.tables?.users || 0}</div>
                <div className="text-sm text-gray-600">Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{dbHealth.tables?.doctors || 0}</div>
                <div className="text-sm text-gray-600">Doctors</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{dbHealth.tables?.appointments || 0}</div>
                <div className="text-sm text-gray-600">Appointments</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{dbHealth.tables?.categories || 0}</div>
                <div className="text-sm text-gray-600">Categories</div>
              </div>
            </div>
          </div>
        )}

        {/* Query Input */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Terminal className="h-5 w-5 text-gray-600" />
              <span className="font-medium text-gray-900">SQL Query</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setQuery('')}
                className="text-gray-600 hover:text-gray-800 p-1"
                title="Clear query"
              >
                <Trash2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => copyQuery(query)}
                className="text-gray-600 hover:text-gray-800 p-1"
                title="Copy query"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="p-4">
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyPress}
              className="w-full h-40 p-3 border border-gray-300 rounded-md font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
              placeholder="Enter your SQL query here... (Ctrl+Enter to execute)"
            />
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-500">
                Press Ctrl+Enter to execute • Use semicolon to separate multiple statements
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    setResetType('clear');
                    setShowClearModal(true);
                  }}
                  className="bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700 transition-colors flex items-center space-x-1"
                >
                  <Trash2 className="h-3 w-3" />
                  <span>Clear DB</span>
                </button>
                <button
                  onClick={() => {
                    setResetType('reset');
                    setShowResetModal(true);
                  }}
                  className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors flex items-center space-x-1"
                >
                  <RefreshCw className="h-3 w-3" />
                  <span>Reset DB</span>
                </button>
                <button
                  onClick={executeSQL}
                  disabled={loading || !query.trim()}
                  className="bg-blue-600 text-white px-4 py-1 rounded text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                >
                  {loading ? (
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Play className="h-3 w-3" />
                  )}
                  <span>Execute</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Query Presets */}
        {showPresets && (
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-medium text-gray-900">Query Presets</h3>
            </div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              {presetQueries.map((preset, index) => (
                <button
                  key={index}
                  onClick={() => loadPresetQuery(preset)}
                  className="text-left p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                >
                  <div className="font-medium text-gray-900">{preset.name}</div>
                  <div className="text-sm text-gray-600 mt-1">{preset.description}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Query History */}
        {showHistory && (
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-medium text-gray-900">Query History</h3>
              <button
                onClick={clearHistory}
                className="text-red-600 hover:text-red-700 text-sm"
              >
                Clear History
              </button>
            </div>
            <div className="p-4 max-h-64 overflow-y-auto">
              {queryHistory.length > 0 ? (
                <div className="space-y-2">
                  {queryHistory.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer"
                      onClick={() => loadHistoryQuery(item)}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="text-sm text-gray-500">
                          {new Date(item.timestamp).toLocaleString()}
                        </div>
                        <div className={`text-xs px-2 py-1 rounded ${
                          item.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {item.success ? `${item.rowCount} rows` : 'Error'}
                        </div>
                      </div>
                      <div className="text-sm font-mono text-gray-700 truncate">
                        {item.query}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <History className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p>No query history</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Results */}
        {results && (
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Database className="h-5 w-5 text-gray-600" />
                <span className="font-medium text-gray-900">
                  Results ({results.rows?.length || 0} rows)
                </span>
              </div>
              {results.rows && results.rows.length > 0 && (
                <button
                  onClick={exportResults}
                  className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors flex items-center space-x-1"
                >
                  <Download className="h-3 w-3" />
                  <span>Export CSV</span>
                </button>
              )}
            </div>
            <div className="p-4">
              {results.rows && results.rows.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {Object.keys(results.rows[0]).map((column) => (
                          <th
                            key={column}
                            className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            {column}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {results.rows.map((row, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          {Object.values(row).map((value, cellIndex) => (
                            <td
                              key={cellIndex}
                              className="px-4 py-2 text-sm text-gray-900 max-w-xs truncate"
                              title={String(value)}
                            >
                              {value === null ? (
                                <span className="text-gray-400 italic">NULL</span>
                              ) : (
                                String(value)
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p>Query executed successfully but returned no results</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Clear Database Modal */}
        <ConfirmModal
          isOpen={showClearModal}
          onClose={() => setShowClearModal(false)}
          onConfirm={handleReset}
          title="Clear Database"
          message="Are you sure you want to clear all data from the database? This will remove all users, doctors, appointments, and categories but keep the table structure. This action cannot be undone."
          confirmText="Clear Database"
          cancelText="Cancel"
          variant="warning"
          isLoading={loading}
        />

        {/* Reset Database Modal */}
        <ConfirmModal
          isOpen={showResetModal}
          onClose={() => setShowResetModal(false)}
          onConfirm={handleReset}
          title="Reset Database"
          message="Are you sure you want to reset the database to its initial state? This will remove all data and restore default doctors, categories, and admin user. This action cannot be undone."
          confirmText="Reset Database"
          cancelText="Cancel"
          variant="danger"
          isLoading={loading}
        />
      </div>
    </Layout>
  );
}