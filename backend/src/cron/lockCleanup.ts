import cron from 'node-cron';
import Slot, { BookingStatus } from '../models/Slot';

/**
 * Initializes and starts the background cron job to release expired slot locks.
 * Runs every 2 minutes using node-cron.
 */
export const initLockCleanupCron = (): void => {
  cron.schedule('*/2 * * * *', async () => {
    const now = new Date();
    try {
      // Perform atomic update for all expired slot holds
      const result = await Slot.updateMany(
        {
          status: BookingStatus.LOCKED,
          $expr: {
            $lt: [
              '$lockTimestamp',
              {
                $subtract: [
                  now,
                  { $multiply: ['$lockDurationMinutes', 60, 1000] },
                ],
              },
            ],
          },
        },
        {
          $set: {
            status: BookingStatus.AVAILABLE,
            lockedByUserId: null,
            lockTimestamp: null,
          },
        }
      );

      if (result.modifiedCount > 0) {
        console.log(
          `🧹 Lock Cleanup Cron: Automatically released ${result.modifiedCount} expired slot lock holds.`
        );
      }
    } catch (error) {
      console.error('❌ Lock Cleanup Cron Task Error:', error);
    }
  });

  console.log('  ⏰  Lock Cleanup Cron Job scheduled successfully (running every 2 mins)');
};
export default initLockCleanupCron;
