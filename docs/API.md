# API Documentation

Complete API reference for the Netflix Clone backend.

## Base URL
```
Local: http://localhost:5000
Production: https://api.netflix-clone.example.com
```

## Authentication

All authenticated endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## Authentication Endpoints

### Register User
Create a new user account.

**Endpoint:** `POST /api/auth/register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "username": "John Doe"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "username": "John Doe",
    "subscription": "basic",
    "profiles": [...]
  }
}
```

### Login
Authenticate a user and receive a JWT token.

**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "username": "John Doe",
    "subscription": "basic",
    "profiles": [...]
  }
}
```

### Get Current User
Get the currently authenticated user's information.

**Endpoint:** `GET /api/auth/me`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "username": "John Doe",
    "subscription": "premium",
    "profiles": [...],
    "createdAt": "2023-01-01T00:00:00.000Z"
  }
}
```

---

## Content Endpoints

### Get All Content
Retrieve content with optional filters.

**Endpoint:** `GET /api/content`

**Query Parameters:**
- `type` (optional): "movie" or "series"
- `genre` (optional): Filter by genre
- `featured` (optional): "true" or "false"
- `trending` (optional): "true" or "false"
- `newRelease` (optional): "true" or "false"
- `search` (optional): Search query
- `limit` (optional, default: 20): Number of results
- `page` (optional, default: 1): Page number

**Example:** `GET /api/content?type=movie&genre=Action&limit=10`

**Response:** `200 OK`
```json
{
  "success": true,
  "count": 10,
  "total": 45,
  "page": 1,
  "pages": 5,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "title": "The Digital Frontier",
      "description": "A thrilling journey...",
      "type": "movie",
      "genres": ["Action", "Sci-Fi"],
      "releaseYear": 2023,
      "duration": 142,
      "maturityRating": "PG-13",
      "thumbnail": "https://...",
      "banner": "https://...",
      "rating": {
        "average": 8.5,
        "count": 1250
      },
      "popularity": 95,
      "viewCount": 45000
    }
  ]
}
```

### Get Content by ID
Retrieve a single content item.

**Endpoint:** `GET /api/content/:id`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "The Digital Frontier",
    "description": "A thrilling journey...",
    "type": "movie",
    "genres": ["Action", "Sci-Fi"],
    "cast": [
      {"name": "John Smith", "role": "Lead Developer"}
    ],
    "director": "Michael Chen",
    "seasons": [],
    ...
  }
}
```

### Increment View Count
Track when content is viewed.

**Endpoint:** `POST /api/content/:id/view`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    ...content with updated viewCount
  }
}
```

### Rate Content
Submit a rating for content.

**Endpoint:** `POST /api/content/:id/rate`

**Request Body:**
```json
{
  "rating": 8.5
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    ...content with updated rating
  }
}
```

---

## User Profile Endpoints

### Create Profile
Create a new profile for the user.

**Endpoint:** `POST /api/user/profiles`

**Request Body:**
```json
{
  "name": "Kids",
  "avatar": "https://..."
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "profiles": [...]
}
```

### Update Watch History
Track watched content and progress.

**Endpoint:** `PUT /api/user/profiles/:profileId/watch-history`

**Request Body:**
```json
{
  "contentId": "507f1f77bcf86cd799439011",
  "progress": 45.5,
  "completed": false
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "watchHistory": [...]
}
```

### Get Watch History
Retrieve watch history for a profile.

**Endpoint:** `GET /api/user/profiles/:profileId/watch-history`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "contentId": {...},
      "watchedAt": "2023-01-01T12:00:00.000Z",
      "progress": 75.5,
      "completed": false
    }
  ]
}
```

### Add to My List
Add content to a profile's list.

**Endpoint:** `POST /api/user/profiles/:profileId/my-list`

**Request Body:**
```json
{
  "contentId": "507f1f77bcf86cd799439011"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "myList": [...]
}
```

### Remove from My List
Remove content from a profile's list.

**Endpoint:** `DELETE /api/user/profiles/:profileId/my-list/:contentId`

**Response:** `200 OK`
```json
{
  "success": true,
  "myList": [...]
}
```

### Get My List
Retrieve all content in a profile's list.

**Endpoint:** `GET /api/user/profiles/:profileId/my-list`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [...]
}
```

---

## Recommendation Endpoints

### Get Personalized Recommendations
Get ML-powered recommendations for a profile.

**Endpoint:** `GET /api/recommendations/:profileId`

**Query Parameters:**
- `limit` (optional, default: 20): Number of recommendations

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [...content items],
  "source": "ml-model"
}
```

### Get Similar Content
Find content similar to a specific item.

**Endpoint:** `GET /api/recommendations/:profileId/similar/:contentId`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [...similar content]
}
```

---

## Streaming Endpoints

### Get Streaming URL
Get the streaming URL for content.

**Endpoint:** `GET /api/streaming/:contentId`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "contentId": "507f1f77bcf86cd799439011",
    "title": "The Digital Frontier",
    "streamingUrl": "https://...",
    "type": "movie",
    "duration": 142,
    "thumbnail": "https://..."
  }
}
```

### Get Episode Streaming URL
Get streaming URL for a specific episode.

**Endpoint:** `GET /api/streaming/episode/:contentId/:seasonNumber/:episodeNumber`

**Example:** `GET /api/streaming/episode/507f1f77bcf86cd799439011/1/2`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "contentId": "507f1f77bcf86cd799439011",
    "title": "Series Title",
    "episodeTitle": "Episode Title",
    "streamingUrl": "https://...",
    "season": 1,
    "episode": 2,
    "duration": 45,
    "thumbnail": "https://..."
  }
}
```

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "error": "Invalid request parameters",
  "errors": [...]
}
```

### 401 Unauthorized
```json
{
  "error": "Not authorized to access this route"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": {
    "message": "Internal Server Error",
    "status": 500
  }
}
```

---

## Rate Limiting

API endpoints are rate-limited to prevent abuse:
- 100 requests per minute per IP for public endpoints
- 1000 requests per minute for authenticated endpoints

Rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

---

## Pagination

List endpoints support pagination:

**Query Parameters:**
- `limit`: Items per page (default: 20, max: 100)
- `page`: Page number (default: 1)

**Response includes:**
```json
{
  "count": 20,
  "total": 150,
  "page": 1,
  "pages": 8,
  "data": [...]
}
```

---

For ML Service API documentation, see [ML-API.md](ML-API.md)
