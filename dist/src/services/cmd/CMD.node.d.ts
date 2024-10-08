import { ChildProcess, Serializable } from 'child_process';
import { Service, ServiceMessage, ServiceOptions } from '../../graphscript-core/index';
import { Graph, GraphNode, GraphNodeProperties } from '../../graphscript-core/index';
export type CMDRoute = {
    command: string | ChildProcess;
    args?: string[];
    options?: {
        shell: true;
        stdio: 'inherit';
        [key: string]: any;
    };
    env?: any;
    cwd?: any;
    signal?: any;
    stdout?: (data: any) => void;
    onerror?: (error: Error) => void;
    onclose?: (code: number | null, signal: NodeJS.Signals | null) => void;
} & GraphNodeProperties;
export type CMDInfo = {
    process: ChildProcess;
    _id: string;
    controller: AbortController;
    send: (data: Serializable) => boolean;
    request: (message: ServiceMessage | any, method?: string) => Promise<any>;
    post: (route: string, args: any, method?: string) => boolean;
    run: (route: any, args?: any, method?: string) => Promise<any>;
    subscribe: (route: any, callback?: ((res: any) => void) | string, args?: any[], key?: string, subInput?: boolean) => number;
    unsubscribe: (route: any, sub: number) => Promise<boolean>;
} & CMDRoute;
export declare class CMDService extends Service {
    processes: {
        [key: string]: {
            _id: string;
            process: ChildProcess;
            controller: AbortController;
        } & CMDRoute;
    };
    connections: {
        processes: any;
    };
    subprocessloader: {
        process: (node: CMDRoute & GraphNode, parent: GraphNode, graph: Graph, roots: any, properties: any) => void;
    };
    constructor(options?: ServiceOptions);
    createProcess: (properties: CMDRoute) => CMDRoute;
    open: (properties: CMDRoute) => CMDRoute;
    abort: (childprocess: ChildProcess | CMDInfo) => boolean;
    send: (childprocess: ChildProcess, data: Serializable) => boolean;
    request: (message: ServiceMessage | any, processId: string, method?: string) => Promise<unknown>;
    runRequest: (message: any, callbackId: string | number, childprocess?: ChildProcess | string) => any;
    subscribeProcess(route: string, childprocess: ChildProcess | string, args?: any[], key?: string, subInput?: boolean): number;
    subscribeToProcess(route: string, processId: string, callback?: ((res: any) => void) | string, args?: any[], key?: string, subInput?: boolean): any;
}
