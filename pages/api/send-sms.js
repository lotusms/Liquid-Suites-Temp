import twilio from 'twilio'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { phoneNumber, message } = req.body

  if (!phoneNumber) {
    return res.status(400).json({ error: 'Phone number is required' })
  }

  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
    console.error('Missing Twilio credentials:', {
      hasAccountSid: !!process.env.TWILIO_ACCOUNT_SID,
      hasAuthToken: !!process.env.TWILIO_AUTH_TOKEN,
      hasPhoneNumber: !!process.env.TWILIO_PHONE_NUMBER
    })
    return res.status(500).json({ 
      error: 'Twilio configuration error', 
      details: 'Missing Twilio credentials. Please check your .env file.' 
    })
  }

  const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  )

  try {
    const formattedPhone = formatPhoneForTwilio(phoneNumber)
    const formattedFrom = formatPhoneForTwilio(process.env.TWILIO_PHONE_NUMBER)
    
    console.log('Attempting to send SMS:', {
      to: formattedPhone,
      from: formattedFrom,
      messageLength: message?.length || 0
    })
    
    const messageResult = await client.messages.create({
      body: message || 'Thank you for subscribing! We will notify you when we launch.',
      from: formattedFrom,
      to: formattedPhone
    })

    console.log('SMS message created:', {
      sid: messageResult.sid,
      status: messageResult.status,
      errorCode: messageResult.errorCode,
      errorMessage: messageResult.errorMessage
    })

    if (messageResult.errorCode || messageResult.errorMessage) {
      return res.status(500).json({ 
        success: false,
        error: 'Failed to send SMS', 
        details: messageResult.errorMessage || 'Message creation failed',
        code: messageResult.errorCode,
        messageSid: messageResult.sid
      })
    }

    const status = messageResult.status
    
    if (status === 'delivered') {
      return res.status(200).json({ 
        success: true, 
        messageSid: messageResult.sid,
        status: status,
        message: 'SMS sent successfully' 
      })
    }

    if (status === 'queued' || status === 'sent' || status === 'sending') {
      try {
        const fetchedMessage = await client.messages(messageResult.sid).fetch()
        console.log('Fetched message status:', {
          sid: fetchedMessage.sid,
          status: fetchedMessage.status,
          errorCode: fetchedMessage.errorCode,
          errorMessage: fetchedMessage.errorMessage
        })
        
        if (fetchedMessage.errorCode) {
          let errorDetails = fetchedMessage.errorMessage || 'Message delivery failed'
          if (fetchedMessage.errorCode === 30034 || fetchedMessage.errorCode === 21610) {
            errorDetails = 'A2P Campaign is under review. Messages cannot be sent until your campaign is approved. This typically takes 2-3 weeks. Your phone number has been saved and you will receive notifications once the campaign is active.'
          }
          return res.status(500).json({ 
            success: false,
            error: 'Failed to send SMS', 
            details: errorDetails,
            code: fetchedMessage.errorCode,
            messageSid: fetchedMessage.sid
          })
        }
      } catch (fetchError) {
        console.error('Error fetching message status:', fetchError)
      }
      
      return res.status(200).json({ 
        success: true, 
        messageSid: messageResult.sid,
        status: status,
        message: 'SMS queued successfully',
        warning: 'Your A2P campaign is under review. Messages are queued but will not be delivered until your campaign is approved (typically 2-3 weeks). Your phone number has been saved and you will receive notifications once the campaign is active.'
      })
    }

    return res.status(200).json({ 
      success: true, 
      messageSid: messageResult.sid,
      status: status,
      message: 'SMS processed',
      warning: `Message status: ${status}. Your A2P campaign is under review, so delivery may be delayed until approval.`
    })
  } catch (error) {
    console.error('Error sending SMS:', {
      message: error.message,
      code: error.code,
      status: error.status,
      moreInfo: error.moreInfo
    })
    
    let errorMessage = error.message
    if (error.code === 21211) {
      errorMessage = 'Invalid phone number format'
    } else if (error.code === 21608) {
      errorMessage = 'Phone number not verified. Add it in Twilio Console → Verified Caller IDs'
    } else if (error.code === 21614 || error.message.includes('not a Twilio phone number')) {
      errorMessage = `Invalid "from" phone number. The number ${formattedFrom} is not associated with your Twilio account. For test credentials, use +15005550006. For production, verify your phone number in Twilio Console → Phone Numbers.`
    } else if (error.code === 30034 || error.code === 21610 || error.message.includes('A2P') || error.message.includes('campaign') || error.message.includes('Unregistered')) {
      errorMessage = 'A2P Campaign is under review. Messages cannot be sent until your campaign is approved. This typically takes 2-3 weeks. Your phone number has been saved and you will receive notifications once the campaign is active. Check your campaign status in Twilio Console → Messaging → Regulatory Compliance → Campaigns.'
    } else if (error.status === 401) {
      errorMessage = 'Invalid Twilio credentials. Check your Account SID and Auth Token'
    }
    
    return res.status(500).json({ 
      error: 'Failed to send SMS', 
      details: errorMessage,
      code: error.code
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

