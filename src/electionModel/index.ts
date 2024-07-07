import { Contest } from "./contests/contest";
import { PresidentialRace } from "./contests/presidentialRace";


export const GENERIC_BALLOT = new Contest();


export const PRESIDENTIAL_RACE = new PresidentialRace(GENERIC_BALLOT);
