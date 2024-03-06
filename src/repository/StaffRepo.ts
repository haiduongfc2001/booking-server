import { Staff } from "../model/Staff";

interface IStaffRepo {
    save(staff: Staff): Promise<void>;
    update(staff: Staff): Promise<void>;
    delete(staffId: number): Promise<void>;
    retrieveById(staffId: number): Promise<Staff>;
    retrieveAll(): Promise<Staff[]>;
    retrieveAllManagers(): Promise<Staff[]>;
    retrieveAllReceptionists(): Promise<Staff[]>;
}

export class StaffRepo implements IStaffRepo {

    async save(staff: Staff): Promise<void> {
        try {
            await Staff.create({
                email: staff.email,
                password: staff.password,
                full_name: staff.full_name,
                gender: staff.gender,
                phone: staff.phone,
                dob: staff.dob,
                avatar: staff.avatar,
                hotel_id: staff.hotel_id,
                role: staff.role,
            });
        } catch (error) {
            throw new Error("Failed to create staff!");
        }
    }

    async update(staff: Staff): Promise<void> {
        try {
            const new_staff = await Staff.findOne({
                where: {
                    id: staff.id,
                },
            });

            if (!new_staff) {
                throw new Error("Staff not found!");
            }

            new_staff.email = staff.email;
            new_staff.password = staff.password;
            new_staff.full_name = staff.full_name;
            new_staff.gender = staff.gender;
            new_staff.phone = staff.phone;
            new_staff.dob = staff.dob;
            new_staff.avatar = staff.avatar;
            new_staff.hotel_id = staff.hotel_id;
            new_staff.role = staff.role;

            await new_staff.save();
        } catch (error) {
            throw new Error("Failed to create staff!");
        }
    }

    async delete(staffId: number): Promise<void> {
        try {
            const new_staff = await Staff.findOne({
                where: {
                    id: staffId,
                },
            });
            if (!new_staff) {
                throw new Error("Staff not found!");
            }

            await new_staff.destroy();
        } catch (error) {
            throw new Error("Failed to create staff!");
        }
    }

    async retrieveById(staffId: number): Promise<Staff> {
        try {
            const new_staff = await Staff.findOne({
                where: {
                    id: staffId,
                },
            });
            if (!new_staff) {
                throw new Error("Staff not found!");
            }
            return new_staff;
        } catch (error) {
            throw new Error("Failed to create staff!");
        }
    }

    async retrieveAll(): Promise<Staff[]> {
        try {
            return await Staff.findAll({
                order: [['id', 'asc']]
            });
        } catch (error) {
            throw new Error("Failed to get all staff!");
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
            throw new Error("Failed to get all manager!");
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
            throw new Error("Failed to get all receptionist!");
        }
    }

}