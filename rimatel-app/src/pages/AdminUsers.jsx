import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabase'
import { supabaseAdmin } from '../lib/supabaseAdmin'
import { UserPlus, Edit, Trash2, Shield, X, Save } from 'lucide-react'

export default function AdminUsers() {
  const { t } = useTranslation()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    full_name: '',
    role: 'user',
    is_active: true
  })
  const [selectedServices, setSelectedServices] = useState([])
  const [errors, setErrors] = useState({})

  const services = ['SAWI', 'LTE', 'BLR', 'FTTH', 'LS/MPLS']

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      console.log('🔍 Loading users...')
      console.log('🔗 Supabase URL:', import.meta.env.VITE_SUPABASE_URL)

      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          technician_services!technician_services_user_id_fkey (
            service_type
          )
        `)
        .order('created_at', { ascending: false })

      console.log('📊 Users data:', data)
      console.log('❌ Users error:', error)

      if (error) throw error
      setUsers(data || [])
      console.log('✅ Users loaded:', data?.length || 0)
    } catch (error) {
      console.error('❌ Error loading users:', error)

      let errorMessage = 'Erreur lors du chargement des utilisateurs:\n\n'

      if (error.message === 'Failed to fetch') {
        errorMessage += '❌ Impossible de se connecter à Supabase.\n\n'
        errorMessage += 'Solutions:\n'
        errorMessage += '1. Vérifiez votre connexion Internet\n'
        errorMessage += '2. Redémarrez l\'application: npm run dev\n'
        errorMessage += '3. Vérifiez que Supabase project est actif'
      } else {
        errorMessage += error.message
      }

      alert(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})

    try {
      if (editingUser) {
        // Update existing user via Edge Function
        console.log('🔄 Updating user via Edge Function:', editingUser.id)

        const { data: { session } } = await supabase.auth.getSession()

        if (!session) {
          throw new Error('Session expirée')
        }

        const updates = {
          username: formData.username,
          full_name: formData.full_name,
          role: formData.role,
          is_active: formData.is_active,
          services: formData.role === 'technicien' ? selectedServices : []
        }

        // Add email and password if changed
        if (formData.email && formData.email !== editingUser.email) {
          updates.email = formData.email
        }
        if (formData.password) {
          updates.password = formData.password
        }

        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/update-user`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId: editingUser.id, updates })
          }
        )

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || 'Erreur lors de la mise à jour')
        }

        if (result.warning) {
          console.warn('⚠️', result.warning)
        }

        console.log('✅ User updated successfully')
      } else {
        // Create new user via Supabase Auth Admin
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: formData.email,
          password: formData.password,
          email_confirm: true,
          user_metadata: {
            full_name: formData.full_name
          }
        })

        if (authError) throw authError

        // Insert into users table
        const { error: userError } = await supabase
          .from('users')
          .insert([{
            id: authData.user.id,
            username: formData.username,
            email: formData.email,
            full_name: formData.full_name,
            role: formData.role,
            is_active: formData.is_active
          }])

        if (userError) throw userError

        // Add technician services if applicable
        if (formData.role === 'technicien' && selectedServices.length > 0) {
          const { data: { user } } = await supabase.auth.getUser()
          const servicesToInsert = selectedServices.map(service => ({
            user_id: authData.user.id,
            service_type: service,
            assigned_by: user?.id
          }))

          await supabase
            .from('technician_services')
            .insert(servicesToInsert)
        }
      }

      setShowModal(false)
      setEditingUser(null)
      resetForm()
      loadUsers()
    } catch (error) {
      console.error('Error saving user:', error)
      let errorMessage = 'An unexpected error occurred. Please try again.'
      if (error.message.includes('Failed to fetch')) {
        errorMessage = 'Network error: Unable to connect to the server. Please check your internet connection.'
      } else if (error.message) {
        errorMessage = error.message
      }
      setErrors({ general: errorMessage })
    }
  }

  const handleDelete = async (userId) => {
    if (!confirm(t('admin.confirmDelete'))) return

    try {
      console.log('🗑️ Deleting user via Edge Function:', userId)

      // Get current session token
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        alert(t('common.error') + ': Session expirée')
        return
      }

      // Call Edge Function to delete user completely
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-user`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId })
        }
      )

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de la suppression')
      }

      if (result.warning) {
        console.warn('⚠️', result.warning)
        alert(t('admin.userDeleted') + '\n\n' + t('admin.authDeleteNote'))
      } else {
        console.log('✅ User deleted completely')
        alert(t('admin.userDeleted'))
      }

      loadUsers()
    } catch (error) {
      console.error('❌ Error deleting user:', error)
      let errorMessage = 'An unexpected error occurred. Please try again.'
      if (error.message.includes('Failed to fetch')) {
        errorMessage = 'Network error: Unable to connect to the server. Please check your internet connection.'
      } else if (error.message) {
        errorMessage = error.message
      }
      alert(t('common.error') + ': ' + errorMessage)
    }
  }

  const openEditModal = (user) => {
    setEditingUser(user)
    setFormData({
      username: user.username,
      email: user.email,
      password: '',
      full_name: user.full_name,
      role: user.role,
      is_active: user.is_active
    })
    setSelectedServices(
      user.technician_services?.map(ts => ts.service_type) || []
    )
    setShowModal(true)
  }

  const openCreateModal = () => {
    setEditingUser(null)
    resetForm()
    setShowModal(true)
  }

  const resetForm = () => {
    setFormData({
      username: '',
      email: '',
      password: '',
      full_name: '',
      role: 'user',
      is_active: true
    })
    setSelectedServices([])
    setErrors({})
  }

  const toggleService = (service) => {
    setSelectedServices(prev =>
      prev.includes(service)
        ? prev.filter(s => s !== service)
        : [...prev, service]
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">{t('admin.users')}</h1>
        <button
          onClick={openCreateModal}
          className="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-lg transition-colors flex items-center space-x-2"
        >
          <UserPlus size={20} />
          <span>{t('admin.addUser')}</span>
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('auth.username')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('admin.fullName')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('admin.role')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('admin.services')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('ticket.status')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('ticket.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary">
                    {user.username}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {user.full_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      user.role === 'admin' ? 'bg-red-100 text-red-800' :
                      user.role === 'technicien' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {t(`roles.${user.role}`)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.role === 'technicien' && user.technician_services?.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {user.technician_services.map((ts, idx) => (
                          <span key={idx} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                            {ts.service_type}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.is_active ? t('admin.active') : t('admin.inactive')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openEditModal(user)}
                        className="text-blue-600 hover:text-blue-800"
                        title={t('common.edit')}
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="text-red-600 hover:text-red-800"
                        title={t('common.delete')}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  {editingUser ? t('admin.editUser') : t('admin.createUser')}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {errors.general && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {errors.general}
                  </div>
                )}

                {/* Username */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('auth.username')} *
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase() })}
                    required
                    pattern="[a-z0-9_]+"
                    title="Lettres minuscules, chiffres et underscore uniquement"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <p className="mt-1 text-xs text-gray-500">Lettres minuscules, chiffres et _ uniquement</p>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('auth.email')} *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={editingUser}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100"
                  />
                </div>

                {/* Password (only for new users) */}
                {!editingUser && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('auth.password')} *
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                      minLength={6}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                )}

                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('admin.fullName')} *
                  </label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                {/* Role */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('admin.role')} *
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="user">{t('roles.user')}</option>
                    <option value="technicien">{t('roles.technicien')}</option>
                    <option value="admin">{t('roles.admin')}</option>
                  </select>
                </div>

                {/* Services (only for technicians) */}
                {formData.role === 'technicien' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('admin.assignServices')}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {services.map(service => (
                        <button
                          key={service}
                          type="button"
                          onClick={() => toggleService(service)}
                          className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                            selectedServices.includes(service)
                              ? 'bg-primary text-white border-primary'
                              : 'bg-white text-gray-700 border-gray-300 hover:border-primary'
                          }`}
                        >
                          {service}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Active Status */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
                    {t('admin.active')}
                  </label>
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    {t('common.cancel')}
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors flex items-center space-x-2"
                  >
                    <Save size={20} />
                    <span>{t('common.save')}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

