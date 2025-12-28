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
