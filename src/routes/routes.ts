import {
    getAllFeeds,
    addNewFeed,
    deleteFeed,
    updateFeed,
    getFeedById,
} from "../handlers/feed/feed.handler.js";
import { registerUser, login } from "../handlers/user/user.handler.js";
import { withAuth } from "../middlewares/auth.js";
import { withRateLimit } from "../middlewares/rate-limit.js";
import { runMiddlewares } from "../middlewares/utils/runner.js";
import {
    validateCreateFeedBody,
    validateRegisterUserBody,
    validateUpdateFeedBody,
} from "../middlewares/validation.js";
import { addRoute } from "./router.js";

addRoute(
    "GET",
    "/feeds",
    runMiddlewares([withRateLimit, withAuth], getAllFeeds)
);

addRoute(
    "POST",
    "/feeds",
    runMiddlewares(
        [withRateLimit, withAuth, validateCreateFeedBody],
        addNewFeed
    )
);

addRoute(
    "GET",
    "/feeds/:id",
    runMiddlewares([withRateLimit, withAuth], getFeedById)
);

addRoute(
    "PUT",
    "/feeds/:id",
    runMiddlewares(
        [withRateLimit, withAuth, validateUpdateFeedBody],
        updateFeed
    )
);

addRoute(
    "DELETE",
    "/feeds/:id",
    runMiddlewares([withRateLimit, withAuth], deleteFeed)
);

addRoute(
    "POST",
    "/auth/register",
    runMiddlewares([withRateLimit, validateRegisterUserBody], registerUser)
);

addRoute("POST", "/auth/login", runMiddlewares([withRateLimit], login));
