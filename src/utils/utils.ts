import { ContestColor } from "../electionModel/utils/utils";


/**
 * Extends array.map to an object
 */
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


/**
 * Returns a rolling average of the data. Will populate all x values between min and max
 */
export const getRollingAverage = (data: {x: number, y: number}[], radius: number, step: number = 1.0): {x: number, y: number}[]=>{

    data.sort((a,b)=>a.x - b.x);

    const results: {x: number, y:number}[] = [];

    var currentIndex = 0;
    for (let currentVal = data[0].x; currentVal <= data.at(-1)!.x; currentVal += step){

        while (data[currentIndex].x < currentVal){currentIndex += 1;}

        var subtotal = 0.0;
        var subtotalWeight = 0.0;

        //LOOK AT ABOVE VALUES
        for (let i=currentIndex; i<data.length; i++){
            const distance = Math.abs(data[i].x - currentVal);
            
            if (distance < radius){
                const weight = 1- distance / radius;
                subtotal += data[i].y * weight;
                subtotalWeight += weight;
            }else{
                break;
            }
        }

        //LOOK AT BELOW VALUES
        for (let i=currentIndex - 1; i>=0; i--){
            const distance = Math.abs(data[i].x - currentVal);
            
            if (distance < radius){
                const weight = 1- Math.pow(distance / radius, 1.618);
                subtotal += data[i].y * weight;
                subtotalWeight += weight;
            }else{
                break;
            }
        }

        const result = {x: currentVal,y: subtotalWeight > 0.0 ? subtotal / subtotalWeight : 0.0};
        results.push(result);
    }


    return results;
}