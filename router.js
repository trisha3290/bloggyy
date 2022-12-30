const express = require('express');
const router = express.Router();
const User = require('./model/User');
const Post = require('./model/Post');
const mongoose=require('mongoose')
const bcrypt=require('bcryptjs')
const flash=require('connect-flash')

router.use(flash())
router.get('/', (req, res, next) => {
	return res.render('index');
});
var person
let salt=bcrypt.genSaltSync(10)
router.post('/', (req, res, next) => {
	let personInfo = req.body;
  //console.log(personInfo.email)
	if (!personInfo.email || !personInfo.username || !personInfo.password || !personInfo.passwordConf) {
		res.send();
	} else {
		
		
	
		if (personInfo.password == personInfo.passwordConf) {
			console.log(personInfo.password)
            personInfo.password=bcrypt.hashSync(personInfo.password,salt)
			personInfo.passwordConf=bcrypt.hashSync(personInfo.passwordConf,salt)
			User.findOne({ username:personInfo.username}, (err, data) => {
				if (!data) {
					let c;
					User.findOne({}, (err, data) => {

						if (data) {
							c = data.unique_id + 1;
						} else {
							c = 1;
						}

						let newPerson = new User({
							unique_id: c,
							email: personInfo.email,
							username: personInfo.username,
							password: personInfo.password,
							passwordConf: personInfo.passwordConf
						});
                        person=personInfo.username
						newPerson.save((err, Person) => {
							if (err)
								console.log(err);
							else
								console.log('Success');
						});

					}).sort({ _id: -1 }).limit(1);
					res.send({ "Success": "You are registered,You can login now." });
				} else {
					res.send({ "Success": "Email or username is already used." });
				}

			});
		} else {
			res.send({ "Success": "password is not matched" });
		}
	}
});

router.get('/login', (req, res, next) => {
	return res.render('login');
});
var is_logged_in=false
var email_check
router.post('/login', (req, res, next) => {
	User.findOne({ email: req.body.email }, (err, data) => {
		if (data) {
            // if (data.password == req.body.password) {
			 	req.session.userId = data.unique_id;
			 	person=data.username
				email_check=req.body.email
			// 	res.send({ "Success": "Success!" });
			// } else {
			// 	res.send({ "Success": "Wrong password!" });
			// }
			//req.body.password=bcrypt.hashSync(req.body.password,salt)
            bcrypt.compare(req.body.password,data.password,(er,dat)=>{
			
				if(er)throw er
				if(dat){
					res.send({ "Success": "Success!" });
					is_logged_in=true;
					//console.log("ok")
				}
				else{
					res.send({ "Success": "Wrong password!" });
				}
			})
		} else {
			res.send({ "Success": "This Email Is not registered!" });
		}
	});
});

router.get('/profile', (req, res, next) => {
	is_logged_in=req.session.userId
	console.log(is_logged_in)
	if(is_logged_in)
	{User.findOne({ unique_id: req.session.userId }, (err, data) => {
		if (!data) {
			res.redirect('/');
		} else {
			var id=data.username
			
			var blogs=[]
			Post.find({author:id}).then(docs=>{
				console.log('blogs:')
				blogs.push(docs)
				if(blogs.length===0){
                    return res.render('data.ejs', { name: data.username, email: data.email, blogs:docs });
				}
				for(let i=0;i<=blogs.length;++i){
					//console.log(docs[i].like)
				}
				return res.render('data', { name: data.username, email: data.email, blogs:docs });
				//console.log(docs)
				//.catch(error => {
				//	console.log(error);
				//})
			})
			
		}
			
	})}
	else{
       return res.redirect('/')
	}
});

router.get('/logout', (req, res, next) => {
	if (req.session) {
		// delete session object
		req.session.destroy((err) => {
			if (err) {
				return next(err);
			} else {
				is_logged_in=false
				return res.redirect('/');
			}
		});
	}
});
router.get('/forgetpass', (req, res, next) => {
	is_logged_in=req.session.userId
	console.log(is_logged_in)
	if(is_logged_in)
	{res.render("forget")}
	else{
		res.redirect('/')
	};
});

router.post('/forgetpass', (req, res, next) => {
	User.findOne({ email: req.body.email }, (err, data) => {
		if (!data||(email_check!=req.body.email)) {
			console.log(email_check)
			res.send({ "Success": "This Email Is not registered! or this email is not yours" });
		} else {
			if (req.body.password == req.body.passwordConf) {
				req.body.password=bcrypt.hashSync(req.body.password,salt)
			    req.body.passwordConf=bcrypt.hashSync(req.body.passwordConf,salt)
				data.password = req.body.password;
				data.passwordConf = req.body.passwordConf;

				data.save((err, Person) => {
					if (err)
						console.log(err);
					else
						console.log('Success');
					res.send({ "Success": "Password changed!" });
				});
			} else {
				res.send({ "Success": "Password does not matched! Both Password should be same." });
			}
		}
	});

});
router.get('/create-post',function(req,res){
  is_logged_in=req.session.userId
	console.log(is_logged_in)
  if(is_logged_in)
  {User.findOne({ unique_id: req.session.userId }, (err, data) => {
		if (!data) {
			res.redirect('/');
		} else {
			return res.render('create-post', { "username": data.username, "email": data.email });
		}
	});}
	else{
		res.redirect('/')
	}
})
router.post('/save-post', (req, res) => {
	let blog=req.body
	//req.body.author=req.user._id
	//console.log(blog.author)
	is_logged_in=req.session.userId
	console.log(is_logged_in)
	if(is_logged_in)
	{User.findOne({ unique_id: req.session.userId }, (err, data) => {
		if (!data) {
			res.redirect('/');
		} else {
			
			person=data.username
			console.log(person)
			Post.create({title:blog.title,content:blog.body,author: person,like:0}, (error, post) => {
				res.redirect('/profile')
			})
		}
	});}
	else{
		res.redirect('/')
	}
});
router.get('/myblog/:id',(req,res)=>{
	is_logged_in=req.session.userId
	console.log(is_logged_in)
	if(is_logged_in)
	{Post.findById(req.params.id).then((post)=>{
	res.render('single-post-screen',{title:post.title,username:post.author,content:post.content,post:post})})}
	else{
		res.redirect('/')
	}
})
router.get('/myblog/:id/delete',(req,res)=>{
	is_logged_in=req.session.userId
	console.log(is_logged_in)
	if(is_logged_in)
	{const id=req.params.id
	Post.findByIdAndRemove(id).then((post)=>{
	res.redirect('/profile')})}
	else{
		res.redirect('/')
	}
})
router.get('/myblog/:id/edit',(req,res)=>{
	is_logged_in=req.session.userId
	console.log(is_logged_in)
	if(is_logged_in)
	{const id=req.params.id
	let blog=req.body
	Post.findById(id).then((post)=>{
		res.render('edit-post.ejs',{post:post})
	})}
	else{
		res.redirect('/')
	}
})
router.post('/myblog/:id/edit',(req,res)=>{
	is_logged_in=req.session.userId
	console.log(is_logged_in)
	if(is_logged_in)
	{const id=req.params.id
	let blog=req.body
	Post.findById(id).then((post)=>{
		let data=post.content
		console.log(data)
		Post.updateOne({content:data},{$set:{content:blog.body}},function(err,res){
			if(err)throw err
			//res.send("An error occured")
			console.log(blog.body)
			
		})
		res.render('edit-post',{post:post})
	})}
	else{
		res.redirect('/')
	}
})
router.post('/search-user',(req,res)=>{
	is_logged_in=req.session.userId
	console.log(is_logged_in)
	if(is_logged_in)
	{let name=req.body.username
	console.log(name)
    User.findOne({username:name},(err,doc)=> {
		//Do your action here..
		//console.log(doc);
        if(doc==null){
			var errors=[]
				errors.push("No such user exists")
				//alert("user does not exists")
				var success=[]
				return res.render('flash',{errors:errors,success:success})
		}
		else{
		Post.find({author:name}).then((docs)=>{
			if(docs.length>=0){
				//var errors=[]
				//errors.push("No such user exists")
				//alert("user does not exists")
				//var success=[]
				return res.render('profile-followers',{name:name,blogs:docs})
		}
	})	
	}

})}
  else{
	res.redirect('/')
  }
})

router.get('/:id/like',(req,res)=>{
  const id=req.params.id
  Post.findById(id).then((post)=>{
	var n=post.like
	m=n+1
	console.log(m)
	Post.updateOne({like:n},{$set:{like:m}},function(err,res){
			if(err)throw err
			//res.send("An error occured")
			console.log("you liked")
			
		})
		res.redirect('/profile')
  })
})

module.exports = router;
