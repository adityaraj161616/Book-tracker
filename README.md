# 📚 BookTracker - Book Discovery & Reading Tracker

A modern, full-stack web application for discovering books, tracking reading progress, and managing your personal library. Built with Next.js, TypeScript, and MongoDB.


## ✨ Features

### 🔐 Authentication
- **Google OAuth** integration with NextAuth.js
- Secure session management
- Protected routes and user data

### 📖 Book Discovery
- **Search millions of books** using Google Books API
- View detailed book information (cover, description, author, pages)
- **Rate limiting** to prevent API abuse (5 searches per 12 seconds)
- Responsive book grid with smooth animations

### 📚 Personal Library Management
- **Three reading shelves**: Want to Read, Currently Reading, Finished
- **Progress tracking** with visual sliders (0-100%)
- **Personal notes** for each book
- Easy book organization and filtering

### 📊 Reading Statistics
- **Animated dashboard** with reading metrics
- Track books read, pages read, and progress
- **Monthly reading goals** and trends
- Beautiful charts and progress indicators

### 🎨 Modern UI/UX
- **Dark/Light theme** support
- **Framer Motion animations** for smooth interactions
- **Responsive design** for all devices
- Professional gradient backgrounds and hover effects

### 🛡️ Error Handling
- Graceful API failure handling
- User-friendly error messages
- Toast notifications for actions
- Loading states and fallback UI

## 🚀 Tech Stack

### Frontend
- **Next.js 14** (App Router)
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **shadcn/ui** for UI components

### Backend
- **Next.js API Routes** for server-side logic
- **NextAuth.js** for authentication
- **MongoDB** with native driver
- **Google Books API** for book data

### Deployment
- **Vercel** (recommended)
- **MongoDB Atlas** for database
- **Google Cloud Console** for OAuth

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js** 18.0 or later
- **npm** or **yarn** package manager
- **MongoDB Atlas** account (free tier available)
- **Google Cloud Console** account
- **Git** for version control

## 🛠️ Installation & Setup

### 1. Clone the Repository

\`\`\`bash
git clone https://github.com/yourusername/booktracker.git
cd booktracker
\`\`\`

### 2. Install Dependencies

\`\`\`bash
npm install
# or
yarn install
\`\`\`

### 3. Environment Variables Setup

Create a `.env.local` file in the root directory:

\`\`\`env
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-key-here-make-it-long-and-random

# Google OAuth Credentials
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# MongoDB Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/booktracker?retryWrites=true&w=majority

# Google Books API
GOOGLE_BOOKS_API_KEY=your-google-books-api-key
\`\`\`

### 4. Google Cloud Console Setup

#### Step 1: Create a New Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "New Project" and give it a name (e.g., "BookTracker")
3. Select the project

#### Step 2: Enable APIs
1. Go to "APIs & Services" → "Library"
2. Search and enable:
   - **Google Books API**
   - **Google+ API** (for OAuth)

#### Step 3: Create OAuth Credentials
1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth 2.0 Client IDs"
3. Configure OAuth consent screen:
   - User Type: External
   - App name: BookTracker
   - User support email: your email
   - Developer contact: your email
4. Create OAuth Client ID:
   - Application type: Web application
   - Name: BookTracker Web Client
   - Authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google` (development)
     - `https://yourdomain.com/api/auth/callback/google` (production)

#### Step 4: Get API Key
1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "API Key"
3. Restrict the key to "Google Books API" for security

### 5. MongoDB Atlas Setup

#### Step 1: Create Account & Cluster
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free account
3. Create a new cluster (M0 Sandbox - Free)

#### Step 2: Configure Database Access
1. Go to "Database Access"
2. Add a new database user:
   - Username: `booktracker-user`
   - Password: Generate a secure password
   - Database User Privileges: Read and write to any database

#### Step 3: Configure Network Access
1. Go to "Network Access"
2. Add IP Address: `0.0.0.0/0` (Allow access from anywhere)
   - **Note**: For production, restrict to specific IPs

#### Step 4: Get Connection String
1. Go to "Clusters" → "Connect"
2. Choose "Connect your application"
3. Copy the connection string
4. Replace `<password>` with your database user password
5. Replace `<dbname>` with `booktracker`

### 6. Generate NextAuth Secret

\`\`\`bash
# Generate a random secret
openssl rand -base64 32
\`\`\`

Copy the output to your `NEXTAUTH_SECRET` environment variable.

### 7. Run the Development Server

\`\`\`bash
npm run dev
# or
yarn dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

\`\`\`
booktracker/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── auth/[...nextauth]/   # NextAuth configuration
│   │   ├── books/                # Book CRUD operations
│   │   ├── search/               # Google Books API integration
│   │   └── stats/                # Reading statistics
│   ├── book/[id]/                # Individual book pages
│   ├── dashboard/                # Main dashboard
│   ├── profile/                  # User profile
│   ├── stats/                    # Statistics page
│   ├── globals.css               # Global styles
│   └── layout.tsx                # Root layout
├── components/                   # Reusable components
│   ├── ui/                       # shadcn/ui components
│   ├── book-modal.tsx            # Book addition modal
│   ├── navbar.tsx                # Navigation component
│   ├── providers.tsx             # Context providers
│   └── theme-provider.tsx        # Theme management
├── hooks/                        # Custom React hooks
├── lib/                          # Utility functions
├── .env.local                    # Environment variables
├── next.config.mjs               # Next.js configuration
├── package.json                  # Dependencies
├── tailwind.config.js            # Tailwind CSS configuration
└── tsconfig.json                 # TypeScript configuration
\`\`\`

## 🔧 Configuration

### Database Schema

The app uses MongoDB with the following collections:

#### Users Collection (managed by NextAuth)
\`\`\`javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  image: String,
  emailVerified: Date
}
\`\`\`

#### Books Collection
\`\`\`javascript
{
  _id: ObjectId,
  userEmail: String,        // Reference to user
  bookId: String,           // Google Books ID
  title: String,
  authors: [String],
  description: String,
  thumbnail: String,
  pageCount: Number,
  publishedDate: String,
  publisher: String,
  shelf: String,            // "want-to-read", "currently-reading", "finished"
  progress: Number,         // 0-100
  notes: String,
  savedAt: Date,
  updatedAt: Date
}
\`\`\`

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/[...nextauth]` | GET/POST | NextAuth authentication |
| `/api/search` | GET | Search Google Books API |
| `/api/books` | GET/POST | Get user books / Add new book |
| `/api/books/[id]` | GET/PATCH/DELETE | Book CRUD operations |
| `/api/stats` | GET | Get reading statistics |

### Rate Limiting

The app implements client-side rate limiting for the Google Books API:
- **5 searches per 12 seconds** per user
- Friendly error messages when limit exceeded
- Automatic reset after time window

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub**:
\`\`\`bash
git add .
git commit -m "Initial commit"
git push origin main
\`\`\`

2. **Connect to Vercel**:
   - Go to [Vercel](https://vercel.com)
   - Import your GitHub repository
   - Configure environment variables in Vercel dashboard

3. **Update OAuth Redirect URLs**:
   - Add your Vercel domain to Google OAuth settings
   - Update `NEXTAUTH_URL` to your production URL

4. **Deploy**:
   - Vercel will automatically deploy on every push to main

### Environment Variables for Production

\`\`\`env
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=your-production-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
MONGODB_URI=your-mongodb-connection-string
GOOGLE_BOOKS_API_KEY=your-google-books-api-key
\`\`\`

## 🧪 Testing

### Manual Testing Checklist

- [ ] Google OAuth login/logout
- [ ] Book search functionality
- [ ] Adding books to different shelves
- [ ] Progress tracking and updates
- [ ] Notes functionality
- [ ] Statistics calculations
- [ ] Responsive design on mobile
- [ ] Error handling scenarios
- [ ] Rate limiting behavior

### Test User Journey

1. **Landing Page**: Visit homepage, see features
2. **Authentication**: Click "Continue with Google"
3. **Dashboard**: Search for books, view results
4. **Add Books**: Add books to different shelves
5. **Book Details**: Update progress and notes
6. **Statistics**: View reading stats and progress
7. **Profile**: Manage library and account

## 🐛 Troubleshooting

### Common Issues

#### 1. OAuth Error: "redirect_uri_mismatch"
**Solution**: Ensure redirect URIs in Google Console match exactly:
- Development: `http://localhost:3000/api/auth/callback/google`
- Production: `https://yourdomain.com/api/auth/callback/google`

#### 2. MongoDB Connection Error
**Solution**: 
- Check connection string format
- Verify database user credentials
- Ensure network access is configured (0.0.0.0/0)

#### 3. Google Books API Error
**Solution**:
- Verify API key is correct
- Ensure Google Books API is enabled
- Check API quotas and limits

#### 4. NextAuth Session Error
**Solution**:
- Verify `NEXTAUTH_SECRET` is set
- Check `NEXTAUTH_URL` matches your domain
- Clear browser cookies and try again

#### 5. Build Errors
**Solution**:
\`\`\`bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build
\`\`\`

### Debug Mode

Enable debug logging by adding to `.env.local`:

\`\`\`env
NEXTAUTH_DEBUG=true
\`\`\`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines

- Use TypeScript for all new code
- Follow the existing code style
- Add proper error handling
- Test on multiple devices
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing framework
- [shadcn/ui](https://ui.shadcn.com/) for beautiful UI components
- [Google Books API](https://developers.google.com/books) for book data
- [MongoDB Atlas](https://www.mongodb.com/atlas) for database hosting
- [Vercel](https://vercel.com/) for deployment platform

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Troubleshooting](#-troubleshooting) section
2. Search existing [GitHub Issues](https://github.com/yourusername/booktracker/issues)
3. Create a new issue with detailed information
4. Contact: your-email@example.com

---

**Happy Reading! 📚✨**

Built with ❤️ by [Your Name](https://github.com/yourusername)
