# Homepage CMS Backend API

**Jira Work Item:** ROVO-81 - 首頁後端 CMS 模型與 API 開發

## Overview
This backend API provides content management system functionality for the homepage, supporting automatic content fetching and management.

## Content Models
- **Events** (活動): Event management with dates, locations, descriptions
- **Articles** (文章): Blog posts and news articles  
- **Association** (協會介紹): Organization information and member details
- **Banners** (Banner): Homepage banners with display scheduling
- **Partners** (合作夥伴): Partner organization information

## Features
- ✅ RESTful API endpoints with full CRUD operations
- ✅ JWT-based authentication and authorization
- ✅ Multi-language support (Chinese/English)
- ✅ File upload handling for images
- ✅ Input validation and sanitization
- ✅ Rate limiting and security measures
- ✅ Swagger API documentation
- ✅ Admin dashboard templates

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Access API documentation:**
   - Swagger UI: http://localhost:3000/api-docs
   - Admin Dashboard: http://localhost:3000/admin

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Events (活動)
- `GET /api/events` - Get all events
- `GET /api/events/:id` - Get specific event
- `POST /api/events` - Create new event
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event

### Articles (文章)
- `GET /api/articles` - Get all articles
- `GET /api/articles/:id` - Get specific article
- `POST /api/articles` - Create new article
- `PUT /api/articles/:id` - Update article
- `DELETE /api/articles/:id` - Delete article

### Association (協會介紹)
- `GET /api/association` - Get association info
- `PUT /api/association` - Update association info

### Banners (Banner)
- `GET /api/banners` - Get active banners
- `POST /api/banners` - Create new banner
- `PUT /api/banners/:id` - Update banner
- `DELETE /api/banners/:id` - Delete banner

### Partners (合作夥伴)
- `GET /api/partners` - Get all partners
- `POST /api/partners` - Create new partner
- `PUT /api/partners/:id` - Update partner
- `DELETE /api/partners/:id` - Delete partner

## Acceptance Criteria Testing

### 1. Data Storage & Retrieval
```bash
npm test -- --testNamePattern="data storage"
```

### 2. Load Testing
```bash
npm run test:load
```

### 3. User Interface Testing
```bash
npm run test:ui
```

### 4. Security Testing
```bash
npm run test:security
```

## Project Structure
```
cms-backend/
├── src/
│   ├── controllers/     # Request handlers
│   ├── models/         # Database models
│   ├── routes/         # API routes
│   ├── middleware/     # Custom middleware
│   ├── config/         # Configuration files
│   ├── utils/          # Utility functions
│   ├── validators/     # Input validation
│   ├── views/          # Admin templates
│   └── app.js          # Main application file
├── tests/              # Test files
├── uploads/            # File uploads
└── locales/           # Multi-language files
```