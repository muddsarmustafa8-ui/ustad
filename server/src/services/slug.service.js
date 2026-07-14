const slugify = require('slugify');

const generateUniqueSlug = async (name, model) => {
  let slug = slugify(name, { lower: true, strict: true });
  let uniqueSlug = slug;
  let count = 1;

  while (await model.findOne({ slug: uniqueSlug })) {
    uniqueSlug = `${slug}-${count}`;
    count++;
  }

  return uniqueSlug;
};

module.exports = {
  generateUniqueSlug,
};
