const { createSupabaseModel } = require('./supabaseModel');

const Service = createSupabaseModel('services');
module.exports = Service;
