import { sign, verify } from 'jsonwebtoken';
import { TokenModel } from '../services/authServer/models/tokenModel';

const { REFRESH_TOKEN_SECRET } = process.env;

const verifyRefreshToken = async (token: string): Promise<any> => {
    try {
        return new Promise((resolve, reject) => {
            TokenModel.findOne({token}, (err: any, tokenDoc: any)=> {
                if(!tokenDoc) return reject({error: true, message: "Invalid refresh token"});
                verify(token, REFRESH_TOKEN_SECRET!, (err: any, tokenDetails: any)=> {
                    if(err) return reject({error: true, message: "Varification failed for this token"});
                    resolve({tokenDetails, error: false, message: "Valid refresh token"});
                })
            })

        })
    } catch (error) {
        return Promise.reject(error);
    }
}

export default verifyRefreshToken;