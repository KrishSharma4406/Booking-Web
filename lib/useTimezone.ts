'use client'
import { useEffect, useState } from 'react'

interface TimezoneHook {
  timezone: string
  currentTime: Date
  formatDate: (dateString: string | Date, includeTime?: boolean) => string
  formatDateShort: (dateString: string | Date, includeTime?: boolean) => string
  getCurrentTime: (includeSeconds?: boolean) => string
  getCurrentDateTime: () => string
  getTimezoneAbbr: () => string
}

export function useTimezone(): TimezoneHook {
  const [timezone, setTimezone] = useState<string>('UTC')
  const [currentTime, setCurrentTime] = useState<Date>(new Date())

  useEffect(() => {
    // Load timezone from localStorage
    const savedPrefs = localStorage.getItem('userPreferences')
    if (savedPrefs) {
      try {
        const prefs: { timezone?: string } = JSON.parse(savedPrefs)
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
  const formatDate = (dateString: string | Date, includeTime: boolean = false): string => {
    if (!dateString) return 'N/A'
    
    const date = new Date(dateString)
    const options: Intl.DateTimeFormatOptions = {
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
  const formatDateShort = (dateString: string | Date, includeTime: boolean = false): string => {
    if (!dateString) return 'N/A'
    
    const date = new Date(dateString)
    const options: Intl.DateTimeFormatOptions = {
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
  const getCurrentTime = (includeSeconds: boolean = true): string => {
    const options: Intl.DateTimeFormatOptions = {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      ...(includeSeconds && { second: '2-digit' }),
      hour12: true
    }
    return new Intl.DateTimeFormat('en-US', options).format(currentTime)
  }

  // Get current date and time in timezone
  const getCurrentDateTime = (): string => {
    const options: Intl.DateTimeFormatOptions = {
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
  const getTimezoneAbbr = (): string => {
    const options: Intl.DateTimeFormatOptions = {
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
