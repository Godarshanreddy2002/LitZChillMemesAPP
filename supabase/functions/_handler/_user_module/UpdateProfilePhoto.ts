import { validatingUserId } from "@shared/_validation/UserValidate.ts";
import { LOGERROR, USERMODULE } from "@shared/_messages/userModuleMessages.ts";
import Logger from "@shared/_logger/Logger.ts";
import ErrorResponse, { SuccessResponse } from "@response/Response.ts";
import { HTTP_STATUS_CODE } from "@shared/_constants/HttpStatusCodes.ts";
import { USER_TABLE_FIELDS } from "@shared/_db_table_details/UserTableFields.ts";
import { updateUserProfilePhoto, uploadFileToBucket } from "@repository/_user_repo/UserRepository.ts";

const logger = Logger.getInstance();



export default async function updateProfilePhoto(req:Request,params:Record<string,string>):Promise<Response> {
    
    
    try{
        const id = params.id;
        const username = params.profile;
        const idAvailable = await validatingUserId(id);
        if (idAvailable instanceof Response) {
            logger.error(LOGERROR.INVALID_USER_ID.replace("{userId}", id)); // Log invalid user ID
            return idAvailable; // Return an error response if validation fails
        }
        const user_id = params.user_id;
        if (user_id != id ) {
            logger.error(LOGERROR.NOT_ALLOWED_TO_UPDATE.replace("{userId}", id)); // Log permission error
            return ErrorResponse(HTTP_STATUS_CODE.FORBIDDEN, USERMODULE.NOT_ALLOWED);
        }
        const formData = await req.formData();
        const profile = formData.get(USER_TABLE_FIELDS.PROFILE_PICTURE_URL) as File;
        const data = await uploadFileToBucket(username,profile)
        if(!data)
        {
           return ErrorResponse(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,USERMODULE.PHOTO_UPLOAD_FAILED) 
        }
        if(data)
        {
            const {data:addphoto,error:addPhotoError}=await updateUserProfilePhoto(user_id,data)
            if(addPhotoError)
            {
                return ErrorResponse(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,"Something went wrong")
            }
            if(!addphoto)
            {
                return ErrorResponse(HTTP_STATUS_CODE.FORBIDDEN,"unable to upload user profile")
            }

            return SuccessResponse("user Profile photo is successfully added",HTTP_STATUS_CODE.OK)
        }
    
        return ErrorResponse(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,"Something went wrong")
    }
    catch(error)
    {
        return ErrorResponse(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,"Something went wrong2")
    }
}