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
  router.get('/:category', function(req, res, next) {
    var category = req.params.category;
    var sqlforBasicView = 'SELECT id, category, title, content, author, img1, img2, img3, date_format(createdate,"%Y-%m-%d") createdate, password FROM trips WHERE category=? ORDER BY id DESC';
    client.query(sqlforBasicView, [category], function(err, rows, fields){
      res.render('trips/trips_main', { trips: rows });
    });   // end_query
  });
  /* id 개별 view */
  router.get('/:category/:id', function(req, res){
    var id = req.params.id;
    var sqlforViewId = 'SELECT id, category, title, content, author, img1, img2, img3, date_format(createdate,"%Y-%m-%d") createdate, password FROM trips WHERE id=?';
    client.query(sqlforViewId, [id], function(err, rows){
      if(err) console.log(err);
      res.render('trips/trips_view', { trip: rows[0]});
    });
  });


  /* ADD */
  router.get('/:category/:id/add', function(req, res){
    var sqlforAddView = 'SELECT id, category, title, content, author, img1, img2, img3, date_format(createdate,"%Y-%m-%d") createdate, password FROM trips ORDER BY id DESC';
    client.query(sqlforAddView, function(err, rows){
      res.render('trips/trips_add', { addTrip: rows });
    }); // end_query
  }); //end_get

  router.post('/:category/:id/add', upload.array('img', 3), function(req, res, next){
    var title = req.body.title;
    var category = req.body.category;
    var author = req.body.author;
    var password = req.body.password;
    var content = req.body.content.replace(/\r\n/gi, '<br/>');
    // img name 저장
    var img1 = req.files[0].filename;
    var img2 = req.files[1].filename;
    var img3 = req.files[2].filename;
    var sqlforAdd = 'INSERT INTO trips (title, category, author, password, content, img1, img2, img3) VALUES(?, ?, ?, ?, ?, ?, ?, ?)';
    client.query(sqlforAdd, [title, category, author, password, content, img1, img2, img3], function(err, rows){
      res.redirect('/trips/'+category);
    });

  });

  /* Edit */
  router.get('/:category/:id/edit_check', function(req, res){
    // user_confirm page render
    if(req.params.id){
      var id = req.params.id;
      var sqlforeditcheck = 'SELECT id, title, category, content, author, img1, img2, img3, date_format(createdate,"%Y-%m-%d") createdate, password FROM trips WHERE id=?';
      client.query(sqlforeditcheck, [id], function(err, rows){
        res.render('trips/trips_editcheck', { row: rows[0] });
      });
    } else {
      console.log('Not Found Id for Edit : '+err);
    }
  });

  router.post('/:category/:id/edit_confirm', function(req, res){
    // id 값의 유무
    if(req.body.id){
      var id = req.body.id;
      var sqlforEdit = 'SELECT id, title, category, content, author, img1, img2, img3, date_format(createdate,"%Y-%m-%d") createdate, password FROM trips WHERE id=?';
      client.query(sqlforEdit, [id], function(err, rows){
        var password = req.body.password;
        // confirm password
        if(password == rows[0].password){
          res.render('trips/trips_edit', { row: rows[0] });
        } else{
          res.render('trips/trips_editcheck', { row: rows[0] });
        }   // end_if(right password?)
      });
    } else{
      res.redirect('/trips/'+req.body.category);
    }
  });

  router.post('/:category/:id/edit', function(req, res){
    // post body info
    var title = req.body.title;
    var category = req.body.category;
    var content = req.body.content;
    var id = req.body.id;
    var author = req.body.author;
    var password = req.body.password;

    var sqlforEdit = 'UPDATE trips SET title=?, category=?, content=?, author=?, password=? WHERE id=?';
    client.query(sqlforEdit, [title, category, content, author, password, id], function(err, rows){
      res.redirect('/trips/'+category);
    });
  });
/* get & post delete*/
  router.get('/:category/:id/delete', function(req, res){
    var id = req.params.id;
    var sqlforDelcheck = 'SELECT id, title, category, content, author, img1, img2, img3, date_format(createdate,"%Y-%m-%d") createdate, password FROM trips WHERE id=?';
    client.query(sqlforDelcheck, [id], function(err, row){
      res.render('trips/trips_delcheck', {delTrip: row[0]});
    });
  });
  router.post('/:category/:id/delete', function(req, res){
    var id = req.body.id;
    var password = req.body.password;
    var sqlforDel = 'SELECT id, title, category, content, author, img1, img2, img3, date_format(createdate,"%Y-%m-%d") createdate, password FROM trips WHERE id=?';
    client.query(sqlforDel, [id], function(err, row){
      if(password == row[0].password) res.redirect('/trips/'+ row[0].category);
      else res.render('trips/trips_delcheck', { delTrip: row[0]});  
    });
  });

  return router;
};
