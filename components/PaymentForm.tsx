import { useState } from 'react'
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
            onSuccess()
          } else {
            toast.error(data.error || 'Booking failed after payment. Please contact support.')
          }
        } catch (error) {
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
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="mb-6">
        <h3 className="text-2xl font-bold mb-4">💳 Complete Payment</h3>
        <div className="bg-gray-700 p-4 rounded-lg mb-4">
          <div className="flex justify-between items-center text-lg">
            <span>Total Amount:</span>
            <span className="text-2xl font-bold text-green-400">₹{totalAmount.toFixed(2)}</span>
          </div>
          <div className="mt-2 text-sm text-gray-400">
            {formData.numberOfGuests} guests × ₹{(totalAmount / formData.numberOfGuests).toFixed(2)} per person
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={handlePayment}
          disabled={processing}
          className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-teal-500 hover:from-green-700 hover:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-semibold transition-all"
        >
          {processing ? 'Processing...' : `Pay ₹${totalAmount.toFixed(2)}`}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={processing}
          className="px-6 py-3 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 rounded-lg font-semibold transition-all"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
