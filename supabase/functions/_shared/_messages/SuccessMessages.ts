export function returnAccessToken(message:string,user_id:string,session_token:string)
{
    return new Response(
        JSON.stringify({ message: message,user_id,session_token }),
        {
            status: 200,
            headers: { "Content-Type": "application/json" },
        },
    );
}
