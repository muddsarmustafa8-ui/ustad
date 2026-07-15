const { createSupabaseModel } = require('./supabaseModel');

const Message = createSupabaseModel('messages');
module.exports = Message;
