interface Serializable<T1> {
    serialize(t1: T1): any
}

export function serialize<T extends Serializable<T1>, T1>(t: T | null, t1: T1) {
    if (t == null)
        return null;

    return t.serialize(t1);
}