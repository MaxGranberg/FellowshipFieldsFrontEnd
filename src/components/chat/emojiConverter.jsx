const convertToEmoji = (inputString) => {
  let string = inputString
  string = string.replace(/:\)/g, String.fromCodePoint(0x1F603))
  string = string.replace(/<3/g, String.fromCodePoint(0x2764))
  string = string.replace(/:hmm/g, String.fromCodePoint(0x1F914))
  string = string.replace(/:party/g, String.fromCodePoint(0x1F389))
  string = string.replace(/:cool/g, String.fromCodePoint(0x1F60E))
  string = string.replace(/:sleep/g, String.fromCodePoint(0x1F634))
  string = string.replace(/:\(/g, String.fromCodePoint(0x1F61E))
  return string
}
export default convertToEmoji
