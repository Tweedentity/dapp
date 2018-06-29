
if (/^www\./.test(location.host)) {
  location.replace(`${location.protocol}//${location.host.replace(/^www\./,'')}${location.pathname}${location.hash}`)
} else if (/^app\./.test(location.host)) {
  location.replace(`${location.protocol}//${location.host.replace(/^app\./,'dapp.')}${location.pathname}${location.hash}`)
}
