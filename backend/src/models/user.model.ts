import mongoose, { Document, Schema } from "mongoose";
import { comparePassword, hashValue } from "../utils/bcrypt.js";

export interface UserDocument extends Document {
    name: string;
    email: string;
    password?: string;
    profilePicure: string | null;
    isActive: boolean;
    lastLogin: Date | null;
    createdAt: Date;
    updatedAt: Date;
    currentWorkspace: mongoose.Types.ObjectId | null;
    comparePassword(value: string): Promise<boolean>;
    omitPassword(): Omit<UserDocument, "password">;
};

const userSchema = new Schema<UserDocument>({
    name: {
        type: String,
        required: true,
        trim: false,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    password: {
        type: String,
        select: true
    },
    profilePicure: {
        type: String,
        default: null
    },
    currentWorkspace: {
        type: mongoose.Types.ObjectId,
        ref: "Workspace",
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastLogin: {
        type: Date,
        default: null
    },
}, {
    timestamps: true
});

userSchema.pre("save", async function (next) {
    if(this.isModified("password")) {
        if(this.password) {
            this.password = await hashValue(this.password)
        }
    }
    next();
});

userSchema.methods.omitPassword = function (): Omit<UserDocument, "password"> {
    const userObject = this.toObject();
    delete userObject.password;
    return userObject;
};

userSchema.methods.comparePassword = async function (value: string) {
    return comparePassword(value, this.password);
};

const UserModel = mongoose.model("User", userSchema);
export default UserModel;