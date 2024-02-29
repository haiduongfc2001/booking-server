import { Request, Response } from "express";
import { Hotel } from "../model/Hotel";
import { HotelRepo } from "../repository/HotelRepo";

class HotelController {
    async create(req: Request, res: Response) {
        try {
            const new_hotel = new Hotel();
            new_hotel.name = req.body.name;
            new_hotel.address = req.body.address;
            new_hotel.location = req.body.location;
            new_hotel.description = req.body.description;

            // const existingHotel = await Hotel.findOne({
            //     where: {
            //         username: req.body.name,
            //     }
            // })

            // if (existingHotel) {
            //     return res.status(400).json({
            //         status: "Bad Request",
            //         message: "Hotel already exists!"
            //     });
            // }

            await new HotelRepo().save(new_hotel);

            res.status(201).json({
                status: 201,
                message: "Successfully created hotel!",
            });
        } catch (err) {
            res.status(500).json({
                status: "Internal Server Error!",
                message: "Internal Server Error!",
            });
        }
    }

    async delete(req: Request, res: Response) {
        try {
            let id = parseInt(req.params["id"]);

            const existingHotel = await Hotel.findOne({
                where: {
                    id: id,
                }
            });

            if (!existingHotel) {
                return res.status(400).json({
                    status: "Bad Request",
                    message: "Hotel not found!",
                });
            }

            await new HotelRepo().delete(id);

            res.status(200).json({
                status: 200,
                message: "Successfully deleted hotel!",
            });
        } catch (err) {
            res.status(500).json({
                status: "Internal Server Error!",
                message: "Internal Server Error!",
            });
        }
    }

    async findById(req: Request, res: Response) {
        try {
            let id = parseInt(req.params["id"]);

            const existingHotel = await Hotel.findOne({
                where: {
                    id: id,
                }
            });

            if (!existingHotel) {
                return res.status(400).json({
                    status: "Bad Request",
                    message: "Hotel not found!",
                });
            }

            const new_hotel = await new HotelRepo().retrieveById(id);

            res.status(200).json({
                status: 200,
                message: `Successfully fetched hotel by id ${id}!`,
                data: new_hotel,
            });
        } catch (err) {
            res.status(500).json({
                status: "Internal Server Error!",
                message: "Internal Server Error!",
            });
        }
    }

    async findAll(req: Request, res: Response) {
        try {
            const new_hotel = await new HotelRepo().retrieveAll();

            res.status(200).json({
                status: 200,
                message: "Successfully fetched all hotel data!",
                data: new_hotel,
            });
        } catch (err) {
            res.status(500).json({
                status: "Internal Server Error!",
                message: "Internal Server Error!",
            });
        }
    }

    async update(req: Request, res: Response) {
        try {
            const id = parseInt(req.params["id"]);
            const hotelToUpdate = await Hotel.findByPk(id);

            if (!hotelToUpdate) {
                return res.status(404).json({
                    status: "Not Found",
                    message: "Hotel not found"
                });
            }

            const fieldsToUpdate = [
                'username', 'password', 'email', 'full_name',
                'gender', 'phone', 'avatar_url', 'address',
                'location'
            ];

            fieldsToUpdate.forEach(field => {
                if (req.body[field]) {
                    (hotelToUpdate as any)[field] = req.body[field];
                }
            });

            await hotelToUpdate.save();

            res.status(200).json({
                status: 200,
                message: "Successfully updated hotel data!",
            });
        } catch (err) {
            res.status(500).json({
                status: "Internal Server Error!",
                message: "Internal Server Error!",
            });
        }
    }

}

export default new HotelController()