import { Province } from "../model/Province";

interface IAddressRepo {
    retrieveAllProvinces(): Promise<any[]>;
}

export class AddressRepo implements IAddressRepo {
    async retrieveAllProvinces(): Promise<any[]> {
        try {
            const hotels = await Province.findAll({
                order: [['id', 'asc']]
            });

            return hotels;
        } catch (error) {
            throw new Error("Failed to retrieve all provinces!");
        }
    }
}
