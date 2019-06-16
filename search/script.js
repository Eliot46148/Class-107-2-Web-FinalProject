const db = firebase.database();
const storage = firebase.storage();
const title = document.getElementById('title');
const target = document.getElementById('target');
var result = [];

firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        title.innerText = user.email;
    } else {
        title.innerText = "未登入";
    }
});

function search() {
    console.log("Enter Search!");

    db.ref('/article_group/article'+'Lh1tepy_ireEXsuELxB').orderByKey().once('value').then(function(snapshot){
        result.push(snapshot.val());
    });

    // db.ref('/article_group/article_list')
    //     .orderByChild('published').limitToLast(100).startAt(1)
    //     .on('child_added', function (data) {
    //         db.ref('/article_group/article/' + data.key)
    //             .on('value', function (articleData) {
    //                 articles.unshift({
    //                     id: data.key,
    //                     published: data.val().published,
    //                     data: articleData.val()
    //                 });
    //                 articles.sort(function (a, b) {
    //                     return a.published < b.published
    //                 });
    //                 //  producer();
    //             }, function (err) {
    //                 showError(err);
    //             });

    //     }, function (err) {
    //         alert(err);
    //     });
    console.log(result);
}