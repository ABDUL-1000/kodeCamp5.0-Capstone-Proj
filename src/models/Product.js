import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const productSchema = new mongoose.Schema({
  productName: { type: String, required: true, trim: true },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  cost: { type: Number, required: true, min: 0 },
  productImages: { type: [String], default: [] },
  description: { type: String, default: '' },
  stockStatus: { type: String, type: String, 
    enum: ['in-stock', 'out-of-stock', 'pre-order'], 
  default: 'in-stock' },
  brand: { type: mongoose.Schema.Types.ObjectId, ref: "Brand", required: false }
}, { timestamps: true });

productSchema.plugin(mongoosePaginate);

export default mongoose.model('Product', productSchema);
