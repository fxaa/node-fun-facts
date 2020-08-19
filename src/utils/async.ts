import { reduce } from "lodash";

export const sleep = async (ms: number): Promise<void> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, ms);
    });
};

export const deAsyncedMap = async <A, B>(
    items: Array<A>,
    callback: (item: A) => Promise<B>
): Promise<Array<B>> =>
    reduce(
        items,
        async (acc, curr) => {
            const currentAcc = await acc;
            const callbackRes = await callback(curr);
            return currentAcc.concat(callbackRes);
        },
        Promise.resolve([]) as Promise<Array<B>>
    );
