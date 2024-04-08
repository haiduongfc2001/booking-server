import { District } from "../model/District";
import { Province } from "../model/Province";

interface IAddressRepo {
    retrieveAllProvinces(): Promise<Province[]>;
    retrieveAllDistricts(): Promise<District[]>;
}

export class AddressRepo implements IAddressRepo {
    async retrieveAllProvinces(): Promise<Province[]> {
        try {
            const provinces = await Province.findAll();

            return provinces;
        } catch (error) {
            throw new Error("Failed to retrieve all provinces!");
        }
    }

    async retrieveAllDistricts(): Promise<District[]> {
        try {
            const districts = await District.findAll();

            return districts;
        } catch (error) {
            throw new Error("Failed to retrieve all districts!");
        }
    }
}
