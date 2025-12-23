import * as bcrypt from "bcrypt";
import { randomUUID } from "crypto";
import { IncomingMessage, ServerResponse } from "http";
import {
    generateAccessToken,
    isValidEmail,
    JSON_CONTENT_TYPE,
    LoginRequest,
    RegisterUserRequest,
    User,
} from "../../types/types.js";

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
    let body = "";

    req.on("data", (chunk) => {
        body += chunk.toString();
    });

    // TODO: rewrite every req.on('end') handler,
    // this makes code harder to maintain
    // makes testing individual pieces harder
    // and error handling scattered across callbacks
    req.on("end", async () => {
        // TODO: Find a way to reuse this error handling across all endpoints
        if (body.length === 0) {
            // body wasn't sent
            res.writeHead(400).end(JSON.stringify("Expected a request body."));
            return;
        }
        try {
            // Validation
            const registerPayload: RegisterUserRequest = JSON.parse(body);
            if (
                registerPayload.email === undefined ||
                !isValidEmail(registerPayload.email)
            ) {
                res.writeHead(400, JSON_CONTENT_TYPE);
                res.end(JSON.stringify("The given email is invalid."));
                return;
            }
            const existingUserWithEmail = userTable.find(
                (user) => user.email === registerPayload.email
            );
            if (existingUserWithEmail) {
                res.writeHead(409, JSON_CONTENT_TYPE);
                res.end(JSON.stringify("Email already registered"));
                return;
            }

            // Processing

            // hashing password
            const saltOrRounds = 10;
            const hashedPassword = await bcrypt.hash(
                registerPayload.password,
                saltOrRounds
            );

            // persist the user
            const newUser: User = {
                id: randomUUID(),
                createdAt: new Date(),
                email: registerPayload.email,
                username: registerPayload.username,
                password: hashedPassword,
            };
            userTable.push(newUser);
            res.writeHead(201, JSON_CONTENT_TYPE);
            res.end(JSON.stringify("Successfully registered the user."));
        } catch (err: any) {
            res.writeHead(400, JSON_CONTENT_TYPE);
            res.end(JSON.stringify(err.toString()));
        }
    });
};

export const login = async (req: IncomingMessage, res: ServerResponse) => {
    // TODO: Read body => make this a reusable think throughout all endpoints
    let body = "";

    req.on("data", (chunk) => {
        body += chunk.toString();
    });

    req.on("end", async () => {
        // TODO: make this a reusable think throughout all endpoints
        if (body.length === 0) {
            // body wasn't sent
            res.writeHead(400).end(JSON.stringify("Expected a request body."));
            return;
        }

        const loginPayload: LoginRequest = JSON.parse(body);

        const existingUserWithEmail = userTable.find(
            (usr) => usr.email === loginPayload.email
        );
        if (!existingUserWithEmail) {
            res.writeHead(401, JSON_CONTENT_TYPE);
            res.end(JSON.stringify("Invalid credentials"));
            return;
        }

        const isMatch = await bcrypt.compare(
            loginPayload.password,
            existingUserWithEmail.password
        );

        if (!isMatch) {
            res.writeHead(401, JSON_CONTENT_TYPE);
            res.end(JSON.stringify("Invalid credentials"));
            return;
        }

        const token = generateAccessToken(existingUserWithEmail);
        res.writeHead(200, JSON_CONTENT_TYPE);
        res.end(
            JSON.stringify({
                message: "Successful login",
                token,
            })
        );
    });
};
