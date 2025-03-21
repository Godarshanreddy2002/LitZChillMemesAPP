import { USERMODULE } from "@shared/_messages/userModuleMessages.ts";
import { HTTP_STATUS_CODE } from "@shared/_constants/HttpStatusCodes.ts";
import ErrorResponse, { SuccessResponse } from "@response/Response.ts";
import { updateOtpLimitSettings } from "@repository/_user_repo/UserRepository.ts";
import { isPhoneValid, validateRequestOTPSettingsData, validatingUserId } from "@shared/_validation/UserValidate.ts";

/**
 * Updates the OTP settings for a given ID in the OTP settings table.
 * @param {Request} req - Request containing time units, time units count and max OTP count in the query string.
 * @param {Record<string, string>} params - Parameters containing the ID of the OTP settings to be updated.
 * @returns {Promise<Response>} - The result of the update operation.
 */
export async function updateOTPSettings(req: Request, params: Record<string, string>):Promise<Response> 
{
    try{

        const criteria_id:string=params.id;
        const idAvailable = await validatingUserId(criteria_id);
        if (idAvailable instanceof Response) {
           
            return idAvailable; // Return an error response if validation fails
        }
        const requestData=  await validateRequestOTPSettingsData(req);
        if(requestData instanceof Response)
        {
            return requestData;
        }
        const {data,error} =await updateOtpLimitSettings(requestData.time_units,requestData.time_units_count,requestData.max_OTP,criteria_id);
        if(error)
        {
            console.log("error at updating ",error.message)
            return ErrorResponse(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,USERMODULE.INTERNAL_SERVER_ERROR)
        }
        if(!data)
        {
            return ErrorResponse(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,USERMODULE.INTERNAL_SERVER_ERROR)
        }
        return SuccessResponse(USERMODULE.OTP_SETTINGS_UPDATE_SUCCESSE,HTTP_STATUS_CODE.OK); // Return error response
    }
    catch(_error){
        return ErrorResponse(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR, `${USERMODULE.INTERNAL_SERVER_ERROR}`); // Return error response
    }
    
}