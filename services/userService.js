import db from '../configs/db.js';

export default {
  async createAccountForUser(profile, providerName) {
    try {
      // Xử lý thông tin từ profile theo provider
      const providerUpperCase = providerName.toUpperCase();
      
      // Lấy thông tin email, name và avatar từ profile dựa vào provider
      let email, username, avatarUrl;
      
      if (profile.emails && profile.emails.length > 0) {
        email = profile.emails[0].value;
      } else if (profile.email) {
        email = profile.email;
      } else {
        // Nếu không có email, tạo email từ ID và provider
        email = `${profile.id}@${providerUpperCase.toLowerCase()}.auth`;
      }
      
      // Lấy username từ profile
      if (profile.displayName) {
        username = profile.displayName;
      } else if (profile.name) {
        username = profile.name.givenName ? 
          `${profile.name.givenName} ${profile.name.familyName || ''}` : 
          profile.name;
      } else {
        username = email.split('@')[0]; // Mặc định lấy phần trước @ của email
      }
      
      // Lấy avatar từ profile
      if (profile.photos && profile.photos.length > 0) {
        avatarUrl = profile.photos[0].value;
      } else if (profile.picture) {
        avatarUrl = profile.picture;
      } else if (profile._json && profile._json.avatar_url) {
        avatarUrl = profile._json.avatar_url;
      }
      
      // Bắt đầu transaction để đảm bảo tính nhất quán
      return await db.transaction(async (trx) => {
        // Tìm account với email và provider tương ứng
        const account = await trx('account')
          .where({ 
            email: email, 
            provider: providerUpperCase 
          })
          .first();
          
        if (account) {
          // Nếu account đã tồn tại, cập nhật last_login
         
            
          // Lấy thông tin user tương ứng
          let user = await trx('user')
            .where({ id: account.user })
            .first();
          
          // Cập nhật avatar nếu user chưa có
          if (!user.avata && avatarUrl) {
            // First, insert the avatar URL into the media table
            const [mediaId] = await trx('media')
              .insert({
                url: avatarUrl,
                resource_type: 'IMAGE',
              });
              
            // Then update the user table with the media ID
            await trx('user')
              .where({ id: user.id })
              .update({ avata: mediaId });
              
            // Refresh user data
            user = await trx('user')
              .where({ id: user.id })
              .first();
          }
          
          // Refresh account data
          const updatedAccount = await trx('account')
            .where({ id: account.id })
            .first();
          
          // Trả về thông tin kết hợp
          return {
            id: updatedAccount.id,
            email: updatedAccount.email,
            username: user.username,
            avata: user.avatar,
            role: updatedAccount.role,
            provider: updatedAccount.provider,
            // last_login: updatedAccount.last_login,
            created_at: updatedAccount.created_at,
            user: user.id,
          };
        } else {
          // Tìm xem email này đã tồn tại trong bảng account chưa để lấy user
          const existingAccount = await trx('account')
            .where({ email })
            .first();
          
          let userId;
          
          if (existingAccount) {
            // Nếu email đã tồn tại trong account khác, sử dụng user đó
            userId = existingAccount.user;
            
            // Cập nhật thông tin user nếu cần
            const existingUser = await trx('user')
              .where({ id: userId })
              .first();
              
            if (!existingUser.avatar && avatarUrl) {
              // First, insert the avatar URL into the media table
              const [mediaId] = await trx('media')
                .insert({
                  url: avatarUrl,
                  resource_type: 'IMAGE',
                });
                
              // Then update the user table with the media ID
              await trx('user')
                .where({ id: userId })
                .update({ avata: mediaId });
            }
          } else {
            // Nếu email chưa tồn tại, tạo user mới
            let avatarId = null;
            
            // If there's an avatar URL, store it in media table first
            if (avatarUrl) {
              const [mediaId] = await trx('media')
                .insert({
                  url: avatarUrl,
                  resource_type: 'IMAGE',
                });
              avatarId = mediaId;
            }
            
            // Now create user with the media ID (not the URL)
            const [newUserId] = await trx('user')
              .insert({
                username: username,
                avata: avatarId // Store ID, not URL
              });
              
            userId = newUserId;
          }
          
          // Tạo account mới với email và user
          const [accountId] = await trx('account')
            .insert({
              email: email,
              user: userId,
              role: 'USER', // Mặc định là USER
              provider: providerUpperCase,
              // last_login: trx.fn.now(),
              created_at: trx.fn.now()
              // password để null vì đây là OAuth
            });
          
          // Lấy thông tin mới tạo
          const newUser = await trx('user')
            .where({ id: userId })
            .first();
            
          const newAccount = await trx('account')
            .where({ id: accountId })
            .first();
          
          // Trả về đối tượng kết hợp
          return {
            id: newAccount.id,
            email: newAccount.email,
            username: newUser.username,
            avata: newUser.avatar,
            role: newAccount.role,
            provider: newAccount.provider,
            // last_login: newAccount.last_login,
            created_at: newAccount.created_at,
            user: newUser.id,
          };
        }
      });
    } catch (error) {
      console.error('Error in createAccountForUser:', error);
      throw error;
    }
  },
  async updateBirthday(accountId, birthday) {
    try {
        const account = await db('account')
            .where('id', accountId)
            .select('user')
            .first();
        
        if (!account) {
            console.log("Account not found!");
            return null; 
        }
        const userId = account.user;
        const result = await db('user')
            .where('id', userId)
            .update({ dob: birthday });
        return result;
    } catch (error) {
        console.error("Database update error:", error);
    }
},

  async updateFields(accountId, field, value) {
    try {
      const allowedFields = ['username', 'avata', 'gender', 'password', 'dob'];
      if (!allowedFields.includes(field)) {
        throw new Error(`Field not allowed: ${field}`);
      }
      const { user: userId } = await db('account')
        .where('id', accountId)
        .select('user')
        .first();

      // Special handling for avatar field
      if (field === 'avata') {
        return await db.transaction(async (trx) => {
          // First, insert the avatar URL into the media table
          const [mediaId] = await trx('media')
            .insert({
              url: value,
              type: 'IMAGE',
              user: userId,
              upload_date: trx.fn.now()
            });
            
          // Then update the user with the media ID
          await trx('user')
            .where({ id: accountId })
            .update({ avatar: mediaId });
            
          const user = await trx('user')
            .where({ id: accountId })
            .first();
            
          const account = await trx('account')
            .where({ user: accountId })
            .first();
    
          return {
            ...user
          };
        });
      } 
      // Password handling
      else if (field === 'password') {
        await db('account')
          .where({ user: accountId })
          .update({ [field]: value });
      } 
      // Other fields
      else {
        
        await db('user')
          .where({ id: userId })
          .update({ [field]: value });
      }

      const user = await db('user')
        .where({ id: userId })
        .first();
        
      const account = await db('account')
        .where({ user: accountId })
        .first();

      return {
        ...user,
      };
    } catch (error) {
      console.error(`Error updating ${field}:`, error);
      throw error;
    }
  },
  
  async findUserByEmail(email) {
    try {
      // Tìm account với email
      const account = await db('account')
        .where({ email })
        .first();
        
      if (!account) {
        return null;
      }
      
      // Lấy thông tin user
      const user = await db('user')
        .where({ id: account.user })
        .first();
        
      if (!user) {
        return null;
      }
      
      // Kết hợp thông tin
      return {
        id: account.id,
        email: account.email,
        username: user.username,
        avata: user.avatar,
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
      const user = await db('user')
        .leftJoin('media', 'user.avata', 'media.id')
        .select('user.*', 'media.url as avatar_url')
        .where('user.id', userId)
        .first();
        
      if (!user) {
        return null;
      }
      
      // Use avatar_url instead of avatar ID
      const avatarUrl = user.avatar_url || null;
      
      // Get linked accounts
      const accounts = await db('account')
        .where({ user: userId });
        
      // Get primary account
      const primaryAccount = accounts.find(acc => acc.provider === 'USER') || accounts[0];
      
      return {
        id: primaryAccount.id,
        email: primaryAccount.email,
        username: user.username,
        avatar: avatarUrl, // Use the URL instead of the ID
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
      // Đếm số lượng quiz của user
      const quizCount = await db('quiz')
        .where({ user: userId })
        .count('id as count')
        .first();
        
      // Đếm số lượng flashcard sets
      const flashcardCount = await db('flashcard_set')
        .where({ user: userId })
        .count('id as count')
        .first();
        
      // Lấy thông tin subscription
      const subscription = await db('subscription')
        .where({ user: userId })
        .orderBy('expiry_date', 'desc')
        .first();
        
      return {
        quizzes: quizCount.count || 0,
        flashcards: flashcardCount.count || 0,
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
      return await db('user')
        .where({ id: userId })
        .first();
    }
    catch {
      console.error('Error in getUserById:', error);
      throw error;
    }
  },
  async getUserByAccountId(accountId) {
    try {
      const account = await db('account')
        .where({ id: accountId })
        .first();
        
      if (!account) {
        return null;
      }
      
      const user = await db('user')
        .where({ id: account.user })
        .first();
        
      return user;
    } catch (error) {
      console.error('Error in getUserByAccountId:', error);
      throw error;
    }
  } ,

  async getUserIdByAccountId(accountId) {
    try {
      const account = await db('account')
        .where({ id: accountId })
        .first();
        
      if (!account) {
        return null;
      }
      
      return account.user;
    } catch (error) {
      console.error('Error in getUserIdByAccountId:', error);
      throw error;
    }
  },
  async getUsernameByAccountId(accountId) {
    try {
      const account = await db('account')
        .where({ id: accountId })
        .first();
        
      if (!account) {
        return null;
      }
      
      const user = await db('user')
        .where({ id: account.user })
        .first();
        
      return user.username;
    } catch (error) {
      console.error('Error in getUsernameByAccountId:', error);
      throw error;
    }
  },
  async updateAvatar(accountId, avatarUrl, public_id) {
    try {
      const account = await db('account')
        .where({ id: accountId })
        .first();
        
      if (!account) {
        return null;
      }
      
      const user = await db('user')
        .where({ id: account.user })
        .first();
        
      if (!user) {
        return null;
      }
      
      // Update avatar URL in media table
      const [mediaId] = await db('media')
        .insert({
          url: avatarUrl,
          resource_type: 'IMAGE',
          public_id: public_id
        });
        
      // Update user with new media ID
      await db('user')
        .where({ id: user.id })
        .update({ avata: mediaId });
        
      return true;
    } catch (error) {
      console.error('Error in updateAvatar:', error);
      throw error;
    }
  },
  async getAvatarByUserId(userId) {
    try {
      const user = await db('user')
        .where("id", userId).first();

      if (!user) {
          return null;
      }
      const avatar = await db('media')
        .where('id', user.avata)
        .first();
      return avatar.url;
      
    }
    catch(error) {
      console.error('Error in getAvatarByUserId:', error);
      throw error;
    }
  }

};