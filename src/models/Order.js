import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const orderItemSchema = new mongoose.Schema({
  productName: { type: String, required: true, trim: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true, min: 0 },
  totalCost: { type: Number, required: true, min: 0 }
});

const orderSchema = new mongoose.Schema({
  customerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  items: { 
    type: [orderItemSchema], 
    required: true,
    validate: {
      validator: function(v) {
        return v.length > 0;
      },
      message: 'Order must have at least one item'
    }
  },
  totalAmount: { 
    type: Number, 
    required: true, 
    min: 0 
  },
  shippingStatus: { 
    type: String, 
    enum: ['pending', 'shipped', 'delivered'], 
    default: 'pending' 
  },
  shippingAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, required: true }
  }
}, { timestamps: true });

orderSchema.plugin(mongoosePaginate);

export default mongoose.model('Order', orderSchema);