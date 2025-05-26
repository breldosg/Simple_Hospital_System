# Getting Started

This guide will help you set up and run the Simple Hospital System on your server.

## System Requirements

### Server Requirements
- Node.js (v14.0.0 or higher)
- npm (v6.0.0 or higher)
- Available port 4000 (configurable)

### Client Requirements
- Modern web browser (Chrome, Firefox, Safari, Edge)
- JavaScript enabled
- Minimum screen resolution: 1280x720

## Installation Guide

1. Clone the repository:
   ```bash
   git clone [repository-url]
   cd Simple_Hospital_System
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure the environment:
   - Copy `.env.example` to `.env`
   - Update the environment variables as needed

4. Start the server:
   ```bash
   npm start
   ```

The application will be available at `http://localhost:4000`

## Configuration

### Environment Variables

- `PORT`: Server port (default: 4000)
- `API_HOST`: API server host URL
- `DB_CONNECTION`: Database connection string
- `JWT_SECRET`: Secret key for JWT token generation
- `UPLOAD_DIR`: Directory for file uploads

### Directory Structure

```
Simple_Hospital_System/
├── api_routes/         # API route handlers
├── daemon/            # Background services
├── documentation/     # Project documentation
├── public/           # Static files
├── uploads/          # File upload directory
├── utility/          # Utility functions
├── index.html        # Main entry point
└── server.js         # Server configuration
```

## First-Time Setup

1. Create necessary directories:
   ```bash
   mkdir -p uploads
   ```

2. Set up the database:
   - Configure your database connection in `.env`
   - Run initial migrations (if applicable)

3. Create an admin account:
   - Use the provided admin creation script
   - Set up initial system configurations

## Verification

To verify the installation:

1. Start the server
2. Navigate to `http://localhost:4000`
3. Log in with the admin credentials
4. Check all main modules:
   - Users Management
   - Patient Records
   - Pharmacy
   - Laboratory
   - Radiology
   - Billing

## Troubleshooting

Common installation issues:

1. Port already in use:
   - Change the port in `.env`
   - Check for other services using port 4000

2. Dependencies issues:
   - Clear npm cache: `npm cache clean --force`
   - Delete node_modules and reinstall

3. Permission errors:
   - Ensure write permissions for uploads directory
   - Check file ownership and permissions

For more detailed troubleshooting, refer to the [Maintenance Guide](./maintenance.md). 