// Generated by dts-bundle v0.4.3
// Dependencies for this module:
//   ../child_process
//   ../fs
//   ../streamline-runtime
//   ../http
//   ../stream

declare module 'ez-streams' {
    import * as DevArray from 'ez-streams/devices/array';
    import * as DevBuffer from 'ez-streams/devices/buffer';
    import * as DevChildProcess from 'ez-streams/devices/child_process';
    import * as DevConsole from 'ez-streams/devices/console';
    import * as DevFile from 'ez-streams/devices/file';
    import * as DevGeneric from 'ez-streams/devices/generic';
    import * as DevHttp from 'ez-streams/devices/http';
    import * as DevQueue from 'ez-streams/devices/queue';
    import * as DevNet from 'ez-streams/devices/net';
    import * as DevNode from 'ez-streams/devices/node';
    import * as DevStd from 'ez-streams/devices/std';
    import * as DevString from 'ez-streams/devices/string';
    import * as DevUturn from 'ez-streams/devices/uturn';
    export const devices: {
        array: typeof DevArray;
        buffer: typeof DevBuffer;
        child_process: typeof DevChildProcess;
        console: typeof DevConsole;
        file: typeof DevFile;
        generic: typeof DevGeneric;
        http: typeof DevHttp;
        net: typeof DevNet;
        node: typeof DevNode;
        queue: typeof DevQueue;
        std: typeof DevStd;
        string: typeof DevString;
        uturn: typeof DevUturn;
    };
    import * as HelpBinary from 'ez-streams/helpers/binary';
    export const helpers: {
        binary: typeof HelpBinary;
    };
    import * as MapConvert from 'ez-streams/mappers/convert';
    import * as MapJson from 'ez-streams/mappers/json';
    export const mappers: {
        convert: typeof MapConvert;
        json: typeof MapJson;
    };
    import * as TransCsv from 'ez-streams/transforms/csv';
    import * as TransCut from 'ez-streams/transforms/cut';
    import * as TransJson from 'ez-streams/transforms/json';
    import * as TransLines from 'ez-streams/transforms/lines';
    import * as TransMultipart from 'ez-streams/transforms/multipart';
    import * as TransXml from 'ez-streams/transforms/xml';
    export const transforms: {
        csv: typeof TransCsv;
        cut: typeof TransCut;
        json: typeof TransJson;
        lines: typeof TransLines;
        multipart: typeof TransMultipart;
        xml: typeof TransXml;
    };
    import * as EzPredicate from 'ez-streams/predicate';
    import * as EzReader from 'ez-streams/reader';
    import * as EzWriter from 'ez-streams/writer';
    import EzFactory from 'ez-streams/factory';
    export const predicate: typeof EzPredicate;
    export const factory: typeof EzFactory;
    export type Reader<T> = EzReader.Reader<T>;
    export type CompareOptions<T> = EzReader.CompareOptions<T>;
    export type ParallelOptions = EzReader.ParallelOptions;
    export type Writer<T> = EzWriter.Writer<T>;
    export function reader(arg: string | any[] | Buffer): Reader<any>;
    export function writer(arg: string | any[] | Buffer): Writer<any>;
}

declare module 'ez-streams/devices/array' {
    import { Reader } from 'ez-streams/reader';
    import { Writer } from 'ez-streams/writer';
    export interface Options {
        sync?: boolean;
    }
    export class ArrayWriter<T> extends Writer<T> {
        values: T[];
        constructor(options: Options);
        toArray(): T[];
        readonly result: T[];
    }
    export function reader<T>(array: T[], options?: Options): Reader<T>;
    export function writer<T>(options?: Options): ArrayWriter<{}>;
}

declare module 'ez-streams/devices/buffer' {
    import { Reader } from 'ez-streams/reader';
    import { Writer } from 'ez-streams/writer';
    export interface Options {
        sync?: boolean;
        chunkSize?: number | (() => number);
    }
    export class BufferWriter extends Writer<Buffer> {
        chunks: Buffer[];
        constructor(options: Options);
        toBuffer(): Buffer;
        readonly result: Buffer;
    }
    export function reader(buffer: Buffer, options?: Options | number): Reader<Buffer>;
    export function writer(options?: Options): BufferWriter;
}

declare module 'ez-streams/devices/child_process' {
    import { Reader } from 'ez-streams/reader';
    import * as node from 'ez-streams/devices/node';
    import { ChildProcess } from 'child_process';
    export interface ReaderOptions {
        acceptCode?: (code: number) => boolean;
        encoding?: string;
        dataHandler?: (reader: Reader<string | Buffer>) => Reader<string | Buffer>;
        errorHandler?: (reader: Reader<string | Buffer>) => Reader<string | Buffer>;
        errorPrefix?: string;
        errorThrow?: boolean;
    }
    export function reader(proc: ChildProcess, options?: ReaderOptions): Reader<{}>;
    export function writer(proc: NodeJS.Process, options: node.NodeWriterOptions): any;
}

declare module 'ez-streams/devices/console' {
    import { Writer } from "ez-streams/writer";
    export const log: Writer<string>;
    export const info: Writer<string>;
    export const warn: Writer<string>;
    export const error: Writer<string>;
}

declare module 'ez-streams/devices/file' {
    import * as fs from 'fs';
    import { _ } from 'streamline-runtime';
    import { Reader } from 'ez-streams/reader';
    import { Writer } from 'ez-streams/writer';
    export const text: {
        reader(path: string, encoding?: string): Reader<string>;
        writer(path: string, encoding?: string): Writer<string>;
    };
    export const binary: {
        reader(path: string): Reader<Buffer>;
        writer(path: string): Writer<Buffer>;
    };
    export interface ListOptions {
        recurse?: boolean | 'preorder' | 'postorder';
        accept?: (_: _, entry: ListEntry) => boolean;
    }
    export interface ListEntry {
        path: string;
        name: string;
        depth: number;
        stat: fs.Stats;
    }
    export function list(path: string, options?: ListOptions): Reader<{}>;
}

declare module 'ez-streams/devices/generic' {
    import { _ } from 'streamline-runtime';
    import { Reader } from 'ez-streams/reader';
    import { Writer } from 'ez-streams/writer';
    export const empty: {
        reader: Reader<void>;
        writer: Writer<{}>;
    };
    export function reader<T>(read: (_: _) => T, stop?: (_: _, arg?: any) => void): Reader<T>;
    export function writer<T>(write: (_: _, value: T) => Writer<T>, stop?: (_: _, arg?: any) => Writer<T>): Writer<T>;
}

declare module 'ez-streams/devices/http' {
    import { _ } from 'streamline-runtime';
    import * as http from 'http';
    export interface HttpServerRequest {
    }
    export interface HttpServerResponse {
    }
    export interface HttpServerOptions {
    }
    export function server(listener: (request: HttpServerRequest, response: HttpServerResponse, _: _) => void, options?: HttpServerOptions): any;
    export interface HttpClientOptions {
        url?: string;
        method?: 'GET' | 'PUT' | 'POST' | 'DELETE' | 'OPTIONS';
        headers?: {
            [name: string]: string;
        };
    }
    export function client(options?: HttpClientOptions): any;
    export interface HttpListenerOption {
    }
    export function listener(listener: (request: http.ServerRequest, response: http.ServerResponse) => void, options?: HttpListenerOption): any;
    export function factory(url: string): {
        reader(_: Streamline._): any;
        writer(_: Streamline._): {
            write(_: Streamline._, data: any): any;
        };
    };
}

declare module 'ez-streams/devices/queue' {
    import { Reader } from 'ez-streams/reader';
    import { Writer } from 'ez-streams/writer';
    export interface Duplex<T> {
        reader: Reader<T>;
        writer: Writer<T>;
    }
    export function create<T>(max?: number): Streamline.Queue<T> & Duplex<T>;
}

declare module 'ez-streams/devices/net' {
    import { _ } from 'streamline-runtime';
    export interface ServerOptions {
    }
    export interface TcpStreamOptions {
    }
    export interface TcpStream {
    }
    export function server(listener?: (stream: TcpStream, _: _) => void, streamOptions?: TcpStreamOptions, serverOptions?: ServerOptions): any;
    export interface TcpClientOptions {
    }
    export function tcpClient(port: number, host?: string, options?: TcpClientOptions): any;
    export interface TcpSocketOptions {
    }
    export function socketClient(path: string, options: TcpSocketOptions): any;
}

declare module 'ez-streams/devices/node' {
    import { Reader } from 'ez-streams/reader';
    export interface NodeReaderOptions {
        encoding?: string;
    }
    export function fixOptions(options: NodeReaderOptions | string | undefined): NodeReaderOptions;
    export function reader(emitter: NodeJS.EventEmitter, options?: NodeReaderOptions | string): Reader<any>;
    export interface NodeWriterOptions {
    }
    export function writer(emitter: NodeJS.EventEmitter, options?: NodeWriterOptions): any;
}

declare module 'ez-streams/devices/std' {
    import { Reader } from 'ez-streams/reader';
    import { Writer } from 'ez-streams/writer';
    export const input: Input;
    export const output: Output;
    export const error: Output;
    export interface Input {
        (encoding: string): Reader<string>;
        (): Reader<Buffer>;
    }
    export interface Output {
        (encoding: string): Writer<string>;
        (): Writer<Buffer>;
    }
}

declare module 'ez-streams/devices/string' {
    import { Reader } from 'ez-streams/reader';
    import { Writer } from 'ez-streams/writer';
    export interface Options {
        sync?: boolean;
        chunkSize?: number | (() => number);
    }
    export class StringWriter extends Writer<string> {
        buf: string;
        constructor(options: Options);
        toString(): string;
        readonly result: string;
    }
    export function reader(text: string, options?: Options | number): Reader<string>;
    export function writer(options?: Options): StringWriter;
    export function factory(url: string): {
        reader: (_: Streamline._) => any;
        writer: (_: Streamline._) => any;
    };
}

declare module 'ez-streams/devices/uturn' {
    import { _ } from 'streamline-runtime';
    import { Reader } from 'ez-streams/reader';
    import { Writer } from 'ez-streams/writer';
    export interface Uturn<T> {
        reader: Reader<T>;
        writer: Writer<T>;
        end: (_: _) => void;
    }
    export function create<T>(): Uturn<T>;
}

declare module 'ez-streams/helpers/binary' {
    import { _ } from "streamline-runtime";
    import { Reader as BaseReader } from "ez-streams/reader";
    import { Writer as BaseWriter } from "ez-streams/writer";
    export interface ReaderOptions {
        endian?: 'big' | 'little';
    }
    export class Reader extends BaseReader<Buffer> {
        reader: BaseReader<Buffer>;
        options: ReaderOptions;
        pos: number;
        buf: Buffer | undefined;
        constructor(reader: BaseReader<Buffer>, options: ReaderOptions);
        readData(_: _, len?: number, peekOnly?: boolean): Buffer | undefined;
        ensure(_: _, len: number): number;
        peek(_: _, len: number): Buffer;
        unread(len: number): void;
    }
    export interface WriterOptions {
        endian?: 'big' | 'little';
        bufSize?: number;
    }
    export class Writer extends BaseWriter<Buffer> {
        writer: BaseWriter<Buffer>;
        options: WriterOptions;
        pos: number;
        buf: Buffer;
        constructor(writer: BaseWriter<Buffer>, options?: WriterOptions);
        flush(_: _): void;
        ensure(_: _, len: number): void;
        writeDate(_: _, buf: Buffer): void;
    }
    export interface BinaryReader extends Reader {
        read(_: _, len?: number): Buffer | undefined;
        readInt8(_: _): number;
        peekInt8(_: _): number;
        unreadInt8(): void;
        readInt16(_: _): number;
        peekInt16(_: _): number;
        unreadInt16(): void;
        readUInt16(_: _): number;
        peekUInt16(_: _): number;
        unreadUInt16(): void;
        readInt32(_: _): number;
        peekInt32(_: _): number;
        unreadInt32(): void;
        readUInt32(_: _): number;
        peekUInt32(_: _): number;
        unreadUInt32(): void;
        readFloat(_: _): number;
        peekFloat(_: _): number;
        unreadFloat(): void;
        readDouble(_: _): number;
        peekDouble(_: _): number;
        unreadDouble(): void;
    }
    export interface BinaryWriter extends Writer {
        writeInt8(_: _, val: number): void;
        writeInt16(_: _, val: number): void;
        writeUInt16(_: _, val: number): void;
        writeInt32(_: _, val: number): void;
        writeUInt32(_: _, val: number): void;
        writeFloat(_: _, val: number): void;
        writeDouble(_: _, val: number): void;
    }
    export function reader(reader: BaseReader<Buffer>, options?: ReaderOptions): BinaryReader;
    export function writer(writer: BaseWriter<Buffer>, options?: WriterOptions): BinaryWriter;
}

declare module 'ez-streams/mappers/convert' {
    export function stringify(encoding?: string): (_: Streamline._, data: Buffer) => string;
    export function bufferify(encoding?: string): (_: Streamline._, data: string) => Buffer;
}

declare module 'ez-streams/mappers/json' {
    export interface ParseOptions {
        sep?: string;
        encoding?: string;
    }
    export function parse(options?: ParseOptions): (_: Streamline._, data: string | Buffer) => any;
    export interface FormatterOptions {
        sep?: string;
        replacer?: (key: string, value: any) => any;
        space?: string;
    }
    export function stringify(options?: FormatterOptions): (_: Streamline._, data: any) => string;
}

declare module 'ez-streams/transforms/csv' {
    import { Reader } from "ez-streams/reader";
    import { Writer } from "ez-streams/writer";
    export interface ParserOptions {
        sep?: string;
        encoding?: string;
    }
    export function parser(options?: ParserOptions): (_: Streamline._, reader: Reader<string | Buffer>, writer: Writer<any>) => void;
    export interface FormatterOptions {
        sep?: string;
        eol?: string;
    }
    export function formatter(options?: FormatterOptions): (_: Streamline._, reader: Reader<any>, writer: Writer<string>) => void;
}

declare module 'ez-streams/transforms/cut' {
    import { Reader } from "ez-streams/reader";
    import { Writer } from "ez-streams/writer";
    export interface Options {
        size?: number;
    }
    export function transform<T>(options?: Options): (_: Streamline._, reader: Reader<T>, writer: Writer<T>) => any;
}

declare module 'ez-streams/transforms/json' {
    import { Reader } from "ez-streams/reader";
    import { Writer } from "ez-streams/writer";
    export interface ParserOptions {
        size?: number;
        encoding?: string;
        reviver?: (key: any, value: any) => any;
        unbounded?: boolean;
    }
    export function parser(options: ParserOptions): (_: Streamline._, reader: Reader<string | Buffer>, writer: Writer<any>) => void;
    export interface FormatterOptions {
        unbounded?: boolean;
        replacer?: (key: string, value: any) => any;
        space?: string;
    }
    export function formatter(options: FormatterOptions): (_: Streamline._, reader: Reader<any>, writer: Writer<string>) => void;
}

declare module 'ez-streams/transforms/lines' {
    import { _ } from "streamline-runtime";
    import { Reader } from "ez-streams/reader";
    import { Writer } from "ez-streams/writer";
    export interface ParserOptions {
        sep?: string;
        encoding?: string;
    }
    export function parser(options?: ParserOptions): (_: _, reader: Reader<string | Buffer>, writer: Writer<string>) => void;
    export interface FormatterOptions {
        eol?: string;
        extra?: boolean;
    }
    export function formatter(options: FormatterOptions): (_: Streamline._, reader: Reader<string>, writer: Writer<string>) => void;
}

declare module 'ez-streams/transforms/multipart' {
    import { Reader } from "ez-streams/reader";
    import { Writer } from "ez-streams/writer";
    export type ParserOptions = {
        [name: string]: string;
    };
    export function parser(options: ParserOptions): (_: Streamline._, reader: Reader<Buffer>, writer: Writer<any>) => void;
    export interface FormatterOptions {
        [name: string]: string;
    }
    export function formatter(options?: FormatterOptions): (_: Streamline._, reader: Reader<Reader<string>>, writer: Writer<Buffer>) => void;
}

declare module 'ez-streams/transforms/xml' {
    import { Reader } from "ez-streams/reader";
    import { Writer } from "ez-streams/writer";
    export interface ParserOptions {
        tags?: string;
        encoding?: string;
    }
    export function parser(options?: ParserOptions): (_: Streamline._, reader: Reader<string | Buffer>, writer: Writer<any>) => void;
    export interface FormatterOptions {
        tags?: string;
        indent?: string;
    }
    export interface Builder {
        beginTag: (tag: string) => void;
        addAttribute: (atb: string, val: any) => void;
        endTag: (close?: boolean) => void;
        closeTag: (tag: string, val?: any) => void;
        cdata: (data: string) => void;
        getResult: (extraIndent?: boolean) => string;
    }
    export function formatter(options?: FormatterOptions): (_: Streamline._, reader: Reader<any>, writer: Writer<string>) => void;
}

declare module 'ez-streams/predicate' {
    import { _ } from "streamline-runtime";
    export interface Options {
        allowEval?: boolean;
    }
    export type Predicate = (_: _, val: any) => boolean;
    export type Op = (val: any, parent?: any) => Predicate;
    export function converter(options?: Options): (val: any) => Predicate;
    export const convert: (val: any) => Predicate;
}

declare module 'ez-streams/reader' {
    /**
      * Copyright (c) 2013 Bruno Jouhier <bruno.jouhier@sage.com>
      *
      * Permission is hereby granted, free of charge, to any person
      * obtaining a copy of this software and associated documentation
      * files (the "Software"), to deal in the Software without
      * restriction, including without limitation the rights to use,
      * copy, modify, merge, publish, distribute, sublicense, and/or sell
      * copies of the Software, and to permit persons to whom the
      * Software is furnished to do so, subject to the following
      * conditions:
      *
      * The above copyright notice and this permission notice shall be
      * included in all copies or substantial portions of the Software.
      *
      * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
      * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
      * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
      * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
      * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
      * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
      * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
      * OTHER DEALINGS IN THE SOFTWARE.
      */
    import { _ } from "streamline-runtime";
    import { Writer } from 'ez-streams/writer';
    import * as nodeStream from "stream";
    export interface ParallelOptions {
        count?: number;
        shuffle?: boolean;
    }
    export interface CompareOptions<T> {
        compare?: (v1: T, v2: T) => number;
    }
    export interface Stoppable {
        stop: (_: _, arg?: any) => void;
    }
    export class Reader<T> {
        parent?: Stoppable;
        read: (_: _) => T | undefined;
        _stop: (_: _, arg?: any) => void;
        stopped: boolean;
        headers: {
            [name: string]: string;
        };
        constructor(read: (_: _) => T | undefined, stop?: (_: _, arg: any) => void, parent?: Stoppable);
        forEach(_: _, fn: (_: _, value: T, index: number) => void, thisObj?: any): any;
        map<U>(fn: (_: _, value: T, index: number) => U, thisObj?: any): Reader<U>;
        every(_: _, fn: ((_: _, value: T) => boolean) | {}, thisObj?: any): any;
        some(_: _, fn: ((_: _, value: T) => boolean) | {}, thisObj?: any): any;
        reduce<U>(_: _, fn: (_: _, prev: U, value: T) => U, v: U, thisObj?: any): U;
        pipe(_: _, writer: Writer<T>): any;
        tee(writer: Writer<T>): Reader<T>;
        dup(): [Reader<T>, Reader<T>];
        concat(...readers: (Reader<T> | Reader<T>[])[]): Reader<T>;
        toArray(_: _): T[];
        readAll(_: _): string | Buffer | T[] | undefined;
        transform<U>(fn: (_: _, reader: Reader<T>, writer: Writer<U>) => void, thisObj?: any): Reader<U>;
        filter(fn: ((_: _, value: T, index: number) => boolean) | {}, thisObj?: any): Reader<T>;
        until(fn: ((_: _, value: T, index: number) => boolean) | {}, thisObj?: any, stopArg?: any): Reader<T>;
        while(fn: ((_: _, value: T, index: number) => boolean) | {}, thisObj?: any, stopArg?: any): Reader<T>;
        limit(n: number, stopArg?: any): Reader<T>;
        skip(n: number): Reader<T>;
        fork(consumers: ((source: any) => Reader<T>)[]): StreamGroup<T>;
        parallel(options: ParallelOptions | number, consumer: (source: any) => Reader<T>): Reader<{}>;
        peekable(): PeekableReader<T>;
        buffer(max: number): Reader<{}>;
        join(streams: Reader<T>[] | Reader<T>, thisObj?: any): Reader<{}>;
        nodify(): any;
        nodeTransform(duplex: nodeStream.Duplex): any;
        compare(_: _, other: Reader<T>, options: CompareOptions<T>): number;
        stop(_: _, arg?: any): void;
    }
    export class PeekableReader<T> extends Reader<T> {
        buffered: (T | undefined)[];
        constructor(parent: Reader<T>);
        unread(val: T | undefined): this;
        peek(_: _): T;
    }
    export function create<T>(read: (_: _) => T, stop?: (_: _, arg: any) => void): Reader<T>;
    export class StreamGroup<T> implements Stoppable {
        readers: (Reader<T> | null)[];
        constructor(readers: Reader<T>[]);
        stop(_: _, arg?: any): void;
        dequeue(): Reader<{}>;
        rr(): Reader<T>;
        join(fn: (_: _, values: (T | undefined)[]) => T | undefined, thisObj?: any): Reader<{}>;
    }
}

declare module 'ez-streams/writer' {
    /**
      * Copyright (c) 2013 Bruno Jouhier <bruno.jouhier@sage.com>
      *
      * Permission is hereby granted, free of charge, to any person
      * obtaining a copy of this software and associated documentation
      * files (the "Software"), to deal in the Software without
      * restriction, including without limitation the rights to use,
      * copy, modify, merge, publish, distribute, sublicense, and/or sell
      * copies of the Software, and to permit persons to whom the
      * Software is furnished to do so, subject to the following
      * conditions:
      *
      * The above copyright notice and this permission notice shall be
      * included in all copies or substantial portions of the Software.
      *
      * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
      * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
      * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
      * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
      * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
      * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
      * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
      * OTHER DEALINGS IN THE SOFTWARE.
      */
    import { _ } from "streamline-runtime";
    import * as nodeStream from "stream";
    export class Writer<T> {
        write: (_: _, value?: T) => Writer<T>;
        ended: boolean;
        constructor(write: (_: _, value: T) => Writer<T>, stop?: (_: _, arg?: any) => Writer<T>);
        writeAll(_: _, val: T): this;
        stop(_: _, arg?: any): Writer<T>;
        end(): this;
        readonly pre: Pre<T>;
        nodify(): nodeStream.Writable;
    }
    export function create<T>(write: (_: _, value: T) => Writer<T>, stop?: (_: _, arg?: any) => Writer<T>): Writer<T>;
    export class Pre<T> {
        writer: Writer<T>;
        constructor(writer: Writer<T>);
    }
}

declare module 'ez-streams/factory' {
    export interface PackageFactory {
        protocol: string;
        module: string;
    }
    export default function (url: string): any;
}

