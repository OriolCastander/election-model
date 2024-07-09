import { Contest } from "./contests/contest";
import { PresidentialRace } from "./contests/presidentialRace";
import { fetchPolls } from "./polling/poll";


const polls = fetchPolls({});

export const GENERIC_BALLOT = new Contest();
export const PRESIDENTIAL_RACE = new PresidentialRace(GENERIC_BALLOT);

PRESIDENTIAL_RACE.addPolls(polls.filter((poll)=>poll.target == "president"));
