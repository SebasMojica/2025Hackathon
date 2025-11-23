# Virtual Try-On Fashion App

A web application that suggests clothing based on purchase history and wardrobe, allows users to swipe through outfit suggestions, customize outfits, and virtually "try on" outfits using fal.ai.

## Features

- 📸 Upload user photo for virtual try-on
- 👔 Upload and manage wardrobe items
- 🎯 AI-powered outfit suggestions based on wardrobe and purchase history
- 👆 Swipe interface (left to dislike, right to like)
- ✏️ Customize outfits by swapping items and changing colors
- 🎨 Virtual try-on using fal.ai integration

## Tech Stack

- **Frontend**: Vite + React + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **AI Service**: fal.ai API
- **Storage**: JSON file-based storage

## Setup Instructions

### Prerequisites

- Node.js (v20.18.2 or higher recommended)
- npm
- fal.ai API key

### Installation

1. **Clone the repository** (if applicable)

2. **Install frontend dependencies**:
   ```bash
   cd frontend
   npm install
   ```

3. **Install backend dependencies**:
   ```bash
   cd ../backend
   npm install
   ```

4. **Set up environment variables**:
   
   Create a `.env` file in the `backend` directory:
   ```env
   FAL_API_KEY=your_fal_api_key_here
   PORT=3001
   FRONTEND_URL=http://localhost:5173
   ```

### Running the Application

1. **Start the backend server**:
   ```bash
   cd backend
   npm run dev
   ```
   The backend will run on `http://localhost:3001`

2. **Start the frontend development server** (in a new terminal):
   ```bash
   cd frontend
   npm run dev
   ```
   The frontend will run on `http://localhost:5173`

3. **Open your browser** and navigate to `http://localhost:5173`

## Usage

1. **Upload Your Photo**: Start by uploading a photo of yourself on the home page
2. **Load Dataset** (Required for outfit suggestions): Download and load 200+ REAL clothing images from Kaggle:
   ```bash
   # First, set up Kaggle API:
   # 1. Install: pip install kaggle
   # 2. Get API token from https://www.kaggle.com/account
   # 3. Place kaggle.json in ~/.kaggle/
   
   cd backend
   npm run download-dataset
   # Then load into wardrobe:
   curl -X POST http://localhost:3001/api/dataset/load-into-wardrobe
   ```
3. **Add to Wardrobe**: Go to the Wardrobe page to upload clothing items with metadata
4. **Browse Outfits**: Navigate to the Outfits page to see AI-generated outfit suggestions
5. **Swipe**: Swipe left to dislike, right to like outfits
6. **Customize**: Click the customize button to swap items or change colors
7. **Try On**: View virtual try-on images with multiple angles (swipe up/down to see different angles)

## Project Structure

```
2025Hackathon/
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── services/      # API service layer
│   │   └── types/         # TypeScript type definitions
│   └── package.json
├── backend/
│   ├── src/
│   │   ├── routes/        # Express routes
│   │   ├── services/      # Business logic services
│   │   ├── data/          # JSON data storage
│   │   └── server.ts      # Express server
│   └── package.json
└── README.md
```

## API Endpoints

### User
- `GET /api/user` - Get user data
- `POST /api/user/photo` - Upload user photo

### Wardrobe
- `GET /api/wardrobe` - Get wardrobe items
- `POST /api/wardrobe` - Add wardrobe item
- `GET /api/wardrobe/purchase-history` - Get purchase history
- `POST /api/wardrobe/purchase-history` - Add to purchase history

### Outfits
- `GET /api/outfits/suggestions?count=5` - Get outfit suggestions
- `POST /api/outfits/swipe` - Record swipe action

### fal.ai
- `POST /api/fal/try-on` - Generate virtual try-on image

## Notes

- The fal.ai integration uses placeholder endpoints. You'll need to update the `falService.ts` with the correct fal.ai model endpoints based on their API documentation.
- Images are stored in the `backend/uploads` directory
- Data is persisted in JSON files in `backend/src/data/`

## Development

- Frontend hot-reloads on changes
- Backend uses `tsx watch` for hot-reload
- TypeScript is used throughout for type safety

## License

MIT
