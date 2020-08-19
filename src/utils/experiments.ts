import { range, fromPairs, keys, mapValues, mapKeys, reduce } from "lodash";
import { performance } from "perf_hooks";
import { deAsyncedMap } from "./async";

export const timed = async <Ret>(func: () => Promise<Ret>) => {
    const timeNow = performance.now();
    await func();
    return performance.now() - timeNow;
};

export const compare = async <Ret>(experiments: Array<[string, () => Promise<Ret>]>) => {
    const resultsPromise = reduce(
        experiments,
        async (acc, [name, func]) => {
            const currentAcc = await acc;
            const timedRes = await timed(func);
            return [...currentAcc, [name, timedRes]] as [string, number][];
        },
        Promise.resolve([]) as Promise<[string, number][]>
    );
    const results = await resultsPromise;
    return fromPairs(results) as { [key: string]: number };
};

export const difference = (final: number, initial: number) =>
    ((final - initial) / final) * 100;

export const runExperiment = async <Ret>({
    sampleCount,
    experiments,
}: {
    sampleCount: number;
    experiments: Array<[string, () => Promise<Ret>]>;
}) => {
    const samples = await deAsyncedMap(range(sampleCount), () => compare(experiments));
    const formattedSamples = mapKeys(samples, (_, idx) => {
        const run = parseInt(idx as any) + 1;
        return `Run ${run}`;
    });

    const totalsInitial = keys(samples[0]).reduce(
        (acc, curr) => ({
            ...acc,
            [curr]: 0,
        }),
        {} as { [key: string]: number }
    );
    const totals = samples.reduce((acc, sample) => {
        return mapValues(sample, (val, key) => acc[key] + val);
    }, totalsInitial);
    const averages = mapValues(totals, (total) => total / sampleCount);

    const rows = { ...formattedSamples, Average: averages };
    console.table(rows);
};
