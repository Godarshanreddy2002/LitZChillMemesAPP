 import {  updateEveryDayOtpCount, updateEveryFiveMinuteOtpCount } from "@repository/_user_repo/UserRepository.ts";
import { routeHandler } from "../_routes/Route_Handler.ts";
import { USER_MODULE_ROUTESs } from "../_routes/UserRoutesAndPaths.ts";
import {cron, daily} from "https://deno.land/x/deno_cron/cron.ts";


type JobType = () => void;

  Deno.serve(async (req: Request) => {
  
    return await routeHandler(req,USER_MODULE_ROUTESs)
    
    });

    
  // daily(updateEveryDayOtpCount)
  // const every5Minute = (cb: JobType) => {
  //     cron(`1 */5 * * * *`, cb);
  // };
  // every5Minute(updateEveryFiveMinuteOtpCount);
  
  
   

