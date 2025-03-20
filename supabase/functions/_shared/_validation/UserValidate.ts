import ErrorResponse from "@response/Response.ts";
import { HTTP_STATUS_CODE } from "../_constants/HttpStatusCodes.ts";
import { CONSTANTS, USERMODULE } from "../_messages/userModuleMessages.ts";
import { parsePhoneNumberFromString } from 'https://cdn.skypack.dev/libphonenumber-js?dts';
import { V4 } from "@V4";
import { countOtpRequests, getOtpSettings } from "@repository/_user_repo/UserRepository.ts";

/**
 * This method is used to validate phone number
 * @param phone --It takes the phone number as parameter of type string
 * @returns --It returns Response Object or void 
 */
export function isPhoneValid(phone: string): Response | null {
    if (!phone) {
        return ErrorResponse(HTTP_STATUS_CODE.NOT_FOUND, USERMODULE.PHONENUMBER)
    }

    try {
        const phoneNumber = parsePhoneNumberFromString(phone);
        if (!phoneNumber) {
            return ErrorResponse(HTTP_STATUS_CODE.BAD_REQUEST, USERMODULE.INVALID_PHONE_FORMATE)

        }

        // Check if the phone number is valid
        if (!phoneNumber.isValid()) {
            return ErrorResponse(HTTP_STATUS_CODE.BAD_REQUEST, USERMODULE.INVALID_PHONE_NUMBER)

        }

        // Format the phone number in E.164 format
        const e164FormattedPhone = phoneNumber.format('E.164');

        // Ensure the phone number length is within the allowed range (max 15 digits)
        if (e164FormattedPhone.length > 15) {
            return ErrorResponse(HTTP_STATUS_CODE.BAD_REQUEST, "Phone number exceeds the maximum length allowed in E.164 format")
        }
        console.log("phone:", e164FormattedPhone)
        return null
    } catch (error) {
        return ErrorResponse(HTTP_STATUS_CODE.BAD_REQUEST, "Error processing phone number")

    }
}


/**
 * This method is used to validate OTP
 * @param Otp -- I takes the OTP as a parameter of type string
 * @returns -- It returns Response Object or void
 */
export function isOtpisValid(Otp: string): Response | null {
    if (!Otp) {
        return ErrorResponse(HTTP_STATUS_CODE.NOT_FOUND, USERMODULE.OTP)
    }
    if (Otp.length != CONSTANTS.OTP_LENGTH) {
        return ErrorResponse(HTTP_STATUS_CODE.BAD_REQUEST, `${USERMODULE.INVALID_OTP_LENGTH} ${CONSTANTS.OTP_LENGTH}`)
    }
    return null
}

/**
 * This method is used to validate user_id
 * @param user_id -- It takes the user_id as a parameter of type string
 * @returns -- It returns Response Object or void
 */

export function validatingUserId(user_id: string): Response | null {
    if (!user_id) {
        return ErrorResponse(HTTP_STATUS_CODE.BAD_REQUEST, USERMODULE.USER_ID)
    }
    if (!V4.isValid(user_id)) {
        console.log(`Invalid user_id: ${user_id}`);
        return ErrorResponse(
            HTTP_STATUS_CODE.BAD_REQUEST,
            USERMODULE.INVALID_USER_ID,
        )
    }
    return null
}
export function validateAccountStatus(accountStatus: string): Response | null {

    const allowedAccountstatus: string[] = ['A', 'S']
    if (!allowedAccountstatus.includes(accountStatus)) {
        return ErrorResponse(HTTP_STATUS_CODE.BAD_REQUEST, USERMODULE.ALLOWED_USER_STATES);
    }
    return null

}


export async function validateJson(req: Request, len: number) {
    const body = await req.json();
    if (!body) {
        return ErrorResponse(HTTP_STATUS_CODE.BAD_REQUEST, USERMODULE.MISSING_JSON)
    }
    if (Object.keys(body).length > len) {
        return ErrorResponse(HTTP_STATUS_CODE.BAD_REQUEST, USERMODULE.EXTRA_FIELDS_FOUND);
    }

}


export async function validateUserOTPLimit(phoneNo: string) {

    try {
        console.log("Start of getting Otp setting Data---------------")
        const { data, error: getOtpSettingError } = await getOtpSettings();
        if (getOtpSettingError) {
            return ErrorResponse(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR, USERMODULE.INTERNAL_SERVER_ERROR + getOtpSettingError.message)
        }
        if (data) {
            const time = new Date();
            const max_Otp_count = data.max_otp_attempts;
            const time_unit: string = data.time_unit;// days or hours
            const time_units_count: number = data.time_units_count;  //2 hours or 2 min   
            console.log("current time" + time);
            if (time_unit == "days") {
                time.setDate(time.getDate() - time_units_count);
            }

            else if (time_unit === "hours") {
                time.setHours(time.getHours() - time_units_count);
            } else if (time_unit === "min") {
                time.setMinutes(time.getMinutes() - time_units_count);
            }
            console.log("start time " + time)
            const start_time = time;
            const end_time: Date = new Date();

            const { count, error } = await countOtpRequests(phoneNo, start_time, end_time);
            console.log("count----------" + count);
            if (error) {
                return ErrorResponse(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR, "some thing went wrong" + error.message,)
            }
            if (count && count >= max_Otp_count) {
                return ErrorResponse(HTTP_STATUS_CODE.CONFLICT, "You have reached maximum otp limit")
            }
            console.log("end of getting Otp setting Data---------------")
            return null;
        }
    }
    catch (error) {
        return ErrorResponse(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR, "Some tghing went wrong: " + error)
    }

}

export async function validateRequestOTPSettingsData(req: Request):Promise<{time_units:string,time_units_count:number,max_OTP:number}|Response> {

    try{
        const url = new URL(req.url);
        const time_units = url.searchParams.get("time_unit")||"days";    
        const time_units_count:number = parseInt(url.searchParams.get("time_units_count")||"1");
        const max_OTP:number = parseInt(url.searchParams.get("max_otp_count")||"15");
        if(time_units_count<0 ||max_OTP<0)
        {
            return ErrorResponse(HTTP_STATUS_CODE.BAD_REQUEST,"time units and max otp count should be greater than 0");
        }    
        const allowedTimeUnits = ["days", "min", "hours"]; 
        if (!allowedTimeUnits.includes(time_units))
        {
            return ErrorResponse(HTTP_STATUS_CODE.BAD_REQUEST,USERMODULE.ALLOWED_TIME_UNITS);
        }
        return {time_units:time_units,time_units_count:time_units_count,max_OTP:max_OTP};


    }
    catch(error){
        return ErrorResponse(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR, "Some tghing went wrong: " + error)
    }   
    
}