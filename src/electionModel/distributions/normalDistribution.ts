import {Distribution} from "./distribution";


/**
 * A normal distribution
 */
export class NormalDistribution extends Distribution{

    public std: number;

    constructor(mean: number = 0.0, std: number = 0.0){
        super(mean);
        
        this.std = std;
    }

    static fromArray(array: number[]): NormalDistribution{
        //COMPUTE MEAN
        var subtotal = 0.0;
        for (const element of array){
            subtotal += element;
        }

        const mean = subtotal / array.length;

        var diffsSquaredSubtotal = 0.0;
        for (const element of array){
            diffsSquaredSubtotal += (element - mean)**2;
        }

        return new NormalDistribution(mean, Math.sqrt(diffsSquaredSubtotal / array.length));
    }


    getProbability(cutoff: number = 0.0): number {
        
        var x = (cutoff - this.mean) / (this.std * Math.sqrt(2));

        // save the sign of x
        var sign = (x >= 0) ? 1 : -1;
        x = Math.abs(x);
    
        // constants
        var a1 =  0.254829592;
        var a2 = -0.284496736;
        var a3 =  1.421413741;
        var a4 = -1.453152027;
        var a5 =  1.061405429;
        var p  =  0.3275911;
    
        // A&S formula 7.1.26
        var t = 1.0/(1.0 + p*x);
        var y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
        var erf = sign * y; // erf(-x) = -erf(x);
    
        var res = .5 * (1 + erf);
    
        return res; 
    }

    
}