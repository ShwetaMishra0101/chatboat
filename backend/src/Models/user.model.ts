
// import mongoose from 'mongoose';
// import bcryptjs from 'bcryptjs';

// const userSchema = new mongoose.Schema({
//     name: {type:String, require:true},
//     email: {type:String, require:true},
//     password: {type:String, require:true, unique:true},
//     phoneNumber:{type:Number, require:true, unique:true},
//     company: String,
//     address: String,

// });


// userSchema.pre("save",async function (next) {
//     if(!this.isModified("password"))
//     return next();
//     this.password = await bcryptjs.hash(this.password, 10);
//     next();
    
// });

// userSchema.method.matchPassword = async function(password: string){

//     return await bcryptjs.compare(password, this.password);
    
// }

// export const User = mongoose.model("User",userSchema);


import mongoose, { Document, Model } from "mongoose";
import bcrypt from "bcryptjs";

export type AuthProvider = "local" | "google" | "github";

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  company?: string;
  address?: string;
  phoneNumber?: string;
  provider: AuthProvider;
  providerId?: string;
  avatar?: string;
  matchPassword(password: string): Promise<boolean>;
}

const userSchema = new mongoose.Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  // password is only required for local (email/password) accounts.
  password: { type: String },
  company: String,
  address: String,
  phoneNumber: { type: String, required: false },
  provider: { type: String, enum: ["local", "google", "github"], default: "local" },
  providerId: String,
  avatar: String,
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.matchPassword = async function (password: string) {
  // OAuth accounts have no password — they can't log in via email/password.
  if (!this.password) return false;
  return await bcrypt.compare(password, this.password);
};

export const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);


