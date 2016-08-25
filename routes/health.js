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
  // routing '/health/:category' main page for each category
  router.get('/:category', function(req, res){
    // category별로 분기해서 최근 5개의 새글을 보여준다
    var category = req.params.category;
    var sql = 'SELECT id, title, author, content, date_format(writetime,"%Y-%m-%d") writetime, category FROM health WHERE category= ? ORDER BY id DESC LIMIT 5';  //목록을 최신순으로 보여주기 위해 역순으로 배열
    client.query(sql, [category], function(err, rows, fields){
      // rows는 table 의 각각의 데이터의 객체들의 묶음단위...
      res.render('health/health_main', {issues: rows});
    });  //end query
  }); // end router.get()
  // main board 클릭시 개별 id에 관한 내용 보여주기
  router.get('/:category/:id', function(req, res){
    // category를 따로 뺄 필요는 없다... id는 모든 글이 다 다르다..
    var id = req.params.id;
    var sqlforView = 'SELECT id, title, author, content, date_format(writetime,"%Y-%m-%d") writetime, category FROM health WHERE id=?';
    client.query(sqlforView, [id], function(err, rows){
      res.render('health/health_view', {issue: rows[0]});
    });
  });
  // '/:category/health_add'를 하면 개별 view 롤 routing 되므로 이를 구별하기 위해 세부분으로 구분함
  router.get('/:category/:id/add', function(req, res){
    // anchor내의 주소를 만들기 위해서 id별 data를 추출할 필요가 있음
    var id = req.params.id;
    var sqlforAddView = 'SELECT id, title, author, content, date_format(writetime,"%Y-%m-%d") writetime, category FROM health WHERE id=?';
    client.query(sqlforAddView, [id], function(err, rows){
      res.render('health/health_add', {addissue: rows[0]});
    });
  });
  router.post('/:category/:id/add', function(req, res){
    // post로 들어온 정보는 .body.property롤 parsing 할수 있다.
    // add post로 받을시 body 내 정보값에 null 값이 있으면 정보를 재 입력하도록 하자.... edit도 마찬가지
    var title = req.body.title;
    var author = req.body.author;
    var category = req.body.category;
    var password = req.body.password;
    // textarea에서 개행문자는 \r\n 이다 이는 html에서 인식이 안되므로
    // 개행문자를 <br />로 치환해서 db에 저장해준다
    var content = req.body.content.replace(/\r\n/gi, '<br/>');
    var sqlForAdd = 'INSERT INTO health (title, author, category, password, content) VALUES(?, ?, ?, ?, ?)';
    //query 실행 --> hotissue에 title, author, content 정보를 등록한다
    client.query(sqlForAdd, [title, author, category, password, content], function(err, rows, fields){
      // main view로 redirecting
      res.redirect('/health/'+category);
    });
  });
  // 'hotboard/:id/edit' router
  router.get('/:category/:id/editcheck', function(req, res){
    // edit은 반드시 개별 글을 추출해야 한다..
    var id = req.params.id;
    if(id){
      var sqlForEditView = 'SELECT id, title, author, category, password, content, date_format(writetime,"%Y-%m-%d") writetime FROM health WHERE id=?';
      client.query(sqlForEditView, [id], function(err, rows, fields){
        res.render('health/health_editcheck', { editIssue : rows[0] });
      });
    }else{  //id가 없으면 error임.....
      console.log('Not Found Id for Edit : '+err);
    }
  });
  router.post('/:category/:id/editconfirm', function(req, res){
    var id = req.body.id;
    var password = req.body.password;
    var sqlforEditconfirm = 'SELECT id, title, author, category, password, content, date_format(writetime,"%Y-%m-%d") writetime FROM health WHERE id=?';
    client.query(sqlforEditconfirm, [id], function(err, rows){
      if(password == rows[0].password) res.render('health/health_edit', {editIssue: rows[0]});
      else res.render('health/health_editcheck', {editIssue: rows[0]});
    });
  });
  // hotboard_edit 에서 정보를 받아오면
  router.post('/:category/:id/edit', function(req, res){
    // request 에서 정보를 파싱한다
    var title = req.body.title;
    var author = req.body.author;
    var category = req.body.category;
    var password = req.body.password;
    var content = req.body.content;
    var id = req.params.id;
    var sqlForEdit = 'UPDATE health SET title=?, author=?, category=?, password=?, content=? WHERE id=?';
    client.query(sqlForEdit, [title, author, category, password, content, id], function(err, rows, fields){
      res.redirect('/health/'+category);
    });
  });
  // 'hotboard/:id/delete' 글삭제기능 router
  router.get('/:category/:id/delete', function(req, res){
      var id = req.params.id;
      if(id){
        // 정말 삭제할것인 확인차 보여주는 view page임
        var sqlForDelAlert = 'SELECT id, title, author, content, date_format(writetime,"%Y-%m-%d") writetime, category FROM health WHERE id=?';
        client.query(sqlForDelAlert, [id], function(err, delIssue, fields){
          res.render('health/health_delete', { delIssue : delIssue[0] });
        });
      }else{
        console.log('Not Found Id for Delete'+err);
      }
    });
  router.post('/:category/:id/delete', function(req, res){
    var id = req.body.id;
    var password = req.body.password;
    var sqlforDelcheck = 'SELECT id, title, author, content, date_format(writetime,"%Y-%m-%d") writetime, category, password FROM health WHERE id=?';
    client.query(sqlforDelcheck, [id], function(err, rows){
      if(password == rows[0].password) {
        var sqlForDel = 'DELETE FROM health WHERE id=?';
        client.query(sqlForDel, [id], function(err, issues, fields){
          res.redirect('/health/'+rows[0].category);
        });
      } else {
        var sqlForDelAlert = 'SELECT id, title, author, content, date_format(writetime,"%Y-%m-%d") writetime, category FROM health WHERE id=?';
        client.query(sqlForDelAlert, [id], function(err, delIssue, fields){
          res.render('health/health_delete', { delIssue : delIssue[0] });
        });    //end query
      } // end if-else
    });
  });



  return router;    // module에 function()을 하려면 router 를 반환해줘야 한다
};
