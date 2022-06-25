function hashPass(obj) {
    var pwdObj = document.getElementById('floatingPassword');
    var hashObj = new jsSHA("SHA-512","TEXT",{numRounds: 1});
    hashObj.update(pwdObj.value);
    var hash = hashObj.getHash("HEX");
    pwdObj.value = hash;
}

function sendAJAX() {
    var city = $('#floatingInputValue').val()
    var sendInfo = {
        city: city,
        email: $('#emailText').text()
    }
    $.ajax({
        method: "POST",
        url: "/addCity",
        success: function(response) {
            $('#infoAlert').text('Città inserita correttamente.')
            $('#infoAlert').css('display','block')
            getCityCard(city)
        },
        data: sendInfo
    })
}

function getCityCard(city) {
    var sendInfo = {city: city}
    $.ajax({
        method: "POST",
        url: "/getCityCard",
        success: function(response) {
            var photo = response.pCity
            var info = response.cInfo
            $('#albumCont').append('<div class="col"><div class="card shadow"><img src="data:image/jpeg;base64,' +photo+ '" class="card-img-top" alt="' +info.name+ '"><div class="card-body"><h5 class="card-title">' +info.name+ '</h5><p class="card-text">' +info.weather[0].description+ '</p><div class="d-flex justify-content-between align-items-center"><div class="btn-group"><a type="button" class="btn btn-sm btn-outline-secondary" href="/album/' +info.name+ '">Più informazioni</a></div></div></div></div></div>')
        },
        data: sendInfo
    })
}
