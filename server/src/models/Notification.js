const { createSupabaseModel } = require('./supabaseModel');

const Notification = createSupabaseModel('notifications');
module.exports = Notification;
