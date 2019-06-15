var hashParams = window.location.hash.substr(1).split('&'); // substr(1) to remove the `#`
for (var i = 0; i < hashParams.length; i++) {
    var p = hashParams[i].split('=');
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
    el.classList.add("collapse");
    el.classList.add("text-white");
    el.classList.add("bg-dark");
    el.classList.add("align-items-center");
    el.classList.add("align-items-stretchs");
    el.id = "navbarToggleExternalContent";
    el.style = "height: 100%";
    
    var game = storage.ref(gameRef + data.game_id);
    gameDownloading = game.getDownloadURL().then(function (url) {
        var gameEmbed = document.createElement('object');
        gameEmbed.id = 'iflash';
        document.getElementById('content').appendChild(gameEmbed);
        document.getElementById('content').innerHTML +=
        '<nav class="navbar navbar-dark bg-dark w-100">' +
        '  <button class="navbar-toggler w-100 d-flex justify-content-between align-items-center" type="button" data-toggle="collapse" data-target="#navbarToggleExternalContent" aria-controls="navbarToggleExternalContent" aria-expanded="false" aria-label="Toggle navigation">' +
        '    <b class="card-header" style="font-size: 20px;">' + data.title + '</b>' +
        '    <span class="navbar-toggler-icon"></span>' +
        '  </button>' +
        '</nav>';

        var strHTML =
            '<div class="card-body w-100" id="body">' +
            '<ul class="list-group list-group-flush">' +
            '  <li class="list-group-item card-text bg-dark" id="author">' + '作者：' + '</li>' +
            '  <li class="list-group-item card-text bg-dark">' + '最後更新時間：' + new Date(published).toLocaleString() + '</li>' +
            '</ul>' +
            '  <p class="card-text">' + data.body + '</p>' +
            '</div>';
        appendHtml(el, strHTML);
        var ref = firebase.database().ref(userRef + "public_user_data/" + data.uid)
            .on('value',
                function (data) {
                    el.querySelector('#body').querySelector('ul').querySelector('#author').innerHTML = '作者：' + data.val().name;
                },
                function (err) {
                    showError(err);
                });
        document.getElementById('content').appendChild(el);

        var flashvars = {};
        var params = {};
          params.menu="false";
          params.wmode="transparent";
          params.bgcolor="#CCCCCC";
          params.allowfullscreen="true";
       params.allowscriptaccess="always";
        var attributes = {};
          attributes.id="iflash";
          attributes.name="iflash";
        swfobject.embedSWF(url, "iflash", "100%", "100%", "10.0.2", "false", flashvars, params, attributes);
        document.getElementById('iflash').data = url;
    });

    function appendHtml(el, str) {
        var div = document.createElement('div');
        div.innerHTML = str;
        while (div.children.length > 0) {
            el.appendChild(div.children[0]);
        }
    }
}