import { Request, Response } from "express";
import { HotelImageRepo } from "../repository/HotelImageRepo";

class HotelImageController {
    async findAll(req: Request, res: Response) {
        try {
            const new_hotel_image = await new HotelImageRepo().retrieveAll();

            res.status(200).json({
                status: 200,
                message: "Successfully fetched all hotel image data!",
                data: new_hotel_image,
            });
        } catch (err) {
            res.status(500).json({
                status: 500,
                message: "Internal Server Error!",
            });
        }
    }
}

export default new HotelImageController()