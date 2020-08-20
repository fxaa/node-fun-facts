import { reduce, map, range, random } from "lodash";
import { runExperiment } from "../../utils/experiments";

type Result = { message: string; success: boolean };

const sleep = async (ms: number): Promise<Result> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                message: `sleep_with_delay:${ms}`,
                success: ms % 2 === 0,
            });
        }, ms);
    });
};

const reduceSleeps = async (sleeps: number[]) => {
    return reduce(
        sleeps,
        async (previousPromise, currentSleep) => {
            const allSleeps = await previousPromise;
            const currentSleepResult = await sleep(currentSleep);
            currentSleepResult.success
                ? allSleeps.successes.push(currentSleepResult)
                : allSleeps.failures.push(currentSleepResult);
            return allSleeps;
        },
        Promise.resolve({ successes: [] as Result[], failures: [] as Result[] })
    );
};

const mapSleeps = async (sleeps: number[]) => {
    return Promise.all(
        map(sleeps, async (currentSleep) => {
            return sleep(currentSleep);
        })
    );
};

const testSpeed = async () => {
    const durations = range(10).map(() => random(100, 300));
    const reducer = async () => await reduceSleeps(durations);

    const mapper = async () => {
        const mappedSleepResult = await mapSleeps(durations);
        return reduce(
            mappedSleepResult,
            (sum, curr) => {
                curr.success ? sum.successes.push(curr) : sum.failures.push(curr);
                return sum;
            },
            { successes: [] as Result[], failures: [] as Result[] }
        );
    };

    await runExperiment({
        sampleCount: 5,
        experiments: [
            ["control", mapper],
            ["reduce", reducer],
        ],
    });
};

testSpeed();
