import { Distribution } from "./distribution";

/**
 * Class to compute separate distributions, ie, the democrat and republican
 * percentages separately
 */
export class SeparateDistribution{

    /** The dem distribution */
    public dem: Distribution;

    /** The rep distribution */
    public rep: Distribution;

    /** 
     * How "tied" the distributions are. 0 means they're independent, 1 that the lowest
     * case for dems implies the lowest case for reps
     */
    public covariance: number;


    constructor(dem: Distribution, rep: Distribution, covariance: number = 0.0){
        this.dem = dem;
        this.rep = rep;
        this.covariance = covariance;
    }    
    
}