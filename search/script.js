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
    result.innerHTML = "";
    db.ref('/article_group/article_list')
        .orderByChild('published')
        .on('child_added', function (snapshot) {
            db.ref('/article_group/article/' + snapshot.key)
                .on('value', function (articleData) {
                    if(articleData.val().title.includes(key) || articleData.val().body.includes(key))
                        addResult(snapshot.key, snapshot.val().published, articleData.val());
                }, function (err) {
                    console.log(err.message);
                });
        }, function (err) {
            alert(err);
        });
}

function addResult(id, published, data) {
    console.log('add');
    var node = document.createElement('div');

    var title = document.createElement('p');
    title.innerText = data.title;
    node.appendChild(title);

    var date = document.createElement('p');
    date.innerText = published;
    node.appendChild(date);


    var idtext = document.createElement('p');
    idtext.innerText = id;
    node.appendChild(idtext);

    result.appendChild(node);
}