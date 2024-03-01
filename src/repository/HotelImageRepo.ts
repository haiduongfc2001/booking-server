import { HotelImage } from "../model/HotelImage";

interface IHotelImageRepo {
    retrieveAll(): Promise<HotelImage[]>;
}

export class HotelImageRepo implements IHotelImageRepo {
    async retrieveAll(): Promise<HotelImage[]> {
        try {
            return await HotelImage.findAll();
        } catch (error) {
            throw new Error("Failed to create hotel image!");
        }
    }
}