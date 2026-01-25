'use client'
import { useEffect, useState } from 'react'

export function useTimezone() {
  const [timezone, setTimezone] = useState('UTC')
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    // Load timezone from localStorage
    const savedPrefs = localStorage.getItem('userPreferences')
    if (savedPrefs) {
      try {
        const prefs = JSON.parse(savedPrefs)
        if (prefs.timezone) {
          setTimezone(prefs.timezone)
        }
      } catch (error) {
        console.error('Error loading timezone preference:', error)
      }
    }

    // Update current time every second
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Format date according to timezone
  const formatDate = (dateString, includeTime = false) => {
    if (!dateString) return 'N/A'
    
    const date = new Date(dateString)
    const options = {
      timeZone: timezone,
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

  // Format date with short format
  const formatDateShort = (dateString, includeTime = false) => {
    if (!dateString) return 'N/A'
    
    const date = new Date(dateString)
    const options = {
      timeZone: timezone,
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      ...(includeTime && {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    }
    
    return new Intl.DateTimeFormat('en-US', options).format(date)
  }

  // Get current time in timezone
  const getCurrentTime = (includeSeconds = true) => {
    const options = {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      ...(includeSeconds && { second: '2-digit' }),
      hour12: true
    }
    return new Intl.DateTimeFormat('en-US', options).format(currentTime)
  }

  // Get current date and time in timezone
  const getCurrentDateTime = () => {
    const options = {
      timeZone: timezone,
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

  // Get timezone abbreviation
  const getTimezoneAbbr = () => {
    const options = {
      timeZone: timezone,
      timeZoneName: 'short'
    }
    const formatted = new Intl.DateTimeFormat('en-US', options).format(currentTime)
    const parts = formatted.split(' ')
    return parts[parts.length - 1]
  }

  return {
    timezone,
    currentTime,
    formatDate,
    formatDateShort,
    getCurrentTime,
    getCurrentDateTime,
    getTimezoneAbbr
  }
}
