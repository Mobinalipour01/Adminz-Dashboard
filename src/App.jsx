import { useState, useEffect, useRef } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { translations } from './translations'
import Products from './pages/products'
import './App.css'
// import Settings from './pages/Settings'
// import Analytics from './pages/Analytics'
// import Tools from './pages/Tools'
// import Reports from './pages/Reports'


function App() {
  const [language, setLanguage] = useState('fa') // Default to Persian
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState({
    instagram: false,
    telegram: false,
    whatsapp: false,
  })
  const [profilePhoto, setProfilePhoto] = useState(null)
  const photoInputRef = useRef(null)
  const [objectUrl, setObjectUrl] = useState(null)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    jobTitle: '',
    email: '',
    password: '',
  })
  const [products, setProducts] = useState([
    {
      id: 'prod-1',
      name: 'Starter automation kit',
      description: 'Pre-built workflows for ecommerce follow-ups.',
      category: 'Automation',
      price: '$129',
      stock: 18,
    },
    {
      id: 'prod-2',
      name: 'Premium support add-on',
      description: '24/7 concierge and AI-powered routing.',
      category: 'Support',
      price: '$89',
      stock: 12,
    },
    {
      id: 'prod-3',
      name: 'Instagram smart replies',
      description: 'Respond to DMs automatically with AI.',
      category: 'Social',
      price: '$59',
      stock: 34,
    },
  ])

  const t = translations[language]

  // Update HTML direction and lang attribute
  useEffect(() => {
    document.documentElement.lang = language
    document.documentElement.dir = language === 'fa' ? 'rtl' : 'ltr'
  }, [language])

  useEffect(() => {
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl)
      }
    }
  }, [objectUrl])

  const jobTitleOptions = [
    { value: 'onlineShop', label: t.onlineShop },
    { value: 'clothesStore', label: t.clothesStore },
    { value: 'mechanicalToolStore', label: t.mechanicalToolStore },
    { value: 'bookStore', label: t.bookStore },
    { value: 'onlineInstagramSeller', label: t.onlineInstagramSeller },
    { value: 'onlineSocialMediaSeller', label: t.onlineSocialMediaSeller },
    { value: 'restaurant', label: t.restaurant },
    { value: 'cafe', label: t.cafe },
    { value: 'designer', label: t.designer},
    { value: 'ecommerce', label: t.ecommerce},
    { value: 'pharmecy', label : t.pharmecy},
    { value: 'contentCreator', label: t.contentCreator},
    { value: 'cosmeticServices', label: t.cosmeticServices},
    { value: 'other', label: t.other },

  ]

  const monthlySalesData = [
    { month: language === 'fa' ? 'دی' : 'Jan', sales: 42000, newPurchases: 45 },
    { month: language === 'fa' ? 'بهمن' : 'Feb', sales: 38000, newPurchases: 38 },
    { month: language === 'fa' ? 'اسفند' : 'Mar', sales: 45000, newPurchases: 52 },
    { month: language === 'fa' ? 'فروردین' : 'Apr', sales: 51000, newPurchases: 58 },
    { month: language === 'fa' ? 'اردیبهشت' : 'May', sales: 48000, newPurchases: 62 },
    { month: language === 'fa' ? 'خرداد' : 'Jun', sales: 55000, newPurchases: 68 }
  ]

  const totalSales = monthlySalesData.reduce((sum, item) => sum + item.sales, 0)
  
  const handleStockUpdate = (stockUpdates) => {
    setProducts(prevProducts => {
      return prevProducts.map(product => {
        const update = stockUpdates.find(update => 
          update.name.toLowerCase() === product.name.toLowerCase()
        )
        if (update) {
          return { ...product, stock: update.stock }
        }
        return product
      })
    })
  }

  const handleProductAdd = (newProducts) => {
    setProducts(prevProducts => {
      // Add new products, avoiding duplicates by name
      const existingNames = new Set(prevProducts.map(p => p.name.toLowerCase()))
      const uniqueNewProducts = newProducts.filter(p => !existingNames.has(p.name.toLowerCase()))
      return [...prevProducts, ...uniqueNewProducts]
    })
  }
  const thisMonthSales = monthlySalesData[monthlySalesData.length - 1].sales
  const thisMonthPurchases = monthlySalesData[monthlySalesData.length - 1].newPurchases
  const lastMonthSales = monthlySalesData[monthlySalesData.length - 2].sales
  const salesGrowth = ((thisMonthSales - lastMonthSales) / lastMonthSales * 100).toFixed(1)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handlePhotoUpload = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (objectUrl) {
      URL.revokeObjectURL(objectUrl)
    }

    const url = URL.createObjectURL(file)
    setObjectUrl(url)
    setProfilePhoto(url)
  }

  const triggerPhotoUpload = () => {
    photoInputRef.current?.click()
  }

  const handleLogin = (e) => {
    e.preventDefault()
    
    if (!formData.firstName || !formData.lastName || !formData.phoneNumber || 
        !formData.jobTitle || !formData.email || !formData.password) {
      alert(t.fillAllFields)
      return
    }

    const userData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      phoneNumber: formData.phoneNumber,
      jobTitle: formData.jobTitle,
      email: formData.email,
      displayName: `${formData.firstName} ${formData.lastName}`
    }

    setUser(userData)
    setIsAuthenticated(true)
    console.log('User registered:', userData)
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setUser(null)
    setFormData({
      firstName: '',
      lastName: '',
      phoneNumber: '',
      jobTitle: '',
      email: '',
    password: '',
    })
    setConnectionStatus({
      instagram: false,
      telegram: false,
      whatsapp: false,
    })
  }

  const simulateIntegration = async (service) => {
    try {
      // Placeholder fetch call to FastAPI integration route
      await fetch(`http://localhost:8000/integrations/${service}`, { method: 'POST' })
    } catch (error) {
      console.warn(`${service} integration endpoint not reachable yet`, error)
    } finally {
      setConnectionStatus((prev) => ({ ...prev, [service]: true }))
    }
  }

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'fa' ? 'en' : 'fa')
  }

  if (!isAuthenticated) {
    return (
      <div className="app-shell">
        <div className="language-switcher-top">
          <button className="lang-button" onClick={toggleLanguage}>
            {language === 'fa' ? 'English' : 'فارسی'}
          </button>
        </div>
        <div className="auth-card">
          <div className="auth-card__header">
            <h1>{t.welcome}</h1>
            <p>{t.signInMessage}</p>
          </div>
          <form className="auth-card__form" onSubmit={handleLogin}>
            <div className="auth-card__form-row">
              <label>
                {t.firstName}
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder={t.enterFirstName}
                  required
                />
              </label>
              <label>
                {t.lastName}
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder={t.enterLastName}
                  required
                />
              </label>
            </div>
            <label>
              {t.phoneNumber}
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                placeholder={t.enterPhoneNumber}
                required
              />
            </label>
            <label>
              {t.jobTitle}
              <select
                name="jobTitle"
                value={formData.jobTitle}
                onChange={handleInputChange}
                required
                className="job-title-select"
              >
                <option value="">{t.selectJobTitle}</option>
                {jobTitleOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              {t.email}
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder={t.enterEmail}
                required
              />
            </label>
            <label>
              {t.password}
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder={t.enterPassword}
                required
              />
            </label>
            <button type="submit">{t.signIn}</button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="app-shell">
      {/* Burger Menu Sidebar */}
      <div className={`sidebar ${menuOpen ? 'sidebar--open' : ''}`}>
        <div className="sidebar__header">
          <h3>Adminz</h3>
          <button className="sidebar__close" onClick={() => setMenuOpen(false)}>×</button>
        </div>
        <nav className="sidebar__nav">
          <a href="#dashboard" className="sidebar__link" onClick={() => setMenuOpen(false)}>
            <span>📊</span> {t.reports}
          </a>
          <a href="#tools" className="sidebar__link" onClick={() => setMenuOpen(false)}>
            <span>🔧</span> {t.tools}
          </a>
          <a href="#settings" className="sidebar__link" onClick={() => setMenuOpen(false)}>
            <span>⚙️</span> {t.settings}
          </a>
          <a href="#analytics" className="sidebar__link" onClick={() => setMenuOpen(false)}>
            <span>📈</span> {t.analytics}
          </a>
          <a href="#products" className="sidebar__link" onClick={() => setMenuOpen(false)}>
            <span>🛒</span> {t.products}
          </a>
        </nav>
      </div>

      {/* Overlay for mobile */}
      {menuOpen && <div className="sidebar-overlay" onClick={() => setMenuOpen(false)}></div>}

      <div className="dashboard">
        <header className="dashboard__header">
          <div className="dashboard__header-left">
            <div className="header-left-controls">
              <button className="burger-menu" onClick={() => setMenuOpen(!menuOpen)}>
                <span></span>
                <span></span>
                <span></span>
              </button>
              <div className="profile-card">
                <div className="profile-card__avatar">
                  {profilePhoto ? (
                    <img src={profilePhoto} alt="Profile" />
                  ) : (
                    <span>
                      {(user.firstName?.charAt(0) || '').toUpperCase()}
                      {(user.lastName?.charAt(0) || '').toUpperCase()}
                    </span>
                  )}
                  <button
                    type="button"
                    className="profile-card__upload"
                    onClick={triggerPhotoUpload}
                    title={t.updatePhoto}
                  >
                    ⬆
        </button>
                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="profile-card__input"
                  />
                </div>
                <div className="profile-card__info">
                  <strong>{user.displayName}</strong>
                  <span>{user.email}</span>
                  <span>{user.phoneNumber}</span>
                </div>
              </div>
            </div>
            <div className="dashboard__headline">
              <p className="dashboard__eyebrow">{t.automationOverview}</p>
              <h1>{t.welcomeBack}, {user.displayName}</h1>
              <p className="dashboard__welcome-display">mobin alipour خوش آمدید</p>
              <p className="dashboard__subtitle">
                {jobTitleOptions.find(opt => opt.value === user.jobTitle)?.label || user.jobTitle} • {user.email} • {user.phoneNumber}
              </p>
              <p className="dashboard__subtitle">
                {t.hereLatestSnapshot}
              </p>
            </div>
          </div>
          <div className="dashboard__header-right">
            <button className="lang-button" onClick={toggleLanguage}>
              {language === 'fa' ? 'English' : 'فارسی'}
            </button>
            <button className="logout-button" type="button" onClick={handleLogout}>
              {t.logOut}
            </button>
          </div>
        </header>

        {/* Instagram Connection Section */}
        <div className="connection-card">
          <div className="connection-card__header">
            <h2>📷 {t.connectInstagram}</h2>
            <p>{t.connectInstagramDesc}</p>
          </div>
          <div className="connection-actions">
            <button
              type="button"
              className="connect-button"
              disabled={connectionStatus.instagram}
              onClick={() => simulateIntegration('instagram')}
            >
              {connectionStatus.instagram ? t.connected : t.connect}
            </button>
          </div>
        </div>

        <div className="connection-card">
          <div className="connection-card__header">
            <h2>📡 {t.connectTelegram}</h2>
            <p>{t.connectTelegramDesc}</p>
          </div>
          <div className="connection-actions">
            <button
              type="button"
              className="connect-button"
              disabled={connectionStatus.telegram}
              onClick={() => simulateIntegration('telegram')}
            >
              {connectionStatus.telegram ? t.connected : t.connect}
            </button>
          </div>
        </div>

        <div className="connection-card">
          <div className="connection-card__header">
            <h2>💬 {t.connectWhatsApp}</h2>
            <p>{t.connectWhatsAppDesc}</p>
          </div>
          <div className="connection-actions">
            <button
              type="button"
              className="connect-button"
              disabled={connectionStatus.whatsapp}
              onClick={() => simulateIntegration('whatsapp')}
            >
              {connectionStatus.whatsapp ? t.connected : t.connect}
            </button>
          </div>
        </div>

        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-label">{t.totalSales}</div>
            <div className="metric-value">${totalSales.toLocaleString()}</div>
            <div className="metric-helper">{t.yearToDate}</div>
          </div>
          <div className="metric-card metric-card--highlight">
            <div className="metric-label">{t.thisMonthSales}</div>
            <div className="metric-value">${thisMonthSales.toLocaleString()}</div>
            <div className="metric-helper">
              <span className={`metric-trend ${salesGrowth >= 0 ? 'metric-trend--positive' : 'metric-trend--negative'}`}>
                {salesGrowth >= 0 ? '↑' : '↓'} {Math.abs(salesGrowth)}% {t.vsLastMonth}
              </span>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-label">{t.newPurchases}</div>
            <div className="metric-value">{thisMonthPurchases}</div>
            <div className="metric-helper">{t.thisMonth}</div>
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-card__header">
            <div>
              <h2>{t.salesPurchasesTrend}</h2>
              <p>{t.monthlyPerformanceOverview}</p>
            </div>
            <span className="chart-card__badge">{t.live}</span>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlySalesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#64748b" />
              <YAxis yAxisId="left" stroke="#64748b" />
              <YAxis yAxisId="right" orientation="right" stroke="#64748b" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#ffffff', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px'
                }} 
              />
              <Legend />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="sales" 
                stroke="#2563eb" 
                strokeWidth={3}
                name="Sales ($)"
                dot={{ fill: '#2563eb', r: 5 }}
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="newPurchases" 
                stroke="#7c3aed" 
                strokeWidth={3}
                name="New Purchases"
                dot={{ fill: '#7c3aed', r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="quick-actions">
          <h2>{t.quickActions}</h2>
          <div className="quick-actions__grid">
            <button className="quick-action-button">
              <span className="quick-action-button__title">📊 {t.reports}</span>
              <span className="quick-action-button__subtitle">{t.generateViewReports}</span>
            </button>
            <button className="quick-action-button">
              <span className="quick-action-button__title">🔧 {t.tools}</span>
              <span className="quick-action-button__subtitle">{t.accessAutomationTools}</span>
            </button>
            <button className="quick-action-button">
              <span className="quick-action-button__title">⚙️ {t.settings}</span>
              <span className="quick-action-button__subtitle">{t.configurePreferences}</span>
            </button>
            <button className="quick-action-button">
              <span className="quick-action-button__title">📈 {t.analytics}</span>
              <span className="quick-action-button__subtitle">{t.viewAdvancedAnalytics}</span>
            </button>
          </div>
        </div>

        <div className="insights-card">
          <h2>{t.keyInsights}</h2>
          <ul>
            <li>{t.salesIncreased} {salesGrowth}% {t.increased}</li>
            <li>{t.youHave} {thisMonthPurchases} {t.newPurchasesThisMonth}</li>
            <li>{t.totalSalesThisMonth}: ${thisMonthSales.toLocaleString()}</li>
            <li>{t.averageMonthlySales}: ${(totalSales / monthlySalesData.length).toLocaleString()}</li>
          </ul>
        </div>

        <section id="products">
          <Products t={t} products={products} onStockUpdate={handleStockUpdate} onProductAdd={handleProductAdd} />
        </section>
      </div>
    </div>
  )
}

export default App
