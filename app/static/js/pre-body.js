
if (/^www\./.test(location.host)) {
  location.replace(`${location.protocol}//${location.host.replace(/$www\./,'')}/${location.pathname}`)
}
