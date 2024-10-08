import { DataTablet, DS } from './datastructures/index'
import { Data, ProfileStruct, AuthorizationStruct, GroupStruct, DataStruct, EventStruct, ChatroomStruct, CommentStruct, Struct, NotificationStruct } from './datastructures/types';
import { genTimestampFromString, TimeSpecifier } from './genTimestamps'
import { Service } from "../graphscript-core/index";
import { User } from "../graphscript-router/index";
import { GraphNodeProperties } from "../graphscript-core/index";

export const randomId = (prefix?) => ((prefix) ? `${prefix}` : '')  + Math.floor(1000000000000000*Math.random())

export const pseudoObjectId = (m = Math, d = Date, h = 16, s = s => m.floor(s).toString(h)) => //the fuck?
    s(d.now() / 1000) + ' '.repeat(h).replace(/./g, () => s(m.random() * h))

//intended for use with a UserRouter

export type StructFrontendProps = {
    useAccessTokens?:boolean,
    useRefreshTokens?:boolean
} & GraphNodeProperties


//TODO SIGN IN SYSTEM WORKFLOW AUTOMATION, THIS IS STILL PRETTY MANUAL

export class StructFrontend extends Service {
    name='structs'

    currentUser: User //user from the endpoint service (e.g. websockets, Router) whose endpoints we want to use 
    tablet = new DataTablet(); //DataTablet 
    collections = this.tablet.collections;
    id: string = randomId()

    useAccessTokens=false;
    useRefreshTokens=false;

    constructor(
        options?:any,
        user?:Partial<User>
    ) {
        super(options);
        this.load(this);

        if(options.useAccessTokens) this.useAccessTokens = options.useAccessTokens;
        if(options.useRefreshTokens) this.useRefreshTokens = options.useRefreshTokens;

        if(user instanceof Object && Object.keys(user).length > 0) 
            this.setupUser(user); // Declares currentUser
    }

    getToken(user:Partial<ProfileStruct>) {
        if(this.useAccessTokens) return user.accessToken;
        else if (this.useRefreshTokens) return user.refreshToken;
    }

    //TODO: make this able to be awaited to return the currentUser
    //uses a bunch of the functions below to set up a user and get their data w/ some cross checking for consistent profiles
    setupUser = async(userinfo:Partial<User>, callback=(currentUser)=>{}) => {
        
        if(!userinfo) {
            console.error('must provide a minimum info object! e.g. {_id:"abc123"}');
            callback(undefined);
            return undefined;
        }
        let changed = false;

        if(userinfo.id && !userinfo._id) (userinfo._id as any) = userinfo.id;
        else if (userinfo._id) userinfo.id = userinfo._id;

        // let res = await this.login();
        //console.log("Generating/Getting User: ", userinfo._id)

        //console.log('getting user');
        let res = await this.getUser(userinfo._id);
        //console.log('setting user');
        let user = res?.user;
        // console.log('user gotten', user)
        // console.log("getUser", user);
        let u;
        let newu = false;
        
        //console.log('getUser result',user);
        
        if(!user || !user._id) { //no profile, create new one and push initial results
            // if(!userinfo._id) userinfo._id = userinfo._id;
            u = this.userStruct(userinfo,false);
            newu = true;
            let wasSet = await this.setUser(u);
            let structs = this.getLocalData(undefined,{'ownerId': u._id});
            if(structs?.length > 0) this.updateServerData(structs);//, 
            //     (data)=>{
            //     console.log('setData', data);
            // }

            this.setAuthorizationsByGroup(u);
        }
        else {
            u = user;

            let toUpdate = {_id:userinfo._id, ownerId: userinfo._id};
            let struct = this.userStruct(userinfo,false);
            for(const key in struct) {
                if((userinfo[key] && user[key] !== userinfo[key])) {
                    toUpdate[key] = userinfo[key];
                    user[key] = userinfo[key];
                }
                else if(struct[key] && !user[key]) {
                    toUpdate[key] = struct[key];
                    user[key] = struct[key];
                }
            }

            if(Object.keys(toUpdate).length > 2) await this.setUser(toUpdate as any);
            // u._id = user._id; //replace the unique mongo id for the secondary profile struct with the id for the userinfo for temp lookup purposes

            if(res?.authorizations){
                if(Array.isArray(res.authorizations)) {
                    this.setLocalData(res.authorizations);
                }
            }

            if (res?.groups){
                if(Array.isArray(res.groups)) {
                    this.setLocalData(res.groups);
                }
            }
        }

        if(newu) {this.setLocalData(u);}
        else {
            let data = await this.getAllUserData(u._id,undefined, [genTimestampFromString('last day'),Date.now()]); //todo: only query latest data

            //console.log("getServerData", data);
            if(!data || data.length === 0) { 
            } else {
                this.setLocalData(data);
                
                //resolve redundant notifications
                //console.log('DATA',data);
                let notes = data.filter((s) => {
                    if(s.structType === 'notification') {
                        if(this.getLocalData('authorization',s.parent._id)) {  
                            return true;
                        }
                        if(s.parent.structType === 'user' || s.parent.structType === 'authorization') {
                            return true;
                        }
                        if(!this.getLocalData(s.parent.structType,s.parent._id))
                            return true;
                    }
                });

                //resolves extraneous comments
                let comments = data.filter((s) => {
                    if(s.structType === 'comment') {                           
                        return true;
                    }
                });

                let toDelete:any[] = [];
                comments.forEach((comment) => {
                    if(!this.getLocalData('comment',{'_id':comment._id})) toDelete.push(comment._id);
                });
                if(toDelete.length > 0) this.deleteData(toDelete); //extraneous comments

                //console.log('data:', data, 'resolve notifications:', notes);
                if(notes.length > 0) {
                    this.resolveNotifications(notes, false, undefined);
                    changed = true;
                }

                let filtered = data.filter((o) => {
                    if(o.structType !== 'notification') return true;
                });

                if(this.tablet) this.tablet.sortStructsIntoTable(filtered);

            }

            // u = new UserObj(u)
            // u = getUserCodes(u, true)
            this.setLocalData(u); //user is now set up in whatever case 
            //console.log('collections', this.tablet.collections);
        }
        //console.log('u::',u)
        if(u)  {
            if(this.currentUser) Object.assign(this.currentUser,u);
            else this.currentUser = u;  
            callback(this.currentUser);
            //console.log('currentUser', u)
            return this.currentUser;
        } else {
            callback(u);
            return u;
        }
    }

    //default socket response for the platform
    baseServerCallback = async (data) => {
        let structs = data;
        if(typeof data === 'object' && data?.structType) structs = [data];
        if(Array.isArray(structs)) { //getUserData response
            
            let filtered = structs.filter((o) => {
                if(o.structType !== 'notification') return true;
            });

            if(this.tablet) this.tablet.sortStructsIntoTable(filtered);

            for(let i = 0; i < structs.length; i++) {
                const struct = structs[i];
                if(typeof struct === 'object') {
                    if((!struct.structType) || struct.structType === 'USER') {
                        // console.log(struct)
                        if(struct.email) struct.structType = 'user';
                        else struct.structType = 'uncategorized';
                    }
                    if(struct.structType === 'user' || struct.structType === 'authorization' || struct.structType === 'group') {
                        if(struct.structType === 'user') {
                            struct._id = struct.id; //replacer
                            // struct = new UserObj(struct); // set user obj
                            // struct = getUserCodes(struct, true);
                        }
                        else if (struct.structType === 'group') {
                            if(this.currentUser) {
                                let uset = false;
                                if(struct.admins[this.currentUser?._id as string] && !this.currentUser.userRoles?.[struct.name+'_admin']) {
                                    (this.currentUser.userRoles as any)[struct.name+'_admin'] = true;
                                    uset = true;
                                }
                                else if (!struct.admins[this.currentUser?._id as string] && this.currentUser.userRoles?.[struct.name+'_admin']) {
                                    delete this.currentUser.userRoles[struct.name+'_admin'];
                                    uset = true;
                                }
                                if(struct.admins[this.currentUser?._id as string] && !this.currentUser.userRoles?.[struct.name+'_peer']) {
                                    (this.currentUser.userRoles as any)[struct.name+'_peer'] = true;
                                    uset = true;
                                }
                                else if (!struct.admins[this.currentUser?._id as string] && this.currentUser.userRoles?.[struct.name+'_peer']) {
                                    delete this.currentUser.userRoles[struct.name+'_peer'];
                                    uset = true;
                                }if(struct.admins[this.currentUser?._id as string] && !this.currentUser.userRoles?.[struct.name+'_client']) {
                                    (this.currentUser.userRoles as any)[struct.name+'_client'] = true;
                                    uset = true;
                                }
                                else if (!struct.admins[this.currentUser?._id as string] && this.currentUser.userRoles?.[struct.name+'_client']) {
                                    delete this.currentUser.userRoles[struct.name+'_client'];
                                    uset = true;
                                }
                                if(uset) await this.setUser(this.currentUser as any); //update roles
                            }
                        }
                        this.setLocalData(struct);
                    } else {

                        if(struct.structType === 'notification') {
                            let found = this.getLocalData('notification',{'ownerId': struct.ownerId, '_id':struct.parent._id});
                            if(found) {
                                this.setLocalData(struct);
                            } else {
                                if(this.getLocalData(struct.structType,{'_id':struct.parent._id})) {
                                    //this.resolveNotifications([struct],false);
                                } else {
                                    this.overwriteLocalData(struct);
                                }
                            }

                            // TODO: Ignores notifications when the current user still has not resolved
                            if(struct.ownerId === this.currentUser?._id && 
                                (struct.parent.structType === 'user' || //all of the notification instances we want to pull automatically, chats etc should resolve when we want to view/are actively viewing them
                                struct.parent.structType === 'dataInstance'  || 
                                struct.parent.structType === 'schedule'  || 
                                struct.parent.structType === 'authorization')
                            ) {
                                await this.resolveNotifications([struct],true);
                            }

                            this.onNotify(struct);
                        } else { 
                            this.overwriteLocalData(struct);
                            //console.log(struct)
                        }
                    }
                }

            }
                
        } 

        this.onData(data);
    }

    structNotification = () => {
        //console.log('struct notifications')
        this.checkForNotifications();
    }

    structDeleted = (struct:{_id:string,structType:string}) => {
       this.deleteLocalData([struct]); //remove local instance
    }

    //just a customizable callback to preserve the default while adding your own
    onData = (data) => {
        
    }

    onNotify = (notification:NotificationStruct) => {

    }

    //---------------------------------------------
    
    randomId(tag = '') {
        return `${tag+Math.floor(Math.random()+Math.random()*Math.random()*10000000000000000)}`;
    }    

    //generically add any struct to a user's server data

    /**
        let struct = {
            _id: randomId(structType+'defaultId'),   //random id associated for unique identification, used for lookup and indexing
            structType: structType,     //this is how you will look it up by type in the server
            ownerId: parentUser?._id,     //owner user
            timestamp: Date.now(),      //date of creation
            parent: {structType:parentStruct?.structType,_id:parentStruct?._id}, //parent struct it's associated with (e.g. if it needs to spawn with it)
        }
     */
    addStruct = async (
        structType:string='struct', 
        props:any={}, //add any props you want to set, adding users[] with ids will tell who to notify if this struct is updated
        parentUser?:{[key:string]:any}, 
        parentStruct?:{[key:string]:any},
        updateServer:boolean = true
    ) => {
        let newStruct = DS.Struct(structType, props, parentUser, parentStruct);

        if(updateServer) newStruct = await this.updateServerData([newStruct])[0];

        return newStruct;
    }

    //info can be email, id, username, or name. Returns their profile and authorizations
    getUser = async (info:string|number='', basicInfo?:boolean, callback=this.baseServerCallback) => {
        console.log(this.currentUser);
        if(this.currentUser?.request) {
            let res = (await this.currentUser.request({route:'getUser', args:[this.currentUser._id, info, basicInfo, this.getToken(this.currentUser)]}));
            callback(res);
            return (res as {user:ProfileStruct, groups:GroupStruct[], authorizations:AuthorizationStruct[]} | undefined);
        }
    }

    //safely query user basic identification info for lookup
    queryUsers = async (
        info:string, //name, email, username, etc
        skip?:number,
        limit?:number,
        callback=this.baseServerCallback
    ) => {
        if(this.currentUser?.request) {
            let res = (await this.currentUser.request({route:'queryUsers', args:[
                this.currentUser._id, 
                info,
                skip,
                limit,
                undefined, 
                this.getToken(this.currentUser)
            ]})) // Pass Array
            callback(res);
            return res
        }
    }

    //get user basic info by id
    getUsers = async (ids:(string|number)[]=[], basicInfo?:boolean, callback=this.baseServerCallback) => {
        if(this.currentUser?.request) {
            let res = (await this.currentUser.request({route:'getUsersByIds', args:[this.currentUser._id, ids, basicInfo]})) // Pass Array
            callback(res);
            return res
        }
    }
    
    //info can be email, id, username, or name. Returns their profile and authorizations
    getUsersByRole = async (userRole:string,callback=this.baseServerCallback) => {
        if(this.currentUser?.request) {
            let res = (await this.currentUser.request({route:'getUsersByRole', args:[this.currentUser._id, userRole]}));
            callback(res)
            return res
        }
    }

    //pull all of the collections (except excluded collection names e.g. 'groups') for a user from the server
    getAllUserData = async (ownerId:string|number, excluded:any[]=[], timeRange?:[number|TimeSpecifier,number|TimeSpecifier], callback=this.baseServerCallback) => {
        if(timeRange) {
            if(typeof timeRange[0] === 'string') timeRange[0] = genTimestampFromString(timeRange[0]);
            if(typeof timeRange[1] === 'string') timeRange[1] = genTimestampFromString(timeRange[1]);
        }
        if(this.currentUser?.request) {
            let res = (await this.currentUser.request({route:'getAllData', args:[this.currentUser._id, ownerId, excluded, timeRange, this.getToken(this.currentUser)]} ));
            callback(res)
            return res
        }
    }

    query = async (collection:string, mongoQuery={}, findOne=false, skip=0, callback=this.baseServerCallback) => {
        if(this.currentUser?.request) {
            if(!collection || !mongoQuery) return undefined;
            let res = (await this.currentUser.request({route:'query',args:[this.currentUser._id, collection, mongoQuery, findOne, skip, this.getToken(this.currentUser)]} ));
            if(typeof callback === 'function') callback(res);
            return res;
        }
    }

    //get data by a range of time via utcTimeStamps, default key is timestamp
    getDataByTimeRange(collection, timeRange:[number|TimeSpecifier,number|TimeSpecifier], ownerId?:string|number|undefined, limit:number=0, skip:number=0, key?:string) {
        let query = {} as any;
        if(timeRange) {
            if(typeof timeRange[0] === 'string') timeRange[0] = genTimestampFromString(timeRange[0]);
            if(typeof timeRange[1] === 'string') timeRange[1] = genTimestampFromString(timeRange[1]);
        } 
        let range = {$gt:timeRange[0],$lt:timeRange[1]}
        if(key) query[key] = range;
        else query.timestamp = range;
        return this.getData(collection, ownerId, query, limit, skip);
    }

    //get data by specified details from the server. You can provide only one of the first 3 elements. The searchDict is for mongoDB search keys
    getData = async (collection:string, ownerId?:string|number|undefined, searchDict?, limit:number=0, skip:number=0, callback=this.baseServerCallback) => {
        if(this.currentUser?.request) {
            let res = (await this.currentUser.request({route:'getData', args:[this.currentUser._id, collection, ownerId, searchDict, limit, skip, this.getToken(this.currentUser)]}));//?.[0]
            //console.log('GET DATA RES', res, JSON.stringify(collection), JSON.stringify(ownerId));
            if(typeof callback === 'function') callback(res);
            return res;
        }
    }

    //get data by specified details from the server. You can provide only one of the first 3 elements. The searchDict is for mongoDB search keys
    getDataByIds = async (structIds:any[]=[],ownerId?:string|number|undefined,collection?:string|undefined,callback=this.baseServerCallback) => {
        if(this.currentUser?.request) {
            let res = (await this.currentUser.request({route:'getDataByIds', args:[this.currentUser._id, structIds, ownerId, collection, this.getToken(this.currentUser)]}));
            if(typeof callback === 'function') callback(res);
            return res
        }
    }

    //get struct based on the parentId 
    getStructParentData = async (struct:Struct,callback=this.baseServerCallback) => {
        if(!struct?.parent) return;
        if(this.currentUser?.request) {
            let args = [this.currentUser._id, struct.parent?.structType,'_id',struct.parent?._id, this.getToken(this.currentUser)];

            let res = (await this.currentUser.request({route:'getData', args}))?.[0]
            if(typeof callback === 'function') callback(res);
            return res;
        }
    }
    
    // //get struct(s) based on an array of ids or string id in the parent struct
    // async getStructChildData (struct,childPropName='', limit=0, skip=0, callback=this.baseServerCallback) {
    //     let children = struct[childPropName];
    //     if(!children) return;
      
    //     return await this.WebsocketClient.run(
    //         'getChildren',
    //         [children,limit,skip],
    //         this.socketId,
    //         this.WebsocketClient.origin,
    //         callback
    //     );
    // }

    
    //sets the user profile data on the server
    setUser = async (userStruct:ProfileStruct,callback=this.baseServerCallback) => {
        if(userStruct && this.currentUser?.request) {
            let res = (await this.currentUser.request({route:'setUser', args:[this.currentUser._id, this.stripStruct(userStruct), this.getToken(this.currentUser)]}))
            if(typeof callback === 'function') callback(res)
            return res
        }
    }

    //updates a user's necessary profile details if there are any discrepancies with the token
    checkUserToken = async (usertoken,user=this.currentUser,callback=this.baseServerCallback) => {
        if(!usertoken) return false;
        let changed = false;
        for(const prop in usertoken) {
            let dummystruct = this.userStruct()
            if(user[prop] && prop !== '_id') {
                //console.log(prop)
                if (Array.isArray(usertoken[prop])) {
                    for(let i = 0; i < user[prop].length; i++) { //check user props that are not in the token
                        //console.log(usertoken[prop][i]);
                        if(usertoken[prop].indexOf(user[prop][i]) < 0) {
                            user[prop] = usertoken[prop]; 
                            changed = true;
                            break;
                        }
                    }
                    if(!changed) for(let i = 0; i < usertoken[prop].length; i++) { //check token props that are not in the user
                        //console.log(usertoken[prop][i]);
                        if(user[prop].indexOf(usertoken[prop][i]) < 0) {
                            user[prop] = usertoken[prop]; 
                            changed = true;
                            break;
                        }
                    }
                }
                else if(user[prop] !== usertoken[prop]) { 
                    user[prop] = usertoken[prop];  changed = true;
                }
            } else if (!user[prop] && dummystruct[prop]) {
                user[prop] = usertoken[prop];  changed = true;
            }
        }
        if(changed) return await this.setUser(user as any,callback);
        return changed;
    }

    /* strip circular references and update data on the server, default callback will process the returned structs back into  */
    setData = async (structs:Partial<Struct>|Partial<Struct>[]=[],notify=true,callback=this.baseServerCallback) => {
        if(this.currentUser?.request) {
            const copies = new Array();
            if(!Array.isArray(structs) && typeof structs === 'object') structs = [structs];
            structs.forEach((struct)=>{
                copies.push(this.stripStruct(struct));
            })

            let res = (await this.currentUser.request({route:'setData', args:[this.currentUser._id, copies, notify, this.getToken(this.currentUser)]}));
            if(typeof callback === 'function') callback(res);
            return res;
        }
    }

    updateServerData = this.setData;
    
    //delete a list of structs from local and server
    deleteData = async (structs:any[]=[],callback=this.baseServerCallback) => {
        if(this.currentUser?.request) {
            let toDelete:any[] = [];
            //console.log('LOCAL TABLET DATA: ',this.tablet.collections)
            structs.forEach((struct) => {
                if(typeof struct === 'object') {
                    if(struct?.structType && struct?._id) {
                    toDelete.push(
                        {
                            structType:struct.structType,
                            _id:struct._id
                        }
                    );
                    this.deleteLocalData(struct);
                    }
                }
                else if (typeof struct === 'string'){
                    let localstruct = this.getLocalData(undefined,{_id:struct});
                    if(localstruct && !Array.isArray(localstruct)) {
                        toDelete.push(
                            {
                                structType:localstruct.structType,
                                _id:localstruct._id
                            }
                        );
                    } else {
                        toDelete.push(
                            {
                                _id:struct
                            } //still need a structType but we'll pass this anyway for now
                        );
                    }
                }
            });
            //console.log('deleting',toDelete);
            let res = (await this.currentUser.request({route:'deleteData', args:[this.currentUser._id, toDelete, this.getToken(this.currentUser)]}))
            if(typeof callback === 'function') callback(res)
            return res
        }
    }

    //delete user profile by ID on the server
    deleteUser = async (userId:string=this.currentUser._id, deleteData?:boolean, callback=this.baseServerCallback) => {
        if(this.currentUser?.request) {
            if(!userId) return;

            let res = (await this.currentUser.request({route:'deleteUser', args:[this.currentUser._id, userId, deleteData, this.getToken(this.currentUser)]}))
            if(typeof callback === 'function') callback(res)
            return res
        }
    }

    //set a group struct on the server
    setGroup = async (groupStruct:GroupStruct,callback=this.baseServerCallback) => {
        if(groupStruct && this.currentUser?.request) {
            let res = (await this.currentUser.request({route:'setGroup', args:[this.currentUser._id, this.stripStruct(groupStruct), this.getToken(this.currentUser)]}))
            if(typeof callback === 'function') callback(res)
            return res
        }
    }

    //get group structs or single one by Id
    getUserGroups = async (userId=this.currentUser._id, groupId='',callback=this.baseServerCallback) => {
        if(this.currentUser?.request) {
            let res = (await this.currentUser.request({route:'getUserGroups', args:[this.currentUser._id, userId,groupId, this.getToken(this.currentUser)]}))
            if(typeof callback === 'function') callback(res)
            return res
        }
    }

    //deletes a group off the server
    deleteGroup = async (groupId,callback=this.baseServerCallback) => {
        if(this.currentUser?.request) {
            if(!groupId) return;
            this.deleteLocalData(groupId);

            let res = (await this.currentUser.request({route:'deleteGroup', args:[this.currentUser._id, groupId, this.getToken(this.currentUser)]}))
            if(typeof callback === 'function') callback(res)
            return res
        }
    }

    //set an authorization struct on the server
    setAuthorization = async (authorizationStruct:AuthorizationStruct,callback=this.baseServerCallback) => {
        if(authorizationStruct && this.currentUser?.request) {
            let res = (await this.currentUser.request({route:'setAuthorization', args:[this.currentUser._id, this.stripStruct(authorizationStruct), this.getToken(this.currentUser)]}))
            if(typeof callback === 'function') callback(res)
            return res
        }
    }

    //get an authorization struct by Id
    getAuthorizations = async (userId=this.currentUser?._id, authorizationId='',callback=this.baseServerCallback) => {
        if(this.currentUser?.request) {
            if(userId === undefined) return;
            let res = (await this.currentUser.request({route:'getAuthorizations', args:[this.currentUser._id, userId, authorizationId, this.getToken(this.currentUser)]}))
            if(typeof callback === 'function') callback(res)
            return res
        }
    }

    //delete an authoriztion off the server
    deleteAuthorization = async (authorizationId,callback=this.baseServerCallback) => {
        if(this.currentUser?.request) {
            if(!authorizationId) return;
            this.deleteLocalData(authorizationId);
            let res = (await this.currentUser.request({route:'deleteAuthorization', args:[this.currentUser._id, authorizationId, this.getToken(this.currentUser)]}));
            if(typeof callback === 'function') callback(res)
            return res
        }
    }

    //notifications are GENERALIZED for all structs, where all authorized users will receive notifications when those structs are updated
    checkForNotifications = async (userId:string=this.currentUser?._id) => {
        return await this.getData('notification',userId);
    }

    
    //pass notifications you're ready to resolve and set pull to true to grab the associated data structure.
    resolveNotifications = async (notifications:any[]=[], pull:boolean=true, user:Partial<User>=this.currentUser) => {
        if(!user || notifications.length === 0) return;
        let structIds:any[] = [];
        let notificationIds:any[] = [];
        let nTypes:any[] = [];
        //console.log(notifications);
        let unote = false;
        if(notifications.length === 0) notifications = this.getLocalData('notification',{'ownerId':user._id});
        notifications.forEach((struct)=>{
            if(struct.parent.structType === 'user') unote = true;
            nTypes.push(struct.parent.structType);
            structIds.push(struct.parent._id); //
            notificationIds.push(struct._id); //ids of the notifications structs
            //console.log(struct)
            this.deleteLocalData(struct); //delete local entries and update profile
            //console.log(this.structs.get(struct._id));
        });

        this.deleteData(notifications); //delete server entries for the notifications
        if(pull) {
            nTypes.reverse().forEach((note,i)=>{
                // if(note === 'comment') { //when resolving comments we need to pull the tree (temp)
                //     this.getParentData(structIds[i],(res)=>{
                //         this.defaultCallback(res);
                //         if(res.data) this.getChildData(res.data._id,'comments');
                //     });
                //     structIds.splice(i,1);
                // }
                if(note === 'user') {
                    this.getUser(structIds[i]);
                    structIds.splice(structIds.length-i-1,1);
                }
            }); 
            if(structIds.length === 1) return await this.getDataByIds(structIds,undefined,notifications[0].parent.structType)
            if(structIds.length > 0) return await this.getDataByIds(structIds);
        }
        return true;
    } 

    //setup authorizations automatically based on group
    setAuthorizationsByGroup = async (user=this.currentUser) => {

        let auths = this.getLocalData('authorization',{'ownerId': user._id});
        //console.log('auths',auths, 'user', user);
        let newauths:any[] = [];
        if(user.userRoles)
        await Promise.all(Object.keys(user.userRoles).map(async (role)=>{ //auto generate access authorizations accordingly
            //group format e.g.
            //reddoor_client
            //reddoor_peer
            let split = role.split('_');
            let team = split[0];
            let otherrole;
            if(role.includes('client')) {
                otherrole = team+'_peer';
            } else if (role.includes('peer')) {
                otherrole = team+'_client';
            } else if (role.includes('admin')) {
                otherrole = team+'_owner';
            }
            if(otherrole) {
                let users = await this.getUsersByRole(otherrole);
                    //console.log(res.data)
                
                if(users) await Promise.all(users.map(async (groupie)=>{
                    let theirname = groupie.username;
                    if(!theirname) theirname = groupie.email;
                    if(!theirname) theirname = groupie._id;
                    let myname = user.username;
                    if(!myname) myname = user.email as any;
                    if(!myname) myname = user._id;

                    if(theirname !== myname) {
                        if(role.includes('client')) {

                            //don't re-set up existing authorizations 
                            let found = auths.find((a)=>{
                                if(a.authorizerId === groupie._id && a.authorizedId === user._id) return true;
                            });

                            if(!found) {
                                let auth = await this.authorizeUser(
                                    DS.ProfileStruct('user', user, user) as any,
                                    groupie._id,
                                    theirname,
                                    user._id,
                                    myname,
                                    {'peer':true},
                                    undefined,
                                    {group:team}
                                );
                                newauths.push(auth);
                            }
                        } else if (role.includes('peer')) {

                            //don't re-set up existing authorizations 
                            let found = auths.find((a)=>{
                                if(a.authorizedId === groupie._id && a.authorizerId === user._id) return true;
                            });

                            if(!found) {
                                let auth = await this.authorizeUser(
                                    DS.ProfileStruct('user', user, user) as any,
                                    user._id,
                                    myname,
                                    groupie._id,
                                    theirname,
                                    {'peer':true},
                                    undefined,
                                    {group:team}
                                );
                                newauths.push(auth);
                            }
                        }
                    }
                }));
            }
        }));
        if(newauths.length > 0)
            return newauths;

        return undefined;
    }

    
    //delete a discussion or chatroom and associated comments
    deleteRoom = async (roomStruct) => {
        if(!roomStruct) return false;

        let toDelete = [roomStruct];

        roomStruct.comments?.forEach((id)=>{
            let struct = this.getLocalData('comment',{'_id':id});
            toDelete.push(struct);
        });

        if(roomStruct)
            return await this.deleteData(toDelete);
        else return false;

    }

    //delete comment and associated replies by recursive gets
    deleteComment = async (commentStruct) => {
        let allReplies = [commentStruct];
        let getRepliesRecursive = (head=commentStruct) => {
            if(head?.replies) {
                head.replies.forEach((replyId) => {
                    let reply = this.getLocalData('comment',{'_id':replyId});
                    if(reply) {
                        if(reply.replies.length > 0) {
                            reply.replies.forEach((replyId2) => {
                                getRepliesRecursive(replyId2); //check down a level if it exists
                            });
                        }
                        allReplies.push(reply); //then return this level's id
                    }
                });
            }
        }
        
        getRepliesRecursive(commentStruct);
        
        //need to wipe the commentIds off the parent struct comments and replyTo replies
        let parent = this.getLocalData(commentStruct.parent?.structType,{'_id':commentStruct.parent?._id})
        let toUpdate:any[] = [];
        if(parent) {
            toUpdate = [parent];
            allReplies.forEach((r) => {
                let idx = parent.replies?.indexOf(r._id);
                if(idx > -1) parent.replies.splice(idx,1);
                let idx2 = parent.comments?.indexOf(r._id);
                if(idx2 > -1) parent.comments.splice(idx2,1);
            });
        }
        let replyTo = this.getLocalData('comment',{'_id':commentStruct.replyTo});
        if(replyTo?._id !== parent?._id) {
            let idx = replyTo.replies?.indexOf(parent._id); // NOTE: Should this look for the corresponding parent id?
            if(idx > -1) replyTo.replies.splice(idx,1);
            toUpdate.push(replyTo);
        }

        if(toUpdate.length > 0) await this.updateServerData(toUpdate);
        return await this.deleteData(allReplies);
        
    }

    //get user data by their auth struct (e.g. if you don't grab their id directly), includes collection, limits, skips
    getUserDataByAuthorization = async (authorizationStruct, collection, searchDict, limit=0, skip=0, callback=this.baseServerCallback) => {

        let u = authorizationStruct.authorizerId;
        if(u) {
            return new Promise(async resolve => {
               this.getUser(u, true, async (data)=> {
                    let res;
                    if(!collection) res = await this.getAllUserData(u,['notification'],undefined,callback);
                    else res = await this.getData(collection,u,searchDict,limit,skip,callback);

                    resolve(res)
                    callback(res);
                }); //gets profile deets
            })
        } else return undefined;
    }

    //get user data for all users in a group, includes collection, limits, skips
    getUserDataByAuthorizationGroup = async (groupId='', collection, searchDict, limit=0, skip=0, callback=this.baseServerCallback) => {
        let auths = this.getLocalData('authorization');

        let results:any[] = [];
        await Promise.all(auths.map(async (o) => {
            if(o.groups?.includes(groupId)) {
                let u = o.authorizerId;
                if(u) {
                    let data;
                    let user = await this.getUser(u, true, callback);
                    
                    if(user) results.push(user);
                    if(!collection) data = await this.getAllUserData(u,['notification'],undefined,callback);
                    else data = await this.getData(collection,u,searchDict,limit,skip,callback);
                    if(data) results.push(data);
                }
                return true;
            }
        }))
        
        return results; //will be a weird result till this is tested more
    }

    //

    //just assigns replacement object to old object if it exists, keeps things from losing parent context in UI
    overwriteLocalData (structs) {
        if(Array.isArray(structs)){
            structs.forEach((struct) => {
                let localdat =  this.getLocalData(struct.structType,{'ownerId': struct.ownerId, '_id':struct._id});
                if(!localdat || localdat?.length === 0) {
                    this.setLocalData(struct);       //set
                }
                else Object.assign(localdat,struct); //overwrite
            })
        } else {
            let localdat =  this.getLocalData(structs.structType,{'ownerId': structs.ownerId, '_id':structs._id});
            if(!localdat || localdat?.length === 0) {
                this.setLocalData(structs);       //set
            }
            else Object.assign(localdat,structs); //overwrite
        }
    }

    setLocalData (structs) {
        this.tablet.setLocalData(structs);
    }

    //pull a struct by collection, owner, and key/value pair from the local platform, leave collection blank to pull all ownerId associated data
    getLocalData(collection, query?) {
        return this.tablet.getLocalData(collection,query);
    }

    //get auths where you have granted somebody peer access
    getLocalUserPeerIds = (user=this.currentUser) => {
        if(!user) return {} as any;
        let result:any = {};
        let authorizations = this.getLocalData('authorization',user._id);
        authorizations.forEach((a)=>{
            if(a.authorizations['peer'] && a.authorizerId === user._id) result[a.authorizedId] = true;
        });
        return result;
    }

    getLocalReplies(struct) {
        let replies:any[] = [];

        if(!struct.replies) return replies;
        else if (struct.replies.reduce((a,b) => a*((typeof b === 'object')? 1 : 0), 1)) return struct.replies // just return objects
        
        replies = this.getLocalData('comment',{'replyTo':struct._id});
        return replies;
    }

    hasLocalAuthorization(otherUserId, ownerId=this.currentUser._id) {
        let auths = this.getLocalData('authorization',{ownerId});
        let found = auths.find((a) => {
            if(a.authorizedId === ownerId && a.authorizerId === otherUserId) return true;
            if(a.authorizerId === ownerId && a.authorizedId === otherUserId) return true;
        });
        if(found){
            return found;
        } else return false;
    }

    //pass a single struct or array of structs
    deleteLocalData(structs:Struct[]) {
        if(Array.isArray(structs)) structs.forEach(s => this.deleteStruct(s));
        else this.deleteStruct(structs); //single
        return true;
    }

    deleteStruct(struct:Struct) {
        if(typeof struct === 'string') struct = this.getLocalData(undefined,{_id:struct}); //get the struct if an id was supplied
        if(!struct) throw new Error('Struct not supplied')
        if(!struct.structType || !struct._id) return false;
        this.tablet.collections.get(struct.structType as string).delete(struct._id);
        return true;
    }

    //strips circular references from the struct used clientside, returns a soft copy with the changes
    stripStruct(struct:Struct) {
        const copy = Object.assign({ }, struct);
        for(const prop in copy) {
            if(copy[prop] === undefined || copy[prop] === "" || copy[prop].constructor.name === 'Map' || copy[prop].constructor.name === 'Set' || typeof copy[prop] === 'function') delete copy[prop]; //delete undefined 
            else if (Array.isArray(copy[prop]) && copy[prop].length === 0) delete copy[prop]; //get rid of empty arrays
            else if(typeof copy[prop] === 'object' && Object.keys(copy[prop]).length === 0) delete copy[prop];  //get rid of empty objects
        }
        return copy;
    }

    //create a struct with the prepared props to be filled out
    createStruct(structType:string,props?:{[key:string]:any},parentUser=this.currentUser,parentStruct?:Struct):any {
        let struct = DS.Struct(structType,props,parentUser,parentStruct)
        return struct;
    }

    userStruct (
        props: Partial<User>={}, 
        currentUser=false
    ) {
        let user = DS.ProfileStruct(undefined, props, props);
        if(!user.name && user.firstName) 
            user.name = user.firstName + ' ' + user.lastName;
        else if(user.name && !user.firstName) {
            let split = user.name.split(' ');
            user.firstName = split[0];
            user.lastName = split[split.length-1];
        }

        if(props._id) user.id = props._id; //references the token id
        else if(props.id) user.id = props.id;
        else user.id = 'user'+Math.floor(Math.random()*1000000000000000);
        user._id = user.id as any; //for mongo stuff
        user.ownerId = user.id;
        let dummy = DS.ProfileStruct();
        for(const prop in props) {
            if(Object.keys(dummy).indexOf(prop) < 0) {
                delete user[prop];
            } //delete non-dependent data (e.g. tokens we only want to keep in a secure collection)
        }
        if(currentUser) this.currentUser = user as any;
        return user as ProfileStruct;
    }

    //TODO: Update the rest of these to use the DB structs but this should all work the same for now
    authorizeUser = async (
        parentUser:Partial<User>,
        authorizerUserId='',
        authorizerUserName='',
        authorizedUserId='',
        authorizedUserName='',
        authorizations:{}={}, 
        structs:{}={},
        excluded:{}={},
        groups:{}={},
        expires=false
    ) => {
        if(!parentUser) return undefined;

        let newAuthorization = this.createStruct('authorization',undefined,parentUser as any,undefined);  
        newAuthorization.authorizedId = authorizedUserId; // Only pass ID
        newAuthorization.authorizedName = authorizedUserName; //set name
        newAuthorization.authorizerId = authorizerUserId; // Only pass ID
        newAuthorization.authorizerName = authorizerUserName; //set name
        newAuthorization.authorizations = authorizations; //object
        newAuthorization.structs = structs;   // object
        newAuthorization.excluded = excluded; // object
        newAuthorization.groups = groups;     // array 
        newAuthorization.expires = expires; 
        newAuthorization.status = 'PENDING';
        newAuthorization.associatedAuthId = '';
        //console.log('new authorization', newAuthorization)
        newAuthorization = await this.setAuthorization(newAuthorization);
       
        return newAuthorization as AuthorizationStruct;
    }

    addGroup = async (
        parentUser:Partial<User>,
        name='',  
        details='',
        admins:{}={}, 
        peers:{}={}, 
        clients:{}={}, 
        updateServer=true
    ) => {
        if(!parentUser) return undefined;

        let newGroup = this.createStruct('group',undefined,parentUser as any); //auto assigns instances to assigned users' data views

        newGroup.name = name;
        newGroup.details = details;
        newGroup.admins = admins;
        newGroup.peers = peers;
        newGroup.clients = clients;
        newGroup.users = {};
        Object.assign(newGroup.users, newGroup.admins);
        Object.assign(newGroup.users, newGroup.peers);
        Object.assign(newGroup.users, newGroup.clients);
        
        //this.setLocalData(newGroup);
        
        if(updateServer) {
            newGroup = await this.setGroup(newGroup);
        }

        return newGroup as GroupStruct;
    }

    //these can be used to add some metadata to arrays of data kept in a DataStruct
    dataObject (
        data:any=undefined,
        type:string='any',
        timestamp:string|number=Date.now()
    ) {
        return {
            type,
            data,
            timestamp
        };
    }

    addData = async (
        parentUser:Partial<User>, 
        author='', 
        title='', 
        type='', 
        data:string|Data[]=[], 
        expires=false, 
        updateServer=true
    ) => {
        if(!parentUser) return undefined;

        let newDataInstance = this.createStruct('dataInstance',undefined,parentUser as any); //auto assigns instances to assigned users' data views
        newDataInstance.author = author;
        newDataInstance.title = title;
        newDataInstance.type = type;
        newDataInstance.data = data;
        newDataInstance.expires = expires;
        
        //this.setLocalData(newDataInstance);
        
        if(updateServer) newDataInstance = await this.updateServerData([newDataInstance])[0];

        return newDataInstance as DataStruct;
    }

    addEvent = async (
        parentUser:Partial<User>,
        author:string='', 
        event:string|number='', 
        notes:string='', 
        startTime?:string|number, 
        endTime?:string|number,
        grade?:string|number, 
        value?:any,
        units?:string,
        location?:any,
        attachments?:string|Data[], 
        users?:{[key:string]:true}, 
        updateServer=true
    ) => {
        if(!parentUser) return undefined;
        if(users && Object.keys(users).length === 0) users = this.getLocalUserPeerIds(parentUser as any);
        
        let newEvent = this.createStruct('event', undefined, parentUser as any);
        newEvent.author = author;
        newEvent.event = event;
        newEvent.notes = notes;
        newEvent.startTime = startTime;
        newEvent.endTime = endTime;
        newEvent.grade = grade;
        newEvent.attachments = attachments;
        newEvent.value = value;
        newEvent.units = units;
        newEvent.users = users;
        newEvent.location = location;

        //this.setLocalData(newEvent);
        if(updateServer) newEvent = await this.updateServerData([newEvent])[0];

        return newEvent as EventStruct;
    }

    addChatroom = async (
        parentUser:Partial<User>,
        authorId='', 
        message='', 
        attachments?:string|Data[], 
        users?:{[key:string]:true}, 
        updateServer=true
    ) => {
        if(!parentUser) return undefined;
        if(users && Object.keys(users).length === 0) users = this.getLocalUserPeerIds(parentUser as any); //adds the peer ids if none other provided
        
        let newChatroom = this.createStruct('chatroom',undefined,parentUser as any);
        newChatroom.message = message;
        newChatroom.attachments = attachments;
        newChatroom.authorId = authorId;
        newChatroom.users = users;
        newChatroom.replies = [];
        newChatroom.comments = [];
        let update = [newChatroom];
        if(updateServer) newChatroom = await this.updateServerData(update)[0];

        return newChatroom as ChatroomStruct;
    }

    //add comment to chatroom or discussion board
    addComment = async (
        parentUser:Partial<User>,
        roomStruct?:{
            _id: string;
            users: any[];
            comments: any[];
        }, 
        replyTo?:{
            _id: string;
            replies: any[];
        }, 
        authorId='', 
        message='', 
        attachments?:string|Data[],
        updateServer=true
        ) => {
            if(!roomStruct) return undefined;
            if(!replyTo) replyTo = (roomStruct as any);

            if(!parentUser) return undefined;
            let newComment = this.createStruct('comment',undefined,parentUser as any,roomStruct);
            newComment.authorId = authorId;
            newComment.replyTo = replyTo?._id;
            newComment.message = message;
            newComment.attachments = attachments;
            newComment.users = roomStruct?.users;
            newComment.replies = [];


            if (!updateServer) replyTo?.replies.push(newComment._id); //keep a local reference
            //else replyTo?.replies.push(newComment._id); // push full reply if not on server
            
            if (!updateServer) roomStruct?.comments.push(newComment._id); //keep a local reference
            //else roomStruct?.comments.push(newComment._id); // push full comment if not on server

            //this.setLocalData(newComment);
            let update = [newComment,roomStruct];
            if(replyTo?._id !== roomStruct._id) update.push(replyTo);
            let res;
            if(updateServer) res = await this.updateServerData(update);
            let updatedComment;
            if(typeof res === 'object') { //comment results will return all updated structs (replies and chatrooms, etc) so find the right struct
                updatedComment = res.find((s) => {
                    if(newComment.ownerId === s.ownerId && newComment.timestamp === s.timestamp && newComment.message === s.message) {
                        return true;
                    }
                });
            }
            if(updatedComment) return updatedComment as CommentStruct;
            return res as Array<any>;
    }
}

