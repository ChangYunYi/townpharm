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
router.get(['/', '/english100'], function(req, res, next) {
  res.render('english/eng100');
});

module.exports = router;
