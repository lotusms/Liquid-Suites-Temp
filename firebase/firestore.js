import { getFirestore, collection, addDoc, query, where, getDocs } from 'firebase/firestore'
import app from './config'

const db = getFirestore(app)

export async function savePhoneNumber(phoneNumber) {
  try {
    const cleanPhone = phoneNumber.replace(/\D/g, '')
    
    const q = query(collection(db, 'subscribers'), where('phone', '==', cleanPhone))
    const querySnapshot = await getDocs(q)
    
    if (!querySnapshot.empty) {
      return { success: false, message: 'Phone number already registered' }
    }
    
    const docRef = await addDoc(collection(db, 'subscribers'), {
      phone: cleanPhone,
      formattedPhone: phoneNumber,
      createdAt: new Date(),
      notified: false
    })
    
    return { success: true, id: docRef.id }
  } catch (error) {
    console.error('Error saving phone number:', error)
    return { success: false, message: error.message }
  }
}

export async function getAllSubscribers() {
  try {
    const querySnapshot = await getDocs(collection(db, 'subscribers'))
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  } catch (error) {
    console.error('Error fetching subscribers:', error)
    return []
  }
}

