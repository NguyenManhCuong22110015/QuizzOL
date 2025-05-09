import userRepository from '../repositories/userRepository.js';

export default {
  async createAccountForUser(profile, providerName) {
    try {
      // Process profile information based on provider
      const providerUpperCase = providerName.toUpperCase();
      
      // Extract email, username, and avatar from profile based on provider
      let email, username, avatarUrl;
      
      if (profile.emails && profile.emails.length > 0) {
        email = profile.emails[0].value;
      } else if (profile.email) {
        email = profile.email;
      } else {
        // If no email, create one from ID and provider
        email = `${profile.id}@${providerUpperCase.toLowerCase()}.auth`;
      }
      
      // Get username from profile
      if (profile.displayName) {
        username = profile.displayName;
      } else if (profile.name) {
        username = profile.name.givenName ? 
          `${profile.name.givenName} ${profile.name.familyName || ''}` : 
          profile.name;
      } else {
        username = email.split('@')[0]; // Default to part before @ in email
      }
      
      // Get avatar from profile
      if (profile.photos && profile.photos.length > 0) {
        avatarUrl = profile.photos[0].value;
      } else if (profile.picture) {
        avatarUrl = profile.picture;
      } else if (profile._json && profile._json.avatar_url) {
        avatarUrl = profile._json.avatar_url;
      }
      
      // Start transaction to ensure consistency
      const trx = await userRepository.beginTransaction();
      try {
        // Check if account with email and provider exists
        const account = await trx('account')
          .where({ 
            email: email, 
            provider: providerUpperCase 
          })
          .first();
          
        if (account) {
          // Account exists, get user
          let user = await trx('user')
            .where({ id: account.user })
            .first();
          
          // Update avatar if user doesn't have one
          if (!user.avatar && avatarUrl) {
            // Insert avatar URL into media table
            const mediaId = await trx('media')
              .insert({
                url: avatarUrl,
                resource_type: 'IMAGE',
              })
              .then(ids => ids[0]);
              
            // Update user with media ID
            await trx('user')
              .where({ id: user.id })
              .update({ avatar: mediaId });
              
            // Refresh user data
            user = await trx('user')
              .where({ id: user.id })
              .first();
          }
          
          // Refresh account data
          const updatedAccount = await trx('account')
            .where({ id: account.id })
            .first();
          
          // Get avatar URL
          const avatar = await trx('media')
            .where('id', user.avatar)
            .first();

          await trx.commit();
          return {
            id: updatedAccount.id,
            email: updatedAccount.email,
            username: user.username,
            avatar: avatar ? avatar.url : null,
            role: updatedAccount.role,
            provider: updatedAccount.provider,
            created_at: updatedAccount.created_at,
            user: user.id,
          };
        } else {
          // Check if email exists in another account
          const existingAccount = await trx('account')
            .where({ email })
            .first();
          
          let userId;
          
          if (existingAccount) {
            // Email exists in another account, use that user
            userId = existingAccount.user;
            
            // Update user info if needed
            const existingUser = await trx('user')
              .where({ id: userId })
              .first();
              
            if (!existingUser.avatar && avatarUrl) {
              // Insert avatar URL into media table
              const mediaId = await trx('media')
                .insert({
                  url: avatarUrl,
                  resource_type: 'IMAGE',
                })
                .then(ids => ids[0]);
                
              // Update user with media ID
              await trx('user')
                .where({ id: userId })
                .update({ avatar: mediaId });
            }
          } else {
            // Email doesn't exist, create new user
            let avatarId = null;
            
            // Store avatar in media table if exists
            if (avatarUrl) {
              avatarId = await trx('media')
                .insert({
                  url: avatarUrl,
                  resource_type: 'IMAGE',
                })
                .then(ids => ids[0]);
            }
            
            // Create user with media ID
            userId = await trx('user')
              .insert({
                username: username,
                avatar: avatarId
              })
              .then(ids => ids[0]);
          }
          
          // Create new account with email and user
          const accountId = await trx('account')
            .insert({
              email: email,
              user: userId,
              role: 'USER', // Default role
              provider: providerUpperCase,
              created_at: trx.fn.now()
            })
            .then(ids => ids[0]);
          
          // Get newly created data
          const newUser = await trx('user')
            .where({ id: userId })
            .first();
            
          const newAccount = await trx('account')
            .where({ id: accountId })
            .first();
          
          // Get avatar URL if exists
          let avatarUrl = null;
          if (newUser.avatar) {
            const avatar = await trx('media')
              .where('id', newUser.avatar)
              .first();
            avatarUrl = avatar ? avatar.url : null;
          }
          
          await trx.commit();
          // Return combined object
          return {
            id: newAccount.id,
            email: newAccount.email,
            username: newUser.username,
            avatar: avatarUrl,
            role: newAccount.role,
            provider: newAccount.provider,
            created_at: newAccount.created_at,
            user: newUser.id,
          };
        }
      } catch (error) {
        await trx.rollback();
        throw error;
      }
    } catch (error) {
      console.error('Error in createAccountForUser:', error);
      throw error;
    }
  },

  async updateBirthday(accountId, birthday) {
    try {
      // Get user ID from account
      const account = await userRepository.findAccountById(accountId);
      
      if (!account) {
        console.log("Account not found!");
        return null; 
      }
      
      // Update birthday in user table
      const userId = account.user;
      return await userRepository.updateUser(userId, { dob: birthday });
    } catch (error) {
      console.error("Error updating birthday:", error);
      throw error;
    }
  },

  async updateFields(accountId, field, value) {
    try {
      const allowedFields = ['username', 'avatar', 'gender', 'password', 'dob'];
      if (!allowedFields.includes(field)) {
        throw new Error(`Field not allowed: ${field}`);
      }
      
      // Get user ID from account
      const account = await userRepository.findAccountById(accountId);
      if (!account) return null;
      
      const userId = account.user;

      // Special handling for avatar field
      if (field === 'avatar') {
        const trx = await userRepository.beginTransaction();
        try {
          // Insert avatar URL into media table
          const mediaId = await trx('media')
            .insert({
              url: value,
              resource_type: 'IMAGE',
            })
            .then(ids => ids[0]);
            
          // Update user with media ID
          await trx('user')
            .where({ id: userId })
            .update({ avatar: mediaId });
            
          // Get updated user and account
          const user = await trx('user')
            .leftJoin('media', 'user.avatar', 'media.id')
            .select('user.*', 'media.url as avatar_url')
            .where('user.id', userId)
            .first();
          
          await trx.commit();
          return {
            ...user,
            avatar: user.avatar_url
          };
        } catch (error) {
          await trx.rollback();
          throw error;
        }
      } 
      // Password handling
      else if (field === 'password') {
        await userRepository.updateAccount(accountId, { [field]: value });
      } 
      // Other fields
      else {
        await userRepository.updateUser(userId, { [field]: value });
      }

      // Get updated user with avatar
      const user = await userRepository.findUserByIdWithAvatar(userId);
      
      return {
        ...user,
        avatar: user.avatar_url
      };
    } catch (error) {
      console.error(`Error updating ${field}:`, error);
      throw error;
    }
  },
  
  async findUserByEmail(email) {
    try {
      // Find account with email
      const account = await userRepository.findAccountByEmail(email);
      
      if (!account) {
        return null;
      }
      
      // Get user info
      const user = await userRepository.findUserByIdWithAvatar(account.user);
      
      if (!user) {
        return null;
      }
      
      // Combine information
      return {
        id: account.id,
        email: account.email,
        username: user.username,
        avatar: user.avatar_url,
        role: account.role,
        provider: account.provider,
        user: user.id
      };
    } catch (error) {
      console.error('Error in findUserByEmail:', error);
      throw error;
    }
  },
  
  async findUserById(userId) {
    try {
      // Get user with avatar URL
      const user = await userRepository.findUserByIdWithAvatar(userId);
      
      if (!user) {
        return null;
      }
      
      // Get linked accounts
      const accounts = await userRepository.getAccountsByUserId(userId);
      
      // Get primary account
      const primaryAccount = accounts.find(acc => acc.provider === 'USER') || accounts[0];
      
      return {
        id: primaryAccount.id,
        email: primaryAccount.email,
        username: user.username,
        avatar: user.avatar_url,
        role: primaryAccount.role,
        provider: primaryAccount.provider,
        user: user.id,
        linked_accounts: accounts.map(acc => acc.provider)
      };
    } catch (error) {
      console.error('Error in findUserById:', error);
      throw error;
    }
  },
  
  async getUserStats(userId) {
    try {
      // Count user's quizzes
      const quizCount = await userRepository.countQuizzesByUserId(userId);
      
      // Count flashcard sets
      const flashcardCount = await userRepository.countFlashcardSetsByUserId(userId);
      
      // Get subscription info
      const subscription = await userRepository.getActiveSubscriptionByUserId(userId);
      
      return {
        quizzes: quizCount || 0,
        flashcards: flashcardCount || 0,
        subscription: subscription ? {
          plan: subscription.plan,
          startDate: subscription.start_date,
          expiryDate: subscription.expiry_date,
          isActive: new Date(subscription.expiry_date) > new Date()
        } : null
      };
    } catch (error) {
      console.error('Error in getUserStats:', error);
      throw error;
    }
  },

  async getUserById(userId) {
    try {
      return await userRepository.findUserById(userId);
    } catch (error) {
      console.error('Error in getUserById:', error);
      throw error;
    }
  },

  async getUserByAccountId(accountId) {
    try {
      const account = await userRepository.findAccountById(accountId);
      
      if (!account) {
        return null;
      }
      
      return await userRepository.findUserById(account.user);
    } catch (error) {
      console.error('Error in getUserByAccountId:', error);
      throw error;
    }
  },

  async getUserIdByAccountId(accountId) {
    try {
      const account = await userRepository.findAccountById(accountId);
      return account ? account.user : null;
    } catch (error) {
      console.error('Error in getUserIdByAccountId:', error);
      throw error;
    }
  },

  async getUsernameByAccountId(accountId) {
    try {
      const account = await userRepository.findAccountById(accountId);
      
      if (!account) {
        return null;
      }
      
      const user = await userRepository.findUserById(account.user);
      return user ? user.username : null;
    } catch (error) {
      console.error('Error in getUsernameByAccountId:', error);
      throw error;
    }
  },

  async updateAvatar(accountId, avatarUrl, public_id) {
    try {
      const trx = await userRepository.beginTransaction();
      try {
        // Get account
        const account = await trx('account')
          .where({ id: accountId })
          .first();
          
        if (!account) {
          await trx.rollback();
          return null;
        }
        
        // Get user
        const user = await trx('user')
          .where({ id: account.user })
          .first();
          
        if (!user) {
          await trx.rollback();
          return null;
        }
        
        // Insert avatar URL into media table
        const mediaId = await trx('media')
          .insert({
            url: avatarUrl,
            resource_type: 'IMAGE',
            public_id: public_id
          })
          .then(ids => ids[0]);
          
        // Update user with media ID
        await trx('user')
          .where({ id: user.id })
          .update({ avatar: mediaId });
          
        await trx.commit();
        return true;
      } catch (error) {
        await trx.rollback();
        throw error;
      }
    } catch (error) {
      console.error('Error in updateAvatar:', error);
      throw error;
    }
  },

  async getAvatarByUserId(userId) {
    try {
      const user = await userRepository.findUserById(userId);

      if (!user || !user.avatar) {
        return null;
      }
      
      const avatar = await userRepository.findMediaById(user.avatar);
      return avatar ? avatar.url : null;
    } catch(error) {
      console.error('Error in getAvatarByUserId:', error);
      return null;
    }
  },

  async getAvatarByAccountId(accountId) {
    try {
      const account = await userRepository.findAccountById(accountId);
      
      if (!account) {
        return null;
      }
      
      const user = await userRepository.findUserById(account.user);
      
      if (!user || !user.avatar) {
        return null;
      }
      
      const avatar = await userRepository.findMediaById(user.avatar);
      return avatar ? avatar.url : null;
    } catch (error) {
      console.error('Error in getAvatarByAccountId:', error);
      return null;
    }
  }
};