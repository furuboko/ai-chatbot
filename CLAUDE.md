## MUST - Critical Rules
- **MUST** ファイルを指定するときに、Windowsの形式のパスはubuntuのマウントディレクトリのパスに変換してください
  - 例: "\\wsl.localhost\Ubuntu\home\shou10254\test.jpg" を "/home/shou10254/test.jpg" へ変換

# AI Chatbot Project Specification

## 📖 Project Overview

An entertainment-focused AI chatbot web application powered by Anthropic Claude. The application provides a simple, single-conversation chat interface where users can interact with Claude AI. Conversation history is persisted in MongoDB for continuity across sessions.

### Key Characteristics
- **Purpose**: Entertainment
- **Type**: Web Application
- **Target Users**: General public (no authentication required)
- **Scale**: 5-10 concurrent users

---

## 🛠 Technical Stack

### Frontend & Backend
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **API Layer**: Hono (integrated within Next.js)
- **UI Framework**: Tailwind CSS + shadcn/ui
- **React Version**: 18+

### Database & ORM
- **Database**: MongoDB
- **ORM**: Prisma
- **Connection**: Prisma MongoDB connector

### AI Integration
- **Provider**: Anthropic Claude
- **API**: Claude API (via @anthropic-ai/sdk)
- **Model**: claude-3-5-sonnet-20241022 (or latest)
- **Streaming**: Disabled (full response)

### Deployment
- **Platform**: Google Cloud Run
- **Container**: Docker
- **Region**: asia-northeast1 (Tokyo) or user preference

---

## 🏗 System Architecture

### Architecture Pattern
**Monolithic (Integrated)**: Next.js application with embedded Hono API routes

```
┌─────────────────────────────────────┐
│         Next.js App Router          │
├─────────────────────────────────────┤
│  Frontend (React Components)        │
│  ├─ Chat Interface                  │
│  ├─ Message Display                 │
│  └─ Reset Button                    │
├─────────────────────────────────────┤
│  API Layer (Hono)                   │
│  ├─ /api/chat (POST)                │
│  ├─ /api/messages (GET)             │
│  └─ /api/reset (POST)               │
├─────────────────────────────────────┤
│  Data Layer (Prisma)                │
│  └─ MongoDB Connection              │
└─────────────────────────────────────┘
           ↓
    ┌──────────────┐
    │   MongoDB    │
    └──────────────┘
           ↓
    ┌──────────────┐
    │ Claude API   │
    └──────────────┘
```

---

## 📁 Directory Structure

```
/
├── src/
│   ├── app/
│   │   ├── page.tsx                 # Main chat page
│   │   ├── layout.tsx               # Root layout
│   │   └── api/
│   │       └── [[...route]]/        # Hono API routes
│   │           └── route.ts
│   ├── components/
│   │   ├── chat/
│   │   │   ├── ChatInterface.tsx    # Main chat component
│   │   │   ├── MessageList.tsx      # Message display
│   │   │   ├── MessageInput.tsx     # Input field
│   │   │   └── ResetButton.tsx      # Conversation reset
│   │   └── ui/                      # shadcn/ui components
│   ├── lib/
│   │   ├── prisma.ts                # Prisma client singleton
│   │   ├── claude.ts                # Claude API client
│   │   └── utils.ts                 # Utility functions
│   └── types/
│       └── index.ts                 # TypeScript types
├── prisma/
│   └── schema.prisma                # Prisma schema
├── public/                          # Static assets
├── Dockerfile                       # Cloud Run deployment
├── .env.local                       # Local environment variables
├── .env.example                     # Example environment file
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
└── CLAUDE.md                        # This file
```

---

## ✨ Core Features

### 1. Chat Interface
- Single conversation thread
- Text-only communication (no image upload)
- Clean, minimal UI design
- Real-time message display

### 2. Message Handling
- User sends message → stored in MongoDB
- Claude processes message → response stored in MongoDB
- No streaming (complete response displayed at once)
- Message history loaded on page load

### 3. Conversation Persistence
- All messages stored in MongoDB
- Conversation persists across browser sessions
- No user accounts (single global conversation)

### 4. Reset Functionality
- Button to clear conversation history
- Deletes all messages from database
- Starts fresh conversation

### 5. Error Handling
- API error messages displayed to user
- Network error recovery
- Database connection error handling
- Claude API rate limit handling

---

## 🗄 Database Schema

### Prisma Schema (`prisma/schema.prisma`)

```prisma
datasource db {
  provider = "mongodb"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model Message {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  role      String   // "user" or "assistant"
  content   String
  createdAt DateTime @default(now())

  @@map("messages")
}
```

### Data Model
- **Message**
  - `id`: Unique identifier (MongoDB ObjectId)
  - `role`: Message sender ("user" | "assistant")
  - `content`: Message text content
  - `createdAt`: Timestamp of message creation

---

## 🔌 API Design

### Hono API Routes (via `/api/[[...route]]/route.ts`)

#### 1. POST `/api/chat`
Send a user message and get Claude's response.

**Request:**
```json
{
  "message": "Hello, how are you?"
}
```

**Response:**
```json
{
  "success": true,
  "userMessage": {
    "id": "...",
    "role": "user",
    "content": "Hello, how are you?",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "assistantMessage": {
    "id": "...",
    "role": "assistant",
    "content": "I'm doing well, thank you!",
    "createdAt": "2024-01-01T00:00:01.000Z"
  }
}
```

**Process:**
1. Validate request body
2. Save user message to MongoDB
3. Fetch conversation history
4. Call Claude API with history
5. Save assistant response to MongoDB
6. Return both messages

#### 2. GET `/api/messages`
Retrieve all messages in conversation history.

**Response:**
```json
{
  "success": true,
  "messages": [
    {
      "id": "...",
      "role": "user",
      "content": "Hello",
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    {
      "id": "...",
      "role": "assistant",
      "content": "Hi there!",
      "createdAt": "2024-01-01T00:00:01.000Z"
    }
  ]
}
```

#### 3. POST `/api/reset`
Delete all conversation history.

**Response:**
```json
{
  "success": true,
  "deletedCount": 24
}
```

---

## 🔐 Environment Variables

### Required Environment Variables

Create `.env.local` file in project root:

```bash
# Database
DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/chatbot?retryWrites=true&w=majority"

# Anthropic Claude API
ANTHROPIC_API_KEY="sk-ant-..."

# Optional: Claude Model Configuration
CLAUDE_MODEL="claude-3-5-sonnet-20241022"
CLAUDE_MAX_TOKENS=4096
CLAUDE_TEMPERATURE=1.0
```

### Environment File Template (`.env.example`)

```bash
# MongoDB Connection String
DATABASE_URL="mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority"

# Anthropic API Key (get from: https://console.anthropic.com/)
ANTHROPIC_API_KEY="sk-ant-api-key-here"

# Optional Settings
CLAUDE_MODEL="claude-3-5-sonnet-20241022"
CLAUDE_MAX_TOKENS=4096
CLAUDE_TEMPERATURE=1.0
```

---

## 📝 Development Guidelines

### Code Style
- Use TypeScript strict mode
- Follow Next.js 14 App Router conventions
- Use server components by default, client components only when needed
- Implement proper error boundaries
- Use async/await for asynchronous operations

### Component Structure
- Keep components small and focused
- Separate UI components from business logic
- Use composition over inheritance
- Implement proper loading and error states

### Database Access
- Always use Prisma client through singleton instance
- Handle connection errors gracefully
- Use transactions for multi-step operations
- Index frequently queried fields

### API Development
- Validate all inputs
- Return consistent error responses
- Log errors for debugging
- Implement rate limiting if needed

### Testing Strategy
- Unit tests for utility functions
- Integration tests for API routes
- E2E tests for critical user flows
- Manual testing before deployment

---

## 🚀 Deployment

### Docker Configuration

**Dockerfile:**
```dockerfile
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build Next.js
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/prisma ./prisma

USER nextjs

EXPOSE 8080

ENV PORT 8080
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

**next.config.js:**
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
}

module.exports = nextConfig
```

### Cloud Run Deployment Steps

1. **Build Docker Image:**
   ```bash
   gcloud builds submit --tag gcr.io/PROJECT_ID/ai-chatbot
   ```

2. **Deploy to Cloud Run:**
   ```bash
   gcloud run deploy ai-chatbot \
     --image gcr.io/PROJECT_ID/ai-chatbot \
     --platform managed \
     --region asia-northeast1 \
     --allow-unauthenticated \
     --set-env-vars DATABASE_URL=mongodb+srv://... \
     --set-env-vars ANTHROPIC_API_KEY=sk-ant-... \
     --max-instances 2 \
     --min-instances 0 \
     --memory 512Mi \
     --cpu 1 \
     --timeout 300
   ```

3. **Set Environment Variables via Secret Manager (recommended):**
   ```bash
   echo -n "sk-ant-..." | gcloud secrets create anthropic-api-key --data-file=-
   echo -n "mongodb+srv://..." | gcloud secrets create database-url --data-file=-

   gcloud run deploy ai-chatbot \
     --update-secrets ANTHROPIC_API_KEY=anthropic-api-key:latest \
     --update-secrets DATABASE_URL=database-url:latest
   ```

### Cloud Run Configuration
- **Memory**: 512Mi (sufficient for 5-10 concurrent users)
- **CPU**: 1
- **Max instances**: 2
- **Min instances**: 0 (cost optimization)
- **Timeout**: 300s (Claude API can take time)
- **Concurrency**: 80 (default)

---

## 🔒 Security Considerations

### API Key Management
- Never commit `.env.local` to git
- Use Google Secret Manager for production secrets
- Rotate API keys periodically
- Monitor API usage in Anthropic console

### Input Validation
- Sanitize user input before storing
- Validate message length (max 10,000 characters recommended)
- Prevent XSS attacks through proper escaping
- Use Zod or similar for runtime type validation

### Rate Limiting
- Implement rate limiting to prevent abuse
- Consider per-IP limits (e.g., 10 requests/minute)
- Return 429 status code when limit exceeded

### CORS Configuration
- Configure CORS properly for API routes
- Only allow necessary origins in production

### Database Security
- Use MongoDB Atlas with IP whitelist
- Enable authentication on MongoDB
- Use TLS/SSL for database connections
- Regular database backups

### Error Handling
- Don't expose internal errors to users
- Log errors securely for debugging
- Return generic error messages to client

---

## 📊 Performance Optimization

### Frontend
- Use React Server Components where possible
- Implement proper code splitting
- Optimize images and assets
- Use Next.js built-in optimizations

### Backend
- Cache conversation history when appropriate
- Use Prisma query optimization
- Implement connection pooling for MongoDB
- Monitor and optimize API response times

### Database
- Index `createdAt` field for sorting
- Limit number of messages returned (pagination if needed)
- Consider TTL for old messages (optional)

---

## 🧪 Testing Checklist

### Before Deployment
- [ ] All environment variables configured
- [ ] Prisma schema applied to MongoDB
- [ ] Claude API key valid and working
- [ ] Send message functionality works
- [ ] Message history loads correctly
- [ ] Reset conversation clears database
- [ ] Error handling works properly
- [ ] Docker image builds successfully
- [ ] Cloud Run deployment successful
- [ ] HTTPS working on production URL

### Load Testing
- [ ] Test with 10 concurrent users
- [ ] Verify response times acceptable
- [ ] Monitor Cloud Run metrics
- [ ] Check database connection limits

---

## 📚 Additional Resources

### Documentation Links
- [Next.js App Router](https://nextjs.org/docs/app)
- [Hono Documentation](https://hono.dev/)
- [Prisma with MongoDB](https://www.prisma.io/docs/concepts/database-connectors/mongodb)
- [Anthropic Claude API](https://docs.anthropic.com/claude/reference/getting-started-with-the-api)
- [Google Cloud Run](https://cloud.google.com/run/docs)
- [shadcn/ui](https://ui.shadcn.com/)

### Development Commands

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run development server
npm run dev

# Build for production
npm run build

# Run production build locally
npm start

# Push Prisma schema to MongoDB
npx prisma db push

# Open Prisma Studio
npx prisma studio

# Build Docker image locally
docker build -t ai-chatbot .

# Run Docker container locally
docker run -p 8080:8080 --env-file .env.local ai-chatbot
```

---

## 🎯 Implementation Priorities

### Phase 1: MVP (Minimum Viable Product)
1. Set up Next.js project with TypeScript
2. Configure Prisma with MongoDB
3. Implement basic Hono API routes
4. Create simple chat interface
5. Integrate Claude API
6. Implement message storage and retrieval

### Phase 2: UI/UX
1. Integrate shadcn/ui components
2. Improve chat interface design
3. Add loading states
4. Implement error messages
5. Add reset functionality

### Phase 3: Deployment
1. Create Dockerfile
2. Test Docker build locally
3. Set up Google Cloud project
4. Configure Secret Manager
5. Deploy to Cloud Run
6. Test production deployment

### Phase 4: Polish
1. Performance optimization
2. Error handling improvements
3. Add analytics (optional)
4. Documentation updates
5. User testing and feedback

---

## 🐛 Known Limitations

1. **Single Conversation**: All users share the same conversation thread (no user isolation)
2. **No Authentication**: Anyone can access and reset the conversation
3. **No Streaming**: Responses appear all at once (may feel slow for long responses)
4. **No Context Limit**: Conversation history grows indefinitely (consider implementing cleanup)
5. **No Rate Limiting**: Currently no protection against abuse (should be added)

### Future Enhancements (Optional)
- Add user authentication and per-user conversations
- Implement streaming responses
- Add conversation context limit management
- Implement rate limiting
- Add analytics dashboard
- Support multiple AI models
- Add export conversation feature
- Implement conversation search

---

## 📞 Support & Maintenance

### Monitoring
- Monitor Cloud Run logs in Google Cloud Console
- Set up uptime monitoring
- Track API usage in Anthropic console
- Monitor MongoDB Atlas metrics

### Regular Maintenance
- Update dependencies monthly
- Review and rotate API keys quarterly
- Check for security vulnerabilities
- Optimize database performance
- Review error logs weekly

---

**Last Updated**: 2026-02-15
**Version**: 1.0.0
**Status**: Specification Complete