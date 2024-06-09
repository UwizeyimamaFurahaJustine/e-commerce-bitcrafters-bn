import dotenv from 'dotenv'

dotenv.config()
export const POSTGRES_HOST = process.env.POSTGRES_HOST
export const DOCKER_POSTGRES_PORT = parseInt(
  process.env.DOCKER_POSTGRES_PORT,
  10,
)
export const DOCKER_LOCAL_PORT = parseInt(process.env.DOCKER_LOCAL_PORT, 10)
export const PORT = parseInt(process.env.PORT, 10) || 3000
export const POSTGRES_PORT = parseInt(process.env.POSTGRES_PORT, 10)
export const JWT_SECRET = process.env.JWT_SECRET || 'USER-AUTH'
export const DB_HOST_TYPE = process.env.DB_HOST_TYPE
export const DEV_DATABASE_URL = process.env.DEV_DATABASE_URL
export const TEST_DATABASE_URL = process.env.TEST_DATABASE_URL
export const PROD_DATABASE_URL = process.env.PROD_DATABASE_URL
export const CLIENT_ID = process.env.CLIENT_ID
export const CLIENT_SECRET = process.env.CLIENT_SECRET
export const CALLBACK_URL = process.env.CALLBACK_URL
export const JWT_EXPIRE_TIME = process.env.JWT_EXPIRE_TIME || '7d'
export const SECURE = process.env.SECURE
export const NODEMAILER_SERVICE = process.env.NODEMAILER_SERVICE
export const NODEMAILER_HOST = process.env.NODEMAILER_HOST
export const NODEMAILER_EMAIL_PORT = parseInt(
  process.env.NODEMAILER_EMAIL_PORT,
  10,
)
export const NODEMAILER_SECURE = process.env.NODEMAILER_SECURE === 'true'
export const NODEMAILER_USER = process.env.NODEMAILER_USER
export const NODEMAILER_PASS = process.env.NODEMAILER_PASS
export const NODEMAILER_BASE_URL = process.env.NODEMAILER_BASE_URL
export const REDIS_PASSWORD = process.env.REDIS_PASSWORD
export const REDIS_HOST = process.env.REDIS_HOST
export const REDIS_PORT = parseInt(process.env.REDIS_PORT, 10)
export const SLAT_ROUNDS = parseInt(process.env.SLAT_ROUND, 10) || 10
export const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME
export const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY
export const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET
export const JWT_SECRET_RESET = process.env.JWT_SECRET_RESET
export const CRON_TIME = process.env.CRON_TIME
export const PASSWORD_EXPIRATION_TIME =parseInt(process.env.PASSWORD_EXPIRATION_TIME) || 90
export const URL = process.env.URL
export const MOMO_API_KEY =  process.env.MOMO_API_KEY
export const MOMO_XREFERENCED =  process.env.MOMO_XREFERENCED
export const MOMO_URL =  process.env.MOMO_URL
export const MOMO_SUBSCRIPTION_KEY =  process.env.MOMO_SUBSCRIPTION_KEY
export const MOMO_TARGET_ENV  =  process.env.MOMO_TARGET_ENV 
export const MOMO_CALLBACK_URL  =  process.env.MOMO_CALLBACK_URL 
export const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY
export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET

