# 🚀 BookTracker Deployment Guide

This guide provides step-by-step instructions for deploying BookTracker to production.

## 📋 Pre-Deployment Checklist

- [ ] All environment variables configured
- [ ] Google OAuth setup completed
- [ ] MongoDB Atlas cluster created
- [ ] Google Books API enabled
- [ ] Code tested locally
- [ ] Repository pushed to GitHub

## 🌐 Vercel Deployment (Recommended)

### Step 1: Prepare Repository

\`\`\`bash
# Ensure your code is committed and pushed
git add .
git commit -m "Ready for deployment"
git push origin main
\`\`\`

### Step 2: Connect to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign up/login with GitHub
3. Click "New Project"
4. Import your BookTracker repository
5. Configure project settings:
   - Framework Preset: Next.js
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `.next`

### Step 3: Environment Variables

In Vercel dashboard, add these environment variables:

\`\`\`env
NEXTAUTH_URL=https://your-app-name.vercel.app
NEXTAUTH_SECRET=your-production-secret-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
MONGODB_URI=your-mongodb-connection-string
GOOGLE_BOOKS_API_KEY=your-google-books-api-key
\`\`\`

### Step 4: Update OAuth Settings

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to "APIs & Services" → "Credentials"
3. Edit your OAuth 2.0 Client ID
4. Add authorized redirect URI:
   \`\`\`
   https://your-app-name.vercel.app/api/auth/callback/google
   \`\`\`

### Step 5: Deploy

1. Click "Deploy" in Vercel
2. Wait for build to complete
3. Test your live application

## 🐳 Docker Deployment

### Dockerfile

\`\`\`dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
\`\`\`

### Docker Compose

\`\`\`yaml
version: '3.8'

services:
  booktracker:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NEXTAUTH_URL=http://localhost:3000
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
      - GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}
      - MONGODB_URI=${MONGODB_URI}
      - GOOGLE_BOOKS_API_KEY=${GOOGLE_BOOKS_API_KEY}
    env_file:
      - .env.local
\`\`\`

### Build and Run

\`\`\`bash
# Build the image
docker build -t booktracker .

# Run the container
docker run -p 3000:3000 --env-file .env.local booktracker

# Or use docker-compose
docker-compose up -d
\`\`\`

## ☁️ AWS Deployment

### Using AWS Amplify

1. **Connect Repository**:
   - Go to AWS Amplify Console
   - Connect your GitHub repository

2. **Build Settings**:
   \`\`\`yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - npm ci
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: .next
       files:
         - '**/*'
     cache:
       paths:
         - node_modules/**/*
   \`\`\`

3. **Environment Variables**:
   Add all required environment variables in Amplify console

### Using AWS EC2

1. **Launch EC2 Instance**:
   - Choose Ubuntu 20.04 LTS
   - Configure security groups (ports 22, 80, 443)

2. **Setup Server**:
   \`\`\`bash
   # Connect to instance
   ssh -i your-key.pem ubuntu@your-instance-ip
   
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Install PM2
   sudo npm install -g pm2
   
   # Clone repository
   git clone https://github.com/yourusername/booktracker.git
   cd booktracker
   
   # Install dependencies
   npm install
   
   # Build application
   npm run build
   
   # Start with PM2
   pm2 start npm --name "booktracker" -- start
   pm2 startup
   pm2 save
   \`\`\`

3. **Setup Nginx**:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   \`\`\`

## 🔒 Security Considerations

### Environment Variables

- Never commit `.env` files to version control
- Use different secrets for production
- Rotate secrets regularly
- Use environment-specific configurations

### Database Security

\`\`\`javascript
// MongoDB connection with security options
const client = new MongoClient(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  ssl: true,
  sslValidate: true,
  authSource: 'admin'
});
\`\`\`

### API Security

- Implement rate limiting
- Validate all inputs
- Use HTTPS in production
- Set proper CORS headers

### NextAuth Security

\`\`\`javascript
// next-auth configuration
export default NextAuth({
  // ... other config
  cookies: {
    sessionToken: {
      name: `__Secure-next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    }
  }
});
\`\`\`

## 📊 Monitoring & Analytics

### Vercel Analytics

\`\`\`bash
npm install @vercel/analytics
\`\`\`

\`\`\`javascript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
\`\`\`

### Error Tracking with Sentry

\`\`\`bash
npm install @sentry/nextjs
\`\`\`

\`\`\`javascript
// sentry.client.config.js
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
});
\`\`\`

## 🔄 CI/CD Pipeline

### GitHub Actions

\`\`\`yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run tests
        run: npm test
        
      - name: Build application
        run: npm run build
        
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
\`\`\`

## 🚨 Troubleshooting Deployment

### Common Issues

1. **Build Failures**:
   \`\`\`bash
   # Check build logs
   npm run build
   
   # Fix TypeScript errors
   npm run type-check
   \`\`\`

2. **Environment Variable Issues**:
   - Verify all variables are set
   - Check for typos in variable names
   - Ensure proper encoding for special characters

3. **Database Connection**:
   \`\`\`javascript
   // Test MongoDB connection
   const { MongoClient } = require('mongodb');
   
   async function testConnection() {
     try {
       const client = new MongoClient(process.env.MONGODB_URI);
       await client.connect();
       console.log('Connected successfully');
       await client.close();
     } catch (error) {
       console.error('Connection failed:', error);
     }
   }
   \`\`\`

4. **OAuth Issues**:
   - Verify redirect URIs match exactly
   - Check domain configuration
   - Ensure HTTPS in production

### Performance Optimization

1. **Image Optimization**:
   \`\`\`javascript
   // next.config.js
   module.exports = {
     images: {
       domains: ['books.google.com'],
       formats: ['image/webp', 'image/avif'],
     },
   };
   \`\`\`

2. **Bundle Analysis**:
   \`\`\`bash
   npm install @next/bundle-analyzer
   ANALYZE=true npm run build
   \`\`\`

3. **Caching Strategy**:
   \`\`\`javascript
   // API route caching
   export async function GET() {
     return NextResponse.json(data, {
       headers: {
         'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
       }
     });
   }
   \`\`\`

## 📈 Post-Deployment

### Health Checks

1. **Automated Testing**:
   \`\`\`bash
   # Test critical user flows
   curl -f https://your-app.vercel.app/api/health || exit 1
   \`\`\`

2. **Monitoring Setup**:
   - Set up uptime monitoring
   - Configure error alerts
   - Monitor API response times

3. **Backup Strategy**:
   - Regular database backups
   - Environment variable backups
   - Code repository backups

### Scaling Considerations

- Monitor database performance
- Implement caching strategies
- Consider CDN for static assets
- Plan for increased API usage

---

**Deployment Complete! 🎉**

Your BookTracker app is now live and ready for users!
