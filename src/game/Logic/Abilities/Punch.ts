import { Ability } from "./Ability";

export class Punch extends Ability {
    public name: string = "Punch";
    public description: string = "Fist + robots = pain, but for whom?";
    public damageString: string = "1d4 + self-damage, idiot";
    public abilityIconKey: string = "punch_icon";
}
