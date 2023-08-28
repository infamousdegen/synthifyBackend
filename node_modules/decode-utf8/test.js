/* eslint-env mocha */

'use strict'

const assert = require('assert')
const decodeUtf8 = require('./')

const testCases = [
  'ﾟ･✿ヾ╲(｡◕‿◕｡)╱✿･ﾟ',
  '𝌆',
  '🐵 🙈 🙉 🙊',
  '💩',
  'åß∂ƒ©˙∆˚¬…æ',
  'Hello, World!',
  'Powerلُلُصّبُلُلصّبُررً ॣ ॣh ॣ ॣ冗',
  '𝕿𝖍𝖊 𝖖𝖚𝖎𝖈𝖐 𝖇𝖗𝖔𝖜𝖓 𝖋𝖔𝖝 𝖏𝖚𝖒𝖕𝖘 𝖔𝖛𝖊𝖗 𝖙𝖍𝖊 𝖑𝖆𝖟𝖞 𝖉𝖔𝖌',
  '사회과학원 어학연구소'
]

const badStrings = [
  {
    bytes: [0x61, 0x62, 0x63, 0x31, 0x32, 0x33],
    name: 'Sanity check'
  },
  {
    bytes: [0xef, 0xbf, 0xbd],
    name: 'Surrogate half (low)'
  },
  {
    bytes: [0xef, 0xbf, 0xbd],
    name: 'Surrogate half (high)'
  },
  {
    bytes: [0x61, 0x62, 0x63, 0xef, 0xbf, 0xbd, 0x31, 0x32, 0x33],
    name: 'Surrogate half (low), in a string'
  },
  {
    bytes: [0x61, 0x62, 0x63, 0xef, 0xbf, 0xbd, 0x31, 0x32, 0x33],
    name: 'Surrogate half (high), in a string'
  },
  {
    bytes: [0xef, 0xbf, 0xbd, 0xef, 0xbf, 0xbd],
    name: 'Wrong order'
  }
]

describe('encode-utf8', () => {
  describe('test strings', () => {
    for (const input of testCases) {
      it(`should decode "${input}"`, () => {
        const actual = decodeUtf8(Buffer.from(input, 'utf8'))

        assert.strictEqual(actual, input)
      })
    }
  })

  describe('web platform test', () => {
    for (const testCase of badStrings) {
      it(testCase.name, () => {
        const actual = decodeUtf8(new Uint8Array(testCase.bytes))
        const expected = Buffer.from(testCase.bytes).toString()

        assert.strictEqual(actual, expected)
      })
    }
  })

  describe('ArrayBuffer input', () => {
    it('should accept an ArrayBuffer as input', () => {
      const expected = 'Hello, World!'
      const input = Uint8Array.from(Buffer.from(expected)).buffer
      const actual = decodeUtf8(input)

      assert.strictEqual(actual, expected)
    })
  })
})
