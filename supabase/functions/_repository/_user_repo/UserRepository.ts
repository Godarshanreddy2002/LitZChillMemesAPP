import supabase from "@shared/_config/DbConfig.ts";
import { UserProfile } from '@model/UserModel.ts';
import { TABLE_NAMES } from "@shared/_db_table_details/TableNames.ts";
import { OTP_LIMITS_TABLE_FIELDS, OTP_REQUEST_TABLE_FIELDS, OTP_SETTINGS_TABLE_FIELDS, USER_TABLE_FIELDS } from "@shared/_db_table_details/UserTableFields.ts";



/**
 * this method is used to Fetch User profile  based on the user_Id
 *
 * @param id --I takes the user id as a parameter
 * @returns -- It will return user data or error
 */
export async function getUserProfile(id: string): Promise<{ data: any, error: any }> {
  console.log("fetching start");
  const { data, error } = await supabase
    .from(TABLE_NAMES.USER_TABLE)
    .select('*')
    .eq(USER_TABLE_FIELDS.USER_ID, id).maybeSingle();

  return { data, error };

}
/**
 * This method is used to get user through phone number
 * @param phoneNo --It takes phone number as the parameter
 * @returns --It will return Response Object or User Profile
 */

export async function getUser(phoneNo: string): Promise<{ data: any, error: any }> {
  const { data, error } = await supabase
    .from(TABLE_NAMES.USER_TABLE)
    .select("*")
    .eq(USER_TABLE_FIELDS.MOBILE, phoneNo)  .or(`lockout_time.lt.${new Date().toISOString()},lockout_time.is.null`)
    .maybeSingle();
  return { data, error };
}

/**
 * This method is used to update user profile and it will return updated user data
 * @param profile -- It takes the UserProfile type variable as parameter to Update user profile
 * @param user_id -- user_id used to update user user profile based on user_id
 * @returns -- It will return updated user profile or Response object
 */

export async function updateProfile(profile: Partial<UserProfile>, user_id: string): Promise<{ data: any, error: any }> {
  const { data, error } = await supabase
    .from(TABLE_NAMES.USER_TABLE)
    .update(profile)
    .eq(USER_TABLE_FIELDS.USER_ID, user_id)
    .eq(USER_TABLE_FIELDS.ACCOUNT_STATUS, "A")
    .or(`lockout_time.lt.${new Date().toISOString()},lockout_time.is.null`)  // Optional lockout check
    .select()
    .maybeSingle();
  return { data, error };
}


/**
 * This method is used to update user lockout_time, account_status, faild _login_count based on user_id
 * 
 * @param user_Id -- It is user_id of type string
 * @param lockout_time --It can be eigther null or Date type
 * @param failed_login_count --It is a number type
 * @param account_status --It can be either 'A'||'S'
 * @returns --It will return response Object or Updated user data
 */

export async function makeUserLockout(
  user_Id: string,
  lockout_time: string | null,
  failed_login_count: number,
  account_status: string,
): Promise<{ data: any, error: any }> {
  console.log("Failed Login count", failed_login_count);
  console.log("User id is :", user_Id);
  const { data, error } = await supabase
    .from(TABLE_NAMES.USER_TABLE)
    .update({
      [USER_TABLE_FIELDS.ACCOUNT_STATUS]: account_status,
      [USER_TABLE_FIELDS.LOCKOUT_TIME]: lockout_time,
      [USER_TABLE_FIELDS.FAILED_LOGIN_COUNT]: failed_login_count
    })
    .eq(USER_TABLE_FIELDS.USER_ID, user_Id).select().maybeSingle();
  return { data, error };
}
/**
 * This method is used to create new user account
 * 
 * @param user_id --It is user user_id of type string(uuid)
 * @param phoneNo --It is user phone number
 * @returns -- It will return data or error
 */
export async function RegisterUser(user_id: string, phoneNo: string): Promise<{ data: any, error: any }> {
  const { data, error } = await supabase
    .from(TABLE_NAMES.USER_TABLE)
    .insert({
      [USER_TABLE_FIELDS.USER_ID]: user_id,
      [USER_TABLE_FIELDS.MOBILE]: phoneNo,
      [USER_TABLE_FIELDS.ACCOUNT_VERIFIED]: { email: false, phone: true },
      [USER_TABLE_FIELDS.ACCOUNT_STATUS]: 'A',
      [USER_TABLE_FIELDS.USER_TYPE]: 'U'
    }).maybeSingle();
  return { data, error }
}



export async function createOtpLimitTable(user_id: string): Promise<{ data: any, error: any }> {
  const { data, error } = await supabase
    .from(TABLE_NAMES.OTP_TABLE)
    .insert({
      [OTP_LIMITS_TABLE_FIELDS.USER_ID]: user_id,
      [OTP_LIMITS_TABLE_FIELDS.TOTAL_OTPS_LAST_5_MIN]: 1,
      [OTP_LIMITS_TABLE_FIELDS.TOTAL_OTPS_PER_DAY]: 1,
      [OTP_LIMITS_TABLE_FIELDS.LAST_UPDATED]: new Date()
    }).maybeSingle();
  return { data, error }
}



/**
 * This method is used to deactivate account by user_id
 * @param user_Id --It is user user_id of type string(uuid)
 * @returns --It will return Response object
 */

export async function updateUserStatus(user_Id: string, account_status: string): Promise<{ data: any, error: any }> {
  const { data, error } = await supabase
    .from(TABLE_NAMES.USER_TABLE)
    .update({ [USER_TABLE_FIELDS.ACCOUNT_STATUS]: account_status })
    .eq(USER_TABLE_FIELDS.USER_ID, user_Id)
    .select('*')
    .maybeSingle();
  return { data, error };
}
export async function updateUserProfilePhoto(user_Id: string, photoUrl: string): Promise<{ data: any, error: any }> {
  const { data, error } = await supabase
    .from(TABLE_NAMES.USER_TABLE)
    .update({ [USER_TABLE_FIELDS.PROFILE_PICTURE_URL]: photoUrl })
    .eq(USER_TABLE_FIELDS.USER_ID, user_Id)
    .select()
    .maybeSingle();
  return { data, error };
}

/**
 * This method is used to update total_otps_last_5_min limit to 0
 */

export async function updateEveryFiveMinuteOtpCount() {
  const { data, error } = await supabase
    .from('otp_limits')
    .update({
      [OTP_LIMITS_TABLE_FIELDS.TOTAL_OTPS_LAST_5_MIN]: 0,
      [OTP_LIMITS_TABLE_FIELDS.LAST_UPDATED]: new Date(),
    }).gt(OTP_LIMITS_TABLE_FIELDS.TOTAL_OTPS_LAST_5_MIN, 0).select();


  console.log(new Date(), "Otp count for five minutes is set 0")
  if (data) {
    console.log(data);
  }
  if (error) {
    console.log(error.message);
  }
}

/**
 * This method is used to update OTP limit every day to 0
 */
export async function updateEveryDayOtpCount() {
  const { data, error } = await supabase
    .from(TABLE_NAMES.OTP_TABLE)
    .update({
      [OTP_LIMITS_TABLE_FIELDS.TOTAL_OTPS_LAST_5_MIN]: 0,
      [OTP_LIMITS_TABLE_FIELDS.LAST_UPDATED]: new Date(),
    }).gt(OTP_LIMITS_TABLE_FIELDS.TOTAL_OTPS_PER_DAY, 0)

  console.log(new Date(), "Otp count for otp is set to 0")
}

export async function CheckFollower(user_id: string, follower_id: string): Promise<{ data: any, error: any }> {
  const { data, error } = await supabase
    .from('followers')
    .select("*")
    .eq('user_id', user_id)
    .eq('follower_id', follower_id)
    .maybeSingle()
  return { data, error }
}
export async function addFollowerToUser(user_id: string, follower_id: string): Promise<{ data: any, error: any }> {
  const { data, error } = await supabase
    .from('followers')
    .insert({ 'user_id': user_id, 'follower_id': follower_id })
    .select()
    // .neq('follower_id',follower_id)
    .maybeSingle();
  return { data, error }
}
export async function updateFollowerCount(user_id: string, follower_count: number) {
  const { data, error } = await supabase
    .from(TABLE_NAMES.USER_TABLE)
    .update({ 'follower_count': follower_count })
    .eq('user_id', user_id)
    .select("follower_count")
    .maybeSingle();

  return { data, error }
}

export async function getFollowers(user_id: string, page: number, size: number): Promise<{ data: any, error: any }> {
  const { data, error } = await supabase
    .from('followers')
    .select(`*,users(first_name)`)
    .eq('user_id', user_id)
    .order('created_at', { ascending: false }) 
    .range(page, size)
  // .limit(size);  

  return { data, error };
}
export async function getUserWithOTPCount(phoneNo: string): Promise<{ data: any, error: any }> {
  const { data, error } = await supabase
    .from(TABLE_NAMES.OTP_TABLE)
    .select(`
      *, 
      users(*)
    `)
    .eq(USER_TABLE_FIELDS.MOBILE, phoneNo)  // .or(`lockout_time.lt.${new Date().toISOString()},lockout_time.is.null`)
    .maybeSingle();
  return { data, error };
}

export async function getUserOtpDetails(user_id: string): Promise<{ data: any, error: any }> {
  const { data, error } = await supabase
    .from(TABLE_NAMES.OTP_TABLE)
    .select("*")
    .eq(USER_TABLE_FIELDS.USER_ID, user_id)  // .or(`lockout_time.lt.${new Date().toISOString()},lockout_time.is.null`)
    .maybeSingle();
  return { data, error };
}

export async function updateOtpLimitTable(user_id: string, fiveMinuteCount: number, oneDayCount: number): Promise<{ data: any, error: any }> {

  const { data, error } = await supabase
    .from(TABLE_NAMES.OTP_TABLE)
    .update({
      [OTP_LIMITS_TABLE_FIELDS.TOTAL_OTPS_LAST_5_MIN]: fiveMinuteCount,
      [OTP_LIMITS_TABLE_FIELDS.TOTAL_OTPS_PER_DAY]: oneDayCount,
      [OTP_LIMITS_TABLE_FIELDS.LAST_UPDATED]: new Date(),
    }).eq(OTP_LIMITS_TABLE_FIELDS.USER_ID, user_id).maybeSingle();

  return { data, error }
}


/**
 * Uploads a file (image or video) to the specified bucket.
 *
 * @param {File} mediaFile - The file object to be uploaded.
 * @param {string} memeTitle - The title of the meme associated with the file.
 * @returns {Promise<string | null>} - The public URL of the uploaded file, if successful; otherwise, null.
 */

export async function uploadFileToBucket(username: string, mediaFile: File): Promise<string | null> {
  console.log("Uploading media file");

  try {
    const allowedTypes: string[] = ["image/jpeg", "image/png"];
    if (!allowedTypes.includes(mediaFile.type)) {
      console.error(`Unsupported file type: ${JSON.stringify(mediaFile.type)}`);
      return null;
    }

    // Generate a hash of the file content
    const fileHash = await generateFileHash(mediaFile);
    console.log(`Generated file hash: ${JSON.stringify(fileHash)}`);

    // Retrieve files in the "memes" folder
    const { data: existingFiles, error: listError } = await supabase
      .storage
      .from('user_profile')
      .list("user_profile");

    if (listError) {
      console.error(`Error fetching files from bucket: ${JSON.stringify(listError)}`);
      return null;
    }

    // Check if a file with the same hash exists
    const existingFile = existingFiles?.find((file: { name: string; }) =>
      file.name.endsWith(`${fileHash}.${mediaFile.name.split('.').pop()?.toLowerCase()}`)
    );

    if (existingFile) {
      // Return the public URL of the existing file
      const { data: publicUrlData } = supabase
        .storage
        .from('user_profile')
        .getPublicUrl(existingFile.name);

      console.log("Found an existing file with the same content.");
      return publicUrlData?.publicUrl || null;
    }

    // Prepare new file path if not an existing file
    const extension = mediaFile.name.split('.').pop()?.toLowerCase() || "";
    const sanitizedFileName = `${username.replace(/\s+/g, "_")}-${fileHash}.${extension}`;
    const filePath = `user_profile/${sanitizedFileName}`;

    // Upload the new file
    console.log("File not found in the bucket. Proceeding with upload...");
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('user_profile')
      .upload(filePath, mediaFile, {
        cacheControl: "3600",
        upsert: false,
        contentType: mediaFile.type,
      });

    if (uploadError || !uploadData) {
      console.error(`Error uploading file: ${JSON.stringify(uploadError)}`);
      return null;
    }

    console.log("File uploaded successfully.");

    // Get the public URL of the uploaded file
    const { data: publicUrlData } = supabase
      .storage
      .from('user_profile')
      .getPublicUrl(filePath);

    console.log(`Public URL data: ${JSON.stringify(publicUrlData)}`);
    return publicUrlData?.publicUrl || null;

  } catch (error) {
    console.error(`Error in uploadFileToBucket: ${error}`);
    return null;
  }
}



// Helper function to generate the SHA-256 hash of a file
async function generateFileHash(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer); // Generate hash using SHA-256
  const hashArray = Array.from(new Uint8Array(hashBuffer)); // Convert buffer to byte array
  const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, "0")).join(""); // Convert byte array to hex string
  return hashHex;
}






/**
 * Updates the OTP settings for a given ID in the OTP settings table.
 * @param {string} time_units - The time units for the OTP settings. Allowed values are 'days', 'min', 'hours'.
 * @param {number} time_units_count - The number of time units for the OTP settings.
 * @param {number} max_OTP - The maximum number of OTP attempts allowed.
 * @param {number} id - The ID of the OTP settings to be updated.
 * @returns {Promise<{data:any,error:any}>} - The result of the update operation.
 */
export async function updateOtpLimitSettings(time_units: string, time_units_count: number, max_OTP: number, id: string): Promise<{ data: any, error: any }> {
  const { data, error } = await supabase
    .from(TABLE_NAMES.OTP_SETTINGS_TABLE)
    .update([
      {
        [OTP_SETTINGS_TABLE_FIELDS.TIME_UNIT]: time_units,
        [OTP_SETTINGS_TABLE_FIELDS.TIME_UNITS_COUNT]: time_units_count,
        [OTP_SETTINGS_TABLE_FIELDS.MAX_OTP_ATTEMPTS]: max_OTP,
        [OTP_LIMITS_TABLE_FIELDS.CRITERIA_STATUS]:'active'
      }])
    .eq(OTP_SETTINGS_TABLE_FIELDS.ID, id)
    .select();
  return { data, error }
}



/**
 * Adds a new entry to the OTP requests table for a given user ID.
 * @param {string} user_id - The ID of the user to add an OTP entry for.
 * @returns {Promise<{data:any,error:any}>} - The result of the add operation.
 */

export async function addOTPEntry(user_id: string): Promise<{ data: any, error: any }> {
  const { data, error } = await supabase
    .from('otp_requests')
    .insert([{
      'requested_at': new Date(),
      'user_id': user_id
    }])
    .single();

  return { data, error };
}


/**
 * Counts the number of OTP requests for a given user between a start and end time.
 * @param {string} user_id - The ID of the user to count OTP requests for.
 * @param {Date} start_time - The start time to count OTP requests from.
 * @param {Date} end_time - The end time to count OTP requests to.
 * @returns {Promise<{count:number,error:any}>} - The result of the count operation.
 */
export async function countOtpRequests(phoneNo: string, start_time: Date, end_time: Date): Promise<{ count: any, error: any }> {
  const startTimeISO = start_time.toISOString();
  const endTimeISO = end_time.toISOString();

  // const { count, error } = await supabase
  //   .from(TABLE_NAMES.OTP_REQUEST_TABLE)
  //   .select("*", { count: "exact", head: true })
  //   // .gte("requested_at", '2025-03-19 00:00:00')
  //   // .lte("requested_at", '2025-03-19 23:59:59' )
  //   .gte(OTP_REQUEST_TABLE_FIELDS.OTP_REQUESTED_AT, startTimeISO) // Filter from start time
  //   .lte(OTP_REQUEST_TABLE_FIELDS.OTP_REQUESTED_AT, endTimeISO)
  //   .eq(OTP_REQUEST_TABLE_FIELDS.PHONE_NUMBER, phoneNo); // Filter up to end time

  const { count, error } = await supabase
    .from(TABLE_NAMES.OTP_REQUEST_TABLE)
    .select("*", { count: "exact", head: true })
    .gte(OTP_REQUEST_TABLE_FIELDS.OTP_REQUESTED_AT, startTimeISO) // Use ISO format
    .lte(OTP_REQUEST_TABLE_FIELDS.OTP_REQUESTED_AT, endTimeISO)
    .eq(OTP_REQUEST_TABLE_FIELDS.PHONE_NUMBER, phoneNo);
  console.log("data" + count + " error:" + error?.message)
  return { count, error };
}

/**
 * Retrieves the current OTP settings from the database.
 * @returns {Promise<{data:any,error:any}>} - The result of the retrieval operation.
 */
export async function getOtpSettings(): Promise<{ data: any, error: any }> {
  const { data, error } = await supabase
    .from(TABLE_NAMES.OTP_SETTINGS_TABLE)
    .select("*")
    .eq(OTP_SETTINGS_TABLE_FIELDS.CEITERIA_STATUS, "active")
    .maybeSingle();

  console.log(data);
  return { data, error }

}



export async function insertOtpRequest(user_id: string, currentDate: Date): Promise<{ data: any, error: any }> {
  const { data, error } = await supabase
    .from(TABLE_NAMES.OTP_REQUEST_TABLE)
    .insert([{
      [OTP_REQUEST_TABLE_FIELDS.OTP_REQUESTED_AT]: currentDate,
      [OTP_REQUEST_TABLE_FIELDS.PHONE_NUMBER]: user_id
    }]).maybeSingle();
  return { data, error };
}






/**
 * Fetches a user by their unique mobile number and lockout_time.
 *
 * @param {string} mobileNumber - The unique identifier of the user.
 * @returns {Promise<{ data: any; error: any }>}
 * - An object containing the user data (`data`) or an error (`error`).
 */
// export const getUserByMobileNumberWhereLockoutTimeIsNull = async (
//   mobileNumber: string,
// ): Promise<{ data: DbUser | null; error: PostgrestError | null }> => {
//   try {
//       logger.info(
//           MESSAGES.LOGGER_START('getUserByMobileNumberWhereLockoutTimeIsNull'),
//       );
//       const currentTimestamp: string = DateUtil.getCurrentUTCDateTime();
//       return await supabase
//           .from(TABLES.USER.NAME)
//           .select(COMMON.SELECT_ALL)
//           .eq(TABLES.USER.COLUMNS.mobile, mobileNumber)
//           .not(TABLES.USER.COLUMNS.lockout_time, 'is', null)
//           .gt(TABLES.USER.COLUMNS.lockout_time, currentTimestamp)
//           .gte(TABLES.USER.COLUMNS.failed_login_count, 3)
//           .maybeSingle();
//   } catch (e) {
//       logger.error(MESSAGES.QUERY_ERROR, e);
//       throw e;
//   } finally {
//       logger.info(
//           MESSAGES.LOGGER_END('getUserByMobileNumberWhereLockoutTimeIsNull'),
//       );
//   }
// };


export async function createOtpSettings(time_units: string, time_units_count: number, max_OTP: number): Promise<{ data: any, error: any }> {
  const { data, error } = await supabase
    .from(TABLE_NAMES.OTP_SETTINGS_TABLE)
    .insert([
      {
        [OTP_SETTINGS_TABLE_FIELDS.TIME_UNIT]: time_units,
        [OTP_SETTINGS_TABLE_FIELDS.TIME_UNITS_COUNT]: time_units_count,
        [OTP_SETTINGS_TABLE_FIELDS.MAX_OTP_ATTEMPTS]: max_OTP,
        [OTP_LIMITS_TABLE_FIELDS.CRITERIA_STATUS]:'active'
      }])   
    .maybeSingle();
  return { data, error }
}



/**
 * Deletes an OTP limit setting entry from the OTP settings table based on the given criteria ID.
 * @param {string} criteria_id - The ID of the OTP setting to be deleted.
 * @returns {Promise<{data:any,error:any}>} - The result of the delete operation.
 */

export async function deleteOtpLimitSettings(criteria_id:string) {
  const { data, error } = await supabase
    .from(TABLE_NAMES.OTP_SETTINGS_TABLE)
    .delete()
    .eq(OTP_SETTINGS_TABLE_FIELDS.ID, criteria_id)
    .neq(OTP_SETTINGS_TABLE_FIELDS.CEITERIA_STATUS, "active") 
  return { data, error }  
}