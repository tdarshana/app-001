# QuizSpark

**AI-Powered Interactive Learning Platform for Primary Education**

Generate engaging MCQ quizzes from any content and deliver them to students via QR codes or web links. Monitor student performance in real-time with an interactive teacher dashboard.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![SvelteKit](https://img.shields.io/badge/SvelteKit-2.x-orange.svg)
![Svelte](https://img.shields.io/badge/Svelte-5-red.svg)
![Capacitor](https://img.shields.io/badge/Capacitor-6-blue.svg)

-----

## Features

### AI Content Generation

- Upload documents (PDF, DOCX, PPTX, TXT)
- Paste website URLs for content extraction
- YouTube video transcript processing
- Image/handwritten notes via OCR
- Automatic question generation with multiple types:
  - Multiple Choice (MCQ)
  - True/False
  - Fill in the Blanks
  - Matching
  - Sequencing

### Kid-Friendly Gamification

- **Race Mode**: Speed-based competition
- **Tower Defense**: Answer questions to defend your base
- **Puzzle Quest**: Unlock puzzle pieces by answering
- **Adventure Mode**: Story-driven learning journey
- Collectible characters ("Sparks")
- XP, levels, achievements, and daily streaks
- Class and school leaderboards

### Easy Access for Students

- QR code generation for instant access
- Simple 6-digit join codes
- Short memorable URLs (quiz.spark/ABC123)
- No account required for students (optional)
- Works on any device

### Real-Time Teacher Dashboard

- Live student progress tracking
- Question-by-question analytics
- Struggling student alerts
- Intervention tools (hints, pause, skip)
- Exportable reports (PDF, Excel)
- Class performance trends

### Engaging Design for Kids (Ages 5-12)

- Colorful, playful interface
- Age-appropriate language options
- Celebration animations (confetti, stars)
- Sound effects and background music
- Voice read-aloud support
- Large buttons for younger students

-----

## Tech Stack

### Frontend

- **Framework**: SvelteKit 2.x with Svelte 5 (Runes)
- **UI Components**: shadcn-svelte
- **Styling**: Tailwind CSS
- **Animations**: Svelte transitions + Lottie
- **Icons**: Lucide Svelte
- **Forms**: SuperForms + Zod

### Backend

- **API**: SvelteKit API routes
- **Database**: PostgreSQL with Drizzle ORM
- **Cache**: Redis (Upstash)
- **Real-time**: Socket.io
- **File Storage**: Cloudflare R2 / AWS S3

### AI Service

- **Framework**: Python FastAPI
- **LLM Orchestration**: LangChain
- **Models**: Claude API / OpenAI API
- **Document Processing**: PyPDF, python-docx, BeautifulSoup

### Mobile

- **Framework**: Capacitor 6
- **Platforms**: iOS & Android
- **Native Features**: Camera, QR Scanner, Push Notifications, Haptics
- **Build**: Same SvelteKit codebase deployed to native apps

-----

## Project Structure

```
quizspark/
├── src/                        # SvelteKit application source
│   ├── lib/
│   │   ├── components/         # UI components
│   │   ├── server/             # Server-only code (db, auth)
│   │   ├── stores/             # Svelte stores
│   │   ├── capacitor/          # Capacitor plugin wrappers
│   │   ├── types/              # TypeScript types
│   │   └── utils/              # Utility functions
│   └── routes/                 # SvelteKit routes & API
├── static/                     # Static assets
├── android/                    # Capacitor Android project
├── ios/                        # Capacitor iOS project
├── apps/realtime/              # Socket.io server
├── packages/
│   ├── shared/                 # Shared types & utilities
│   └── ai-service/             # Python AI microservice
├── capacitor.config.ts         # Capacitor configuration
├── CLAUDE.md                   # AI assistant development guide
└── README.md
```

-----

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 8+
- PostgreSQL 15+
- Redis
- Python 3.11+ (for AI service)
- Xcode (for iOS development)
- Android Studio (for Android development)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/quizspark.git
cd quizspark

# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env

# Set up the database
pnpm db:push

# Start development servers
pnpm dev
```

### Environment Variables

```bash
# .env
DATABASE_URL="postgresql://..."
REDIS_URL="redis://localhost:6379"
AUTH_SECRET="your-secret-key"
AI_SERVICE_URL="http://localhost:8000"
ANTHROPIC_API_KEY="sk-ant-..."
PUBLIC_SOCKET_URL="http://localhost:3001"
```

### Mobile Development with Capacitor

```bash
# Build the web app first
pnpm build

# Add mobile platforms (first time only)
npx cap add android
npx cap add ios

# Sync web build to native projects
npx cap sync

# Open in IDE
npx cap open android    # Opens Android Studio
npx cap open ios        # Opens Xcode

# Run on device with live reload
npx cap run android --livereload --external
npx cap run ios --livereload --external
```

-----

## Development Guide

See [CLAUDE.md](./CLAUDE.md) for comprehensive development guidelines including:

- Svelte 5 Runes patterns
- Component structure templates
- API route patterns
- Database schema reference
- shadcn-svelte usage
- Capacitor integration patterns
- Animation guidelines
- Testing strategies

### Key Commands

```bash
# Development
pnpm dev              # Start all dev servers
pnpm dev:web          # Start web only
pnpm dev:ai           # Start AI service only

# Database
pnpm db:push          # Push schema changes
pnpm db:studio        # Open Drizzle Studio
pnpm db:generate      # Generate migrations
pnpm db:migrate       # Run migrations

# Testing
pnpm test             # Run unit tests
pnpm test:e2e         # Run E2E tests
pnpm check            # Type checking

# Building
pnpm build            # Build for production
pnpm preview          # Preview production build

# Mobile (Capacitor)
npx cap sync          # Sync web assets to native
npx cap run android   # Build & run on Android
npx cap run ios       # Build & run on iOS
npx cap open android  # Open Android Studio
npx cap open ios      # Open Xcode
```

-----

## Feature Roadmap

### Phase 1 - MVP

- [x] AI quiz generation from documents
- [x] Basic MCQ quiz delivery
- [x] QR code and link sharing
- [x] Real-time session management
- [x] Basic teacher dashboard

### Phase 2 - Engagement

- [ ] Multiple game modes
- [ ] Gamification system (XP, levels, badges)
- [ ] Collectible characters
- [ ] Enhanced animations
- [ ] Sound effects and music

### Phase 3 - Scale

- [ ] School/district management
- [ ] LMS integrations (Google Classroom, Canvas)
- [ ] Advanced analytics
- [ ] Parent portal
- [ ] Mobile apps (iOS/Android via Capacitor)

### Phase 4 - Intelligence

- [ ] Adaptive difficulty
- [ ] Personalized learning paths
- [ ] AI tutoring support
- [ ] Performance predictions
- [ ] Content recommendations

-----

## Competitive Advantages

| Feature | QuizSpark | Kahoot | Quizizz | Blooket |
|---------|-----------|--------|---------|---------|
| AI Quiz Generation | Yes | No | No | No |
| Document Upload | Yes | No | No | No |
| URL Content Extraction | Yes | No | No | No |
| Kid-Focused Design | Yes | Partial | Partial | Yes |
| Free Tier (Unlimited) | Yes | No | Partial | Yes |
| Real-time Analytics | Yes | Yes | Yes | Partial |
| Multiple Game Modes | Yes | Partial | Partial | Yes |
| QR Code Access | Yes | No | No | No |
| Native Mobile Apps | Yes | Yes | Yes | No |

-----

## Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

-----

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

-----

## Acknowledgments

- [shadcn-svelte](https://shadcn-svelte.com/) for beautiful UI components
- [SvelteKit](https://kit.svelte.dev/) for the amazing framework
- [Capacitor](https://capacitorjs.com/) for native mobile deployment
- [Drizzle ORM](https://orm.drizzle.team/) for type-safe database access
- [Anthropic](https://anthropic.com/) for Claude AI capabilities

-----

<p align="center">
  Made with love for educators and students everywhere
</p>
