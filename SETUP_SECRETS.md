# 🔑 GitHub Secrets Setup
Go to: GitHub Repo → Settings → Secrets and variables → Actions

Add these secrets:
VITE_FIREBASE_API_KEY=YOUR_FIREBASE_API_KEY   # do not use 'AIza'
VITE_FIREBASE_AUTH_DOMAIN=wholesaler-app-841b7.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=wholesaler-app-841b7
VITE_FIREBASE_STORAGE_BUCKET=wholesaler-app-841b7.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=188437846114
VITE_FIREBASE_APP_ID=1:188437846114:web:44eab90f30351e2bd3993b

For FIREBASE_SERVICE_ACCOUNT:
1. npm install -g firebase-tools
2. firebase login
3. Go to Firebase Console → Project Settings → Service Accounts
4. Generate new private key → Copy entire JSON
