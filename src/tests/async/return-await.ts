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
    const durations = range(100).map(() => random(1, true));

    const control = () => normalSleep(30);
    const returnAwait = () => returnAwaitSleep(30);
    const returnAsync = () => returnAsyncSleep(30);
    const controlBatch = () => Promise.all(durations.map(normalSleep));
    const returnAwaitBatch = () => Promise.all(durations.map(returnAwaitSleep));
    const returnAsyncBatch = () => Promise.all(durations.map(returnAsyncSleep));
    await runExperiment({
        sampleCount: 10,
        experiments: [
            ["control", control],
            ["returnAwait", returnAwait],
            ["returnAsync", returnAsync],
        ],
    });
    await runExperiment<void[]>({
        sampleCount: 10,
        experiments: [
            ["control - n = 100", controlBatch],
            ["returnAwait - n = 100", returnAwaitBatch],
            ["returnAsync - n = 100", returnAsyncBatch],
        ],
    });
};

testSpeed();
