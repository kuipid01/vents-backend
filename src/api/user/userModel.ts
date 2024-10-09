import { NextFunction } from "express";
import mongoose, { Schema, Document, Model } from "mongoose";
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { z } from "zod";
import { EventSchema, IEvent } from "../events/eventModel";
// Define the Event interface

// 2. Create the Zod validation schema
export const UserSchemaZ = z.object({
  email: z.string().email(),
  password: z.string(),
  emailVerified: z.boolean(),
  events: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      images: z.array(z.string()), // Array of image URLs as strings
      date: z.date(),
      qrCode: z.string()
    })
  ),
  oAuth: z.boolean(),
});
export type IUserZod = z.infer<typeof UserSchemaZ>; // Infer type for Zod validation

interface IUser extends Document {
  email: string;                 // User's email address
  password: string;              // User's password
  emailVerified: boolean;        // Indicates if the user's email is verified
  events: IEvent[];              // Array of events associated with the user
  oAuth: boolean;                // Indicates if the user logged in with OAuth
  refreshToken: string;          // Refresh token for authentication
  passwordConfirm?: string;      // Confirmation password (not stored in DB)
  passwordChangedAt?: Date;      // Timestamp for when the password was changed
  passwordResetToken?: string;   // Token for password reset
  passwordResetExpires?: Date;
  correctPassword:(a:string,b:string) => Promise<boolean>,
  createPasswordResetToken:() => void  
  changedPasswordAfter:(time:number | undefined) => Promise<boolean>
}

const UserSchema: Schema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true,select:false },
    passwordConfirm: {
      type: String,
      validate: {
        validator: function (this: IUser, el: string) {
          return el === this.password;
        },
        message: 'Passwords are not the same',
      },
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    emailVerified: { type: Boolean, default: false },
    events: { type: [EventSchema], default: [] },
    oAuth: { type: Boolean, default: false },
    refreshToken: { type: String },
  },
  {
    timestamps: true,
  }
);


// methods


UserSchema.methods.changedPasswordAfter = function (
  // Explicitly type 'this'
  JWTTimestamp: number // JWT timestamp is a number
): boolean {
  if (this.passwordChangedAt) {
    const changedTimestamp = Math.floor(this.passwordChangedAt.getTime() / 1000); // Get time in seconds

    return JWTTimestamp < changedTimestamp;
  }

  // If no password change has occurred, return false
  return false;
};
// Pre-save hook to hash password before saving
UserSchema.pre<IUser>('save', async function (next: NextFunction) {
  // Only hash password if it has been modified
  // @ts-ignore
  const user = this
  if (!user.isModified('password')) return next();

  // Hash the password
  user.password = await bcrypt.hash(user.password, 12);

  // Remove passwordConfirm field
  user.passwordConfirm = undefined;

  next();
} as any);
UserSchema.pre('save', async function(next:NextFunction){
  // @ts-ignore
    const user = this
  if(!user.isModified('password') || user.isNew) return next()
    console.log('If we modify password it updates model')
      user.passwordChangedAt= Date.now()-1000;
      next()
} as any)
UserSchema.methods.correctPassword = async function(candidatePassword:string,userPassword:string):Promise<boolean>{
  return await bcrypt.compare(candidatePassword,userPassword)
}
UserSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  console.log({ resetToken }, this.passwordResetToken);

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User: Model<IUser> = mongoose.model<IUser>('User', UserSchema);

export { User, IUser };