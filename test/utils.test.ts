// const {isObject, mergeDeep} = require('./../src/db/utils/utils.ts');

import {isObject, mergeDeep} from "../src/db/utils/utils";

test('isObject should recognise object', () => {
    expect(isObject({})).toBe(true);
});

test('isObject should return false if arg is a string', () => {
    expect(isObject("test")).toBe(false);
});

test('isObject should return false if arg is a boolean', () => {
    expect(isObject(true)).toBe(false);
});

test('isObject should return false if arg is a number', () => {
    expect(isObject(12)).toBe(false);
});

test('mergeDeep should merge not nested objects', () => {
    const output = mergeDeep({
        test1: "test1"
    }, {
        test2: "test2"
    });
    expect(output).toEqual({
        test1: "test1",
        test2: "test2"
    })
});

test('mergeDeep should merge nested objects', () => {
    const output = mergeDeep({
            test1: {
                test2: "test"
            }
        },
        {
           test1: {
               test3: "test"
           }
        });
    expect(output).toEqual({
        test1: {
            test2: "test",
            test3: "test"
        }
    })
});