
export const pollsterNames = ["FOX News", "Economist/YouGov","NY Times/Siena"] as const;

export type PollsterName = typeof pollsterNames[number];

/**
 * A pollster
 * TODO: a pollster should have a measure of their bias based on past polling errors,
 * differences to other pollsters....
 */
export class Pollster{

    public name: PollsterName;

    constructor(name: PollsterName){
        this.name = name;

    }
}