import { NormalDistribution } from "./normalDistribution";

/**
 * The abstract probability distribution
 */
export abstract class Distribution{

    public mean: number;

    constructor(mean: number){
        this.mean = mean;
    }

    abstract getProbability(cutoff: number) : number;
}
