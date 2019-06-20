 ////////// Parsing prefilled url information //////////
 var hashParams = window.location.hash.substr(1).split('&'); // substr(1) to remove the `#`
 for (var i = 0; i < hashParams.length; i++) {
     var p = hashParams[i].split('=');
     if (p == '')
         break;
     document.getElementById(p[0]).value = decodeURIComponent(p[1]);
 }

 window.onload = function () {
     setInterval("parent.AdjustIframeHeight('blog')", 10);
 }

 function AdjustIframeHeight(id) {
     var iframeid = document.getElementById(id);
     var body = iframeid.contentDocument.body,
         html = iframeid.contentDocument.documentElement;
     var height = Math.max(body.scrollHeight, body.offsetHeight,
         html.clientHeight, html.scrollHeight, html.offsetHeight);
     iframeid.height = height;
 }

 // Common Variables //
 const storage = firebase.storage();
 var articleRef = '/article_group/';
 var userRef = '/user_group/';

 const database = firebase.database();
 var imgRef = 'uploaded_imgs/';
 var gameRef = 'uploaded_games/';
 var auth = firebase.auth().currentUser;

 // Auto-login when login
 firebase.auth().onAuthStateChanged(function (user) {
     auth = user;
     loadArticle();
 });

 ////////// Load Article Function //////////
 function loadArticle() {
     var limit = 100;
     var count = 0;
     var trueData = 0;
     var flag = true;
     var articles = [];
     var content = document.getElementById('content');
     content.innerHTML = '';

     var search_content = document.getElementById('search_content').value;
     if (search_content == '') {
         database.ref(articleRef + 'article_list')
             .on('value', function (snapshot) {
                 trueData = 0;
                 snapshot.forEach(function (childSnapshot) {
                     if (trueData < limit)
                         trueData++;
                 });
             });

         database.ref(articleRef + 'article_list')
             .orderByChild('published').limitToLast(limit).startAt(1)
             .on('child_added', function (data) {
                 database.ref(articleRef + 'article/' + data.key)
                     .on('value', function (articleData) {
                         count++;
                         articles.unshift({
                             id: data.key,
                             published: data.val().published,
                             data: articleData.val()
                         });
                         articles.sort(function (a, b) {
                             return a.published < b.published
                         });
                         console.log(articles.length);
                         producer();
                     }, function (err) {
                         showError(err);
                     });
             }, function (err) {
                 alert(err);
             });
     } else {
         console.log("Enter Search!");
         if (search_content == "") {
             alert("請輸入關鍵字");
             return;
         } else
             var key = search_content;
         console.log(key);
         content.innerHTML = "";
         // result.innerHTML = "";
         database.ref('/article_group/article_list')
             .orderByChild('published')
             .on('child_added', function (snapshot) {
                database.ref('/article_group/article/' + snapshot.key)
                     .on('value', function (articleData) {
                         if (articleData.val().title.includes(key) || articleData.val().body.includes(key)) {
                             createArticle(snapshot.key, snapshot.val().published, articleData.val());
                         }
                     }, function (err) {
                         console.log(err.message);
                     });
             }, function (err) {
                 alert(err);
             });
     }

     function producer() {
         //console.log(count, trueData)
         if (count === trueData && flag) {
             for (var i in articles) {
                 createArticle(articles[i].id, articles[i].published, articles[i].data)
             }
             flag = false
         }
         console.log(articles.length);
     }

     function showError(err) {
         var el = document.createElement('div');
         el.innerHTML = err.message
         content.appendChild(el)
     }

     function createArticle(id, published, data) {
         //console.log(id)
         var el = document.createElement('div');
         el.classList.add("card");
         el.classList.add("text-white");
         el.classList.add("shadow");
         el.classList.add("bg-grad");
         el.classList.add("col-md-4");
         el.classList.add("col-sm-12");
         el.classList.add("d-flex");
         el.classList.add("flex-column");
         var body = data.body;
         var bodySize = 100;
         if (body.length > bodySize) {
             body = body.substr(0, bodySize);
             body += '<span id="dots">...</span>';
         }

         var strHTML =
             '<b class="card-header" style="font-size: 20px;">' + data.title + '</b>' +
             '<div class="card-body d-flex flex-column" id="body">' +
             '<img class="card-img-top" alt="Card image cap">' +
             '<ul class="list-group list-group-flush">' +
             '  <li class="shadow" id="author">' + '作者：' + '</li>' +
             '</ul>' +
             '  <p class="card-text">' + body.replace(/(?:\r\n|\r|\n)/g, '<br>') + '</p>' +
             '<div class="card-footer text-muted align-self-end" style="margin-top: auto;">' +
             '  <p class="text-white">' + '最後更新時間：' + new Date(published).toLocaleString() + '</p>' +
             '  <div id="btn_group" class="btn-group"><a target="_blank" href="' + '../game/index.html' + '#article_id=' + id + '" class="btn btn-primary">玩遊戲</a></div>' +
             '</div>' +
             '</div>';
         appendHtml(el, strHTML);

         const adminUID = ["ky8AegNAuNcRy6FNtKThx8xacI52", "X9o6Er50BiNeptMreZswZ0DwjVD2"];
         if (auth != null && (adminUID.indexOf(auth.uid) != -1 || auth.uid == data.uid)) {
             var strTemp = '  <a href="' + '../upload/index.html' + '#article_id=' + id + '" class="btn btn-secondary">編輯文章</a>';
             appendHtml(el.querySelector('#btn_group'), strTemp);
             strTemp = '<button type="button" onclick="DeleteArticle(' + "'" + id + "'" + ')" class="btn btn-danger">刪除</button>';
             appendHtml(el.querySelector('#btn_group'), strTemp);
         }

         var ref = firebase.database().ref(userRef + "public_user_data/" + data.uid)
             .on('value',
                 function (data) {
                     el.querySelector('#body').querySelector('ul').querySelector('#author').innerHTML = '作者：' + data.val().name;
                 },
                 function (err) {
                     showError(err);
                 });

         var ref = storage.ref(imgRef + data.img_id);

         ref.getDownloadURL().then(function (url) {
             el.querySelector('div').querySelector('img').src = url;
         });
         document.getElementById('content').appendChild(el);
     }
     ////// Append HTML by plain text //////
     function appendHtml(el, str) {
         var div = document.createElement('div');
         div.innerHTML = str;
         while (div.children.length > 0) {
             el.appendChild(div.children[0]);
         }
     }
 }

 function readURL(input) {
     if (input.files && input.files[0]) {
         var reader = new FileReader();

         reader.onload = function (e) {
             $('#preview')
                 .attr('src', e.target.result)
                 .width('25%');
         };

         reader.readAsDataURL(input.files[0]);
     }
 }

 // Admin manage functions //
 function DeleteArticle(id) {
     console.log("Deleting " + id);
     database.ref(articleRef + 'article/' + id)
         .on('value', function (snapshot) {
             const uploader = snapshot.val().uid;
             const img_id = snapshot.val().img_id;
             const game_id = snapshot.val().game_id;
             Deletion(id, uploader, img_id, game_id);
             console.log(id + 'deleted');
             alert('刪除成功 請重新整理');
         });
 }

 function Deletion(id, uploader, img_id, game_id) {
     var dataAboutToDelete = [];
     // Database Deletion //
     dataAboutToDelete.push(database.ref(articleRef + 'article_list/' + id));
     dataAboutToDelete.push(database.ref(userRef + 'public_user_data/' + uploader + '/uploaded/' + id));
     // Storage Deletion //
     var storAboutToDelete = [];
     storAboutToDelete.push(storage.ref(imgRef + img_id));
     storAboutToDelete.push(storage.ref(gameRef + game_id));
     //////////////////////
     dataAboutToDelete.forEach(function (item, index, array) {
         removeData(item);
     });
     storAboutToDelete.forEach(function (item, index, array) {
         removeStor(item);
     });
     database.ref(articleRef + 'article/' + id).remove();
 }

 function removeData(ref) {
     ref.once("value")
         .then(function (snapshot) {
             ref.remove();
         });
 }

 function removeStor(ref) {
     ref.delete();
 }