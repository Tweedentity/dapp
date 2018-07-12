
class ClientApi {

  fetch(api, method, body) {
    const url = `${window.location.origin}/api/${api}?r=${Math.random()}`
    // if (window.DEV) {
    //   console.log(`Calling ${url}`)
    // }
    return fetch(url, {
      method,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    }).then(response => response.json())

  }

}


module.exports = new ClientApi
