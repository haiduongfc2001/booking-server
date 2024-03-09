import { Service } from "../model/Service";

interface IServiceRepo {
    save(newService: Service): Promise<void>;
    update(updatedService: Service): Promise<void>;
    delete(serviceId: number): Promise<void>;
    retrieveById(serviceId: number): Promise<Service>;
    retrieveAll(): Promise<Service[]>;
}

export class ServiceRepo implements IServiceRepo {

    async save(newService: Service): Promise<void> {
        try {
            await Service.create({
                name: newService.name,
                description: newService.description,
            });
        } catch (error) {
            throw new Error("Failed to create service!");
        }
    }

    async update(updatedService: Service): Promise<void> {
        try {
            const existingService = await Service.findOne({
                where: {
                    id: updatedService.id,
                },
            });
            if (!existingService) {
                throw new Error("Service not found!");
            }
            existingService.name = updatedService.name;
            existingService.description = updatedService.description;

            await existingService.save();
        } catch (error) {
            throw new Error("Failed to update service!");
        }
    }

    async delete(serviceId: number): Promise<void> {
        try {
            const existingService = await Service.findOne({
                where: {
                    id: serviceId,
                },
            });
            if (!existingService) {
                throw new Error("Service not found!");
            }

            await existingService.destroy();
        } catch (error) {
            throw new Error("Failed to delete service!");
        }
    }

    async retrieveById(serviceId: number): Promise<Service> {
        try {
            const existingService = await Service.findOne({
                where: {
                    id: serviceId,
                },
            });
            if (!existingService) {
                throw new Error("Service not found!");
            }
            return existingService;
        } catch (error) {
            throw new Error("Failed to retrieve service by ID!");
        }
    }

    async retrieveAll(): Promise<Service[]> {
        try {
            return await Service.findAll();
        } catch (error) {
            throw new Error("Failed to retrieve all services!");
        }
    }
}
