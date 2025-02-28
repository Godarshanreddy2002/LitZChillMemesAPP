import { logout } from "@repository/_user_repo/AuthRepo.ts";
import { USERMODULE } from "@shared/_messages/userModuleMessages.ts";
import { HTTP_STATUS_CODE } from "@shared/_constants/HttpStatusCodes.ts";
import { SuccessResponse } from "@response/Response.ts";
import ErrorResponse from "@response/Response.ts";
import { LOGERROR,LOGINFO } from "@shared/_messages/userModuleMessages.ts";
import Logger from "@shared/_logger/Logger.ts";
const logger=Logger.getInstance();
/**
 * This method is used to logout user from current session
 * @param req -- request Object
 * @param params -- params contain user_id, user_jwt, user account status, user_type
 * @returns -- It will return corresponding response object
 */
export default async function logoutUser(_req: Request, params: Record<string, string>) {
    try {
        const token = params.token;
        const scope = params.scope;

        // Check if the provided scope is valid
        const validScopes: string[] = ['local', 'global'];
        if (!validScopes.includes(scope)) {
            logger.error(LOGERROR.INVALID_SCOPE.replace("{scope}", scope));  // Log invalid scope error
            return ErrorResponse(HTTP_STATUS_CODE.BAD_REQUEST, USERMODULE.ALLOWED_USER_SCOPES);
        }

        logger.log(LOGINFO.LOGOUT_STARTED.replace("{token}", token));  // Log when logout starts with the provided token

        // Perform the logout operation
        const { data, error } = await logout(token, scope);

        if (!data && !error) {
            logger.error(LOGERROR.INTERNAL_SERVER_ERROR);  // Log internal error if no data and error received
            return ErrorResponse(HTTP_STATUS_CODE.BAD_REQUEST, USERMODULE.INTERNAL_SERVER_ERROR);
        }

        if (error) {
            logger.error(LOGERROR.USER_LOGOUT_ERROR.replace("{token}", token)+ error.message);  // Log error during logout operation
            return ErrorResponse(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR, USERMODULE.USER_LOGOUT_ERROR);
        } 
            
        logger.log(LOGINFO.USER_LOGOUT_SUCCESS.replace("{token}", token));  // Log successful logout operation
        return SuccessResponse(USERMODULE.USER_LOGOUT_SUCCESS, HTTP_STATUS_CODE.OK);
        
    } catch (error) {
        logger.error(LOGERROR.INTERNAL_SERVER_ERROR+error);  // Log internal server errors
        return ErrorResponse(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR, `${error}`);
    }
}
