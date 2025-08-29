const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { authLogger } = require('../utils/logger');

class AuthService {
  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'fallback-secret-key';
    this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '24h';
    this.jwtRefreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
  }

  // Generate JWT tokens
  generateTokens(userId) {
    const accessToken = jwt.sign(
      { userId, type: 'access' },
      this.jwtSecret,
      { expiresIn: this.jwtExpiresIn }
    );

    const refreshToken = jwt.sign(
      { userId, type: 'refresh' },
      this.jwtSecret,
      { expiresIn: this.jwtRefreshExpiresIn }
    );

    return {
      accessToken,
      refreshToken,
      expiresIn: this.parseExpiration(this.jwtExpiresIn)
    };
  }

  // Parse JWT expiration time to seconds
  parseExpiration(expiration) {
    const unit = expiration.slice(-1);
    const value = parseInt(expiration.slice(0, -1));
    
    switch (unit) {
      case 's': return value;
      case 'm': return value * 60;
      case 'h': return value * 60 * 60;
      case 'd': return value * 24 * 60 * 60;
      default: return 24 * 60 * 60; // Default to 24 hours
    }
  }

  // Verify JWT token
  verifyToken(token) {
    try {
      return jwt.verify(token, this.jwtSecret);
    } catch (error) {
      authLogger.error('Token verification failed:', error.message);
      return null;
    }
  }

  // User registration
  async register(userData) {
    try {
      // Check if user already exists
      const existingUser = await User.findByEmail(userData.email);
      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Create new user
      const user = new User({
        ...userData,
        role: userData.role || 'viewer'
      });

      await user.save();
      authLogger.info(`New user registered: ${user.email}`);

      // Generate tokens
      const tokens = this.generateTokens(user._id);
      
      // Update user with refresh token
      user.refreshToken = tokens.refreshToken;
      await user.save();

      return {
        user: user.getProfile(),
        tokens
      };
    } catch (error) {
      authLogger.error('User registration failed:', error.message);
      throw error;
    }
  }

  // User login
  async login(email, password) {
    try {
      // Find user by email
      const user = await User.findByEmail(email);
      if (!user) {
        throw new Error('Invalid credentials');
      }

      // Check if user is active
      if (!user.isActive) {
        throw new Error('Account is deactivated');
      }

      // Verify password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        throw new Error('Invalid credentials');
      }

      // Update last login
      user.lastLogin = new Date();
      
      // Generate new tokens
      const tokens = this.generateTokens(user._id);
      user.refreshToken = tokens.refreshToken;
      
      await user.save();
      authLogger.info(`User logged in: ${user.email}`);

      return {
        user: user.getProfile(),
        tokens
      };
    } catch (error) {
      authLogger.error('User login failed:', error.message);
      throw error;
    }
  }

  // Refresh token
  async refreshToken(refreshToken) {
    try {
      // Verify refresh token
      const decoded = this.verifyToken(refreshToken);
      if (!decoded || decoded.type !== 'refresh') {
        throw new Error('Invalid refresh token');
      }

      // Find user
      const user = await User.findById(decoded.userId);
      if (!user || !user.isActive) {
        throw new Error('User not found or inactive');
      }

      // Check if refresh token matches
      if (user.refreshToken !== refreshToken) {
        throw new Error('Invalid refresh token');
      }

      // Generate new tokens
      const tokens = this.generateTokens(user._id);
      user.refreshToken = tokens.refreshToken;
      await user.save();

      authLogger.info(`Tokens refreshed for user: ${user.email}`);

      return {
        user: user.getProfile(),
        tokens
      };
    } catch (error) {
      authLogger.error('Token refresh failed:', error.message);
      throw error;
    }
  }

  // Logout
  async logout(userId) {
    try {
      const user = await User.findById(userId);
      if (user) {
        user.refreshToken = undefined;
        await user.save();
        authLogger.info(`User logged out: ${user.email}`);
      }
      return { success: true };
    } catch (error) {
      authLogger.error('Logout failed:', error.message);
      throw error;
    }
  }

  // Change password
  async changePassword(userId, currentPassword, newPassword) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Verify current password
      const isCurrentPasswordValid = await user.comparePassword(currentPassword);
      if (!isCurrentPasswordValid) {
        throw new Error('Current password is incorrect');
      }

      // Update password
      user.password = newPassword;
      await user.save();

      authLogger.info(`Password changed for user: ${user.email}`);
      return { success: true };
    } catch (error) {
      authLogger.error('Password change failed:', error.message);
      throw error;
    }
  }

  // Get user profile
  async getProfile(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }
      return user.getProfile();
    } catch (error) {
      authLogger.error('Get profile failed:', error.message);
      throw error;
    }
  }

  // Update user profile
  async updateProfile(userId, updateData) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Update allowed fields
      const allowedFields = ['firstName', 'lastName', 'organization'];
      allowedFields.forEach(field => {
        if (updateData[field] !== undefined) {
          user[field] = updateData[field];
        }
      });

      user.updatedAt = new Date();
      await user.save();

      authLogger.info(`Profile updated for user: ${user.email}`);
      return user.getProfile();
    } catch (error) {
      authLogger.error('Profile update failed:', error.message);
      throw error;
    }
  }

  // Validate user permissions
  async validatePermissions(userId, requiredRole) {
    try {
      const user = await User.findById(userId);
      if (!user || !user.isActive) {
        return false;
      }

      const roleHierarchy = {
        'viewer': 1,
        'analyst': 2,
        'manager': 3,
        'admin': 4
      };

      return roleHierarchy[user.role] >= roleHierarchy[requiredRole];
    } catch (error) {
      authLogger.error('Permission validation failed:', error.message);
      return false;
    }
  }
}

module.exports = new AuthService();
