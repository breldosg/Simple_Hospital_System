# Architecture Overview

## System Design

The Simple Hospital System follows a modern client-server architecture with a RESTful API design.

### High-Level Architecture

```
┌─────────────┐     ┌──────────────┐     ┌──────────────────┐
│   Client    │────▶│   Express    │────▶│ PHP SQL Database│
│  (Browser)  │◀────│   Server     │◀────│   Server        │
└─────────────┘     └──────────────┘     └──────────────────┘
                                                │
                                          ┌─────┴─────┐
                                          │  File     │
                                          │  Storage  │
                                          └───────────┘
```

## Technology Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **File Handling**: Multer
- **API Documentation**: OpenAPI/Swagger

### Frontend
- **Framework**: Vanilla JavaScript
- **Styling**: CSS3
- **HTML**: HTML5
- **Asset Management**: Static file serving

### Storage
- File System for uploads and attachments
- External API integration for assets

## Component Structure

### Server Components

1. **API Routes** (`/api_routes`)
   - Authentication routes
   - User management
   - Patient management
   - Pharmacy operations
   - Radiology services
   - Laboratory services
   - Billing system

2. **Utility Functions** (`/utility`)
   - Server helper functions
   - Cookie management
   - Authentication utilities
   - Common middleware

3. **Daemon Services** (`/daemon`)
   - Background tasks
   - Scheduled operations
   - System maintenance

4. **Public Assets** (`/public`)
   - Static files
   - Client-side scripts
   - Stylesheets
   - Images


## Security Architecture

1. **Authentication Layer**
   - JWT-based authentication
   - Session management
   - Cookie security

2. **Authorization Layer**
   - Role-based access control
   - Permission management
   - Resource protection

3. **Data Protection**
   - Input validation
   - XSS prevention
   - CSRF protection
   - Rate limiting

## System Workflows

### Authentication Flow
```
1. Client submits credentials
2. Server validates credentials
3. JWT token generated
4. Token stored in cookie
5. Subsequent requests include token
```

### Request Processing
```
1. Request received
2. Authentication middleware
3. Authorization check
4. Route handling
5. Database operation
6. Response formatting
7. Client response
```

## Scalability Considerations

1. **Horizontal Scaling**
   - Stateless architecture
   - Load balancer ready
   - Session management

2. **Performance Optimization**
   - Static file caching
   - Response compression
   - Efficient database queries

3. **Maintenance**
   - Logging system
   - Error tracking
   - Performance monitoring

## Development Workflow

1. **Local Development**
   - Development server
   - Hot reloading
   - Debug tools

2. **Testing Environment**
   - Unit tests
   - Integration tests
   - API testing

3. **Production Deployment**
   - Build process
   - Deployment scripts
   - Monitoring setup

## Future Considerations

1. **Planned Improvements**
   - Microservices architecture
   - Container deployment
   - Real-time updates
   - Enhanced security measures

2. **Scalability Plans**
   - Database sharding
   - Caching layer
   - CDN integration
   - Load balancing 