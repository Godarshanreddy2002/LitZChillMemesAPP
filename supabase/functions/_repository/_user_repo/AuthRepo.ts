import supabase from "@shared/_config/DbConfig.ts";
/**
 * This method sends OTP to the user by calling Supabase auth signInWithOtp
 * @param phoneNumber - Mobile number registered in the system
 * @returns - It returns a promise with data and error object
 */
export async function sendOtp(phoneNumber:string) :Promise<{data:any,error:any}>
{
    const { data,error } = await supabase.auth.signInWithOtp({
        phone: phoneNumber,
      });   
      return {data,error}
}

/**
 * This method verifies the OTP send by the user
 * @param phoneNumber - Mobile number registered in the system
 * @param otp - OTP sent to the user
 * @returns - It returns a promise with data and error object
 */
export async function otpVerication(phoneNumber:string,otp:string):Promise<{data:any,error:any}> 
{
    const { data, error } = await supabase.auth.verifyOtp({
        phone: phoneNumber,
        token: otp,
        type: "sms",
    });
    return {data,error}

}

export async function logout(token:string,scope:string):Promise<{data:any,error:any}>
{
    if(scope=='local')
    {
        const {data,error}=await supabase.auth.admin.signOut(token as string,'local');
        return {data,error}
    }
    if(scope=='global')
    {
        const {data,error}=await supabase.auth.admin.signOut(token as string,'global')
        return {data,error} 
    }
    return {data:null,error:null}    
}

