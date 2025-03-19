import { otpVerication } from "@repository/_user_repo/AuthRepo.ts";
import { addOTPEntry, createOtpLimitTable, getUser, RegisterUser } from "@repository/_user_repo/UserRepository.ts";
import { makeUserLockout } from "@repository/_user_repo/UserRepository.ts";
import { USERMODULE } from "@shared/_messages/userModuleMessages.ts";
import { HTTP_STATUS_CODE } from "@shared/_constants/HttpStatusCodes.ts";
import ErrorResponse, { SuccessResponse } from "@response/Response.ts";
import {  isOtpisValid, isPhoneValid } from "@shared/_validation/UserValidate.ts";
import { LOGERROR } from "@shared/_messages/userModuleMessages.ts";
import { LOGINFO } from "@shared/_messages/userModuleMessages.ts";
import Logger from "@shared/_logger/Logger.ts";
import supabase from "@shared/_config/DbConfig.ts";

const logger = Logger.getInstance();

/**
 * This method performs OTP verification by following these steps:
 * 1. Retrieve the user by mobile number if the user exists.
 * 2. Check if the user is in lockout time.
 * 3. If the user is not in lockout time, verify the OTP.
 * 4. If the OTP is invalid, increment the failed login count or lock the user account.
 * 5. If the OTP is valid, return user ID and access token in the response.
 * 6. If the user is new, create a user account with default values and return the user ID and access token.
 *
 * @param req - Request containing OTP and phone number for verification.
 * @returns - JSON Response Object containing user ID and access token or an error response.
 */
export default async function verifyOtp(req: Request): Promise<Response> {
    try {
        logger.log(LOGINFO.OTP_VERIFICATION_STARTED); // Log the start of OTP verification.

        // Parse the request body to get phone number and OTP
        const body = await req.json();
        const phoneNo: string = body.phoneNo;
        const Otp: string = body.Otp;

        // Validate phone number format and existence
        const validPhone = isPhoneValid(phoneNo);
        if (validPhone instanceof Response)
            return validPhone;

        // Validate OTP format
        const validOtp = isOtpisValid(Otp);
        if (validOtp instanceof Response)
            return validOtp;

        // Retrieve user details using phone number
        const { data: user, error: userError } = await getUser(phoneNo);
        if (userError) {
            logger.error(LOGERROR.USER_NOT_FOUND + userError);
            return ErrorResponse(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR, `${userError.message}`);
        }

        // Check if the user is in lockout time
        if (user && user.lockout_time && user.lockout_time > new Date().toISOString()) {
            logger.log(LOGINFO.USER_LOCKOUT_UPDATED);
            return ErrorResponse(HTTP_STATUS_CODE.FORBIDDEN, USERMODULE.USER_LOCKED);
        }

        // Verify the OTP
        const { data, error } = await otpVerication(phoneNo, Otp);
        if (error || !data) {
            logger.log(LOGINFO.OTP_INVALID_ATTEMPT);

            // Handle invalid OTP by updating failed login count or locking the user
            if (user) {
                if (user.failed_login_count < 3) {
                    user.account_status = 'A';
                    user.failed_login_count += 1;
                    user.lockout_time = null;
                } else {
                    user.account_status = 'S';
                    user.failed_login_count = 0;
                    user.lockout_time = new Date(new Date().setHours(new Date().getHours() + 1)).toISOString();
                }

                const { data: _updateUser, error: updateError } = await makeUserLockout(
                    user.user_id,
                    user.lockout_time,
                    user.failed_login_count,
                    user.account_status
                );

                if (updateError) {
                    logger.error(LOGERROR.USER_UPDATE_ERROR + updateError);
                    return ErrorResponse(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR, `${updateError.message}`);
                }

                if (user.lockout_time) {
                    return ErrorResponse(
                        HTTP_STATUS_CODE.CONFLICT,
                        `${USERMODULE.LOCK_USER} try after ${user.lockout_time}`
                    );
                }
                return ErrorResponse(HTTP_STATUS_CODE.CONFLICT, USERMODULE.INVALID_OTP);
            }
        }

        // If OTP is valid, update user status and return response
        if (user) {
            logger.log(LOGINFO.OTP_VALID);
            user.account_status = 'A';
            const { data: _updateUser, error: updateError } = await makeUserLockout(
                user.user_id,
                null,
                0,
                user.account_status
            );

            if (updateError) {
                logger.error(LOGERROR.USER_UPDATE_ERROR + updateError);
                return ErrorResponse(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR, `${updateError.message}`);
            }
            
            const userId = data.user?.id;
            const access_token = data.session?.access_token;
            if (userId && access_token) {
                logger.log(LOGINFO.USER_LOGGED_IN);
                return SuccessResponse(USERMODULE.USER_VERIFIED, HTTP_STATUS_CODE.OK, { userId, access_token });
            }
            
            return ErrorResponse(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR, USERMODULE.INTERNAL_SERVER_ERROR);
        }

        // Handle new user registration
        if (!user) {
            logger.log(LOGINFO.USER_ACCOUNT_CREATED);
            const userId = data.user?.id;
            const access_token = data.session?.access_token;

            if (userId && access_token) {
                const { data: _register, error: registerError } = await RegisterUser(userId, phoneNo);
                if (registerError) {
                    logger.error(LOGERROR.USER_REGISTRATION_ERROR + registerError.message);
                    return ErrorResponse(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR, `${USERMODULE.INTERNAL_SERVER_ERROR}`);
                }

                const { data: _CreateOtpDetails, error: createOtpDetailError } = await addOTPEntry(userId);
                if (createOtpDetailError) {
                    logger.error(LOGERROR.USER_REGISTRATION_ERROR + createOtpDetailError.message);
                    return ErrorResponse(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR, `${USERMODULE.INTERNAL_SERVER_ERROR}`);
                }
                return SuccessResponse(USERMODULE.SENT_OTP_SUCCESS, HTTP_STATUS_CODE.CREATED, { userId, access_token });
            }
        }

        // Generic error response for any unhandled scenario
        return ErrorResponse(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR, USERMODULE.INTERNAL_SERVER_ERROR);
    } catch (error) {
        // Log and handle any unhandled exceptions
        logger.error(LOGERROR.INTERNAL_SERVER_ERROR + error);
        return ErrorResponse(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR, `${error}`);
    }
}
