function hashPass(obj) {
    var pwdObj = document.getElementById('floatingPassword');
    var hashObj = new jsSHA("SHA-512","TEXT",{numRounds: 1});
    hashObj.update(pwdObj.value);
    var hash = hashObj.getHash("HEX");
    pwdObj.value = hash;
}

function sendAJAX() {
    var sendInfo = {
        data: $('#floatingInputValue').val()
    }
    $.ajax({
        method: "POST",
        url: "/addCity",
        success: function(response) {
            console.log('Città aggiunta '+response)
        },
        data: sendInfo
    })
}
