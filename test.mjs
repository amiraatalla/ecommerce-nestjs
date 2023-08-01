import jsSHA256 from "jssha"
const test = new jsSHA256("SHA-256", "TEXT")
console.log(test.getHash("HEX"))
