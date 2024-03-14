import { Hotel } from "../model/Hotel";
import { Staff } from "../model/Staff";

interface IStaffRepo {
    save(newStaff: Staff): Promise<void>;
    update(updatedStaff: Staff): Promise<void>;
    delete(staffId: number): Promise<void>;
    retrieveById(staffId: number): Promise<Staff>;
    retrieveAll(): Promise<any[]>;
    retrieveAllManagers(): Promise<Staff[]>;
    retrieveAllReceptionists(): Promise<Staff[]>;
    retrieveAllStaffByHotelId(hotelId: number): Promise<Staff[]>;
}

export class StaffRepo implements IStaffRepo {

    async save(newStaff: Staff): Promise<void> {
        try {
            await Staff.create({
                email: newStaff.email,
                password: newStaff.password,
                full_name: newStaff.full_name,
                gender: newStaff.gender,
                phone: newStaff.phone,
                dob: newStaff.dob,
                avatar: newStaff.avatar,
                hotel_id: newStaff.hotel_id,
                role: newStaff.role,
            });
        } catch (error) {
            throw new Error("Failed to create staff!");
        }
    }

    async update(updatedStaff: Staff): Promise<void> {
        try {
            const existingStaff = await Staff.findOne({
                where: {
                    id: updatedStaff.id,
                },
            });

            if (!existingStaff) {
                throw new Error("Staff not found!");
            }

            existingStaff.email = updatedStaff.email;
            existingStaff.password = updatedStaff.password;
            existingStaff.full_name = updatedStaff.full_name;
            existingStaff.gender = updatedStaff.gender;
            existingStaff.phone = updatedStaff.phone;
            existingStaff.dob = updatedStaff.dob;
            existingStaff.avatar = updatedStaff.avatar;
            existingStaff.hotel_id = updatedStaff.hotel_id;
            existingStaff.role = updatedStaff.role;

            await existingStaff.save();
        } catch (error) {
            throw new Error("Failed to update staff!");
        }
    }

    async delete(staffId: number): Promise<void> {
        try {
            const existingStaff = await Staff.findOne({
                where: {
                    id: staffId,
                },
            });
            if (!existingStaff) {
                throw new Error("Staff not found!");
            }

            await existingStaff.destroy();
        } catch (error) {
            throw new Error("Failed to delete staff!");
        }
    }

    async retrieveById(staffId: number): Promise<Staff> {
        try {
            const existingStaff = await Staff.findOne({
                where: {
                    id: staffId,
                },
            });
            if (!existingStaff) {
                throw new Error("Staff not found!");
            }
            return existingStaff;
        } catch (error) {
            throw new Error("Failed to retrieve staff by ID!");
        }
    }

    async retrieveAll(): Promise<any[]> {
        try {
            const staffs: Staff[] = await Staff.findAll({
                order: [['id', 'asc']]
            });

            const staffsWithHotel = await Promise.all(
                staffs.map(async (staff: Staff) => {
                    const staffHotels = await Hotel.findAll({
                        where: {
                            id: staff.hotel_id,
                        },
                    });
                    return {
                        ...staff.toJSON(),
                        hotel: staffHotels.map((hotel) => ({
                            id: hotel.id,
                            name: hotel.name
                        })),
                    };
                })
            )

            // Remove the 'hotel_id' field from each object in 'staffsWithHotel'
            const staffsWithoutHotelId = staffsWithHotel.map((staff) => {
                const { hotel_id, ...rest } = staff;
                return rest;
            });

            return staffsWithoutHotelId;
        } catch (error) {
            throw new Error("Failed to retrieve all staff!");
        }
    }

    async retrieveAllManagers(): Promise<any[]> {
        try {
            const managers = await Staff.findAll({
                where: {
                    role: 'manager'
                },
                order: [['id', 'asc']]
            });

            const managersWithHotels = await Promise.all(
                managers.map(async (manager: any) => {
                    const hotel = await Hotel.findByPk(manager.hotel_id);
                    return {
                        ...manager.toJSON(),
                        hotel: hotel ? [{ id: hotel.id, name: hotel.name }] : null
                    };
                })
            );

            const managersWithoutHotelId = managersWithHotels.map((manager) => {
                const { hotel_id, ...rest } = manager;
                return rest;
            });

            return managersWithoutHotelId;
        } catch (error) {
            throw new Error("Failed to retrieve all managers!");
        }
    }


    async retrieveAllReceptionists(): Promise<Staff[]> {
        try {
            const receptionists = await Staff.findAll({
                where: {
                    role: 'receptionist'
                },
                order: [['id', 'asc']]
            });

            const receptionistsWithHotels = await Promise.all(
                receptionists.map(async (receptionist: any) => {
                    const hotel = await Hotel.findByPk(receptionist.hotel_id);
                    return {
                        ...receptionist.toJSON(),
                        hotel: hotel ? [{ id: hotel.id, name: hotel.name }] : null
                    };
                })
            );

            const receptionistsWithoutHotelId = receptionistsWithHotels.map((receptionist) => {
                const { hotel_id, ...rest } = receptionist;
                return rest;
            });

            return receptionistsWithoutHotelId;
        } catch (error) {
            throw new Error("Failed to retrieve all receptionists!");
        }
    }

    async retrieveAllStaffByHotelId(hotelId: number): Promise<Staff[]> {
        try {
            const staffs = await Staff.findAll({
                where: {
                    hotel_id: hotelId
                },
                order: [['id', 'asc']]
            });

            return staffs;
        } catch (error) {
            throw new Error("Failed to retrieve staff by hotel ID!");
        }
    }

}
