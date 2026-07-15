const { createSupabaseModel } = require('./supabaseModel');

const Category = createSupabaseModel('categories');
module.exports = Category;
