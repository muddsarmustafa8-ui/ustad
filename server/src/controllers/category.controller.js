const Category = require('../models/Category');
const Business = require('../models/Business');
const Service = require('../models/Service');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// @desc    Get all active categories
// @route   GET /api/categories
// @access  Public
const getCategories = asyncHandler(async (req, res, next) => {
  const categories = await Category.find({ isActive: true }).sort('name');
  return sendSuccess(res, categories, 'Fetched categories successfully');
});

// @desc    Get category details by slug
// @route   GET /api/categories/:slug
// @access  Public
const getCategoryBySlug = asyncHandler(async (req, res, next) => {
  const category = await Category.findOne({ slug: req.params.slug });
  if (!category) {
    return sendError(res, 'Category not found', 404);
  }
  return sendSuccess(res, category, 'Fetched category successfully');
});

// @desc    Get all categories for admin management
// @route   GET /api/admin/categories
// @access  Private (Admin)
const getAdminCategories = asyncHandler(async (req, res, next) => {
  const categories = await Category.find().sort({ isActive: -1, name: 1 });
  return sendSuccess(res, categories, 'Fetched categories successfully');
});

// @desc    Create a category
// @route   POST /api/admin/categories
// @access  Private (Admin)
const createCategory = asyncHandler(async (req, res, next) => {
  const { name, icon, description, isActive = true } = req.body;

  if (!name || !name.trim()) {
    return sendError(res, 'Category name is required', 400);
  }

  if (!icon || !icon.trim()) {
    return sendError(res, 'Category icon is required', 400);
  }

  const normalizedName = name.trim();
  const existing = await Category.findOne({ name: normalizedName });

  if (existing) {
    return sendError(res, 'A category with that name already exists', 409);
  }

  const category = await Category.create({
    name: normalizedName,
    icon: icon.trim(),
    description: description?.trim(),
    isActive: Boolean(isActive),
  });

  return sendSuccess(res, category, 'Category created successfully', 201);
});

// @desc    Update a category
// @route   PUT /api/admin/categories/:id
// @access  Private (Admin)
const updateCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return sendError(res, 'Category not found', 404);
  }

  const updates = {};
  if (typeof req.body.name === 'string') updates.name = req.body.name.trim();
  if (typeof req.body.icon === 'string') updates.icon = req.body.icon.trim();
  if (typeof req.body.description === 'string') updates.description = req.body.description.trim();
  if (typeof req.body.isActive === 'boolean') updates.isActive = req.body.isActive;

  if (updates.name) {
    const duplicate = await Category.findOne({
      _id: { $ne: category._id },
      name: updates.name,
    });

    if (duplicate) {
      return sendError(res, 'A category with that name already exists', 409);
    }
  }

  Object.assign(category, updates);
  await category.save();

  return sendSuccess(res, category, 'Category updated successfully');
});

// @desc    Delete a category
// @route   DELETE /api/admin/categories/:id
// @access  Private (Admin)
const deleteCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return sendError(res, 'Category not found', 404);
  }

  const [businessCount, serviceCount] = await Promise.all([
    Business.countDocuments({ category: category._id }),
    Service.countDocuments({ category: category._id }),
  ]);

  if (businessCount > 0 || serviceCount > 0) {
    return sendError(
      res,
      'This category is currently in use. Deactivate it instead of deleting.',
      400
    );
  }

  await category.deleteOne();

  return sendSuccess(res, null, 'Category deleted successfully');
});

module.exports = {
  getCategories,
  getCategoryBySlug,
  getAdminCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
