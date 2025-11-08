import "dotenv/config";
import mongoose from "mongoose";
import connectDatabase from "../config/db.config.js"
import RoleModel from "../models/roles-permission.model.js"
import { RolePermissions } from "../utils/rules-permission.js"

const seedRoles = async () => {
    console.log("Seeding roles in database...");

    try {
        await connectDatabase();

        const session = await mongoose.startSession();
        session.startTransaction();

        console.log("Clearing existing roles...");
        await RoleModel.deleteMany({}, { session });

        for(const roleName in RolePermissions) {
            const role = roleName as keyof typeof RolePermissions;
            const permissions = RolePermissions[role];

            // Check if role already exists
            const existingRoles = await RoleModel.findOne({ name: role }).session(session);

            if (!existingRoles) {
                const newRole = new RoleModel({
                    name: role,
                    permissions: permissions,
                });
                await newRole.save({ session });
                console.log(`Role ${role} added with permissions.`);
            } else {
               console.log(`Role ${role} added exists.`); 
            }
        }

        await session.commitTransaction();
        console.log("Transaction committed")

        session.endSession();
        console.log("Session ended.");

        console.log("Seeding completed successfully.");
    } catch (error) {
        console.log("Error during seeding: ", error);
    }
};

seedRoles().catch((error) => 
    console.error("Error running seed scripts: ", error)
)

