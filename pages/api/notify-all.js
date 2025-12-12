import twilio from 'twilio'
import { getAllSubscribers } from '../../firebase/firestore'
import { getFirestore, updateDoc, doc } from 'firebase/firestore'
import app from '../../firebase/config'

const db = getFirestore(app)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { message } = req.body

  if (!message) {
    return res.status(400).json({ error: 'Message is required' })
  }

  const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  )

  try {
    const subscribers = await getAllSubscribers()
    const results = []

    for (const subscriber of subscribers) {
      try {
        const formattedPhone = formatPhoneForTwilio(subscriber.phone)
        const formattedFrom = formatPhoneForTwilio(process.env.TWILIO_PHONE_NUMBER)
        
        const messageResult = await client.messages.create({
          body: message,
          from: formattedFrom,
          to: formattedPhone
        })

        const subscriberRef = doc(db, 'subscribers', subscriber.id)
        await updateDoc(subscriberRef, {
          notified: true,
          notifiedAt: new Date()
        })

        results.push({
          phone: subscriber.phone,
          success: true,
          messageSid: messageResult.sid
        })
      } catch (error) {
        console.error(`Error sending SMS to ${subscriber.phone}:`, error)
        results.push({
          phone: subscriber.phone,
          success: false,
          error: error.message
        })
      }
    }

    return res.status(200).json({
      success: true,
      total: subscribers.length,
      sent: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results
    })
  } catch (error) {
    console.error('Error in notify-all:', error)
    return res.status(500).json({
      error: 'Failed to send notifications',
      details: error.message
    })
  }
}

function formatPhoneForTwilio(phoneNumber) {
  const numbers = phoneNumber.replace(/\D/g, '')
  
  if (numbers.length === 10) {
    return `+1${numbers}`
  }
  
  if (numbers.length === 11 && numbers[0] === '1') {
    return `+${numbers}`
  }
  
  return `+${numbers}`
}

