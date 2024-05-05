import { District } from "../model/District";
import { Province } from "../model/Province";
import { Ward } from "../model/Ward";

interface IAddressRepo {
  retrieveAllProvinces(): Promise<Province[]>;
  retrieveAllDistricts(): Promise<District[]>;
  retrieveAllWards(): Promise<Ward[]>;
}

export class AddressRepo implements IAddressRepo {
  async retrieveAllProvinces(): Promise<Province[]> {
    try {
      const provinces = await Province.findAll({
        attributes: ["id", "name", "level"],
      });

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

  async retrieveAllWards(): Promise<Ward[]> {
    try {
      const wards = await Ward.findAll();

      return wards;
    } catch (error) {
      throw new Error("Failed to retrieve all wards!");
    }
  }
}
