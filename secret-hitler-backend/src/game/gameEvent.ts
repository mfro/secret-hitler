import { Player } from './player'
import { Faction } from './faction';

export interface GameEvent<TArgs> {
    readonly name: string;
    readonly args: TArgs;

    readonly alert: boolean;
    readonly log: boolean;
}

function make<TName>(name: TName, alert: boolean, log: boolean) {
    return {
        define<TType, TArgs>(): { new(args: TArgs): TType } {
            return <any>class {
                readonly name: TName;
                readonly args: TArgs;

                readonly alert: boolean;
                readonly log: boolean;

                constructor(args: TArgs) {
                    this.name = name;
                    this.alert = alert;
                    this.log = log;
                }

                toJSON() {
                    return {
                        name: this.name,
                        args: this.args,
                    };
                }
            };
        },
    };
}

export namespace GameEvent {
    const kRoleAssignment = 'role-assignment';
    interface RoleAssignmentArgs { }

    const kTurnCompleted = 'turn-completed';
    interface TurnCompletedArgs {
        turn: number;
    }

    const kNomination = 'nomination';
    interface NominationArgs {
        president: Player;
        chancellor: Player;
    }

    const kVote = 'vote';
    interface VoteArgs {
        pass: boolean;
        president: Player,
        chancellor: Player;
        votes: {
            ja: Player[];
            nein: Player[];
        };
    };

    const kPolicy = 'policy';
    interface PolicyArgs {
        policy: Faction;
        government?: {
            president: Player,
            chancellor: Player;
        }
    }

    const kVeto = 'veto';
    interface VetoArgs {
        agree: boolean;
        president: Player;
        chancellor: Player;
    }

    const kPreviewDeck = 'preview-deck';
    interface PreviewDeckArgs {
        president: Player;
    }

    const kInvestigation = 'investigation';
    interface InvestigationArgs {
        president: Player;
        target: Player
    }

    const kSpecialElection = 'special-election';
    interface SpecialElectionArgs {
        president: Player;
        target: Player
    }

    const kAssassination = 'assassination';
    interface AssassinationArgs {
        president: Player;
        target: Player
    }

    export class RoleAssignment implements GameEvent<RoleAssignmentArgs> {
        readonly name = kRoleAssignment;
        readonly alert = true;
        readonly log = false;

        constructor(readonly args: RoleAssignmentArgs) { }
    }

    export class TurnCompleted implements GameEvent<TurnCompletedArgs> {
        readonly name = kTurnCompleted;
        readonly alert = false;
        readonly log = true;

        constructor(readonly args: TurnCompletedArgs) { }
    }

    export class Nomination implements GameEvent<NominationArgs> {
        readonly name = kNomination;
        readonly alert = false;
        readonly log = true;

        constructor(readonly args: NominationArgs) { }
    }

    export class Vote implements GameEvent<VoteArgs> {
        readonly name = kVote;
        readonly alert = true;
        readonly log = true;

        constructor(readonly args: VoteArgs) { }
    }

    export class Policy implements GameEvent<PolicyArgs> {
        readonly name = kPolicy;
        readonly alert = true;
        readonly log = true;

        constructor(readonly args: PolicyArgs) { }
    }

    export class Veto implements GameEvent<VetoArgs> {
        readonly name = kVeto;
        readonly alert = true;
        readonly log = true;

        constructor(readonly args: VetoArgs) { }
    }

    export class PreviewDeck implements GameEvent<PreviewDeckArgs> {
        readonly name = kPreviewDeck;
        readonly alert = false;
        readonly log = true;

        constructor(readonly args: PreviewDeckArgs) { }
    }

    export class Investigation implements GameEvent<InvestigationArgs> {
        readonly name = kInvestigation;
        readonly alert = true;
        readonly log = true;

        constructor(readonly args: InvestigationArgs) { }
    }

    export class SpecialElection implements GameEvent<SpecialElectionArgs> {
        readonly name = kSpecialElection;
        readonly alert = true;
        readonly log = true;

        constructor(readonly args: SpecialElectionArgs) { }
    }

    export class Assassination implements GameEvent<AssassinationArgs> {
        readonly name = kAssassination;
        readonly alert = true;
        readonly log = true;

        constructor(readonly args: AssassinationArgs) { }
    }

    // type RoleAssignment = GameEvent<typeof kRoleAssignment, RoleAssignmentArgs>;
    // export const RoleAssignment = make(kRoleAssignment, true, false)
    //     .define<RoleAssignment, RoleAssignmentArgs>();

    // type Nomination = GameEvent<typeof kNomination, NominationArgs>;
    // export const Nomination = make(kNomination, false, true)
    //     .define<Nomination, NominationArgs>();

    // type Vote = GameEvent<typeof kVote, VoteArgs>;
    // export const Vote = make(kVote, true, true)
    //     .define<Vote, VoteArgs>();

    // type Policy = GameEvent<typeof kPolicy, PolicyArgs>;
    // export const Policy = make(kPolicy, true, true)
    //     .define<Policy, PolicyArgs>();

    // type Veto = GameEvent<typeof kVeto, VetoArgs>;
    // export const Veto = make(kVeto, true, true)
    //     .define<Veto, VetoArgs>();

    // type Investigation = GameEvent<typeof kInvestigation, InvestigationArgs>;
    // export const Investigation = make(kInvestigation, true, true)
    //     .define<Investigation, InvestigationArgs>();

    // type SpecialElection = GameEvent<typeof kSpecialElection, VetoArgs>;
    // export const SpecialElection = make(kSpecialElection, true, true)
    //     .define<SpecialElection, SpecialElectionArgs>();

    // type Assassination = GameEvent<typeof kAssassination, VetoArgs>;
    // export const Assassination = make(kAssassination, true, true)
    //     .define<Assassination, AssassinationArgs>();

    export type Any = RoleAssignment
        | TurnCompleted
        | Nomination | Vote | Policy | Veto
        | PreviewDeck | Investigation | SpecialElection | Assassination;
}
