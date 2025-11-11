import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabase'
import { Activity, User, Calendar, Filter, Download, RefreshCw } from 'lucide-react'

export default function ActivityLogs() {
  const { t, i18n } = useTranslation()
  const locale = i18n?.language?.startsWith('ar')
    ? 'ar-SA'
    : i18n?.language?.startsWith('en')
    ? 'en-US'
    : 'fr-FR'
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    action: '',
    entity_type: '',
    user_id: '',
    date_from: '',
    date_to: ''
  })
  const [users, setUsers] = useState([])
  const [currentUser, setCurrentUser] = useState(null)
  const [userRole, setUserRole] = useState(null)

  useEffect(() => {
    loadCurrentUser()
    loadLogs()
    loadUsers()
  }, [])

  const loadCurrentUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setCurrentUser(user)
        // Get user role from users table
        const { data: userData, error } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single()
        
        if (!error && userData) {
          setUserRole(userData.role)
        }
      }
    } catch (error) {
      console.error('Error loading current user:', error)
    }
  }

  const loadLogs = async () => {
    try {
      setLoading(true)
      let query = supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100)

      // Apply filters
      if (filters.action) {
        query = query.eq('action', filters.action)
      }
      if (filters.entity_type) {
        query = query.eq('entity_type', filters.entity_type)
      }
      if (filters.user_id) {
        query = query.eq('user_id', filters.user_id)
      }
      if (filters.date_from) {
        query = query.gte('created_at', filters.date_from)
      }
      if (filters.date_to) {
        query = query.lte('created_at', filters.date_to)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error loading logs:', error)
        console.error('Error details:', error.message, error.code, error.details)
        setLogs([])
      } else {
        console.log('Loaded logs:', data)
        setLogs(data || [])
      }
    } catch (error) {
      console.error('Error loading logs:', error)
      setLogs([])
    } finally {
      setLoading(false)
    }
  }

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, full_name, email')
        .order('full_name')
      
      if (error) {
        console.error('Error loading users:', error)
        setUsers([])
      } else {
        setUsers(data || [])
      }
    } catch (error) {
      console.error('Error loading users:', error)
      setUsers([])
    }
  }

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters(prev => ({ ...prev, [name]: value }))
  }

  const applyFilters = () => {
    loadLogs()
  }

  const resetFilters = () => {
    setFilters({
      action: '',
      entity_type: '',
      user_id: '',
      date_from: '',
      date_to: ''
    })
    setTimeout(() => loadLogs(), 100)
  }

  const exportLogs = () => {
    const csv = [
      [
        t('common.date', 'Date'),
        t('common.user', 'Utilisateur'),
        t('common.action', 'Action'),
        t('common.type', 'Type'),
        t('common.entity', 'Entité'),
        t('common.description', 'Description')
      ].join(','),
      ...logs.map(log => [
        new Date(log.created_at).toLocaleString(locale),
        log.user_name || t('common.system', 'Système'),
        getActionLabel(log.action),
        getEntityLabel(log.entity_type),
        log.entity_name || '-',
        log.description || '-'
      ].join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `activity_logs_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  const getActionIcon = (action) => {
    switch (action) {
      case 'CREATE': return '✅'
      case 'UPDATE': return '✏️'
      case 'DELETE': return '🗑️'
      case 'LOGIN': return '🔐'
      case 'LOGOUT': return '🚪'
      case 'VIEW': return '👁️'
      default: return '📝'
    }
  }

  const getActionLabel = (action) => {
    switch (action) {
      case 'CREATE': return t('activity.creation', 'Création')
      case 'UPDATE': return t('activity.update', 'Modification')
      case 'DELETE': return t('activity.deletion', 'Suppression')
      case 'LOGIN': return t('activity.login', 'Connexion')
      case 'LOGOUT': return t('activity.logout', 'Déconnexion')
      case 'VIEW': return t('activity.view', 'Consultation')
      default: return action
    }
  }

  const getActionColor = (action) => {
    switch (action) {
      case 'CREATE': return 'bg-green-100 text-green-800'
      case 'UPDATE': return 'bg-blue-100 text-blue-800'
      case 'DELETE': return 'bg-red-100 text-red-800'
      case 'LOGIN': return 'bg-purple-100 text-purple-800'
      case 'LOGOUT': return 'bg-gray-100 text-gray-800'
      case 'VIEW': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getEntityIcon = (entityType) => {
    switch (entityType) {
      case 'ticket': return '🎫'
      case 'user': return '👤'
      case 'technician_service': return '🔧'
      default: return '📄'
    }
  }

  const getEntityLabel = (entityType) => {
    switch (entityType) {
      case 'ticket': return t('common.ticket', 'Ticket')
      case 'user': return t('common.user', 'Utilisateur')
      case 'technician_service': return t('common.technicianService', 'Service Technicien')
      default: return entityType
    }
  }

  return (
    <div className="p-6">

      
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
              <Activity className="w-8 h-8 text-primary" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{t('activity.title', 'Journal d\'Activité')}</h1>
                <p className="text-gray-500">{t('activity.subtitle', 'Historique de toutes les actions')}</p>
              </div>
            </div>
          
          <div className="flex gap-2">
            <button
              onClick={loadLogs}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <RefreshCw className="w-4 h-4" />
              {t('common.refresh', 'Actualiser')}
            </button>
            <button
              onClick={exportLogs}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
            >
              <Download className="w-4 h-4" />
              {t('common.exportCSV', 'Exporter CSV')}
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-500" />
          <h2 className="text-lg font-semibold">{t('common.filters', 'Filtres')}</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('common.action', 'Action')}</label>
            <select
              name="action"
              value={filters.action}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
            >
              <option value="">{t('common.all', 'Toutes')}</option>
              <option value="CREATE">{t('activity.creation', 'Création')}</option>
              <option value="UPDATE">{t('activity.update', 'Modification')}</option>
              <option value="DELETE">{t('activity.deletion', 'Suppression')}</option>
              <option value="LOGIN">{t('activity.login', 'Connexion')}</option>
              <option value="LOGOUT">{t('activity.logout', 'Déconnexion')}</option>
              <option value="VIEW">{t('activity.view', 'Consultation')}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('common.type', 'Type')}</label>
            <select
              name="entity_type"
              value={filters.entity_type}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
            >
              <option value="">{t('common.all', 'Tous')}</option>
              <option value="ticket">{t('common.ticket', 'Ticket')}</option>
              <option value="user">{t('common.user', 'Utilisateur')}</option>
              <option value="technician_service">{t('common.technicianService', 'Service Technicien')}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('common.user', 'Utilisateur')}</label>
            <select
              name="user_id"
              value={filters.user_id}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
            >
              <option value="">{t('common.all', 'Tous')}</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>{user.full_name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('common.startDate', 'Date début')}</label>
            <input
              type="date"
              name="date_from"
              value={filters.date_from}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('common.endDate', 'Date fin')}</label>
            <input
              type="date"
              name="date_to"
              value={filters.date_to}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <button
            onClick={applyFilters}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
          >
            {t('common.apply', 'Appliquer')}
          </button>
          <button
            onClick={resetFilters}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            {t('common.reset', 'Réinitialiser')}
          </button>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center p-12 text-gray-500">
            <Activity className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>{t('activity.noActivity', 'Aucune activité trouvée')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('common.date', 'Date')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('common.user', 'Utilisateur')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('common.action', 'Action')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('common.type', 'Type')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('common.entity', 'Entité')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('common.description', 'Description')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {new Date(log.created_at).toLocaleString(locale)}
                      </div>
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="font-medium text-gray-800">{log.user_name || log.user_email || t('common.system', 'Système')}</div>
                      </div>
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getActionColor(log.action)}`}>
                        {getActionIcon(log.action)} {getActionLabel(log.action)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getEntityIcon(log.entity_type)} {getEntityLabel(log.entity_type)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary">
                      {log.entity_name || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {log.description || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="mt-6 text-center text-sm text-gray-500">
        {t('activity.total') || 'Total'}: {logs.length} {t('activity.activities') || 'activité(s)'}
      </div>
    </div>
  )
}

