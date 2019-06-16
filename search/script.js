const auth = firebase.auth();
const db = firebase.database();
const storage = firebase.storage();
const target = document.getElementById('target');
const content = document.getElementById('content');
const result = document.getElementById('result');

window.onload = function () {
    setInterval("parent.AdjustIframeHeight('blog')", 10);
}

function search() {
    console.log("Enter Search!");
    if(target.value == ""){
        alert("請輸入關鍵字");
        return;
    }
    else
        var key = target.value;
    console.log(key);
    content.innerHTML ="";
    // result.innerHTML = "";
    db.ref('/article_group/article_list')
        .orderByChild('published')
        .on('child_added', function (snapshot) {
            db.ref('/article_group/article/' + snapshot.key)
                .on('value', function (articleData) {
                    if(articleData.val().title.includes(key) || articleData.val().body.includes(key)){
                        createArticle(snapshot.key, snapshot.val().published, articleData.val());
                    }
                }, function (err) {
                    console.log(err.message);
                });
        }, function (err) {
            alert(err);
        });
}

// function addResult(id, published, data) {
//     console.log('add');
//     var node = document.createElement('div');

//     var title = document.createElement('p');
//     title.innerText = data.title;
//     node.appendChild(title);

//     var date = document.createElement('p');
//     date.innerText = published;
//     node.appendChild(date);


//     var idtext = document.createElement('p');
//     idtext.innerText = id;
//     node.appendChild(idtext);

//     result.appendChild(node);
// }

function createArticle(id, published, data) {
    var el = document.createElement('div');
    el.classList.add("card");
    el.classList.add("text-white");
    el.classList.add("bg-dark");
    el.classList.add("col-md-4");
    el.classList.add("col-sm-12");
    var body = data.body;
    var bodySize = 100;
    if(body.length > bodySize){
        body = body.substr(0, bodySize);
        body += '<span id="dots">...</span>';
    }

    var strHTML =
        '<b class="card-header" style="font-size: 20px;">' + data.title + '</b>' +
        '<div class="card-body d-flex flex-column" id="body">' +
        '<img class="card-img-top" alt="Card image cap">' +
        '<ul class="list-group list-group-flush">' +
        '  <li class="list-group-item card-text bg-dark" id="author">' + '作者：' + '</li>' +
        '</ul>' +
        '  <p class="card-text align-self-stretch h-100">' + body + '</p>' +
        '<div class="card-footer text-muted align-self-end">' + 
        '  <p>' + '最後更新時間：' + new Date(published).toLocaleString() + '</p>' +
        '  <div id="btn_group" class="btn-group"><a href="' + '../game/index.html' + '#article_id=' + id + '" class="btn btn-primary">玩遊戲</a></div>' +
        '</div>' +
        '</div>';
    appendHtml(el, strHTML);

    const adminUID = ["ky8AegNAuNcRy6FNtKThx8xacI52", "vxD4ir50VWc3zA2UUYaghAkv1oT2"];
    if (auth != null && (adminUID.indexOf(auth.uid) != -1 || auth.uid == data.uid)) {
        var strTemp = '  <a href="' + '../edit/index.html' + '#article_id=' + id + '" class="btn btn-secondary">編輯文章</a>';
        appendHtml(el.querySelector('#btn_group'), strTemp);
        strTemp = '<button type="button" onclick="DeleteArticle(' + "'" + id + "'" + ')" class="btn btn-danger">刪除</button>';
        appendHtml(el.querySelector('#btn_group'), strTemp);
    }

    var ref = firebase.database().ref("/user_group/public_user_data/" + data.uid)
        .on('value',
            function (data) {
                el.querySelector('#body').querySelector('ul').querySelector('#author').innerHTML = '作者：' + data.val().name;
            },
            function (err) {
                showError(err);
            });

    var ref = storage.ref('uploaded_imgs/' + data.img_id);

    ref.getDownloadURL().then(function (url) {
       el.querySelector('div').querySelector('img').src = url;
    });
    document.getElementById('content').appendChild(el);
}

function appendHtml(el, str) {
    var div = document.createElement('div');
    div.innerHTML = str;
    while (div.children.length > 0) {
        el.appendChild(div.children[0]);
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