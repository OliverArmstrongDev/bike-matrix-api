import { sign, verify } from 'jsonwebtoken';
import { TokenModel } from '../services/authServer/models/tokenModel';

const { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } = process.env;

const generateTokens = async (user: any) => {
    try {
        const accessToken = sign(user, ACCESS_TOKEN_SECRET!, { expiresIn: '120m' }); //Setting token to 2 hours, bc refresh token is not being used
        const refreshToken = sign(user, REFRESH_TOKEN_SECRET!, { expiresIn: '30d' });

        const userToken = await TokenModel.findOne({_id: user._id}).lean();
        if (userToken) await TokenModel.deleteOne(userToken);

        return { error: false, accessToken, refreshToken }
    } catch (error) {
        console.log("🚀 ~ Error: ", error )
        return {error: true, message: error};
    }
}

export default generateTokens;