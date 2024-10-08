import { Service, ServiceMessage, ServiceOptions } from "../../graphscript-core/index";
import { GraphNode, GraphNodeProperties } from "../../graphscript-core/index";
import * as http from 'http'
import * as https from 'https'
import * as fs from 'fs'
import * as path from 'path'
import { defaultManifest, defaultServiceWorker } from "./boilerplate/index";

export * from './boilerplate/index'

export type ServerProps = {
    host:string,
    port:number,
    certpath?:string, 
    keypath?:string,
    passphrase?:string,
    startpage?: string,
    errpage?:string,
    pages?:{
        [key:'all'|string]:string|{  //objects get loaded as nodes which you can modify props on
            headers?:{[key:string]:any}, //page specific headers to assign on page response
            template?:string,
            onrequest?:GraphNode|string|((self:HTTPbackend, node:GraphNode, request:http.IncomingMessage, response:http.ServerResponse)=>void), //run a function or node? the template, request and response are passed as arguments, you can write custom node logic within this function to customize inputs etc.
            redirect?:string, // can redirect the url to call a different route instead, e.g. '/':{redirect:'home'} sets the route passed to the receiver as 'home'
            inject?:{[key:string]:any}|any[]|string| ((...args:any)=>any) //append html      
        } & GraphNodeProperties
    },
    protocol?:'http'|'https',
    type?:'httpserver'|string,
    keepState?:boolean, //setState whenever a route is run? State will be available at the address (same key of the object storing it here)
    onopen?:(served:ServerInfo)=>void, //onopen callback
    onerror?:(er:Error,served:ServerInfo)=>void,
    onclose?:(served:ServerInfo)=>void, //server close callback
    onupgrade?:(request, socket, head, served:ServerInfo)=>void,
    timeout?:number, //request timeout, default is 1 second
    _id?:string,
    debug?:boolean,
    [key:string]:any
}

export type ServerInfo = {
    server:https.Server|http.Server,
    address:string,
    terminate:()=>void,
    graph:HTTPbackend,
    _id:string
} & ServerProps

export type ReqOptions = {
    protocol:'http'|'https'|string
    host:string,
    port:number,
    method:string,
    path?:string,
    headers?:{
        [key:string]:any,
        'Content-Type'?:string, //e.g...
        'Content-Length'?:number
    }
}

//http/s server 
export class HTTPbackend extends Service {

    name='http';

    server:any

    debug:boolean=false

    servers:{
        [key:string]:ServerInfo
    }={}

    mimeTypes:{[key:string]:string} = { 
        '.html': 'text/html', '.htm': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.txt':'text/plain',
        '.png': 'image/png', '.jpg': 'image/jpg', '.jpeg': 'image/jpg','.gif': 'image/gif', '.svg': 'image/svg+xml', '.xhtml':'application/xhtml+xml', '.bmp':'image/bmp',
        '.wav': 'audio/wav', '.mp3':'audio/mpeg', '.mp4': 'video/mp4', '.xml':'application/xml', '.webm':'video/webm', '.webp':'image/webp', '.weba':'audio/webm',
        '.woff': 'font/woff', 'woff2':'font/woff2', '.ttf': 'application/font-ttf', '.eot': 'application/vnd.ms-fontobject', '.otf': 'application/font-otf',
        '.wasm': 'application/wasm', '.zip':'application/zip','.xlsx':'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', '.tif':'image/tiff',
        '.sh':'application/x-sh', '.csh':'application/x-csh', '.rar':'application/vnd.rar','.ppt':'application/vnd.ms-powerpoint', '.pptx':'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        '.odt':'application/vnd.oasis.opendocument.text','.ods':'application/vnd.oasis.opendocument.spreadsheet','.odp':'application/vnd.oasis.opendocument.presentation',
        '.mpeg':'video/mpeg','.mjs':'text/javascript','.cjs':'text/javascript','.jsonld':'application/ld+json', '.jar':'application/java-archive', '.ico':'image/vnd.microsoft.icon',
        '.gz':'application/gzip', 'epub':'application/epub+zip', '.doc':'application/msword', '.docx':'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        '.csv':'text/csv', '.avi':'video/x-msvideo', '.aac':'audio/aac', '.mpkg':'application/vnd.apple.installer+xml','.oga':'audio/ogg','.ogv':'video/ogg','ogx':'application/ogg',
        '.php':'application/x-httpd-php', '.rtf':'application/rtf', '.swf':'application/x-shockwave-flash', '.7z':'application/x-7z-compressed', '.3gp':'video/3gpp'
    };

    constructor(
        options?:ServiceOptions,
        settings?:ServerProps
    ) {
        super(options);
        this.load(this);

        //console.log(settings);
        if(settings) {
            this.setupServer(settings);
        }
    
    }

    //on server started
    onStarted = (protocol:'http'|'https'|string,host:string,port:number) => {
        console.log(`🐱 Node server running at 
            ${protocol}://${host}:${port}/`
        );
    }
    
    setupServer = (
        options:ServerProps={
            protocol:'http',
            host:'localhost',
            port:8080,
            startpage:'index.html'
        },
        requestListener?:http.RequestListener,
        onStarted?:()=>void
    )=>{
        //console.log(options);
        if(options.pages) {
            for(const key in options.pages) {
                if (typeof options.pages[key] === 'string') {
                    this.addPage(`${options.port}/${key}`, options.pages[key] as string)
                } else if (typeof options.pages[key] === 'object' || typeof options.pages[key] === 'function') {
                    if((options.pages[key] as any).template) {
                        (options.pages[key] as any).get = (options.pages[key] as any).template;
                    }
                    let rt = `${options.port}/${key}`;
                    if(key !== '_all') this.load({[rt]:options.pages[key]});
                }
            }
        }

        //create http or https server
        this.setupHTTPserver(options, requestListener, onStarted);
    }
    
    open = this.setupServer;

    //Define the server via http or https
    setupHTTPserver = (
        options:(ServerProps & {
            certpath?:string, 
            keypath?:string,
            passphrase?:string
        })={
            host:'localhost' as string,
            port:8080 as number,
            startpage:'index.html',
            errpage:undefined
        },
        requestListener?:http.RequestListener,
        onStarted:()=>void = ()=>{this.onStarted('http',options.host,options.port)}
    ) => {

        const host = options.host ? options.host : 'localhost';
        const port = options.port ? options.port : 8000;

        if(!host || !port) return;

        const address = `${host}:${port}`;

        if(this.servers[address]) this.terminate(this.servers[address]);

        if(!('keepState' in options)) options.keepState = true; //default true

        const served = {
            server:undefined as any,
            type:'httpserver',
            address,
            ...options
        } as ServerInfo

        //default requestListener propagates to graphscript
        if(!requestListener) 
            requestListener = (
                request:http.IncomingMessage,
                response:http.ServerResponse
            ) => { 
            
            let received:any = {
                args:{request, response}, 
                method:request.method, 
                served
            }

            let url = (request as any).url.slice(1);
            if(!url) url = '/';
            //console.log(options)
            
            if(options.debug) {
                let time = getHoursAndMinutes(new Date());
                console.log(
                    time, ' | ',
                    'From: ', request.socket?.remoteAddress, 
                    'For: ', request.url, ' | ', request.method
                );
            }

            if(options.pages) {
                getPageOptions.call(this, url, received, options.pages, request, response, options.port);
            } else received.route = url;

            this.receive(received); 
        } //default requestListener

        //var http = require('http');
        let server:http.Server|https.Server = undefined as any;
        if(options.protocol === 'http')
            server = http.createServer(
            requestListener
        );
        else {
            let opts;
            if(options.keypath && options.certpath) {
                opts = {
                    key: fs.readFileSync(options.keypath),
                    cert: fs.readFileSync(options.certpath),
                    passphrase:options.passphrase
                }
                server = https.createServer(
                    opts,
                    requestListener
                )
            } else 
                console.error('Error, key and/or cert .pem SSL files not provided. See OpenSSL certbot for more info on how to create free SSL certifications, or create your own self-signed one for local development.')
              
            
        }

        if(!server) {
            console.error("Server not successfully created.");
            return undefined;
        }

        served.server = server;
        served.terminate = () => {
            this.terminate(served);
        }
        served.service = this;

        // server.on('upgrade', (request, socket, head) => {
        //     this.onUpgrade(request, socket, head);
        // });

        this.servers[address] = served;
        served._id = options._id ? options._id : address;



        //SITE AVAILABLE ON PORT:
        return new Promise((resolve,reject) => {
            let resolved;
            // server.on('connection',(socket) => {
            //     //DDOS protection?
            //     //Rate limiting?
            // });
            server.on('error',(err)=>{
                if(served.onerror) served.onerror(err, served);
                else console.error('Server error:', err.toString());
                if(!resolved) reject(err);
            });
            server.on('clientError',(err, socket:http.IncomingMessage["socket"]) =>{
                if(served.onerror) served.onerror(err, served);
                else console.error(getHoursAndMinutes(new Date()), ' | Server clientError:', err.toString(), ' | From: ', socket.remoteAddress);
                if(socket) socket.destroy();
            });
            server.on('tlsClientError',(err, socket:http.IncomingMessage["socket"]) =>{
                if(served.onerror) served.onerror(err, served);
                else console.error(getHoursAndMinutes(new Date()), ' | Server tlsClientError: ', err.toString(), ' | From: ', socket.remoteAddress);
                if(socket) socket.destroy();
            });
            server.on('upgrade',(request, socket, head) => {
                if(served.onupgrade) served.onupgrade(request,socket,head,served);
            });
            server.listen( 
                port, host,
                ()=>{
                    onStarted(); 
                    if(served.onopen) served.onopen(served);
                    resolved = true;
                    resolve(served);
                }
            );
        }) as Promise<ServerInfo> ;
    }

    transmit = ( //generalized http request. The default will try to post back to the first server in the list
        message:any | ServiceMessage, 
        options:string|{
            protocol:'http'|'https'|string
            host:string,
            port:number,
            method:string,
            path?:string,
            headers?:{
                [key:string]:any,
                'Content-Type'?:string,
                'Content-Length'?:number
            }
        },
        ondata?:(chunk:any)=>void,
        onend?:()=>void

    ) => {
        let input = message;
        if(typeof input === 'object' && !input.byteLength) input = JSON.stringify(input);

        if(typeof options === 'string' && message) return this.POST(options,message);
        else if(typeof options === 'string') return this.GET(options);
        
        if(!options) { //fill a generic post request for the first server if none provided
            let server = this.servers[Object.keys(this.servers)[0]];
            options = {
                protocol:server.protocol as any,
                host:server.host,
                port:server.port,
                method:'POST',
                path:message.route,
                headers:{
                    'Content-Type':'application/json',
                    'Content-Length':input.length
                }
            };
        } //get first server and use its settings for a generic post request
        else if (!options.headers) {
            options.headers = {
                'Content-Type':'application/json',
                'Content-Length':input.length
            }
        }

        return this.request(options,input,ondata,onend);
    }

    withResult = (
        response:http.ServerResponse,
        result:any,
        message:{
            route:string, 
            args:{request:http.IncomingMessage,response:http.ServerResponse},  //data will be an object containing request, response
            method?:string,
            served?:ServerInfo //server deets
        }
    ) => {
        if(result && !response.writableEnded && !response.destroyed) {
        
            let mimeType = 'text/plain';
            
            let head = {} as any;

            if(typeof result === 'string') {
                let extname = path.extname(result);

                if(extname && fs.existsSync(path.join(process.cwd(),result))) { //load file paths if returned
                    mimeType = this.mimeTypes[extname] || 'application/octet-stream';

                    result = fs.readFileSync(path.join(process.cwd(),result));
                    if(mimeType === 'text/html' && (message.served?.pages?._all || message.served?.pages?.[message.route])) {
                        let { templateString, headers } = this.injectPageCode(result.toString(),message.route,message.served as any) as any;
                        result = templateString;
                        Object.assign(head, headers);
                    }
                }
                else if(typeof result === 'string' && result.includes('<') && result.includes('>') && (result.indexOf('<') < result.indexOf('>'))) //probably an html template
                    {
                        head['Content-Type'] = 'text/html';
                        if(message?.served?.pages?._all || message?.served?.pages?.[message.route]) {
                            let { templateString, headers } = this.injectPageCode(result,message.route,message.served) as any;
                            result = templateString;
                            Object.assign(head, headers);
                        }
                        response.writeHead(200,head);
                        response.end(result,'utf-8');
                        return;
                    }
            } else if(typeof result === 'object') {
                result = JSON.stringify(result);
                mimeType = 'application/json'
            }
            head['Content-Type'] = mimeType;
            response.writeHead(200,head);
            response.end(result,'utf-8');
        } else {
            try {response.destroy();} catch {}
        }
    }

    injectPageCode = (
        templateString:string, 
        url:string,             
        served:ServerInfo 
    ):{templateString:string,headers:{[key:string]:any}} => { 
        if ((served?.pages?.[url] as any)?.inject) { //inject per url
            if(typeof (served as any).pages[url].inject === 'object') 
                templateString = this.buildPage((served as any).pages[url].inject as any, templateString);
            else if (typeof (served as any).pages[url].inject === 'function') 
                templateString += ((served as any).pages[url].inject as any)();
            else if (typeof (served as any).pages[url].inject === 'string' || typeof (served as any).pages[url].inject === 'number') 
                templateString += (served as any).pages[url].inject;
        }
        if((served?.pages?._all as any)?.inject) { //any per server
            if(typeof (served.pages as any)._all.inject === 'object') 
                templateString = this.buildPage((served as any).pages._all.inject, templateString);
            else if (typeof (served as any).pages._all.inject === 'function') 
                templateString += (served as any).pages._all.inject();
            else if (typeof (served as any).pages._all.inject === 'string' || typeof (served as any).pages._all.inject === 'number') 
                templateString += (served as any).pages._all.inject;
        }  

        let headers = {}; 
        if((served as any).pages._all?.headers)
            Object.assign(headers,(served as any).pages._all.headers);

        if((served as any).pages[url]?.headers)
            Object.assign(headers,(served as any).pages[url].headers);

        
        return {templateString, headers};
    }

    receive = ( //our fancy request response handler
        message:{
            route:string, 
            args:{request:http.IncomingMessage,response:http.ServerResponse},  //data will be an object containing request, response
            method?:string,
            node?:string, // alt for route
            served?:ServerInfo, //server deets
            redirect?:string //if we redirected the route according to page options
        }
    ) => {
        if(this.debug) console.log(message.args.request.method, message.args.request.url);
        //console.log(request); //debug

        let result = new Promise((resolve,reject) => {
            this.responsePromiseHandler(resolve, reject, message, message.args.request, message.args.response, message.method as string, message.served as ServerInfo);
        }).catch((er)=>{ console.error("Request Error:", er); });

        return result;
    }

    //internal
    responseOnErrorPromiseHandler =  (response:http.ServerResponse, reject, err) => {
        if(!response.writableEnded || !response.destroyed ) {
            response.statusCode = 400;
            response.end(undefined,undefined as any);
            reject(err);
        } else {
            try {response.destroy();} catch {}
            reject(err);
        }
    }

    //internal
    getFailedPromiseHandler = (resolve, reject, requestURL, message, response:http.ServerResponse, served) => {
        if(response.writableEnded || response.destroyed) reject(requestURL); 
        if(requestURL == './' || requestURL == served?.startpage) {
            let template = `<!DOCTYPE html><html><head></head><body style='background-color:#101010 color:white;'><h1>Brains@Play Server</h1></body></html>`; //start page dummy
            if(served?.pages?._all || served?.pages?.error) {
                let {templateString, headers} = this.injectPageCode(template,message.route,served) as any;
                template = templateString;
            }
            response.writeHead(200, { 'Content-Type': 'text/html' });
            response.end(template,'utf-8'); //write some boilerplate server page, we should make this an interactive debug page
            resolve(template);
            if(served?.keepState) this.setState({[served.address]:template});
            return;
        }
        else if(this.debug) console.log(`File ${requestURL} does not exist on path!`);
        
        response.writeHead(500); //set response headers
        response.end(undefined,undefined as any);
        reject(requestURL);
       
        //return;
    }

    //internal
    handleBufferedPostBodyPromiseHandler = (resolve, body, message, response:http.ServerResponse, served) => {
        
        body = Buffer.concat(body).toString(); //now it's a string
                
        if(typeof body === 'string') {
            let substr = body.substring(0,8);
            if(substr.includes('{') || substr.includes('[')) {
                if(substr.includes('\\')) body = body.replace(/\\/g,""); 
                if(body[0] === '"') { body = body.substring(1,body.length-1)};
                body = JSON.parse(body); //parse stringified args, this is safer in a step
            }
        }
        
        let route,method,args;

        if(body?.route){ //if arguments were posted 
            route = body.route;
            method = body.method;
            args = body.args;
            if(!route) {
                if(typeof body.route === 'string') if(body.route.includes('/') && body.route.length > 1) body.route = body.route.split('/').pop();
                route = body.route;
            }
        }
        if(!route) { //body post did not provide argument so use the request route
            if (message?.route) {
                let route = message.route;
                method = message.method;
                args = message.args;
                if(!route) {
                    if(typeof message.route === 'string') 
                        if(message.route.includes('/') && message.route.length > 1) 
                            message.route = message.route.split('/').pop() as string;

                    route = message.route;
                }
            }
        }
        let res:any = body;
        if(route) {
            
            if(this.restrict?.[route]) {
                try {response.destroy();} catch {}
                resolve(res);
            } else {
                if(body.method) {
                    res = this.handleMethod(route, method, args);
                }
                else if (body.node) {
                    res = this.handleGraphNodeCall(body.node, body.args);
                }
                else res = this.handleServiceMessage({route, args:args, method:method});
    
                if(res instanceof Promise) {
                    res.then((r) => {
                        this.withResult(response,r,message);
                        if(served?.keepState) this.setState({[served.address]:res});
                        resolve(res);
                    });
                } else {
                    this.withResult(response,res,message);
                    if(served?.keepState) this.setState({[served.address]:res});
                    resolve(res);
                }
            }
        }
        else if(!response.writableEnded || !response.destroyed) {
            response.statusCode = 200;
            response.end(undefined,undefined as any); //posts etc. shouldn't return anything but a 200 usually
            resolve(res);
        } else {
            try {response.destroy();} catch {}
            resolve(res); //get requests resolve first and return otherwise this will resolve 
        }
    
    }

    //internal
    onRequestFileReadPromiseHandler =  (error, content, resolve, reject, requestURL, response:http.ServerResponse, message, served:ServerInfo) => {
        if (error) {
            if(error.code == 'ENOENT') { //page not found: 404
                if(served?.errpage) {
                    fs.readFile(served.errpage, (er, content) => {
                        response.writeHead(404, { 'Content-Type': 'text/html' }); //set response headers

                        
                        //add hot reload if specified
                        // if(process.env.HOTRELOAD && requestURL.endsWith('.html') && cfg.hotreload) {
                        //     content = addHotReloadClient(content,`${cfg.socket_protocol}://${cfg.host}:${cfg.port}/hotreload`);
                        // }

                        if(served.pages?._all || served.pages?.error) {
                            let {templateString, headers} = this.injectPageCode(content.toString(),message.route,served) as any;
                            content = templateString;
                        }

                        response.end(content, 'utf-8'); //set response content
                        reject(content);
                        //console.log(content); //debug
                    });
                }
                else {
                    response.writeHead(404, { 'Content-Type': 'text/html' });
                    let content = `<!DOCTYPE html><html><head></head><body style='background-color:#101010 color:white;'><h1>Error: ${error.code}</h1></body></html>`
                    if(served?.pages?._all || served?.pages?.[message.route]) {
                        let {templateString, headers} = this.injectPageCode(content.toString(),message.route,served as any) as any;
                        content = templateString;
                    }
                    response.end(content,'utf-8');
                    reject(error.code);
                    //return;
                }
            }
            else { //other error
                response.writeHead(500); //set response headers
                response.end('Something went wrong: '+error.code+' ..\n','utf-8'); //set response content
                reject(error.code);
                //return;
                
            }
        }
        else { //file read successfully, serve the content back

            //set content type based on file path extension for the browser to read it properly
            var extname = String(path.extname(requestURL)).toLowerCase();

            var contentType = this.mimeTypes[extname] || 'application/octet-stream';

            let head = { 'Content-Type': contentType };

            if(contentType === 'text/html' && (served?.pages?._all || served?.pages?.[message.route])) {
                let {templateString, headers} = this.injectPageCode(content.toString(),message.route, served as any) as any;
                Object.assign(head, headers);
                content = templateString;
            }

            response.writeHead(200, head); //set response headers
            response.end(content, 'utf-8'); //set response content
            resolve(content);
            
            //console.log(content); //debug
            //return;
        }
    }

    //internal
    responsePromiseHandler = (resolve, reject, message, request:http.IncomingMessage, response:http.ServerResponse, method:string, served:ServerInfo) => {

        response.on('error', (err) => {
            if(served.debug) {
                let time = getHoursAndMinutes(new Date());
                console.error(time,'| Response Error: ', err, ' From: ', request.socket?.remoteAddress, ' For: ', request.url, ' | ', request.method);
            }
            this.responseOnErrorPromiseHandler(response, reject, err);
            request.destroy();
            request.socket?.destroy();
        });

        if(method === 'GET' || method === 'get') {
            //process the request, in this case simply reading a file based on the request url    
            var requestURL = '.' + request.url;
            if(request.url && this.restrict?.[request.url]) reject(request.url);

            if (requestURL == './' && served?.startpage) { //root should point to start page
                requestURL = served.startpage; //point to the start page
            }

            //lets remove ? mark url extensions for now
            if(requestURL.includes('?')) requestURL = requestURL.substring(0,requestURL.indexOf('?'));
            
            if((request.url !== '/' || served?.startpage) && fs.existsSync(path.join(process.cwd(),requestURL))) {
                if(response.writableEnded || response.destroyed) reject(requestURL);
                else {
                    //read the file on the server
                    fs.readFile(path.join(process.cwd(),requestURL), (error, content) => {
                        this.onRequestFileReadPromiseHandler(error, content, resolve, reject, requestURL, response, message, served);
                    });
                }
            } else if (message.route) {
                let route;
                if(served) {
                    let rt = `${served.port}/${message.route}`;
                    if(this.__node.nodes.get(rt)) route = rt
                }
                if(!route && this.__node.nodes.get(message.route)) route = message.route;
                
                if(route) {
                    let res:any;
                    if(message.method) {
                        res = this.handleMethod(route, message.method, undefined); //these methods are being passed request/response in the data here, post methods will parse the command objects instead while this can be used to get html templates or play with req/res custom callbakcs
                    }
                    else if (message.node) {
                        res = this.handleGraphNodeCall(message.node, undefined);
                    }
                    else res = this.handleServiceMessage({route,args:undefined,method:message.method});

                    if(res instanceof Promise) res.then((r) => {
                        if(served?.keepState) this.setState({[served.address]:res});
                        this.withResult(response,r,message);
                        resolve(res);
                        
                        //return;
                    })
                    else if(res) {
                        if(served?.keepState) this.setState({[served.address]:res});
                        this.withResult(response,res,message);
                        resolve(res);
                       // return;
                    } //else we can move on to check the get post
                }
                else if (message.redirect) {
                    response.writeHead(301, {'Location':message.redirect});
                    response.end();
                    resolve(true);
                } 
                else this.getFailedPromiseHandler(resolve,reject,requestURL,message,response,served);
            } else this.getFailedPromiseHandler(resolve,reject,requestURL,message,response,served);
        } else {
            //get post/put/etc body if any
            let requestBody;
            let timedOut = true;
            let timeout;

            request.on('data',(chunk)=>{ //https://nodejs.org/en/docs/guides/anatomy-of-an-http-transaction/
                if(!requestBody) requestBody = [] as any[];
                requestBody.push(chunk);
                if(timedOut) {
                    timedOut = false;
                    if(timeout) clearTimeout(timeout);
                }
            }).on('end',() => {
                this.handleBufferedPostBodyPromiseHandler(resolve,requestBody,message,response,served);
            });

            //timeout posts/puts/etc if no body
            timeout = setTimeout(() => { 
                if(timedOut) {
                    let errMessage = new Error(`Request timed out from | ${request.socket?.remoteAddress} | For: ${request.url} | ${request.method}`);
                    request.destroy(errMessage);
                    served.server.emit('clientError', errMessage, request.socket);
                    if(served.debug) {
                        console.error(errMessage);
                    }
                    reject(errMessage);
                }
            }, served.timeout ? served.timeout : 1000); //most likely an unhandled method

        }


    }

    request = ( 
        options:ReqOptions|any,
        send?:any,
        ondata?:(chunk:any)=>void,
        onend?:()=>void
    ) => {

        let client = http;
        
        if ((options.protocol as string)?.includes('https')) {
            client = https as any;
        }
    
        delete options.protocol;

        const req = client.request(options,(res)=>{
            if(ondata) res.on('data',ondata)
            if(onend) res.on('end',onend);
        });

        if(options.headers) {
            for(const head in options.headers) {
                req.setHeader(head,options.headers[head])
            }
        }

        if(send) req.write(send);
        req.end();

        return req;
    }

    POST = (
        url:string|URL,
        data:any,
        headers?:{
            'Content-Type'?:string,
            'Content-Length'?:number,
            [key:string]:any
        }
    ) => {

        let urlstring = url;
        if(urlstring instanceof URL) urlstring = url.toString();
        let protocol = urlstring.startsWith('https') ? 'https' : 'http';
        let host, port,path;
        let split = urlstring.split('/');
        split.forEach((s) => {
            if(s.includes(':')) {
                let ss = s.split(':');
                host = ss[0]; port = ss[1];
            }
        });

        if(split.length > 3) {
            path = split.slice(3).join('/');
        }

        let req = this.request(
            {
                protocol,
                host,
                port,
                path,
                method:'POST',
                headers
            },
            data
        );

        return req;
    }

    GET = (url:string|URL|http.RequestOptions) => {
        return new Promise<Buffer>((resolve, reject) => {
        
            let client = http;
        
            let urlstring = url;
            if(url instanceof URL) urlstring = url.toString();
            
            if ((urlstring as string).includes('https')) {
                client = https as any;
            }
        
            client.get(url, (resp) => {
            let chunks:any[] = [];
        
            // A chunk of data has been recieved.
            resp.on('data', (chunk) => {
                chunks.push(chunk);
            });
        
            // The whole response has been received. Print out the result.
            resp.on('end', () => {
                resolve(Buffer.concat(chunks));
            });
        
            }).on("error", (err) => {
                reject(err);
            });
        });
    }

    terminate = (served:string|ServerInfo) => {
        if(typeof served === 'string') served = this.servers[served];

        if(typeof served === 'object') {
            served.server.close();
            if(served.onclose) served.onclose(served);
        }
    }

    getRequestBody(req:http.IncomingMessage) {
        let chunks:any[] = [];
        return new Promise<Buffer>((resolve,reject) => {
            req.on('data',(chunk) => {
                chunks.push(chunk);
            }).on('end',() => {
                resolve(Buffer.concat(chunks));
            }).on('error',(er)=>{
                let errMessage = new Error(`Request timed out from | ${req.socket?.remoteAddress} | For: ${req.url} | ${req.method}`);
                req.destroy(errMessage);
                reject(errMessage);
            })
        });
    }

    //??? just need a way to pass a fake request/response in
    // spoofRequest = (url:string, body:any, type:string='json', server:http.Server|https.Server) => {
    //     return this.receive({
    //         route:url,
    //         args:{request:{
    //             url,
    //         } as http.IncomingMessage, response:{} as http.ServerResponse},
    //         method:'GET'
    //     })
    // }

    addPage = (path:string, template:string) => { //add an html page template as a get
        if(typeof template === 'string') {
            if(!template.includes('<html')) template = '<!DOCTYPE html><html>'+template+'</html>'; //add a root
        }
        if(typeof this.__node.roots?.[path] === 'object') {
            (this.__node.roots[path] as any).get = template;
            this.__node.nodes.get(path).get = template;
        }
        else this.load({
                [path]: {
                    get:template
                }
            });
    }

    addHTML = (path:string, template:string) => { //add an html component template e.g. route: component/button then set up logic to chain
        if(typeof template === 'string') {
            if(!template.includes('<') || (!template.includes('>'))) template = '<div>'+template+'</div>';
        }
        if(typeof this.__node.roots?.[path] === 'object') {
            (this.__node.roots[path] as any).get = template;
            this.__node.nodes.get(path).get = template;
        }
        else this.load({
                [path]: {
                    get:template
                }
            });
    }

    buildPage = (pageStructure:{[key:string]:{}|null|any} | string[] | string | ((...args:any)=>any), baseTemplate:string) => { //construct a page from available components, child component templates will be inserted before the last '<' symbol or at end of the previous string depending
        let result = ``; if(baseTemplate) result += baseTemplate;
        let appendTemplate = (obj:{[key:string]:{}|null|any}|string[],r:string|any, res:string) => {
            if(!Array.isArray(obj[r]) && typeof obj[r] === 'object') {
                for(const key in obj) {
                    appendTemplate(obj, key, res); //recursive append
                }
            } else if(this.__node.nodes.get(r)?.get) {
                let toAdd = this.__node.nodes.get(r)?.get;
                if(typeof toAdd === 'function') {
                    if(Array.isArray(obj[r])) {
                        toAdd = toAdd(...obj[r]);
                    }
                    else toAdd = toAdd(obj[r]);
                }
                if(typeof toAdd === 'string')  {
                    let lastDiv = res.lastIndexOf('<');
                    if(lastDiv > 0) {
                        let end = res.substring(lastDiv)
                        res = res.substring(0,lastDiv) + toAdd + end;
                    } else res += toAdd; 
                }
                
            } else if (this.__node.nodes.get(r)?.__operator) {
                let routeresult;
                if(this.__node.nodes.get(r)?.__operator) routeresult = this.__node.nodes.get(r).__operator(obj[r]); 
                if(typeof routeresult === 'string') {   
                    let lastDiv = res.lastIndexOf('<');
                    if(lastDiv > 0) {
                        let end = res.substring(lastDiv)
                        res = res.substring(0,lastDiv) + routeresult + end;
                    } 
                    else res += routeresult;
                    //console.log(lastDiv, res, routeresult)
                }
            } else if (typeof this.__node.nodes.get(r) === 'string') res += this.__node.nodes.get(r);
            return res;
        }

        if(Array.isArray(pageStructure)) {  
            pageStructure.forEach((r)=>{
                result = appendTemplate(pageStructure, r, result);
            })
        } else if (typeof pageStructure === 'object') {
            for(const r in pageStructure) {
                result = appendTemplate(pageStructure, r, result);
            }
        } else if (typeof pageStructure === 'string') result += pageStructure;
        else if (typeof pageStructure === 'function') result += pageStructure();
        return result;
    }

    hotreload = (socketURL:string|URL=`http://localhost:8080/wss`, esbuild_cssFileName?:string) => { 
        if(socketURL instanceof URL) socketURL = socketURL.toString();


        const HotReloadClient = (socketUrl, esbuild_cssFileName) => {
            //hot reload code injected from backend
            //const socketUrl = `ws://${cfg.host}:${cfg.hotreload}`;
            let socket = new WebSocket(socketUrl);
        
        
            function reloadLink(file?) {
        
              let split = file.includes('/') ? file.split('/') : file.split('\\');
              let fname = split[split.length-1];
        
              var links = document.getElementsByTagName("link") as any as HTMLLinkElement;
              for (var cl in links)
              {
                  var link = links[cl];
        
                  if(!file || link.href?.includes(fname)) {
                    let href = link.getAttribute('href')
                                                    .split('?')[0];
                              
                    let newHref = href += "";
        
                    link.setAttribute('href', newHref);

                  }
              }
            }
        
        
            function reloadAsset(file, reloadscripts?, isJs?) { //reloads src tag elements
              let split = file.includes('/') ? file.split('/') : file.split('\\');
              let fname = split[split.length-1];
              let elements = document.querySelectorAll('[src]') as any as HTMLScriptElement[];
              let found = false;
              for(const s of elements) {
                if(s.src.includes(fname)) { //esbuild compiles entire file so just reload app
                  if(s.tagName === 'SCRIPT' && !reloadscripts) {//&& s.tagName === 'SCRIPT'
                    window.location.reload();
                    return;
                  } else {
                    let placeholder = document.createElement('object');
                    s.insertAdjacentElement('afterend', placeholder);
                    s.remove();
                    let elm = s.cloneNode(true) as HTMLElement;
                    placeholder.insertAdjacentElement('beforebegin',elm);
                    placeholder.remove();
                    found = true;
                  }
                }
              }
              if(!found) window.location.reload();
            }
        
                
            socket.addEventListener('message',(ev) => {
                let message = ev.data;
        
                if(typeof message === 'string' && message.startsWith('{')) {
                message = JSON.parse(message);
                }
                if(message.file) {
                let f = message.file;
                let rs = message.reloadscripts;
                if(f.endsWith('html') || f.endsWith('xml') || f.endsWith('wasm')) { //could add other formats
                    window.location.reload();
                } else if(f.endsWith('css')) {
                    if(!esbuild_cssFileName.endsWith('css')) esbuild_cssFileName += '.css';
                    reloadLink(esbuild_cssFileName); //reload all css since esbuild typically bundles one file same name as the dist file
                } else if (f.endsWith('js') || f.endsWith('ts') || f.endsWith('jsx') || f.endsWith('tsx') || f.endsWith('vue')) { //IDK what other third party formats would be nice to haves
                    reloadAsset(f, rs);
                } else {
                    //could be an href or src
                    reloadLink(f);
                    reloadAsset(f);
                }
                }
            });
  
  
            socket.addEventListener('close',()=>{
              // Then the server has been turned off,
              // either due to file-change-triggered reboot,
              // or to truly being turned off.
          
              // Attempt to re-establish a connection until it works,
              // failing after a few seconds (at that point things are likely
              // turned off/permanantly broken instead of rebooting)
              const interAttemptTimeoutMilliseconds = 100;
              const maxDisconnectedTimeMilliseconds = 3000;
              const maxAttempts = Math.round(maxDisconnectedTimeMilliseconds/interAttemptTimeoutMilliseconds);
              let attempts = 0;
              const reloadIfCanConnect = ()=>{
                attempts ++ ;
                if(attempts > maxAttempts){
                  console.error("Could not reconnect to dev server.");
                  return;
                }
                socket = new WebSocket(socketUrl);
                socket.onerror = (er) => {
                  console.error(`Hot reload port disconnected, will reload on reconnected. Attempt ${attempts} of ${maxAttempts}`);
                }
                socket.addEventListener('error',()=>{
                  setTimeout(reloadIfCanConnect,interAttemptTimeoutMilliseconds);
                });
                socket.addEventListener('open',()=>{
                  location.reload();
                });
              };
              reloadIfCanConnect();
            });
        }
        
        return `
            <script>
                console.log('Hot Reload port available at ${socketURL}');  
                (`+HotReloadClient.toString()+`)('${socketURL}',${esbuild_cssFileName ? `'${esbuild_cssFileName}'` : undefined}); 
            </script>
        `;
    }

    pwa = (pwaName = "PWA", cacheExpirationDays=4/24, serviceWorkerUrl="service-worker.js") => {

        //check for serviceWorkerUrl, if none install the default template
        if(!fs.existsSync(serviceWorkerUrl)) {
            fs.writeFileSync(path.join(process.cwd(),serviceWorkerUrl), defaultServiceWorker(cacheExpirationDays));
        }
        if(!fs.existsSync('manifest.webmanifest')) {
            fs.writeFileSync(path.join(process.cwd(),'/manifest.webmanifest'), defaultManifest(pwaName));
        }

        function ServiceWorkerInstaller(serviceWorkerUrl) {
            // Check that service workers are supported

            if(!Array.from(document.head.querySelectorAll('link')).find((elm:HTMLLinkElement) => {
                if(elm.href.includes('manifest')) return true;
            })) {
                document.head.insertAdjacentHTML('beforeend',`<link rel="manifest" href="./manifest.webmanifest">`)
            }

            const isLocalhost = Boolean(
                window.location.hostname === 'localhost' ||
                  // [::1] is the IPv6 localhost address.
                  window.location.hostname === '[::1]' ||
                  // 127.0.0.1/8 is considered localhost for IPv4.
                  window.location.hostname.match(
                    /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
                  )
            );

            function registerSW() {
                navigator.serviceWorker
                .register(serviceWorkerUrl)
                .then(registration => {
                    registration.onupdatefound = () => {
                      const installingWorker = registration.installing;
                      if (installingWorker == null) {
                        return;
                      }
                      installingWorker.onstatechange = () => {
                        if (installingWorker.state === 'installed') {
                          if (navigator.serviceWorker.controller) {
                            // At this point, the updated pre-cached content has been fetched,
                            // but the previous service worker will still serve the older
                            // content until all client tabs are closed.
                            console.log(
                              'New content is available and will be used when all tabs for this page are closed.'
                            );
              
                          } else {
                            // At this point, everything has been pre-cached.
                            // It's the perfect time to display a
                            // "Content is cached for offline use." message.
                            console.log('Content is cached for offline use.');
              
                          }
                        }
                      };
                    };
                })
                .catch(error => {
                    console.error('Error during service worker registration:', error);
                });
            }

            if ("serviceWorker" in navigator) addEventListener('load', () => {
                if(isLocalhost) {
                    // Add some additional logging to localhost, pointing developers to the
                    
                    // Check if the service worker can be found. If it can't reload the page.
                    fetch(serviceWorkerUrl)
                    .then(response => {
                        // Ensure service worker exists, and that we really are getting a JS file.
                        const contentType = response.headers.get('content-type');
                        if (
                        response.status === 404 ||
                        (contentType != null && contentType.indexOf('javascript') === -1)
                        ) {
                        // No service worker found. Probably a different app. Reload the page.
                        navigator.serviceWorker.ready.then(registration => {
                            registration.unregister().then(() => {
                                window.location.reload();
                            });
                        });
                        } else {
                        // Service worker found. Proceed as normal.
                            registerSW();
                        }
                    })
                    .catch(() => {
                        console.log(
                        'No internet connection found. App is running in offline mode.'
                        );
                    });
                    
                    // service worker/PWA documentation.
                    navigator.serviceWorker.ready.then(() => {
                        console.log('This web app is being served cache-first by a service worker.');
                    });
                }
                else {
                    registerSW();
                } 
            });
        }

        return `
            <script>
                (`+ServiceWorkerInstaller.toString()+`)('${serviceWorkerUrl}'); 
            </script>
        `;
    }

}



function getPageOptions(url, received, pages, request, response, port) {
    let pageOptions = pages[url];
    let key = url;
    //check alternative page definition keys
    if(!pageOptions) { 
        let url2 = '/'+url; // e.g. '/home'
        pageOptions = pages[url2]; 
        key = url2;
        if(!pageOptions && !path.extname(url)) {
            let split = url.split('/');
            key = split[0]+'/*';
            if(pages[key]) { // e.g. /* or home/*
                pageOptions = pages[key];
                received.route = key;
                request.url = key;
            } else { 
                // e.g. /home with /* specified, or /home/* etc.
                let spl = url2.split('/'); //split the modified string so the beginning is a blank string
                spl[spl.length-1] = ''; //replace with empty string e.g. /home -> ['','']
                key = spl.join('/')+'*'; //now merge url
                if(pages[key]) {
                    pageOptions = pages[key];
                    received.route = key;
                    request.url = key;
                } 
            }
        } else {
            received.route = url2;
            request.url = url2;
            
        }
    } else {
        received.route = url;
        request.url = url;
    }
    if(typeof pageOptions === 'object') {
        if((pageOptions as any).redirect) {
            url = (pageOptions as any).redirect;
            received.redirect = url;
            received.route = url;
        }
        if((pageOptions as any).onrequest) {
            if(typeof (pageOptions as any).onrequest === 'string') {
                (pageOptions as any).onrequest = this.__node.nodes.get((pageOptions as any).onrequest);
            }
            if(typeof (pageOptions as any).onrequest === 'object') {
                if((pageOptions as any).onrequest.__operator) {
                    ((pageOptions as any).onrequest as GraphNode).__operator(pageOptions, request, response);
                } 
            } else if(typeof (pageOptions as any).onrequest === 'function') {
                (pageOptions as any).onrequest(
                    this, 
                    this.__node.nodes.get(`${port}/${key}`), 
                    request, 
                    response
                );
            }
        }
    }

    return pageOptions;
}




function getHoursAndMinutes(date) {
    let hours = date.getHours();
    let minutes = date.getMinutes();

    // Convert the hours and minutes to two digits
    hours = hours < 10 ? '0' + hours : hours;
    minutes = minutes < 10 ? '0' + minutes : minutes;

    return `${hours}:${minutes}`;
}
