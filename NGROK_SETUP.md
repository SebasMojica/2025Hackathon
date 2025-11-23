# Quick ngrok Setup for Local Development

## Step 1: Sign Up (Free)

1. Go to https://dashboard.ngrok.com/signup
2. Sign up with email or GitHub (takes 30 seconds)
3. It's completely free for basic use

## Step 2: Get Your Authtoken

1. After signing up, go to: https://dashboard.ngrok.com/get-started/your-authtoken
2. Copy your authtoken (looks like: `2abc123def456ghi789jkl012mno345pq_6r7s8t9u0v1w2x3y4z5`)

## Step 3: Install Authtoken

Run this command (replace with your actual token):

```bash
ngrok config add-authtoken YOUR_AUTHTOKEN_HERE
```

## Step 4: Start ngrok

```bash
ngrok http 3001
```

## Step 5: Copy the URL

You'll see something like:
```
Forwarding  https://abc123.ngrok.io -> http://localhost:3001
```

Copy the `https://abc123.ngrok.io` part.

## Step 6: Update .env

Add to `backend/.env`:
```env
PUBLIC_URL=https://abc123.ngrok.io
```

## Step 7: Restart Backend

Restart your backend server to pick up the new PUBLIC_URL.

## Done!

Now fal.ai can access your images and generate try-on images. Test with:

```bash
curl http://localhost:3001/api/fal/test
```

You should see `"canGenerateImages": true`.

