import { DataTablet } from './datastructures/index';
import { Data, ProfileStruct, AuthorizationStruct, GroupStruct, DataStruct, EventStruct, ChatroomStruct, CommentStruct, Struct, NotificationStruct } from './datastructures/types';
import { TimeSpecifier } from './genTimestamps';
import { Service } from "../graphscript-core/index";
import { User } from "../graphscript-router/index";
import { GraphNodeProperties } from "../graphscript-core/index";
export declare const randomId: (prefix?: any) => string;
export declare const pseudoObjectId: (m?: Math, d?: DateConstructor, h?: number, s?: (s: any) => string) => string;
export type StructFrontendProps = {
    useAccessTokens?: boolean;
    useRefreshTokens?: boolean;
} & GraphNodeProperties;
export declare class StructFrontend extends Service {
    name: string;
    currentUser: User;
    tablet: DataTablet;
    collections: Map<string, any>;
    id: string;
    useAccessTokens: boolean;
    useRefreshTokens: boolean;
    constructor(options?: any, user?: Partial<User>);
    getToken(user: Partial<ProfileStruct>): string;
    setupUser: (userinfo: Partial<User>, callback?: (currentUser: any) => void) => Promise<any>;
    baseServerCallback: (data: any) => Promise<void>;
    structNotification: () => void;
    structDeleted: (struct: {
        _id: string;
        structType: string;
    }) => void;
    onData: (data: any) => void;
    onNotify: (notification: NotificationStruct) => void;
    randomId(tag?: string): string;
    /**
        let struct = {
            _id: randomId(structType+'defaultId'),   //random id associated for unique identification, used for lookup and indexing
            structType: structType,     //this is how you will look it up by type in the server
            ownerId: parentUser?._id,     //owner user
            timestamp: Date.now(),      //date of creation
            parent: {structType:parentStruct?.structType,_id:parentStruct?._id}, //parent struct it's associated with (e.g. if it needs to spawn with it)
        }
     */
    addStruct: (structType?: string, props?: any, parentUser?: {
        [key: string]: any;
    }, parentStruct?: {
        [key: string]: any;
    }, updateServer?: boolean) => Promise<Struct>;
    getUser: (info?: string | number, basicInfo?: boolean, callback?: (data: any) => Promise<void>) => Promise<{
        user: ProfileStruct;
        groups: GroupStruct[];
        authorizations: AuthorizationStruct[];
    }>;
    queryUsers: (info: string, skip?: number, limit?: number, callback?: (data: any) => Promise<void>) => Promise<any>;
    getUsers: (ids?: (string | number)[], basicInfo?: boolean, callback?: (data: any) => Promise<void>) => Promise<any>;
    getUsersByRole: (userRole: string, callback?: (data: any) => Promise<void>) => Promise<any>;
    getAllUserData: (ownerId: string | number, excluded?: any[], timeRange?: [number | TimeSpecifier, number | TimeSpecifier], callback?: (data: any) => Promise<void>) => Promise<any>;
    query: (collection: string, mongoQuery?: {}, findOne?: boolean, skip?: number, callback?: (data: any) => Promise<void>) => Promise<any>;
    getDataByTimeRange(collection: any, timeRange: [number | TimeSpecifier, number | TimeSpecifier], ownerId?: string | number | undefined, limit?: number, skip?: number, key?: string): Promise<any>;
    getData: (collection: string, ownerId?: string | number | undefined, searchDict?: any, limit?: number, skip?: number, callback?: (data: any) => Promise<void>) => Promise<any>;
    getDataByIds: (structIds?: any[], ownerId?: string | number | undefined, collection?: string | undefined, callback?: (data: any) => Promise<void>) => Promise<any>;
    getStructParentData: (struct: Struct, callback?: (data: any) => Promise<void>) => Promise<any>;
    setUser: (userStruct: ProfileStruct, callback?: (data: any) => Promise<void>) => Promise<any>;
    checkUserToken: (usertoken: any, user?: User, callback?: (data: any) => Promise<void>) => Promise<any>;
    setData: (structs?: Partial<Struct> | Partial<Struct>[], notify?: boolean, callback?: (data: any) => Promise<void>) => Promise<any>;
    updateServerData: (structs?: Partial<Struct> | Partial<Struct>[], notify?: boolean, callback?: (data: any) => Promise<void>) => Promise<any>;
    deleteData: (structs?: any[], callback?: (data: any) => Promise<void>) => Promise<any>;
    deleteUser: (userId?: string, deleteData?: boolean, callback?: (data: any) => Promise<void>) => Promise<any>;
    setGroup: (groupStruct: GroupStruct, callback?: (data: any) => Promise<void>) => Promise<any>;
    getUserGroups: (userId?: string, groupId?: string, callback?: (data: any) => Promise<void>) => Promise<any>;
    deleteGroup: (groupId: any, callback?: (data: any) => Promise<void>) => Promise<any>;
    setAuthorization: (authorizationStruct: AuthorizationStruct, callback?: (data: any) => Promise<void>) => Promise<any>;
    getAuthorizations: (userId?: string, authorizationId?: string, callback?: (data: any) => Promise<void>) => Promise<any>;
    deleteAuthorization: (authorizationId: any, callback?: (data: any) => Promise<void>) => Promise<any>;
    checkForNotifications: (userId?: string) => Promise<any>;
    resolveNotifications: (notifications?: any[], pull?: boolean, user?: Partial<User>) => Promise<any>;
    setAuthorizationsByGroup: (user?: User) => Promise<any[]>;
    deleteRoom: (roomStruct: any) => Promise<any>;
    deleteComment: (commentStruct: any) => Promise<any>;
    getUserDataByAuthorization: (authorizationStruct: any, collection: any, searchDict: any, limit?: number, skip?: number, callback?: (data: any) => Promise<void>) => Promise<unknown>;
    getUserDataByAuthorizationGroup: (groupId: string, collection: any, searchDict: any, limit?: number, skip?: number, callback?: (data: any) => Promise<void>) => Promise<any[]>;
    overwriteLocalData(structs: any): void;
    setLocalData(structs: any): void;
    getLocalData(collection: any, query?: any): any;
    getLocalUserPeerIds: (user?: User) => any;
    getLocalReplies(struct: any): any;
    hasLocalAuthorization(otherUserId: any, ownerId?: string): any;
    deleteLocalData(structs: Struct[]): boolean;
    deleteStruct(struct: Struct): boolean;
    stripStruct(struct: Struct): Struct;
    createStruct(structType: string, props?: {
        [key: string]: any;
    }, parentUser?: User, parentStruct?: Struct): any;
    userStruct(props?: Partial<User>, currentUser?: boolean): ProfileStruct;
    authorizeUser: (parentUser: Partial<User>, authorizerUserId?: string, authorizerUserName?: string, authorizedUserId?: string, authorizedUserName?: string, authorizations?: {}, structs?: {}, excluded?: {}, groups?: {}, expires?: boolean) => Promise<AuthorizationStruct>;
    addGroup: (parentUser: Partial<User>, name?: string, details?: string, admins?: {}, peers?: {}, clients?: {}, updateServer?: boolean) => Promise<GroupStruct>;
    dataObject(data?: any, type?: string, timestamp?: string | number): {
        type: string;
        data: any;
        timestamp: string | number;
    };
    addData: (parentUser: Partial<User>, author?: string, title?: string, type?: string, data?: string | Data[], expires?: boolean, updateServer?: boolean) => Promise<DataStruct>;
    addEvent: (parentUser: Partial<User>, author?: string, event?: string | number, notes?: string, startTime?: string | number, endTime?: string | number, grade?: string | number, value?: any, units?: string, location?: any, attachments?: string | Data[], users?: {
        [key: string]: true;
    }, updateServer?: boolean) => Promise<EventStruct>;
    addChatroom: (parentUser: Partial<User>, authorId?: string, message?: string, attachments?: string | Data[], users?: {
        [key: string]: true;
    }, updateServer?: boolean) => Promise<ChatroomStruct>;
    addComment: (parentUser: Partial<User>, roomStruct?: {
        _id: string;
        users: any[];
        comments: any[];
    }, replyTo?: {
        _id: string;
        replies: any[];
    }, authorId?: string, message?: string, attachments?: string | Data[], updateServer?: boolean) => Promise<any[] | CommentStruct>;
}
