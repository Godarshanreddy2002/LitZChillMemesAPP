import ErrorResponse from "@response/Response.ts";
import { HTTP_STATUS_CODE } from "../_constants/HttpStatusCodes.ts";
import { CONSTANTS, USERMODULE } from "../_messages/userModuleMessages.ts";
import { parsePhoneNumberFromString } from 'https://cdn.skypack.dev/libphonenumber-js?dts';
import { V4 } from "@V4";

/**
 * This method is used to validate phone number
 * @param phone --It takes the phone number as parameter of type string
 * @returns --It returns Response Object or void 
 */
export function isPhoneAvailable(phone:string):Response|null
{
    if(!phone)
    {
        return ErrorResponse(HTTP_STATUS_CODE.NOT_FOUND,USERMODULE.PHONENUMBER)
    }
    
    try {
        const phoneNumber = parsePhoneNumberFromString(phone);
        if (!phoneNumber) {
            return ErrorResponse(HTTP_STATUS_CODE.BAD_REQUEST,USERMODULE.INVALID_PHONE_FORMATE)
            
        }

        // Check if the phone number is valid
        if (!phoneNumber.isValid()) {
            return ErrorResponse(HTTP_STATUS_CODE.BAD_REQUEST,USERMODULE.INVALID_PHONE_NUMBER)
           
        }

        // Format the phone number in E.164 format
        const e164FormattedPhone = phoneNumber.format('E.164');
        
        // Ensure the phone number length is within the allowed range (max 15 digits)
        if (e164FormattedPhone.length > 15) {
            return ErrorResponse(HTTP_STATUS_CODE.BAD_REQUEST,"Phone number exceeds the maximum length allowed in E.164 format")            
        }
        console.log("phone:",e164FormattedPhone)
        return null
    } catch (error) {
        return ErrorResponse(HTTP_STATUS_CODE.BAD_REQUEST,"Error processing phone number")            
        
    }
}


/**
 * This method is used to validate OTP
 * @param Otp -- I takes the OTP as a parameter of type string
 * @returns -- It returns Response Object or void
 */
export  function isOtpAvailable(Otp:string):Response|null
{
    if(!Otp)
    {
        return ErrorResponse(HTTP_STATUS_CODE.NOT_FOUND,USERMODULE.OTP)
    }
    if(Otp.length!=CONSTANTS.OTP_LENGTH){
        return ErrorResponse(HTTP_STATUS_CODE.BAD_REQUEST,`${USERMODULE.INVALID_OTP_LENGTH} ${CONSTANTS.OTP_LENGTH}`)
    }
    return null
}

/**
 * This method is used to validate user_id
 * @param user_id -- It takes the user_id as a parameter of type string
 * @returns -- It returns Response Object or void
 */
 
export function validatingUserId(user_id:string):Response|null{
    if(!user_id)
    {
        return ErrorResponse(HTTP_STATUS_CODE.BAD_REQUEST,USERMODULE.USER_ID)
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
export function validateAccountStatus(accountStatus:string):Response|null
{
    
    const allowedAccountstatus:string[]=['A','S']
    if(!allowedAccountstatus.includes(accountStatus))
    {
        return ErrorResponse(HTTP_STATUS_CODE.BAD_REQUEST, USERMODULE.ALLOWED_USER_STATES);
    }
    return null
    
}


export async function validateJson(req:Request,len:number)
{
    const body = await req.json();
    if(!body)
    {
        return ErrorResponse(HTTP_STATUS_CODE.BAD_REQUEST,USERMODULE.MISSING_JSON)
    }
    if (Object.keys(body).length > len) {
        return ErrorResponse(HTTP_STATUS_CODE.BAD_REQUEST, USERMODULE.EXTRA_FIELDS_FOUND);
      }

}