# Testing Checklist

## ✅ Pre-Testing Checklist

### 1. Environment Variables
Make sure your `.env` file has:
- ✅ All Firebase variables (`NEXT_PUBLIC_FIREBASE_*`)
- ✅ Twilio test credentials:
  - `TWILIO_ACCOUNT_SID` (test credentials start with `AC` and are shorter)
  - `TWILIO_AUTH_TOKEN` (test token)
  - `TWILIO_PHONE_NUMBER` (use your test number, usually `+15005550006` for testing)

### 2. Firebase Firestore
- ✅ Firestore database is created in Firebase Console
- ✅ Database is in **test mode** (for localhost development)
- ✅ Firebase project has all the required config values

### 3. Twilio Test Credentials
**Important:** With Twilio test credentials:
- ✅ You can only send SMS to **verified phone numbers** in your Twilio account
- ✅ Go to Twilio Console → Phone Numbers → Verified Caller IDs
- ✅ Add your test phone number there
- ✅ Test number format: Use `+15005550006` as the `from` number for testing

## 🧪 Testing Steps

### Step 1: Restart Your Dev Server
```bash
# Stop the current server (Ctrl+C)
pnpm dev
```

### Step 2: Test the Form Submission
1. Open `http://localhost:3000`
2. Enter a phone number (must be verified in Twilio if using test credentials)
3. Click "NOTIFY ME"
4. Check the browser console for any errors
5. Check your terminal for server-side errors

### Step 3: Verify Firestore
1. Go to Firebase Console → Firestore Database
2. Check if a new document was created in the `subscribers` collection
3. Verify the phone number is stored correctly

### Step 4: Check SMS Delivery
- If using test credentials: Check Twilio Console → Logs → Messaging
- The SMS should appear in the logs even if it doesn't deliver (test mode)

## 🐛 Common Issues

### Issue: "Firebase: Error (auth/configuration-not-found)"
**Solution:** Make sure all `NEXT_PUBLIC_FIREBASE_*` variables are set in `.env`

### Issue: "Twilio: Unable to create record"
**Solution:** 
- Verify your test credentials are correct
- Make sure the phone number you're sending TO is verified in Twilio
- Use `+15005550006` as the `from` number for testing

### Issue: "Firestore permission denied"
**Solution:** 
- Make sure Firestore is in test mode
- Or update Firestore rules to allow writes:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true; // Only for testing!
    }
  }
}
```

### Issue: Form submits but no SMS received
**Solution:**
- Check browser console for errors
- Check terminal/server logs
- Verify Twilio credentials are correct
- Make sure the recipient number is verified (for test credentials)

## 📝 Next Steps After Testing

Once everything works:
1. Switch to production Twilio credentials when ready
2. Update Firestore security rules for production
3. Add authentication to `/api/notify-all` endpoint
4. Test the `/api/notify-all` endpoint with a small test group

