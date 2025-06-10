
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


import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  company: String,
  address: String,
  phoneNumber:{type:Number, require:true}
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.matchPassword = async function (password: string) {
  return await bcrypt.compare(password, this.password);
};

export const User = mongoose.model("User", userSchema);


