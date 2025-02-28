import ErrorResponse, { SuccessResponse } from "@response/Response.ts";
import { HTTP_STATUS_CODE } from "@shared/_constants/HttpStatusCodes.ts";
import { LOGERROR, USERMODULE } from "@shared/_messages/userModuleMessages.ts";
import { addFollowerToUser, CheckFollower, getUserProfile, updateFollowerCount } from "@repository/_user_repo/UserRepository.ts";
import { validatingUserId } from "@shared/_validation/UserValidate.ts";
import Logger from "@shared/_logger/Logger.ts";

const logger = Logger.getInstance();

/**
 * This method allows a user to follow another user.
 *
 * The flow of the method is as follows:
 * 1. Validate the user ID of the person being followed.
 * 2. Check if the user is trying to follow themselves.
 * 3. Fetch the user profile of the target user to follow.
 * 4. Check if the user is already following the target user.
 * 5. If not, add the follower to the target user.
 * 6. Increment the follower count for the target user.
 * 7. Return appropriate success or error responses based on the results of each step.
 * 
 * @param _req -- The request object (not used in this method, but passed as part of the signature).
 * @param params -- A record containing `id` (the user being followed) and `user_id` (the follower).
 * @returns -- A JSON response indicating the success or failure of the operation.
 */
export default async function addFollower(_req: Request, params: Record<string, string>): Promise<Response> {
    try {
        // Step 1: Extract user_id (the target user to follow) and followed_by (the follower)
        const user_id = params.id;
        const followed_by = params.user_id;
        logger.log("user_id: " + user_id+" followed_by: " + followed_by); 
        // Step 2: Validate user ID (ensure the user exists)
        const idAvailable = await validatingUserId(user_id);
        if (idAvailable instanceof Response) {
            logger.error(LOGERROR.INVALID_USER_ID.replace("{userId}", user_id)); 
            return idAvailable;
        }

        // Step 3: Prevent user from following themselves
        if (user_id == followed_by) {
            return ErrorResponse(HTTP_STATUS_CODE.BAD_REQUEST, USERMODULE.YOUR_NOT_ABLE_TO_FOLLOW_YOURSELF);
        }

        // Step 4: Fetch user profile to ensure the target user exists
        const { data: user, error: userError } = await getUserProfile(user_id);
        if (userError) {
            logger.log("getting user profile error");
            return ErrorResponse(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR, `${USERMODULE.INTERNAL_SERVER_ERROR} ${userError.message}`);
        }
        if (!user) {
            logger.log("user not found");
            return ErrorResponse(HTTP_STATUS_CODE.NOT_FOUND, USERMODULE.USER_NOT_FOUND);
        }

        // Step 5: Check if the follower is already following the target user
        logger.log("start of checking follower");
        const { data: checkData, error: checkError } = await CheckFollower(user_id, followed_by);
        if (checkError) {
            logger.log("checking follower error");
            return ErrorResponse(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR, `${USERMODULE.INTERNAL_SERVER_ERROR}: ${checkError.message}`);
        }
        if (checkData) {
            logger.log("user is already followed");
            return ErrorResponse(HTTP_STATUS_CODE.CONFLICT, USERMODULE.USER_ALREADY_FOLLOWED);
        }

        // Step 6: Add the follower to the user
        logger.log("Add follower");
        const { data: updateData, error: updateError } = await addFollowerToUser(user_id, followed_by);
        if (updateError) {
            logger.log("Add follower error");
            return ErrorResponse(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR, `${USERMODULE.INTERNAL_SERVER_ERROR} ${updateError.message}`);
        }
        if (!updateData) {
            logger.log("something went wrong in Add follower");
            return ErrorResponse(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR, USERMODULE.UNABLE_TO_FOLLOW);
        }

        // Step 7: Increment the follower count for the target user
        logger.log("Add follower success");
        logger.log(user.follower_count);
        const followerCount: number = user.follower_count + 1;

        // Step 8: Update the follower count in the database
        const { data: incrementFollowerCount, error: errorInFollowerIncrement } = await updateFollowerCount(user_id, followerCount);
        if (errorInFollowerIncrement) {
            logger.log("Increment follower count error");
            return ErrorResponse(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR, `${USERMODULE.INTERNAL_SERVER_ERROR}: ${errorInFollowerIncrement}`);
        }
        if (!incrementFollowerCount) {
            logger.log("something went wrong in Increment follower count");
            return ErrorResponse(HTTP_STATUS_CODE.NOT_FOUND, USERMODULE.USER_NOT_FOUND);
        }

        // Final Success: Return success response if all operations were successful
        logger.log("success");
        return SuccessResponse(USERMODULE.USER_fOLLOWED_SUCCESS, HTTP_STATUS_CODE.OK);

    } catch (error) {
        // Catch any unexpected errors and return a generic error response
        return ErrorResponse(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR, `${USERMODULE.INTERNAL_SERVER_ERROR} ${error}`);
    }
}
