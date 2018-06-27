class Utils {


  static formatNumber(num) {

    if (num == '-') {
      return num
    }

    if (/[^\d\.]/.test('' + num)) {
      return 0
    }

    let res = ('' + num).split('.')
    if (res[0].length > 3) {
      let str = ''
      for (let i = res[0].length - 1, j = 0; i >= 0; i--, j++) {
        let comma = j != 0 && !(j % 3) ? ',' : ''


        str = res[0][i] + comma + str
      }
      res[0] = str
    }
    return res[0] //+ (res[1] ? '.' + res[1].substring(0, 2) : '')
  }

}

module.exports = Utils
