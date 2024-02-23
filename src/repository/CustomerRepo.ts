import { Customer } from "../model/Customer";

interface ICustomerRepo {
    save(customer: Customer): Promise<void>;
    update(customer: Customer): Promise<void>;
    delete(customerId: number): Promise<void>;
    retrieveById(customerId: number): Promise<Customer>;
    retrieveAll(): Promise<Customer[]>;
}

export class CustomerRepo implements ICustomerRepo {

    async save(customer: Customer): Promise<void> {
        try {
            await Customer.create({
                username: customer.username,
                email: customer.email,
                password: customer.password,
                full_name: customer.full_name,
                gender: customer.gender,
                phone: customer.phone,
                avatar_url: customer.avatar_url,
                address: customer.address,
                location: customer.location,
            });
        } catch (error) {
            throw new Error("Failed to create customer!");
        }
    }

    async update(customer: Customer): Promise<void> {
        try {
            const new_customer = await Customer.findOne({
                where: {
                    id: customer.id,
                },
            });

            if (!new_customer) {
                throw new Error("Customer not found!");
            }

            new_customer.username = customer.username;
            new_customer.password = customer.password;
            new_customer.email = customer.email;
            new_customer.full_name = customer.full_name;
            new_customer.gender = customer.gender;
            new_customer.phone = customer.phone;
            new_customer.avatar_url = customer.avatar_url;
            new_customer.address = customer.address;
            new_customer.location = customer.location;

            await new_customer.save();
        } catch (error) {
            throw new Error("Failed to create customer!");
        }
    }

    async delete(customerId: number): Promise<void> {
        try {
            const new_customer = await Customer.findOne({
                where: {
                    id: customerId,
                },
            });
            if (!new_customer) {
                throw new Error("Customer not found!");
            }

            await new_customer.destroy();
        } catch (error) {
            throw new Error("Failed to create customer!");
        }
    }

    async retrieveById(customerId: number): Promise<Customer> {
        try {
            const new_customer = await Customer.findOne({
                where: {
                    id: customerId,
                },
            });
            if (!new_customer) {
                throw new Error("Customer not found!");
            }
            return new_customer;
        } catch (error) {
            throw new Error("Failed to create customer!");
        }
    }

    async retrieveAll(): Promise<Customer[]> {
        try {
            return await Customer.findAll();
        } catch (error) {
            throw new Error("Failed to create customer!");
        }
    }

}