import { getUserProfile } from "@repository/_user_repo/UserRepository.ts";
import ErrorResponse from "@response/Response.ts";
import { SuccessResponse } from "@response/Response.ts";
import { HTTP_STATUS_CODE } from "@shared/_constants/HttpStatusCodes.ts";
import { USERMODULE } from "@shared/_messages/userModuleMessages.ts";
import { validatingUserId } from "@shared/_validation/UserValidate.ts";
import { LOGERROR, LOGINFO } from "@shared/_messages/userModuleMessages.ts";
import Logger from "@shared/_logger/Logger.ts";

const logger = Logger.getInstance();

/**
 * Fetches a user profile based on the provided user ID.
 *
 * Steps:
 * 1. Validate the user ID to ensure it is correct.
 * 2. Retrieve the user profile from the database.
 * 3. Handle any errors during validation or data retrieval.
 * 4. Return the user profile as a JSON response if found.
 *
 * @param _req - The HTTP request object (not used in this function but provided as a parameter).
 * @param params - Contains user_id, user_jwt, account status, and user_type.
 * @returns - A JSON Response object containing the user profile or an error message.
 */
export default async function FetchUserProfile(_req: Request, params: Record<string, string>): Promise<Response> {
    try {
        const user_Id = params.id; // Extract the user ID from the request parameters

        logger.log(LOGINFO.FETCH_PROFILE_STARTED.replace("{userId}", user_Id)); // Log the start of the profile fetch process

        // Step 1: Validate the provided user ID
        const idAvailable = await validatingUserId(user_Id);
        if (idAvailable instanceof Response) {
            logger.error(LOGERROR.INVALID_USER_ID.replace("{userId}", user_Id)); // Log invalid user ID
            return idAvailable; // Return an error response if validation fails
        }

        logger.log(LOGINFO.FETCH_PROFILE_VALIDATED.replace("{userId}", user_Id)); // Log successful ID validation

        // Step 2: Fetch the user profile from the database
        const { data: userData, error: userError } = await getUserProfile(user_Id);
        if (userError) {
            logger.error(LOGERROR.USER_PROFILE_FETCH_ERROR.replace("{userId}", user_Id) + userError); // Log profile fetch error
            return ErrorResponse(
                HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
                `${USERMODULE.INTERNAL_SERVER_ERROR}, ${userError.message}`
            );
        }

        // Step 3: Handle the case where no user data is found
        if (!userData) {
            logger.log(LOGINFO.USER_NOT_FOUND.replace("{userId}", user_Id)); // Log user not found
            return ErrorResponse(HTTP_STATUS_CODE.NOT_FOUND, USERMODULE.USER_NOT_FOUND);
        }

        logger.log(LOGINFO.USER_PROFILE_FETCHED.replace("{userId}", user_Id)); // Log successful profile retrieval

        // Step 4: Return the user profile data in a success response
        return SuccessResponse(USERMODULE.USER_DETAILS, HTTP_STATUS_CODE.OK, userData);

    } catch (error) {
        // Log unexpected errors and return an error response
        logger.error(LOGERROR.INTERNAL_SERVER_ERROR + error);
        return ErrorResponse(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR, `${error}`);
    }
}
