type LoggerServiceCallBack = (arg: string) => void;

export function toUpperCaseWithCb(arg: string, callBack:LoggerServiceCallBack) : string | null {
    if(!arg) {
        callBack('Invalid argument!');
        return null
    }
    callBack(`called function with ${arg}`)
    return arg.toUpperCase();
}