
import {Distribution} from "../distributions/distribution";
import {NormalDistribution} from "../distributions/normalDistribution";
import { SeparateDistribution } from "../distributions/separateDistribution";
import { Poll, PollingQualityConfig, getPollingQuality } from "../polling/poll";


/**
 * Instructions to compute the distribution of a contest
 */
export type ContestComputeConfig = {
    
    /**
     * Max days old that a poll can be
     */
    pollWindow: number,

    pollingQualityConfig: PollingQualityConfig,

    /** The amount of deviation to add when computing based of polling quality */
    pollingQualityFactor: number,

}

export class Contest{

    /**
     * Symbolizes the difference between the contest's sentiment and the environment "above"
     * I.e. in a presidential contest, this symbolizes how much right or left the contest is from the
     * national environment
     */
    public uniqueness: Distribution;

    public polls: Poll[];

    constructor(uniqueness: Distribution = new NormalDistribution(0,0)){
        this.uniqueness = uniqueness;

        this.polls = [];
    }


    static defaultContestComputeConfig: ContestComputeConfig = {
        pollWindow: 16,
        pollingQualityConfig: {baselineNPolls: 6},
        pollingQualityFactor: .03,
    }

    /**
     * Returns the computed distribution or null if the distribution could not be computed (lack of polls, for example)
     */
    compute(config: ContestComputeConfig = Contest.defaultContestComputeConfig): Distribution | null{

        const validPolls = this.polls.filter((poll)=>(new Date()).getTime() - poll.date.getTime() < config.pollWindow * 24 * 3600 * 1000);
        if (validPolls.length == 0){return null;}

        const diffs = validPolls.map((poll)=>poll.generalResult.dem - poll.generalResult.rep);

        const normal = NormalDistribution.fromArray(diffs);
        const pollingQuality = getPollingQuality(validPolls, config.pollingQualityConfig);
        console.log("gotten polling quality " + pollingQuality);
        normal.addStd((1-pollingQuality) * config.pollingQualityFactor);

        return normal;
    }

    computeSeparate(config: ContestComputeConfig = Contest.defaultContestComputeConfig): SeparateDistribution | null{

        const validPolls = this.polls.filter((poll)=>(new Date()).getTime() - poll.date.getTime() < config.pollWindow * 24 * 3600 * 1000);
        if (validPolls.length == 0){return null;}

        const dems = validPolls.map((poll)=>poll.generalResult.dem);
        const reps = validPolls.map((poll)=>poll.generalResult.rep);

        const dem = NormalDistribution.fromArray(dems);
        const rep = NormalDistribution.fromArray(reps);

        return new SeparateDistribution(dem, rep);
    }

}