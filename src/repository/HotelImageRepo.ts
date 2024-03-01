import { HotelImage } from "../model/HotelImage";

interface IHotelImageRepo {
    save(hotelImage: HotelImage): Promise<void>;
    retrieveAll(): Promise<HotelImage[]>;
}

export class HotelImageRepo implements IHotelImageRepo {
    async save(hotelImage: HotelImage): Promise<void> {
        try {
            await HotelImage.create({
                hotel_id: hotelImage.hotel_id,
                url: hotelImage.url
            })
        } catch (error) {
            throw new Error("Failed to create hotel image!")
        }
    }

    async retrieveAll(): Promise<HotelImage[]> {
        try {
            return await HotelImage.findAll();
        } catch (error) {
            throw new Error("Failed to create hotel image!");
        }
    }
}