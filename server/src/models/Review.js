const { createSupabaseModel } = require('./supabaseModel');

const Review = createSupabaseModel('reviews');
module.exports = Review;
