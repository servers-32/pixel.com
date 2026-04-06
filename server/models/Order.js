import mongoose from 'mongoose'

const lineSchema = new mongoose.Schema(
  {
    productId: String,
    name: String,
    price: Number,
    quantity: Number,
  },
  { _id: false },
)

const customerSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    phone: String,
    address: String,
    city: String,
    zip: String,
    deliveryNote: String,
  },
  { _id: false },
)

const orderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    customer: { type: customerSchema, required: true },
    lines: [lineSchema],
    total: { type: Number, required: true },
    discount: Number,
    paymentMethod: String,
    installmentMonths: Number,
    installmentAnnualRatePercent: Number,
    installmentMonthlyPayment: Number,
    installmentTotalPayable: Number,
    cardLast4: String,
    loyaltyPointsSpent: Number,
    loyaltyPointsEarned: Number,
    loyaltyDiscount: Number,
  },
  { timestamps: true },
)

orderSchema.methods.toClientOrder = function toClientOrder() {
  return {
    id: this._id.toString(),
    createdAt: this.createdAt?.toISOString?.() ?? new Date().toISOString(),
    customer: this.customer,
    lines: this.lines,
    total: this.total,
    userId: this.userId ? this.userId.toString() : undefined,
    discount: this.discount,
    paymentMethod: this.paymentMethod,
    installmentMonths: this.installmentMonths,
    installmentAnnualRatePercent: this.installmentAnnualRatePercent,
    installmentMonthlyPayment: this.installmentMonthlyPayment,
    installmentTotalPayable: this.installmentTotalPayable,
    cardLast4: this.cardLast4,
    loyaltyPointsSpent: this.loyaltyPointsSpent,
    loyaltyPointsEarned: this.loyaltyPointsEarned,
    loyaltyDiscount: this.loyaltyDiscount,
  }
}

export const Order = mongoose.models.Order || mongoose.model('Order', orderSchema)
