import mongoose from 'mongoose';
import User from '../models/User'; // Assuming User model path from utils directory

export const REFERRAL_BONUS_PERCENTAGE = 0.01; // 1%

export const awardReferralBonus = async (referredUserId: mongoose.Types.ObjectId, xpGainedByReferredUser: number): Promise<void> => {
    try {
        // We need to fetch the full referredUser to get their referrer ID
        const referredUserWithDetails = await User.findById(referredUserId).select('referrer');
        if (!referredUserWithDetails || !referredUserWithDetails.referrer) {
            // No referrer or referred user not found, so no bonus to award.
            return;
        }

        const referrerUser = await User.findById(referredUserWithDetails.referrer);
        if (!referrerUser) {
            console.warn(`Referrer user with ID ${referredUserWithDetails.referrer} not found for referred user ${referredUserId}.`);
            return;
        }

        const bonusXp = Math.max(1, Math.round(xpGainedByReferredUser * REFERRAL_BONUS_PERCENTAGE));

        referrerUser.xp = (referrerUser.xp || 0) + bonusXp;
        referrerUser.xpFromReferrals = (referrerUser.xpFromReferrals || 0) + bonusXp;
        
        await referrerUser.save();
        console.log(`Awarded ${bonusXp} referral bonus XP to user ${referrerUser._id} (referrer of ${referredUserId}).`);

    } catch (error) {
        console.error(`Error awarding referral bonus for referred user ${referredUserId}:`, error);
        // Non-critical error, don't let it break the main flow.
    }
}; 