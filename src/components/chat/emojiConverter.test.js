import convertToEmoji from './emojiConverter'

describe('convertToEmoji', () => {
  it('should convert :) to 😃', () => {
    expect(convertToEmoji(':)')).toBe('😃')
  })

  it('should convert <3 to ❤️', () => {
    expect(convertToEmoji('<3')).toBe('❤️')
  })

  it('should convert :hmm to 🤔', () => {
    expect(convertToEmoji(':hmm')).toBe('🤔')
  })

  it('should convert :party to 🎉', () => {
    expect(convertToEmoji(':party')).toBe('🎉')
  })

  it('should convert :cool to 😎', () => {
    expect(convertToEmoji(':cool')).toBe('😎')
  })

  it('should convert :sleep to 😴', () => {
    expect(convertToEmoji(':sleep')).toBe('😴')
  })

  it('should convert :( to 😞', () => {
    expect(convertToEmoji(':(')).toBe('😞')
  })

  it('should convert multiple emojis in a string', () => {
    expect(convertToEmoji('Hello :) :cool')).toBe('Hello 😃 😎')
  })

  it('should not affect strings without emoji codes', () => {
    expect(convertToEmoji('Hello world')).toBe('Hello world')
  })
})
