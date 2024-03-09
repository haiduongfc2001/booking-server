import { Staff } from "../model/Staff";

interface IStaffRepo {
    save(newStaff: Staff): Promise<void>;
    update(updatedStaff: Staff): Promise<void>;
    delete(staffId: number): Promise<void>;
    retrieveById(staffId: number): Promise<Staff>;
    retrieveAll(): Promise<Staff[]>;
    retrieveAllManagers(): Promise<Staff[]>;
    retrieveAllReceptionists(): Promise<Staff[]>;
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

    async retrieveAll(): Promise<Staff[]> {
        try {
            return await Staff.findAll({
                order: [['id', 'asc']]
            });
        } catch (error) {
            throw new Error("Failed to retrieve all staff!");
        }
    }

    async retrieveAllManagers(): Promise<Staff[]> {
        try {
            return await Staff.findAll({
                where: {
                    role: 'manager'
                }
            })
        } catch (error) {
            throw new Error("Failed to retrieve all managers!");
        }
    }

    async retrieveAllReceptionists(): Promise<Staff[]> {
        try {
            return await Staff.findAll({
                where: {
                    role: 'receptionist'
                }
            })
        } catch (error) {
            throw new Error("Failed to retrieve all receptionists!");
        }
    }
}
