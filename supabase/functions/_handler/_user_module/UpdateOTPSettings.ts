import { USERMODULE } from "@shared/_messages/userModuleMessages.ts";
import { HTTP_STATUS_CODE } from "@shared/_constants/HttpStatusCodes.ts";
import ErrorResponse, { SuccessResponse } from "@response/Response.ts";
import { updateOtpLimitSettings } from "@repository/_user_repo/UserRepository.ts";




export async function updateOTPSettings(req: Request, _params: Record<string, string>):Promise<Response> 
{
    try{
        const url = new URL(req.url);

        // const hours = parseInt(url.searchParams.get("hours")||"0");
        // const minutes = parseInt(url.searchParams.get("minutes")||"0");
        // const days = parseInt(url.searchParams.get("days")||"1");
        // const max_OTP= parseInt(url.searchParams.get("max_OTP")||"15");
        const time_units = url.searchParams.get("time_unit");
        const time_units_count = parseInt(url.searchParams.get("time_units_count")||"0");
        const max_OTP= parseInt(url.searchParams.get("max_OTP")||"15");
        if(!time_units)
        {
            console.log("time_units_count"+time_units_count)
            return ErrorResponse(HTTP_STATUS_CODE.BAD_REQUEST,"time units are required");
        }

        
        // const currentTime = new Date();
        // currentTime.setHours(currentTime.getHours() + hours);
        // currentTime.setMinutes(currentTime.getMinutes() + minutes);
        // currentTime.setDate(currentTime.getDate() + days);

        const {data,error} =await updateOtpLimitSettings(time_units,time_units_count,max_OTP,5);
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
    catch(error){
        return ErrorResponse(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR, `${USERMODULE.INTERNAL_SERVER_ERROR}`); // Return error response
    }
    
}