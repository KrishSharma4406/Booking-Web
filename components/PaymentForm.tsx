import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'

interface BookingFormData {
  guestName: string
  guestEmail: string
  guestPhone: string
  numberOfGuests: number
  bookingDate: string
  bookingTime: string
  tableArea?: string
  tableNumber?: number
  specialRequests?: string
}

interface PaymentFormProps {
  formData: BookingFormData
  orderId: string
  keyId: string
  totalAmount: number
  onSuccess: () => void
  onCancel: () => void
}

export default function PaymentForm({ 
  formData, 
  orderId,
  keyId,
  totalAmount, 
  onSuccess, 
  onCancel 
}: PaymentFormProps) {
  const [processing, setProcessing] = useState<boolean>(false)
  const [isOnline, setIsOnline] = useState<boolean>(true)

  useEffect(() => {
    // Check initial online status
    setIsOnline(navigator.onLine)

    // Listen for online/offline events
    const handleOnline = () => {
      setIsOnline(true)
      toast.success('You are back online! You can now proceed with payment.')
    }

    const handleOffline = () => {
      setIsOnline(false)
      toast.error('You are offline! Payment requires internet connection.')
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })
  }

  const handlePayment = async (): Promise<void> => {
    // Check if user is online
    if (!navigator.onLine || !isOnline) {
      toast.error('No internet connection! Please connect to the internet to proceed with payment.')
      return
    }

    setProcessing(true)

    const res = await loadRazorpayScript()

    if (!res) {
      toast.error('Razorpay SDK failed to load. Please check your connection.')
      setProcessing(false)
      return
    }

    const options: RazorpayOptions = {
      key: keyId,
      amount: totalAmount * 100,
      currency: 'INR',
      name: 'Restaurant Booking',
      description: `Table booking for ${formData.numberOfGuests} guests`,
      order_id: orderId,
      handler: async function (response: RazorpayResponse) {
        try {
          const res = await fetch('/api/bookings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...formData,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              paymentAmount: totalAmount,
            })
          })

          const data = await res.json()

          if (res.ok) {
            toast.success(data.message || 'Booking confirmed! Payment successful.')
            // Scroll to top to show the updated bookings list
            window.scrollTo({ top: 0, behavior: 'smooth' })
            onSuccess()
          } else {
            toast.error(data.error || 'Booking failed after payment. Please contact support.')
          }
        } catch {
          toast.error('Error creating booking after payment')
        } finally {
          setProcessing(false)
        }
      },
      prefill: {
        name: formData.guestName,
        email: formData.guestEmail,
        contact: formData.guestPhone,
      },
      theme: {
        color: '#8B5CF6',
      },
      modal: {
        ondismiss: function() {
          setProcessing(false)
          toast.info('Payment cancelled')
        }
      }
    }

    const paymentObject = new window.Razorpay(options)
    paymentObject.open()
  }

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-8 border border-gray-700/50 shadow-2xl backdrop-blur-sm">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-500/5 rounded-full blur-2xl"></div>
      
      {!isOnline && (
        <div className="relative mb-6 p-5 bg-gradient-to-br from-red-900/40 via-red-800/30 to-red-900/40 border-2 border-red-500/50 rounded-xl backdrop-blur-sm shadow-lg animate-fadeIn">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
                <svg className="w-7 h-7 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <p className="text-red-300 font-bold text-lg flex items-center gap-2">
                <span className="animate-pulse">⚠️</span>
                No Internet Connection
              </p>
              <p className="text-red-200/90 mt-1">Payment requires an active internet connection. Please check your network and try again.</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="relative mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <h3 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-teal-400 bg-clip-text text-transparent">Complete Payment</h3>
        </div>
        
        <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 p-6 rounded-xl border border-gray-700/50 backdrop-blur-sm shadow-inner">
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-300 text-lg">Total Amount:</span>
            <div className="text-right">
              <span className="text-4xl font-bold bg-gradient-to-r from-green-400 to-teal-400 bg-clip-text text-transparent">₹{totalAmount.toFixed(2)}</span>
              <div className="flex items-center gap-1 text-green-400 text-sm mt-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Secured Payment
              </div>
            </div>
          </div>
          <div className="pt-4 border-t border-gray-700/50">
            <div className="flex items-center justify-between text-sm text-gray-400">
              <span>Booking Details:</span>
              <span className="text-gray-300 font-medium">{formData.numberOfGuests} guests × ₹{(totalAmount / formData.numberOfGuests).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="relative flex gap-4">
        <button
          type="button"
          onClick={handlePayment}
          disabled={processing || !isOnline}
          className="group flex-1 px-8 py-4 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:from-gray-600 disabled:to-gray-700 rounded-xl font-bold text-lg shadow-lg hover:shadow-green-500/50 transition-all duration-300 hover:scale-[1.02] disabled:hover:scale-100 disabled:hover:shadow-none flex items-center justify-center gap-3"
        >
          {!isOnline ? (
            <>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" />
              </svg>
              Offline - Cannot Pay
            </>
          ) : processing ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
              Processing...
            </>
          ) : (
            <>
              <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Pay ₹{totalAmount.toFixed(2)}
            </>
          )}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={processing}
          className="px-8 py-4 bg-gray-700/80 hover:bg-gray-600/80 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-bold text-lg border border-gray-600 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] disabled:hover:scale-100"
        >
          Cancel
        </button>
      </div>
      
      {/* Payment security badges */}
      <div className="mt-6 pt-6 border-t border-gray-700/50">
        <div className="flex items-center justify-center gap-6 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>SSL Secured</span>
          </div>
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>PCI Compliant</span>
          </div>
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Safe & Secure</span>
          </div>
        </div>
      </div>
    </div>
  )
}
