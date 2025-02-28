import logoutUser from "../_handler/_user_module/Logout.ts";  
import signInWithOtp from "../_handler/_user_module/SendOTP.ts";
import verifyOtp from "../_handler/_user_module/verifyOtp.ts";
import { HTTP_METHOD } from "../_shared/_constants/HttpMethods.ts";
import { USER_ROLES } from "../_shared/_constants/UserRoles.ts";
import { checkUserAuthentication } from "../_middleware/middlerWare.ts";
import { USER_MODULE_ROUTES } from "./RoutesPaths.ts";
import { ActivateOrDeactivateUser } from "../_handler/_user_module/ActivateOrDeactivateAccount.ts";
import FetchUserProfile from "../_handler/_user_module/FetchUser.ts";
import updateUserProfile from "../_handler/_user_module/ProfileUpdate.ts";
import addFollower from "../_handler/_user_module/AddFollower.ts";
import fetchFollower from "../_handler/_user_module/FetchFollower.ts";
import updateProfilePhoto from "@handler/_user_module/UpdateProfilePhoto.ts";

// Mapping all the routes in one place
export const USER_MODULE_ROUTESs = {
  [HTTP_METHOD.POST]: {
    [USER_MODULE_ROUTES.SEND_OTP]: signInWithOtp,
    [USER_MODULE_ROUTES.VERIFY_OTP]: verifyOtp,
    [USER_MODULE_ROUTES.USER_LOGOUT]: checkUserAuthentication(
        logoutUser,
        [
            USER_ROLES.ADMIN_ROLE, 
            USER_ROLES.USER_ROLE,
            USER_ROLES.MEMER_ROLE,
        ]
    ),
    [USER_MODULE_ROUTES.ADD_FOLLOWER]:checkUserAuthentication(
        addFollower,
        [
            USER_ROLES.ADMIN_ROLE,
            USER_ROLES.MEMER_ROLE,
            USER_ROLES.USER_ROLE,
        ]
    )
},
[HTTP_METHOD.PATCH]:{
    [USER_MODULE_ROUTES.UPDATE_USER]:checkUserAuthentication(
        updateUserProfile,
        [
            USER_ROLES.ADMIN_ROLE,
            USER_ROLES.MEMER_ROLE,
            USER_ROLES.USER_ROLE
            
        ]
    ),
    [USER_MODULE_ROUTES.ACTIVATE_OR_DEACTIVATE_USER]:checkUserAuthentication(
        ActivateOrDeactivateUser,
        [
            USER_ROLES.ADMIN_ROLE,
            USER_ROLES.MEMER_ROLE,
            USER_ROLES.USER_ROLE
        ]
    ),
    [USER_MODULE_ROUTES.UPDATE_PHOTO]:checkUserAuthentication(
        updateProfilePhoto,
        [
            USER_ROLES.ADMIN_ROLE,
            USER_ROLES.MEMER_ROLE,
            USER_ROLES.USER_ROLE
        ]
    )
},
[HTTP_METHOD.GET]:{
    [USER_MODULE_ROUTES.FETCH_USER]:checkUserAuthentication(
        FetchUserProfile,
        [
            USER_ROLES.ADMIN_ROLE,
            USER_ROLES.MEMER_ROLE,
            USER_ROLES.USER_ROLE
        ]
    )
    , [USER_MODULE_ROUTES.FETCH_FOLLOWERS]:checkUserAuthentication(
        fetchFollower,
        [
            USER_ROLES.ADMIN_ROLE,
            USER_ROLES.MEMER_ROLE,
            USER_ROLES.USER_ROLE
        ]
    )
}
}