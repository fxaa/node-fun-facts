import {
    range,
    fromPairs,
    keys,
    mapValues,
    mapKeys,
    reduce,
    chunk,
    flatMap,
    flatten,
} from "lodash";
import { performance } from "perf_hooks";
import { deAsyncedMap } from "./async";

export const timed = async <Ret>(func: () => Promise<Ret>) => {
    const timeNow = performance.now();
    await func();
    return performance.now() - timeNow;
};

export const compare = async <Ret>(experiments: Array<[string, () => Promise<Ret>]>) => {
    const results = await deAsyncedMap(
        experiments,
        async ([name, func]) => [name, await timed(func)] as [string, number]
    );
    return fromPairs(results);
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
    const chunkedSamples = chunk(range(sampleCount), 1000);
    const samples = flatten(
        await Promise.all(
            flatMap(chunkedSamples, (chunkedSet) =>
                deAsyncedMap(chunkedSet, () => compare(experiments))
            )
        )
    );

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

    const controlName = experiments[0][0];
    const controlAverage = averages[controlName];
    const controlRatios = mapValues(averages, (average) => {
        return (((controlAverage - average) / controlAverage) * 100).toFixed(1) + "%";
    });

    const rows =
        samples.length > 20
            ? { Average: averages, Advantage: controlRatios }
            : { ...formattedSamples, Average: averages, Advantage: controlRatios };
    console.table(rows);
};
