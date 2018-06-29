module.exports = {
  registry: {
    address: {
      ropsten: "0xf7BD7B1A06EBC32012A6A8B5fF1572fB821A043F",
      main: ""
    }
  },
  defaultAvatar: {
    reddit: "https://www.redditstatic.com/avatars/avatar_default_15_A5A4A4.png",
    twitter: "https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png"
  },
  decoration: {
    reddit: "u/",
    twitter: "@"
  },
  forPost: {
    twitter: (post) => `https://twitter.com/intent/tweet?text=${escape(post)}&source=webclient`,
    reddit: () => `https://redd.it/8u3ywj`
  },
  account: {
    twitter: '@tweedentity',
    reddit: 'u/tweedentity'
  },
  appId: {
    twitter: 1,
    reddit: 2
  },
  profileOnApp: {
    twitter: (username) => `https://twitter.com/${username}`,
    reddit: (username) => `https://www.reddit.com/user/${username}`
  }
}
