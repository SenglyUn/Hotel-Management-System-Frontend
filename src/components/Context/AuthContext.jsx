import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const verifyAuth = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/me', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const userData = await response.json();
        const normalizedUser = {
          id: userData.id,
          username: userData.username,
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          role: userData.role.toLowerCase(),
          isActive: userData.isActive
        };
        setUser(normalizedUser);
        return normalizedUser;
      }
      setUser(null);
      return null;
    } catch (error) {
      console.error('Auth verification failed:', error);
      setUser(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    verifyAuth();
  }, []);

  const login = async (credentials) => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const userData = await verifyAuth();
      return { success: true, user: userData };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch('http://localhost:5000/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      setUser(null);
      return { success: true };
    } catch (error) {
      console.error('Logout failed:', error);
      return { success: false, error: error.message };
    }
  };

  // NEW: Update profile function
  const updateProfile = async (profileData) => {
    try {
      const response = await fetch('http://localhost:5000/api/profile/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }

      const result = await response.json();
      
      // Update user state with new profile data
      setUser(prev => ({
        ...prev,
        ...result.user,
        profile: result.profile || {}
      }));

      return { 
        success: true, 
        message: result.message,
        user: result.user,
        profile: result.profile
      };
    } catch (error) {
      console.error('Update profile error:', error);
      return { 
        success: false, 
        error: error.message 
      };
    }
  };

  // NEW: Change password function
  const changePassword = async (currentPassword, newPassword) => {
    try {
      const response = await fetch('http://localhost:5000/api/profile/me/password', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword,
          newPassword
        }),
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to change password');
      }

      const result = await response.json();
      return { 
        success: true, 
        message: result.message 
      };
    } catch (error) {
      console.error('Change password error:', error);
      return { 
        success: false, 
        error: error.message 
      };
    }
  };

  // NEW: Get profile function (optional)
  const getProfile = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/profile/me', {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      const profileData = await response.json();
      
      // Update user state with profile data
      setUser(prev => ({
        ...prev,
        profile: profileData.profile || {}
      }));

      return { 
        success: true, 
        profile: profileData.profile 
      };
    } catch (error) {
      console.error('Get profile error:', error);
      return { 
        success: false, 
        error: error.message 
      };
    }
  };



  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    userRole: user?.role,
    login,
    logout,
    verifyAuth,
     // NEW: Add profile functions
    updateProfile,
    changePassword,
    getProfile
  };

  

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};