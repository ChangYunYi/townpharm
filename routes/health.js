module.exports = function(app){

  var express = require('express');
  var router = express.Router();
  // mysql 모듈 추출
  var mysql = require('mysql');
  var client = mysql.createConnection({ //접속을 요구하는 객체 생성
    //접속을 위한 db 정보를 넣어준다
    host: 'localhost',
    user: 'root',
    password: 'xnejfdl1!',
    database: 'yicy'
  });
  client.connect(); // 데이터베이스에 접속 명령

  /* router setting */
  // '[/health, /health/hotboard]' : hotboard.jade -> get
  router.get(['/', '/hotboard', '/hotboard/:id'], function(req, res){	///health 생략가능
    // '/hotboard'로부터 side_nav list 보여주기 위해 (id 값이 없이 들어왔을때 최신 글을 보여준다)
    var sql = 'SELECT * FROM hotissue ORDER BY id DESC';  //목록을 최신순으로 보여주기 위해 역순으로 배열
    client.query(sql, function(err, rows, fields){	//data는 rows에 담겨있음
      // '/hotboard/:id'로 들어왔을때 id 값에 맞는 글을 보여주기위해서
      var id = req.params.id;   //url로 들어온 id값을 확보
      if(id){   //id 값이 있으면 실행
        var _sql = 'SELECT * FROM hotissue WHERE id=?';   //id 값에 관련된 데이터 하나의 정보 모두를 선택
        client.query(_sql, [id], function(err, issues, fields){
          res.render('health/hotboard', {rows : rows, issues : issues[0]});    //정보 객체중 하나만 선택해서 보내준다
        });
      }else { //id 값이 없으면 실행
        res.render('health/hotboard', {rows : rows});    //rows 는 데이터정보 객체다
      }
    });  //end query
  }); // end router.get()

  // 'hotboard/add' router
  router.get('/hotboard_add', function(req, res){
    var sqlForAddView = 'SELECT * FROM hotissue ORDER BY id DESC';
    client.query(sqlForAddView, function(err, rows, fields){
      res.render('health/hotboard_add', {rows : rows});
    });
  });
  router.post('/hotboard_add', function(req, res){
    var title = req.body.title;
    var author = req.body.author;
    var content = req.body.content;
    var sqlForAdd = 'INSERT INTO hotissue (title, author, content) VALUES(?, ?, ?)';
    //query 실행 --> hotissue에 title, author, content 정보를 등록한다
    client.query(sqlForAdd, [title, author, content], function(err, rows, fields){
      res.redirect('/health/hotboard');  // '/hotboard'로 라우터를 보내주자
    });
  });

  // 'hotboard/:id/edit' router
  router.get('/hotboard/:id/edit', function(req, res){
    var sql = 'SELECT * FROM hotissue ORDER BY id DESC';
    client.query(sql, function(err, rows, fields){
      var id = req.params.id;
      if(id){
        var sqlForEditView = 'SELECT * FROM hotissue WHERE id=?';
        client.query(sqlForEditView, [id], function(err, editIssues, fields){
          res.render('health/hotboard_edit', { rows : rows, editIssue : editIssues[0] });
        });
      }else{  //id가 없으면 error임.....
        console.log('Not Found Id for Edit : '+err);
      }
    });
  });
  // hotboard_edit 에서 정보를 받아오면
  router.post('/hotboard/:id/edit', function(req, res){
    // request 에서 정보를 파싱한다
    var title = req.body.title;
    var author = req.body.author;
    var content = req.body.content;
    var id = req.params.id;
    var sqlForEdit = 'UPDATE hotissue SET title=?, author=?, content=? WHERE id=?';
    client.query(sqlForEdit, [title, author, content, id], function(err, rows, fields){
        res.redirect('/health/hotboard');
    });
  });

  // 'hotboard/:id/delete' 글삭제기능 router
  router.get('/hotboard/:id/delete', function(req, res){
    // 글목록편의 리스트를 계속 유지해주기 위해 전체값을 보내줄 필요가 있음 그래서 계속 이 값이 필요하다
    var sql = 'SELECT * FROM hotissue ORDER BY id DESC';
    client.query(sql, function(err, rows, fields){
      var id = req.params.id;
      if(id){
        // 정말 삭제할것인 확인차 보여주는 view page임
        var sqlForDelAlert = 'SELECT * FROM hotissue WHERE id=?';
        client.query(sqlForDelAlert, [id], function(err, delIssue, fields){
          res.render('health/hotboard_delete', { rows : rows, delIssue : delIssue[0] });
        });
      }else{
        console.log('Not Found Id for Delete'+err);
      }
    });
  });
  // 삭제확인 페이지에서 확인을 누르면 실행되는 js
  router.post('/hotboard/:id/delete', function(req, res){
    var id = req.params.id;
    if(id){
      // 데이터 삭제 query
      var sqlForDel = 'DELETE FROM hotissue WHERE id=?';
      client.query(sqlForDel, [id], function(err, issues, fielsds){
        res.redirect('/health/hotboard');
      });
    }else {
      console.log(err);
    }
  });

  return router;    // module에 function()을 하려면 router 를 반환해줘야 한다
};
