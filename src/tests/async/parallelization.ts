import { sleep } from "../../utils/async";
import { runExperiment } from "../../utils/experiments";
import { Chance } from "chance";
import { range } from "lodash";

const asyncUnion = async (items: Array<{ key: string; data: string }>) => {
    return (
        await Promise.all(items.map(async (item) => ({ [item.key]: item })))
    ).reduce((acc, curr) => ({ ...acc, ...curr }));
};

const union = async (items: Array<{ key: string; data: string }>) => {
    return items
        .map((item) => ({ [item.key]: item }))
        .reduce((acc, curr) => ({ ...acc, ...curr }));
};

const testSpeed = async () => {
    const c = new Chance();
    const inputs = range(100).map(() => ({
        key: c.string({ length: 15 }),
        data: c.string({ length: 100 }),
    }));
    const inputs100 = range(1000).map(() => ({
        key: c.string({ length: 15 }),
        data: c.string({ length: 100 }),
    }));

    const control = () => union(inputs);
    const asyncMap = () => asyncUnion(inputs);
    const control100 = () => union(inputs100);
    const asyncMap100 = () => asyncUnion(inputs100);

    await runExperiment({
        sampleCount: 10,
        experiments: [
            ["control (n = 10)", control],
            ["asyncMap (n = 10)", asyncMap],
        ],
    });
    await runExperiment({
        sampleCount: 10,
        experiments: [
            ["control (n = 100)", control100],
            ["asyncMap (n = 100)", asyncMap100],
        ],
    });
};

testSpeed();
