var express = require ('express');
var path = require ('path');
var mongoose = require('mongoose');
var config = require ('./config/database')
var bodyParser = require('body-parser');
var session = require('express-session');
var expressValidator = require('express-validator');
var fileUpload = require('express-fileupload');
var passport = require('passport');
// var router = express.Router()

//connect to db
mongoose.connect(config.database);
var db = mongoose.connection;
db.on('error', console.error.bind(console,'connection error:'));
db.once('open',function(){
    console.log('Connected to MongoDB');
});

//init app
var app = express();

//View engine setup
app.set('views', path.join(__dirname,'views'));
app.set('view engine','ejs');

//Set public folder
app.use(express.static(path.join(__dirname,'public')));//change


//Set global error variable
app.locals.errors =null;

//Get Page Model
var Page = require('./models/page');

// Get all pages to pass to header.ejs

  Page.find({}).sort({sorting: 1}).exec(function (err,pages){
    if(err){
        console.log(err);
    }else {
        app.locals.pages = pages;
    }
});

//Get Category Model
var Category = require('./models/category');

// Get all categories to pass to header.ejs

  Category.find({}).sort({sorting:1}).exec(function (err,categories){
    if(err){
        console.log(err);
    }else {
        app.locals.categories = categories;
    }
});




//Express fileUpload middleware
app.use(fileUpload());


//Expess Session middlemare
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true,
  // cookie: { secure: true }
  }));

//Express Validator middleware

app.use (expressValidator ({
    errorFormatter: function (param, msg, value){
        var namespace = param.split('.')
        , root = namespace.shift ()
        , formParam = root;


while (namespace. length) {
formParam += '[' + namespace.shift () + ']';
}
return{
param: formParam,
msg : msg, 
value: value
};
},
    customValidators:{
        isImage: function(value, filename) {
            var extension = (path.extname(filename)).toLowerCase();
            switch(extension){
                case '.jpg':
                    return '.jpg';

                case '.webp':
                    return '.webp';
                    
                case '.jpeg':
                    return '.jpeg';
                case '.png':
                    return '.png';
                case '':
                    return '.jpg';
                default:
                    return false;
            }
        }
    }
}));

  
//Express Messages middleware
app.use(require('connect-flash')());
app.use(function (req,res,next){
    res.locals.messages = require('express-messages')(req, res);
    next();
});

//Passport config
require('./config/passport')(passport);
// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

app.get('*',function(req,res,next){
    res.locals.cart = req.session.cart;
    res.locals.user = req.user || null;
    next();
});

//Body Parser middleware
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json());

//Expess Session middlemare
//Body Parser middleware
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json());





// //express session validator
// app.post('/users', 
//  [ // 1.配置验证规则
//  	body('user.username').notEmpty().withMessage('用户名不能为空').custom(async(username) => {
// 	const user = await User.findOnde({username})	
// 	if (user) {
// 		return Promise.reject('用户名已经存在')
// 	}
// }),
// 	body('user.password').notEmpty().withMessage('密码不能为空'),
//  	body('user.email').notEmpty().withMessage('邮箱不能为空').isEmail().withMessage('邮箱格式不正确').bail().custom(async(value) => {
// 	// custom:自定义验证方法
// 	// 从数据库中取出数据： User.finOne
// 	const user = User.finOne({email})
// 	if (user) return Promise.reject('邮箱已经存在')
// }),
//  ], (req, res, next) => { // 2.判断验证结果
// 	const errors = validationResult(req)
// 	if (!errors.isEmpty()) {
// 		return res.status(400).json({ errors: errors.array() })
// 	}
// 	next()
//   },  userCtrl.login) // 3.验证通过，执行具体的控制器处理

// // 用户注册
// app.post('/users', userCtrl.register)


// // 获取当前登录用户
// app.get('/user', userCtrl.getCurrentUser)

// // 更新当前用户
// app.put('/user', userCtrl.updateCurrentUser)
// module.exports = router


// set routes
var pages= require('./routes/pages.js');
var products= require('./routes/products.js');
var cart= require('./routes/cart.js');
var users = require('./routes/users.js');

var adminPages= require('./routes/admin_pages.js');
var adminCategories= require('./routes/admin_categories.js');
var adminProducts= require('./routes/admin_products.js');
const router = require('./routes/pages.js');

app.use('/admin/pages',adminPages);
app.use('/admin/categories',adminCategories);
app.use('/admin/products',adminProducts);
app.use('/products',products);
app.use('/cart',cart);
app.use('/users',users);
app.use('/',pages);


//start the server
var port= 3000;
app.listen(port, function(){
    console.log('Server started on port'+port);
});
