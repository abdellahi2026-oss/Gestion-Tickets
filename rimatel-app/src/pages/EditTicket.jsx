import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabase'
import { Save, X, ArrowLeft } from 'lucide-react'

export default function EditTicket() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [wilayas, setWilayas] = useState([])
  const [regions, setRegions] = useState([])
  const [complaintTypes, setComplaintTypes] = useState([])
  const [errors, setErrors] = useState({})

  const [formData, setFormData] = useState({
    subscriber_number: '',
    phone: '',
    client_name: '',
    wilaya_code: '',
    region_id: '',
    subscription_type: '',
    complaint_type: '',
    problem_description: '',
    status: 'ouvert'
  })

  useEffect(() => {
    loadTicketData()
    loadReferenceData()
  }, [id])

  useEffect(() => {
    if (formData.wilaya_code === '15') {
      loadRegions()
    } else {
      setRegions([])
      setFormData(prev => ({ ...prev, region_id: '' }))
    }
  }, [formData.wilaya_code])

  useEffect(() => {
    if (formData.subscription_type) {
      loadComplaintTypes()
    }
  }, [formData.subscription_type])

  const loadTicketData = async () => {
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      
      setFormData({
        subscriber_number: data.subscriber_number || '',
        phone: data.phone || '',
        client_name: data.client_name || '',
        wilaya_code: data.wilaya_code || '',
        region_id: data.region_id || '',
        subscription_type: data.subscription_type || '',
        complaint_type: data.complaint_type || '',
        problem_description: data.problem_description || '',
        status: data.status || 'ouvert'
      })
    } catch (err) {
      console.error('Error loading ticket:', err)
      alert('Erreur lors du chargement de la tâche')
    } finally {
      setLoadingData(false)
    }
  }

  const loadReferenceData = async () => {
    const { data: wilayasData } = await supabase
      .from('wilayas')
      .select('*')
      .order('name_fr')
    
    if (wilayasData) setWilayas(wilayasData)
  }

  const loadRegions = async () => {
    const { data } = await supabase
      .from('regions')
      .select('*')
      .order('name_fr')
    
    if (data) setRegions(data)
  }

  const loadComplaintTypes = async () => {
    const { data } = await supabase
      .from('complaint_types')
      .select('*')
      .order('name_fr')
    
    if (data) setComplaintTypes(data)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    // Subscriber number validation (case-insensitive: DAB or dab)
    const subRegex = /^DAB\d{1,6}$/i
    if (!formData.subscriber_number) {
      newErrors.subscriber_number = t('validation.required')
    } else if (!subRegex.test(formData.subscriber_number)) {
      newErrors.subscriber_number = t('validation.invalidFormat')
    }

    // Phone validation
    const phoneRegex = /^\+?\d{6,15}$/
    if (!formData.phone) {
      newErrors.phone = t('validation.required')
    } else if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = t('validation.invalidFormat')
    }

    // Required fields
    if (!formData.wilaya_code) newErrors.wilaya_code = t('validation.required')
    if (!formData.subscription_type) newErrors.subscription_type = t('validation.required')
    if (!formData.complaint_type) newErrors.complaint_type = t('validation.required')
    // Problem description now optional

    // Region required for Nouakchott
    if (formData.wilaya_code === '15' && !formData.region_id) {
      newErrors.region_id = t('validation.regionRequired')
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase
        .from('tickets')
        .update({
          subscriber_number: formData.subscriber_number,
          phone: formData.phone,
          client_name: formData.client_name || null,
          wilaya_code: formData.wilaya_code,
          region_id: formData.region_id || null,
          subscription_type: formData.subscription_type,
          complaint_type: formData.complaint_type,
          problem_description: formData.problem_description,
          status: formData.status,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)

      if (error) throw error

      alert('Ticket modifié avec succès!')
      navigate(`/tickets/${id}`)
    } catch (err) {
      console.error('Error updating ticket:', err)
      alert('Erreur lors de la modification: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loadingData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <button
          onClick={() => navigate(`/tickets/${id}`)}
          className="flex items-center gap-2 text-gray-600 hover:text-primary mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('common.back')}
        </button>
        <h1 className="text-3xl font-bold text-gray-900">
          Modifier le Ticket
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
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
              placeholder="DAB12345"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                errors.subscriber_number ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.subscriber_number && (
              <p className="mt-1 text-sm text-red-600">{errors.subscriber_number}</p>
            )}
          </div>

          {/* Phone */}
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
          </div>

          {/* Client Name */}
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

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('ticket.status')} *
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="ouvert">Ouvert</option>
              <option value="en_cours">En cours</option>
              <option value="en_retard">En retard</option>
              <option value="fermé">Fermé</option>
            </select>
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
              {/* Affichage du libellé: Wilaya → Région */}
              {/* Remplacement visuel seulement */}
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

          {/* Region (only for Nouakchott) */}
          {formData.wilaya_code === '15' && (
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
              <option value="SAWI">SAWI</option>
              <option value="LTE">LTE</option>
              <option value="BLR">BLR</option>
              <option value="FTTH">FTTH</option>
              <option value="LS/MPLS">LS/MPLS</option>
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
        </div>

        {/* Problem Description */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('ticket.problemDescription')}
          </label>
          <textarea
            name="problem_description"
            value={formData.problem_description}
            onChange={handleChange}
            rows={4}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
              errors.problem_description ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.problem_description && (
            <p className="mt-1 text-sm text-red-600">{errors.problem_description}</p>
          )}
        </div>

        {/* Actions */}
        <div className="mt-6 flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {loading ? t('common.loading') : t('common.save')}
          </button>
          <button
            type="button"
            onClick={() => navigate(`/tickets/${id}`)}
            className="flex items-center gap-2 px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            <X className="w-4 h-4" />
            {t('common.cancel')}
          </button>
        </div>
      </form>
    </div>
  )
}
