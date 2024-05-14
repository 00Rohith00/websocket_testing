import * as dotenv from 'dotenv'
dotenv.config()
// env exports
export const port = process.env.PORT

// defining the mode
const mode = {
    forDeployment: "deployment",
    forTesting: "testing",
    forDevelopment: "development"
}

// change the mode to switch different environments
export const prod = {
    mode: mode.forDevelopment,
}
