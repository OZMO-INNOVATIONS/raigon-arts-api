# Raigon Art - Complete Backend REST API & Supabase Storage
**Version:** 2.0.0 (Comprehensive Production Edition)  
**System:** Raigon Art Management System (Flutter Web Application)  
**Target:** 100% Complete Replacement of Firebase (Firestore, Storage, Auth) & Browser LocalStorage  

---

## 1. System Overview & Technology Stack

The Raigon Art Backend is an enterprise-grade REST API built using **TypeScript**, **Node.js**, **Express**, and **Supabase (PostgreSQL & Object Storage)**.

### Technology Stack:
* **Language & Runtime:** TypeScript, Node.js (v20+ / v25+)
* **Framework:** Express with Helmet, CORS, Morgan, and Compression
* **Database:** PostgreSQL 16 on **Supabase** (or direct connection via Connection Pooler with SSL)
* **Storage Vault:** **Supabase Storage** (`raigon-art-storage` bucket) with public CDN delivery & automatic fallback to local storage
* **Image Processing Engine:** **Sharp** (WebP 85% compression, auto-orientation, EXIF stripping, 300px thumbnail generation)
* **PDF Engine:** **PDFKit** (Automated generation of print-ready customer invoices & workshop job sheets)
* **Archiving Engine:** **Archiver** (Streaming bulk download of high-resolution order photos as `.zip`)
* **Authentication:** Stateless JWT (`Bearer`) with role-based access (`admin`, `staff`) & Refresh Token rotation
* **Messaging:** WhatsApp Cloud API for automated customer order confirmations and pickup status alerts

> 📖 **Full Endpoint Documentation & Examples:** See [API_DOCUMENTATION.md](file:///Users/jijin/Projects/raigon-api/API_DOCUMENTATION.md) for full request/response schemas, queries, and headers for all 27+ endpoints.
> 📮 **Postman / Thunder Client:** Import [raigon_art_api.postman_collection.json](file:///Users/jijin/Projects/raigon-api/raigon_art_api.postman_collection.json) to start testing immediately.

---

## 2. Architecture Diagram

```mermaid
graph TD
    subgraph Frontend["Flutter Web Client"]
        AuthUI["Auth Screen"]
        DashboardUI["Dashboard Screen"]
        CustomerUI["Customers & Orders Table"]
        AddOrderUI["Add/Edit Order Dialog"]
        ViewVaultUI["Customer Vault & Photo Viewer"]
        SizesUI["Frame Sizes Master"]
        ReportsUI["Reports & Revenue"]
    end

    subgraph BackendAPI["Node.js / Express / TypeScript REST API"]
        AuthRouter["/api/v1/auth"]
        CustomerRouter["/api/v1/customers"]
        StorageRouter["/api/v1/storage"]
        FrameSizeRouter["/api/v1/frame-sizes"]
        DashboardRouter["/api/v1/dashboard"]
        ReportsRouter["/api/v1/reports"]
        WhatsAppRouter["/api/v1/whatsapp"]
        SettingsRouter["/api/v1/settings"]
    end

    subgraph SupabaseDB["Supabase PostgreSQL 16"]
        UsersTbl[("users")]
        CustomersTbl[("customers")]
        PhotosTbl[("customer_photos")]
        FramesTbl[("customer_frames")]
        FrameSizesTbl[("frame_sizes_master")]
        SettingsTbl[("workshop_settings")]
        OtpTbl[("otp_tokens")]
    end

    subgraph SupabaseStorage["Supabase Storage Buckets"]
        BucketPhotos[("raigon-art-storage/customers/:id/photos/")]
        BucketThumbs[("raigon-art-storage/customers/:id/thumbnails/")]
    end

    Frontend -->|JWT Bearer Token / HTTPS| BackendAPI
    BackendAPI --> SupabaseDB
    BackendAPI -->|Sharp WebP Optimization & Presigned URLs| SupabaseStorage
    SupabaseStorage -->|CDN Public Asset Serving| Frontend
```

---

## 3. Getting Started

### 3.1 Install Dependencies
```bash
npm install
```

### 3.2 Environment Setup
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Configure your `.env` with your Supabase credentials:
```env
PORT=5001
NODE_ENV=development

# --- SUPABASE CONFIGURATION ---
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
SUPABASE_STORAGE_BUCKET=raigon-art-storage

# Direct PostgreSQL connection to Supabase (Database -> Connection string: URI)
DATABASE_URL=postgresql://postgres.your-project-id:your-password@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true

# --- JWT AUTHENTICATION ---
JWT_SECRET=your_jwt_secret_key_2026
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your_refresh_secret_key_2026
JWT_REFRESH_EXPIRES_IN=30d

# --- STORAGE MODE ---
STORAGE_MODE=supabase
```

### 3.3 Database Migrations & Seeding
You can run migrations and seed sample data in one command:
```bash
# Run PostgreSQL schema & storage policies
npm run migrate

# Seed default admin user, workshop profile, and frame sizes
npm run seed
```

*Alternatively, copy and paste the contents of `supabase/migrations/20261016_init_schema.sql` directly into your **Supabase Dashboard -> SQL Editor**.*

### 3.4 Run Automated Integration Tests
Runs a comprehensive test suite exercising all 27 endpoint scenarios:
```bash
npm test
```

### 3.5 Run the Development Server
```bash
npm run dev
```
The server will boot on `http://localhost:5001`.

### 3.6 Build for Production
```bash
npm run build
npm start
```

---

## 4. Default Seed Credentials

* **Admin Email:** `admin@gmail.com`
* **Admin Phone:** `8137922114`
* **Default Password:** `securePassword123` (or `admin123`)

---

## 5. Complete API Endpoint Reference Matrix

| # | Method | Endpoint | Description | Auth |
|:---|:---|:---|:---|:---|
| 1 | `POST` | `/api/v1/auth/login` | Staff / Admin JWT login (Email or Phone) | Public |
| 2 | `POST` | `/api/v1/auth/forgot-password` | Request password reset OTP | Public |
| 3 | `POST` | `/api/v1/auth/verify-otp` | Verify WhatsApp / SMS OTP | Public |
| 4 | `POST` | `/api/v1/auth/reset-password` | Update password with reset token | Public |
| 5 | `GET`  | `/api/v1/auth/me` | Fetch logged-in user profile | Bearer Token |
| 6 | `POST` | `/api/v1/auth/refresh` | Refresh expired access token | Public |
| 7 | `GET`  | `/api/v1/customers` | Paginated customer list with search & filters | Optional Token |
| 8 | `GET`  | `/api/v1/customers/next-id` | Get next serial order ID (`RA-1003`) | Optional Token |
| 9 | `GET`  | `/api/v1/customers/export/csv` | Download Excel-compatible CSV spreadsheet (UTF-8 BOM) | Optional Token |
| 10| `GET`  | `/api/v1/customers/:id` | Single customer details + photos + frame specs | Optional Token |
| 11| `POST` | `/api/v1/customers` | Create customer + upload photos (Multipart or JSON) | Optional Token |
| 12| `PUT`  | `/api/v1/customers/:id` | Update customer record & photos | Optional Token |
| 13| `PATCH`| `/api/v1/customers/:id/status` | Quick order status change (`pending`, `inProgress`, etc.) | Optional Token |
| 14| `PATCH`| `/api/v1/customers/:id/payment`| Quick payment / advance update | Optional Token |
| 15| `DELETE`| `/api/v1/customers/:id` | Delete customer & clean all storage files | Optional Token |
| 16| `GET`  | `/api/v1/customers/:id/invoice` | Generate & download PDF invoice / job card | Optional Token |
| 17| `GET`  | `/api/v1/customers/:id/photos/download-zip` | Bulk download order photos as ZIP archive | Optional Token |
| 18| `DELETE`| `/api/v1/customers/:id/photos/:photoId` | Delete specific photo from vault | Optional Token |
| 19| `POST` | `/api/v1/storage/upload` | Direct standalone photo upload (WebP + thumbnail) | Optional Token |
| 20| `GET`  | `/api/v1/frame-sizes` | List master frame sizes (`activeOnly=true\|false`) | Optional Token |
| 21| `POST` | `/api/v1/frame-sizes` | Add new frame size to catalog | Optional Token |
| 22| `PUT`  | `/api/v1/frame-sizes/:code` | Update frame size details | Optional Token |
| 23| `DELETE`| `/api/v1/frame-sizes/:code` | Delete frame size from catalog | Optional Token |
| 24| `GET`  | `/api/v1/dashboard/stats` | Dashboard KPIs, revenue, balance, status counts | Optional Token |
| 25| `GET`  | `/api/v1/reports/summary` | Revenue & sales report (`period=month1\|month2\|allTime`) | Optional Token |
| 26| `POST` | `/api/v1/whatsapp/send-order-confirmation` | Automated WhatsApp order confirmation message | Optional Token |
| 27| `POST` | `/api/v1/whatsapp/send-status-update` | Automated WhatsApp status update message | Optional Token |
| 28| `GET`  | `/api/v1/settings/profile` | Workshop profile & business hours | Optional Token |
| 29| `PUT`  | `/api/v1/settings/profile` | Update workshop profile details | Optional Token |

---

## 6. Supabase Storage Setup

The API uses the Supabase Storage bucket `raigon-art-storage` with the following directory structure:
```
raigon-art-storage/
├── customers/
│   ├── RA-1001/
│   │   ├── photos/
│   │   │   ├── photo_1.webp
│   │   │   └── photo_2.webp
│   │   └── thumbnails/
│   │       ├── photo_1_thumb.webp
│   │       └── photo_2_thumb.webp
└── standalone/
    ├── photos/
    └── thumbnails/
```

### Creating the Bucket in Supabase:
1. Go to your **Supabase Dashboard** -> **Storage**.
2. Click **New bucket**.
3. Set name: `raigon-art-storage`.
4. Turn on **Public bucket** toggle.
5. Click **Save**.

---

## 7. Flutter Web Client Integration

To connect the Flutter application to this backend, update your `CustomerRepository` using `http.MultipartRequest`:

```dart
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:raigon_art/features/customers/models/customer_model.dart';
import 'package:raigon_art/features/customers/repository/customer_repository.dart';

class HttpCustomerRepository implements CustomerRepository {
  HttpCustomerRepository({required this.baseUrl, this.token});

  final String baseUrl;
  final String? token;

  Map<String, String> get _headers => {
    'Accept': 'application/json',
    if (token != null) 'Authorization': 'Bearer $token',
  };

  @override
  Future<List<Customer>> getAll() async {
    final response = await http.get(
      Uri.parse('$baseUrl/api/v1/customers?limit=100'),
      headers: _headers,
    );

    if (response.statusCode != 200) {
      throw Exception('Failed to load customers: ${response.body}');
    }

    final json = jsonDecode(response.body);
    final list = json['data'] as List<dynamic>;

    return list
        .map((item) => Customer.fromJson(Map<String, dynamic>.from(item as Map)))
        .toList();
  }

  @override
  Future<void> upsert(Customer customer) async {
    final uri = Uri.parse('$baseUrl/api/v1/customers');
    final request = http.MultipartRequest('POST', uri);
    request.headers.addAll(_headers);

    // Send metadata as JSON in 'customerData' form-data field
    final jsonMeta = customer.toJson()..remove('photoBytes');
    request.fields['customerData'] = jsonEncode(jsonMeta);

    // Attach picked photos
    for (var i = 0; i < customer.photoBytes.length; i++) {
      final name = i < customer.photoNames.length
          ? customer.photoNames[i]
          : 'photo_$i.jpg';

      request.files.add(
        http.MultipartFile.fromBytes('photos', customer.photoBytes[i], filename: name),
      );
    }

    final streamed = await request.send();
    final response = await http.Response.fromStream(streamed);

    if (response.statusCode >= 300) {
      throw Exception('Failed to save customer: ${response.body}');
    }
  }

  @override
  Future<void> delete(String id) async {
    final response = await http.delete(
      Uri.parse('$baseUrl/api/v1/customers/$id'),
      headers: _headers,
    );

    if (response.statusCode != 200) {
      throw Exception('Failed to delete customer: ${response.body}');
    }
  }
}
```
