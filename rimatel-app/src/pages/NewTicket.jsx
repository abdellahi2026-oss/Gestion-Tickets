import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Save, X } from 'lucide-react'

export default function NewTicket() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [wilayas, setWilayas] = useState([])
  const [regions, setRegions] = useState([])
  const [errors, setErrors] = useState({})

  const [formData, setFormData] = useState({
    subscriber_number: '',
    phone: '',
    client_name: '',
    wilaya_code: '',
    region_id: '',
    subscription_type: '',
    complaint_type: '',
    problem_description: ''
  })

  const [complaintTypes, setComplaintTypes] = useState([])

  useEffect(() => {
    loadReferenceData()
  }, [])

  const loadReferenceData = async () => {
    try {
      // Load wilayas
      const { data: wilayasData } = await supabase
        .from('wilayas')
        .select('*')
        .order('name_fr')
      setWilayas(wilayasData || [])

      // Load regions (NKC only)
      const { data: regionsData } = await supabase
        .from('regions')
        .select('*')
        .eq('wilaya_code', 'NKC')
        .order('name_fr')
      setRegions(regionsData || [])

      // Load complaint types
      const { data: complaintTypesData } = await supabase
        .from('complaint_types')
        .select('*')
        .eq('is_active', true)
        .order('name_fr')
      setComplaintTypes(complaintTypesData || [])
    } catch (error) {
      console.error('Error loading reference data:', error)
    }
  }

  const validateForm = () => {
    const newErrors = {}

    // Subscriber number: DAB + 1-6 digits (case-insensitive: DAB or dab)
    const subscriberRegex = /^DAB\d{1,6}$/i
    if (!formData.subscriber_number) {
      newErrors.subscriber_number = t('validation.required')
    } else if (!subscriberRegex.test(formData.subscriber_number)) {
      newErrors.subscriber_number = t('validation.invalidFormat')
    }

    // Phone: 6-15 digits, can start with + (REQUIRED - Primary identifier)
    const phoneRegex = /^\+?\d{6,15}$/
    if (!formData.phone) {
      newErrors.phone = t('validation.required')
    } else if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = t('validation.invalidFormat')
    }

    // Client name is now optional (phone is the primary identifier)
    if (!formData.wilaya_code) newErrors.wilaya_code = t('validation.required')
    if (!formData.subscription_type) newErrors.subscription_type = t('validation.required')
    if (!formData.complaint_type) newErrors.complaint_type = t('validation.required')
    // Problem description now optional

    // Region required for NKC
    if (formData.wilaya_code === 'NKC' && !formData.region_id) {
      newErrors.region_id = t('validation.regionRequired')
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const checkDuplicateTicket = async () => {
    // Check by phone number and subscription type
    const { data, error } = await supabase
      .from('tickets')
      .select('id')
      .eq('phone', formData.phone)
      .eq('subscription_type', formData.subscription_type)
      .neq('status', 'fermé')
      .limit(1)

    if (error) throw error
    return data && data.length > 0
  }

  const generateTicketNumber = () => {
    const timestamp = Date.now()
    const random = Math.floor(Math.random() * 1000)
    return `TKT-${timestamp}-${random}`
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      // Check for duplicate open ticket
      const hasDuplicate = await checkDuplicateTicket()
      if (hasDuplicate) {
        alert(t('ticket.duplicateError'))
        setLoading(false)
        return
      }

      // Get current user
      const { data: { user } } = await supabase.auth.getUser()

      // Create ticket
      const service = (formData.subscription_type || '').toUpperCase()
      const assignServices = ['FTTH', 'BLR', 'LS/MPLS']
      const initialStatus = assignServices.includes(service)
        ? 'assigné'
        : service === 'SAWI'
        ? 'en_cours'
        : 'nouveau'

      const ticketData = {
        ...formData,
        ticket_number: generateTicketNumber(),
        status: initialStatus,
        created_by: user?.id,
        created_at: new Date().toISOString()
      }

      // Remove region_id if not NKC
      if (formData.wilaya_code !== 'NKC') {
        delete ticketData.region_id
      }

      const { data: ticket, error } = await supabase
        .from('tickets')
        .insert([ticketData])
        .select()
        .single()

      if (error) throw error

      // Add to history
      const actorName = user?.user_metadata?.full_name || user?.email || 'Utilisateur'
      await supabase.from('ticket_history').insert({
        ticket_id: ticket.id,
        action: 'created',
        to_status: initialStatus,
        changed_by: user?.id || null,
        changed_by_name: actorName,
        created_at: new Date().toISOString()
      })

      alert(t('ticket.createSuccess'))
      navigate('/tickets')
    } catch (error) {
      console.error('Error creating ticket:', error)
      alert(t('common.error'))
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }))
    }
  }

  const subscriptionTypes = ['SAWI', 'LTE', 'BLR', 'FTTH', 'LS/MPLS']

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">{t('ticket.new')}</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Subscriber Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('ticket.subscriberNumber')} *
            </label>
            <input
              type="text"
              name="subscriber_number"
              value={formData.subscriber_number}
              onChange={handleChange}
              placeholder="DAB123456"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                errors.subscriber_number ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.subscriber_number && (
              <p className="mt-1 text-sm text-red-600">{errors.subscriber_number}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">{t('ticket.subscriberFormat')}</p>
          </div>

          {/* Phone - PRIMARY IDENTIFIER */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('ticket.phone')} *
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+22212345678"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                errors.phone ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">{t('ticket.phoneFormat')}</p>
          </div>

          {/* Client Name - OPTIONAL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('ticket.clientName')} ({t('common.optional')})
            </label>
            <input
              type="text"
              name="client_name"
              value={formData.client_name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Wilaya */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('ticket.wilaya')} *
            </label>
            <select
              name="wilaya_code"
              value={formData.wilaya_code}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                errors.wilaya_code ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">-- {t('ticket.wilaya')} --</option>
              {wilayas.map(wilaya => (
                <option key={wilaya.code} value={wilaya.code}>
                  {wilaya.name_fr}
                </option>
              ))}
            </select>
            {errors.wilaya_code && (
              <p className="mt-1 text-sm text-red-600">{errors.wilaya_code}</p>
            )}
          </div>

          {/* Region (only for NKC) */}
          {formData.wilaya_code === 'NKC' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('ticket.region')} *
              </label>
              <select
                name="region_id"
                value={formData.region_id}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                  errors.region_id ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">-- {t('ticket.region')} --</option>
                {regions.map(region => (
                  <option key={region.id} value={region.id}>
                    {region.name_fr}
                  </option>
                ))}
              </select>
              {errors.region_id && (
                <p className="mt-1 text-sm text-red-600">{errors.region_id}</p>
              )}
            </div>
          )}

          {/* Subscription Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('ticket.subscriptionType')} *
            </label>
            <select
              name="subscription_type"
              value={formData.subscription_type}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                errors.subscription_type ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">-- {t('ticket.subscriptionType')} --</option>
              {subscriptionTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            {errors.subscription_type && (
              <p className="mt-1 text-sm text-red-600">{errors.subscription_type}</p>
            )}
          </div>

          {/* Complaint Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('ticket.complaintType')} *
            </label>
            <select
              name="complaint_type"
              value={formData.complaint_type}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                errors.complaint_type ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">-- {t('ticket.complaintType')} --</option>
              {complaintTypes
                .filter(ct => {
                  // Filter based on subscription type
                  if (!formData.subscription_type) return true
                  return ct.applicable_to && ct.applicable_to.includes(formData.subscription_type)
                })
                .map(type => (
                  <option key={type.code} value={type.code}>
                    {i18n.language === 'ar' ? type.name_ar : i18n.language === 'en' ? type.name_en : type.name_fr}
                  </option>
                ))}
            </select>
            {errors.complaint_type && (
              <p className="mt-1 text-sm text-red-600">{errors.complaint_type}</p>
            )}
          </div>

          {/* Problem Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('ticket.problemDescription')}
            </label>
            <textarea
              name="problem_description"
              value={formData.problem_description}
              onChange={handleChange}
              rows="4"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                errors.problem_description ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.problem_description && (
              <p className="mt-1 text-sm text-red-600">{errors.problem_description}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/tickets')}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center space-x-2"
            >
              <X size={20} />
              <span>{t('common.cancel')}</span>
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors flex items-center space-x-2 disabled:opacity-50"
            >
              <Save size={20} />
              <span>{loading ? t('common.loading') : t('ticket.create')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
