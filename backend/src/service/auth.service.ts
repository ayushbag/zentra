import mongoose from "mongoose";
import UserModel from "../models/user.model.js";
import AccountModel from "../models/account.model.js";
import WorkspaceModel from "../models/workspace.model.js";
import RoleModel from "../models/roles-permission.model.js";
import { Roles } from "../enums/role.enum.js";
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from "../utils/app-error.js";
import MemberModel from "../models/member.model.js";
import { z } from "zod";
import { registerSchema } from "../validation/auth.validation.js";
import { ProviderEnum } from "../enums/account-provider.enum.js";

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

    if (!user) {
      // Create a new user if it doesnt exists
      user = new UserModel({
        email,
        name: displayName,
        profilePicture: picture || null,
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

      if (!ownerRole) {
        throw new NotFoundException(`Owner role not found`);
      }

      const member = new MemberModel({
        userId: user._id,
        workspaceId: workspace._id,
        role: ownerRole._id,
        joinedAt: new Date(),
      });
      await member.save({ session });

      user.currentWorkspace = workspace._id as mongoose.Types.ObjectId;
      await user.save({ session });
    }

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
};

export const registerUserService = async (
  body: z.infer<typeof registerSchema>
) => {
  const { email, name, password } = body;
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const existingUser = await UserModel.findOne({ email }).session(session);
    if (existingUser) {
      throw new BadRequestException("Email already exists");
    }

    const user = new UserModel({
      email,
      name,
      password,
    });
    await user.save({ session });

    const account = new AccountModel({
      userId: user._id,
      provider: ProviderEnum.EMAIL,
      providerId: email,
    });
    await account.save({ session });

    // create a new workspace for new user
    const workspace = new WorkspaceModel({
      name: "My Workspace",
      description: `Workspace created for ${user.name}`,
      owner: user._id,
    });
    await workspace.save({ session });

    const ownerRole = await RoleModel.findOne({
      name: Roles.OWNER,
    }).session(session);

    if (!ownerRole) {
      throw new NotFoundException("Owner role not found");
    }

    const member = new MemberModel({
      userId: user._id,
      workspaceId: workspace._id,
      role: ownerRole._id,
      joinedAt: new Date(),
    });
    await member.save({ session });

    user.currentWorkspace = workspace._id as mongoose.Types.ObjectId;
    await user.save({ session });

    await session.commitTransaction();
    session.endSession();
    console.log("End Session...");

    return {
      userId: user._id,
      workspaceId: workspace._id,
    };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

export const verifyUserService = async ({
  email,
  password,
  provider = ProviderEnum.EMAIL,
}: {
  email: string;
  password: string;
  provider?: string;
}) => {
  console.log("verifyUserService → called with", { email, provider });

  const account = await AccountModel.findOne({ provider, providerId: email });
  console.log("verifyUserService → account found:", !!account);

  if (!account) {
    throw new NotFoundException("Invalid email or password (no account)");
  }

  const user = await UserModel.findById(account.userId);
  console.log("verifyUserService → user found:", !!user);

  if (!user) {
    throw new NotFoundException("User not found for given account");
  }

  const isMatch = await user.comparePassword(password);
  console.log("verifyUserService → password match:", isMatch);

  if (!isMatch) {
    throw new UnauthorizedException("Invalid email or password (bad password)");
  }

  return user.omitPassword();
};
