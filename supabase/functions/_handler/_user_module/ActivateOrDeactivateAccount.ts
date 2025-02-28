import { updateUserStatus } from "@repository/_user_repo/UserRepository.ts";
import ErrorResponse, { SuccessResponse } from "@response/Response.ts";
import { HTTP_STATUS_CODE } from "@shared/_constants/HttpStatusCodes.ts";
import { USERMODULE } from "@shared/_messages/userModuleMessages.ts";
import { validateAccountStatus, validatingUserId } from "@shared/_validation/UserValidate.ts";
import { LOGERROR, LOGINFO } from "@shared/_messages/userModuleMessages.ts";
import Logger from "@shared/_logger/Logger.ts";

const logger = Logger.getInstance();

/**
 * This function is responsible for updating the account status of a user by admin.
 * It checks the validity of the user ID and the account status, and performs the status update if valid.
 *
 * @param req -- The request object that contains the JSON body with account status.
 * @param params -- Params contain `user_id` (ID of the user), `user_jwt` (JWT of the admin user), `user account status`, `user_type` (the type of the user).
 * @returns -- It returns a corresponding response indicating success or error after the status update.
 */
export async function ActivateOrDeactivateUser(req: Request, params: Record<string, string>): Promise<Response> {
  try {
    const id = params.id;  // Extract the user ID from the route parameters.
    
    // Step 1: Parse the request body to get the account status
    const body = await req.json();
    const { account_status } = body; 

    // Step 2: Log the start of the account status update process
    logger.log(LOGINFO.USER_STATUS_UPDATE_STARTED.replace("{user_id}", id).replace("{status}", account_status)); 

    // Step 3: Validate the account status to ensure it's a valid status
    const isvalidAccountStatus = await validateAccountStatus(account_status);
    if (isvalidAccountStatus instanceof Response) {
      logger.error(LOGERROR.INVALID_ACCOUNT_STATUS.replace("{status}", account_status)); 
      return isvalidAccountStatus;  // If validation fails, return an error response.
    }

    // Step 4: Validate the user ID to ensure the user exists
    const idavailble = await validatingUserId(id);
    if (idavailble instanceof Response) {
      logger.error(LOGERROR.INVALID_USER_ID.replace("{user_id}", id));  
      return idavailble;  // If user ID is invalid, return an error response.
    }

    // Step 5: Ensure that only admins can update the status (check user type)
    if (params.user_type !== 'A') {
      logger.error(LOGERROR.NOT_ALLOWED_TO_CHANGE_USER_STATUS.replace("{user_id}", id));  
      return ErrorResponse(HTTP_STATUS_CODE.FORBIDDEN, USERMODULE.NOT_ALLOWED);  // Non-admin users are not allowed to update status.
    }

    // Step 6: Log the process of updating the user status
    logger.log(LOGINFO.USER_STATUS_UPDATE_PROCESS.replace("{user_id}", id)); 

    // Step 7: Attempt to update the user's account status in the database
    const { data, error: updateError } = await updateUserStatus(id, account_status);
    if (updateError) {
      logger.error(LOGERROR.INTERNAL_SERVER_ERROR.replace("{error}", updateError));  
      return ErrorResponse(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR, `${USERMODULE.INTERNAL_SERVER_ERROR} : ${updateError.message}`);  // Return error if update fails.
    }

    // Step 8: Check if the user exists before responding
    if (!data) {
      logger.error(LOGERROR.USER_NOT_FOUND.replace("{user_id}", id));  
      return ErrorResponse(HTTP_STATUS_CODE.NOT_FOUND, USERMODULE.USER_NOT_FOUND_);  // If user is not found, return a not found error.
    }

    // Step 9: Log successful status update
    logger.log(LOGINFO.USER_STATUS_UPDATED.replace("{user_id}", id).replace("{status}", account_status));  

    // Step 10: Return success response with the updated status
    return SuccessResponse(`${USERMODULE.USER_STATUS_SET_TO_BE} :${account_status}`, HTTP_STATUS_CODE.OK);
  } catch (error) {
    // Step 11: Catch unexpected errors and log them
    logger.error(LOGERROR.INTERNAL_SERVER_ERROR + error); 
    return ErrorResponse(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR, `${error}`);  // Return a generic internal server error response.
  }
}
