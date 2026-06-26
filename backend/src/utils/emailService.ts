/**
 * Mock Email Service Logger
 * Used to simulate sending transactional emails during development.
 */

export const sendBookingConfirmation = (
  userEmail: string,
  userName: string,
  bookingDetails: any
) => {
  console.log('\n=========================================');
  console.log('📧 [Mock Email] Booking Confirmation Sent');
  console.log('=========================================');
  console.log(`To: ${userName} <${userEmail}>`);
  console.log(`Subject: Your Booking at ${bookingDetails.venueName} is Confirmed!`);
  console.log('-----------------------------------------');
  console.log(`Booking ID: ${bookingDetails.id}`);
  console.log(`Date: ${new Date(bookingDetails.date).toDateString()}`);
  console.log(`Total Paid: Rs. ${bookingDetails.cost}`);
  console.log('=========================================\n');
};
