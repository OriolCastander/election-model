import {Distribution} from "../distributions/distribution";
import {SeparateDistribution} from "../distributions/separateDistribution";
import { NormalDistribution } from "../distributions/normalDistribution";

import {Contest} from "../contests/contest";

import { stateNames } from "../utils/utils";


export const presidentialContestNames = [... stateNames, "Maine 1st" , "Maine 2nd" , "Nebraska 1st" , "Nebraska 2nd" , "Nebraska 3rd" ,
"District of Columbia"] as const;

export type PresidentialContestName = typeof presidentialContestNames[number];


export type PresidentialRaceOutput = {
    genericBallot: SeparateDistribution,

    states: {[kind in PresidentialContestName]: Distribution}, 
};


/**
 * The presidential race object
 */
export class PresidentialRace{

    public genericBallot: Contest;

    constructor(genericBallot: Contest){

        this.genericBallot = genericBallot;
    }


    mockCompute(): PresidentialRaceOutput{

        console.log("mock computing");
        
        const states: {[kind in PresidentialContestName]?: Distribution} = {};

        for (const presidentialConstestName of presidentialContestNames){
            const mockDist = new NormalDistribution((Math.random() - .5) * .5, Math.random() * .03 + .01);
            states[presidentialConstestName] = mockDist;
        }

        return {
            genericBallot: this.genericBallot.mockComputeSeparate(),

            states: states as {[kind in PresidentialContestName]: Distribution},
        }
    }
}