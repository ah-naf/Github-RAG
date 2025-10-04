# Github-RAG

A full-stack application for Retrieval-Augmented Generation (RAG) over GitHub repositories. The project consists of a Python FastAPI backend and an Angular frontend.

## Project Structure

```
backend/    # FastAPI backend
frontend/   # Angular frontend
```

---

## Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- npm 9+

---

## Backend Setup

1. **Install dependencies:**
   ```sh
   cd backend
   pip install -r requirements.txt
   ```

2. **Environment Variables:**
   Create a `.env` file in the `backend/` directory. Example:
   ```env
   GOOGLE_API_KEY="your_token"
    GITHUB_TOKEN = "your_token"
    LANGCHAIN_API_KEY = "your_key"
    LANGCHAIN_TRACING_V2 = "true"
    LANGCHAIN_PROJECT = "project_name"
   ```

3. **Start the backend server:**
   ```sh
   fastapi dev api.py
   ```
   The backend will run at `http://localhost:8000` by default.

---

## Frontend Setup

1. **Install dependencies:**
   ```sh
   cd frontend
   npm install
   ```

2. **Environment Variables:**
   - Edit `src/environments/environment.ts` and `src/environments/environment.development.ts` as needed.
   - Example:
     ```ts
     export const environment = {
       production: false,
       apiUrl: 'http://localhost:8000',
     };
     ```

3. **Start the frontend server:**
   ```sh
   ng serve
   ```
   The frontend will run at `http://localhost:4200` by default.

---

## Usage
- Open the frontend in your browser.
- Interact with the chat to ask questions about your GitHub repository.

---

## Required Environment Files
- `backend/.env` (see example above)
- `frontend/src/environments/environment.ts` (see example above)


