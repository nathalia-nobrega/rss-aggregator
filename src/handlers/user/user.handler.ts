import * as bcrypt from "bcrypt";
import { randomUUID } from "crypto";
import { ServerResponse } from "http";
import { RouterIncomingMessage } from "../../types/http.js";
import { User } from "../../types/user/models.js";
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

let userTable: Array<User> = [];

export const registerUser = async (
    req: RouterIncomingMessage,
    res: ServerResponse
) => {
    const registerPayload = req.body as RegisterUserRequest;
    try {
        const existingUserWithEmail = userTable.find(
            (user) => user.email === registerPayload.email
        );
        if (existingUserWithEmail) {
            return sendConflictResponse(res, "E-mail already registered");
        }

        const saltOrRounds = 10;
        const hashedPassword = await bcrypt.hash(
            registerPayload.password,
            saltOrRounds
        );

        const newUser: User = {
            id: randomUUID(),
            createdAt: new Date(),
            email: registerPayload.email,
            username: registerPayload.username,
            password: hashedPassword,
        };
        userTable.push(newUser);
        sendCreatedResponse(res, "Successfully registered the user.");
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

        const existingUserWithEmail = userTable.find(
            (usr) => usr.email === loginPayload.email
        );
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
    return sendSuccessResponse(res, userTable);
};
