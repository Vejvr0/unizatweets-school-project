const express = require('express');
const cors = require('cors');
const session = require('express-session');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo');
const app = express();

const whitelist = [
    'http://localhost:5173',
    'http://localhost:5173',
    'http://localhost:8887',
    'http://localhost:8888',
    'http://127.0.0.1:8888',
    'http://localhost:8080',
    'http://127.0.0.1:8080',
    'http://localhost:5500',
    'http://127.0.0.1:5500'
]

app.use(cors({
    origin: function (origin, callback) {
        if (whitelist.indexOf(origin) !== -1 || !origin) {
            callback(null, true);
        } else {
            callback(new Error('CORS Error: Pôvod ' + origin + ' nie je povolený.'));
        }
    },
    credentials: true
}));
app.use(express.json());
app.use(session({
    secret: "password",
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        maxAge: 1000 * 60 * 60 * 1,
        sameSite: 'Lax'
    },
    store: MongoStore.create({
        mongoUrl: "mongodb://localhost:27017/database"
    })
}));

mongoose.connect('mongodb://localhost:27017/database')
.then(() => console.log('MongoDB je pripojená'))
.catch(err => console.error(err));

const UserSchema = new mongoose.Schema({
    name: {type: String, required: true},
    surname: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
});

const User = mongoose.model('User', UserSchema);

const TweetSchema = new mongoose.Schema({
    text: {type: String, required: true},
    author: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    date: {type: Date, default: Date.now},
    likes: {type: Number, default: 0},
});

const Tweet = mongoose.model('Tweet', TweetSchema);

const LikesSchema = new mongoose.Schema({
    tweet: {type: mongoose.Schema.Types.ObjectId, ref: 'Tweet', required: true},
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
});

const Likes = new mongoose.model('Likes', LikesSchema);

async function CreateUser(name, surname, email, pass) {
    const user = new User({
        name: name,
        surname: surname,
        email: email,
        password: pass
    });
    return await user.save();
}

async function CreateTweet(text, author) {
    const tweet = new Tweet({
        text: text,
        author: author,
    });
    return await tweet.save();
}

async function toggleLike(tweetId, userId) {
    const existing = await Likes.findOne({ tweet: tweetId, user: userId });
    if (existing) {
      await Likes.deleteOne({ _id: existing._id });
      const updated = await Tweet.findByIdAndUpdate(tweetId, { $inc: { likes: -1 } }, { new: true });
      return { liked: false, likes: updated.likes };
    } else {
      await Likes.create({ tweet: tweetId, user: userId });
      const updated = await Tweet.findByIdAndUpdate(tweetId, { $inc: { likes: 1 } }, { new: true });
      return { liked: true, likes: updated.likes };
    }
}

app.post('/login', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.logEmail });
        if (!user) {
            return res.json({success: false, error: "Užívateľ sa nenašiel!"});
        }
        if (user.password !== req.body.logPass) {
            return res.json({success: false, error: "Nesprávne heslo!"});
        }
        req.session.userId = user._id;
        return res.json({success: true, userID: user._id});
    } catch (err) {
        return res.json({success: false, error: "Nastala chyba!"});
    }
});

app.post('/register', async (req, res) => {
    try {
        await CreateUser(req.body.regName, req.body.regSurname, req.body.regEmail, req.body.regPass);
        return res.json({success: true});
    } catch (err) {
        if (err.code === 11000) {
            return res.json({success: false, error: "Užívateľ s rovnakým emailom už existuje!"})
        } else {
            return res.json({success: false, error: "Nastala chyba!"});
        }
    }
});

app.get('/profile', async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({success: false, error: "Neprihlásený!"});
    }
    const user = await User.findById(req.session.userId).select('-password');
    return res.json({success: true, user});
});

app.post('/logout', (req, res) => {
    req.session.destroy(() => {
      return res.json({success: true});
    });
});

app.post('/userEdit', async (req, res) => {
    if (!req.session?.userId) {
        return res.status(401).json({success: false, error: "Neprihlásený!"});
    }
    try {
        const update = {
            name: req.body.userName,
            surname: req.body.userSurname,
            email: req.body.userEmail,
        };
        if (req.body.userNewPass) {
            update.password = req.body.userNewPass;
        }
        const user = await User.findByIdAndUpdate(req.session.userId, update, { new: true, runValidators: true }).select('-password');
        return res.json({ success: true, user });
    } catch (err) {
        console.error(err);
        return res.status(500).json({success: false, error: "Nastala chyba pri ukladaní!"});
    }
});

app.post('/postTweet', async (req, res) => {
    if (!req.session?.userId) {
        return res.status(401).json({success: false, error: "Neprihlásený!"});
    }
    try {
        await CreateTweet(req.body.tweetText, req.session.userId);
        return res.json({success: true});
    } catch (err) {
        return res.status(500).json({success: false, error: "Nastala chyba pri postovaní tweetu!"});
    }
});

app.post('/removeTweet', async (req, res) => {
    if (!req.session?.userId) {
        return res.status(401).json({success: false, error: "Neprihlásený!"});
    }
    try {
        const tweet = await Tweet.findOneAndDelete({ _id: req.body.tweetID, author: req.session.userId });
        if (!tweet) {
            return res.status(404).json({success: false, error: "Tweet sa nenašiel alebo ti nepatrí!"});
        }
        await Likes.deleteMany({ tweet: tweet._id });
        return res.json({success: true});
    } catch (err) {
        return res.status(500).json({success: false, error: "Nastala chyba pri vymazavaní tweetu!"});
    }
});

app.get('/loadTweets', async (req, res) => {
    try {
        const sortOrder = req.query.order === 'asc' ? 1 : -1;
        const tweets = await Tweet.find({})
            .populate('author', 'name surname')
            .sort({ date: sortOrder });

        const likedTweetIds = await Likes.find({
            tweet: { $in: tweets.map(t => t._id) },
            user: req.session.userId,
        }).distinct('tweet');

        const likedSet = new Set(likedTweetIds.map(id => id.toString()));

        const result = tweets.map(tweet => ({
            ...tweet.toObject(),
            isLiked: likedSet.has(tweet._id.toString()),
        }));

        return res.json({ success: true, tweets: result });
    } catch (err) {
        return res.status(500).json({ success: false, error: "Chyba pri načitaní tweetov!" });
    }
});

app.post('/likeTweet', async (req, res) => {
    if (!req.session?.userId) {
        return res.status(401).json({success: false, error: "Neprihlásený!"});
    }
    try {
        const like = await toggleLike(req.body.tweetID, req.session.userId);
        return res.json({success: true, like});
    } catch (err) {
        return res.status(500).json({success: false, error: "Chyba pri načitaní tweetov!"});
    }
});

app.listen(3000, () => {
  console.log('Server beží na porte 3000');
});
