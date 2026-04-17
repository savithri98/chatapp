# ChatApp – Full-Stack Real-Time Messaging

A production-ready WhatsApp-like real-time chat application built with the MERN stack and Socket.IO.

## 🚀 Features

- **Real-Time Messaging**: Instant message delivery using Socket.IO.
- **WhatsApp-style UI**: Clean, responsive layout with a dark/light mode friendly dark theme.
- **Authentication**: Secure JWT-based login and signup with password hashing (bcrypt).
- **Online/Offline Status**: Real-time user presence indicators.
- **Typing Indicator**: Native-feeling "User is typing..." animations.
- **Read Receipts**: Single tick (sent), double blue tick (seen).
- **Image Sharing**: Upload images directly into chats via Cloudinary.
- **User Search**: Search and start new conversations with any registered user.
- **Message History**: Persistent conversation history stored in MongoDB.

## 🛠️ Tech Stack

- **Frontend**: React, Tailwind CSS, Vite, Zustand (State Management), Socket.IO Client.
- **Backend**: Node.js, Express, Socket.IO, MongoDB (Mongoose), JWT.
- **Storage**: Cloudinary (for images).

---

## 💻 Local Setup

### 1. Prerequisites
- Node.js installed on your machine.
- MongoDB (Local instance or MongoDB Atlas).
- Cloudinary Account (for image uploads).

### 2. Backend Configuration
1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on `.env.example`:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   CLIENT_URL=http://localhost:5173
   ```
4. Start the server:
   ```bash
   npm run dev
   ```

### 3. Frontend Configuration
1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file:
   ```env
   VITE_API_URL=http://localhost:5000/api
   VITE_SOCKET_URL=http://localhost:5000
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

---

## 📂 Folder Structure

- `/backend`: Express API, Socket.IO handler, and Mongoose models.
- `/frontend`: React application, UI components, and state management.

## 🚢 Deployment

### 1. Frontend (Vercel)
1. Push your code to a **GitHub** repository.
2. Go to [Vercel](https://vercel.com) and click **"New Project"**.
3. Import your repository and select the `frontend` folder as the **Root Directory**.
4. **Environment Variables**: Add `VITE_API_URL` and `VITE_SOCKET_URL` (set these to your Render backend URL).
5. The `vercel.json` I created will handle the routing automaticallly.

### 2. Backend (Render)
1. Log in to [Render.com](https://render.com).
2. Click **"New"** -> **"Web Service"**.
3. Connect your GitHub repo and select the `backend` folder as the **Root Directory**.
4. **Settings**:
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
5. **Environment Variables**: Add all variables from your `.env` (MONGO_URI, JWT_SECRET, CLOUDINARY, CLIENT_URL).
   - *Note*: Set `CLIENT_URL` to your Vercel frontend URL.

### 3. Database (MongoDB Atlas)
- Ensure your MongoDB Atlas IP Whitelist allows requests from your backend provider (or set to `0.0.0.0/0` for testing).

---

## 📝 License
This project is open-source and available under the MIT License.
