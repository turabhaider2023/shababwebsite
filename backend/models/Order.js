import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: String,
    image: String,
    price: Number,
    mrp: Number,
    qty: Number,
    size: String,
    color: String,
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    orderNumber: { type: String, required: true, unique: true },
    items: [itemSchema],
    shippingAddress: {
      fullName: String,
      age: Number,
      phone: String,
      line1: String,
      line2: String,
      landmark: String,
      city: String,
      state: String,
      pincode: String,
    },
    paymentMethod: { type: String, enum: ['cod', 'upi', 'card'], required: true },
    subtotal: Number,
    coupon: { type: String, default: '' },
    couponDiscount: { type: Number, default: 0 },
    shipping: Number,
    totalPrice: Number,
    whatsappSent: { type: Boolean, default: false },
    whatsappError: { type: String, default: '' },
    emailSent: { type: Boolean, default: false },
    emailError: { type: String, default: '' },
    status: {
      type: String,
      enum: ['placed', 'confirmed', 'shipped', 'delivered', 'cancelled'],
      default: 'placed',
    },
  },
  { timestamps: true }
);

const Order = mongoose.model('Order', orderSchema);
export default Order;
