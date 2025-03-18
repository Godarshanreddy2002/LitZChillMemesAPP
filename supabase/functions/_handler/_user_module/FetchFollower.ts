import { getFollowers } from "@repository/_user_repo/UserRepository.ts";
import ErrorResponse, { SuccessResponse } from "@response/Response.ts";
import { HTTP_STATUS_CODE } from "@shared/_constants/HttpStatusCodes.ts";

/**
 * Fetches the list of followers for a given user.
 * Steps:
 * 1. Extract the user ID from the request parameters.
 * 2. Call the `getFollowers` repository method to retrieve the list of followers for the user.
 * 3. Handle any errors during the data fetching process.
 * 4. If no followers are found or an error occurs, return an appropriate error response.
 * 5. If followers are found, return the list of followers in a success response.
 *
 * @param req - The request object, which contains the user ID in the parameters.
 * @param params - A record containing user-specific data, including `user_id` for which followers are being fetched.
 * @returns - A JSON response containing the list of followers if found, or an error message.
 */
export default async function fetchFollower(req: Request, params: Record<string, string>): Promise<Response> {
    try {
        // Step 1: Extract user_id from the request parameters
        const user_id = params.user_id;


        const url = new URL(req.url);
        const page = parseInt(url.searchParams.get("page")||"0");
        const size = parseInt(url.searchParams.get("size")||"10");

        
        //convert page and size into number

        const start = (page - 1) * size;
        const end = start + size - 1;
        
        
        // Step 2: Fetch followers using the repository method
        const { data, error } = await getFollowers(user_id,start,end);

        // Step 3: Handle any errors encountered during the data fetching process
        if (error) {
            return ErrorResponse(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR, `${error.message}`);
        }

        // Step 4: If no followers found, return an error response
        if (!data) {
            return ErrorResponse(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR, `Followers not found`);
        }

        // Debug: Log the followers data for inspection
        console.log(data);
        if(data.length == 0) {
            return SuccessResponse("No followers in page Number: "+page, HTTP_STATUS_CODE.OK, data);
        }
        // Step 5: Return the list of followers if found in a success response
        return SuccessResponse("Followers found", HTTP_STATUS_CODE.OK, data);
        
    } catch (error) {
        // Catch any unexpected errors and return a general error response
        return ErrorResponse(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR, `${error}`);
    }
}
