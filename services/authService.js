import bcrypt from 'bcrypt';
import crypto from 'crypto';
import dotenv from 'dotenv';
import mailConfig from '../configs/mailConfig.js';
import authRepository from '../repositories/authRepository.js';

dotenv.config();

export default {
    async login(email, password) {
        const user = await authRepository.findAccountByEmail(email);
        
        if (!user) return null;
        
        // Check if account is verified
        if (!user.isVerified && user.provider === 'USER') {
            throw new Error('Account not verified. Please check your email for verification link.');
        }

        const validPassword = await bcrypt.compare(password, user.password);
        
        if (!validPassword) return null;

        const otherData = await authRepository.findUserDetails(user.user);
        if (!otherData) return null;
        
        const userData = {
            ...user,
            username: otherData.username,
            avatar: otherData.avatar_url,
        };

        return userData;
    },
    
    async createAccountWithVerification(email, password) {
        // Check if account already exists
        const existingAccount = await authRepository.findAccountByEmail(email);
        if (existingAccount) {
            return { existingUser: true };
        }
        
        // Generate verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const tokenExpiry = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour
        
        const trx = await authRepository.beginTransaction();
        try {
            const username = email.split('@')[0]; // Use part before @ as username
            const userData = { username };
            
            const hashedPassword = await bcrypt.hash(password, 10);
            const accountData = {
                email,
                password: hashedPassword,
                provider: "USER",
                role: 'USER',
                created_at: trx.fn.now(),
                isVerified: false,
                verification_token: verificationToken,
                token_expiry: tokenExpiry
            };
            
            const { userId } = await authRepository.createUserAndAccount(userData, accountData, trx);
            
            // Send verification email
            await mailConfig.sendVerificationEmail(email, verificationToken);
            
            await trx.commit();
            
            return {
                success: true,
                userId,
                email
            };
        } catch (error) {
            await trx.rollback();
            console.error('Error creating account with verification:', error);
            throw error;
        }
    },

    async resendVerificationEmail(email) {
        // Find user account by email
        const account = await authRepository.findAccountByEmailAndProvider(email, 'USER');
        
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
        await authRepository.updateVerificationToken(account.id, verificationToken, tokenExpiry);
        
        // Send verification email
        await mailConfig.sendVerificationEmail(email, verificationToken);
        
        return { success: true };
    },

    async verifyUserEmail(token) {
        const account = await authRepository.findAccountByVerificationToken(token);
        
        if (!account) {
            return { success: false, message: 'Invalid or expired verification link' };
        }
        
        // Update account as verified
        await authRepository.updateAccount(account.id, {
            isVerified: true,
            verification_token: null,
            token_expiry: null,
        });
        
        return { success: true };
    },
    
    async checkAccountOrCreateAccount(email, password) {
        const existingAccount = await authRepository.findAccountByEmailAndProvider(email, 'USER');
        if (existingAccount) {
            return null;
        }
    
        const trx = await authRepository.beginTransaction();
        try {
            const username = email.split('@')[0];
            const userData = { username };
            
            const hashedPassword = await bcrypt.hash(password, 10);
            const accountData = {
                email,
                password: hashedPassword,
                provider: 'USER',
                role: 'USER',
                created_at: trx.fn.now()
            };
            
            const { userId, accountId } = await authRepository.createUserAndAccount(userData, accountData, trx);
            
            const newAccount = await authRepository.getNewAccount(accountId, trx);
            const newUser = await authRepository.getNewUser(userId, trx);
            
            await trx.commit();
            
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
            await trx.rollback();
            console.error('Error creating account:', error);
            throw error;
        }
    },
    
    async updatePassword(userId, currentPassword, newPassword) {
        try {
            // Get user account by id
            const user = await authRepository.findAccountById(userId);
            
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
            await authRepository.updateAccount(userId, { password: hashedPassword });
            
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