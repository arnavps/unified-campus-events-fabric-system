# 🎓 UCEF - Unified Campus Events Fabric

> A comprehensive, full-stack event management platform designed for educational institutions to streamline event organization, registration, attendance tracking, and certificate generation.

---


### 🎯 Core Functionality
- **Multi-Role Authentication**: Secure JWT-based authentication with role-based access control (Student, Organizer, Admin)
- **Event Management**: Complete CRUD operations for creating, publishing, and managing campus events
- **Smart Registration**: Automated registration system with approval workflows and waitlist management
- **Advanced Attendance**: Multiple check-in methods including QR codes, geofencing, and manual marking
- **Certificate Generation**: Automated PDF certificate generation with blockchain-inspired verification hashes
- **Real-time Notifications**: Email notifications for registrations, event updates, and certificate issuance

### 📊 Analytics & Insights
- **Organizer Dashboard**: Event-specific analytics with attendance rates, registration trends, and feedback summaries
- **Admin Dashboard**: Institution-wide analytics with interactive charts (Recharts integration)
- **Student Profile**: Participation history, certificates earned, and personalized event recommendations

### 🎨 Premium UI/UX
- **Glassmorphism Design**: Modern, frosted-glass aesthetic with smooth animations
- **Responsive Layout**: Mobile-first design that works seamlessly across all devices
- **Custom Typography**: Premium 'Outfit' font family for headings with gradient text effects
- **Interactive Components**: Hover effects, micro-animations, and smooth transitions

### 🔔 Advanced Features
- **Announcements System**: Priority-based announcements with targeted delivery
- **Feedback Collection**: Post-event feedback with rating systems
- **Geofence Attendance**: Location-based check-in with configurable radius
- **Certificate Verification**: Public verification endpoint for certificate authenticity

---

## 🏗️ Tech Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with custom glassmorphism utilities
- **UI Components**: Custom components with Lucide React icons
- **Charts**: Recharts for data visualization
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Date Handling**: date-fns

### Backend
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript
- **ORM**: Prisma with SQLite (production-ready for PostgreSQL/MySQL)
- **Authentication**: JWT with bcrypt password hashing
- **Email**: Nodemailer with customizable templates
- **PDF Generation**: PDFKit for certificate generation
- **Validation**: Zod for runtime type validation

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/unified-campus.git
   cd unified-campus
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   
   # Create .env file
   cp .env.example .env
   # Edit .env with your configuration
   
   # Initialize database
   npx prisma generate
   npx prisma migrate dev
   
   # Start backend server
   npm start
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   
   # Start development server
   npm run dev
   ```

4. **Access the application**
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:5001`

### Environment Variables

#### Backend (.env)
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-super-secret-jwt-key"
JWT_REFRESH_SECRET="your-refresh-secret-key"
PORT=5001

# Email Configuration (Optional)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
```

---

## 📁 Project Structure

```
unified-campus/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # Database schema
│   │   └── migrations/            # Database migrations
│   ├── src/
│   │   ├── controllers/           # Request handlers
│   │   ├── middleware/            # Auth & validation middleware
│   │   ├── routes/                # API routes
│   │   ├── services/              # Business logic
│   │   └── index.ts               # Server entry point
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/            # Reusable UI components
│   │   ├── contexts/              # React contexts (Auth)
│   │   ├── layouts/               # Page layouts
│   │   ├── pages/                 # Route pages
│   │   │   ├── auth/              # Login, Register
│   │   │   ├── dashboard/         # Role-based dashboards
│   │   │   ├── events/            # Event list, detail
│   │   │   ├── organizer/         # Organizer-specific pages
│   │   │   └── student/           # Student-specific pages
│   │   ├── services/              # API service layer
│   │   └── App.tsx                # App entry point
│   └── package.json
│
└── README.md
```

---

## 🎯 Usage

### For Students
1. **Register/Login** to your account
2. **Browse Events** and view detailed information
3. **Register** for events you're interested in
4. **Check In** using QR code or geolocation
5. **Download Certificates** after event completion
6. **Provide Feedback** to help improve future events

### For Organizers
1. **Create Events** with detailed information and settings
2. **Manage Registrations** (approve/reject/waitlist)
3. **Track Attendance** using multiple methods
4. **Issue Certificates** to participants
5. **Send Announcements** to registered students
6. **View Analytics** and feedback

### For Admins
1. **Monitor** all platform activities
2. **View Analytics** across all events
3. **Manage Users** and permissions
4. **Generate Reports** for institutional insights

---

## 🔐 API Documentation

### Authentication Endpoints
```
POST /api/auth/register      # Register new user
POST /api/auth/login         # Login user
POST /api/auth/refresh       # Refresh access token
```

### Event Endpoints
```
GET    /api/events           # List all events
GET    /api/events/:id       # Get event details
POST   /api/events           # Create event (Organizer)
PUT    /api/events/:id       # Update event (Organizer)
DELETE /api/events/:id       # Delete event (Organizer)
```

### Registration Endpoints
```
POST   /api/registrations    # Register for event
GET    /api/registrations/my # Get my registrations
PUT    /api/registrations/:id # Update registration status
```

### Attendance Endpoints
```
POST   /api/attendance/mark        # Self check-in
POST   /api/attendance/mark-user   # Mark user (Organizer)
GET    /api/attendance/events/:id  # Get event attendance
```

### Certificate Endpoints
```
POST   /api/certificates/issue     # Issue certificate (Organizer)
GET    /api/certificates/my        # Get my certificates
GET    /api/certificates/:id/download # Download certificate
GET    /api/certificates/verify/:hash # Verify certificate
```

---

## 🎨 Design System

### Color Palette
- **Primary**: Blue gradient (`from-blue-600 to-indigo-600`)
- **Success**: Green (`#10B981`)
- **Warning**: Yellow (`#F59E0B`)
- **Error**: Red (`#EF4444`)

### Typography
- **Display**: Outfit (Headings)
- **Body**: System fonts (Inter, -apple-system, BlinkMacSystemFont)

### Components
- **Glass Cards**: `backdrop-blur-md bg-white/80`
- **Shadows**: Multi-layered shadows for depth
- **Animations**: Smooth transitions with `duration-300`

---

## 🧪 Testing

```bash
# Backend tests (if implemented)
cd backend
npm test

# Frontend tests (if implemented)
cd frontend
npm test
```

---

## 📦 Deployment

### Backend Deployment (Example: Railway/Render)
1. Set environment variables in your hosting platform
2. Update `DATABASE_URL` to production database
3. Run migrations: `npx prisma migrate deploy`
4. Deploy with `npm start`

### Frontend Deployment (Example: Vercel/Netlify)
1. Build the production bundle: `npm run build`
2. Deploy the `dist` folder
3. Configure environment variables if needed

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Arnav Shirwadkar**

---

## 🙏 Acknowledgments

- React and Vite teams for excellent developer experience
- Prisma for the amazing ORM
- Tailwind CSS for utility-first styling
- The open-source community

---

## 📧 Support

For support, email your-email@example.com or open an issue in the repository.

---

<div align="center">
  <p>Made with ❤️ for educational institutions</p>
  <p>⭐ Star this repo if you find it helpful!</p>
</div>
