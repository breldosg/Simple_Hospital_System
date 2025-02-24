# API Documentation

This document provides detailed information about the Simple Hospital System API endpoints.

## Authentication

### Login
- **Endpoint**: `/api/auth/login`
- **Method**: POST
- **Body**:
  ```json
  {
    "username": "string",
    "password": "string"
  }
  ```
- **Response**:
  ```json
  {
    "token": "jwt_token",
    "user": {
      "id": "string",
      "username": "string",
      "role": "string"
    }
  }
  ```

## Users Management

### Get Users
- **Endpoint**: `/api/users`
- **Method**: GET
- **Headers**: Authorization Bearer Token
- **Response**: List of users

### Create User
- **Endpoint**: `/api/users`
- **Method**: POST
- **Headers**: Authorization Bearer Token
- **Body**:
  ```json
  {
    "username": "string",
    "password": "string",
    "role": "string",
    "fullName": "string"
  }
  ```

## Patient Management

### Register Patient
- **Endpoint**: `/api/patient/register`
- **Method**: POST
- **Headers**: Authorization Bearer Token
- **Body**:
  ```json
  {
    "fullName": "string",
    "dateOfBirth": "date",
    "gender": "string",
    "contactInfo": {
      "phone": "string",
      "email": "string",
      "address": "string"
    }
  }
  ```

### Get Patient Records
- **Endpoint**: `/api/patient/:id`
- **Method**: GET
- **Headers**: Authorization Bearer Token

## Pharmacy Module

### Add Medication
- **Endpoint**: `/api/pharmacy/medication`
- **Method**: POST
- **Headers**: Authorization Bearer Token
- **Body**:
  ```json
  {
    "name": "string",
    "quantity": "number",
    "unit": "string",
    "price": "number"
  }
  ```

## Radiology Module

### Schedule Examination
- **Endpoint**: `/api/radiology/schedule`
- **Method**: POST
- **Headers**: Authorization Bearer Token
- **Body**:
  ```json
  {
    "patientId": "string",
    "examinationType": "string",
    "scheduledDate": "date",
    "notes": "string"
  }
  ```

## Laboratory Module

### Create Test Request
- **Endpoint**: `/api/laboratory/test`
- **Method**: POST
- **Headers**: Authorization Bearer Token
- **Body**:
  ```json
  {
    "patientId": "string",
    "testType": "string",
    "requestedBy": "string",
    "priority": "string"
  }
  ```

## Billing Module

### Create Invoice
- **Endpoint**: `/api/billing/invoice`
- **Method**: POST
- **Headers**: Authorization Bearer Token
- **Body**:
  ```json
  {
    "patientId": "string",
    "items": [
      {
        "description": "string",
        "amount": "number",
        "quantity": "number"
      }
    ]
  }
  ```

## Error Handling

All API endpoints follow a standard error response format:

```json
{
  "error": {
    "code": "string",
    "message": "string",
    "details": "object (optional)"
  }
}
```

Common error codes:
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

## Rate Limiting

API requests are limited to:
- 100 requests per minute for authenticated users
- 20 requests per minute for unauthenticated users

## Security

- All endpoints except login require JWT authentication
- Tokens expire after 24 hours
- HTTPS is required for all API calls
- Input validation is performed on all endpoints 