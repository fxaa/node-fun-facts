import { sleep } from "../../utils/async";
import { runExperiment } from "../../utils/experiments";
import { range, random } from "lodash";

const normalSleep = (ms: number) => {
    return sleep(ms);
};

const returnAwaitSleep = async (ms: number) => {
    return await sleep(ms);
};

const returnAsyncSleep = async (ms: number) => {
    return sleep(ms);
};

const testSpeed = async () => {
    const durations = range(1000).map(() => random(100, 200));

    const control = () => Promise.all(durations.map(normalSleep));
    const returnAwait = () => Promise.all(durations.map(returnAwaitSleep));
    const returnAsync = () => Promise.all(durations.map(returnAwaitSleep));
    await runExperiment({
        sampleCount: 20,
        experiments: [
            ["control", control],
            ["returnAwait", returnAwait],
            ["returnAsync", returnAsync],
        ],
    });
};

testSpeed();
