firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        console.log(user.email);
    } else {
        console.log("未登入");
    }
});

function AdjustIframeHeightOnLoad(id) {
    var iframeid = document.getElementById(id);
    if (document.getElementById) {
        if (iframeid && !window.opera) {
            if (iframeid.contentDocument && iframeid.contentDocument.body.offsetHeight) {
                iframeid.height = iframeid.contentDocument.body.offsetHeight;
            } else if (iframeid.Document && iframeid.Document.body.scrollHeight) {
                iframeid.height = iframeid.Document.body.scrollHeight;
            }
        }
    }
}

function AdjustIframeHeight(id) {
    var iframeid = document.getElementById(id);
    var body = iframeid.contentDocument.body,
    html = iframeid.contentDocument.documentElement;
    var height = Math.max( body.scrollHeight, body.offsetHeight, 
        html.clientHeight, html.scrollHeight, html.offsetHeight );
    iframeid.height = height;
}

const userName = document.getElementById('userName');
const loginEmailAddr = document.getElementById('loginEmailAddr');
const loginPsword = document.getElementById('loginPsword');

const signUpUserName = document.getElementById('signUpUserName');
const signUpEmailAddr = document.getElementById('signUpEmailAddr');
const signUpPsword = document.getElementById('signUpPsword');

const btnLogin = document.getElementById('login');
const btnSignupWindow = document.getElementById('signupWindow');
const btnSignup = document.getElementById('signup');
const btnSignout = document.getElementById('signout');
const status = document.getElementById("status");
const userInfo = document.getElementById("UserInfo");
const navParent = document.getElementById("navParent");
// const loginWindow = document.getElementById("loginWindow");

firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        console.log(user.email, "login");
        loginUser = firebase.auth().currentUser;
        status.innerText = "登出";
        status.setAttribute("onclick","collapseAndSignOut()");
        status.removeAttribute("data-target");
        btnSignupWindow.style.display = "none";
        firebase.database().ref('/user_group/public_user_data/'+loginUser.uid).once('value').then(function(data){
            userInfo.innerHTML = "Hello, " + data.val().name;
        });
    } else {
        console.log("login failed");
        loginUser = null;
        status.innerText = "登入";
        status.setAttribute("onclick","collapse()");
        status.setAttribute("data-target","#loginWindow");
        btnSignupWindow.style.display = "inline";
        userInfo.innerText = "";
    }
});

btnLogin.addEventListener('click', e => {
    const email = loginEmailAddr.value;
    const pswd = loginPsword.value;
    const auth = firebase.auth();

    const promise = auth.signInWithEmailAndPassword(email, pswd)
    .then(function(){
        $("#loginWindow").modal("hide");
    });
    promise.catch(e => alert(e.message));
    
})

function collapse(){
    $('.collapse').collapse("hide");
}

function collapseAndSignOut(){
    $('.collapse').collapse("hide");
    SignOut();
}

function SignUp(){
    const name = signUpUserName.value;
    const email = signUpEmailAddr.value;
    const pswd = signUpPsword.value;
    const auth = firebase.auth();
    console.log(email);

    
    const promise = auth.createUserWithEmailAndPassword(email, pswd)
        .then(function () {
            var updates = {};
            const publicData = {
                email: auth.currentUser.email,
                name: name
            };
            updates['/user_group/public_user_data/' + auth.currentUser.uid] = publicData;
            updates['/user_group/private_user_data/' + auth.currentUser.uid] = {
                password: pswd
            };
            firebase.database().ref().update(updates)
                .then(function () {
                    alert('註冊成功');
                    console.log("Sign Up");
                    window.location.reload();
                })
                .catch(function (error) {
                    console.log(error);
                    
                });
                $("#signUpWindow").modal("hide");
        });
    promise.catch(e => alert(e.message));
}

function SignOut(){
    firebase.auth().signOut().then(function(){
        console.log("sign out!");
    }).catch(function(e){
        console.log(e.message);
    });
}

function ChangeTitle(title){
    document.title = "北科遊戲雲 - " + title;
}

function Goto(iframe, url){
    iframe.src = url;
    location.href = "#top";
}