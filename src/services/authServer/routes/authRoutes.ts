import { Router } from "express";
import { verify } from 'jsonwebtoken';
import { hash, compare } from 'bcrypt';
import { UserModel } from "../models/userModel";
import { TokenModel } from "../models/tokenModel";
import generateTokens from "../../../utils/generateTokens";
import { authenticateToken } from "../../../middleware/auth";

const {ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET} = process.env;

if(!ACCESS_TOKEN_SECRET || !REFRESH_TOKEN_SECRET) throw new Error('Required env vars not set');

const router = Router();

router.get('/me', authenticateToken , async (req: any, res: any) => {
    const user = await UserModel.findOne({_id: req?.user?._id});
    if(!user) return res.status(404).send('User not found');
    res.status(200).json({
        _id: user?._id,
        name: user?.name,
        email: user?.email,
        token: req?.user?.token,
    });
});

router.get('/users/:id', authenticateToken , async (req: any, res: any) => {
    const { id } = req?.params;
    const user = await UserModel.findOne({_id: id});
    res.status(200).json(user);
});

router.post('/signup', async (req: any, res: any) => {
    try {
        const {name, email, password}= req.body;
        const userExists = await UserModel.findOne({email}).lean();
        if(userExists) return res.status(401).send('That user exists');

        const hashedPwd = await hash(password, 10);
        const user = { name, email, password: hashedPwd };
        await UserModel.create(user);
        return res.sendStatus(201);

    } catch (error) {
        return res.sendStatus(500);
    }
   
});

router.delete('/logout', async (req: any, res: any) => {
    const {token} = req.body;
    const refreshToken = await TokenModel.findOne({token});
    if(refreshToken) await refreshToken.deleteOne({_id: refreshToken._id});
    res.status(200).send("logged out successfully");
})

router.post('/login', async (req: any, res: any) => {
    try {
        const { email, password } = req.body;
        // Check if user exists in DB
        const user = await UserModel.findOne({email}).lean();
        if (!user) return res.status(400).send('User not found')
        // Check if password from body matches the hashed password in DB...
        const match = await compare(password, user.password);
        if (!match) return res.status(500).send("Wrong username or password");

        const tokenUser = {_id: user._id, name: user.name, email: user.email};
        const {accessToken, refreshToken} = await generateTokens(tokenUser);
        await TokenModel.create({userId: user._id, token: refreshToken});
        // refreshTokens.push(refreshToken);
        return res.status(200).json({ accessToken, refreshToken, message: 'Logged in successfully' });

    } catch (error) {
       res.status(500).send('An Error occurred: ' + error)
    }


});

// Route for renewing token...
router.post('/token', async (req: any, res: any) => {
    const {token} = req.body;
    if(!token) return res.sendStatus(401);

    const refreshToken = await TokenModel.findOne({token}).lean();
    if(!refreshToken) return res.status(403).send("Invalid Refresh Token");
    verify(token, REFRESH_TOKEN_SECRET, async (err: any, user: any)=> {
        if(err) return res.status(403).send("Token verification failed");
        const {accessToken, error} = await generateTokens({_id: user._id, name: user.name});
        if(error) {res.status(501).send("Failed to generate new token"); return; }
        return res.json({error: false, accessToken, message: "Access token created successfully"});
    })
});


export default router;