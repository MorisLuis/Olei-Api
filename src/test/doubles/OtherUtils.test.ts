import { toUpperCaseWithCb } from "../../utils/test/doubles/OtherUtils";


describe.only('Tracking callbacks with Jest mocks', () => {

    const callBackMock = jest.fn();


    beforeEach(() => {
        jest.clearAllMocks()
    })


    it('calls callback for invalid argument - track calls', () => {
        const actual = toUpperCaseWithCb('', callBackMock);
        expect(actual).toBeUndefined();
        expect(callBackMock).toBeCalledWith('Invalid argument!');
        expect(callBackMock).toBeCalledTimes(1)
    });

    it('calls callback for valid argument - track calls', () => {
        const actual = toUpperCaseWithCb('abc', callBackMock);
        expect(actual).toBe('ABC');
        expect(callBackMock).toBeCalledWith('called function with abc');
        expect(callBackMock).toBeCalledTimes(1)
    })
})

describe('Tracking callbacks', () => {

    let cbArgs : any[] = [];
    let timesCalled = 0;

    function callBackMocks(arg: string) {
        cbArgs.push(arg);
        timesCalled++
    };

    afterEach(() => {
        cbArgs = [];
        timesCalled = 0;
    })

    it('calls callback for invalid argument - track calls', () => {
        const actual =  toUpperCaseWithCb('', callBackMocks);
        expect(actual).toBeUndefined();
        expect(cbArgs).toContain('Invalid argument!');
        expect(timesCalled).toBe(1);
    });

    it('calls callback for valid argument - track calls', () => {
        const actual =  toUpperCaseWithCb('abc', callBackMocks);
        expect(actual).toBe('ABC');
        expect(cbArgs).toContain('called function with abc');
        expect(timesCalled).toBe(1);
    })
})
