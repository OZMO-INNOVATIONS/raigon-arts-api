# Raigon Art - Complete REST API Documentation & Data Contracts
**Version:** 2.0.0 (Comprehensive Production Edition)  
**Base URL (Local):** `http://localhost:5001`  
**Base Path:** `/api/v1`  
**Authentication Scheme:** HTTP Bearer JWT Token (`Authorization: Bearer <token>`)

---

## Table of Contents
1. [General API Standards & Headers](#1-general-api-standards--headers)
2. [Module 1: Authentication & Staff Management](#2-module-1-authentication--staff-management)
3. [Module 2: Customers & Order Management](#3-module-2-customers--order-management)
4. [Module 3: Storage & Photo Vault](#4-module-3-storage--photo-vault)
5. [Module 4: Frame Sizes Master Catalog](#5-module-4-frame-sizes-master-catalog)
6. [Module 5: Dashboard & Analytics](#6-module-5-dashboard--analytics)
7. [Module 6: Reports & Exports](#7-module-6-reports--exports)
8. [Module 7: WhatsApp Automations](#8-module-7-whatsapp-automations)
9. [Module 8: Workshop Settings & Profile](#9-module-8-workshop-settings--profile)
10. [System Health Check](#10-system-health-check)
11. [Standard Error Responses](#11-standard-error-responses)

---

## 1. General API Standards & Headers

### Request Headers
* **Standard JSON Endpoints:**  
  `Content-Type: application/json`  
  `Accept: application/json`
* **Multipart File Uploads:**  
  `Content-Type: multipart/form-data`
* **Protected Endpoints:**  
  `Authorization: Bearer <jwt_access_token>`

### Standard Success Response Envelope
```json
{
  "success": true,
  "data": { ... }
}
```

### Standard Error Response Envelope
```json
{
  "success": false,
  "message": "Descriptive human-readable error message.",
  "errors": [
    { "field": "phone", "message": "Valid phone number required" }
  ]
}
```

---

## 2. Module 1: Authentication & Staff Management

### 1.1 Login (Staff / Admin)
Authenticates a user using email address or 10-digit phone number and returns JWT access + refresh tokens.

* **Method:** `POST`
* **URL:** `/api/v1/auth/login`
* **Access:** Public
* **Request Body (`application/json`):**
```json
{
  "identifier": "admin@gmail.com",
  "password": "securePassword123"
}
```
* **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImU0YjE3YjYyLTYwMjktNGQ2NC04M2IxLTNlNGIzYzA3NjU5MSIsIm5hbWUiOiJSYWlnb24gQWRtaW4iLCJlbWFpbCI6ImFkbWluQGdtYWlsLmNvbSIsInBob25lIjoiODEzNzkyMjExNCIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc2MDYzNzg1MCwiZXhwIjoxNzYxMjQyNjUwfQ.example_signature",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImU0YjE3YjYyLTYwMjktNGQ2NC04M2IxLTNlNGIzYzA3NjU5MSIsImlhdCI6MTc2MDYzNzg1MCwiZXhwIjoxNzYzMjI5ODUwfQ.example_refresh",
    "user": {
      "id": "e4b17b62-6029-4d64-83b1-3e4b3c076591",
      "name": "Raigon Admin",
      "email": "admin@gmail.com",
      "phone": "8137922114",
      "role": "admin"
    }
  }
}
```

---

### 1.2 Request Password Reset OTP
Sends a one-time verification code to the registered phone number via WhatsApp / SMS.

* **Method:** `POST`
* **URL:** `/api/v1/auth/forgot-password`
* **Access:** Public
* **Request Body (`application/json`):**
```json
{
  "phone": "8137922114"
}
```
* **Response (200 OK):**
```json
{
  "success": true,
  "message": "OTP sent to registered WhatsApp number.",
  "devOtp": "7762"
}
```

---

### 1.3 Verify Reset OTP
Verifies the OTP code received on WhatsApp and returns a signed `resetToken`.

* **Method:** `POST`
* **URL:** `/api/v1/auth/verify-otp`
* **Access:** Public
* **Request Body (`application/json`):**
```json
{
  "phone": "8137922114",
  "otp": "7762"
}
```
* **Response (200 OK):**
```json
{
  "success": true,
  "resetToken": "otp_verified_94a8c9b20e18f273"
}
```

---

### 1.4 Reset Password
Updates the staff member's password using the verified `resetToken`.

* **Method:** `POST`
* **URL:** `/api/v1/auth/reset-password`
* **Access:** Public
* **Request Body (`application/json`):**
```json
{
  "phone": "8137922114",
  "resetToken": "otp_verified_94a8c9b20e18f273",
  "newPassword": "newSecretPassword123"
}
```
* **Response (200 OK):**
```json
{
  "success": true,
  "message": "Password updated successfully."
}
```

---

### 1.5 Get Current User Profile (`/me`)
Returns the currently authenticated user's session profile.

* **Method:** `GET`
* **URL:** `/api/v1/auth/me`
* **Headers:** `Authorization: Bearer <token>`
* **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "e4b17b62-6029-4d64-83b1-3e4b3c076591",
    "name": "Raigon Admin",
    "email": "admin@gmail.com",
    "phone": "8137922114",
    "role": "admin"
  }
}
```

---

### 1.6 Refresh Access Token
Issues a new JWT access token and refresh token without requiring re-login.

* **Method:** `POST`
* **URL:** `/api/v1/auth/refresh`
* **Access:** Public
* **Request Body (`application/json`):**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```
* **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.new_access_token...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.new_refresh_token..."
  }
}
```

---

## 3. Module 2: Customers & Order Management

### 2.1 Get All Customers (with Filters, Search & Pagination)
Retrieves a paginated list of customers along with live status breakdowns.

* **Method:** `GET`
* **URL:** `/api/v1/customers`
* **Query Parameters:**
  * `search` *(string)*: Searches Customer ID (e.g., `RA-1001`), Name, or Phone.
  * `status` *(string)*: `pending`, `inProgress`, `completed`, `cancelled`.
  * `paymentStatus` *(string)*: `Unpaid`, `Partial`, `Paid`.
  * `startDate` *(string, `YYYY-MM-DD` or ISO 8601)*: Filter orders on or after this date (`00:00:00.000Z`).
  * `endDate` *(string, `YYYY-MM-DD` or ISO 8601)*: Filter orders on or before this date. Date strings (e.g. `2026-10-23`) automatically include the full day up to `23:59:59.999Z` so orders placed on the current day are not truncated.
  * `page` *(number, default: 1)*
  * `limit` *(number, default: 10)*
  * `sortBy` *(string, default: "orderDate")*
  * `sortOrder` *(string, default: "desc")*
* **Response (200 OK):**
```json
{
  "success": true,
  "meta": {
    "total": 2,
    "page": 1,
    "limit": 10,
    "totalPages": 1,
    "statusCounts": {
      "all": 2,
      "pending": 1,
      "inProgress": 1,
      "completed": 0,
      "cancelled": 0
    }
  },
  "data": [
    {
      "id": "RA-1001",
      "name": "Ananthu Krishnan",
      "city": "Trivandrum",
      "phone": "9876543210",
      "altPhone": "9876543211",
      "address": "TC 14/230, Kowdiar, Trivandrum",
      "pincode": "695003",
      "photoCount": 2,
      "photoNames": [
        "Family_Portrait.jpg",
        "Painting.jpg"
      ],
      "photoUrls": [
        "https://nhqewkbztfmlophtzqmk.supabase.co/storage/v1/object/public/raigon-art-storage/customers/RA-1001/photos/Family_Portrait.webp",
        "https://nhqewkbztfmlophtzqmk.supabase.co/storage/v1/object/public/raigon-art-storage/customers/RA-1001/photos/Painting.webp"
      ],
      "photoSizeLabels": [
        "2.4 MB",
        "3.1 MB"
      ],
      "frameSize": "12 × 18 inch",
      "frameType": "Teak Wood Moulding",
      "qty": 2,
      "total": 4500,
      "advance": 2000,
      "balance": 2500,
      "paymentStatus": "Partial",
      "status": "inProgress",
      "orderDate": "2026-10-15T00:00:00.000Z",
      "expectedDelivery": "2026-10-22T00:00:00.000Z",
      "frames": [
        {
          "id": "f1837482-9428-4ef3-8419-f01837264819",
          "size": "12 × 18 inch",
          "unit": "Inch",
          "customWidth": "",
          "customHeight": "",
          "frameType": "Teak Wood Moulding",
          "material": "Teak Wood Moulding",
          "finish": "Walnut Brown",
          "orientation": "Landscape (Horizontal)",
          "qty": 2,
          "notes": "Anti-glare acrylic sheet required",
          "photoName": "Family_Portrait.jpg",
          "photoUrl": "https://nhqewkbztfmlophtzqmk.supabase.co/storage/v1/object/public/raigon-art-storage/customers/RA-1001/frames/frame_1.webp"
        }
      ],
      "createdAt": "2026-10-15T00:00:00.000Z",
      "updatedAt": "2026-10-15T00:00:00.000Z"
    }
  ]
}
```

---

### 2.2 Get Next Order ID
Computes the next sequential serial ID formatted as `RA-XXXX`.

* **Method:** `GET`
* **URL:** `/api/v1/customers/next-id`
* **Response (200 OK):**
```json
{
  "success": true,
  "nextId": "RA-1003"
}
```

---

### 2.3 Get Single Customer Details by ID
* **Method:** `GET`
* **URL:** `/api/v1/customers/:id` (e.g., `/api/v1/customers/RA-1001`)
* **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "RA-1001",
    "name": "Ananthu Krishnan",
    "city": "Trivandrum",
    "phone": "9876543210",
    "altPhone": "9876543211",
    "address": "TC 14/230, Kowdiar, Trivandrum",
    "pincode": "695003",
    "photoCount": 2,
    "photoNames": ["Family_Portrait.jpg", "Painting.jpg"],
    "photoUrls": [
      "https://nhqewkbztfmlophtzqmk.supabase.co/storage/v1/object/public/raigon-art-storage/customers/RA-1001/photos/Family_Portrait.webp",
      "https://nhqewkbztfmlophtzqmk.supabase.co/storage/v1/object/public/raigon-art-storage/customers/RA-1001/photos/Painting.webp"
    ],
    "photoSizeLabels": ["2.4 MB", "3.1 MB"],
    "frameSize": "12 × 18 inch",
    "frameType": "Teak Wood Moulding",
    "qty": 2,
    "total": 4500,
    "advance": 2000,
    "balance": 2500,
    "paymentStatus": "Partial",
    "status": "inProgress",
    "orderDate": "2026-10-15T00:00:00.000Z",
    "expectedDelivery": "2026-10-22T00:00:00.000Z",
    "frames": [ ... ]
  }
}
```

---

### 2.4 Create New Customer (Multipart with Direct Photo Upload)
Creates an order with optional file attachments for customer vault and individual frame specs. The backend converts images to WebP (85% quality, EXIF stripped) and creates 300px thumbnail versions automatically.

* **Method:** `POST`
* **URL:** `/api/v1/customers`
* **Headers:** `Content-Type: multipart/form-data`
* **Form-Data Fields:**
  * `customerData` *(stringified JSON)*:
```json
{
  "id": "RA-1003",
  "name": "Vipin Das",
  "city": "Calicut",
  "phone": "9847112233",
  "altPhone": "",
  "address": "Mavoor Road, Calicut",
  "pincode": "673004",
  "total": 6500,
  "advance": 3000,
  "status": "pending",
  "orderDate": "2026-10-16T00:00:00.000Z",
  "expectedDelivery": "2026-10-25T00:00:00.000Z",
  "frames": [
    {
      "size": "16 × 24 inch",
      "unit": "Inch",
      "customWidth": "",
      "customHeight": "",
      "frameType": "Gold Antique Ornate",
      "material": "Synthetic Moulding",
      "finish": "Antique Gold",
      "orientation": "Landscape (Horizontal)",
      "qty": 1,
      "notes": "Glass protection sheet required",
      "photoName": "scenery.jpg"
    }
  ]
}
```
  * `photos` *(file array)*: Binary photos to store in the order vault.
  * `frame_photos` *(file array, optional)*: Specific frame photos.
* **Alternative:** If no images are sent, this endpoint also accepts `Content-Type: application/json` directly with the JSON body above.
* **Response (201 Created):** Full created customer object with CDN URLs.

---

### 2.5 Update Customer
Updates customer metadata and optionally appends newly uploaded photos.

* **Method:** `PUT`
* **URL:** `/api/v1/customers/:id` (e.g., `/api/v1/customers/RA-1003`)
* **Content-Type:** `multipart/form-data` or `application/json`
* **Request Body:** Same schema as Create.
* **Response (200 OK):** Updated customer record.

---

### 2.6 Quick Status Change
One-click order progress status update from the table or dashboard.

* **Method:** `PATCH`
* **URL:** `/api/v1/customers/:id/status`
* **Request Body (`application/json`):**
```json
{
  "status": "completed"
}
```
*Allowed values:* `pending`, `inProgress`, `completed`, `cancelled`.
* **Response (200 OK):**
```json
{
  "success": true,
  "id": "RA-1003",
  "status": "completed",
  "updatedAt": "2026-10-16T17:35:00.000Z"
}
```

---

### 2.7 Quick Payment Update
Records received advance / final payment and automatically re-calculates the balance.

* **Method:** `PATCH`
* **URL:** `/api/v1/customers/:id/payment`
* **Request Body (`application/json`):**
```json
{
  "advance": 6500,
  "paymentStatus": "Paid"
}
```
* **Response (200 OK):**
```json
{
  "success": true,
  "id": "RA-1003",
  "advance": 6500,
  "balance": 0,
  "paymentStatus": "Paid",
  "updatedAt": "2026-10-16T17:36:00.000Z"
}
```

---

### 2.8 Delete Customer
Cascades delete in the database and cleans all uploaded files from Supabase Storage.

* **Method:** `DELETE`
* **URL:** `/api/v1/customers/:id`
* **Response (200 OK):**
```json
{
  "success": true,
  "message": "Customer RA-1003 deleted."
}
```

---

### 2.9 Delete Specific Customer Photo
Removes an individual image from a customer's vault without deleting the entire order.

* **Method:** `DELETE`
* **URL:** `/api/v1/customers/:id/photos/:photoId`
* **Response (200 OK):**
```json
{
  "success": true,
  "message": "Photo deleted."
}
```

---

### 2.10 Bulk Download Order Photos as ZIP Archive
Streams a zipped package containing all high-resolution photos for production and printing staff in one click.

* **Method:** `GET`
* **URL:** `/api/v1/customers/:id/photos/download-zip`
* **Headers:**  
  `Content-Type: application/zip`  
  `Content-Disposition: attachment; filename="RA-1001_photos.zip"`
* **Response:** Binary ZIP file stream.

---

### 2.11 Generate Print-Ready Customer Invoice PDF
Generates a PDF workshop job sheet & customer invoice containing customer details, frame specs, notes, and balance due.

* **Method:** `GET`
* **URL:** `/api/v1/customers/:id/invoice`
* **Headers:**  
  `Content-Type: application/pdf`  
  `Content-Disposition: inline; filename="Invoice_RA-1001.pdf"`
* **Response:** Binary PDF document stream.

---

### 2.12 Export All Customers to Excel-Compatible CSV
Exports all customer records into a CSV spreadsheet formatted with UTF-8 Byte Order Mark (`\uFEFF`) for compatibility with Excel, Google Sheets, and Apple Numbers.

* **Method:** `GET`
* **URL:** `/api/v1/customers/export/csv`
* **Headers:**  
  `Content-Type: text/csv; charset=utf-8`  
  `Content-Disposition: attachment; filename="customers_export_2026-10-16.csv"`
* **Response:** CSV data.

---

## 4. Module 3: Storage & Photo Vault

### 3.1 Standalone Photo Upload
Uploads any single image, converts it to WebP, generates a 300px thumbnail, and uploads both to Supabase Storage.

* **Method:** `POST`
* **URL:** `/api/v1/storage/upload`
* **Headers:** `Content-Type: multipart/form-data`
* **Form-Data:** `file` *(Binary image)*
* **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "fileName": "sample_artwork.webp",
    "fileUrl": "https://nhqewkbztfmlophtzqmk.supabase.co/storage/v1/object/public/raigon-art-storage/standalone/photos/sample_artwork.webp",
    "thumbnailUrl": "https://nhqewkbztfmlophtzqmk.supabase.co/storage/v1/object/public/raigon-art-storage/standalone/thumbnails/sample_artwork_thumb.webp",
    "sizeBytes": 1420500,
    "mimeType": "image/webp"
  }
}
```

---

## 5. Module 4: Frame Sizes Master Catalog

### 4.1 List Frame Sizes
Retrieves all master frame sizes. The `orders` and `ordersCount` fields are **dynamically aggregated in real-time** from active customer orders (`customers` and `customer_frames`), matching size codes, labels, and dimensions.

* **Method:** `GET`
* **URL:** `/api/v1/frame-sizes`
* **Query Parameters:** `activeOnly=true|false`
* **Order Count Rules:**
  * Excludes cancelled orders (`status !== 'cancelled'`).
  * Deduplicates multiple frame items in the same order (each order is counted at most once per frame size).
  * Returns `0` when no orders match (no dummy or hardcoded seed values).
  * Automatically synced when orders are created, updated, status changed, or deleted.
* **Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "code": "FS-01",
      "name": "4 × 6 inch",
      "width": 4.0,
      "height": 6.0,
      "unit": "Inch",
      "category": "Standard",
      "orders": 1,
      "ordersCount": 1,
      "active": true,
      "isActive": true,
      "sortOrder": 1
    },
    {
      "code": "FS-03",
      "name": "6 × 8 inch",
      "width": 6.0,
      "height": 8.0,
      "unit": "Inch",
      "category": "Standard",
      "orders": 0,
      "ordersCount": 0,
      "active": true,
      "isActive": true,
      "sortOrder": 3
    },
    {
      "code": "FS-08",
      "name": "12 × 18 inch (A3)",
      "width": 12.0,
      "height": 18.0,
      "unit": "Inch",
      "category": "Standard",
      "orders": 1,
      "ordersCount": 1,
      "active": true,
      "isActive": true,
      "sortOrder": 8
    }
  ]
}
```

---

### 4.2 Add Frame Size
* **Method:** `POST`
* **URL:** `/api/v1/frame-sizes`
* **Request Body (`application/json`):**
```json
{
  "code": "FS-14",
  "name": "30 × 40 inch Poster",
  "width": 30.0,
  "height": 40.0,
  "unit": "Inch",
  "category": "Large",
  "active": true
}
```
* **Response (201 Created):** Created frame size object.

---

### 4.3 Update Frame Size
* **Method:** `PUT`
* **URL:** `/api/v1/frame-sizes/:code` (e.g., `/api/v1/frame-sizes/FS-14`)
* **Request Body (`application/json`):**
```json
{
  "name": "30 × 40 inch Gallery Canvas",
  "category": "Canvas"
}
```
* **Response (200 OK):** Updated frame size object.

---

### 4.4 Delete Frame Size
* **Method:** `DELETE`
* **URL:** `/api/v1/frame-sizes/:code`
* **Response (200 OK):**
```json
{
  "success": true,
  "message": "Frame size 'FS-14' deleted successfully."
}
```

---

## 6. Module 5: Dashboard & Analytics

### 5.1 Dashboard Summary Statistics
Fetches real-time counts, revenue, outstanding balances, and recent orders.

* **Method:** `GET`
* **URL:** `/api/v1/dashboard/stats`
* **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "totalCustomers": 142,
    "totalRevenue": 482500,
    "totalAdvance": 380000,
    "pendingBalance": 102500,
    "statusCounts": {
      "pending": 18,
      "inProgress": 35,
      "completed": 82,
      "cancelled": 7
    },
    "recentOrders": [
      {
        "id": "RA-1042",
        "name": "Vinod Kumar",
        "phone": "9847012345",
        "frameSize": "12 × 18 inch",
        "frameType": "Teak Wood Moulding",
        "qty": 1,
        "total": 3500,
        "status": "pending",
        "orderDate": "2026-10-16T00:00:00.000Z"
      }
    ]
  }
}
```

---

## 7. Module 6: Reports & Exports

### 6.1 Revenue & Sales Report
Calculates order velocity, revenue, top-selling frame sizes, status breakdowns, and a time-series **Sales Trajectory** through the current date.

* **Method:** `GET`
* **URL:** `/api/v1/reports/summary`
* **Query Parameters:**
  * `period` *(string, optional, default: `"month1"`)*:
    * `month1`: Last 30 Days (window spanning from 29 days prior through current date `today`).
    * `month2`: Last 60 Days (window spanning from 59 days prior through current date `today`).
    * `allTime`: All-time historical metrics.
* **Business Rules:**
  * Billable metrics (`orderCount`, `grossSales`, `advanceCollected`, `outstandingBalance`, `topSellingSizes`) and `salesTrajectory` strictly exclude cancelled orders (`status !== 'cancelled'`).
  * `statusBreakdown` tracks all orders in the window, including `cancelled`.
  * `salesTrajectory.labels` dynamically include date checkpoints terminating on the current date (`today`). For `month1` (30 days), 7 dynamic checkpoints (e.g. `['Sep 24', 'Sep 29', 'Oct 04', 'Oct 09', 'Oct 14', 'Oct 19', 'Oct 23']`).
  * `salesTrajectory.dailyData` provides a continuous day-by-day series for every single day in the period, cleanly setting days with no orders to `revenue: 0` and `orderCount: 0`.
* **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "period": "month1",
    "orderCount": 7,
    "grossSales": 107700,
    "advanceCollected": 25200,
    "outstandingBalance": 82500,
    "topSellingSizes": [
      {
        "size": "5 × 7 inch",
        "count": 1,
        "revenue": 50000
      },
      {
        "size": "4 × 6 inch",
        "count": 1,
        "revenue": 50000
      },
      {
        "size": "12 × 18 inch",
        "count": 2,
        "revenue": 4500
      },
      {
        "size": "8 × 12 inch",
        "count": 1,
        "revenue": 3200
      }
    ],
    "statusBreakdown": {
      "completed": 1,
      "inProgress": 5,
      "pending": 1,
      "cancelled": 0
    },
    "salesTrajectory": {
      "startDate": "2026-09-24",
      "endDate": "2026-10-23",
      "labels": [
        "Sep 24",
        "Sep 29",
        "Oct 04",
        "Oct 09",
        "Oct 14",
        "Oct 19",
        "Oct 23"
      ],
      "values": [
        0,
        0,
        0,
        0,
        0,
        0,
        107700
      ],
      "dailyData": [
        { "date": "2026-09-24", "revenue": 0, "orderCount": 0 },
        { "date": "2026-10-21", "revenue": 4500, "orderCount": 1 },
        { "date": "2026-10-22", "revenue": 103200, "orderCount": 6 },
        { "date": "2026-10-23", "revenue": 0, "orderCount": 0 }
      ]
    }
  }
}
```

---

## 8. Module 7: WhatsApp Automations

### 7.1 Send Order Confirmation Message
Dispatches an order confirmation via the WhatsApp Cloud API with full billing and pickup breakdown.

* **Method:** `POST`
* **URL:** `/api/v1/whatsapp/send-order-confirmation`
* **Request Body (`application/json`):**
```json
{
  "customerId": "RA-1001"
}
```
* **Response (200 OK):**
```json
{
  "success": true,
  "messageId": "wamid.HBgLOTEmvb8rqu43qk73k",
  "status": "sent"
}
```

---

### 7.2 Send Status Update (Pickup Notification)
Dispatches a notification to the customer when the order is ready for collection or out for delivery.

* **Method:** `POST`
* **URL:** `/api/v1/whatsapp/send-status-update`
* **Request Body (`application/json`):**
```json
{
  "customerId": "RA-1001",
  "status": "completed",
  "customNote": "Your frames are packed and ready for pickup at our MG Road workshop!"
}
```
* **Response (200 OK):**
```json
{
  "success": true,
  "messageId": "wamid.HBgLOTEmvb8rqubb8f624",
  "status": "sent"
}
```

---

## 9. Module 8: Workshop Settings & Profile

### 8.1 Get Workshop Profile
* **Method:** `GET`
* **URL:** `/api/v1/settings/profile`
* **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "businessName": "Raigon Arts",
    "tagline": "Photo Frames & Custom Framing",
    "businessPhone": "8137922114",
    "businessEmail": "orders@raigonarts.com",
    "workshopAddress": "Main Workshop, MG Road, Trivandrum",
    "gstin": "32AAAAA0000A1Z5",
    "businessHours": [
      {
        "day": "Monday - Saturday",
        "hours": "9:30 AM – 8:00 PM"
      },
      {
        "day": "Sunday",
        "hours": "Closed"
      }
    ]
  }
}
```

---

### 8.2 Update Workshop Profile
* **Method:** `PUT`
* **URL:** `/api/v1/settings/profile`
* **Request Body (`application/json`):**
```json
{
  "tagline": "Fine Art Prints & Custom Framing",
  "businessPhone": "8137922114",
  "workshopAddress": "Main Workshop, MG Road, Trivandrum"
}
```
* **Response (200 OK):** Updated workshop profile object.

---

### 8.3 Get Global Data Retention Policy & Status
Fetches the current data retention period (default 45 days), status, cutoff date, and count of records eligible for purging.

* **Method:** `GET`
* **URL:** `/api/v1/settings/retention`
* **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "retentionDays": 45,
    "autoCleanupEnabled": true,
    "retentionTarget": "all",
    "cutoffDate": "2026-09-01T17:45:00.000Z",
    "eligibleCustomersCount": 4,
    "eligiblePhotosCount": 8
  }
}
```

---

### 8.4 Update Global Data Retention Policy
Allows updating the retention days globally (e.g. change from 45 to 30 or 60 days). Takes effect across the whole application immediately.

* **Method:** `PUT`
* **URL:** `/api/v1/settings/retention`
* **Request Body (`application/json`):**
```json
{
  "days": 45,
  "enabled": true,
  "target": "all"
}
```
*Field Options:*
- `days` *(number)*: Number of retention days before auto-purge (e.g. 45, 60, 90).
- `enabled` *(boolean)*: `true` to run automatic background purge every 24 hours.
- `target` *(string)*: `'all'` (deletes order records + photos) or `'photos_only'` (purges storage images but keeps order invoice ledger).
* **Response (200 OK):**
```json
{
  "success": true,
  "message": "Global retention policy updated. Data older than 45 days will be automatically purged.",
  "data": {
    "retentionDays": 45,
    "autoCleanupEnabled": true,
    "retentionTarget": "all",
    "cutoffDate": "2026-09-01T17:45:00.000Z",
    "eligibleCustomersCount": 4,
    "eligiblePhotosCount": 8
  }
}
```

---

### 8.5 Trigger Manual Data Cleanup
Executes immediate purging of expired records and their storage photos without waiting for the daily background scheduler.

* **Method:** `POST`
* **URL:** `/api/v1/settings/cleanup/trigger`
* **Request Body (`application/json`, optional):**
```json
{
  "days": 45
}
```
* **Response (200 OK):**
```json
{
  "success": true,
  "message": "Cleanup completed. Purged 4 customers and 8 photos older than 45 days.",
  "data": {
    "success": true,
    "purgedCustomers": 4,
    "purgedPhotos": 8,
    "retentionDays": 45,
    "cutoffDate": "2026-09-01T17:45:00.000Z",
    "executedAt": "2026-10-16T17:46:00.000Z"
  }
}
```

---

## 10. System Health Check

### 10.1 Health Status
* **Method:** `GET`
* **URL:** `/health` (or `/`)
* **Response (200 OK):**
```json
{
  "success": true,
  "name": "Raigon Art Backend REST API",
  "version": "2.0.0",
  "status": "ONLINE",
  "storageMode": "supabase",
  "timestamp": "2026-10-16T17:38:00.000Z"
}
```

---

## 11. Standard Error Responses

| Status Code | Meaning | Example Payload |
|:---|:---|:---|
| `400 Bad Request` | Missing or invalid parameter / payload validation failed | `{"success": false, "message": "Validation failed", "errors": [{"field": "phone", "message": "Valid phone number required"}]}` |
| `401 Unauthorized` | Bearer token missing, invalid, or expired | `{"success": false, "message": "Access denied. Bearer token missing."}` |
| `403 Forbidden` | Insufficient role permission | `{"success": false, "message": "Forbidden. Administrator privileges required."}` |
| `404 Not Found` | Requested customer, frame size, or photo does not exist | `{"success": false, "message": "Customer with ID RA-9999 not found."}` |
| `409 Conflict` | Unique resource already exists (e.g. duplicate frame size code) | `{"success": false, "message": "Frame size with code 'FS-01' already exists."}` |
| `500 Internal Server Error`| Unexpected server-side failure | `{"success": false, "message": "Internal Server Error"}` |
