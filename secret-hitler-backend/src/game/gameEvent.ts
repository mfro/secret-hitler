import { Player } from './player'
import { Faction } from './faction';

export abstract class GameEvent<TArgs> {
    abstract readonly name: string;
    abstract readonly args: TArgs;

    abstract readonly alert: boolean;
    abstract readonly log: boolean;

    toJSON() {
        return {
            name: this.name,
            args: this.args,
        };
    }
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

    export class RoleAssignment extends GameEvent<RoleAssignmentArgs> {
        readonly name = kRoleAssignment;
        readonly alert = true;
        readonly log = false;

        constructor(readonly args: RoleAssignmentArgs) { super(); }
    }

    export class TurnCompleted extends GameEvent<TurnCompletedArgs> {
        readonly name = kTurnCompleted;
        readonly alert = false;
        readonly log = true;

        constructor(readonly args: TurnCompletedArgs) { super(); }
    }

    export class Nomination extends GameEvent<NominationArgs> {
        readonly name = kNomination;
        readonly alert = false;
        readonly log = true;

        constructor(readonly args: NominationArgs) { super(); }
    }

    export class Vote extends GameEvent<VoteArgs> {
        readonly name = kVote;
        readonly alert = true;
        readonly log = true;

        constructor(readonly args: VoteArgs) { super(); }
    }

    export class Policy extends GameEvent<PolicyArgs> {
        readonly name = kPolicy;
        readonly alert = true;
        readonly log = true;

        constructor(readonly args: PolicyArgs) { super(); }
    }

    export class Veto extends GameEvent<VetoArgs> {
        readonly name = kVeto;
        readonly alert = true;
        readonly log = true;

        constructor(readonly args: VetoArgs) { super(); }
    }

    export class PreviewDeck extends GameEvent<PreviewDeckArgs> {
        readonly name = kPreviewDeck;
        readonly alert = false;
        readonly log = true;

        constructor(readonly args: PreviewDeckArgs) { super();}
    }

    export class Investigation extends GameEvent<InvestigationArgs> {
        readonly name = kInvestigation;
        readonly alert = true;
        readonly log = true;

        constructor(readonly args: InvestigationArgs) { super(); }
    }

    export class SpecialElection extends GameEvent<SpecialElectionArgs> {
        readonly name = kSpecialElection;
        readonly alert = true;
        readonly log = true;

        constructor(readonly args: SpecialElectionArgs) { super(); }
    }

    export class Assassination extends GameEvent<AssassinationArgs> {
        readonly name = kAssassination;
        readonly alert = true;
        readonly log = true;

        constructor(readonly args: AssassinationArgs) { super(); }
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
