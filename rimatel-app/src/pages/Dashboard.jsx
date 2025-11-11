import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { 
  Ticket, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  TrendingUp 
} from 'lucide-react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar, Pie } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
)

// Plugin pour afficher les valeurs au-dessus des barres
const valueLabelPlugin = {
  id: 'valueLabel',
  afterDatasetsDraw(chart, args, pluginOptions) {
    const { ctx } = chart
    chart.data.datasets.forEach((dataset, datasetIndex) => {
      const meta = chart.getDatasetMeta(datasetIndex)
      meta.data.forEach((bar, index) => {
        const value = dataset.data[index]
        if (value == null) return
        const pos = bar.tooltipPosition()
        ctx.save()
        ctx.fillStyle = (pluginOptions && pluginOptions.color) || '#111'
        ctx.font = (pluginOptions && pluginOptions.font) || 'bold 12px sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'bottom'
        ctx.fillText(String(value), pos.x, pos.y - 4)
        ctx.restore()
      })
    })
  }
}

ChartJS.register(valueLabelPlugin)

export default function Dashboard() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    closed: 0,
    late: 0,
    assigned: 0,
    payment: 0,
    inProgress: 0,
    unreachable: 0
  })
  const [wilayaData, setWilayaData] = useState([])
  const [regionData, setRegionData] = useState([])
  const [serviceData, setServiceData] = useState([])
  const [recentTickets, setRecentTickets] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      // Get all tickets
      const { data: tickets, error } = await supabase
        .from('tickets')
        .select('*, wilayas(name_fr), regions(name_fr)')
        .order('created_at', { ascending: false })

      if (error) throw error

      // Calculate stats
      const total = tickets.length
      const open = tickets.filter(t => t.status !== 'fermé').length
      const closed = tickets.filter(t => t.status === 'fermé').length
      const late = tickets.filter(t => t.status === 'en_retard').length
      const assigned = tickets.filter(t => t.status === 'assigné').length
      const payment = tickets.filter(t => t.status === 'paiement').length
      const inProgress = tickets.filter(t => t.status === 'en_cours').length
      const unreachable = tickets.filter(t => t.status === 'injoignable').length

      setStats({ total, open, closed, late, assigned, payment, inProgress, unreachable })

      // Group by wilaya
      const wilayaGroups = tickets.reduce((acc, ticket) => {
        const wilaya = ticket.wilayas?.name_fr || ticket.wilaya_code
        acc[wilaya] = (acc[wilaya] || 0) + 1
        return acc
      }, {})
      setWilayaData(Object.entries(wilayaGroups))

      // Group by region (Nouakchott only) — accept both 'NKC' and '15'
      const nkcTickets = tickets.filter(t => t.wilaya_code === 'NKC' || t.wilaya_code === '15')
      const regionGroups = nkcTickets.reduce((acc, ticket) => {
        const region = ticket.regions?.name_fr || 'Non spécifié'
        acc[region] = (acc[region] || 0) + 1
        return acc
      }, {})
      setRegionData(Object.entries(regionGroups))

      // Group by service
      const serviceGroups = tickets.reduce((acc, ticket) => {
        acc[ticket.subscription_type] = (acc[ticket.subscription_type] || 0) + 1
        return acc
      }, {})
      setServiceData(Object.entries(serviceGroups))

      // Recent tickets
      setRecentTickets(tickets.slice(0, 5))

    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    { 
      label: t('dashboard.total'), 
      value: stats.total, 
      icon: Ticket, 
      color: 'bg-blue-500',
      statusParam: null
    },
    { 
      label: t('dashboard.open'), 
      value: stats.open, 
      icon: TrendingUp, 
      color: 'bg-green-500',
      statusParam: null
    },
    { 
      label: t('dashboard.closed'), 
      value: stats.closed, 
      icon: CheckCircle, 
      color: 'bg-gray-500',
      statusParam: 'fermé'
    },
    { 
      label: t('dashboard.late'), 
      value: stats.late, 
      icon: AlertCircle, 
      color: 'bg-red-500',
      statusParam: 'en_retard'
    },
    { 
      label: t('status.assigné'), 
      value: stats.assigned, 
      icon: Clock, 
      color: 'bg-yellow-500',
      statusParam: 'assigné'
    },
    { 
      label: t('status.paiement'), 
      value: stats.payment, 
      icon: AlertCircle, 
      color: 'bg-orange-500',
      statusParam: 'paiement'
    },
    { 
      label: t('status.en_cours'), 
      value: stats.inProgress, 
      icon: Clock, 
      color: 'bg-indigo-500',
      statusParam: 'en_cours'
    },
    { 
      label: t('status.injoignable'), 
      value: stats.unreachable, 
      icon: AlertCircle, 
      color: 'bg-purple-500',
      statusParam: 'injoignable'
    },
  ]

  const wilayaChartData = {
    labels: wilayaData.map(([name]) => name),
    datasets: [{
      label: t('dashboard.byWilaya'),
      data: wilayaData.map(([, count]) => count),
      backgroundColor: '#FFD700',
    }]
  }

  const serviceChartData = {
    labels: serviceData.map(([name]) => name),
    datasets: [{
      data: serviceData.map(([, count]) => count),
      backgroundColor: ['#22AA66', '#2bc47a', '#1a8850', '#15704a'],
    }]
  }

  const regionChartData = {
    labels: regionData.map(([name]) => name),
    datasets: [{
      label: t('dashboard.byRegion') || 'Par zone (Nouakchott)',
      data: regionData.map(([, count]) => count),
      backgroundColor: '#006400',
    }]
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
      <h1 className="text-3xl font-bold text-gray-800">{t('dashboard.title')}</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <button
            key={index}
            className="bg-white rounded-lg shadow-md p-6 text-left hover:bg-gray-50"
            onClick={() => {
              if (stat.statusParam) {
                navigate(`/tickets?status=${encodeURIComponent(stat.statusParam)}`)
              } else {
                navigate('/tickets')
              }
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="text-white" size={24} />
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Wilaya Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Par région
          </h2>
          <Bar 
            data={wilayaChartData} 
            options={{
              responsive: true,
              plugins: {
                legend: { display: false },
                valueLabel: { color: '#111', font: 'bold 12px sans-serif' }
              },
              scales: { y: { beginAtZero: true, ticks: { stepSize: 1, precision: 0 } } }
            }}
          />
        </div>

        {/* Service Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            {t('dashboard.byService')}
          </h2>
          <Pie 
            data={serviceChartData}
            options={{
              responsive: true,
              plugins: {
                legend: { position: 'bottom' }
              }
            }}
          />
        </div>

        {/* Nouakchott Regions Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Par zone (Nouakchott)
          </h2>
          {regionData.length === 0 ? (
            <p className="text-gray-600">{t('common.noData') || 'Aucune donnée pour Nouakchott.'}</p>
          ) : (
            <Bar
              data={regionChartData}
              options={{
                responsive: true,
                plugins: { 
                  legend: { display: false },
                  valueLabel: { color: '#111', font: 'bold 12px sans-serif' }
                },
                scales: { y: { beginAtZero: true, ticks: { stepSize: 1, precision: 0 } } }
              }}
            />
          )}
        </div>
      </div>

      {/* Recent Tickets */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          {t('dashboard.recentTickets')}
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  {t('ticket.number')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  {t('ticket.phone')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  {t('ticket.status')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  {t('ticket.createdAt')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentTickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary">
                    <Link to={`/tickets/${ticket.id}`}>{ticket.ticket_number}</Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {ticket.phone}
                    {ticket.client_name && (
                      <div className="text-xs text-gray-500">{ticket.client_name}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      ticket.status === 'fermé' ? 'bg-gray-100 text-gray-800' :
                      ticket.status === 'en_retard' ? 'bg-red-100 text-red-800' :
                      ticket.status === 'en_cours' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {t(`status.${ticket.status}`)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(ticket.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
