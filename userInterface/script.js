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

     database.ref('/user_group/public_user_data/' + auth.uid + '/uploaded')
         .on('value', function (snapshot) {
             trueData = 0;
             snapshot.forEach(function (childSnapshot) {
                 if (trueData < limit)
                     trueData++;
             });
         });

     database.ref('/user_group/public_user_data/' + auth.uid + '/uploaded')
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
         el.classList.add("bg-grad");
         el.classList.add("shadow");
         var body = data.body;
         var bodySize = 100;
         if (body.length > bodySize) {
             body = body.substr(0, bodySize);
             body += '<span id="dots">...</span>';
         }

         var strHTML =
             '<b class="card-header" style="font-size: 20px;">' + data.title + '</b>' +
             '<div class="card-body d-flex" id="body">' +
             '<img class="w-100 h-50" alt="Card image cap">' +
             '<div>' +
             '<ul class="list-group list-group-flush">' +
             '  <li class="card-text shadow" id="author">' + '作者：' + '</li>' +
             '</ul>' +
             '  <p class="card-text align-self-stretch">' + body.replace(/(?:\r\n|\r|\n)/g, '<br>') + '</p>' +
             '<div class="text-muted align-self-end shadow">' +
             '  <p class="text-white">' + '最後更新時間：' + new Date(published).toLocaleString() + '</p>' +
             '  <div id="btn_group" class="btn-group"><a target="_blank" href="' + '../game/index.html' + '#article_id=' + id + '" class="btn btn-primary">玩遊戲</a></div>' +
             '</div>' +
             '</div>' +
             '</div>';
         appendHtml(el, strHTML);

         const adminUID = ["ky8AegNAuNcRy6FNtKThx8xacI52", "vxD4ir50VWc3zA2UUYaghAkv1oT2"];
         if (auth != null && (adminUID.indexOf(auth.uid) != -1 || auth.uid == data.uid)) {
             var strTemp = '  <button type="button" onclick="Edit(' + "'" + id + "'" + '); article_id_ref=' + "'" + id + ";'" + '" class="btn btn-secondary">編輯文章</button>';
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

 var article_id_ref = document.getElementById('article_id').value;
function Edit(article_id_ref){
    database.ref(articleRef + 'article/' + article_id_ref)
        .on('value', function (snapshot1) {
            database.ref(articleRef + 'article_list/' + article_id_ref)
                .on('value', function (snapshot2) {
                    parseEditArticle(article_id_ref, snapshot2.val().published, snapshot1.val());
                });
        });
 }

 window.onload = function () {
     setInterval("parent.AdjustIframeHeight('blog')", 10);
 }

 ////////////////////// Upload Function /////////////////////
 var file;
 var file_name_get;
 var img;
 var img_name_get;

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

 function parseEditArticle(id, published, data) {
     console.log(id)
     titleText.value = data.title;
     bodyText.innerHTML = data.body;

     var ref = storage.ref(imgRef + data.img_id);
     ref.getDownloadURL().then(function (url) {
         document.getElementById('preview').src = url;
         file_name_get = data.game_id;
         img_name_get = data.img_id;
     });
     submitButton.innerHTML = '修改文章';
     titleText.removeAttribute("required");
     imgButton.removeAttribute("required");
     fileButton.removeAttribute("required");
 }

 submitButton.addEventListener('click', function () {
     
     if (article_id_ref == "") {
         var title = titleText.value;
         if (title == "" || typeof file == 'undefined' || typeof img == 'undefined' || auth == null)
             return 0;
         var body = bodyText.value;
         var file_name = file.name;
         var img_name = img.name;
         var date_submit;
         var originalAuth = auth.uid;
         date_submit = new Date().toLocaleString('en-GB').replace(/[^\w\s]/gi, "_").replace(' ', '');
         var articleData = {
             title: title,
             body: body,
             date_edited: firebase.database.ServerValue.TIMESTAMP,
             uid: originalAuth,
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
                 updates[userRef + 'public_user_data/' + originalAuth + '/uploaded/' + key] = {
                     published: firebase.database.ServerValue.TIMESTAMP
                 };
                 count = 0;
                 return firebase.database().ref().update(updates)
                     .then(function () {
                         alert('發表成功');
                         titleText.value = '';
                         bodyText.value = '';
                         imgButton.value = '';
                         fileButton.value = '';
                         uploaderDiv.style = "display: none;";
                     })
                     .catch(function (error) {
                         console.log(error);
                     });
             }
         );
     } else {
         DeleteOriginalStorage();
         var title = titleText.value;
         if (title == "" || auth == null)
             return 0;
         var body = bodyText.value;
         var date_submit = new Date().toLocaleString('en-GB').replace(/[^\w\s]/gi, "_").replace(' ', '');
         var originalAuth;
         database.ref(articleRef + 'article/' + article_id_ref)
             .on('value', function (snapshot) {
                originalAuth = snapshot.val().uid;
             });
         var file_name = file_name_get;
         if (file != null) {
             file_name = date_submit + '_' + file.name;
         }
         var img_name = img_name_get;
         if (img != null) {
             img_name = date_submit + '_' + img.name;
             storage.ref(imgRef + img_name).put(img);
         }
         var articleData = {
             title: title,
             body: body,
             date_edited: firebase.database.ServerValue.TIMESTAMP,
             slug_name: title.replace(/\s/g, '-'),
             img_id: img_name,
             game_id: file_name,
             uid: originalAuth
         };
         if (file != null) {
             var storageRef = storage.ref(gameRef + file_name);
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
                     updates[articleRef + 'article/' + article_id_ref] = articleData;
                     updates[articleRef + 'article_list/' + article_id_ref] = {
                         published: firebase.database.ServerValue.TIMESTAMP
                     };
                     updates[userRef + 'public_user_data/' + originalAuth + '/uploaded/' + article_id_ref] = {
                         published: firebase.database.ServerValue.TIMESTAMP
                     };
                     count = 0;
                     return firebase.database().ref().update(updates)
                         .then(function () {
                             alert('修改成功');
                             uploaderDiv.style = "display: none;";
                             loadArticle();
                         })
                         .catch(function (error) {
                             console.log(error);
                         });
                 }
             );
         } else {
             var updates = {};
             updates[articleRef + 'article/' + article_id_ref] = articleData;
             updates[articleRef + 'article_list/' + article_id_ref] = {
                 published: firebase.database.ServerValue.TIMESTAMP
             };
             updates[userRef + 'public_user_data/' + originalAuth + '/uploaded/' + article_id_ref] = {
                 published: firebase.database.ServerValue.TIMESTAMP
             };
             count = 0;
             return firebase.database().ref().update(updates)
                 .then(function () {
                     alert('修改成功');
                     loadArticle();
                 })
                 .catch(function (error) {
                     console.log(error);
                 });
         }
     }
 });

 ////////////////////////////////////////////////

 function readURL(input) {
     if (input.files && input.files[0]) {
         var reader = new FileReader();

         reader.onload = function (e) {
             $('#preview')
                 .attr('src', e.target.result)
                 .width('50%');
         };

         reader.readAsDataURL(input.files[0]);
     }
 }

 // Admin manage functions //
 function DeleteOriginalStorage() {
     console.log("Deleting " + article_id_ref);
     var storAboutToDelete = [];
     if (img != null)
         storAboutToDelete.push(storage.ref(imgRef + img_name_get));
     if (file != null)
         storAboutToDelete.push(storage.ref(gameRef + file_name_get));
     //////////////////////
     storAboutToDelete.forEach(function (item, index, array) {
         item.delete();
     });
     console.log(article_id_ref + 'deleted');
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