/**
 * Generic utils for project
 */

import { PresidentialContestName } from "../contests/presidentialRace";
import { Distribution } from "../distributions/distribution";
import { SeparateDistribution } from "../distributions/separateDistribution";

import jsonData from "../../data/data.json";

export const stateNames = ["Alabama" , "Alaska" , "Arizona" , "Arkansas" , "California" , "Colorado" ,
"Connecticut" , "Delaware" , "Florida" , "Georgia" , "Hawaii" , "Idaho" , "Illinois" , "Indiana" ,
"Iowa" , "Kansas" , "Kentucky" , "Louisiana" , "Maine" , "Maryland" , "Massachusetts" , "Michigan" ,
"Minnesota" , "Mississippi" , "Missouri" , "Montana" , "Nebraska" , "Nevada" , "New Hampshire" ,
"New Jersey" , "New Mexico" , "New York" , "North Carolina" , "North Dakota" , "Ohio" , "Oklahoma" ,
"Oregon" , "Pennsylvania" , "Rhode Island" , "South Carolina" , "South Dakota" , "Tennessee" , "Texas" ,
"Utah" , "Vermont" , "Virginia" , "Washington" , "West Virginia" , "Wisconsin" , "Wyoming"] as const;

export type StateName = typeof stateNames[number];


/** States in which a bar can be */
const constestColors = ["SafeRep", "LikelyRep", "LeanRep", "Neutral", "LeanDem", "LikelyDem", "SafeDem"] as const;
export type ContestColor = "SafeRep" | "LikelyRep" | "LeanRep" | "Neutral" | "LeanDem" | "LikelyDem" | "SafeDem";




const DEFAULT_THRESHOLDS: {[kind in ContestColor]: number} = {
    SafeRep: -.15, LikelyRep: -.05, LeanRep: 0.0, Neutral: -0.0001, LeanDem: .05, LikelyDem: .15, SafeDem: 1,
};

/**
 * Gets the color of a distribution (from a contest)
 */
export const getDistributionColor = (distribution: Distribution, thresholds: {[kind in ContestColor]: number} = DEFAULT_THRESHOLDS): ContestColor =>{
    for (const constestColor of constestColors){
        if (distribution.mean < thresholds[constestColor]){
            return constestColor;
        }
    }

    throw Error("Could not get the color of the distribution");
}

/**
 * Gets the number of electoral votes that fall in each bar state
 * @param states 
 * @param thresholds 
 * @returns 
 */
export const getElectoralCollegeCounts = (states: {[kind in PresidentialContestName]: Distribution}, thresholds: {[kind in ContestColor]: number} = DEFAULT_THRESHOLDS): {[kind in ContestColor]?: number}=>{

    const count: {[kind in ContestColor]?: number} = {
        SafeDem: 0, LikelyDem: 0, LeanDem: 0, LeanRep: 0, LikelyRep: 0, SafeRep: 0
    };


    for (const stateName in states){
        const color = getDistributionColor(states[stateName as PresidentialContestName], thresholds);
        console.log(stateName + "  " + jsonData[stateName as PresidentialContestName].electors.length);
        count[color]! += jsonData[stateName as PresidentialContestName].electors.length;
    }


    return count;


}


export const getRawVoteData = (distribution: SeparateDistribution): {SafeDem: number, Neutral: number, SafeRep: number}=>{

    return {
        SafeDem: distribution.dem.mean,
        Neutral: 1 - distribution.dem.mean - distribution.rep.mean,
        SafeRep: distribution.rep.mean
    };

}