import path from 'path'
import express, { Application, Request, Response } from 'express'
import http from 'http'
import bodyParser from 'body-parser'
// import localtunnel from "localtunnel"
import cors from 'cors'
import compression from 'compression'
import dotenv from 'dotenv'
import swaggerUi from 'swagger-ui-express'
import 'express-async-errors'
import { Server } from 'socket.io'
import specs from './src/utils/swagger'
import userRoute from './src/routes/userRoute'
import loginRoute from './src/routes/loginRoute'
import productRoute from './src/routes/productRoute'
import wishlistRoute from './src/routes/wishlistRoute'
import cartRoute from './src/routes/cartRoute'
import notificationRoute from './src/routes/notificationRoute'
import checkoutRoute from './src/routes/checkoutRoute'
import orderRoute from './src/routes/orderRoute'
import chatRoute from './src/routes/chatRoute'
import MoMoRoute from './src/routes/MoMoRoute'
import sequelizeConnection from './src/database/config/db.config' // Assuming you have a sequelize instance exported
import User from './src/database/models/userModel'
import Product from './src/database/models/productModel'
import Review from './src/database/models/reviewsModel'
import { PORT } from './src/config'
import passport from './src/config/passport'
import { ErrorHandler, notFoundHandler } from './src/utils/errorHandler'
import registerSocketEvents from './src/utils/socketEvents'
import socketAuthMiddleware from './src/middlewares/socketMiddleware'
import productExpiryCron from './src/controllers/productExpiryCronJob'
import registerChatNamespace from './src/utils/chatNamespace'
import stripeRoute from './src/routes/stripeRoute'
import paymentRoute from './src/routes/paymentStripeRoute'
import { passwordExpiryCron } from './src/utils/passwordUpdateEvent'

dotenv.config()

const app: Application = express()

app.use(passport.initialize())
// Serve Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs))

app.use(cors({ credentials: true }))
app.use(compression())
app.use(bodyParser.json())
app.use('/stripe-webhook', express.raw({type: 'application/json'}), stripeRoute)
app.use(express.static('public'))
// Routes
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({ message: 'Welcome to my E-Commerce API' })
})
app.use('/stripe-return', stripeRoute);
app.use('/users', userRoute)
app.use('/users', loginRoute)
app.use('/collections', productRoute)
app.use('/wishlist', wishlistRoute)
app.use('/cart', cartRoute)
app.use('/orders', orderRoute)
app.use('/notifications', notificationRoute)
app.use('/checkout', checkoutRoute)
app.use('/chat', chatRoute)
app.use('/payment', MoMoRoute)
app.use('/payment', paymentRoute)

app.use(notFoundHandler)

app.use(ErrorHandler)

Product.associate()
Review.associate({ Product, User })

const server = http.createServer(app)
server.listen(PORT)
// databse connection
sequelizeConnection.authenticate()
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
})
io.use(socketAuthMiddleware)
registerSocketEvents(io)
registerChatNamespace(io)
productExpiryCron()
passwordExpiryCron()

export { app, server, sequelizeConnection }
