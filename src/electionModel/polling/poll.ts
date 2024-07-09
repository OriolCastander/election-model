import { Pollster, PollsterName, pollsterNames } from "./pollster";
import pollsJson from "../../data/polls.json";
import { PresidentialContestName } from "../contests/presidentialRace";


export interface Result{
    dem: number,
    rep: number,
}

export interface Poll{

    /** Pointer to the pollster of the poll */
    pollster: Pollster,

    date: Date,

    target: "president" | "house" | "senate",

    contest: "" | PresidentialContestName,

    generalResult: Result,
}

/**
 * Fetches polls from the database
 */
export const fetchPolls = (pollsters: {[name in PollsterName]?: Pollster}): Poll[] =>{

    const polls: Poll[] = [];

    for (const pollJson of pollsJson){

        //DO NOT PARSE THE POLL IF NOT FROM A VALID POLLSTER
        if (!pollsterNames.includes(pollJson.pollster as PollsterName)){continue;}
        
        const pollsterName = pollJson.pollster as PollsterName;
        
        //CREATE THE POLLSTER IF NOT EXISTING
        if (!(pollsterName in pollsters)){
            pollsters[pollsterName] = new Pollster(pollsterName);
        }

        //CURRENTLY ONLY GENERAL ELECTION POLLS
        const poll: Poll = {...pollJson,
            pollster: pollsters[pollsterName]!,
            date: new Date(pollJson.date),
            target: pollJson.target as "president" | "house" | "senate",
            contest: pollJson.contest as "" | PresidentialContestName,
        };

        polls.push(poll);


    }


    return polls;
}