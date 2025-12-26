import { useState, useEffect } from 'react';
import './App.css';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Landing from './components/Landing';
import API_BASE_URL from './config';

function App() {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [authView, setAuthView] = useState('login');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing token on mount
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      setToken(savedToken);
      fetchUserProfile(savedToken);
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchUserProfile = async (authToken) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${authToken || token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data);
      } else {
        handleLogout();
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      handleLogout();
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = (newToken, userData) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(userData);
    setShowAuth(false);
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (error) {
      console.error('Error logging out:', error);
    } finally {
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
      setShowAuth(false);
    }
  };

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{
          textAlign: 'center',
          color: 'white'
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '4px solid rgba(255,255,255,0.3)',
            borderTopColor: 'white',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <p style={{ fontSize: '18px', fontWeight: '600' }}>در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  if (token && user) {
    return <Dashboard user={user} token={token} onLogout={handleLogout} />;
  }

  if (showAuth) {
    return (
      <div className="auth-container">
        <div className="auth-box">
          <div className="auth-logo">
            <h1>مبنا</h1>
            <p>پلتفرم مدیریت برنامه‌ریزی</p>
          </div>
          <div className="auth-tabs">
            <button 
              className={authView === 'login' ? 'active' : ''} 
              onClick={() => setAuthView('login')}
            >
              ورود
            </button>
            <button 
              className={authView === 'register' ? 'active' : ''} 
              onClick={() => setAuthView('register')}
            >
              ثبت‌نام
            </button>
          </div>
          {authView === 'login' ? (
            <Login onLogin={handleLogin} />
          ) : (
            <Register onRegister={handleLogin} />
          )}
          <button className="back-to-landing" onClick={() => setShowAuth(false)}>
            ← بازگشت به صفحه اصلی
          </button>
        </div>
      </div>
    );
  }

  return <Landing onGetStarted={() => setShowAuth(true)} />;
}

export default App;
