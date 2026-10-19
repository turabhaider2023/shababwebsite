import Product from '../models/Product.js';
import ExtraSubcategory from '../models/ExtraSubcategory.js';
import { CATEGORIES } from '../data/categories.js';

export async function listCategories() {
  const [extras, counts] = await Promise.all([
    ExtraSubcategory.find().sort({ name: 1 }),
    Product.aggregate([
      { $group: { _id: { category: '$category', subcategory: '$subcategory' }, count: { $sum: 1 } } },
    ]),
  ]);

  return CATEGORIES.map((category) => {
    const custom = extras
      .filter((item) => item.category === category.slug)
      .filter((item) => !category.subcategories.some((sub) => sub.slug === item.slug))
      .map((item) => ({
        slug: item.slug,
        name: item.name,
        custom: true,
        id: item._id,
      }));

    const subs = [
      ...category.subcategories.map((sub) => ({ ...sub, custom: false })),
      ...custom,
    ].map((sub) => {
      const found = counts.find(
        (row) => row._id.category === category.slug && row._id.subcategory === sub.slug
      );
      return { ...sub, count: found?.count || 0 };
    });

    return {
      ...category,
      count: subs.reduce((sum, sub) => sum + sub.count, 0),
      subcategories: subs,
    };
  });
}

export async function isAllowedSubcategory(category, subcategory) {
  const cat = CATEGORIES.find((item) => item.slug === category);
  if (!cat) return false;
  if (cat.subcategories.some((item) => item.slug === subcategory)) return true;
  return Boolean(await ExtraSubcategory.exists({ category, slug: subcategory }));
}
