function add<TKey, TValue>(map: Map<TKey, TValue[]>, key: TKey, value: TValue) {
    let list = map.get(key);
    if (list == null)
        map.set(key, list = []);

    list.push(value);
}

interface TransitionHandler<TContext> {
    (context: TContext): void
}

interface TransitionDefinition<TState, TContext> {
    from: TState;
    to: TState;
    action: TransitionHandler<TContext>
}

export function StateMachine2<TState, TContext>() {
    interface UpdateHandler {
        (context: TContext): TState | void;
    }

    class StateMachine {
        private updates = new Map<TState, UpdateHandler>();

        do_update(context: TContext, state: TState): TState {
            let update = this.updates.get(state);
            if (!update)
                throw new Error(`Stuck on state ${state}`);

            let next = update(context);
            if (!next)
                return state;

            return this.do_update(context, next);
        }

        update(state: TState, handler: UpdateHandler) {
            if (this.updates.get(state))
                throw new Error(`Overwriting state: ${name}`);

            this.updates.set(state, handler);
        }
    }

    return new StateMachine();
}

// export function StateMachine3<TState, TContext>() {
//     return {
//         create<TTransitions extends { [name: string]: TransitionDefinition<TState, TContext> }>(transitions: TTransitions) {
//             type TransitionName = keyof TTransitions;

//             interface UpdateHandler {
//                 (context: TContext): TransitionName | void
//             }

//             interface EnterHandler {
//                 (context: TContext): void;
//             }

//             interface ExitHandler {
//                 (context: TContext): void;
//             }

//             interface Transition extends TransitionDefinition<TState, TContext> {
//                 name: TransitionName;
//             }

//             class StateMachine {
//                 readonly transitions: {[k in keyof TTransitions]: k };

//                 private lookup = new Map<TransitionName, Transition>();
//                 private updates = new Map<TState, UpdateHandler>();
//                 private enters = new Map<TState, EnterHandler[]>();
//                 private exits = new Map<TState, ExitHandler[]>();

//                 constructor(transitions: TTransitions) {
//                     for (let name in transitions) {
//                         let t = transitions[name];

//                         this.lookup.set(name, {
//                             name: name,
//                             from: t.from,
//                             to: t.to,
//                             action: t.action,
//                         });
//                     }
//                 }

//                 do_update(ctx: TContext, state: TState): TState {
//                     let update = this.updates.get(state);
//                     if (update == null)
//                         throw new Error(`Stuck on ${state}`);

//                     let name = update(ctx) as TransitionName | undefined;
//                     if (name == undefined)
//                         return state;

//                     let t = this.lookup.get(name)!;

//                     console.log(`Doing transition ${t.name} [${t.from} => ${t.to}]`);

//                     t.action(ctx);

//                     let exits = this.exits.get(t.from);
//                     for (let exit of exits || [])
//                         exit(ctx);

//                     let enters = this.enters.get(t.to);
//                     for (let enter of enters || [])
//                         enter(ctx);

//                     return this.do_update(ctx, t.to);
//                 }

//                 update(state: TState, action: UpdateHandler) {
//                     if (this.updates.get(state))
//                         throw new Error(`Overwriting state: ${name}`);

//                     this.updates.set(state, action);
//                 }

//                 enter(state: TState, action: EnterHandler) {
//                     add(this.enters, state, action);
//                 }

//                 exit(state: TState, action: EnterHandler) {
//                     add(this.exits, state, action);
//                 }
//             }

//             return new StateMachine(transitions);
//         }
//     }
// }

// export function StateMachine2<TState, TContext>() {
//     interface CompleteAction {
//         (context: TContext): TState;
//     }

//     interface OutputAction<TOut> {
//         (context: TContext): TOut;
//     }

//     interface InputOutputAction<TIn, TOut> {
//         (context: TContext, input: TIn): TOut;
//     }

//     interface InputAction<TIn> {
//         (context: TContext, input: TIn): TState;
//     }

//     interface UpdateHandler {
//         (context: TContext): TState | void;
//     }

//     // interface Definition {
//     //     enter?(this: TContext): void;
//     //     update(this: TContext): TState | void;
//     //     exit?(this: TContext): void;
//     // }

//     class StateMachine {
//         private updates = new Map<TState, UpdateHandler>();

//         update(state: TState, handler: UpdateHandler) {
//             if (this.updates.get(state))
//                 throw new Error(`Overwriting state: ${name}`);

//             this.updates.set(state, handler);
//         }

//         compose<T1>(a: OutputAction<T1>, b: InputAction<T1>): CompleteAction
//         compose<T1, T2>(a: OutputAction<T1>, b: InputOutputAction<T1, T2>, c: InputAction<T2>): CompleteAction
//         compose(...args: Function[]): CompleteAction {
//             return function (ctx: TContext) {
//                 let value = args[0](ctx);

//                 for (let i = 1; i < args.length - 1; i++) {
//                     value = args[i](ctx, value);
//                 }

//                 return args[args.length - 1](ctx, value);
//             };
//         }
//     }

//     return new StateMachine();
// }

export function StateMachine<TState, TContext, TTransitions extends string>(
    transitions: { [key: string]: { from: TState, to: TState | TState[] } }
) {
    interface UpdateHandler {
        (this: TContext): TTransitions | void;
    }

    interface PartialHandler {
        (this: TContext, t: Transition): void;
    }

    interface CompleteHandler {
        (this: TContext): void;
    }

    type Transition = { name: TTransitions, from: TState, to: TState[] };

    class StateMachine {
        private lookup = new Map<TTransitions, Transition>();

        private updates = new Map<TState, UpdateHandler>();
        private explicits = new Map<TTransitions, CompleteHandler>();
        private froms = new Map<TState, PartialHandler[]>();
        private tos = new Map<TState, CompleteHandler[]>();

        constructor(transitions: { [key: string]: { from: TState, to: TState | TState[] } }) {
            for (let name in transitions) {
                let t = transitions[name];

                let to = t.to;
                if (!(to instanceof Array))
                    to = [to];

                this.lookup.set(<TTransitions>name, {
                    name: <TTransitions>name,
                    from: t.from,
                    to: to,
                });
            }
        }

        do_update(ctx: TContext, state: TState): TState {
            let update = this.updates.get(state);
            if (update == null)
                throw new Error(`Stuck on ${state}`);

            let name = update.bind(ctx)() as TTransitions | undefined;
            if (name == undefined)
                return state;

            let t = this.lookup.get(name)!;

            console.log(`Doing transition ${t.name} [${t.from} => ${t.to}]`);

            state = this.do_transition(ctx, t);

            if (t.to.find(p => p == state) == null)
                throw new Error(`Got invalid state ${state} from transition ${t.name}`);

            console.log(`  Got state ${state}`);

            return this.do_update(ctx, state);
        }

        private do_transition(ctx: TContext, t: Transition) {
            let explicit = this.explicits.get(t.name);
            let to: TState;
            if (explicit) {
                to = explicit.bind(ctx)();
            } else if (t.to.length == 1) {
                to = t.to[0];
            } else {
                throw new Error('No transition: ' + t.name);
            }

            let froms = this.froms.get(t.from) || [];
            for (let action of froms) {
                action.bind(ctx)(t);
            }

            let tos = this.tos.get(to) || [];
            for (let action of tos) {
                action.bind(ctx)(t);
            }

            return to;
        }

        update(state: TState, action: UpdateHandler) {
            if (this.updates.get(state))
                throw new Error(`Overwriting state: ${name}`);

            this.updates.set(state, action);
        }

        from(from: TState, action: PartialHandler) {
            add(this.froms, from, action);
        }

        to(to: TState, action: PartialHandler) {
            add(this.tos, to, action);
        }

        on(name: TTransitions, action: CompleteHandler): void
        on(names: TTransitions[], action: CompleteHandler): void
        on(names: TTransitions | TTransitions[], action: CompleteHandler) {
            if (!(names instanceof Array))
                names = [names];

            for (let name of names) {
                if (this.explicits.get(name))
                    throw new Error(`Overwriting transition: ${name}`);

                this.explicits.set(name, action);
            }
        }
    }

    return new StateMachine(transitions);
}