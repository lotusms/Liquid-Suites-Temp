# SMS Setup Guide

This guide will help you set up SMS functionality using Twilio to send text messages to subscribers.

## Prerequisites

1. A Twilio account (sign up at https://www.twilio.com)
2. Firebase Firestore enabled in your Firebase project

## Step 1: Get Twilio Credentials

1. Log in to your [Twilio Console](https://console.twilio.com)
2. Navigate to the Dashboard
3. Copy your **Account SID** and **Auth Token**
4. Go to **Phone Numbers** → **Manage** → **Active numbers**
5. Copy your Twilio phone number (format: +1234567890)

## Step 2: Configure Environment Variables

Add the following to your `.env` file:

```env
TWILIO_ACCOUNT_SID=your_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
```

**Important:** Never commit your `.env` file to version control. It's already in `.gitignore`.

## Step 3: Enable Firestore

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Navigate to **Firestore Database**
4. Click **Create database**
5. Start in **test mode** (for development) or **production mode** (for production)
6. Choose a location for your database

## Step 4: Set Up Firestore Security Rules (Production)

For production, update your Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /subscribers/{subscriberId} {
      // Allow read/write only from authenticated users or server
      allow read, write: if request.auth != null;
      // Or restrict to specific conditions
      allow create: if request.resource.data.phone is string;
    }
  }
}
```

## How It Works

### 1. User Submits Phone Number

When a user submits their phone number:
- The phone number is saved to Firestore in the `subscribers` collection
- A confirmation SMS is automatically sent to the user
- The user sees a success message

### 2. Sending SMS to All Subscribers

When you're ready to launch, you can send a message to all subscribers by calling:

```bash
POST /api/notify-all
Content-Type: application/json

{
  "message": "We're launching! Visit us at https://yoursite.com"
}
```

**Example using curl:**
```bash
curl -X POST http://localhost:3000/api/notify-all \
  -H "Content-Type: application/json" \
  -d '{"message": "We'\''re launching! Visit us at https://yoursite.com"}'
```

**Example using JavaScript:**
```javascript
const response = await fetch('/api/notify-all', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    message: "We're launching! Visit us at https://yoursite.com"
  })
})

const data = await response.json()
console.log(data)
```

## API Endpoints

### POST `/api/send-sms`

Sends an SMS to a single phone number.

**Request Body:**
```json
{
  "phoneNumber": "(123) 456-7890",
  "message": "Your custom message here"
}
```

**Response:**
```json
{
  "success": true,
  "messageSid": "SM1234567890abcdef",
  "message": "SMS sent successfully"
}
```

### POST `/api/notify-all`

Sends an SMS to all subscribers in Firestore.

**Request Body:**
```json
{
  "message": "Your message to all subscribers"
}
```

**Response:**
```json
{
  "success": true,
  "total": 10,
  "sent": 9,
  "failed": 1,
  "results": [...]
}
```

## Testing

1. Start your development server: `pnpm dev`
2. Submit a phone number through the form
3. Check your phone for the confirmation message
4. Verify the phone number appears in Firestore

## Troubleshooting

### SMS Not Sending

1. **Check Twilio credentials:** Verify your Account SID, Auth Token, and Phone Number are correct
2. **Check Twilio balance:** Ensure you have credits in your Twilio account
3. **Verify phone number format:** Phone numbers must be in E.164 format (+1XXXXXXXXXX)
4. **Check server logs:** Look for error messages in your terminal

### Firestore Errors

1. **Check Firebase config:** Verify all `NEXT_PUBLIC_FIREBASE_*` environment variables are set
2. **Check Firestore rules:** Ensure your security rules allow writes
3. **Check network:** Ensure your server can reach Firebase

## Cost Considerations

- Twilio charges per SMS sent (varies by country)
- Firestore has a free tier with generous limits
- Monitor your usage in the Twilio Console

## Security Best Practices

1. **Never expose Twilio credentials** in client-side code
2. **Add authentication** to `/api/notify-all` endpoint before production
3. **Rate limit** API endpoints to prevent abuse
4. **Validate phone numbers** before sending SMS
5. **Use environment variables** for all sensitive data

## Next Steps

- Add authentication to protect the `/api/notify-all` endpoint
- Implement rate limiting
- Add analytics to track SMS delivery
- Create an admin dashboard to manage subscribers

