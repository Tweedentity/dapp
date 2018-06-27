module.exports = {
  registry: {
    address: {
      ropsten: "0x943001e88D5A81f634F917bC075038fDc2DA259D",
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
  }
}
