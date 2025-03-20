import { HTTP_STATUS_CODE } from "@shared/_constants/HttpStatusCodes.ts";
import { USERMODULE } from "@shared/_messages/userModuleMessages.ts";
import ErrorResponse, { SuccessResponse } from "@response/Response.ts";
import { createOtpSettings } from "@repository/_user_repo/UserRepository.ts";
import { validateRequestOTPSettingsData } from "@shared/_validation/UserValidate.ts";

/**
 * Creates new OTP settings for the given criteria ID in the OTP settings table.
 * @param {Request} req - Request containing time units, time units count and max OTP count in the query string.
 * @returns {Promise<Response>} - The result of the create operation.
 */
export default async function createOTPSettings(req: Request, _parms: Record<string, string>):Promise<Response> {

    try{
        const requestData=  await validateRequestOTPSettingsData(req);
        if(requestData instanceof Response)
        {
            return requestData;
        }
       
        
        const {data,error} =await createOtpSettings(requestData.time_units,requestData.time_units_count,requestData.max_OTP);
        if(error)
        {
            console.log("error at updating ",error.message)
            return ErrorResponse(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,USERMODULE.INTERNAL_SERVER_ERROR)
        }
       
           
       return  SuccessResponse(USERMODULE.OTP_SETTINGS_CREATED_SUCCESSFULLY,HTTP_STATUS_CODE.OK,data);
        }
    catch(error)
    {
        return ErrorResponse(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,USERMODULE.INTERNAL_SERVER_ERROR+error);
    }
    
}