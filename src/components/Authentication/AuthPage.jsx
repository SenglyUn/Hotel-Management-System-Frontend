// src/components/Authentication/AuthPage.jsx
import React, { useState } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

const AuthPage = () => {
  const [isRegistering, setIsRegistering] = useState(false);

  return (
    <div className="auth-container">
      {isRegistering ? (
        <RegisterForm onSwitchToLogin={() => setIsRegistering(false)} />
      ) : (
        <LoginForm onSwitchToRegister={() => setIsRegistering(true)} />
      )}
    </div>
  );
};

export default AuthPage;
