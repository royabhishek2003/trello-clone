# Taskify - Trello Clone

Taskify is a feature-rich, responsive project management application inspired by Trello. It allows users to create workspaces, boards, lists, and cards to organize tasks and collaborate effectively. 

## Features
- **Workspaces & Boards:** Organize projects into dedicated workspaces and multiple boards.
- **Drag & Drop:** Fully interactive drag-and-drop support for lists and cards using `@hello-pangea/dnd`.
- **Advanced Backgrounds:** Customize boards with colors, gradients, or beautiful images powered by the Unsplash API and custom AWS S3 uploads.
- **Rich Card Details:** Add descriptions, checklists, due dates, labels, and manage members on individual cards.
- **Attachments:** Upload files and images directly to cards (stored in AWS S3), or attach links.
- **Activity & Comments:** Track actions with detailed audit logs and communicate with team members using markdown-supported comments.
- **Responsive Design:** A polished, mobile-first design ensuring a smooth experience across desktop, tablet, and mobile screens.
- **Pro Subscriptions:** Integrated mock payment flows using Razorpay to upgrade to a "Pro" tier for premium features.

## Tech Stack

### Frontend
- **Framework:** React 18 (Bootstrapped with Vite)
- **Styling:** Tailwind CSS, Framer Motion (for smooth animations)
- **State Management:** Redux Toolkit
- **Routing:** React Router DOM
- **Drag & Drop:** `@hello-pangea/dnd`
- **Icons:** Lucide React
- **HTTP Client:** Axios

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (with Mongoose ORM)
- **Authentication:** JSON Web Tokens (JWT) & bcryptjs
- **File Storage:** AWS S3 (via `aws-sdk/client-s3` and `multer`)
- **Payments:** Razorpay (Test mode integration)

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB running locally or a MongoDB Atlas URI
- AWS Account (for S3 attachments)
- Unsplash Developer Account (for background images)
- Razorpay Account (for testing subscriptions)

### 1. Clone the repository
```bash
git clone <repository-url>
cd trello-clone
```

### 2. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` directory with the following variables:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key

# AWS S3 Configuration
AWS_REGION=your_aws_region
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_BUCKET_NAME=your_s3_bucket_name

# Razorpay Configuration
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```
Run the backend server:
```bash
npm run dev
```

### 3. Frontend Setup
Open a new terminal window and navigate to the frontend directory:
```bash
cd frontend
npm install
```
Create a `.env` file in the `frontend` directory with the following variables:
```env
VITE_API_URL=http://localhost:5000
VITE_UNSPLASH_ACCESS_KEY=your_unsplash_access_key
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
```
Start the Vite development server:
```bash
npm run dev
```

### 4. Open the App
Visit `http://localhost:5173` in your browser.

## Assumptions Made
1. **Public Read S3 Bucket:** It is assumed that the AWS S3 bucket is configured for public read access and has proper CORS policies enabled to allow the frontend to view uploaded attachments and custom backgrounds.
2. **Mock Subscriptions:** The Razorpay integration is currently using test keys. When upgrading to "Pro", the system mocks the payment verification endpoint to automatically grant Pro status to the organization without requiring real cryptographic signatures.
3. **Environment Isolation:** The backend runs on port 5000 and the frontend on port 5173. The frontend `VITE_API_URL` must match the backend's port.
4. **Unsplash API Limits:** The Unsplash free tier has rate limits (50 requests/hour). If images fail to load during board creation, it is likely due to hitting this development limit.
