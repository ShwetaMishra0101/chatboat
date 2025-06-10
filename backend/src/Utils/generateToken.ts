import jwt from 'jsonwebtoken';

export const generateToken = (userID:string) =>{
    return jwt.sign({id:userID}, process.env.JWT_SECRET as string,{
        expiresIn: "7d",
    })
}