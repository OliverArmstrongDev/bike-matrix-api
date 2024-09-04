import {verify, sign } from 'jsonwebtoken';
import 'dotenv/config'

const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1] || null;
    if(!token) return res.sendStatus(401);

    verify(token, process.env.ACCESS_TOKEN_SECRET!, (err: any, user:any)=> {
        if(err) return res.status(403).send("Access denied!");
        // Attach user to request
        req.user = user;
        req.user.token = token;
        next();
    });

};

export {authenticateToken}