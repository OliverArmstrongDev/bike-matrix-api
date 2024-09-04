import { Router } from "express";
import { authenticateToken } from "../../../middleware/auth";
import { BikeModel } from "../models/bikeModel";
const { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } = process.env;

if (!ACCESS_TOKEN_SECRET || !REFRESH_TOKEN_SECRET) throw new Error('Required env vars not set');

const router = Router();

router.get('/bikes', authenticateToken, async (req: any, res: any) => {
    try {
        const allBikes = await BikeModel.find({ email: req.user.email });
        res.status(200).json(allBikes);
    } catch (err) {
        console.log("🚀 ~ Error: ", err);
        res.status(500).json({ error: 'Failed to update bike' });
    }
});

router.get('/bikes/:id', async (req: any, res: any) => {
    try {
        const { id } = req?.params;
        const bike = await BikeModel.find({ _id: id }).lean();
        res.status(200).json(bike);
    } catch (err) {
        console.log("🚀 ~ Error: ", err);
        res.status(500).json({ error: 'Failed to update bike' });
    }

});

router.delete('/bikes/:id', async (req: any, res: any) => {
    try {
        const { id } = req?.params;
        const deletedBike = await BikeModel.deleteOne({ _id: id });
        if (deletedBike?.deletedCount !== 1) { return res.status(404).send('Bike not found') };
        const updatedBikes = await BikeModel.find();
        res.status(200).json(updatedBikes);
    } catch (err) {
        console.log("🚀 ~ Error: ", err);
        res.status(500).json({ error: 'Failed to delete bike' });
    }
});

router.put('/bikes/:id', async (req: any, res: any) => {
    try {
        const { id } = req.params;
        const updateBikeData = req.body;

        const updatedBike = await BikeModel.findByIdAndUpdate(id, updateBikeData, {
            new: true,
            runValidators: true
        }).lean();

        if (!updatedBike) {
            return res.status(404).json({ error: 'Bike not found' });
        }
        res.status(200).json(updatedBike);
    } catch (err) {
        console.log("🚀 ~ Error: ", err);
        res.status(500).json({ error: 'Failed to update bike' });
    }

});

router.post('/bikes', authenticateToken, async (req: any, res: any) => {
    try {
        const newBike = await BikeModel.create({ ...req.body, email: req.user.email });
        return res.status(200).json(newBike);
    } catch (err) {
        console.log("🚀 ~ Error: ", err);
        res.status(500).json({ error: 'Failed to create bike' });
    }
});

export default router;