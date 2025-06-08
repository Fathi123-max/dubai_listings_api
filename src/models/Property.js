import mongoose from 'mongoose';

const propertySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'A property must have a title'],
      trim: true,
      maxlength: [100, 'A property title must have less or equal than 100 characters'],
      minlength: [10, 'A property title must have more or equal than 10 characters'],
    },
    description: {
      type: String,
      required: [true, 'A property must have a description'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'A property must have a price'],
      min: [0, 'Price must be a positive number'],
    },
    pricePer: {
      type: String,
      enum: ['month', 'year', 'sqft', 'total'],
      default: 'month',
    },
    propertyType: {
      type: String,
      required: [true, 'A property must have a type'],
      enum: {
        values: [
          'apartment',
          'villa',
          'townhouse',
          'penthouse',
          'land',
          'commercial',
          'other',
        ],
        message:
          'Property type must be either: apartment, villa, townhouse, penthouse, land, commercial, or other',
      },
    },
    bedrooms: {
      type: Number,
      required: [true, 'A property must have a number of bedrooms'],
      min: [0, 'Number of bedrooms must be a positive number'],
    },
    bathrooms: {
      type: Number,
      required: [true, 'A property must have a number of bathrooms'],
      min: [0, 'Number of bathrooms must be a positive number'],
    },
    area: {
      type: Number,
      required: [true, 'A property must have an area'],
      min: [0, 'Area must be a positive number'],
    },
    areaUnit: {
      type: String,
      default: 'sqft',
      enum: {
        values: ['sqft', 'sqm'],
        message: 'Area unit must be either sqft or sqm',
      },
    },
    location: {
      // GeoJSON Point
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: {
        type: [Number],
        required: [true, 'A property must have coordinates'],
        validate: {
          validator: function (value) {
            return value.length === 2 && 
                   value[0] >= -180 && value[0] <= 180 && 
                   value[1] >= -90 && value[1] <= 90;
          },
          message: 'Coordinates must be in the format [longitude, latitude] with valid values',
        },
      },
      address: String,
      description: String,
    },
    amenities: [String],
    images: [String],
    featuredImage: String,
    status: {
      type: String,
      enum: ['available', 'pending', 'sold', 'rented'],
      default: 'available',
    },
    listedBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'A property must be listed by an agent'],
    },
    yearBuilt: Number,
    parkingSpaces: {
      type: Number,
      default: 0,
    },
    furnishingStatus: {
      type: String,
      enum: ['furnished', 'unfurnished', 'semi-furnished', 'partly-furnished'],
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    views: {
      type: Number,
      default: 0,
    },
    slug: String,
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    updatedAt: {
      type: Date,
      default: Date.now(),
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better query performance
propertySchema.index({ price: 1, area: 1 });
propertySchema.index({ location: '2dsphere' });
propertySchema.index({ slug: 1 });

// Virtual populate for reviews
propertySchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'property',
  localField: '_id',
});

// Document middleware: runs before .save() and .create()
propertySchema.pre('save', function (next) {
  // Create slug from title
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove non-word chars
      .replace(/\s+/g, '-') // Replace spaces with -
      .replace(/--+/g, '-') // Replace multiple - with single -
      .trim();
  }
  next();
});

// Query middleware
propertySchema.pre(/^find/, function (next) {
  this.populate({
    path: 'listedBy',
    select: 'name email phone photo',
  });
  next();
});

// Static method to get property stats
propertySchema.statics.calcAverageRatings = async function (propertyId) {
  const stats = await this.aggregate([
    {
      $match: { _id: propertyId },
    },
    {
      $lookup: {
        from: 'reviews',
        localField: '_id',
        foreignField: 'property',
        as: 'reviews',
      },
    },
    {
      $project: {
        averageRating: { $avg: '$reviews.rating' },
        ratingsQuantity: { $size: '$reviews' },
      },
    },
  ]);

  if (stats.length > 0) {
    await this.findByIdAndUpdate(propertyId, {
      ratingsAverage: stats[0].averageRating || 4.5,
      ratingsQuantity: stats[0].ratingsQuantity || 0,
    });
  } else {
    await this.findByIdAndUpdate(propertyId, {
      ratingsAverage: 4.5,
      ratingsQuantity: 0,
    });
  }
};

// Call calcAverageRatings after save/update reviews
propertySchema.post('save', function () {
  this.constructor.calcAverageRatings(this._id);
});

propertySchema.post(/^findOneAnd/, function (doc) {
  if (doc) doc.constructor.calcAverageRatings(doc._id);
});

const Property = mongoose.model('Property', propertySchema);

export default Property;
