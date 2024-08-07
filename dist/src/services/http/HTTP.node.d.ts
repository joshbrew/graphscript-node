import { Service, ServiceMessage, ServiceOptions } from "../../graphscript-core/index";
import { GraphNode, GraphNodeProperties } from "../../graphscript-core/index";
import * as http from 'http';
import * as https from 'https';
export * from './boilerplate/index';
export type ServerProps = {
    host: string;
    port: number;
    certpath?: string;
    keypath?: string;
    passphrase?: string;
    startpage?: string;
    errpage?: string;
    pages?: {
        [key: 'all' | string]: string | ({
            headers?: {
                [key: string]: any;
            };
            template?: string;
            onrequest?: GraphNode | string | ((self: HTTPbackend, node: GraphNode, request: http.IncomingMessage, response: http.ServerResponse) => void);
            redirect?: string;
            inject?: {
                [key: string]: any;
            } | any[] | string | ((...args: any) => any);
        } & GraphNodeProperties);
    };
    protocol?: 'http' | 'https';
    type?: 'httpserver' | string;
    keepState?: boolean;
    onopen?: (served: ServerInfo) => void;
    onerror?: (er: Error, served: ServerInfo) => void;
    onclose?: (served: ServerInfo) => void;
    onupgrade?: (request: any, socket: any, head: any, served: ServerInfo) => void;
    timeout?: number;
    _id?: string;
    debug?: boolean;
    [key: string]: any;
};
export type ServerInfo = {
    server: https.Server | http.Server;
    address: string;
    terminate: () => void;
    graph: HTTPbackend;
    _id: string;
} & ServerProps;
export type ReqOptions = {
    protocol: 'http' | 'https' | string;
    host: string;
    port: number;
    method: string;
    path?: string;
    headers?: {
        [key: string]: any;
        'Content-Type'?: string;
        'Content-Length'?: number;
    };
};
export declare class HTTPbackend extends Service {
    name: string;
    server: any;
    debug: boolean;
    servers: {
        [key: string]: ServerInfo;
    };
    mimeTypes: {
        [key: string]: string;
    };
    constructor(options?: ServiceOptions, settings?: ServerProps);
    onStarted: (protocol: "http" | "https" | string, host: string, port: number) => void;
    setupServer: (options?: ServerProps, requestListener?: http.RequestListener, onStarted?: () => void) => void;
    open: (options?: ServerProps, requestListener?: http.RequestListener, onStarted?: () => void) => void;
    setupHTTPserver: (options?: (ServerProps & {
        certpath?: string;
        keypath?: string;
        passphrase?: string;
    }), requestListener?: http.RequestListener, onStarted?: () => void) => Promise<ServerInfo>;
    transmit: (message: any | ServiceMessage, options: string | {
        protocol: "http" | "https" | string;
        host: string;
        port: number;
        method: string;
        path?: string;
        headers?: {
            [key: string]: any;
            "Content-Type"?: string;
            "Content-Length"?: number;
        };
    }, ondata?: (chunk: any) => void, onend?: () => void) => Promise<Buffer> | http.ClientRequest;
    withResult: (response: http.ServerResponse, result: any, message: {
        route: string;
        args: {
            request: http.IncomingMessage;
            response: http.ServerResponse;
        };
        method?: string;
        served?: ServerInfo;
    }) => void;
    injectPageCode: (templateString: string, url: string, served: ServerInfo) => {
        templateString: string;
        headers: {
            [key: string]: any;
        };
    };
    receive: (message: {
        route: string;
        args: {
            request: http.IncomingMessage;
            response: http.ServerResponse;
        };
        method?: string;
        node?: string;
        served?: ServerInfo;
        redirect?: string;
    }) => Promise<unknown>;
    responseOnErrorPromiseHandler: (response: http.ServerResponse, reject: any, err: any) => void;
    getFailedPromiseHandler: (resolve: any, reject: any, requestURL: any, message: any, response: http.ServerResponse, served: any) => void;
    handleBufferedPostBodyPromiseHandler: (resolve: any, body: any, message: any, response: http.ServerResponse, served: any) => void;
    onRequestFileReadPromiseHandler: (error: any, content: any, resolve: any, reject: any, requestURL: any, response: http.ServerResponse, message: any, served: ServerInfo) => void;
    responsePromiseHandler: (resolve: any, reject: any, message: any, request: http.IncomingMessage, response: http.ServerResponse, method: string, served: ServerInfo) => void;
    request: (options: ReqOptions | any, send?: any, ondata?: (chunk: any) => void, onend?: () => void) => http.ClientRequest;
    POST: (url: string | URL, data: any, headers?: {
        "Content-Type"?: string;
        "Content-Length"?: number;
        [key: string]: any;
    }) => http.ClientRequest;
    GET: (url: string | URL | http.RequestOptions) => Promise<Buffer>;
    terminate: (served: string | ServerInfo) => void;
    getRequestBody(req: http.IncomingMessage): Promise<Buffer>;
    addPage: (path: string, template: string) => void;
    addHTML: (path: string, template: string) => void;
    buildPage: (pageStructure: {
        [key: string]: {} | null | any;
    } | string[] | string | ((...args: any) => any), baseTemplate: string) => string;
    hotreload: (socketURL?: string | URL, esbuild_cssFileName?: string) => string;
    pwa: (pwaName?: string, cacheExpirationDays?: number, serviceWorkerUrl?: string) => string;
}
