import { getFirestore, collection, addDoc, query, where, getDocs } from 'firebase/firestore'
import app from '../../firebase/config'

const db = getFirestore(app)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { phoneNumber } = req.body

  if (!phoneNumber) {
    return res.status(400).json({ error: 'Phone number is required' })
  }

  try {
    let cleanPhone = phoneNumber.replace(/\D/g, '')
    
    if (cleanPhone.length === 11 && cleanPhone[0] === '1') {
      cleanPhone = cleanPhone.slice(1)
    }
    
    if (cleanPhone.length !== 10) {
      return res.status(400).json({ error: 'Invalid phone number format. Please enter a 10-digit phone number.' })
    }
    
    const q = query(collection(db, 'subscribers'), where('phone', '==', cleanPhone))
    const querySnapshot = await getDocs(q)
    
    if (!querySnapshot.empty) {
      return res.status(400).json({ 
        success: false, 
        message: 'Phone number already registered' 
      })
    }
    
    const docRef = await addDoc(collection(db, 'subscribers'), {
      phone: cleanPhone,
      formattedPhone: phoneNumber,
      createdAt: new Date(),
      notified: false
    })
    
    return res.status(200).json({ 
      success: true, 
      id: docRef.id 
    })
  } catch (error) {
    console.error('Error saving phone number:', error)
    return res.status(500).json({ 
      success: false, 
      message: error.message 
    })
  }
}

