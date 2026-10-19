import express from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { listCategories } from '../utils/catalog.js';

const router = express.Router();

router.get(
  '/',
  asyncHandler(async (req, res) => {
    res.json(await listCategories());
  })
);

export default router;
