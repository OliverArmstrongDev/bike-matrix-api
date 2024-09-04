import mongoose from "mongoose";

interface IToken {
    userId: mongoose.Schema.Types.ObjectId;
    token: string;
}

const tokenSchema = new mongoose.Schema<IToken>(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
        
        token: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true
    });

    export const TokenModel = mongoose.model<IToken>('Token', tokenSchema);