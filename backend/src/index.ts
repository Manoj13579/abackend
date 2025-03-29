import express from 'express';
import 'dotenv/config';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import connectDb from './config/db';
import indexRouter from './routes/indexRouter';
import session from 'express-session';
import passport from 'passport';
import MongoStore from "connect-mongo";
import { stripeWebhooks } from './controllers/webhooks';





const app = express();

app.set("trust proxy", 1); // Trust first proxy (e.g., Render's proxy)


app.use(session({
    secret: process.env.SESSION_SECRET_KEY!,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      collectionName: "sessions",
       // remove the session document from the mongodb when cookie expires
       autoRemove: "native",
    }),
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: 'none',
      path: '/',
      maxAge: 24 * 60 * 60 * 1000,
    },
  }));
  



  

  app.use(passport.initialize());
  app.use(passport.session());


app.use(cookieParser());


const corsOptions = {
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "HEAD", "PATCH"],
};
  app.use(cors(corsOptions));

  app.post('/api/stripe',  express.raw({ type: 'application/json' }), stripeWebhooks);

app.use(express.json());
app.use('/', indexRouter);


// in ts PORT should be different here 4000 n env 5000
const PORT = process.env.PORT || 4000

app.listen(PORT, (error) => {
    if(!error){
        connectDb();
        console.log(`server started at http://localhost:${PORT}`);
    }
    else{
        console.log('server starting error', error);
    }
    
});