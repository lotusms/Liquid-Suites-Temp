import { useState, useRef, useEffect } from 'react'

export default function PhoneSubscriptionForm({ onSubmit }) {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage('')
      }, 3000)
      
      return () => clearTimeout(timer)
    }
  }, [message])

  const formatPhoneNumber = (value) => {
    const numbers = value.replace(/\D/g, '')
    
    if (numbers.length === 0) return ''
    
    const previousHadOne = phoneNumber && phoneNumber.replace(/\D/g, '').startsWith('1')
    const startsWithOne = numbers[0] === '1'
    const hasCountryCode = startsWithOne || previousHadOne
    
    let workingNumbers = numbers
    if (hasCountryCode && !startsWithOne && previousHadOne) {
      workingNumbers = '1' + numbers
    }
    
    const maxDigits = hasCountryCode ? 11 : 10
    const limitedNumbers = workingNumbers.slice(0, maxDigits)
    
    const finalNumbers = hasCountryCode && limitedNumbers[0] !== '1' 
      ? '1' + limitedNumbers.slice(0, 10)
      : limitedNumbers
    
    const phoneDigits = hasCountryCode && finalNumbers.length > 1 
      ? finalNumbers.slice(1) 
      : (hasCountryCode ? '' : finalNumbers)
    
    let formatted = ''
    if (hasCountryCode) {
      if (phoneDigits.length === 0) {
        formatted = '1'
      } else if (phoneDigits.length <= 3) {
        formatted = `1 (${phoneDigits}`
      } else if (phoneDigits.length <= 6) {
        formatted = `1 (${phoneDigits.slice(0, 3)}) ${phoneDigits.slice(3)}`
      } else {
        formatted = `1 (${phoneDigits.slice(0, 3)}) ${phoneDigits.slice(3, 6)}-${phoneDigits.slice(6)}`
      }
    } else {
      if (phoneDigits.length <= 3) {
        formatted = `(${phoneDigits}`
      } else if (phoneDigits.length <= 6) {
        formatted = `(${phoneDigits.slice(0, 3)}) ${phoneDigits.slice(3)}`
      } else {
        formatted = `(${phoneDigits.slice(0, 3)}) ${phoneDigits.slice(3, 6)}-${phoneDigits.slice(6)}`
      }
    }
    
    return formatted
  }

  const handlePhoneChange = (e) => {
    const formatted = formatPhoneNumber(e.target.value)
    setPhoneNumber(formatted)
    setMessage('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage('')

    try {
      const saveResponse = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: phoneNumber
        })
      })

      const saveData = await saveResponse.json()
      
      if (!saveResponse.ok || !saveData.success) {
        setMessage(saveData.message || 'Something went wrong. Please try again.')
        setIsSubmitting(false)
        return
      }

      const smsResponse = await fetch('/api/send-sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: phoneNumber,
          message: 'Thank you for subscribing to LiquidSuites! We will notify you when we launch.'
        })
      })

      const smsData = await smsResponse.json()

      setPhoneNumber('')

      if (smsResponse.ok && smsData.success) {
        if (smsData.warning) {
          setMessage(`Phone number saved! ${smsData.warning} Your A2P campaign is under review, so SMS delivery may be delayed.`)
        } else {
          setMessage('Success! Check your phone for a confirmation message.')
        }
      } else {
        console.error('SMS Error (not shown to user):', smsData)
        setMessage('Success! Your phone number has been saved.')
      }

      if (onSubmit) {
        onSubmit(phoneNumber)
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      setMessage('An error occurred. Please try again later.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="flex flex-col gap-4 max-w-xl" onSubmit={handleSubmit}>
			<div className="flex flex-row gap-2 w-full">
				<div className="flex-1 relative group">
					<div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-400 via-teal-500 to-blue-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
					<input
						ref={inputRef}
						type="tel"
						placeholder="(xxx) xxx-xxxx"
						value={phoneNumber}
						onChange={handlePhoneChange}
						maxLength={16}
						className="relative w-full px-6 py-4 rounded-2xl bg-gray-900/80 backdrop-blur-xl border-2 border-gray-700/50 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:bg-gray-900/90 shadow-2xl shadow-black/50 transition-all duration-300 text-lg font-medium"
						required
					/>
				</div>
				<button
					type="submit"
					disabled={isSubmitting}
					className="relative px-10 py-4 rounded-2xl bg-gradient-to-r from-indigo-800 to-cyan-700 hover:from-cyan-500 hover:to-indigo-800 hover:shadow-cyan-700/60 shadow-cyan-700/40 text-white font-bold uppercase tracking-widest text-sm transition-all duration-300 whitespace-nowrap shadow-2xl overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
				>
					<span className="relative z-10 flex items-center gap-2">
						{isSubmitting ? 'SUBMITTING...' : 'NOTIFY ME'}
						{!isSubmitting && (
							<svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
							</svg>
						)}
					</span>
					<div className="absolute inset-0 bg-gradient-to-r from-cyan-700 to-blue-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
				</button>
			</div>
			<div className="flex flex-col gap-2">
				{message && (
					<p className={`text-sm mt-2 ms-2 ${message.includes('Success') ? 'text-green-400' : 'text-red-400'}`}>
					{message}
					</p>
				)}
				<p className="text-xs text-gray-400/70 mt-1 ms-2">
					By providing your phone number, you consent to receive SMS messages. We will not share your information. Message and data rates may apply.
				</p>
			</div>
    </form>
  )
}

