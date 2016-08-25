var express = require('express');
var router = express.Router();
//mysql 모듈 연결
var mysql = require('mysql');
var client = mysql.createConnection({ //접속을 요구하는 객체 생성
	//접속을 위한 db 정보를 넣어준다
	host: 'localhost',
	user: 'root',
	password: 'xnejfdl1!',
	database: 'yicy'
});
client.connect(); // 데이터베이스에 접속 명령

/* GET englsih main page '/'*/
router.get('/:category', function(req, res, next) {
	var category= req.params.category;
	var sqlforMain = 'SELECT id, category, title, author, content, date_format(credate,"%Y-%m-%d") credate, password FROM 100eng WHERE category=? ORDER BY id DESC';
	client.query(sqlforMain, [category], function(err, rows){
		res.render('english/eng_main', { mains : rows});
	});
});
/* get view router */
router.get('/:category/:id', function(req, res){
	var id = req.params.id;
	var sqlforView = 'SELECT id, category, title, author, content, date_format(credate,"%Y-%m-%d") credate, password FROM 100eng WHERE id=?';
	client.query(sqlforView, [id], function(err, rows){
		res.render('english/eng_view', { view : rows[0] });
	});
});
/* get & post Add*/
router.get('/:category/:id/add', function(req, res){
	var category = req.params.category;
	sqlforAddView = 'SELECT id, category, title, author, content, date_format(credate,"%Y-%m-%d") credate, password FROM 100eng WHERE category=? ORDER BY id DESC';
	client.query(sqlforAddView, [category], function(err, rows){
		res.render('english/eng_add', { addsubj: rows});
	});
});
router.post('/:category/:id/add', function(req, res){
	var title = req.body.title;
	var author = req.body.author;
	var category = req.body.category;
	var password = req.body.password;

	var content = req.body.content.replace(/\r\n/gi, '<br/>');
	var sqlforAdd = 'INSERT INTO 100eng (title, author, category, password, content) VALUES(?, ?, ?, ?, ?)';
	client.query(sqlforAdd, [title, author, category, password, content], function(err, rows){
		res.redirect('/english/'+category);
	});
});
/* get & post Edit*/
router.get('/:category/:id/editcheck', function(req, res){
	var id = req.params.id;
	sqlforEditcheck = 'SELECT id, category, title, author, content, date_format(credate,"%Y-%m-%d") credate, password FROM 100eng WHERE id=?';
	client.query(sqlforEditcheck, [id], function(err, rows){
		res.render('english/eng_editcheck', { editcheck: rows[0] });
	});
});
router.post('/:category/:id/editcheck', function(req, res){
	var id = req.body.id;
	var password = req.body.password;
	var sqlforeditcheck = 'SELECT id, category, title, author, content, date_format(credate,"%Y-%m-%d") credate, password FROM 100eng WHERE id=?';
	client.query(sqlforeditcheck, [id], function(err, rows){
		if(password == rows[0].password) res.render('english/eng_editform', {editform : rows[0]});
		else res.render('english/eng_editcheck', { editcheck: rows[0]});
	});
});
router.post('/:category/:id/edit', function(req, res){
	var title = req.body.title;
	var author = req.body.author;
	var category = req.body.category;
	var password = req.body.password;
	var id = req.body.id;
	var content = req.body.content;

	var sqlforEdit = 'UPDATE 100eng SET title=?, author=?, category=?, password=?, content=? WHERE id=?';
	client.query(sqlforEdit, [title, author, category, password, content, id], function(err, rows){
		res.redirect('/english/'+category);
	});
});
/* get & post Delete */
router.get('/:category/:id/delcheck', function(req, res){
	var id = req.params.id;
	var sqlforDelcheckview = 'SELECT id, category, title, author, content, date_format(credate,"%Y-%m-%d") credate, password FROM 100eng WHERE id=?';
	client.query(sqlforDelcheckview, [id], function(err, rows){
		res.render('english/eng_delcheck', { delcheck: rows[0] });
	});
});
router.post('/:category/:id/delete', function(req, res){
	var id = req.body.id;
	var sqlforDelcheck = 'SELECT id, category, title, author, content, date_format(credate,"%Y-%m-%d") credate, password FROM 100eng WHERE id=?';
	client.query(sqlforDelcheck, [id], function(err, delcheck){
		if(req.body.password == delcheck[0].password) {
			var sqlforDel = 'DELETE FROM 100eng WHERE id=?';
			client.query(sqlforDel, [id], function(err, rows){
				res.redirect('/english/'+delcheck[0].category);
			});
		} else {
			res.render('english/eng_delcheck', { delcheck: delcheck[0] });
		}
	});
});
module.exports = router;
