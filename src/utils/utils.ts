import { ContestColor } from "../electionModel/utils/utils";


export const mapObject = <K extends string, T,V>(object: {[k in K]: T}, func: (t: T)=>V): {[k in K]: V}=>{

    const initialValue: {[k in string]: V} = {};

    return Object.keys(object).reduce((result: {[k in string]: V}, key: string)=>{
        result[key] = func(object[key as K]);
        return result;
    }, initialValue) as {[k in K]:V};
}


export const LITERAL_COLORS: {[kind in ContestColor]: string} = {
    SafeRep: "#ff0000",
    LikelyRep: "#ff5865",
    LeanRep: "#ff8b98",
    Neutral: "#c9c09b",
    LeanDem: "#8aafff",
    LikelyDem: "#577ccc",
    SafeDem: "#0000ff"
};