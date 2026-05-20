import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ChatProvider } from './context/ChatContext';
import { SocketProvider } from './context/SocketContext';
import { ThemeProvider } from './context/ThemeContext';
import ThemeToggle from './components/ThemeToggle';
import Login from './pages/Login';
import Register from './pages/Register';
import Chat from './pages/Chat';
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SocketProvider>
          <ChatProvider>
            <Router>
              <div className="h-screen bg-gray-50 dark:bg-gray-900">
                <Routes>
                  <Route path="/login" element={
                    <div className="relative">
                      <div className="absolute top-4 right-4 z-50">
                        <ThemeToggle />
                      </div>
                      <Login />
                    </div>
                  } />
                  <Route path="/register" element={
                    <div className="relative">
                      <div className="absolute top-4 right-4 z-50">
                        <ThemeToggle />
                      </div>
                      <Register />
                    </div>
                  } />
                  <Route path="/chat" element={<Chat />} />
                  <Route path="/" element={<Navigate to="/chat" replace />} />
                </Routes>
              </div>
            </Router>
          </ChatProvider>
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
