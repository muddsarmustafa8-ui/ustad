import { useSelector, useDispatch } from 'react-redux';
import { selectCurrentUser, selectIsAuthenticated, logOut, setCredentials, updateUser } from '../redux/slices/authSlice';
import api from '../services/api';

export const useAuth = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const loginUser = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.success) {
      dispatch(setCredentials(response.data.data));
    }
    return response.data;
  };

  const registerUser = async (fullName, email, phone, password, role) => {
    const response = await api.post('/auth/register', { fullName, email, phone, password, role });
    if (response.data.success) {
      dispatch(setCredentials(response.data.data));
    }
    return response.data;
  };

  const logoutUser = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      await api.post('/auth/logout', { refreshToken });
    } catch (error) {
      console.error('Logout request failed:', error.message);
    } finally {
      dispatch(logOut());
    }
  };

  const socialLogin = async (provider, payload) => {
    const response = await api.post(`/auth/social/${provider}`, payload);
    if (response.data.success) {
      dispatch(setCredentials(response.data.data));
    }
    return response.data;
  };

  const updateProfile = async (profileData) => {
    const response = await api.put('/users/profile', profileData);
    if (response.data.success) {
      dispatch(updateUser(response.data.data));
    }
    return response.data;
  };

  const hasRole = (roles) => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  return {
    user,
    isAuthenticated,
    loginUser,
    registerUser,
    logoutUser,
    socialLogin,
    updateProfile,
    hasRole,
  };
};
