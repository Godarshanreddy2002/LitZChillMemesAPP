import { sendOtp } from "@repository/_user_repo/AuthRepo.ts";
import { USERMODULE } from "@shared/_messages/userModuleMessages.ts";
import { HTTP_STATUS_CODE } from "@shared/_constants/HttpStatusCodes.ts";
import { SuccessResponse } from "@response/Response.ts";
import ErrorResponse from "@response/Response.ts";
import { countOtpRequests, getOtpSettings, getUser, getUserOtpDetails, updateOtpLimitTable } from "@repository/_user_repo/UserRepository.ts";
import { isPhoneAvailable } from "@shared/_validation/UserValidate.ts";
import { LOGERROR, LOGINFO } from "@shared/_messages/userModuleMessages.ts";
import Logger from "@shared/_logger/Logger.ts";
import supabase from "@shared/_config/DbConfig.ts";

const logger = Logger.getInstance();

/**
 * This function sends OTP to the user by checking the following conditions:
 * 1. It will check if the user is already present or not.
 * 2. If the user is present, then it will check if the user is in lockout.
 * 3. If the user is in lockout, then it will return an error response.
 * 4. If the user is not in lockout time, it will send the OTP.
 * 5. If the user is a new user, it will directly send OTP to the corresponding phone number.
 *
 * @param req - It is a request in the form of JSON.
 * @returns - It will return a response object.
 */
export default async function signInWithOtp(req: Request): Promise<Response> {
    try {
        // Parse the request body to extract the phone number
        const body = await req.json();
        const phoneNo = body.phoneNo;

        // Log that the OTP sending process has started
        logger.log(LOGINFO.OTP_SEND_STARTED.replace("{phoneNo}", phoneNo));

        // Validate if the phone number exists in the system
        const phoneNoIsnotThere = isPhoneAvailable(phoneNo);
        if (phoneNoIsnotThere instanceof Response) {
            return phoneNoIsnotThere;
        }





        // Fetch user details using the phone number
        const { data: user, error: userError } = await getUser(phoneNo);
        if (userError) {
            // Log error if the user is not found in the database
            logger.error(LOGERROR.USER_NOT_FOUND + userError.message);
            return ErrorResponse(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR, `${userError.message}`);
        }

        if (user) {
            const currentTime = new Date().toISOString();

            // Check if the user is currently in lockout time
            if (user.lockout_time && user.lockout_time > currentTime) {
                logger.log(LOGINFO.USER_FOUND.replace("{phoneNo}", phoneNo));
                return ErrorResponse(
                    HTTP_STATUS_CODE.FORBIDDEN,
                    `${USERMODULE.ACCOUNT_DEACTIVATED} Try after ${user.lockout_time}`
                );
            }
            
            const {data,error:getOtpSettingError}=await getOtpSettings();
            if(getOtpSettingError)
            {
                return ErrorResponse(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,"Somthing went wrong in getting"+getOtpSettingError.message)
            }  
            if(data)        
            {
                const _max_Otp_count=data.max_otp_attempts;
                const _time_unit:string=data.time_unit;
                const _time_units_count_time_unit:string=data.time_units_count;                
            }

            const start_time: Date = new Date(new Date().getTime() - 60 * 60 * 1000) // Default to current time
            const end_time: Date = new Date() // Default to current time
            const {count,error}=await countOtpRequests(user.user_id,start_time,end_time);

            if(error)
            {
                return ErrorResponse(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,"some thing went wrong"+error.message,)
            }
            if(count)
            {
                
            }

            logger.log(LOGINFO.USER_NOT_LOCKED_OUT.replace("{phoneNo}", phoneNo));

            // Fetch OTP details for the user
            const { data: otpData, error: otpError } = await getUserOtpDetails(user.user_id);
            if (otpError) {
                // Log error if there is an issue with the OTP details
                logger.error(LOGERROR.USER_OTP_TABLE_ERROR + otpError.message);
                return ErrorResponse(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR, `${otpError.message}`);
            }

            // Check if OTP limits have been exceeded
            if (otpData.total_otps_per_day >= 15) {
                return ErrorResponse(HTTP_STATUS_CODE.FORBIDDEN, USERMODULE.OTP_LIMIT_EXCEDED);
            }
            if (otpData.total_otps_last_5_min >= 3) {
                return ErrorResponse(HTTP_STATUS_CODE.FORBIDDEN, USERMODULE.OTP_LIMIT_FOR_FIVE_MINUTE);
            }
        }

        // Attempt to send OTP
        const { data: _data, error } = await sendOtp(phoneNo);

        if (error) {
            // Log error if OTP sending fails
            logger.error(LOGERROR.OTP_SEND_ERROR + error);
            return ErrorResponse(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR, `${error}`);
        } else {
            if (user) {
                // Fetch OTP details again after sending OTP
                const { data: otpData, error: otpError } = await getUserOtpDetails(user.user_id);
                if (otpError) {
                    logger.error(LOGERROR.USER_OTP_TABLE_ERROR + otpError.message);
                    return ErrorResponse(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR, `${otpError.message}`);
                }

                if (otpData) {
                    // Update the OTP count in the database
                    const { data: _updateOtpLimit, error: updateOtpError } = await updateOtpLimitTable(
                        user.user_id,
                        otpData.total_otps_last_5_min + 1,
                        otpData.total_otps_per_day + 1
                    );
                    if (updateOtpError) {
                        return ErrorResponse(HTTP_STATUS_CODE.FORBIDDEN, USERMODULE.OTP_LIMIT_FOR_FIVE_MINUTE);
                    }
                }
            }

            // Log success when OTP is sent successfully
            logger.log(LOGINFO.OTP_SENT_SUCCESS.replace("{phoneNo}", phoneNo));
            return SuccessResponse(USERMODULE.SENT_OTP_SUCCESS, HTTP_STATUS_CODE.OK);
        }
    } catch (error) {
        // Log and return a generic error for any unhandled exceptions
        logger.error(LOGERROR.INTERNAL_SERVER_ERROR + error);
        return ErrorResponse(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR, `${error}`);
    }
}
