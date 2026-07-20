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
import type { Request, Response } from "express";
import { User } from "../Models/user.model";
import { generateToken } from "../Utils/generateToken";

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, company, address, phoneNumber } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ message: "Name, email and password are required" });
      return;
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400).json({ message: "User already exists" });
      return;
    }

    const user = await User.create({ name, email, password, company, address, phoneNumber });
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(String(user._id)),
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Server error during registration" });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: "Email and password are required" });
      return;
    }

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(String(user._id)),
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
};

// Returns the currently authenticated user. Used by the frontend after an
// OAuth redirect (which only carries a token) to fetch the user's details.
export const getMe = async (req: Request, res: Response): Promise<void> => {
  const user = (req as { user?: unknown }).user;
  if (!user) {
    res.status(401).json({ message: "Not authorized" });
    return;
  }
  res.json(user);
};

