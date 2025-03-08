import db from '../utils/db.js';

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
        // Kiểm tra xem email đã tồn tại trong bảng user chưa
        let user = await trx('user').where({ email }).first();
        
        if (!user) {
          // Nếu user chưa tồn tại, tạo mới user
          const [userId] = await trx('user').insert({
            username: username,
            email: email,
            avatar: avatarUrl,
            // Các trường khác có thể để null
          });
          
          // Lấy thông tin user mới tạo
          user = await trx('user').where({ id: userId }).first();
        } else if (!user.avatar && avatarUrl) {
          // Cập nhật avatar nếu user chưa có
          await trx('user').where({ id: user.id }).update({ avatar: avatarUrl });
          // Refresh user data
          user = await trx('user').where({ id: user.id }).first();
        }
        
        // Kiểm tra xem đã có tài khoản với provider này chưa
        let account = await trx('account')
          .where({ 
            email: email, 
            provider: providerUpperCase 
          })
          .first();
          
        if (!account) {
          // Nếu chưa có account với provider này, tạo mới
          const [accountId] = await trx('account').insert({
            email: email,
            user_id: user.id,
            role: 'USER', // Mặc định là USER
            provider: providerUpperCase,
            last_login: db.fn.now(),
            created_at: db.fn.now()
            // password để null vì đây là OAuth
          });
          
          // Lấy thông tin account mới tạo
          account = await trx('account').where({ id: accountId }).first();
        } else {
          // Cập nhật last_login nếu account đã tồn tại
          await trx('account')
            .where({ id: account.id })
            .update({ last_login: db.fn.now() });
            
          // Refresh account data
          account = await trx('account').where({ id: account.id }).first();
        }
        
        // Trả về đối tượng kết hợp thông tin từ user và account
        return {
          id: account.id,
          email: user.email,
          username: user.username,
          avatar: user.avatar,
          role: account.role,
          provider: account.provider,
          last_login: account.last_login,
          created_at: account.created_at,
          user_id: user.id,
        };
      });
      
    } catch (error) {
      console.error('Error in createAccountForUser:', error);
      throw error;
    }
  }
};