# MentorConnect - Video Mentorship Platform

## Overview

MentorConnect is a comprehensive platform that connects mentees with domain experts for paid video mentoring sessions. The platform facilitates scheduling, payment processing, video conferencing with live transcription, and collaborative note-taking.

## Features

### User Authentication
- Role-based authentication (mentor/mentee)
- User profiles with customizable details
- Email verification

### Mentor Discovery
- Browse mentors by domain expertise
- View mentor profiles with experience, hourly rates, and availability
- Filter mentors by domain, availability, and price

### Session Management
- Request mentoring sessions based on mentor availability
- Accept/decline session requests (for mentors)
- View upcoming, pending, and past sessions
- Session history with transcripts and notes

### Video Conferencing
- One-on-one video calls using Stream Video API
- Screen sharing capabilities
- Live transcription during calls
- Session recording

### Collaborative Features
- Real-time note-taking during sessions
- Share notes between mentor and mentee
- Post-session follow-up messaging

### Payment Processing
- Secure payment processing before sessions
- Custom pricing set by mentors
- Refund policies for canceled sessions

### Notifications
- In-app notifications for session requests, confirmations, and reminders
- Email notifications for important updates

## Technology Stack

### Frontend
- React with TypeScript
- Vite for build tooling
- TailwindCSS for styling
- ShadCN UI components
- React Router for navigation
- React Hook Form for form handling
- Zod for validation

### Backend
- Supabase for authentication, database, and storage
- PostgreSQL database
- Row-Level Security for data protection

### Video Conferencing
- Stream Video API for video calls
- Real-time transcription
- Recording capabilities

## Database Schema

### Tables
- `profiles`: User profiles with basic information
- `mentor_profiles`: Additional details for mentors
- `sessions`: Mentoring session details
- `availabilities`: Mentor availability slots
- `payments`: Payment records for sessions
- `video_calls`: Video call details with Stream integration
- `notifications`: User notifications

## Getting Started

### Prerequisites
- Node.js (v16+)
- npm or yarn
- Supabase account
- Stream account for video API

### Environment Setup
1. Clone the repository
2. Copy `.env.example` to `.env` and fill in the required values:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_STREAM_API_KEY=your_stream_api_key
   ```

### Installation
```bash
# Install dependencies
npm install

# Run database migrations
npm run supabase:migrate

# Start development server
npm run dev
```

### Database Setup
The project uses Supabase migrations to set up the database schema. Run the migrations to create all necessary tables and security policies:

```bash
npm run supabase:migrate
```

## Usage

### For Mentees
1. Create an account and select "Mentee" role
2. Browse available mentors by domain
3. View mentor profiles and availability
4. Request a session with a mentor
5. Complete payment to confirm the session
6. Join the video call at the scheduled time
7. Take notes during the session
8. View session history and transcripts

### For Mentors
1. Create an account and select "Mentor" role
2. Complete your mentor profile with domains, bio, and hourly rate
3. Set your availability for mentoring sessions
4. Accept or decline session requests
5. Join video calls with mentees
6. Share notes and resources during sessions
7. View your session history and earnings

## Stream Video API Integration

The platform uses Stream's Video API for real-time video conferencing. Key features include:

- One-on-one video calls between mentor and mentee
- Screen sharing for demonstrations
- Live transcription of conversations
- Session recording for later review
- Collaborative tools during calls

The integration is handled through the `src/lib/stream.ts` utility, which provides functions for initializing the Stream client, creating or joining calls, and managing call state.

## Deployment

The application can be deployed to any static hosting service that supports Vite applications:

1. Build the application:
   ```bash
   npm run build
   ```

2. Deploy the `dist` directory to your hosting service of choice (Vercel, Netlify, etc.)

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'Add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
