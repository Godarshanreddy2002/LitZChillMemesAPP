import { USERMODULE } from "@shared/_messages/userModuleMessages.ts";
import { HTTP_STATUS_CODE } from "@shared/_constants/HttpStatusCodes.ts";
import ErrorResponse, { SuccessResponse } from "@response/Response.ts";
import { updateOtpLimitSettings } from "@repository/_user_repo/UserRepository.ts";
import { validatingUserId } from "@shared/_validation/UserValidate.ts";
import { isValid } from "@V4";




export async function updateOTPSettings(req: Request, params: Record<string, string>):Promise<Response> 
{
    try{
        const url = new URL(req.url);
        const time_units = url.searchParams.get("time_unit")||"days";
        const time_units_count:number = parseInt(url.searchParams.get("time_units_count")||"1");
        const max_OTP:number = parseInt(url.searchParams.get("max_otp_count")||"15");

        const criteria_id:string=params.id;

        const ivalid_uuid=validatingUserId(criteria_id);

        if(ivalid_uuid instanceof Response)
        {
            return isValid_uuid;
        }
        if(time_units_count<0 ||max_OTP<0)
        {
            return ErrorResponse(HTTP_STATUS_CODE.BAD_REQUEST,"time units and max otp count should be greater than 0");
        }
        const allowedTimeUnits = ["days", "min", "hours"]; 
        if (!allowedTimeUnits.includes(time_units))
        {
            return ErrorResponse(HTTP_STATUS_CODE.BAD_REQUEST,USERMODULE.ALLOWED_TIME_UNITS);
        }
        const {data,error} =await updateOtpLimitSettings(time_units,time_units_count,max_OTP,criteria_id);
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