import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  LayoutDashboard,
  Ticket,
  PlusCircle,
  LogOut,
  Menu,
  X,
  Globe,
  Shield,
  History,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function Layout({ children }) {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [adminMenuOpen, setAdminMenuOpen] = useState(false)
  const [user, setUser] = useState(null)
  const [userRole, setUserRole] = useState(null)

  // Get user info and role
  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        const { data: userData } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single()

        console.log('User role loaded:', userData?.role) // للتشخيص
        setUserRole(userData?.role)
      } else {
        setUserRole(null)
      }
    }
    loadUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        loadUser()
      } else {
        setUser(null)
        setUserRole(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // Close admin menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (adminMenuOpen && !event.target.closest('.admin-dropdown')) {
        setAdminMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [adminMenuOpen])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng)
    document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr'
  }

  const navItems = [
    { path: '/', icon: LayoutDashboard, label: t('nav.dashboard') },
    { path: '/tickets', icon: Ticket, label: t('nav.tickets') },
    { path: '/tickets/new', icon: PlusCircle, label: t('nav.newTicket') },
  ]

  // Admin menu items
  const adminMenuItems = [
    { path: '/admin/users', icon: Shield, label: t('admin.users') },
    { path: '/admin/logs', icon: History, label: 'Journal d\'Activité' }
  ]

  const isActive = (path) => location.pathname === path

  return (
    <div className="min-h-screen bg-gray-50" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <header className="bg-primary text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <img 
                src="/logo.png" 
                alt="RIMATEL SA" 
                className="h-10 w-auto"
                onError={(e) => {
                  e.target.style.display = 'none'
                }}
              />
              <h1 className="text-xl font-bold">{t('app.company')}</h1>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-4 items-center">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                    isActive(item.path)
                      ? 'bg-primary-dark'
                      : 'hover:bg-primary-dark/50'
                  }`}
                >
                  <item.icon size={20} />
                  <span>{item.label}</span>
                </Link>
              ))}

              {/* Admin Dropdown Menu */}
              {userRole === 'admin' && (
                <div className="relative admin-dropdown">
                  <button
                    onClick={() => setAdminMenuOpen(!adminMenuOpen)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                      location.pathname.startsWith('/admin')
                        ? 'bg-primary-dark'
                        : 'hover:bg-primary-dark/50'
                    }`}
                  >
                    <Shield size={20} />
                    <span>Administration</span>
                    {adminMenuOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>

                  {/* Dropdown */}
                  {adminMenuOpen && (
                    <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-2 z-50 border border-gray-200">
                      {adminMenuItems.map((item) => (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={() => setAdminMenuOpen(false)}
                          className={`flex items-center space-x-3 px-4 py-3 hover:bg-gray-100 transition-colors ${
                            isActive(item.path) ? 'bg-gray-50 text-primary font-semibold' : 'text-gray-700'
                          }`}
                        >
                          <item.icon size={18} />
                          <span>{item.label}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </nav>

            {/* Language Switcher & Logout */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-primary-dark rounded-md px-2 py-1">
                <Globe size={16} />
                <select
                  value={i18n.language}
                  onChange={(e) => changeLanguage(e.target.value)}
                  className="bg-transparent border-none text-white text-sm focus:outline-none cursor-pointer"
                >
                  <option value="fr">FR</option>
                  <option value="ar">AR</option>
                  <option value="en">EN</option>
                </select>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-primary-dark transition-colors"
              >
                <LogOut size={20} />
                <span className="hidden sm:inline">{t('auth.logout')}</span>
              </button>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-md hover:bg-primary-dark"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-primary-dark">
            <nav className="px-4 py-3 space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-md ${
                    isActive(item.path)
                      ? 'bg-primary-dark'
                      : 'hover:bg-primary-dark/50'
                  }`}
                >
                  <item.icon size={20} />
                  <span>{item.label}</span>
                </Link>
              ))}

              {/* Admin Menu for Mobile */}
              {userRole === 'admin' && (
                <div className="border-t border-primary-dark pt-2 mt-2">
                  <div className="px-3 py-2 text-sm font-semibold text-white/70">
                    Administration
                  </div>
                  {adminMenuItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center space-x-3 px-3 py-2 rounded-md ${
                        isActive(item.path)
                          ? 'bg-primary-dark'
                          : 'hover:bg-primary-dark/50'
                      }`}
                    >
                      <item.icon size={20} />
                      <span>{item.label}</span>
                    </Link>
                  ))}
                </div>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-gray-600 text-sm">
            © 2024 {t('app.company')} - {t('app.title')}
          </p>
        </div>
      </footer>
    </div>
  )
}

