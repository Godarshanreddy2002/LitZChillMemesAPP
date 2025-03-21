import ErrorResponse, { SuccessResponse } from "@response/Response.ts";
import { HTTP_STATUS_CODE } from "@shared/_constants/HttpStatusCodes.ts";
import { USERMODULE } from "@shared/_messages/userModuleMessages.ts";
import { deleteOtpLimitSettings } from "@repository/_user_repo/UserRepository.ts";
import { isValid } from "@V4";
import { isPhoneValid, validatingUserId } from "@shared/_validation/UserValidate.ts";





/*************  ✨ Codeium Command ⭐  *************/
/**
 * Deletes OTP settings based on the given criteria ID.
 * 
 * This function handles the deletion of OTP settings for a specific criteria ID
 * by calling the deleteOtpLimitSettings function. It returns a success response
 * if the deletion is successful, or an error response if there is an error or
 * if the criteria ID is not found or is active.
 *
 * @param {Request} req - The request object (not used in this function).
 * @param {Record<string, string>} params - The parameters containing the 'id' 
 * of the OTP settings criteria to be deleted.
 * @returns {Promise<Response>} - A promise that resolves to a response indicating 
 * the success or failure of the delete operation.
 */

/******  0fc7dfc5-1664-4d6d-9f5d-36fd9579ff0c  *******/
export async function DeleteOTPSettingsCriteria(req: Request, params: Record<string, string>): Promise<Response> {
    try {

        const criteria_id: string = params.id;
        const idAvailable = await validatingUserId(criteria_id);
        if (idAvailable instanceof Response) {
           
            return idAvailable; // Return an error response if validation fails
        }
        const { data, error } = await deleteOtpLimitSettings(criteria_id);    

        if (error) {
            console.log("error at deleting criteria ", error.message)
            return ErrorResponse(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR, USERMODULE.INTERNAL_SERVER_ERROR + error.message)
        }
        console.log("data at deleting criteria ", data)
        return SuccessResponse(USERMODULE.OTP_SETTINGS_DELETED_SUCCESSFULLY, HTTP_STATUS_CODE.OK);
    }
    catch (error) {
        return ErrorResponse(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR, USERMODULE.INTERNAL_SERVER_ERROR)
    }
}