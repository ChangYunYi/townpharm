module.exports = function(app){

  var express = require('express');
  var router = express.Router();
  // file upload를 위해 multer 모듈 연결
  var multer = require('multer');
  var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public/images');
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname);
    }
  });
  var upload = multer({ storage: storage });
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

  /* GET trips home - korea or abroad 분기점을 보여주는 page */
  router.get(['/','/tripsKorea','/triosKorea/:id'], function(req, res, next) {

    var sqlforBasicView = 'SELECT * FROM tripsKorea ORDER BY id DESC';
    client.query(sqlforBasicView, function(err, rows, fields){
      if(req.params.id){
        var id = req.params.id;
        var sqlforId = 'SELECT * FROM tripsKorea WHERE id=?';
        client.query(sqlforId, [id], function(err, trip, fields){
          res.render('trips/tripsKorea', { rows:rows, trip:trip[0]});
        });
      } else{ res.render('trips/tripsKorea', { rows:rows }); }
    });   // end_query

  });

  /* ADD */
  router.get('/tripsKorea_add', function(req, res){
    /*
    var sqlforAddView = 'SELECT * FROM tripsKorea ORDER BY id DESC';
    client.query(sqlForAddView, function(err, rows){
      res.render('trips/tripsKorea_add', { rows:rows });
    }); // end_query
    */
    res.render('trips/tripsKorea_add');
  }); //end_get

  router.post('/tripsKorea_add', upload.array('img', 3), function(req, res, next){
    var title = req.body.title;
    var content = req.body.content.replace(/\r\n/gi, '<br/>');
    var author = req.body.author;
    var password = req.body.password;

    var img1 = req.files[0].filename;
    var img2 = req.files[1].filename;
    var img3 = req.files[2].filename;

    var sqlforAdd = 'INSERT INTO tripsKorea (title, content, author, password, img1, img2, img3) VALUES(?, ?, ?, ?, ?, ?, ?)';
    client.query(sqlforAdd, [title, content, author, password, img1, img2, img3], function(err, rows){
      res.redirect('/trips/tripsKorea');
    });

  });

  /* EDIT
  router.get();

  router.post();
  */

  /* delete
  router.get();

  router.post();
  */
  return router;
};
