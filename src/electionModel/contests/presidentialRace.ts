import {Distribution} from "../distributions/distribution";
import {SeparateDistribution} from "../distributions/separateDistribution";
import { NormalDistribution } from "../distributions/normalDistribution";

import {Contest, ContestComputeConfig} from "../contests/contest";

import { stateNames, StateName } from "../utils/utils";

import jsonData from "../../data/data.json";
import { Poll } from "../polling/poll";
import { DiscreteDistribution } from "../distributions/discreteDistribution";


export const presidentialContestNames = [... stateNames, "Maine 1st" , "Maine 2nd" , "Nebraska 1st" , "Nebraska 2nd" , "Nebraska 3rd" ,
"District of Columbia"] as const;

export type PresidentialContestName = typeof presidentialContestNames[number];

////COMPUTATION CONFIGS
/**
 * Configs for the computation of a presidential race
 */
export interface PresidentialRaceConfig{

    /**
     * Factor by which the contest is independent from the generic ballot. A 1 it is completely separate, a 0 it is completely tied
     */
    contestElasticity: number,

    /** Compute config for generic ballot */
    genericBallotContestConfig: ContestComputeConfig,

    /** Compute config for contests */
    constestConfig: ContestComputeConfig,

    /**
     * Standard deviation added if we do not have a polls distribution
     */
    noPollingUncertainty: number,
};

/**
 * The output of the presidential race computation
 */
export type PresidentialRaceOutput = {
    genericBallot: Distribution,

    /**
     * The combined distribution from the generic ballot inference and the state's own polls
     */
    contestsWhole: {[kind in PresidentialContestName]: Distribution}, 

    /**
     * The distribution from the states' own polling
     */
    contestsOwn: {[kind in PresidentialContestName]: Distribution | null}, 
};

////SIMULATION CONFIGS
export interface PresidentialRaceSimulationConfig{

    /** Number of iterations to run the simulation */
    nIterations: number,

    /** nPoints in DiscreteDistribution calculation */
    nDiscretePoints: number,

}

export interface PresidentialRaceSimulationOutput{

    /** Percentage of victories */
    results: {dem: number, rep: number, tie: number};

    /**
     * Distribution of the popular vote (difference)
     */
    genericBallot: DiscreteDistribution,

    /**
     * Distributions of the contests' votes
     */
    contests: {[kind in PresidentialContestName]: DiscreteDistribution},

    /**
     * "Map" of number of electors that the democrats get
     */
    electoralVotes: number[],

    /**
     * The contest that gave each victor the contest (meaning they could've afforeded to lose all less leaning towards them states)
     * (always in percentages)
     */
    tipoffContests: {dem: {[kind in PresidentialContestName]?: number}, rep: {[kind in PresidentialContestName]?: number}};
    
}

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
            const uniqueness = new NormalDistribution(partisanship, 0.01);
            const contest = new PresidentialContest(contestName as PresidentialContestName, contestData.electors.length, uniqueness);
            contests[contestName as PresidentialContestName] = contest;
        }

        return contests as {[name in PresidentialContestName]: PresidentialContest};
    }

    /**
     * Adds polls to the presidential race
     */
     addPolls(polls: Poll[]): void{
        this.genericBallot.polls.push(...polls.filter((poll)=>poll.contest === ""));

        for (const contestName in this.contests){
            this.contests[contestName as PresidentialContestName].polls.push(...polls.filter((poll)=>poll.contest === contestName));
            if (this.contests[contestName as PresidentialContestName].polls.length > 0){
                console.log(contestName, this.contests[contestName as PresidentialContestName].compute()?.mean);
            }
        }
    }

    static defaultComputationConfig: PresidentialRaceConfig = {
        contestElasticity: .4,
        genericBallotContestConfig: Contest.defaultContestComputeConfig,
        constestConfig: Contest.defaultContestComputeConfig,
        noPollingUncertainty: .015,
    }

    /**
     * Returns the distributions of all the states and generic ballot
     */
    compute(config: PresidentialRaceConfig = PresidentialRace.defaultComputationConfig): PresidentialRaceOutput{

        const genericBallotDist = this.genericBallot.compute()! as NormalDistribution;

        const contestsWhole: {[kind in PresidentialContestName]?: Distribution} = {};
        const contestsOwn: {[kind in PresidentialContestName]?: Distribution | null} = {};
        
        for (const contestName in this.contests){

            const contest = this.contests[contestName as PresidentialContestName];

            //COMPUTE THE DISTRIBUTION ONLY WITH THE GENERIC BALLOT SHIFTED BY THE CONTEST UNIQUENESS
            const genericBallotEnvironment = genericBallotDist.getShifted(contest.uniqueness as NormalDistribution);
            var contestOwnDist = contest.compute();

            contestsOwn[contestName as PresidentialContestName] = contestOwnDist;

            if (contestOwnDist == null){
                contestOwnDist = new NormalDistribution(0, config.noPollingUncertainty);
            }

            const combinedDist = genericBallotEnvironment.getShifted(contestOwnDist as NormalDistribution, [1 - config.contestElasticity, config.contestElasticity]);
            
            if (false){ //IN THE FUTURE, IF COMBINE DISTS WITH FLATHEAD
                //const genericBallotEnvironmentDiscrete = DiscreteDistribution.fromNormal(genericBallotEnvironment);
                //const contestOwnDistDiscrete = DiscreteDistribution.fromNormal(contestOwnDist as NormalDistribution);

                //combinedDist = DiscreteDistribution.combineDiscretes([genericBallotEnvironmentDiscrete, contestOwnDistDiscrete], [1 - config.contestElasticity, config.contestElasticity]);
            }

            contestsWhole[contestName as PresidentialContestName] = combinedDist;
        }

        return {
            genericBallot: genericBallotDist,
            contestsWhole: contestsWhole as {[kind in PresidentialContestName]: Distribution},
            contestsOwn: contestsOwn as {[kind in PresidentialContestName]: Distribution | null},
        }
    }

    static defaultSimulationConfig: PresidentialRaceSimulationConfig = {
        nIterations: 10000,
        nDiscretePoints: 200,
    }

    /**
     * From distributions already precomputed, simulates the outcome of the presidential race a bunch of times
     */
    simulate(config: PresidentialRaceSimulationConfig = PresidentialRace.defaultSimulationConfig, computation: PresidentialRaceOutput | null = null, computationConfig: PresidentialRaceConfig=PresidentialRace.defaultComputationConfig): PresidentialRaceSimulationOutput{

        if (computation == null){
            computation = this.compute(computationConfig);
        }


        const genericBallotDist = computation.genericBallot as NormalDistribution;


        const results = {dem: 0, rep: 0, tie: 0};
        const tipoffs: {dem: {[kind in PresidentialContestName]?: number}, rep: {[kind in PresidentialContestName]?: number}} = {dem: {}, rep: {}};

        const genericBallotResults = [];

        const contestResults: {[name in PresidentialContestName]?: number[]} = {};
        for (const contestName in this.contests){contestResults[contestName as PresidentialContestName] = [];}
        
        const electors: number[] = new Array(539).fill(0);
        

        for (let i=0; i<config.nIterations; i++){

            const environmentFavorability = (new NormalDistribution(0, 1)).getRandom();
            const genericBallotResult = genericBallotDist.mean + environmentFavorability * genericBallotDist.std;
            genericBallotResults.push(genericBallotResult);

            var nElectors = 0;

            const contestOrder: {name: PresidentialContestName, result: number}[] = [];

            for (const contestName in this.contests){
                const contest = this.contests[contestName as PresidentialContestName];

                const contestResultFromGeneric = genericBallotResult + contest.uniqueness.getRandom();
                
                var contestOwnResult: number;

                if (computation.contestsOwn[contestName as PresidentialContestName] == null){
                    contestOwnResult = contestResultFromGeneric + (new NormalDistribution(0,computationConfig.noPollingUncertainty)).getRandom();
                }else{
                    contestOwnResult = computation.contestsOwn[contestName as PresidentialContestName]!.getRandom();
                }
                
                const contestResult = contestOwnResult * computationConfig.contestElasticity + contestResultFromGeneric * (1 - computationConfig.contestElasticity);

                //ADD THE RESULT TO RESULTS
                contestResults[contestName as PresidentialContestName]!.push(contestResult);
                contestOrder.push({name: contestName as PresidentialContestName, result: contestResult});
                
                //ADD ELECTORS IF DEMS WON IT
                if (contestResult > 0){
                    nElectors += contest.electoralVotes;
                }
            }

            electors[nElectors] += 1 / config.nIterations;

            //ASSIGN A VICTOR (+ TIPOFF STATES)
            if (nElectors > 269){
                //DEM VICTORY
                results.dem += 1/config.nIterations;

                contestOrder.sort((a,b)=>a.result - b.result);

                var cumElectors = 0;
                for (const contestOrdered of contestOrder){
                    cumElectors += this.contests[contestOrdered.name].electoralVotes;
                    if (cumElectors > 269){
                        if (!(contestOrdered.name in tipoffs.dem)){tipoffs.dem[contestOrdered.name] = 0.0;}
                        tipoffs.dem[contestOrdered.name]! += 1/config.nIterations;
                        break;
                    }
                }
            }
            else if (nElectors < 269){
                results.rep += 1/config.nIterations;

                contestOrder.sort((a,b)=>b.result - a.result);

                var cumElectors = 0;
                for (const contestOrdered of contestOrder){
                    cumElectors += this.contests[contestOrdered.name].electoralVotes;
                    if (cumElectors > 269){
                        if (!(contestOrdered.name in tipoffs.rep)){tipoffs.rep[contestOrdered.name] = 0.0;}
                        tipoffs.rep[contestOrdered.name]! += 1/config.nIterations;
                        break;
                    }
                }
            }

            else{results.tie += 1/config.nIterations;}
        }

        const contestDists: {[s in PresidentialContestName]?: DiscreteDistribution} = {};
        for (const contestName in contestResults){
            contestDists[contestName as PresidentialContestName] = DiscreteDistribution.fromArray(contestResults[contestName as PresidentialContestName]!, config.nDiscretePoints);
        }
        
        const output: PresidentialRaceSimulationOutput = {
            results: results,
            genericBallot: DiscreteDistribution.fromArray(genericBallotResults, config.nDiscretePoints),
            contests: contestDists as {[s in PresidentialContestName]: DiscreteDistribution},
            electoralVotes: electors,
            tipoffContests: tipoffs,
        };

        return output;
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