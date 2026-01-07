# Mobile OAuth Setup Guide

## Issue
Google OAuth authentication fails on mobile devices - shows email selection but doesn't complete the login.

## Solution

### Step 1: Find Your Local IP Address

**On Windows:**
```bash
ipconfig
```
Look for "IPv4 Address" under your active network adapter (usually something like `192.168.1.X` or `192.168.0.X`)

### Step 2: Update NEXTAUTH_URL

In `.env.local`, update the NEXTAUTH_URL to use your local IP:
```env
NEXTAUTH_URL=http://192.168.1.X:3001
```
Replace `X` with your actual IP address number.

### Step 3: Configure Google OAuth Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Select your OAuth 2.0 Client ID
3. Add the following to **Authorized redirect URIs**:
   ```
   http://localhost:3001/api/auth/callback/google
   http://192.168.1.X:3001/api/auth/callback/google
   ```
   (Replace `X` with your IP address)

4. Add to **Authorized JavaScript origins**:
   ```
   http://localhost:3001
   http://192.168.1.X:3001
   ```

5. Click **Save**

### Step 4: Restart Your Development Server

```bash
npm run dev
```

### Step 5: Access from Mobile

On your mobile device (connected to the same WiFi network):
```
http://192.168.1.X:3001
```

## Important Notes

1. **Same Network**: Your mobile device must be on the same WiFi network as your development machine

2. **Firewall**: Make sure Windows Firewall allows connections on port 3001
   - Go to Windows Defender Firewall
   - Advanced Settings
   - Inbound Rules
   - Add a new rule for port 3001

3. **Dynamic IP**: If your IP changes, you'll need to update:
   - `.env.local` NEXTAUTH_URL
   - Google OAuth redirect URIs

## Testing

1. Open the app on mobile: `http://192.168.1.X:3001`
2. Click "Login"
3. Click "Continue with Google"
4. Select your Google account
5. Should redirect back to the app successfully

## Alternative: Use ngrok for Public URL

If you need a stable URL that works from anywhere:

```bash
npm install -g ngrok
ngrok http 3001
```

Then use the ngrok URL (e.g., `https://abc123.ngrok.io`) in:
- `.env.local` as NEXTAUTH_URL
- Google OAuth redirect URIs

## Troubleshooting

### "Redirect URI mismatch" error
- Check that the redirect URI in Google Console exactly matches: `http://YOUR_IP:3001/api/auth/callback/google`
- Wait a few minutes after updating Google Console settings

### Can't access from mobile
- Confirm both devices are on the same WiFi
- Check Windows Firewall settings
- Try accessing `http://192.168.1.X:3001` from mobile browser first

### Authentication completes but doesn't redirect
- Clear browser cache on mobile
- Try in incognito/private mode
- Check that cookies are enabled

### Still having issues?
- Check browser console for errors
- Check Next.js terminal for server errors
- Verify `.env.local` has correct values
