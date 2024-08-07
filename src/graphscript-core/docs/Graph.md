# Graphs

The Graph and GraphNode classes are an implementation of the acyclic graphs and node-based hierarchical programming. You can design control workflows very easily this way. Essentially we are providing a general workflow programming model within javascript for pipes and stately programming and more imposed as needed. It is one that requires very little mental workload to jump into and takes care of the sync/async connectivity between your program modules for you.


### First Steps

To create a Graph, simply declare an object as your "roots" or your program hierarchy with lists of node definitions, then load it into the graph. After that your nodes become interactive through both the definition objects and through accessors on the Graph instance.

```ts

import {Graph} from 'graphscript'


let nodeA = {
        x:5,
        y:2,
        jump:()=>{console.log('jump!'); return 'jumped!'; },
        __listeners:{
            'nodeB.x':'jump', //string listeners in a scope are methods bound to 'this' node
            'nodeB.nodeC':function(op_result){console.log('nodeA listener: nodeC operator returned:', op_result, this)},
            'nodeB.nodeC.z':function(newZ){console.log('nodeA listener: nodeC z prop changed:', newZ, this)},
        }
};

let nodeB = {
        x:3,
        y:4,
        __children:{
                nodeC:{
                    z:4,
                    __operator:function(a) { this.z += a; console.log('nodeC operator: nodeC z prop added to',this); return this.z; },
                    __listeners:{
                        'nodeA.x':function(newX) { console.log('nodeC listener: nodeA x prop updated', newX);},
                        'nodeA.jump':function(jump) { 
                            console.log('nodeC listener: nodeA ', jump);
                        }
                    }
                }
            }
};

let roots = {
    nodeA,
    nodeB
};

let graph = new Graph({ roots });


nodeB.x += 1; //should trigger nodeA listener 'nodeB.x'

nodeB.__children.nodeC.z *= 5; //should trigger nodeA listener 'nodeB.nodeC.z'

graph.get('nodeB.nodeC').__operator(5); //should trigger nodeA listeners 'nodeB.nodeC.z' and 'nodeB.nodeC'

```

Why would you do this? Well the more you script things in software, the more you'll find yourself retreading the same problems over and over again to set up your states, run asynchronous tasks, and build functional abstraction layers for all of your different code pieces to talk to each other. Each time it often leads to nontrivial solutions that work for your particular use case but might be a bit nonsensical coming from the outside or nonreusable. Imposing a little bit of a general theoretical programming structure here, i.e. graph theory, can go a long ways to simplifying APIs and improving performance across the board. Javascript lends itself well to this with it's inherent dynamic programming and object oriented scoping that you can easily pass-by-reference. 

Javascript has hundreds of features for you to, well, script your web pages and applications. We can synthesize it into a properly generalized game engine sandbox format for workflow programming and software construction that does not burden the developer with heavy abstractions or leave you lost with how to connect separate modules. It makes life much better for developers and code far more readable and reusable. This should lead to quality improvements in general in our products as less time gets lost on the menial labor of debugging our own custom business logic that nobody else can read or use, and more on actually creating usable systems that you know will slot in with the rest of your own or others' programs from the outset. 

We have a synthesis of this idea we're calling a form of "graph script" which provides a simple way to link functions, objects, modules, scopes, etc. in your program in an object tree that imbues these objects with state and listener powers - and much more - on an acyclic graph abstraction with very minimal overhead and constraints. This is a minimal workflow programming implementation that respects javascript's robust offerings without getting in the way, and allows for all kinds of combination and composition.



### Graph Node Properties

Graph nodes can have many properties, and even more if you specify loaders on the Graph (see below).

```ts
type GraphNodeProperties = {
    __props?:Function|{[key:string]:any}|GraphNodeProperties|GraphNode, //Proxy objects or from a class constructor function (calls 'new x()') or an object we want to proxy all of the methods on this node. E.g. an html element gains 'this' access through operators and listeners on this node.
    __operator?:((...args:any[])=>any)|string, //The 'main' function of the graph node, children will call this function if triggered by a parent. Functions passed as graphnodeproperties become the operator which can set state.
    __children?:{[key:string]:any}, //child nodes belonging to this node, e.g. for propagating results
    __listeners?:{[key:string]:true|string|((result)=>void)|{__callback:string|((result)=>void)|true, subInput?:boolean,[key:string]:any}}|{[key:string]:((result)=>void)|true|string}, //subscribe by tag to nodes or their specific properties and method outputs
    __onconnected?:((node)=>void|((node)=>void)[]), //what happens once the node is created?
    __ondisconnected?:((node)=>void|((node)=>void)[]), //what happens when the node is deleted?
    __node?:{ //node specific properties, can contain a lot more things
        tag?:string,
        state?:EventHandler, //by default has a global shared state
        [key:string]:any
    },
    __args?:any[], //can structure input arguments, include '__result' when generically calling operators for where to pass the original input in in a set of arguments
    __callable?:boolean, //we can have the graphnode return itself as a callable function with private properties
    [key:string]:any
}
```

One special property to note here is `__props`. If you provide an object, class instance, or class constructor function (to be instanced) under `__props`, all of the object's methods will be made available by proxy on the graph node. This enables the proxied object to be mutated by the node as its own properties, e.g. to control an HTML node within the graph node scope. E.g. setting `__props:document.body` then with the resulting node setting  `node.style.backgroundColor = 'black'` should turn the page black, because the node is acting as the referenced HTML node now.

Other important properties to note are the `__listeners` and the `__operator`. 
Listeners allow subscribing to the results of node operator and arbitrary method outputs - including promise results - and changes to object variables to be subscribed to e.g. numbers or strings that get updated (e.g. velocity, text inputs). To subscribe to nodes, you simply call `graph.subscribe(nodeOrTag,callback)` The callback can be any function, node, or node tag so you can simply pass strings in to initiate subscriptions. They will clean themselves up when nodes are removed from the graph. 

When a node is subscribed to it enhances itself with getters and setters that allow changes to set state automatically, including for results of async functions so you can work with sync and async processes the same way. To avoid excessive copying, state is only set on changes that have active subscriptions with a simple boolean. 

The `__operator` is where default functions for nodes are stored. This lets you pass class methods in for instance as node definitions and then they can gain state and listener access across the program. Arrow functions on classes are nice because they will remain bound to their parent class instance even when applied to nodes. We use this extensively to subscribe across remote endpoints to outputs of specific methods or arbitrary states e.g. a game state. 

The `__callable` property will be applied to nodes when functions are provided as property definitions, this means nodes will appear as if they are functions and all properties will be private (but still there and subscribable on trees!). This can help you make your node trees look more functional and call operators like `node(1)`.

### Graph Options

Graphs also have several options:
```ts

type Loader = (
    node:GraphNode,
    parent:Graph|GraphNode,
    graph:Graph,
    roots:any,
    properties:GraphNodeProperties,
    key:string
)=>void;

type GraphOptions = {
    roots?:{[key:string]:any}, //node definitions, the 'forest'
    loaders?:{
        [key:string]:Loader | {
                init?:Loader, 
                connected?:(node)=>void,  //can specify onconnected and ondisconnected attributes in loaders for a quicker fix
                disconnected?:(node)=>void
            }
        },
    state?:EventHandler,
    mapGraphs?:false, //if adding a Graph as a node, do we want to map all the graph's nodes with the parent graph tag denoting it (for uniqueness)?
    [key:string]:any
}
```

[Loaders](../Loaders.ts) are important and allow for as many complex behaviors to be defined as you desire when running the node load order. After the node is defined it will run each loader function that has been supplied. This makes it so you can quickly specify new properties and usages of the node hierarchies.

### Loaders and more

With additional [loaders](../Loaders.ts), we can quickly turn nodes into self contained loops and animations, html nodes, threads and thread-thread message ports, server endpoints, user representations, and more so we can quickly script out very complex programs, with a simple reference point to remix these features via the application trees. We can also export these node definitions as their own esm modules for easy module development.

Featured Loaders:

- [html](../loaders/html/html.loader.ts): create any html nodes and template string web components. The node properties are treated as setters for the html element if they overlap, so you can set innerHTML or events right on the node definition in one pass.

The most complex examples we have so far do things like relay P2P initial connections through a socket backend, animate tens of thousands of boids with multiple threads, and process and debug sensor data with 8 separate task threads. 

Each example is only a few hundred lines of code and roughly understandable in one pass at reading.

Here is a bigger graph from [`examples/graph`](../examples/graph/):

```ts

import {Graph, loaders} from 'graphscript'

let roots = {

    nodeA: {
        x:5,
        y:2,
        jump:()=>{console.log('jump!'); return 'jumped!'; },
        __listeners:{
            'nodeB.x':'jump', //string listeners in a scope are methods bound to 'this' node
            'nodeB.nodeC':function(op_result){console.log('nodeA listener: nodeC operator returned:', op_result, this)},
            'nodeB.nodeC.z':function(newZ){console.log('nodeA listener: nodeC z prop changed:', newZ, this)},
            'nodeE': 'jump'
        }
    },

    nodeB:{
        x:3,
        y:4,
        __children:{
                nodeC:{
                    z:4,
                    __operator:function(a) { this.z += a; console.log('nodeC operator: nodeC z prop added to',this); return this.z; },
                    __listeners:{
                        'nodeA.x':function(newX) { console.log('nodeC listener: nodeA x prop updated', newX);},
                        'nodeA.jump':function(jump) { 
                            console.log('nodeC listener: nodeA ', jump);
                        }
                    }
                }
            }
    },

    nodeD:(a,b,c)=>{ return a+b+c; }, //becomes the .__operator prop and calling triggers setState for this tag (or nested tag if a child)

    nodeE:{
        __operator:()=>{console.log('looped!'); return true;},
        __node:{ //more properties
            loop:1000, //default loaders include this, allowing you to define a timer loop
            looping:true //start looping as soon as the node is defined?
        }
    },

    nodeF:{ //this is a way to control HTML nodes
        __props:document.createElement('div'), //properties on the '__props' object will be proxied and mutatable as 'this' on the node. E.g. for representing HTML elements
        __onconnected:function (node) { 
            this.innerHTML = 'Test';
            this.style.backgroundColor = 'green'; 
            document.body.appendChild(this.__props); 
            console.log(this,this.__props);
        },
        __ondisconnected:function(node) {
            document.body.removeChild(this.__props);
        }
        
    },

    nodeG:class nodeDefinition { //use class constructors instead of objects for instancing node copies easily
        __operator = () => {
            console.log('class instanced node called!')
        }
    }

};

let graph = new Graph({
    roots,
    loaders
});


```

In the above example, one interesting thing we can do is proxy methods on an object using __props, this lets us treat an html element as if it's a node, meaning these properties can be listened to by other nodes in the graph. Import the [htmlloader](../services/dom/html.loader.ts) for a special node definition for working with html and web components.

We took this much further by unifying Graphs with a uniform message passing system via Services, allowing for complex multithreading and backend + frontend workflows to be constructed very clearly within a few hundred lines of code. With this we have created a graph-based full stack API for browser frontend and node backend development. There is much more to come. See [Services](./Service.md)