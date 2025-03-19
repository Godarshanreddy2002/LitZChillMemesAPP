import { sendOtp } from "@repository/_user_repo/AuthRepo.ts";
import { USERMODULE } from "@shared/_messages/userModuleMessages.ts";
import { HTTP_STATUS_CODE } from "@shared/_constants/HttpStatusCodes.ts";
import { SuccessResponse } from "@response/Response.ts";
import ErrorResponse from "@response/Response.ts";
import { countOtpRequests, getOtpSettings, getUser, insertOtpRequest } from "@repository/_user_repo/UserRepository.ts";
import { isPhoneValid, validateUserOTPLimit } from "@shared/_validation/UserValidate.ts";
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
        // need to change the method name
        const phoneNoIsnotThere = isPhoneValid(phoneNo);
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

        const currentTime = new Date().toISOString();

        // Check if the user is currently in lockout time
        if (user && user.lockout_time && user.lockout_time > currentTime) {
            logger.log(LOGINFO.USER_FOUND.replace("{phoneNo}", phoneNo));
            return ErrorResponse(
                HTTP_STATUS_CODE.FORBIDDEN,
                `${USERMODULE.ACCOUNT_DEACTIVATED} Try after ${user.lockout_time}`
            );
        }
        logger.log(LOGINFO.USER_NOT_LOCKED_OUT.replace("{phoneNo}", phoneNo));


        const check_otp_limit = await validateUserOTPLimit(phoneNo)
        if (check_otp_limit instanceof Response) {
            return check_otp_limit;
        }
        // Attempt to send OTP

        console.log("Start of getting Otp setting Data---------------");
        const { data: _data, error } = await sendOtp(phoneNo);

        if (error) {
            // Log error if OTP sending fails
            logger.error(LOGERROR.OTP_SEND_ERROR + error);
            return ErrorResponse(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR, `${error}`);
        }
        const { data: _otpRequest, error: insertOtpRequestError } = await insertOtpRequest(phoneNo, new Date())
        if (insertOtpRequestError) {
            return ErrorResponse(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR, "some thing went wrong:" + error.message,)
        }
        // Log success when OTP is sent successfully
        logger.log(LOGINFO.OTP_SENT_SUCCESS.replace("{phoneNo}", phoneNo));
        return SuccessResponse(USERMODULE.SENT_OTP_SUCCESS, HTTP_STATUS_CODE.OK);

    } catch (error) {
        // Log and return a generic error for any unhandled exceptions
        logger.error(LOGERROR.INTERNAL_SERVER_ERROR + error);
        return ErrorResponse(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR, `${error}`);
    }
}
