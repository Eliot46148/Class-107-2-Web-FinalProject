 ////////// Parsing prefilled url information //////////
 var hashParams = window.location.hash.substr(1).split('&'); // substr(1) to remove the `#`
 for (var i = 0; i < hashParams.length; i++) {
     var p = hashParams[i].split('=');
     if (p == '')
         break;
     document.getElementById(p[0]).value = decodeURIComponent(p[1]);
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
                     producer();

                 }, function (err) {
                     showError(err);
                 });
         }, function (err) {
             alert(err);
         })

     function producer() {
         console.log(count, trueData)
         if (count === trueData && flag) {
             for (var i in articles) {
                 createArticle(articles[i].id, articles[i].published, articles[i].data)
             }
             flag = false
         }
     }

     function showError(err) {
         var el = document.createElement('div');
         el.innerHTML = err.message
         content.appendChild(el)
     }

     function createArticle(id, published, data) {
         console.log(id)
         var el = document.createElement('div');
         el.classList.add("card");
         el.classList.add("col-md-4");
         el.style = "width: 18rem;"
         var title = document.createElement('h1');
         var body = document.createElement('p');
         title.innerHTML = data.title;
         body.innerHTML = data.body;

         var strHTML =
             '<div class="card-body">' +
             '<img class="card-img-top" alt="Card image cap">' +
             '  <h5 class="card-title">' + data.title + '</h5>' +
             '<ul class="list-group list-group-flush">' +
             '  <li class="list-group-item" id="author">' + '作者：' + '</li>' +
             '  <li class="list-group-item">' + '最後更新時間：' + new Date(published).toLocaleString() + '</li>' +
             '</ul>' +
             '  <p class="card-text">' + data.body + '</p>' +
             '  <a href="' + '../game/index.html' + '#game_id=uploaded_games/' + data.game_id + '" class="btn btn-primary">玩遊戲</a>' +
             '</div>';
         appendHtml(el, strHTML);

         var ref = storage.ref(imgRef + data.img_id);
         var img = document.createElement('img');
         img.class = "card-img-top";
         img.alt = "Card image cap";
         img.style = ""
         ref.getDownloadURL().then(function (url) {
             el.querySelector('div').querySelector('img').src = url;
             parent.AdjustIframeHeightOnLoad('blog');
         });
         var ref = firebase.database().ref(userRef + "public_user_data/" + data.uid)
             .on('value',
                 function (data) {
                     el.querySelector('div').querySelector('ul').querySelector('#author').innerHTML = data.val().name; // children[0].children[2].children[0].innerHTML = '作者：' + data.val().name;
                     parent.AdjustIframeHeightOnLoad('blog');
                 },
                 function (err) {
                     showError(err);
                 });

         const adminUID = "ky8AegNAuNcRy6FNtKThx8xacI52";
         if (auth != null && auth.uid == adminUID) {
             var strTemp = '<button type="button" onclick="DeleteArticle(' + "'" + id + "'" + ')" class="btn btn-danger">刪除</button>'
             appendHtml(el.querySelector('div'), strTemp);
         }
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

 ////////////////////// Upload Function /////////////////////
 var file;
 var img;

 var submitButton = document.querySelector('#submit-button');
 var titleText = document.querySelector('#title');
 var bodyText = document.querySelector('#body');
 var uploaderDiv = document.querySelector('#uploader');

 var imgButton = document.getElementById('imgButton');
 imgButton.addEventListener('change', function (e) {
     img = e.target.files[0];
 });

 var fileButton = document.getElementById('fileButton');
 fileButton.addEventListener('change', function (e) {
     file = e.target.files[0];
 });
 submitButton.addEventListener('click', function () {
     var title = titleText.value;
     var body = bodyText.value;
     var file_name = file.name;
     var img_name = img.name;
     var date_submit;
     if (title == "" || file_name == "" || img_name == "" || auth == null)
         return 0;
     var uid = auth.uid;
     date_submit = new Date().toLocaleString('en-GB').replace(/[^\w\s]/gi, "_").replace(' ','');
     var articleData = {
         title: title,
         body: body,
         date_edited: firebase.database.ServerValue.TIMESTAMP,
         uid: uid,
         slug_name: title.replace(/\s/g, '-'),
         game_id: date_submit + '_' + file_name,
         img_id: date_submit + '_' + img_name
     };
     var key = firebase.database().ref(articleRef + 'article').push().key;
     var ref = storage.ref(imgRef + date_submit + '_' + img_name);
     ref.put(img);
     var storageRef = storage.ref(gameRef + date_submit + '_' + file_name);
     var task = storageRef.put(file);
     task.on('state_changed',
         function progress(snapshot) {
             var percentage = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
             var uploader = uploaderDiv.children[0];
             uploaderDiv.style = "";
             uploader.valuenow = percentage;
             uploader.style = "width: " + percentage + "%";
         },

         function error(err) {},

         function complete() {
             var updates = {};
             updates[articleRef + 'article/' + key] = articleData;
             updates[articleRef + 'article_list/' + key] = {
                 published: firebase.database.ServerValue.TIMESTAMP
             };
             updates[userRef + 'public_user_data/' + auth.uid + '/uploaded/' + key] = {
                 published: firebase.database.ServerValue.TIMESTAMP
             };
             count = 0;
             return firebase.database().ref().update(updates)
                 .then(function () {
                     alert('發表成功');
                     loadArticle();
                 })
                 .catch(function (error) {
                     console.log(error);
                 });
         }
     );
 });

 ////////////////////////////////////////////////

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
    var ref = database.ref(articleRef + 'article/' + id);
    ref.on('value', function (snapshot) {
        const uploader = snapshot.val().uid;
        const img_id = snapshot.val().img_id;
        const game_id = snapshot.val().game_id;
        Deletion(id, uploader, img_id, game_id);
        var tref = database.ref(articleRef + 'article/' + id);
        tref.remove();
        console.log(id + 'deleted');
        alert('刪除成功');
        loadArticle();
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
     dataAboutToDelete.forEach(function(item, index, array) {
        removeData(item);
     });
     storAboutToDelete.forEach(function(item, index, array) {
        removeStor(item);
     });
 }

 function removeData(ref) {
    ref.once("value")
    .then(function(snapshot) {
      ref.remove();
    });
}

function removeStor(ref) {
    ref.delete();
}