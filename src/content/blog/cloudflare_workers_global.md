---
title: Cloudflare Workers で使えるグローバル変数を一覧する
pubDatetime: 2022-07-06T20:47:34+09:00
slug: cloudflare_workers_global
featured: false
draft: false
tags:
  - cloudflare
  - typescript
description: Cloudflare Workers で使えるグローバル変数を一覧する方法を紹介しました
---

Cloudflare Workers では **Module Worker Syntax** と **Service Worker Syntax** の２つの記述方式が存在している。
Service Worker Syntax を利用している場合、環境変数はすべてグローバル変数として利用可能になる。

この方法はデバッグ目的とかで使える多分便利な技である。

```ts
addEventListener("fetch", (event: FetchEvent) => {
  // @ts-ignore
  console.log({ ...global });
  event.respondWith(new Response("Hello, World!!"));
});
```

コードを読んで分かる通り、グローバルで扱えるものすべて `global` 変数に格納されている。これは `@cloudflare/workers-types` にも定義されていないため `@ts-ignore` する必要がある。

実行した結果はこんな感じになる。

{/_ more _/}

https://gist.github.com/Code-Hex/5eb472e1f1df34cbc68e8bbf89a30adb

```
{
  global: ServiceWorkerGlobalScope {},
  self: ServiceWorkerGlobalScope {},
  addEventListener: [Function: addEventListener],
  removeEventListener: [Function: removeEventListener],
  dispatchEvent: [Function: dispatchEvent],
  console: Object [console] {
    log: [Function: log],
    warn: [Function: warn],
    dir: [Function: dir],
    time: [Function: time],
    timeEnd: [Function: timeEnd],
    timeLog: [Function: timeLog],
    trace: [Function: trace],
    assert: [Function: assert],
    clear: [Function: clear],
    count: [Function: count],
    countReset: [Function: countReset],
    group: [Function: group],
    groupEnd: [Function: groupEnd],
    table: [Function: table],
    debug: [Function: debug],
    info: [Function: info],
    dirxml: [Function: dirxml],
    error: [Function: error],
    groupCollapsed: [Function: groupCollapsed],
    Console: [Function: Console],
    profile: [Function: profile],
    profileEnd: [Function: profileEnd],
    timeStamp: [Function: timeStamp],
    context: [Function: context]
  },
  setTimeout: [Function (anonymous)],
  setInterval: [Function (anonymous)],
  clearTimeout: [Function: clearTimeout],
  clearInterval: [Function: clearInterval],
  queueMicrotask: [Function: queueMicrotask],
  scheduler: Scheduler {},
  atob: [Function: atob],
  btoa: [Function: btoa],
  Math: Object [Math] {},
  crypto: Crypto {},
  CryptoKey: [Function: bound CryptoKey],
  TextDecoder: [class TextDecoder],
  TextEncoder: [class TextEncoder],
  fetch: [AsyncFunction: fetch],
  Headers: [class Headers],
  Request: [class Request extends Body],
  Response: [class Response extends Body],
  FormData: [class FormData] { name: 'FormData' },
  Blob: [class Blob],
  File: [class File extends Blob],
  URL: [class URL],
  URLSearchParams: [class URLSearchParams],
  URLPattern: [class URLPattern],
  ByteLengthQueuingStrategy: [class ByteLengthQueuingStrategy],
  CountQueuingStrategy: [class CountQueuingStrategy],
  ReadableByteStreamController: [class ReadableByteStreamController],
  ReadableStream: [class ReadableStream],
  ReadableStreamBYOBReader: [class ReadableStreamBYOBReader],
  ReadableStreamBYOBRequest: [class ReadableStreamBYOBRequest],
  ReadableStreamDefaultController: [class ReadableStreamDefaultController],
  ReadableStreamDefaultReader: [class ReadableStreamDefaultReader],
  TransformStream: [class TransformStream],
  TransformStreamDefaultController: [class TransformStreamDefaultController],
  WritableStream: [class WritableStream],
  WritableStreamDefaultController: [class WritableStreamDefaultController],
  WritableStreamDefaultWriter: [class WritableStreamDefaultWriter],
  FixedLengthStream: [class FixedLengthStream extends TransformStream],
  Event: [class Event] {
    NONE: 0,
    CAPTURING_PHASE: 1,
    AT_TARGET: 2,
    BUBBLING_PHASE: 3
  },
  EventTarget: [class EventTarget] { [Symbol(nodejs.event_target)]: true },
  AbortController: [class AbortController],
  AbortSignal: [class AbortSignal extends EventTarget],
  FetchEvent: [class FetchEvent extends Event],
  ScheduledEvent: [class ScheduledEvent extends Event],
  DOMException: [class DOMException2 extends Error] {
    INDEX_SIZE_ERR: 1,
    DOMSTRING_SIZE_ERR: 2,
    HIERARCHY_REQUEST_ERR: 3,
    WRONG_DOCUMENT_ERR: 4,
    INVALID_CHARACTER_ERR: 5,
    NO_DATA_ALLOWED_ERR: 6,
    NO_MODIFICATION_ALLOWED_ERR: 7,
    NOT_FOUND_ERR: 8,
    NOT_SUPPORTED_ERR: 9,
    INUSE_ATTRIBUTE_ERR: 10,
    INVALID_STATE_ERR: 11,
    SYNTAX_ERR: 12,
    INVALID_MODIFICATION_ERR: 13,
    NAMESPACE_ERR: 14,
    INVALID_ACCESS_ERR: 15,
    VALIDATION_ERR: 16,
    TYPE_MISMATCH_ERR: 17,
    SECURITY_ERR: 18,
    NETWORK_ERR: 19,
    ABORT_ERR: 20,
    URL_MISMATCH_ERR: 21,
    QUOTA_EXCEEDED_ERR: 22,
    TIMEOUT_ERR: 23,
    INVALID_NODE_TYPE_ERR: 24,
    DATA_CLONE_ERR: 25
  },
  WorkerGlobalScope: [class WorkerGlobalScope extends ThrowingEventTarget],
  structuredClone: [Function: structuredClone],
  ArrayBuffer: [Function: ArrayBuffer],
  Atomics: Object [Atomics] {},
  BigInt64Array: [Function: BigInt64Array],
  BigUint64Array: [Function: BigUint64Array],
  DataView: [Function: DataView],
  Date: [Function: Date],
  Float32Array: [Function: Float32Array],
  Float64Array: [Function: Float64Array],
  Int8Array: [Function: Int8Array],
  Int16Array: [Function: Int16Array],
  Int32Array: [Function: Int32Array],
  Map: [Function: Map],
  Set: [Function: Set],
  SharedArrayBuffer: [Function: SharedArrayBuffer],
  Uint8Array: [Function: Uint8Array],
  Uint8ClampedArray: [Function: Uint8ClampedArray],
  Uint16Array: [Function: Uint16Array],
  Uint32Array: [Function: Uint32Array],
  WeakMap: [Function: WeakMap],
  WeakSet: [Function: WeakSet],
  WebAssembly: Object [WebAssembly] {
    compile: [Function: compile],
    validate: [Function: validate],
    instantiate: [Function: instantiate],
    compileStreaming: [Function: compileStreaming],
    instantiateStreaming: [Function: instantiateStreaming]
  },
  MINIFLARE: true,
  caches: CacheStorage {},
  HTMLRewriter: [class HTMLRewriter],
  MessageEvent: [class MessageEvent extends Event],
  CloseEvent: [class CloseEvent extends Event],
  WebSocketPair: [Function: WebSocketPair],
  WebSocket: [class WebSocket extends InputGatedEventTarget],
  PROJECT_ID: 'example-project12345',
  kv_namespaces: [ { binding: 'KV', id: '', preview_id: '' } ],
  tsconfig: './tsconfig.json'
}
```
