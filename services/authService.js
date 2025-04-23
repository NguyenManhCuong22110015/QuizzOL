import db from '../configs/db.js';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import dotenv from 'dotenv';
import mailConfig from '../configs/mailConfig.js';


dotenv.config();

export default {
    async login(email, password) {
        const user = await db('account').where({ email: email }).first();
        
        if (!user) return null; 
        
        // Check if account is verified
        if (!user.isVerified && user.provider === 'USER') {
            throw new Error('Account not verified. Please check your email for verification link.');
        }

        const validPassword = await bcrypt.compare(password, user.password);
        
        if (!validPassword) return null; 

        return user; 
    },
    
    async createAccountWithVerification(email, password) {
        // Check if account already exists
        const existingAccount = await db('account').where({ email }).first();
        if (existingAccount) {
            return { existingUser: true };
        }
        
        // Generate verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const tokenExpiry = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hours
        
        return await db.transaction(async (trx) => {
            try {
                const username = email.split('@')[0]; // Use part before @ as username
                
                const [userId] = await trx('user').insert({
                    username: username,
                });
                
                const hashedPassword = await bcrypt.hash(password, 10);
                
                const [accountId] = await trx('account').insert({
                    email: email,
                    password: hashedPassword,
                    user: userId, 
                    provider: "USER",
                    role: 'USER',
                    created_at: trx.fn.now(),
                    isVerified: false,
                    verification_token: verificationToken,
                    token_expiry: tokenExpiry
                });
                
                await mailConfig.sendVerificationEmail(email, verificationToken);
                
                return {
                    success: true,
                    userId: userId,
                    email: email
                };
                
            } catch (error) {
                console.error('Error creating account with verification:', error);
                throw error;
            }
        });
    },
    // Add this new method to your authService object

    async resendVerificationEmail(email) {
        // Find user account by email
        const account = await db('account')
            .where({ email, provider: 'USER' })
            .first();
        
        if (!account) {
            return { success: false, message: 'Account not found.' };
        }
        
        // Check if account is already verified
        if (account.isVerified) {
            return { success: false, message: 'Account is already verified.' };
        }
        
        // Generate new verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const tokenExpiry = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour
        
        // Update account with new token
        await db('account')
            .where({ id: account.id })
            .update({
                verification_token: verificationToken,
                token_expiry: tokenExpiry
            });
        
        // Send verification email
        await mailConfig.sendVerificationEmail(email, verificationToken);
        
        return { success: true };
    },
    async verifyUserEmail(token) {
        const account = await db('account')
            .where({ verification_token: token })
            .where('token_expiry', '>', db.fn.now())
            .first();
        
        if (!account) {
            return { success: false, message: 'Invalid or expired verification link' };
        }
        
        // Update account as verified
        await db('account')
            .where({ id: account.id })
            .update({
                isVerified: true,
                verification_token: null,
                token_expiry: null,
            });
        
        return { success: true };
    },
    
    
    async checkAccountOrCreateAccount(email, password) {
        const existingAccount = await db('account').where({ email, provider: "USER" }).first();
        if (existingAccount) {
            return null;
        }
    
        return await db.transaction(async (trx) => {
            try {
                const username = email.split('@')[0];
                
                const [userId] = await trx('user').insert({
                    username: username,
                });
                
                const hashedPassword = await bcrypt.hash(password, 10);
                
                const [accountId] = await trx('account').insert({
                    email: email,
                    password: hashedPassword,
                    user: userId, 
                    provider: 'USER',
                    role: 'USER',
                    created_at: trx.fn.now()
                });
                
                const newAccount = await trx('account')
                    .where({ id: accountId })
                    .first();
                    
                const newUser = await trx('user')
                    .where({ id: userId })
                    .first();
                
                return {
                    id: newAccount.id,
                    email: newAccount.email,
                    username: newUser.username,
                    role: newAccount.role,
                    provider: newAccount.provider,
                    created_at: newAccount.created_at,
                    user: userId
                };
                
            } catch (error) {
                console.error('Error creating account:', error);
                throw error;
            }
        });
    },
    
    async updatePassword(userId, currentPassword, newPassword) {
        try {
            // Get user account by id
            const user = await db('account').where({ id: userId }).first();
            
            if (!user) {
                return { 
                    success: false, 
                    message: 'User not found' 
                };
            }
            
            // Verify current password
            const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
            if (!isPasswordValid) {
                return { 
                    success: false, 
                    message: 'Current password is incorrect' 
                };
            }
            
            // Hash new password
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            
            // Update password in database
            await db('account')
                .where({ id: userId })
                .update({ 
                    password: hashedPassword, 
                    
                });
            
            return { 
                success: true, 
                message: 'Password updated successfully' 
            };
        } catch (error) {
            console.error('Error in updatePassword service:', error);
            throw error;
        }
    },
};
