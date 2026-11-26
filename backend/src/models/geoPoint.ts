import { Schema } from 'mongoose';

/** Reusable GeoJSON Point sub-schema. Used with a 2dsphere index on the parent field. */
export const pointSchema = new Schema(
  {
    type: { type: String, enum: ['Point'], default: 'Point', required: true },
    coordinates: {
      type: [Number],
      required: true,
      validate: {
        validator: (v: number[]) => Array.isArray(v) && v.length === 2,
        message: 'coordinates must be [lng, lat]',
      },
    },
  },
  { _id: false }
);
