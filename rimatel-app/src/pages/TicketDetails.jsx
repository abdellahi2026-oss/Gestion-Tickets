import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabase'
import { ArrowLeft, Calendar, User, Phone, MapPin, Wifi, AlertCircle, Clock, CheckCircle, History, Send } from 'lucide-react'

export default function TicketDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const [ticket, setTicket] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [history, setHistory] = useState([])
  const [historyLoading, setHistoryLoading] = useState(true)
  const [replyText, setReplyText] = useState('')
  const [sendingReply, setSendingReply] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [historyLoaded, setHistoryLoaded] = useState(false)
  const [historyCounts, setHistoryCounts] = useState({ replies: 0, actions: 0 })
  const [comments, setComments] = useState([])
  const [commentsLoading, setCommentsLoading] = useState(true)
  const location = useLocation()

  useEffect(() => {
    loadTicket()
    loadHistoryCounts()
    loadComments()
  }, [id])

  useEffect(() => {
    if (location.hash === '#history') {
      setShowHistory(true)
      if (!historyLoaded) loadHistory()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.hash, id])

  const loadTicket = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('tickets')
        .select(`
          *,
          wilayas (code, name_fr, name_ar),
          regions (id, name_fr, name_ar),
          users!tickets_created_by_fkey (full_name, email)
        `)
        .eq('id', id)
        .single()

      if (error) throw error
      setTicket(data)
    } catch (err) {
      console.error('Error loading ticket:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const loadHistory = async () => {
    try {
      setHistoryLoading(true)
      const { data, error } = await supabase
        .from('ticket_history')
        .select('*')
        .eq('ticket_id', id)
        .neq('action', 'reply')
        .order('created_at', { ascending: false })

      if (error) throw error
      setHistory(data || [])
      setHistoryLoaded(true)
    } catch (err) {
      console.error('Error loading ticket history:', err)
    } finally {
      setHistoryLoading(false)
    }
  }

  const loadComments = async () => {
    try {
      setCommentsLoading(true)
      const { data, error } = await supabase
        .from('ticket_history')
        .select('*')
        .eq('ticket_id', id)
        .eq('action', 'reply')
        .order('created_at', { ascending: false })
      if (error) throw error
      setComments(data || [])
    } catch (err) {
      console.error('Error loading comments:', err)
    } finally {
      setCommentsLoading(false)
    }
  }

  const loadHistoryCounts = async () => {
    try {
      const { data, error } = await supabase
        .from('ticket_history')
        .select('id, action')
        .eq('ticket_id', id)
      if (error) throw error
      const replies = (data || []).filter(h => h.action === 'reply').length
      const actions = (data || []).filter(h => h.action !== 'reply').length
      setHistoryCounts({ replies, actions })
    } catch (err) {
      console.error('Error loading history counts:', err)
    }
  }

  const submitReply = async () => {
    if (!replyText.trim()) return
    try {
      setSendingReply(true)
      const { data: { user } } = await supabase.auth.getUser()
      const changedByName = user?.user_metadata?.full_name || user?.email || 'Utilisateur'
      const { error } = await supabase
        .from('ticket_history')
        .insert({
          ticket_id: id,
          action: 'reply',
          notes: replyText.trim(),
          changed_by: user?.id || null,
          changed_by_name: changedByName,
          created_at: new Date().toISOString()
        })
      if (error) throw error
      setReplyText('')
      loadComments()
      loadHistoryCounts()
    } catch (err) {
      console.error('Error submitting reply:', err)
      alert(t('common.error'))
    } finally {
      setSendingReply(false)
    }
  }

  const locale = i18n?.language?.startsWith('ar')
    ? 'ar'
    : i18n?.language?.startsWith('en')
    ? 'en-US'
    : 'fr-FR'

  const sendLabel = i18n?.language?.startsWith('ar')
    ? 'إرسال'
    : i18n?.language?.startsWith('en')
    ? 'Send'
    : 'Envoyer'

  const commentsLabel = i18n?.language?.startsWith('ar')
    ? 'التعليقات'
    : i18n?.language?.startsWith('en')
    ? 'Comments'
    : 'Commentaires'

  const historyLabel = i18n?.language?.startsWith('ar')
    ? 'السجل'
    : i18n?.language?.startsWith('en')
    ? 'History'
    : 'Historique'

  const getStatusColor = (status) => {
    switch (status) {
      case 'ouvert':
        return 'bg-blue-100 text-blue-800'
      case 'en_cours':
        return 'bg-yellow-100 text-yellow-800'
      case 'en_retard':
        return 'bg-red-100 text-red-800'
      case 'fermé':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'ouvert':
        return <AlertCircle className="w-5 h-5" />
      case 'en_cours':
        return <Clock className="w-5 h-5" />
      case 'fermé':
        return <CheckCircle className="w-5 h-5" />
      default:
        return <AlertCircle className="w-5 h-5" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error || !ticket) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p className="font-semibold">Erreur</p>
          <p>{error || 'Ticket non trouvé'}</p>
        </div>
        <button
          onClick={() => navigate('/tickets')}
          className="mt-4 flex items-center gap-2 text-primary hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour à la liste
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/tickets')}
          className="flex items-center gap-2 text-gray-600 hover:text-primary mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('common.back') || 'Retour'}
        </button>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {t('ticket.title')} #{ticket.ticket_number}
            </h1>
            <p className="text-gray-500 mt-1">
              {t('ticket.createdAt')}: {new Date(ticket.created_at).toLocaleDateString('fr-FR')}
            </p>
          </div>
          
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${getStatusColor(ticket.status)}`}>
            {getStatusIcon(ticket.status)}
            <span className="font-semibold">{t(`status.${ticket.status}`)}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Client Information */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Informations Client
          </h2>
          
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-500">N° d'abonné</label>
              <p className="font-medium text-gray-900">{ticket.subscriber_number}</p>
            </div>
            
            <div>
              <label className="text-sm text-gray-500 flex items-center gap-1">
                <Phone className="w-4 h-4" />
                Téléphone
              </label>
              <p className="font-medium text-gray-900">{ticket.phone}</p>
            </div>
            
            {ticket.client_name && (
              <div>
                <label className="text-sm text-gray-500">Nom du client</label>
                <p className="font-medium text-gray-900">{ticket.client_name}</p>
              </div>
            )}
            
            <div>
              <label className="text-sm text-gray-500 flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                Localisation
              </label>
              <p className="font-medium text-gray-900">
                {ticket.wilayas?.name_fr || ticket.wilaya_code}
                {ticket.regions && ` - ${ticket.regions.name_fr}`}
              </p>
            </div>
          </div>
        </div>

        {/* Technical Information */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Wifi className="w-5 h-5 text-primary" />
            Informations Techniques
          </h2>
          
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-500">Type d'abonnement</label>
              <p className="font-medium text-gray-900">{ticket.subscription_type}</p>
            </div>
            
            {ticket.complaint_type && (
              <div>
                <label className="text-sm text-gray-500">Type de réclamation</label>
                <p className="font-medium text-gray-900">{ticket.complaint_type}</p>
              </div>
            )}
            
            <div>
              <label className="text-sm text-gray-500 flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Date de création
              </label>
              <p className="font-medium text-gray-900">
                {new Date(ticket.created_at).toLocaleString('fr-FR')}
              </p>
            </div>
            
            {ticket.users && (
              <div>
                <label className="text-sm text-gray-500">Créé par</label>
                <p className="font-medium text-gray-900">{ticket.users.full_name}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Problem Description */}
      <div className="bg-white rounded-lg shadow-md p-6 mt-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-primary" />
          Description du problème
        </h2>
        <p className="text-gray-700 whitespace-pre-wrap">{ticket.problem_description}</p>
      </div>

      {/* Commentaires */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-blue-900 mb-4 flex items-center gap-2">
          {commentsLabel}
          <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800">
            {historyCounts.replies}
          </span>
        </h2>
        {/* Zone de saisie de réponse (sans libellé) */}
        <div className="mb-4">
          <div className="flex gap-2">
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder={''}
              className="flex-1 border border-blue-300 rounded-lg p-2 focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
              rows={2}
            />
            <button
              onClick={submitReply}
              disabled={sendingReply}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-2 disabled:opacity-60"
            >
              <Send className="w-4 h-4" />
              {sendingReply ? (t('common.sending') || (i18n?.language?.startsWith('en') ? 'Sending...' : i18n?.language?.startsWith('ar') ? 'جارٍ الإرسال...' : 'Envoi...')) : sendLabel}
            </button>
          </div>
        </div>

        {commentsLoading ? (
          <div className="flex items-center justify-center h-24">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (comments.length === 0 ? (
          <p className="text-blue-800">{i18n?.language?.startsWith('en') ? 'No comments yet.' : i18n?.language?.startsWith('ar') ? 'لا توجد تعليقات بعد.' : 'Aucun commentaire.'}</p>
        ) : (
          <ul className="space-y-4">
            {comments.map((h) => (
              <li key={h.id} className="border border-blue-200 rounded-lg p-4 bg-white">
                <div className="flex justify-between items-center">
                  <div className="font-semibold text-gray-800">
                    {h.changed_by_name || (i18n?.language?.startsWith('en') ? 'User' : i18n?.language?.startsWith('ar') ? 'مستخدم' : 'Utilisateur')}
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(h.created_at).toLocaleString(locale)}
                  </div>
                </div>
                <div className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">
                  {h.notes}
                </div>
              </li>
            ))}
          </ul>
        ))}
      </div>

      {/* Actions */}
      <div className="mt-6 flex gap-4">
        <button
          onClick={() => navigate(`/tickets/${id}/edit`)}
          className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
        >
          Modifier
        </button>
        <button
          onClick={() => navigate('/tickets')}
          className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Retour
        </button>
        <button
          onClick={() => {
            setShowHistory(true)
            if (!historyLoaded) loadHistory()
            const el = document.getElementById('history')
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }}
          className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
        >
          <History className="w-4 h-4" />
          {historyLabel}
          <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700">{historyCounts.actions}</span>
        </button>
      </div>

      {/* Historique des actions */}
      {showHistory && (
      <div id="history" className="bg-white rounded-lg shadow-md p-6 mt-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <History className="w-5 h-5 text-primary" />
          {historyLabel}
        </h2>

        {historyLoading ? (
          <div className="flex items-center justify-center h-24">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : history.length === 0 ? (
          <p className="text-gray-600">{t('common.noData') || (i18n?.language?.startsWith('en') ? 'No records.' : i18n?.language?.startsWith('ar') ? 'لا سجلات.' : 'Aucun événement enregistré.')}</p>
        ) : (
          <div className="space-y-8">
            {/* Status/Action History */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">{historyLabel}</h3>
              {history.length === 0 ? (
                <p className="text-gray-600">{i18n?.language?.startsWith('en') ? 'No status changes.' : i18n?.language?.startsWith('ar') ? 'لا تغييرات في الحالة.' : 'Aucune modification de statut.'}</p>
              ) : (
                <ul className="space-y-4">
                  {history.map((h) => (
                    <li key={h.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <div className="font-semibold text-gray-800">
                          {h.action}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(h.created_at).toLocaleString(locale)}
                        </div>
                      </div>
                      <div className="mt-2 text-sm text-gray-700">
                        {(h.from_status || h.to_status) && (
                          <span>
                            {h.from_status ? t(`status.${h.from_status}`) : '—'} → {h.to_status ? t(`status.${h.to_status}`) : '—'}
                          </span>
                        )}
                      </div>
                      {(h.changed_by_name) && (
                        <div className="mt-2 text-sm text-gray-600">
                          {i18n?.language?.startsWith('en') ? 'By' : i18n?.language?.startsWith('ar') ? 'بواسطة' : 'Par'}: {h.changed_by_name}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>
      )}
    </div>
  )
}
