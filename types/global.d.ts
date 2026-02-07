import type mongoose from 'mongoose'

declare global {
  // eslint-disable-next-line no-var
  var mongoose: {
    conn: typeof mongoose | null
    promise: Promise<typeof mongoose> | null
  } | undefined

  // Razorpay window types
  interface RazorpayOptions {
    key: string
    amount: number
    currency: string
    name: string
    description: string
    order_id: string
    handler: (response: RazorpayResponse) => void
    prefill: {
      name: string
      email: string
      contact: string
    }
    theme: {
      color: string
    }
    modal?: {
      ondismiss?: () => void
    }
  }

  interface RazorpayResponse {
    razorpay_order_id: string
    razorpay_payment_id: string
    razorpay_signature: string
  }

  interface RazorpayInstance {
    open: () => void
  }

  interface RazorpayConstructor {
    new (options: RazorpayOptions): RazorpayInstance
  }

  interface Window {
    Razorpay: RazorpayConstructor
  }
}

export {}
