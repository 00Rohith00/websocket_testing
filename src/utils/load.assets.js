export const loadAssets = () => {
    const loadEnvBoolean = Boolean(Number(process.env.LOAD_ENV))
    return loadEnvBoolean
}
