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
          await trx('account')
            .where({ id: account.id })
            .update({ 
              last_login: trx.fn.now() 
            });
            
          // Lấy thông tin user tương ứng
          let user = await trx('user')
            .where({ id: account.user_id })
            .first();
          
          // Cập nhật avatar nếu user chưa có
          if (!user.avatar && avatarUrl) {
            await trx('user')
              .where({ id: user.id })
              .update({ avatar: avatarUrl });
              
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
            avatar: user.avatar,
            role: updatedAccount.role,
            provider: updatedAccount.provider,
            last_login: updatedAccount.last_login,
            created_at: updatedAccount.created_at,
            user_id: user.id,
          };
        } else {
          // Tìm xem email này đã tồn tại trong bảng account chưa để lấy user_id
          const existingAccount = await trx('account')
            .where({ email })
            .first();
          
          let userId;
          
          if (existingAccount) {
            // Nếu email đã tồn tại trong account khác, sử dụng user_id đó
            userId = existingAccount.user_id;
            
            // Cập nhật thông tin user nếu cần
            const existingUser = await trx('user')
              .where({ id: userId })
              .first();
              
            if (!existingUser.avatar && avatarUrl) {
              await trx('user')
                .where({ id: userId })
                .update({ avatar: avatarUrl });
            }
          } else {
            // Nếu email chưa tồn tại, tạo user mới
            const [newUserId] = await trx('user')
              .insert({
                username: username,
                avatar: avatarUrl
              });
              
            userId = newUserId;
          }
          
          // Tạo account mới với email và user_id
          const [accountId] = await trx('account')
            .insert({
              email: email,
              user_id: userId,
              role: 'USER', // Mặc định là USER
              provider: providerUpperCase,
              last_login: trx.fn.now(),
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
            avatar: newUser.avatar,
            role: newAccount.role,
            provider: newAccount.provider,
            last_login: newAccount.last_login,
            created_at: newAccount.created_at,
            user_id: newUser.id,
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
            .select('user_id')
            .first();
        
        if (!account) {
            console.log("Account not found!");
            return null; 
        }
        const userId = account.user_id;
        const result = await db('user')
            .where('id', userId)
            .update({ dob: birthday });
        return result;
    } catch (error) {
        console.error("Database update error:", error);
    }
},

  async updateFields(userId, field, value) {
    try {
      const allowedFields = ['username', 'avatar', 'gender', 'password', 'dob'];
      if (!allowedFields.includes(field)) {
        throw new Error(`Field not allowed: ${field}`);
      }

      const updateData = { [field]: value };
      
      if (field === 'password') {
        await db('account')
          .where({ user_id: userId })
          .update(updateData);
      } else {
        await db('user')
          .where({ id: userId })
          .update(updateData);
      }

      const user = await db('user')
        .where({ id: userId })
        .first();
        
      const account = await db('account')
        .where({ user_id: userId })
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
        .where({ id: account.user_id })
        .first();
        
      if (!user) {
        return null;
      }
      
      // Kết hợp thông tin
      return {
        id: account.id,
        email: account.email,
        username: user.username,
        avatar: user.avatar,
        role: account.role,
        provider: account.provider,
        user_id: user.id
      };
    } catch (error) {
      console.error('Error in findUserByEmail:', error);
      throw error;
    }
  },
  
  async findUserById(userId) {
    try {
      // Lấy thông tin user
      const user = await db('user')
        .where({ id: userId })
        .first();
        
      if (!user) {
        return null;
      }
      
      // Lấy tài khoản liên kết
      const accounts = await db('account')
        .where({ user_id: userId });
        
      // Lấy tài khoản chính (có thể là tài khoản đầu tiên hoặc có provider là LOCAL)
      const primaryAccount = accounts.find(acc => acc.provider === 'USER') || accounts[0];
      
      // Kết hợp thông tin
      return {
        id: primaryAccount.id,
        email: primaryAccount.email,
        username: user.username,
        avatar: user.avatar,
        role: primaryAccount.role,
        provider: primaryAccount.provider,
        user_id: user.id,
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
        .where({ user_id: userId })
        .count('id as count')
        .first();
        
      // Đếm số lượng flashcard sets
      const flashcardCount = await db('flashcard_set')
        .where({ user_id: userId })
        .count('id as count')
        .first();
        
      // Lấy thông tin subscription
      const subscription = await db('subscription')
        .where({ user_id: userId })
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
  }
};