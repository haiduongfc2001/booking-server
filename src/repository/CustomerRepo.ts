import { Customer } from "../model/Customer";

interface ICustomerRepo {
  save(newCustomer: Customer): Promise<void>;
  update(updatedCustomer: Customer): Promise<void>;
  delete(customer_id: number): Promise<void>;
  retrieveById(customer_id: number): Promise<Customer>;
  retrieveAll(): Promise<Customer[]>;
}

export class CustomerRepo implements ICustomerRepo {
  async save(newCustomer: Customer): Promise<void> {
    try {
      await Customer.create({
        username: newCustomer.username,
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

  async update(updatedCustomer: Customer): Promise<void> {
    try {
      const existingCustomer = await Customer.findByPk(updatedCustomer.id);

      if (!existingCustomer) {
        throw new Error("Customer not found!");
      }

      existingCustomer.username = updatedCustomer.username;
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

  async retrieveById(customer_id: number): Promise<Customer> {
    try {
      const existingCustomer = await Customer.findByPk(customer_id);
      if (!existingCustomer) {
        throw new Error("Customer not found!");
      }

      return existingCustomer;
    } catch (error) {
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
}
