const { createSupabaseModel } = require('./supabaseModel');

const Favorite = createSupabaseModel('favorites');
module.exports = Favorite;
