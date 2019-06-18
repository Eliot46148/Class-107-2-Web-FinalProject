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
 });

 var article_id_ref = document.getElementById('article_id').value;
 database.ref(articleRef + 'article/' + article_id_ref)
     .on('value', function (snapshot1) {
         database.ref(articleRef + 'article_list/' + article_id_ref)
             .on('value', function (snapshot2) {
                 parseEditArticle(article_id_ref, snapshot2.val().published, snapshot1.val());
             });
     });

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
         var originalAuth;
         database.ref(articleRef + 'article/' + article_id_ref)
             .on('value', function (snapshot) {
                originalAuth = snapshot.val().uid;
             });
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
         var originalAuth;
         database.ref(articleRef + 'article/' + article_id_ref)
             .on('value', function (snapshot) {
                originalAuth = snapshot.val().uid;
             });
         if (title == "" || auth == null)
             return 0;
         var body = bodyText.value;
         var date_submit = new Date().toLocaleString('en-GB').replace(/[^\w\s]/gi, "_").replace(' ', '');
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
                 .width('100%');
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