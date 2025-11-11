import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Search, Filter, Eye, Edit, History, Download } from 'lucide-react'

export default function TicketList() {
  const { t, i18n } = useTranslation()
  const [tickets, setTickets] = useState([])
  const [filteredTickets, setFilteredTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const location = useLocation()

  useEffect(() => {
    loadTickets()
  }, [])

  useEffect(() => {
    filterTickets()
  }, [searchTerm, statusFilter, tickets])

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const status = params.get('status')
    if (status) setStatusFilter(status)
  }, [location.search])

  const loadTickets = async () => {
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select('*, wilayas(name_fr, name_ar, name_en), regions(name_fr, name_ar, name_en)')
        .order('created_at', { ascending: false })

      if (error) throw error
      setTickets(data || [])
    } catch (error) {
      console.error('Error loading tickets:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterTickets = () => {
    let filtered = tickets

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(ticket =>
        ticket.ticket_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.subscriber_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.phone.includes(searchTerm)
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(ticket => ticket.status === statusFilter)
    }

    setFilteredTickets(filtered)
  }

  const updateTicketStatus = async (ticketId, newStatus) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const actorName = user?.user_metadata?.full_name || user?.email || 'Utilisateur'
      const { error } = await supabase
        .from('tickets')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString(),
          ...(newStatus === 'fermé' && { closed_at: new Date().toISOString() })
        })
        .eq('id', ticketId)

      if (error) throw error

      // Add to history
      await supabase.from('ticket_history').insert({
        ticket_id: ticketId,
        action: 'status_change',
        to_status: newStatus,
        changed_by: user?.id || null,
        changed_by_name: actorName,
        created_at: new Date().toISOString()
      })

      // Reload tickets
      loadTickets()
    } catch (error) {
      console.error('Error updating ticket:', error)
      alert(t('common.error'))
    }
  }

  const statuses = ['nouveau', 'assigné', 'paiement', 'en_cours', 'injoignable', 'en_retard', 'fermé']

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
        <h1 className="text-3xl font-bold text-gray-800">{t('ticket.title')}</h1>
        <Link
          to="/tickets/new"
          className="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-lg transition-colors"
        >
          + {t('ticket.new')}
        </Link>
      </div>

      {/* Actions Row */}
      <div className="flex justify-end gap-2">
        <button
          onClick={() => {
            const rows = filteredTickets.map(t => ({
              ticket_number: t.ticket_number,
              subscriber_number: t.subscriber_number,
              phone: t.phone,
              wilaya: (() => {
                const lang = i18n.language || 'fr'
                const key = lang.startsWith('ar') ? 'name_ar' : lang.startsWith('en') ? 'name_en' : 'name_fr'
                return t.wilayas?.[key] || t.wilaya_code
              })(),
              region: (() => {
                const lang = i18n.language || 'fr'
                const key = lang.startsWith('ar') ? 'name_ar' : lang.startsWith('en') ? 'name_en' : 'name_fr'
                return t.regions?.[key] || ''
              })(),
              subscription_type: t.subscription_type,
              status: t.status,
              created_at: t.created_at
            }))

            // En-têtes avec accents corrects en FR et BOM pour Excel
            const isFr = (i18n.language || 'fr').startsWith('fr')
            const headers = isFr
              ? ['N° Ticket', "N° d'abonné", 'Téléphone', 'Région', 'Zone', "Type d'abonnement", 'Statut', 'Créé le']
              : [
                  t('ticket.number'),
                  t('ticket.subscriberNumber'),
                  t('ticket.phone'),
                  'Region',
                  'Zone',
                  t('ticket.subscriptionType'),
                  t('ticket.status'),
                  t('ticket.createdAt')
                ]

            const csvBody = [
              headers.join(','),
              ...rows.map(r => [
                r.ticket_number,
                r.subscriber_number,
                r.phone,
                r.wilaya,
                r.region,
                r.subscription_type,
                t(`status.${r.status}`),
                new Date(r.created_at).toLocaleString(i18n.language || 'fr-FR')
              ].map(val => `${String(val ?? '').replace(/,/g, ';')}`).join(','))
            ].join('\n')

            // Préfixer avec BOM pour corriger l’encodage des caractères
            const BOM = '\ufeff'
            const blob = new Blob([BOM + csvBody], { type: 'text/csv;charset=utf-8;' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `tickets_export_${new Date().toISOString().slice(0,10)}.csv`
            a.click()
            URL.revokeObjectURL(url)
          }}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
        >
          <Download size={18} />
          {/* Renommage : libellé sans préfixe common */}
          Exporte
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder={t('ticket.search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="all">{t('ticket.all')}</option>
              {statuses.map(status => (
                <option key={status} value={status}>{t(`status.${status}`)}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('ticket.number')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('ticket.subscriberNumber')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('ticket.phone')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Région
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Zone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('ticket.subscriptionType')}
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
              {filteredTickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary">
                    {ticket.ticket_number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {ticket.subscriber_number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {ticket.phone}
                    {ticket.client_name && (
                      <div className="text-xs text-gray-500">{ticket.client_name}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {ticket.wilayas?.name_fr || ticket.wilaya_code}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {ticket.regions?.name_fr || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {ticket.subscription_type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={ticket.status}
                      onChange={(e) => updateTicketStatus(ticket.id, e.target.value)}
                      className={`px-2 py-1 text-xs font-semibold rounded-full border-0 cursor-pointer ${
                        ticket.status === 'fermé' ? 'bg-gray-100 text-gray-800' :
                        ticket.status === 'en_retard' ? 'bg-red-100 text-red-800' :
                        ticket.status === 'en_cours' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}
                    >
                      {statuses.map(status => (
                        <option key={status} value={status}>{t(`status.${status}`)}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => window.location.href = `/tickets/${ticket.id}`}
                        className="text-primary hover:text-primary-dark"
                        title={t('common.view')}
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => window.location.href = `/tickets/${ticket.id}#history`}
                        className="text-gray-600 hover:text-primary"
                        title={t('common.history') || 'Historique'}
                      >
                        <History size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredTickets.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">{t('ticket.all')} - {t('common.loading')}</p>
          </div>
        )}
      </div>
    </div>
  )
}
