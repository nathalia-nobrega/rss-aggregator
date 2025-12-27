import * as bcrypt from "bcrypt";
import { randomUUID } from "crypto";
import { IncomingMessage, ServerResponse } from "http";
import { InvalidJsonFormat } from "../../errors/InvalidJsonFormat.js";
import { MissingRequestBody } from "../../errors/MissingRequestBody.js";
import { User } from "../../types/user/models.js";
import {
    LoginRequest,
    RegisterUserRequest,
} from "../../types/user/requests.js";
import { isValidEmail } from "../../types/user/validators.js";
import { generateAccessToken } from "../../utilities/jwt.js";
import { readJSON } from "../../utilities/request.js";
import {
    sendBadRequestResponse,
    sendConflictResponse,
    sendCreatedResponse,
    sendSuccessResponse,
} from "../../utilities/response.js";

let userTable: Array<User> = [
    {
        id: randomUUID(),
        username: "zero_dollar_woman",
        email: "godis@real.com",
        createdAt: new Date(),
        password: "$2y$12$4Umg0rCJwMswRw/l.SwHvuQV01coP0eWmGzd61QH2RvAOMANUBGC",
    },
];

export const registerUser = async (
    req: IncomingMessage,
    res: ServerResponse
) => {
    const registerPayload = await readJSON<RegisterUserRequest>(req);
    // this validation could go to a validation middleware maybe?
    // think about this one
    try {
        if (
            registerPayload.email === undefined ||
            !isValidEmail(registerPayload.email)
        ) {
            return sendBadRequestResponse(res, "The given e-mail is not valid");
        }
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
        if (err instanceof InvalidJsonFormat) {
            return sendBadRequestResponse(res, err.message);
        }
        if (err instanceof MissingRequestBody) {
            return sendBadRequestResponse(res, err.message);
        }

        return sendBadRequestResponse(res, err.message);
    }
};

export const login = async (req: IncomingMessage, res: ServerResponse) => {
    try {
        const loginPayload = await readJSON<LoginRequest>(req);

        const existingUserWithEmail = userTable.find(
            (usr) => usr.email === loginPayload.email
        );
        if (!existingUserWithEmail) {
            return sendConflictResponse(res, "Invalid credentials");
        }

        const isMatch = await bcrypt.compare(
            loginPayload.password,
            existingUserWithEmail.password
        );

        if (!isMatch) {
            return sendConflictResponse(res, "Invalid credentials");
        }

        const token = generateAccessToken(existingUserWithEmail);
        sendSuccessResponse(res, { message: "Successful login", token });
    } catch (err: any) {
        if (err instanceof InvalidJsonFormat) {
            return sendBadRequestResponse(res, err.message);
        }
        if (err instanceof MissingRequestBody) {
            return sendBadRequestResponse(res, err.message);
        }

        return sendBadRequestResponse(res, err.message);
    }
};
