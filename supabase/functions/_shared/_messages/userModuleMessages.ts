export const USERMODULE = {
    PHONENUMBER: "Phone number is required",
    OTP: "OTP is required",
    INVALID_OTP: "OTP invalid",
    USER_ID: "User Id required",
    SENT_OTP_SUCCESS: "OTP sent successfully",
    VERIFY_OTP_SUCCESS: "OTP verified success fully",
    ACCOUNT_DEACTIVATED: "your account is suspendeded/Deactivated",
    METHOD_NOT_SUPPORTED: "Method not supported",
    INTERNAL_SERVER_ERROR: "something went wrong",
    USER_VERIFIED: "OTP is verified successfully",
    ROUT_NOT_FOUND: "Route not found",
    USER_NOT_FOUND: "User not found or suspended",
    RESTRICTED_USER: "User is not Allowed",
    USER_UPDATE_SUCCESS: "User updated successfully",
    USER_LOGOUT_SUCCESS: "User logout success",
    USER_DETAILS: "User details: ",
    DEACTIVATE_USER: "User is deactivated successfully",
    ACTIVATE_USER: "User is activated successfully",
    LOCK_USER: "Your account is locked due to multiple faild atempts",
    UNAUTHERIZED_USER:
        "Authentication failed: User session expired or invalid JWT.",
    USER_LOCKED: "User is in lokout time",
    PERMISSION_DENIED:
        "Only admin users are allowed to update 'user_type', 'account_status' and 'rank'.",
    NOT_ALLOWED: "You do not have permissions",
    INVALID_USER_ID: "Invalid User id",
    INVALID_OTP_LENGTH: "OTP length should be ",
    USER_LOGOUT_ERROR: "Unable to logout user",
    EXTRA_FIELDS_FOUND: "Remove extra fields",
    INVALID_PHONE_FORMATE: "Invalid phone number format",
    INVALID_PHONE_NUMBER: "Invalid Phone number",
    MISSING_JSON: "Json body required",
    ALLOWED_USER_STATES: 'Invalid account status. It must be "A" or "S".',
    INVALID_JSON: "Invalid JSON format",
    ALLOWED_USER_SCOPES: "Allowed scopes are 'local' or 'global' only",
    USER_NOT_FOUND_: "User not found",
    USER_STATUS_SET_TO_BE: "User status set to be",
    USER_NOT_ALLOWED_TO_CHANGE: "User not allowed to change ",
    USER_fOLLOWED_SUCCESS:"User followed succesess",
    USER_ALREADY_FOLLOWED:"User already followed",
    UNABLE_TO_FOLLOW:"User unable to follow",
    YOUR_NOT_ABLE_TO_FOLLOW_YOURSELF:"Your not able to follow your self",
    USER_FAILD_TO_UPDATE:"User is faild to update",
    OTP_LIMIT_EXCEDED:"Your Otp Limit is exceded for today Try again tomorrow",
    OTP_LIMIT_FOR_FIVE_MINUTE:"Try After five minute",
    OTPDETAILS_NOT_FOUND:"OTP details not found in otp_limit table",
    PHOTO_UPLOAD_FAILED: "Failed to upload the photo. Please try again."
};
export const CONSTANTS = {
    COUNTRY_CODE: "+91",
    PHONE_NUMBER_LENGTH: 13,
    OTP_LENGTH: 6,
};

// logMessages.ts

export const LOGERROR = {
    OTP_VERIFICATION_ERROR: "Error occurred during OTP verification.",
    USER_NOT_FOUND: "User not found.",
    OTP_INVALID: "Invalid OTP.",
    USER_LOCKOUT_ERROR: "User is in lockout time.",
    INTERNAL_SERVER_ERROR: "Internal server error occurred.",
    USER_UPDATE_ERROR: "Error while updating user details.",
    USER_REGISTRATION_ERROR: "Error in creating user.",
    LOGOUT_ERROR: "Unable to logout user.",
    
    OTP_SEND_ERROR: "Error occurred while sending OTP.",
    USER_PROFILE_FETCH_ERROR: "Error occurred while fetching user profile for userId: {userId}.",
    INVALID_USER_ID: "Invalid user ID: {userId}.",
   
    PROFILE_UPDATE_ERROR: "Error occurred while updating profile for userId: {userId}.",
    USER_NOT_ALLOWED_TO_CHANGE: "User not allowed to change the field '{fieldName}' for userId: {userId}.",
    
    NOT_ALLOWED_TO_UPDATE: "User {userId} is not allowed to update another user's profile.",
    
    INVALID_SCOPE: "Invalid scope: {scope}. Allowed scopes are 'local' and 'global'.",
    USER_LOGOUT_ERROR: "Error occurred while logging out user with token: {token}. Error details: {error}",
    INVALID_ACCOUNT_STATUS: "Invalid account status: {status}.",

    NOT_ALLOWED_TO_CHANGE_USER_STATUS: "User {user_id} is not allowed to change account status.",

    USER_OTP_TABLE_ERROR:"Error at fetching data from user otp limit table",

};

export const LOGINFO = {
    OTP_VERIFICATION_STARTED: "OTP verification process started.",   
    OTP_VALID: "OTP is valid. Verifying user.",
    OTP_INVALID_ATTEMPT: "Invalid OTP attempt.",
    USER_ACCOUNT_CREATED: "New user account created successfully.",
    USER_LOCKOUT_UPDATED: "User lockout time updated successfully.",
    USER_LOGGED_IN: "User logged in successfully.",
    OTP_SEND_STARTED: "OTP send process started for phone number {phoneNo}.",
    USER_FOUND: "User found for phone number {phoneNo}.",
    USER_NOT_LOCKED_OUT: "User is not in lockout period",
    OTP_SENT_SUCCESS: "OTP sent successfully to phone number {phoneNo}.",
    FETCH_PROFILE_STARTED: "Fetching profile for userId: {userId}.",
    FETCH_PROFILE_VALIDATED: "User ID validated successfully for userId: {userId}.",
    USER_PROFILE_FETCHED: "Successfully fetched profile for userId: {userId}.",
    USER_NOT_FOUND: "User not found for userId: {userId}.",
    PROFILE_UPDATE_STARTED: "Profile update started for userId: {userId}.",
    FETCHING_USER_PROFILE: "Fetching profile for userId: {userId}.",   
    UPDATING_PROFILE: "Updating profile for userId: {userId}.",
    PROFILE_UPDATED_SUCCESS: "Profile updated successfully for userId: {userId}.",
    LOGOUT_STARTED: "Logout process started for token: {token}.",
    USER_LOGOUT_SUCCESS: "User successfully logged out for token: {token}.",
    USER_STATUS_UPDATE_STARTED: "Started updating account status for user {user_id} to {status}.",
    USER_STATUS_UPDATE_PROCESS: "Processing status update for user {user_id}.",
    USER_STATUS_UPDATED: "Successfully updated account status for user {user_id} to {status}.",
};

export const LOGMESSAGE = {
    OTP_SENT: "OTP sent successfully.",
    OTP_VERIFIED: "OTP verified successfully.",
    USER_LOCKOUT: "User is locked out. Please try after {lockoutTime}.",
    USER_CREATED: "New user account created with userId: {userId}.",    
    ACCOUNT_DEACTIVATED: "Account is deactivated. Try again after {lockoutTime}.",
    USER_PROFILE_FETCHED: "User profile fetched successfully.",
    PROFILE_UPDATED: "User profile updated successfully.",
    USER_LOGGED_OUT: "User has logged out successfully.",
    USER_STATUS_UPDATED_SUCCESSFULLY: "User account status updated successfully.",
};
