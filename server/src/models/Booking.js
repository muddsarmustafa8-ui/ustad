const { createSupabaseModel } = require('./supabaseModel');

const Booking = createSupabaseModel('bookings');
module.exports = Booking;
