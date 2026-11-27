import { FirstAidGuide } from '../models/FirstAidGuide';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';

/** GET /api/first-aid?locale=en */
export const listGuides = asyncHandler(async (req, res) => {
  const locale = String(req.query.locale || 'en');
  let items = await FirstAidGuide.find({ locale }).select('slug title category summary locale').lean();
  if (!items.length && locale !== 'en') {
    items = await FirstAidGuide.find({ locale: 'en' }).select('slug title category summary locale').lean();
  }
  res.json({ success: true, items });
});

/** GET /api/first-aid/:slug?locale=hi (falls back to English) */
export const getGuide = asyncHandler(async (req, res) => {
  const locale = String(req.query.locale || 'en');
  const guide =
    (await FirstAidGuide.findOne({ slug: req.params.slug, locale })) ||
    (await FirstAidGuide.findOne({ slug: req.params.slug, locale: 'en' }));
  if (!guide) throw ApiError.notFound('Guide not found');
  res.json({ success: true, guide });
});