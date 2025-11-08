import mongoose from "mongoose";
import UserModel from "../models/user.model.js";
import AccountModel from "../models/account.model.js";
import WorkspaceModel from "../models/workspace.model.js";
import RoleModel from "../models/roles-permission.model.js";
import { Roles } from "../enums/role.enum.js";
import { NotFoundException } from "../utils/app-error.js";
import MemberModel from "../models/member.model.js";

export const loginOrCreateAccountService = async (data: {
    provider: string;
    displayName: string;
    providerId: string;
    picture?: string | undefined;
    email?: string | undefined;
}) => {
    const { providerId, provider, displayName, email, picture } = data;

    const session = await mongoose.startSession();

    try {
        session.startTransaction();
        console.log("Started Session...");

        let user = await UserModel.findOne({ email });

        if(!user) {
            // Create a new user if it doesnt exists
            user = new UserModel({
                email,
                name: displayName,
                profilePicture: picture || null
            });
            await user.save({ session });

            const account = new AccountModel({
                userId: user._id,
                provider: provider,
                providerId: providerId,
            });
            await account.save({ session });

            // Create a new workspace for the new user
            const workspace = new WorkspaceModel({
                name: `My Workspace`,
                description: `Workspace created for ${user.name}`,
                owner: user._id,
            });
            await workspace.save({ session });

            const ownerRole = await RoleModel.findOne({
                name: Roles.OWNER,
            }).session(session);

            if(!ownerRole) {
                throw new NotFoundException(`Owner role not found`);
            };

            const member = new MemberModel({
                userId: user._id,
                workspaceId: workspace._id,
                role: ownerRole._id,
                joinedAt: new Date(),
            });
            await member.save({ session });

            user.currentWorkspace = workspace._id as mongoose.Types.ObjectId;
            await user.save({ session });
        };
        
        await session.commitTransaction();
        session.endSession();
        console.log("End Session...");

        return { user };
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    } finally {
        session.endSession();
    }
}