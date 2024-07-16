export type TimeUnit = 'second' | 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year' | 'decade' | 'century' | 'millennium' | 'microsecond' | 'nanosecond';
type Plural<T extends string> = `${T}s`;
export type TimeSpecifier = `now` | `last ${string} ${Plural<TimeUnit>}` | `last ${TimeUnit}`;
export declare let defaultSpecifiers: ("now" | TimeUnit)[];
export declare function genTimeSpecifiers(specifiers?: ("now" | TimeUnit)[]): string[];
export declare function genTimestampFromString(specifier: TimeSpecifier): number;
export {};
