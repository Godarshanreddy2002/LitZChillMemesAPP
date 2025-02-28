import { UserProfile } from "@model/UserModel.ts";
import { getUserProfile, updateProfile } from "@repository/_user_repo/UserRepository.ts";
import { USERMODULE } from "@shared/_messages/userModuleMessages.ts";
import ErrorResponse, { SuccessResponse } from "@response/Response.ts";
import { HTTP_STATUS_CODE } from "@shared/_constants/HttpStatusCodes.ts";
import { validatingUserId } from "@shared/_validation/UserValidate.ts";
import { LOGERROR, LOGINFO } from "@shared/_messages/userModuleMessages.ts";
import Logger from "@shared/_logger/Logger.ts";

const logger = Logger.getInstance();

/**
 * Updates a user profile based on the provided user ID.
 * 
 * Steps:
 * 1. Validate user ID.
 * 2. Verify user permissions for updating the profile.
 * 3. Fetch the current user profile details.
 * 4. Validate the changes against permissions and user role constraints.
 * 5. Update the user profile and log the success or failure.
 * 
 * @param req - JSON object containing user profile update request data.
 * @param params - Contains user_id, user_jwt, account status, and user_type.
 * @returns - A JSON Response object indicating success or failure.
 */
export default async function updateUserProfile(req: Request, params: Record<string, string>): Promise<Response> {
    try {
        const id = params.id; // Extract the user ID from params
        logger.log(LOGINFO.PROFILE_UPDATE_STARTED.replace("{userId}", id)); // Log the start of the update process.

        // Validate the provided user ID
        const idAvailable = await validatingUserId(id);
        if (idAvailable instanceof Response) {
            logger.error(LOGERROR.INVALID_USER_ID.replace("{userId}", id)); // Log invalid user ID
            return idAvailable; // Return an error response if validation fails
        }

        // Verify if the requesting user has permissions to update the profile
        const user_id = params.user_id;
        if (user_id != id && params.user_type != 'A') {
            logger.error(LOGERROR.NOT_ALLOWED_TO_UPDATE.replace("{userId}", id)); // Log permission error
            return ErrorResponse(HTTP_STATUS_CODE.FORBIDDEN, USERMODULE.NOT_ALLOWED);
        }

        // Parse the request body to retrieve the updated profile data
        const requestBody = await req.json();
        const updateUser: UserProfile = requestBody;

        logger.log(LOGINFO.FETCHING_USER_PROFILE.replace("{userId}", id)); // Log the fetch user profile step

        // Fetch the current user profile using the provided ID
        const { data: user, error: userError } = await getUserProfile(id);
        if (userError) {
            logger.error(LOGERROR.USER_PROFILE_FETCH_ERROR.replace("{userId}", id) + userError); // Log profile fetch error
            return ErrorResponse(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR, `${USERMODULE.INTERNAL_SERVER_ERROR} : ${userError.message}`);
        }

        // If no user is found, return a "not found" response
        if (!user) {
            logger.log(LOGINFO.USER_NOT_FOUND.replace("{userId}", id)); // Log user not found
            return ErrorResponse(HTTP_STATUS_CODE.NOT_FOUND, USERMODULE.USER_NOT_FOUND_);
        }

        // Validate changes against user permissions and roles
        if (params.user_type != 'A') {
            if (requestBody.user_type != user.user_type) {
                logger.error(LOGERROR.USER_NOT_ALLOWED_TO_CHANGE.replace("{userType}", user.user_type)); // Log unauthorized change
                return ErrorResponse(
                    HTTP_STATUS_CODE.BAD_REQUEST,
                    `${USERMODULE.USER_NOT_ALLOWED_TO_CHANGE} 'user type' ${user.user_type} to ${requestBody.user_type}`
                );
            }
            if (requestBody.account_status != user.account_status) {
                logger.error(LOGERROR.USER_NOT_ALLOWED_TO_CHANGE.replace("{accountStatus}", user.account_status)); // Log unauthorized change
                return ErrorResponse(
                    HTTP_STATUS_CODE.BAD_REQUEST,
                    `${USERMODULE.USER_NOT_ALLOWED_TO_CHANGE} 'account status' ${user.account_status} to ${requestBody.account_status}`
                );
            }
            if (requestBody.rank != user.rank) {
                logger.error(LOGERROR.USER_NOT_ALLOWED_TO_CHANGE.replace("{rank}", user.rank)); // Log unauthorized change
                return ErrorResponse(
                    HTTP_STATUS_CODE.BAD_REQUEST,
                    `${USERMODULE.USER_NOT_ALLOWED_TO_CHANGE} 'rank' ${user.rank} to ${requestBody.rank}`
                );
            }
        }

        // Update the timestamp for the update
        updateUser.updated_at = new Date().toISOString();

        logger.log(LOGINFO.UPDATING_PROFILE.replace("{userId}", id)); // Log the update process

        // Perform the profile update in the database
        const { data, error: updateError } = await updateProfile(updateUser, id);
        if (updateError) {
            logger.error(LOGERROR.PROFILE_UPDATE_ERROR.replace("{userId}", id) + updateError.message); // Log update error
            return ErrorResponse(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR, `${USERMODULE.INTERNAL_SERVER_ERROR} : ${updateError.message}`);
        }

        // Handle case where no data is returned after the update
        if (!data) {
            logger.log(LOGINFO.USER_NOT_FOUND.replace("{userId}", id)); // Log failed update
            return ErrorResponse(HTTP_STATUS_CODE.NOT_FOUND, USERMODULE.USER_FAILD_TO_UPDATE);
        }

        logger.log(LOGINFO.PROFILE_UPDATED_SUCCESS.replace("{userId}", id)); // Log successful profile update

        return SuccessResponse(USERMODULE.USER_UPDATE_SUCCESS, HTTP_STATUS_CODE.OK); // Return success response
    } catch (error) {
        logger.error(LOGERROR.INTERNAL_SERVER_ERROR + error); // Log internal server errors
        return ErrorResponse(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR, `${error}`); // Return error response
    }
}
