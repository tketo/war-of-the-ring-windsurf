# War of the Ring Game

A digital implementation of the War of the Ring board game, featuring a Node.js backend and React frontend.

## Project Structure

The project is organized into two main components:

- **war-of-the-ring-backend**: Node.js/Express.js server providing game logic and API endpoints
- **war-of-the-ring-frontend**: React.js client application for the user interface

## Tech Stack

### Backend
- Node.js with Express.js
- MongoDB with Mongoose ODM
- Socket.io for real-time communication
- JWT authentication
- Winston for logging

### Frontend
- React.js
- Socket.io client for real-time updates

## Getting Started

### Prerequisites
- Node.js (v14+)
- MongoDB

### Installation

1. Clone the repository:
```
git clone <repository-url>
cd war-of-the-ring
```

2. Install backend dependencies:
```
cd war-of-the-ring-backend
npm install
```

3. Install frontend dependencies:
```
cd ../war-of-the-ring-frontend
npm install
```

### Configuration

1. Create a `.env` file in the backend directory with the following variables:
```
PORT=3001
MONGODB_URI=mongodb://localhost:27017/war-of-the-ring
FRONTEND_URL=http://localhost:3000
```

### Running the Application

1. Start the backend server:
```
cd war-of-the-ring-backend
npm run dev
```

2. Start the frontend application:
```
cd war-of-the-ring-frontend
npm start
```

## Testing

### Backend Tests
```
cd war-of-the-ring-backend
npm test
```

## API Documentation

The backend provides the following main API endpoints:

- `POST /game/start`: Initialize a new game
- `POST /game/move`: Process game moves
- `GET /game/state`: Retrieve the current game state
- `POST /game/save` and `POST /game/load`: Handle game state persistence
- `POST /game/undo` and `POST /game/redo`: Implement undo/redo functionality
- `POST /player/register` and `GET /player/:id`: Manage player profiles
- `POST /lobby/create` and `GET /lobby/join`: Handle lobby matchmaking
- `POST /card/play`: Manage card actions

## Security Features

- Rate limiting for API endpoints
- Input validation and sanitization
- Secure HTTP headers
- Content Security Policy (CSP)
- Authentication middleware

## License

This project is licensed under the ISC License.