var hashParams = window.location.hash.substr(1).split('&'); // substr(1) to remove the `#`
for(var i = 0; i < hashParams.length; i++){
    var p = hashParams[i].split('=');
    if(p=='')
        break;
    document.getElementById(p[0]).value = decodeURIComponent(p[1]);
}
 
 ////////// Load Article Function //////////
 var limit = 5;
 var count = 0;
 var trueData = 0;
 var flag = true;
 var articles = [];
 firebase.database().ref('/article_group/article_list')
     .on('value', function (snapshot) {
         trueData = 0;
         snapshot.forEach(function (childSnapshot) {
             if (trueData < limit)
                 trueData++;
         });
     });

 firebase.database().ref('/article_group/article_list')
     .orderByChild('published').limitToLast(limit).startAt(1)
     .on('child_added', function (data) {

         firebase.database().ref('/article_group/article/' + data.key)
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
     document.getElementById('content').appendChild(el)
 }

 function createArticle(id, published, data) {
     console.log(id)
     var el = document.createElement('div');
     el.class = "card";
     el.style = "width: 18rem;"
     var title = document.createElement('h1');
     var body = document.createElement('p');
     title.innerHTML = data.title;
     body.innerHTML = data.body;

    var strHTML = 
    '<div class="card-body">' +
    '<img class="card-img-top" alt="Card image cap">' +
    '  <h5 class="card-title">' + data.title +'</h5>' +
    '<ul class="list-group list-group-flush">' +
    '  <li class="list-group-item">' + '作者：' + data.uid + '</li>' +
    '  <li class="list-group-item">' + '最後更新時間：' + new Date(published).toLocaleString() + '</li>' +
    '</ul>' +
    '  <p class="card-text">' + data.body + '</p>' +
    '  <a href="' + '../game/game.html' + '#game_id=uploaded_games/' + data.game_id + '" class="btn btn-primary">玩遊戲</a>' +
    '</div>';
  appendHtml(el, strHTML);

     var imgRef = storage.ref('uploaded_imgs/' + data.img_id);
     var img = document.createElement('img');
     img.class = "card-img-top";
     img.alt = "Card image cap";
     img.style = ""
     imgRef.getDownloadURL().then(function (url) {
        el.children[0].children[0].src = url;
     });
  document.getElementById('content').appendChild(el);

 }

 ////////////////////// Upload Function /////////////////////
 var storage = firebase.storage();
 var file;
 var img;
 var date_submit;

 var submitButton = document.querySelector('#submit-button');
 var titleText = document.querySelector('#title');
 var bodyText = document.querySelector('#body');
 var uploaderDiv = document.querySelector('#uploader');

 var imgButton = document.getElementById('imgButton');
 imgButton.addEventListener('change', function(e){
    img = e.target.files[0];
 });

 var fileButton = document.getElementById('fileButton');
 fileButton.addEventListener('change', function(e){
    file = e.target.files[0];
 });
 submitButton.addEventListener('click', function () {
     var title = titleText.value;
     var body = bodyText.value;
     var file_name =  file.name;
     var img_name = img.name;
     date_submit = new Date().toLocaleString('en-GB').replace(/[^\w\s]/gi, "_");
     if (title == "" || file_name == "" || img_name == "")
         return 0;
     var articleRef = '/article_group/';
     var auth = firebase.auth().currentUser;
     var email = "null";
     if(auth != null)
        email = auth.email;
     var articleData = {
         title: title,
         body: body,
         date_edited: firebase.database.ServerValue.TIMESTAMP,
         uid: email,
         slug_name: title.replace(/\s/g, '-'),
         game_id: date_submit + '_' + file_name, 
         img_id: date_submit + '_' + img_name
     };
     var key = firebase.database().ref(articleRef + 'article').push().key;
     var imgRef = storage.ref('uploaded_imgs/' + date_submit + '_' + img_name);
     imgRef.put(img);
     var storageRef = storage.ref('uploaded_games/' + date_submit + '_' + file_name);
     var task = storageRef.put(file);
     task.on('state_changed',
        function progress(snapshot) {
            var percentage = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            var uploader = uploaderDiv.children[0];
            uploaderDiv.style = "";
            uploader.valuenow = percentage;
            uploader.style = "width: " + percentage + "%";
        },
        
        function error(err) {
        },

        function complete() {
            var updates = {};
            updates[articleRef + 'article/' + key] = articleData;
            updates[articleRef + 'article_list/' + key] = {
                published: firebase.database.ServerValue.TIMESTAMP
            };
            count = 0;
            return firebase.database().ref().update(updates)
                .then(function () {
                    alert('發表成功');
                    window.location.reload();
                })
                .catch(function (error) {
                    console.log(error);
                    alert(error.message)
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

////// Append HTML by plain text //////
function appendHtml(el, str) {
    var div = document.createElement('div');
    div.innerHTML = str;
    while (div.children.length > 0) {
      el.appendChild(div.children[0]);
    }
  }