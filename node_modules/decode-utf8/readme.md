# Decode UTF8

Turn an ArrayBuffer or Uint8Array of UTF8 data into a string.

## Installation

```js
npm install --save decode-uf8
```

## Usage

```js
const decodeUtf8 = require('decode-utf8')

console.log(decodeUtf8(Uint8Array.of(72, 101, 108, /* ... */ 108, 100, 33)))
//=> Hello, World!

console.log(decodeUtf8(Uint8Array.of(240, 159, 144, /* ... */ 159, 153, 138)))
//=> 🐵 🙈 🙉 🙊
```

## API

### `decodeUtf8(input: ArrayBuffer | Uint8Array): string`

Returns a string representing the `input` data interpreted as UTF8.
