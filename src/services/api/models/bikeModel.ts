import mongoose from "mongoose";

interface IBike {
    brand: string;
    modelName: string;
    year: string;
    email: string;
}

const bikeSchema = new mongoose.Schema<IBike>(
    {
        brand: {
            type: String,
            required: true
        },
        modelName: {
            type: String,
            required: true
        },
        year: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        
    },
    {
        timestamps: true
    });

    export const BikeModel = mongoose.model<IBike>('Bike', bikeSchema);