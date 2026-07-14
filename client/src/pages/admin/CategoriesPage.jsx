import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Edit3, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';

const DEFAULT_CATEGORIES = [
  { _id: 'barber', name: 'Barber', icon: '✂️', description: 'Haircuts, beard trims, and grooming', isActive: true },
  { _id: 'hair-salon', name: 'Hair Salon', icon: '💇', description: 'Styling, coloring, and treatments', isActive: true },
  { _id: 'beauty-salon', name: 'Beauty Salon', icon: '💅', description: 'Makeup, nails, and skincare', isActive: true },
  { _id: 'grocery-store', name: 'Grocery Store', icon: '🛒', description: 'Groceries and daily essentials', isActive: true },
  { _id: 'restaurant', name: 'Restaurant', icon: '🍽️', description: 'Dining, takeout, and local food', isActive: true },
  { _id: 'mechanic', name: 'Mechanic', icon: '🔧', description: 'Auto repair and maintenance', isActive: true },
];

const CategoriesPage = () => {
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newCat, setNewCat] = useState({ name: '', icon: '', description: '', isActive: true });
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await api.get('/admin/categories');
        if (response.data.data?.length) {
          setCategories(response.data.data);
        }
      } catch {
        toast.error('Unable to load categories from the server');
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  const handleAdd = async () => {
    if (!newCat.name.trim() || !newCat.icon.trim()) {
      toast.error('Name and icon are required');
      return;
    }

    try {
      const res = await api.post('/admin/categories', newCat);
      setCategories((current) => [...current, res.data.data || { ...newCat, _id: Date.now().toString() }]);
      setAdding(false);
      setNewCat({ name: '', icon: '', description: '', isActive: true });
      toast.success('Category added');
    } catch {
      toast.error('Failed to add category');
    }
  };

  const handleEdit = async (id) => {
    try {
      await api.put(`/admin/categories/${id}`, editData);
      setCategories((current) => current.map((item) => (item._id === id ? { ...item, ...editData } : item)));
      setEditId(null);
      setEditData({});
      toast.success('Category updated');
    } catch {
      toast.error('Failed to update category');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category?')) return;

    try {
      await api.delete(`/admin/categories/${id}`);
      setCategories((current) => current.filter((item) => item._id !== id));
      toast.success('Category deleted');
    } catch {
      toast.error('Failed to delete category');
    }
  };

  const handleToggle = async (id, current) => {
    try {
      await api.patch(`/admin/categories/${id}`, { isActive: !current });
      setCategories((currentItems) => currentItems.map((item) => (item._id === id ? { ...item, isActive: !current } : item)));
      toast.success(current ? 'Category deactivated' : 'Category activated');
    } catch {
      toast.error('Failed to toggle status');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-sm text-gray-500 dark:text-gray-400">
        Loading categories...
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 font-outfit">Categories</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{categories.length} categories total</p>
        </div>
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-md"
        >
          <Plus size={16} /> Add Category
        </button>
      </div>

      {adding && (
        <div className="bg-white dark:bg-dark-800 rounded-2xl border border-gray-100 dark:border-dark-700 p-5 mb-5 shadow-sm">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">New Category</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <input
              placeholder="Name (e.g. Plumber)"
              value={newCat.name}
              onChange={(e) => setNewCat((current) => ({ ...current, name: e.target.value }))}
              className="px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-dark-700 bg-gray-50 dark:bg-dark-900 text-gray-800 dark:text-gray-200 outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              placeholder="Icon (emoji, e.g. 🪠)"
              value={newCat.icon}
              onChange={(e) => setNewCat((current) => ({ ...current, icon: e.target.value }))}
              className="px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-dark-700 bg-gray-50 dark:bg-dark-900 text-gray-800 dark:text-gray-200 outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              placeholder="Description (optional)"
              value={newCat.description}
              onChange={(e) => setNewCat((current) => ({ ...current, description: e.target.value }))}
              className="px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-dark-700 bg-gray-50 dark:bg-dark-900 text-gray-800 dark:text-gray-200 outline-none focus:ring-2 focus:ring-blue-500 sm:col-span-2"
            />
          </div>
          <div className="flex gap-2">
            <button onClick={handleAdd} className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
              <Check size={14} /> Save
            </button>
            <button onClick={() => setAdding(false)} className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-dark-700 hover:bg-gray-200 dark:hover:bg-dark-600 rounded-lg transition-colors">
              <X size={14} /> Cancel
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {categories.map((cat) => (
          <div key={cat._id} className="bg-white dark:bg-dark-800 rounded-2xl border border-gray-100 dark:border-dark-700 p-4 shadow-sm">
            {editId === cat._id ? (
              <div className="space-y-2">
                <input
                  value={editData.icon ?? cat.icon}
                  onChange={(e) => setEditData((current) => ({ ...current, icon: e.target.value }))}
                  placeholder="Icon"
                  className="w-full px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-dark-700 bg-gray-50 dark:bg-dark-900 text-gray-800 dark:text-gray-200 outline-none"
                />
                <input
                  value={editData.name ?? cat.name}
                  onChange={(e) => setEditData((current) => ({ ...current, name: e.target.value }))}
                  placeholder="Name"
                  className="w-full px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-dark-700 bg-gray-50 dark:bg-dark-900 text-gray-800 dark:text-gray-200 outline-none"
                />
                <input
                  value={editData.description ?? cat.description ?? ''}
                  onChange={(e) => setEditData((current) => ({ ...current, description: e.target.value }))}
                  placeholder="Description"
                  className="w-full px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-dark-700 bg-gray-50 dark:bg-dark-900 text-gray-800 dark:text-gray-200 outline-none"
                />
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(cat._id)} className="flex-1 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">Save</button>
                  <button onClick={() => { setEditId(null); setEditData({}); }} className="flex-1 py-1.5 text-xs font-semibold text-gray-600 bg-gray-100 dark:bg-dark-700 rounded-lg hover:bg-gray-200 transition-colors">Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-2xl text-white shadow-lg shadow-blue-600/25">
                    {cat.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 dark:text-gray-100 text-sm truncate">{cat.name}</div>
                    <div className="text-xs text-gray-400 font-mono truncate">{cat.slug}</div>
                  </div>
                </div>
                {cat.description && <p className="mb-3 text-xs leading-5 text-gray-500 dark:text-gray-400">{cat.description}</p>}
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => handleToggle(cat._id, cat.isActive)}
                    className={`text-xs px-2 py-0.5 rounded-full font-semibold ${cat.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-500 dark:bg-dark-700'}`}
                  >
                    {cat.isActive ? 'Active' : 'Inactive'}
                  </button>
                  <div className="flex gap-1">
                    <button
                      onClick={() => {
                        setEditId(cat._id);
                        setEditData({ name: cat.name, icon: cat.icon, description: cat.description || '' });
                      }}
                      className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(cat._id)}
                      className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoriesPage;
