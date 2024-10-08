import { Service, ServiceMessage, ServiceOptions } from "../../graphscript-core/index";
import WebSocket, { PerMessageDeflateOptions, WebSocketServer } from 'ws';
import http from 'http';
import https from 'https';
import { GraphNodeProperties } from "../../graphscript-core/index";
export type SocketServerProps = {
    server?: http.Server | https.Server | true;
    port?: 7000 | number;
    path?: 'wss' | 'hotreload' | 'python' | string;
    noServer?: boolean;
    host?: 'localhost' | '127.0.0.1' | string;
    perMessageDeflate?: PerMessageDeflateOptions;
    onmessage?: (data: string | ArrayBufferLike | Blob | ArrayBufferView | Buffer[], ws: WebSocket, wsinfo: SocketProps) => void;
    onclose?: (wss: WebSocketServer, serverinfo: SocketServerInfo) => void;
    onconnection?: (ws: WebSocket, request: http.IncomingMessage, serverinfo: SocketServerInfo, clientId: string) => void;
    onconnectionclosed?: (code: number, reason: Buffer, ws: WebSocket, serverinfo: SocketServerInfo, clientId: string) => void;
    onerror?: (err: Error, wss: WebSocketServer, serverinfo: SocketServerInfo) => void;
    onupgrade?: (ws: WebSocket, serverinfo: SocketServerInfo, request: http.IncomingMessage, socket: any, head: Buffer) => void;
    keepState?: boolean;
    type?: 'wss';
    debug?: boolean;
    serverOptions?: WebSocket.ServerOptions;
    [key: string]: any;
} & GraphNodeProperties;
export type SocketServerInfo = {
    wss: WebSocketServer;
    clients: {
        [key: string]: WebSocket;
    };
    address: string;
    send: (message: any, socketId?: string) => void;
    request: (message: any, method?: string, socketId?: string) => Promise<any> | Promise<any>[];
    post: (route: any, args?: any, method?: string, socketId?: string) => void;
    run: (route: any, args?: any, method?: string, socketId?: string) => Promise<any> | Promise<any>[];
    subscribe: (route: any, callback?: ((res: any) => void) | string, socketId?: string) => Promise<number> | Promise<number>[] | undefined;
    unsubscribe: (route: any, sub: number, socketId?: string) => Promise<boolean> | Promise<boolean>[];
    terminate: (socketId?: string) => boolean;
    graph: WSSbackend;
} & SocketServerProps;
export type SocketProps = {
    host?: string;
    port?: number;
    path?: string;
    socket?: WebSocket;
    address?: string;
    debug?: boolean;
    serverOptions?: WebSocket.ServerOptions;
    onmessage?: (data: string | ArrayBufferLike | Blob | ArrayBufferView | Buffer[], ws: WebSocket, wsinfo: SocketProps) => void;
    onopen?: (ws: WebSocket, wsinfo: SocketProps) => void;
    onclose?: (code: any, reason: any, ws: WebSocket, wsinfo: SocketProps) => void;
    onerror?: (er: Error, ws: WebSocket, wsinfo: SocketProps) => void;
    protocol?: 'ws' | 'wss';
    type?: 'socket';
    _id?: string;
    keepState?: boolean;
} & GraphNodeProperties;
export type SocketInfo = {
    socket: WebSocket;
    address?: string;
    send: (message: any) => void;
    request: (message: any, method?: string) => Promise<any>;
    post: (route: any, args?: any, method?: string) => void;
    run: (route: any, args?: any, method?: string) => Promise<any>;
    subscribe: (route: any, callback?: ((res: any) => void) | string, args?: any[], key?: string, subInput?: boolean) => any;
    unsubscribe: (route: any, sub: number) => Promise<boolean>;
    terminate: () => void;
    graph: WSSbackend;
} & SocketProps;
export declare class WSSbackend extends Service {
    name: string;
    debug: boolean;
    servers: {
        [key: string]: SocketServerInfo;
    };
    sockets: {
        [key: string]: SocketInfo;
    };
    connections: {
        servers: {
            [key: string]: SocketServerInfo;
        };
        sockets: {
            [key: string]: SocketInfo;
        };
    };
    constructor(options?: ServiceOptions);
    open: (options: SocketServerProps | SocketProps) => SocketServerInfo | SocketInfo;
    setupWSS: (options: SocketServerProps) => SocketServerInfo;
    openWS: (options: SocketProps) => SocketInfo;
    transmit: (message: string | ArrayBufferLike | Blob | ArrayBufferView | Buffer[] | ServiceMessage, ws: WebSocketServer | WebSocket) => void;
    closeWS: (ws: WebSocket | string) => boolean;
    terminate: (ws: WebSocketServer | WebSocket | string) => boolean;
    request: (message: ServiceMessage | any, ws: WebSocket, _id: string, method?: string) => Promise<unknown>;
    runRequest: (message: any, ws: WebSocket | string, callbackId: string | number) => any;
    subscribeSocket: (route: string, socket: WebSocket | string, args?: any[], key?: string, subInput?: boolean) => number;
    subscribeToSocket: (route: string, socketId: string, callback?: string | ((res: any) => void), args?: any[], key?: string, subInput?: boolean) => Promise<any>;
}
