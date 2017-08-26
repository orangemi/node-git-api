import * as config from 'config'
import * as createError from 'http-errors'
import * as GitHubStrategy from 'passport-github'
import * as passport from 'koa-passport'

const USERS = config.USERS || []

interface PassportUser {
  id: string,
}

passport.use(new GitHubStrategy({
  clientID: config.GITHUB.CLIENT_ID,
  clientSecret: config.GITHUB.CLIENT_SECRET,
  callbackURL: `${config.HOST}/auth/github/callback`
}, (accessToken, refreshToken, profile, cb) => {
  cb(null, <PassportUser>{
    id: 'github:' + profile.username
  })
}
))

passport.serializeUser((user: PassportUser, done) => {
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
export default passport
