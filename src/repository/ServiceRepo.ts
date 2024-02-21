import { Service } from "../model/Service";

interface IServiceRepo {
    save(service: Service): Promise<void>;
    update(service: Service): Promise<void>;
    delete(serviceId: number): Promise<void>;
    retrieveById(serviceId: number): Promise<Service>;
    retrieveAll(): Promise<Service[]>;
}

export class ServiceRepo implements IServiceRepo {

    async save(service: Service): Promise<void> {
        try {
            await Service.create({
                name: service.name,
                description: service.description,
            });
        } catch (error) {
            throw new Error("Failed to create service!");
        }
    }
    async update(service: Service): Promise<void> {
        try {
            const new_service = await Service.findOne({
                where: {
                    id: service.id,
                },
            });
            if (!new_service) {
                throw new Error("Service not found!");
            }
            new_service.name = service.name;
            new_service.description = service.description;

            await new_service.save();
        } catch (error) {
            throw new Error("Failed to create service!");
        }
    }
    async delete(serviceId: number): Promise<void> {
        try {
            const new_service = await Service.findOne({
                where: {
                    id: serviceId,
                },
            });
            if (!new_service) {
                throw new Error("Service not found!");
            }

            await new_service.destroy();
        } catch (error) {
            throw new Error("Failed to create service!");
        }
    }
    async retrieveById(serviceId: number): Promise<Service> {
        try {
            const new_service = await Service.findOne({
                where: {
                    id: serviceId,
                },
            });
            if (!new_service) {
                throw new Error("Service not found!");
            }
            return new_service;
        } catch (error) {
            throw new Error("Failed to create service!");
        }
    }
    async retrieveAll(): Promise<Service[]> {
        try {
            return await Service.findAll();
        } catch (error) {
            throw new Error("Failed to create service!");
        }
    }

}