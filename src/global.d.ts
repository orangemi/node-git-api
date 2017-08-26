interface PackageJson {
  name: string,
  version: string,
}

interface VersionJson {
  commit: string,
  buildTime: Date,
}

declare module 'config' {
  interface Config {
    HOST: string,
    PORT: number,
    SSH_HOST: string,
    REPO_PATH: string
    SESSION: {
      KEY: string,
      NAME: string,
    },
    USERS: Array<string>,
    GITHUB: {
      CLIENT_ID: string,
      CLIENT_SECRET: string,
    },
    GA: string,
    ENV: string,
  }

  const config: Config
  export = config
}