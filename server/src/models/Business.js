const { createSupabaseModel } = require('./supabaseModel');

const Business = createSupabaseModel('businesses');
module.exports = Business;
