'use client'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

interface UserData {
  name: string
  email: string
  phone?: string
  role: string
  createdAt: string
}

interface Preferences {
  emailNotifications: boolean
  smsNotifications: boolean
  marketingEmails: boolean
  bookingReminders: boolean
  newsletter: boolean
  animationDensity: number
  language: string
  timezone: string
  [key: string]: boolean | number | string
}

export default function Settings() {
  const { status } = useSession()
  const router = useRouter()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [preferences, setPreferences] = useState<Preferences>({
    emailNotifications: true,
    smsNotifications: false,
    marketingEmails: false,
    bookingReminders: true,
    newsletter: false,
    animationDensity: 0.8,
    language: 'en',
    timezone: 'UTC'
  })
  const [currentTime, setCurrentTime] = useState(new Date())

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/Login')
    }
    if (status === 'authenticated') {
      fetchUserData()
    }
  }, [status, router])

  const fetchUserData = async () => {
    try {
      const res = await fetch('/api/users/me')
      if (res.ok) {
        const user = await res.json()
        setUserData(user)
        setFormData({
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || ''
        })
        // Load preferences from localStorage
        const savedPrefs = localStorage.getItem('userPreferences')
        if (savedPrefs) {
          setPreferences(JSON.parse(savedPrefs))
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
      toast.error('Failed to load user data')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const res = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await res.json()

      if (res.ok) {
        toast.success('Profile updated successfully!')
        setUserData(data.user)
      } else {
        toast.error(data.error || 'Failed to update profile')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Error updating profile')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteAccount = async () => {
    setDeleting(true)
    try {
      const res = await fetch('/api/users/me', {
        method: 'DELETE'
      })

      if (res.ok) {
        toast.success('Account deleted successfully')
        setTimeout(() => {
          window.location.href = '/api/auth/signout?callbackUrl=/'
        }, 1000)
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to delete account')
      }
    } catch (error) {
      console.error('Error deleting account:', error)
      toast.error('Error deleting account')
    } finally {
      setDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  const handlePreferenceChange = (key: string, value: boolean | number | string) => {
    const newPrefs = { ...preferences, [key]: value }
    setPreferences(newPrefs)
    localStorage.setItem('userPreferences', JSON.stringify(newPrefs))
    toast.success('Preference updated')
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      })

      const data = await res.json()

      if (res.ok) {
        toast.success('Password changed successfully!')
        setShowPasswordModal(false)
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      } else {
        toast.error(data.error || 'Failed to change password')
      }
    } catch (error) {
      console.error('Error changing password:', error)
      toast.error('Error changing password')
    } finally {
      setSaving(false)
    }
  }

  const handleEnable2FA = () => {
    toast.info('Two-factor authentication will be available soon!')
  }

  const handleRequestData = async () => {
    try {
      toast.info('Preparing your data export...')
      const res = await fetch('/api/users/me')
      if (res.ok) {
        const userData = await res.json()
        const dataStr = JSON.stringify(userData, null, 2)
        const dataBlob = new Blob([dataStr], { type: 'application/json' })
        const url = URL.createObjectURL(dataBlob)
        const link = document.createElement('a')
        link.href = url
        link.download = `my-data-${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
        toast.success('Data downloaded successfully!')
      } else {
        toast.error('Failed to fetch data')
      }
    } catch (error) {
      console.error('Error downloading data:', error)
      toast.error('Error downloading data')
    }
  }

  // Helper function to format date according to selected timezone
  const formatDateWithTimezone = (dateString: string | undefined, includeTime = false) => {
    if (!dateString) return 'N/A'
    
    const date = new Date(dateString)
    const options: Intl.DateTimeFormatOptions = {
      timeZone: preferences.timezone,
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      ...(includeTime && {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      })
    }
    
    return new Intl.DateTimeFormat('en-US', options).format(date)
  }

  // Get current time in selected timezone
  const getCurrentTimeInTimezone = () => {
    const options: Intl.DateTimeFormatOptions = {
      timeZone: preferences.timezone,
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    }
    return new Intl.DateTimeFormat('en-US', options).format(currentTime)
  }

  const tabs = [
    { id: 'profile', name: 'Profile'},
    { id: 'notifications', name: 'Notifications'},
    { id: 'appearance', name: 'Appearance'},
    { id: 'privacy', name: 'Privacy & Security'},
    { id: 'account', name: 'Account'}
  ]

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-foreground"></div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen bg-background text-foreground p-4 md:p-8 pt-20 md:pt-24">

      <ToastContainer position="top-right" theme="dark" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative max-w-6xl mx-auto z-10"
      >
        <div className="mb-8">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl font-bold mb-2 text-foreground"
          >
            Settings
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="text-muted"
          >
            Manage your account settings and preferences
          </motion.p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {tabs.map((tab, index) => (
            <motion.button
              key={tab.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-foreground text-background'
                  : 'bg-card border-2 border-border text-muted hover:border-foreground'
              }`}
            >
              <span className="hidden sm:inline">{tab.name}</span>
            </motion.button>
          ))}
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="glass-card p-6 mb-8">
              <h2 className="text-2xl font-bold mb-6 text-foreground">Profile Information</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-card border-2 border-border rounded-xl px-4 py-2 focus:outline-none focus:border-foreground text-foreground transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    className="w-full bg-card/50 border-2 border-border rounded-xl px-4 py-2 cursor-not-allowed text-muted"
                    disabled
                  />
                  <p className="text-xs text-muted mt-1">Email cannot be changed</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground">Phone (Optional)</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-card border-2 border-border rounded-xl px-4 py-2 focus:outline-none focus:border-foreground text-foreground transition-all"
                    placeholder="Enter your phone number"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-foreground text-background hover:opacity-90 disabled:opacity-50 px-6 py-2 rounded-xl font-semibold transition-all"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>

            <div className="glass-card p-6">
              <h2 className="text-2xl font-bold mb-4 text-foreground">Account Information</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <div className="text-muted text-sm mb-1">Role</div>
                  <div>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      userData?.role === 'admin' ? 'bg-foreground text-background' : 'bg-foreground/20 text-foreground border border-border'
                    }`}>
                      {userData?.role || 'user'}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="text-muted text-sm mb-1">Member Since</div>
                  <div className="font-semibold text-foreground">
                    {formatDateWithTimezone(userData?.createdAt)}
                  </div>
                  <div className="text-xs text-muted mt-1">
                    {preferences.timezone}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'notifications' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="glass-card p-6"
          >
            <h2 className="text-2xl font-bold mb-6 text-foreground">Notification Preferences</h2>
            <div className="space-y-4">
              {[
                { key: 'emailNotifications', label: 'Email Notifications', description: 'Receive email updates about your account' },
                { key: 'smsNotifications', label: 'SMS Notifications', description: 'Get text messages for important updates' },
                { key: 'bookingReminders', label: 'Booking Reminders', description: 'Receive reminders about upcoming bookings' },
                { key: 'marketingEmails', label: 'Marketing Emails', description: 'Promotional offers and updates' },
                { key: 'newsletter', label: 'Newsletter', description: 'Monthly newsletter with tips and news' }
              ].map((pref) => (
                <div key={pref.key} className="flex items-center justify-between p-4 bg-card border border-border rounded-xl">
                  <div>
                    <div className="font-semibold text-foreground">{pref.label}</div>
                    <div className="text-sm text-muted">{pref.description}</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!preferences[pref.key]}
                      onChange={(e) => handlePreferenceChange(pref.key, e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-border peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-foreground/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-foreground"></div>
                  </label>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'appearance' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="glass-card p-6"
          >
            <h2 className="text-2xl font-bold mb-6 text-foreground">Appearance Settings</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">Animation Density</label>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={preferences.animationDensity}
                  onChange={(e) => handlePreferenceChange('animationDensity', parseFloat(e.target.value))}
                  className="w-full h-2 bg-card border border-border rounded-xl appearance-none cursor-pointer accent-foreground"
                />
                <div className="flex justify-between text-xs text-muted mt-1">
                  <span>Minimal</span>
                  <span>Normal</span>
                  <span>Maximum</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">Language</label>
                <select
                  value={preferences.language}
                  onChange={(e) => handlePreferenceChange('language', e.target.value)}
                  className="w-full bg-card border-2 border-border rounded-xl px-4 py-2 focus:outline-none focus:border-foreground text-foreground transition-all"
                >
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                  <option value="de">Deutsch</option>
                  <option value="hi">हिन्दी</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">Timezone</label>
                <select
                  value={preferences.timezone}
                  onChange={(e) => handlePreferenceChange('timezone', e.target.value)}
                  className="w-full bg-card border-2 border-border rounded-xl px-4 py-2 focus:outline-none focus:border-foreground text-foreground transition-all"
                >
                  <option value="UTC">UTC (Coordinated Universal Time)</option>
                  <option value="America/New_York">Eastern Time (ET)</option>
                  <option value="America/Chicago">Central Time (CT)</option>
                  <option value="America/Denver">Mountain Time (MT)</option>
                  <option value="America/Los_Angeles">Pacific Time (PT)</option>
                  <option value="Europe/London">London (GMT)</option>
                  <option value="Europe/Paris">Paris (CET)</option>
                  <option value="Asia/Tokyo">Tokyo (JST)</option>
                  <option value="Asia/Kolkata">India (IST)</option>
                </select>
                <div className="mt-3 p-3 bg-card border border-border rounded-xl">
                  <div className="text-xs text-muted mb-1">Current time in selected timezone:</div>
                  <div className="text-sm font-semibold text-foreground">
                    {getCurrentTimeInTimezone()}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Privacy Tab */}
        {activeTab === 'privacy' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="glass-card p-6"
          >
            <h2 className="text-2xl font-bold mb-6 text-foreground">Privacy & Security</h2>
            <div className="space-y-6">
              <div className="p-4 bg-card border border-border rounded-xl">
                <h3 className="font-semibold mb-2 text-foreground">Password</h3>
                <p className="text-sm text-muted mb-3">Change your password regularly to keep your account secure</p>
                <button 
                  onClick={() => setShowPasswordModal(true)}
                  className="bg-foreground text-background hover:opacity-90 px-4 py-2 rounded-xl font-semibold transition-all"
                >
                  Change Password
                </button>
              </div>

              <div className="p-4 bg-card border border-border rounded-xl">
                <h3 className="font-semibold mb-2 text-foreground">Two-Factor Authentication</h3>
                <p className="text-sm text-muted mb-3">Add an extra layer of security to your account</p>
                <button 
                  onClick={handleEnable2FA}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl font-semibold transition-colors"
                >
                  Enable 2FA
                </button>
              </div>

              <div className="p-4 bg-card border border-border rounded-xl">
                <h3 className="font-semibold mb-2 text-foreground">Data Download</h3>
                <p className="text-sm text-muted mb-3">Download a copy of your data</p>
                <button 
                  onClick={handleRequestData}
                  className="bg-foreground text-background hover:opacity-90 px-4 py-2 rounded-xl font-semibold transition-all"
                >
                  Request Data
                </button>
              </div>

              <div className="p-4 bg-card border border-border rounded-xl">
                <h3 className="font-semibold mb-2 text-foreground">Privacy Policy</h3>
                <p className="text-sm text-muted mb-3">Review how we handle your data</p>
                <button
                  onClick={() => router.push('/privacy-policy')}
                  className="text-foreground hover:opacity-70 font-semibold transition-all"
                >
                  Read Privacy Policy →
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Account Tab - Danger Zone */}
        {activeTab === 'account' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="glass-card p-6 border-2 border-red-600/50"
          >
            <h2 className="text-2xl font-bold mb-4 text-red-500">Danger Zone</h2>
            <p className="text-muted mb-4">
              Once you delete your account, there is no going back. Please be certain.
            </p>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-xl font-semibold transition-colors"
            >
              Delete Account Permanently
            </button>
          </motion.div>
        )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", duration: 0.3 }}
            className="glass-card p-6 max-w-md w-full border-2 border-red-600"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-2xl font-bold mb-4 text-red-400">Confirm Account Deletion</h3>
            <p className="text-foreground mb-6">
              Are you absolutely sure you want to delete your account? This action cannot be undone.
              All your bookings and data will be permanently deleted.
            </p>
            <div className="flex gap-4">
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-xl font-semibold transition-colors"
              >
                {deleting ? 'Deleting...' : 'Yes, Delete My Account'}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="flex-1 bg-card border-2 border-border hover:border-foreground disabled:opacity-50 text-foreground px-4 py-2 rounded-xl font-semibold transition-all"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Change Password Modal */}
      {showPasswordModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={() => setShowPasswordModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", duration: 0.3 }}
            className="glass-card p-6 max-w-md w-full border border-accent/20"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-2xl font-bold mb-4 text-foreground">Change Password</h3>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">Current Password</label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className="w-full bg-card border-2 border-border rounded-xl px-4 py-2 focus:outline-none focus:border-accent text-foreground transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">New Password</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="w-full bg-card border-2 border-border rounded-xl px-4 py-2 focus:outline-none focus:border-accent text-foreground transition-all"
                  required
                  minLength={6}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">Confirm New Password</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="w-full bg-card border-2 border-border rounded-xl px-4 py-2 focus:outline-none focus:border-accent text-foreground transition-all"
                  required
                  minLength={6}
                />
              </div>
              <div className="flex gap-4 mt-6">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 disabled:opacity-50 text-white px-4 py-2 rounded-xl font-semibold transition-all"
                >
                  {saving ? 'Changing...' : 'Change Password'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false)
                    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
                  }}
                  disabled={saving}
                  className="flex-1 bg-card border-2 border-border hover:border-foreground disabled:opacity-50 text-foreground px-4 py-2 rounded-xl font-semibold transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
      </motion.div>
    </div>
  )
}
