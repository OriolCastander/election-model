import {Distribution} from "../distributions/distribution";
import {SeparateDistribution} from "../distributions/separateDistribution";
import { NormalDistribution } from "../distributions/normalDistribution";

import {Contest} from "../contests/contest";

import { stateNames, StateName } from "../utils/utils";

import jsonData from "../../data/data.json";
import { Poll } from "../polling/poll";


export const presidentialContestNames = [... stateNames, "Maine 1st" , "Maine 2nd" , "Nebraska 1st" , "Nebraska 2nd" , "Nebraska 3rd" ,
"District of Columbia"] as const;

export type PresidentialContestName = typeof presidentialContestNames[number];

/**
 * Configs for the computation of a presidential race
 */
export interface PresidentialRaceConfig{

    /**
     * Factor by which the contest is independent from the generic ballot. A 1 it is completely separate, a 0 it is completely tied
     */
    contestElasticity: number,
};

/**
 * The output of the presidential race computation
 */
export type PresidentialRaceOutput = {
    genericBallot: SeparateDistribution,

    contests: {[kind in PresidentialContestName]: Distribution}, 
};


/**
 * The presidential race object
 */
export class PresidentialRace{

    public genericBallot: Contest;
    public contests: {[name in PresidentialContestName]: PresidentialContest};

    constructor(genericBallot: Contest){

        this.genericBallot = genericBallot;
        this.contests = PresidentialRace.loadContests();
    }


    static loadContests(): {[name in PresidentialContestName]: PresidentialContest}{

        const contests: {[name in PresidentialContestName]?: PresidentialContest} = {};
        
        var votesDem = 0; var votesRep = 0; var votesTot = 0;

        ///PASS 1: COMPUTE THE TOTALS
        for (const contestName in jsonData){
            const contestData = jsonData[contestName as PresidentialContestName];
            if (!["Maine 1st", "Maine 2nd", "District of Columbia", "Nebraska 1st", "Nebraska 2nd", "Nebraska 3rd"].includes(contestName)){
                //SUM TO THE TOTAL AMOUNT OF VOTES
                votesDem += contestData.pastElections.presidential2020.dem;
                votesRep += contestData.pastElections.presidential2020.rep;
                votesTot += contestData.pastElections.presidential2020.tot;
            }
        }

        //DEM ADVANTAGE IN ELECTION
        const environment = (votesDem - votesRep) / (votesTot);

        //PASS 2: MAKE THE CONTEST OBJECTS
        for (const contestName in jsonData){
            const contestData = jsonData[contestName as PresidentialContestName];
            const dem = contestData.pastElections.presidential2020.dem;
            const rep = contestData.pastElections.presidential2020.rep;
            const tot = contestData.pastElections.presidential2020.tot;
            const partisanship = (dem - rep) / tot - environment; 
            const uniqueness = new NormalDistribution(partisanship, 0);
            const contest = new PresidentialContest(contestName as PresidentialContestName, contestData.electors.length, uniqueness);
            contests[contestName as PresidentialContestName] = contest;
        }

        return contests as {[name in PresidentialContestName]: PresidentialContest};
    }

    /**
     * Returns the distributions of all the states and generic ballot
     */
    compute(config: PresidentialRaceConfig): PresidentialRaceOutput{

        const genericBallotDist = this.genericBallot.compute()! as NormalDistribution;

        const contests: {[kind in PresidentialContestName]?: Distribution} = {};
        
        for (const contestName in this.contests){

            const contest = this.contests[contestName as PresidentialContestName];

            //COMPUTE THE DISTRIBUTION ONLY WITH THE GENERIC BALLOT SHIFTED BY THE CONTEST UNIQUENESS
            const genericBallotEnvironment = genericBallotDist.getShifted(contest.uniqueness as NormalDistribution);
            const contestDist = contest.compute();

            let combinedDist = genericBallotEnvironment;
            if (contestDist != null){
                combinedDist = genericBallotEnvironment.getShifted(contestDist as NormalDistribution, [1 - config.contestElasticity, config.contestElasticity]);
            }

            contests[contestName as PresidentialContestName] = combinedDist;
        }

        return {
            genericBallot: this.genericBallot.computeSeparate()!,
            contests: contests as {[kind in PresidentialContestName]: Distribution}
        }
    }

    /**
     * Adds polls to the presidential race
     */
    addPolls(polls: Poll[]): void{
        this.genericBallot.polls.push(...polls.filter((poll)=>poll.contest === ""));

        for (const contestName in this.contests){
            this.contests[contestName as PresidentialContestName].polls.push(...polls.filter((poll)=>poll.contest === contestName));
        }

    }
}



class PresidentialContest extends Contest{

    public contestName: PresidentialContestName;

    public electoralVotes: number;

    constructor(contestName: PresidentialContestName, electoralVotes: number, partisanship: Distribution){
        super(partisanship);
        this.contestName = contestName;
        this.electoralVotes = electoralVotes;
    }
}