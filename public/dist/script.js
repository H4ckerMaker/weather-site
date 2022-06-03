function hashPass(obj) {
    var pwdObj = document.getElementById('floatingPassword');
    var hashObj = new jsSHA("SHA-512","TEXT",{numRounds: 1});
    hashObj.update(pwdObj.value);
    var hash = hashObj.getHash("HEX");
    pwdObj.value = hash;
}

function sendAJAX() {
    var sendInfo = {
        city: $('#floatingInputValue').val(),
        email: $('#emailText').text()
    }
    $.ajax({
        method: "POST",
        url: "/addCity",
        success: function(response) {
            $('#infoAlert').text('Città inserita correttamente. Ricaricare la pagina')
            $('#infoAlert').css('display','block')
        },
        data: sendInfo
    })
}
