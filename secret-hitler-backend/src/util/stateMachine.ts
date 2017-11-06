function add<TKey, TValue>(map: Map<TKey, TValue[]>, key: TKey, value: TValue) {
    let list = map.get(key);
    if (list == null)
        map.set(key, list = []);

    list.push(value);
}

export function StateMachine<TState, TContext, TTransitions extends string>(
    transitions: { [key: string]: TState[] }
) {
    type UpdateAction = (this: TContext) => TTransitions | void;

    type PartialHandler = (this: TContext, t: TTransition) => void;
    type CompleteHandler = (this: TContext) => void;

    type TTransition = { name: TTransitions, from: TState, to: TState };

    class StateMachine {
        private lookup = new Map<TTransitions, TTransition>();

        private updates = new Map<TState, UpdateAction[]>();
        private explicits = new Map<TTransitions, CompleteHandler[]>();
        private froms = new Map<TState, PartialHandler[]>();
        private tos = new Map<TState, CompleteHandler[]>();

        constructor(transitions: { [key: string]: TState[] }) {
            for (let name in transitions) {
                let t = transitions[name];
                if (t.length != 2)
                    throw new Error(`Invalid transition: ${name} [${t.join(', ')}]`);

                this.lookup.set(<TTransitions>name, {
                    name: <TTransitions>name,
                    from: t[0],
                    to: t[1],
                });
            }
        }

        do_update(ctx: TContext, state: TState): TState {
            let updates = this.updates.get(state);
            if (updates == null)
                throw new Error(`Stuck on ${state}`);


            for (let action of updates) {
                let name = action.bind(ctx)() as TTransitions | undefined;
                if (name == undefined)
                    continue;

                let t = this.lookup.get(name)!;

                console.log(`Doing transition ${t.name} [${t.from} => ${t.to}]`);

                this.do_transition(ctx, t);

                return this.do_update(ctx, t.to);
            }

            return state;
        }

        private do_transition(ctx: TContext, t: TTransition) {
            let explicits = this.explicits.get(t.name) || [];
            for (let action of explicits) {
                action.bind(ctx)();
            }

            let froms = this.froms.get(t.from) || [];
            for (let action of froms) {
                action.bind(ctx)(t);
            }

            let tos = this.tos.get(t.to) || [];
            for (let action of tos) {
                action.bind(ctx)(t);
            }
        }

        update(state: TState, action: UpdateAction) {
            add(this.updates, state, action);
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
                add(this.explicits, name, action);
            }
        }
    }

    return new StateMachine(transitions);
}