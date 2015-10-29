var crypto = require('crypto');
var mongoose = require('mongoose'),
	User = mongoose.model('User');
function hashPW(pwd){
	return crypto.createHash('sha256').update(pwd).digest('base64').toString();
}
//用户注册
exports.signup= function(req, res){
	var user = new User({username: req.body.username});
	user.set('hash_password', hashPW(req.body.password));
	user.set('email', req.body.email);
	user.save(function(err){
		if(err){
			req.session.error = err;
			res.redirect('/signup');
		}else{
			req.session.user = user.id;
			req.session.username = user.username;
			req.session.msg = 'Authenticated as ' + user.username;
			res.redirect('/');
		}
	})
}
exports.login = function(req, res){
	User.findOne({username: req.body.username})
	.exec(function(err, user){
		if(!user){
			err = 'User Not Found';
		}else if(user.hash_password == 
				hashPW(req.body.password.toString()) ){
			req.session.regenerate(function(){
				req.session.user = user.id;
				req.session.username = user.username;
				req.session.msg = 'Authenticated as ' + user.usrname;
				res.redirect('/');
			})
		}else{
			err = 'Authenticated failed.';
		}
		if(err){
			req.session.regenerate(function(){
				req.session.msg = err;
				res.redirect('/login');
			})
		}
	})
}
exports.getUserProfile = function(req, res){
	User.findOne({_id: req.session.user})
	.exec(function(err, user){
		if(!user){
			res.json(404, {err: 'User Not Found'});
		}else{
			console.log(user);
			res.json(user);
		}
	})
}
exports.updateUser = function(req, res){
	User.findOne({_id: req.session.user})
	.exec(function(err, user){
		user.set('email', req.body.email);
		user.set('color', req.body.color);
		user.save(function(err){
			if(err){
				req.session.msg = err;
			}else{
				req.session.msg = 'User Updated.';
			}
			res.redirect('/user');
		})
	})
}
exports.deleteUser = function(req, res){
	User.findOne({_id: req.session.user})
	.exec(function(err, user){
		if(user){
			user.remove(function(err){
				if(err){
					req.session.msg = err;
				}
				req.session.destroy(function(){
					res.redirect('/login');
				})
			})
		}else{
			req.session.msg = 'User Not Found';
			req.session.destroy(function(req, res, err){
				res.redirect('/login');
			})
		}
	})
}