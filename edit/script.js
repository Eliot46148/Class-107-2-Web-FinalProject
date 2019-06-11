var hash = window.location.hash;
var hashParams = hash.substr(1).split('&'); // substr(1) to remove the `#`
for (var i = 0; i < hashParams.length; i++) {
    var p = hashParams[i].split('=');
    if (p == '')
        break;
    document.getElementById(p[0]).value = decodeURIComponent(p[1]);
}

var config = {
    apiKey: "AIzaSyC-7yHkjfJsXaOlBVj81bv_nP87X2_l2HY",
    authDomain: "utility-dynamo-242807.firebaseapp.com",
    databaseURL: "https://utility-dynamo-242807.firebaseio.com",
    projectId: "utility-dynamo-242807",
    storageBucket: "utility-dynamo-242807.appspot.com",
    messagingSenderId: "825744686702",
    appId: "1:825744686702:web:18baeb1ddfb42964"
};
firebase.initializeApp(config);

var database = firebase.database();
var storage = firebase.storage();
var article_id_ref = document.getElementById('article_id').value;
var articleRef = '/article_group/';
var userRef = '/user_group/';
var imgRef = 'uploaded_imgs/';
var gameRef = 'uploaded_games/';

database.ref(articleRef + 'article/' + article_id_ref)
.on('value', function (snapshot1) {
    database.ref(articleRef + 'article_list/' + article_id_ref)
    .on('value', function (snapshot2) {
        createArticle(article_id_ref, snapshot2.val().published, snapshot1.val());
    });
});

function createArticle(id, published, data) {
    console.log(id)
    var el = document.createElement('div');
    el.classList.add("card");

    var strHTML =
        '<input type="text" class="card-header" style="font-size: 20px;" placeholder="標題" value="' + data.title + '">' +
        '<div class="card-body" id="body">' +
        '<a href="' + hash + '"><img class="card-img-top" alt="Card image cap" style="max-width: 300px;" id="preview"></a>' +
        '<input type="file" accept="image/gif, image/jpeg, image/png" id="imgButton" value="upload" style="width: 100%" onchange="readURL(this);" required>' +
        '<label>選擇遊戲檔案</label><br /><input type="file" accept=".swf" id="fileButton" value="upload" style="width: 100%" required><br />' +
        '<ul class="list-group list-group-flush">' +
        '  <li class="list-group-item card-text" id="author">' + '作者：' + '</li>' +
        '  <li class="list-group-item card-text">' + '最後更新時間：' + new Date(published).toLocaleString() + '</li>' +
        '</ul>' +
        '  <textarea class="card-text" rows="5" placeholder="描述" style="width: 100%">' + data.body + '</textarea>' +
        '<button type="button" class="btn btn-success">提交(目前沒功能)</button>' +
        '</div>';
    appendHtml(el, strHTML);

    var ref = storage.ref(imgRef + data.img_id);
    ref.getDownloadURL().then(function (url) {
        el.querySelector('#body').querySelector('a').querySelector('img').src = url;
    });
    var ref = firebase.database().ref(userRef + "public_user_data/" + data.uid)
        .on('value',
            function (data) {
                el.querySelector('#body').querySelector('ul').querySelector('#author').innerHTML = '作者：' + data.val().name;
            },
            function (err) {
                showError(err);
            });
    document.getElementById('content').appendChild(el);

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