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
     date_submit = new Date().toLocaleString('en-GB').replace(/[^\w\s]/gi, "_").replace(' ', '');
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