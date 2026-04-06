import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, default: '', trim: true },
    loyaltyPoints: { type: Number, default: 0 },
  },
  { timestamps: true },
)

userSchema.methods.toPublicJSON = function toPublicJSON() {
  return {
    id: this._id.toString(),
    email: this.email,
    name: this.name,
    phone: this.phone,
    loyaltyPoints: this.loyaltyPoints ?? 0,
    createdAt: this.createdAt?.toISOString?.() ?? new Date().toISOString(),
  }
}

export const User = mongoose.models.User || mongoose.model('User', userSchema)
