


//common error response 
export default function ErrorResponse(statusCode: number, error: string){
    const time = new Date();
    return new Response(JSON.stringify({statusCode,error,time}), {
        status: statusCode,
        headers: { "Content-Type": "application/json" },
    });
}

//common success response
export function SuccessResponse(message: string, statusCode: number ,data?: any, ){
    
    const body = data ? {statusCode, message, data } : { statusCode,message };
    return new Response(
        JSON.stringify({body}),
        {
            status: statusCode,
            headers: { 'content-type':'application/json'},
        }
    );
}
