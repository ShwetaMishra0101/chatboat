// import {Request, Response} from 'express';
// import {User} from '../Models/user.model';
// import { generateToken } from '../Utils/generateToken';

// export const register =  async function (req:Request,res:Response) {

//     const {name, email, password,company,address,phoneNumber} = req.body;
//     const userExists = await User.findOne({email});
//     if(userExists) return res.status(400).json({message:"User already exists"});
    
//     const user = await User.create({name, email, password, company, address, phoneNumber});
//     res.status(201).json({
//         _id:user._id,
//        token: generateToken(user._id);

//     })
    
// }


// export const login  =  async(req:Request, res:Response) =>{
//     const {email, password} = req.body;
//     const user = await User.findOne({email});
//     (!user || !(await user.matchPassword(password))){
//         return res.status(401).json({message:"Invalid Credentials"});

//     }
//     res.json({
//         _id: user._id,
//         token: generateToken(user._id);
//     })


// }
import { Request, Response } from "express";
import { User } from "../models/user.model";
import { generateToken } from "../utils/generateToken";

export const register = async (req: Request, res: Response) => {
  const { name, email, password, company, address , phoneNumber} = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) return res.status(400).json({ message: "User already exists" });

  const user = await User.create({ name, email, password, company, address, phoneNumber });
  res.status(201).json({ 
    _id: user._id,
    token: generateToken(user._id)
  });
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  res.json({ 
    _id: user._id,
    token: generateToken(user._id)
  });
};

