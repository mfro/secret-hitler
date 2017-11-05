declare interface PromiseConstructor {
    // each<T, R>(callback: (t: T) => R | Promise<R>): (src: T[]) => Promise<R[]>;
    /**
     * Sequentially
     */
    each<T, R>(list: T[], callback: (t: T) => R | Promise<R>): Promise<R[]>;
    each<T, V>(list: T[], first: V, callback: (t: T) => V | Promise<V>): Promise<V>;
    
    /**
     * In parrallel
     */
    every<T, R>(list: T[], callback: (t: T) => R | Promise<R>): Promise<R[]>;
}

declare interface Promise<T> {
    /**
     * Sequentially
     */
    each<K extends number & keyof T, R>(callback: (t: T[K]) => R | Promise<R>): Promise<R[]>
    
    /**
     * In parrallel
     */
    every<K extends number & keyof T, R>(callback: (t: T[K]) => R | Promise<R>): Promise<R[]>

    finally<TResult1 = T, TResult2 = never>(callback: (() => TResult1 | PromiseLike<TResult1>) | undefined | null): Promise<TResult1 | TResult2>;
}
