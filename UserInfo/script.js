firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        console.log(user.email);
    } else {
        console.log("未登入");
    }
});

function AdjustIframeHeightOnLoad(id) {
	var iframeid=document.getElementById(id);
	if (document.getElementById){
	if (iframeid && !window.opera) {
			if (iframeid.contentDocument && iframeid.contentDocument.body.offsetHeight) {
				iframeid.height = iframeid.contentDocument.body.offsetHeight;
			}
			else if(iframeid.Document && iframeid.Document.body.scrollHeight) {
				iframeid.height = iframeid.Document.body.scrollHeight;
			}
		}
	}
}