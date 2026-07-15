const supabase = require('../config/supabase');

const toSnakeCase = (value) => {
  if (typeof value !== 'string') return value;
  return value.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase();
};

const toCamelCase = (value) => {
  if (typeof value !== 'string') return value;
  return value.replace(/_([a-z])/g, (_, char) => char.toUpperCase());
};

const transformKeys = (value, transform) => {
  if (Array.isArray(value)) {
    return value.map((item) => transformKeys(item, transform));
  }

  if (value && typeof value === 'object') {
    return Object.entries(value).reduce((acc, [key, itemValue]) => {
      acc[transform(key)] = transformKeys(itemValue, transform);
      return acc;
    }, {});
  }

  return value;
};

const toDbRecord = (value) => transformKeys(value, toSnakeCase);
const toAppRecord = (value) => transformKeys(value, toCamelCase);

const getRelationTable = (field) => {
  const map = {
    business: 'businesses',
    businesses: 'businesses',
    category: 'categories',
    categories: 'categories',
    service: 'services',
    services: 'services',
    user: 'users',
    users: 'users',
    owner: 'users',
    customer: 'users',
    sender: 'users',
    recipient: 'users',
    admin: 'users',
    review: 'reviews',
    reviews: 'reviews',
    booking: 'bookings',
    bookings: 'bookings',
    notification: 'notifications',
    notifications: 'notifications',
    message: 'messages',
    messages: 'messages',
    favorite: 'favorites',
    favorites: 'favorites',
    auditLog: 'audit_logs',
    auditLogs: 'audit_logs',
    cmsPage: 'cms_pages',
    cmsPages: 'cms_pages',
    subscriptionPlan: 'subscription_plans',
    subscriptionPlans: 'subscription_plans',
  };

  return map[field] || null;
};

class SupabaseDocument {
  constructor(model, data) {
    this._model = model;
    this._data = data || {};
    Object.assign(this, data || {});
  }

  async save() {
    const id = this.id || this._id;
    if (!id) {
      const created = await this._model.create(this.toObject());
      Object.assign(this, created.toObject ? created.toObject() : created);
      return this;
    }

    const updated = await this._model.findByIdAndUpdate(id, this.toObject());
    if (updated) {
      Object.assign(this, updated.toObject ? updated.toObject() : updated);
    }
    return this;
  }

  async populate(paths) {
    const relations = Array.isArray(paths) ? paths : [paths];
    for (const relation of relations) {
      const relationPath = typeof relation === 'string' ? relation : relation.path;
      const relationTable = getRelationTable(relationPath);
      const relationId = this._data[relationPath] || this[relationPath];
      if (!relationTable || !relationId) continue;

      const relatedModel = createSupabaseModel(relationTable);
      const relatedDoc = await relatedModel.findById(relationId);
      this._data[relationPath] = relatedDoc;
      this[relationPath] = relatedDoc;
    }
    return this;
  }

  select(fields) {
    if (!fields) return this;
    const selected = Array.isArray(fields) ? fields : String(fields).split(/\s+/).filter(Boolean);
    const next = {};
    for (const field of selected) {
      const normalized = field.replace(/^\+/, '');
      if (normalized in this._data) {
        next[normalized] = this._data[normalized];
      }
    }
    return new SupabaseDocument(this._model, next);
  }

  toObject() {
    return { ...this._data };
  }

  toJSON() {
    return this.toObject();
  }
}

class Query {
  constructor(model, filters = {}, options = {}) {
    this.model = model;
    this.filters = filters || {};
    this.options = options;
    this.sortValue = null;
    this.limitValue = undefined;
    this.skipValue = undefined;
    this.selectFields = null;
    this.populatePaths = [];
  }

  where(filters) {
    this.filters = { ...this.filters, ...filters };
    return this;
  }

  sort(value) {
    this.sortValue = value;
    return this;
  }

  limit(value) {
    this.limitValue = value;
    return this;
  }

  skip(value) {
    this.skipValue = value;
    return this;
  }

  select(fields) {
    this.selectFields = fields;
    return this;
  }

  populate(paths) {
    this.populatePaths = Array.isArray(paths) ? paths : [paths];
    return this;
  }

  async exec() {
    if (!supabase) return [];
    let queryBuilder = supabase.from(this.model.tableName).select('*');
    const filters = toDbRecord(this.filters);
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        queryBuilder = queryBuilder.eq(key, value);
      }
    });

    if (this.sortValue) {
      const sortEntries = typeof this.sortValue === 'string'
        ? this.sortValue.split(',').map((entry) => entry.trim()).filter(Boolean)
        : Object.entries(this.sortValue);

      sortEntries.forEach((entry) => {
        if (typeof entry === 'string') {
          const descending = entry.startsWith('-');
          const field = descending ? entry.slice(1) : entry;
          queryBuilder = queryBuilder.order(field, { ascending: !descending });
        } else if (Array.isArray(entry)) {
          const [field, direction] = entry;
          queryBuilder = queryBuilder.order(field, { ascending: direction !== -1 });
        }
      });
    }

    if (this.skipValue !== undefined) {
      const from = Number(this.skipValue) || 0;
      const to = this.limitValue !== undefined ? from + Number(this.limitValue) - 1 : from + 99;
      queryBuilder = queryBuilder.range(from, to);
    } else if (this.limitValue !== undefined) {
      queryBuilder = queryBuilder.limit(Number(this.limitValue));
    }

    const { data, error } = await queryBuilder;
    if (error) throw error;

    const docs = (data || []).map((item) => new SupabaseDocument(this.model, toAppRecord(item)));
    if (this.selectFields) {
      return docs.map((doc) => doc.select(this.selectFields));
    }

    if (this.populatePaths.length) {
      await Promise.all(docs.map((doc) => doc.populate(this.populatePaths)));
    }

    return docs;
  }

  then(resolve, reject) {
    return this.exec().then(resolve, reject);
  }

  catch(reject) {
    return this.exec().catch(reject);
  }
}

const createSupabaseModel = (tableName) => {
  const model = {
    tableName,
    modelName: tableName,

    create(payload) {
      if (!supabase) return null;
      const record = toDbRecord(payload);
      return supabase.from(tableName).insert(record).select('*').single().then(({ data, error }) => {
        if (error) throw error;
        return new SupabaseDocument(model, toAppRecord(data));
      });
    },

    find(query = {}) {
      if (typeof query === 'function') {
        return new Query(model, {});
      }
      return new Query(model, query);
    },

    findById(id) {
      if (!supabase) return Promise.resolve(null);
      return supabase.from(tableName).select('*').eq('id', id).maybeSingle().then(({ data, error }) => {
        if (error) throw error;
        return data ? new SupabaseDocument(model, toAppRecord(data)) : null;
      });
    },

    findOne(query = {}) {
      if (!supabase) return Promise.resolve(null);
      let queryBuilder = supabase.from(tableName).select('*');
      const filters = toDbRecord(query);
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          queryBuilder = queryBuilder.eq(key, value);
        }
      });
      return queryBuilder.maybeSingle().then(({ data, error }) => {
        if (error) throw error;
        return data ? new SupabaseDocument(model, toAppRecord(data)) : null;
      });
    },

    findByIdAndUpdate(id, update) {
      if (!supabase) return Promise.resolve(null);
      const record = toDbRecord(update);
      return supabase.from(tableName).update(record).eq('id', id).select('*').single().then(({ data, error }) => {
        if (error) throw error;
        return data ? new SupabaseDocument(model, toAppRecord(data)) : null;
      });
    },

    findOneAndUpdate(query = {}, update) {
      if (!supabase) return Promise.resolve(null);
      const filters = toDbRecord(query);
      const record = toDbRecord(update);
      let queryBuilder = supabase.from(tableName).update(record).select('*');
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          queryBuilder = queryBuilder.eq(key, value);
        }
      });
      return queryBuilder.single().then(({ data, error }) => {
        if (error) throw error;
        return data ? new SupabaseDocument(model, toAppRecord(data)) : null;
      });
    },

    deleteOne(query = {}) {
      if (!supabase) return Promise.resolve(null);
      let queryBuilder = supabase.from(tableName).delete().select('*');
      const filters = toDbRecord(query);
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          queryBuilder = queryBuilder.eq(key, value);
        }
      });
      return queryBuilder.single().then(({ data, error }) => {
        if (error) throw error;
        return data ? new SupabaseDocument(model, toAppRecord(data)) : null;
      });
    },

    populate(docs, paths) {
      if (!docs) return docs;
      const list = Array.isArray(docs) ? docs : [docs];
      return Promise.all(list.map((doc) => doc.populate(paths)));
    },
  };

  return model;
};

module.exports = {
  createSupabaseModel,
  SupabaseDocument,
};
