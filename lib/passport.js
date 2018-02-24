const config = require('config')
const createError = require('http-errors')
const GitHubStrategy = require('passport-github')
const passport = module.exports = require('koa-passport')

const USERS = config.USERS || []

passport.use(new GitHubStrategy({
  clientID: config.GITHUB.CLIENT_ID,
  clientSecret: config.GITHUB.CLIENT_SECRET,
  callbackURL: `${config.HOST}/auth/github/callback`
}, (accessToken, refreshToken, profile, cb) => {
  const user = {id: 'github:' + profile.username}
  cb(null, user)
}
))

passport.serializeUser((user, done) => {
  done(null, user.id)
})

passport.deserializeUser(async (userId, done) => {
  try {
    const user = await fetchUser(userId)
    done(null, user)
  } catch (err) {
    done(err)
  }
})

async function fetchUser (userId) {
  if (~USERS.indexOf(userId)) {
    return {id: userId}
  }
  throw createError(401)
}
