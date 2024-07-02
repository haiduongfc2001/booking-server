import { Op } from "sequelize";
import { Customer } from "../model/Customer";
import { minioConfig } from "../config/minio.config";
import { DEFAULT_MINIO } from "../config/constant.config";

interface ICustomerRepo {
  save(newCustomer: Customer): Promise<void>;
  create(newCustomer: Customer): Promise<void>;
  update(updatedCustomer: Customer): Promise<void>;
  delete(customer_id: number): Promise<void>;
  retrieveById(customer_id: number): Promise<Customer>;
  retrieveAll(): Promise<Customer[]>;
}

export class CustomerRepo implements ICustomerRepo {
  async save(newCustomer: Customer): Promise<void> {
    try {
      await Customer.create({
        password: newCustomer.password,
        email: newCustomer.email,
        full_name: newCustomer.full_name,
        gender: newCustomer.gender,
        phone: newCustomer.phone,
        dob: newCustomer.dob,
        avatar: newCustomer.avatar,
        address: newCustomer.address,
        location: newCustomer.location,
      });
    } catch (error) {
      throw new Error("Failed to save customer!");
    }
  }

  async create(newCustomer: Customer): Promise<void> {
    try {
      await Customer.create({
        email: newCustomer.email,
        password: newCustomer.password,
        full_name: newCustomer.full_name,
        gender: newCustomer.gender,
        phone: newCustomer.phone,
        is_verified: newCustomer.is_verified,
      });
    } catch (error) {
      throw new Error("Failed to save customer!");
    }
  }

  async update(updatedCustomer: Customer): Promise<void> {
    try {
      const existingCustomer = await Customer.findByPk(updatedCustomer.id);

      if (!existingCustomer) {
        throw new Error("Customer not found!");
      }

      existingCustomer.password = updatedCustomer.password;
      existingCustomer.email = updatedCustomer.email;
      existingCustomer.full_name = updatedCustomer.full_name;
      existingCustomer.gender = updatedCustomer.gender;
      existingCustomer.phone = updatedCustomer.phone;
      existingCustomer.dob = updatedCustomer.dob;
      existingCustomer.avatar = updatedCustomer.avatar;
      existingCustomer.address = updatedCustomer.address;
      existingCustomer.location = updatedCustomer.location;

      await existingCustomer.save();
    } catch (error) {
      throw new Error("Failed to update customer!");
    }
  }

  async delete(customer_id: number): Promise<void> {
    try {
      const existingCustomer = await Customer.findByPk(customer_id);
      if (!existingCustomer) {
        throw new Error("Customer not found!");
      }

      await existingCustomer.destroy();
    } catch (error) {
      throw new Error("Failed to delete customer!");
    }
  }

  async retrieveById(customer_id: number): Promise<any> {
    try {
      const existingCustomer = await Customer.findByPk(customer_id);
      if (!existingCustomer) {
        throw new Error("Customer not found!");
      }

      let presignedUrl: string | null = null;

      if (existingCustomer.avatar) {
        try {
          presignedUrl = await new Promise<string>((resolve, reject) => {
            minioConfig
              .getClient()
              .presignedGetObject(
                DEFAULT_MINIO.BUCKET,
                `${DEFAULT_MINIO.CUSTOMER_PATH}/${customer_id}/${existingCustomer.avatar}`,
                24 * 60 * 60,
                (err, url) => {
                  if (err) reject(err);
                  else resolve(url);
                }
              );
          });
        } catch (err) {
          console.error("Failed to generate presigned URL:", err);
          // Continue without throwing an error to allow returning the customer data
        }
      }

      return { ...existingCustomer.toJSON(), avatar: presignedUrl };
    } catch (error) {
      console.error("Failed to retrieve customer:", error);
      throw new Error("Failed to retrieve customer!");
    }
  }

  async retrieveAll(): Promise<Customer[]> {
    try {
      return await Customer.findAll({
        order: [["id", "asc"]],
      });
    } catch (error) {
      throw new Error("Failed to retrieve all customers!");
    }
  }

  async countCustomersByMonth(year: number, month: number): Promise<number> {
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 1);

    const count = await Customer.count({
      where: {
        created_at: {
          [Op.gte]: startDate,
          [Op.lt]: endDate,
        },
      },
      distinct: true,
    });

    return count;
  }
}
