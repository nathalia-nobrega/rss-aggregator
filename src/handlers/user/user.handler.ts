import * as bcrypt from "bcrypt";
import { randomUUID } from "crypto";
import { ServerResponse } from "http";
import {
    existsByEmail,
    findAllUsers,
    findUserByEmail,
    insertUser,
} from "../../db/user.queries.js";
import { RouterIncomingMessage } from "../../types/http.js";
import { UserDB } from "../../types/user/models.js";
import {
    LoginRequest,
    RegisterUserRequest,
} from "../../types/user/requests.js";
import { generateAccessToken } from "../../utilities/jwt.js";
import {
    sendConflictResponse,
    sendCreatedResponse,
    sendError,
    sendSuccessResponse,
    sendUnauthorizedResponse,
} from "../../utilities/response.js";
import { entityToUser } from "../../utilities/transformers.js";

export const registerUser = async (
    req: RouterIncomingMessage,
    res: ServerResponse
) => {
    const registerPayload = req.body as RegisterUserRequest;
    try {
        const existingUserWithEmail = existsByEmail.get(
            registerPayload.email
        ) as { email_already_registered: number };

        if (existingUserWithEmail.email_already_registered === 1) {
            return sendConflictResponse(res, "E-mail already registered");
        }

        const saltOrRounds = 10;
        const hashedPassword = await bcrypt.hash(
            registerPayload.password,
            saltOrRounds
        );

        const newUser = insertUser.get(
            randomUUID(),
            registerPayload.email,
            registerPayload.username,
            hashedPassword
        ) as UserDB;

        sendCreatedResponse(res, entityToUser(newUser));
    } catch (err: any) {
        return sendError(res, 500, err.toString());
    }
};

export const login = async (
    req: RouterIncomingMessage,
    res: ServerResponse
) => {
    try {
        const loginPayload = req.body as LoginRequest;

        const existingUserWithEmail = findUserByEmail.get(
            loginPayload.email
        ) as UserDB;

        if (!existingUserWithEmail) {
            return sendUnauthorizedResponse(res, "Invalid credentials");
        }

        const isMatch = await bcrypt.compare(
            loginPayload.password,
            existingUserWithEmail.password
        );

        if (!isMatch) {
            return sendUnauthorizedResponse(res, "Invalid credentials");
        }

        const token = generateAccessToken(existingUserWithEmail);
        sendSuccessResponse(res, { message: "Successful login", token });
    } catch (err: any) {
        return sendError(res, 500, err.toString());
    }
};

// this handler is just for testing, it will be deleted later

export const getAllUsers = async (
    req: RouterIncomingMessage,
    res: ServerResponse
) => {
    const usersList = findAllUsers.all();
    usersList.map((user) => entityToUser(user as UserDB));
    return sendSuccessResponse(res, usersList);
};
