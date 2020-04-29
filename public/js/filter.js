document.querySelector('.filter-create').addEventListener('click', function(){
    document.querySelector('.create-filter-popup').style.display = 'flex';
    document.querySelector('.save').style.display = 'flex';
    document.querySelector('.edition').style.display = 'none';
});
document.querySelectorAll('.close-popup-btn, .save').forEach(elem => {
    elem.addEventListener('click', function(){
        document.querySelector('.create-filter-popup').style.display = 'none';
    });
})


let scraps = document.querySelectorAll('.live-scrap > *');
document.querySelector('.sport').addEventListener('change', function(){
    let changeSport = this.options[this.options.selectedIndex].value;
    scraps.forEach(element => element.style.display = 'none')
    if(changeSport != 'none'){
        document.querySelector('.live-scrap-' + changeSport).style.display = 'block';
    }
    if(changeSport == 'basketball'){
        document.querySelector('.sport-setting').style.display = 'block';
    }
    else if(changeSport == 'volleyball'){
        document.querySelector('.sport-setting').style.display = 'block';
    }
    else if(changeSport == 'tennis'){
        document.querySelector('.sport-setting').style.display = 'block';
    }
    else if(changeSport == 'none'){
        document.querySelector('.sport-setting').style.display = 'none';
    }
});


document.querySelectorAll('input[type="checkbox"]').forEach(elem => {
    elem.addEventListener('click', function(){
        document.querySelector('label[for="' + this.getAttribute('id') + '"]').classList.toggle('active-chat');
    })
});


document.querySelector('.save').addEventListener('click', function(){
    let activeChats = [];
    let url;
    let sport = document.querySelector('.sport').value;
    if(sport == 'basketball'){
        url = 'https://betcityru.com/ru/line/bets?sp%5B%5D=3&ts=1';
    }
    else if(sport == 'volleyball'){
        url = 'https://betcityru.com/ru/line/bets?sp%5B%5D=12&ts=1';
    }
    else if(sport == 'tennis'){
        url = 'https://betcityru.com/ru/line/bets?sp%5B%5D=2&ts=1';
    }



    document.querySelectorAll('.active-chat').forEach(chat => {
        activeChats.push(chat.textContent);
    })
    let data = {
        name: document.querySelector('input[name="name"]').value,
        sport: sport,
        url: url,
        chats: activeChats,
        difference: [
            +document.querySelector('#difference-from').value, 
            +document.querySelector('#difference-to').value
        ],
        fora: [
            +document.querySelector('#fora-from').value, 
            +document.querySelector('#fora-to').value
        ],
        total: [
            +document.querySelector('#total-from').value, 
            +document.querySelector('#total-to').value
        ],
        status: document.querySelector('.status').value,
    }
    fetch('/saveFilter', {
        method: 'post',
        headers:{
            "Content-Type": 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(result => {
        window.location.reload();
    })
});

document.querySelectorAll('.delete').forEach(element => {
    element.addEventListener('click', function(){
        let name = this.parentElement.parentElement.querySelector('.filter-name').textContent;
        fetch('/deleteFilter', {
            method: 'post',
            headers: {
                "Content-Type": 'application/json'
            },
            body: JSON.stringify({
                name: name
            })
        })
        .then(result => {
            window.location.reload();
        })
    })
})


document.querySelectorAll('.activate').forEach(element => {
    element.addEventListener('click', function(){
        let name = this.parentElement.parentElement.querySelector('.filter-name').textContent;
        fetch('/activateFilter', {
            method: 'post',
            headers: {
                "Content-Type": 'application/json'
            },
            body: JSON.stringify({
                name: name
            })
        })
        .then(result => {
            window.location.reload();
        })
    })
});


document.querySelectorAll('.inactivate').forEach(element => {
    element.addEventListener('click', function(){
        let name = this.parentElement.parentElement.querySelector('.filter-name').textContent;
        fetch('/inactivateFilter', {
            method: 'post',
            headers: {
                "Content-Type": 'application/json'
            },
            body: JSON.stringify({
                name: name
            })
        })
        .then(result => {
            window.location.reload();
        })
    })
});

document.querySelectorAll('.edit').forEach(element => {
    element.addEventListener('click', function(){
        document.querySelector('.edition').style.display = 'flex';
        document.querySelector('.save').style.display = 'none';
        let name = this.parentElement.parentElement.querySelector('.filter-name').textContent;
        document.querySelector('.create-filter-popup').style.display = 'flex';
        fetch('/editFilter', {
            method: 'post',
            headers: {
                "Content-Type": 'application/json'
            },
            body: JSON.stringify({
                name: name
            })
        })
        .then(result => {
            return result.text()
        })
        .then(result => {
            result = JSON.parse(result);
            document.querySelector('input[name="name"]').value = result.name;
            document.querySelector('.sport').value = result.sport;
            let changeSport = result.sport;
            if(changeSport != 'none'){
                document.querySelector('.live-scrap-' + changeSport).style.display = 'block';
            }
            if(changeSport == 'basketball'){
                document.querySelector('.sport-setting').style.display = 'block';
            }
            else if(changeSport == 'volleyball'){
                document.querySelector('.sport-setting').style.display = 'block';
            }
            else if(changeSport == 'tennis'){
                document.querySelector('.sport-setting').style.display = 'block';
            }
            else if(changeSport == 'none'){
                document.querySelector('.sport-setting').style.display = 'none';
            }
            document.querySelector('#difference-from').value = result.difference[0];
            document.querySelector('#difference-to').value = result.difference[1];
            document.querySelector('#fora-from').value = result.fora[0]; 
            document.querySelector('#fora-to').value = result.fora[1];
            document.querySelector('#total-from').value = result.total[0]; 
            document.querySelector('#total-to').value = result.total[1]; 
            document.querySelector('.status').value = result.status;
            document.querySelectorAll('label').forEach(label => {
                result.chats.forEach(chat => {
                    if(label.textContent == chat){
                        label.classList.add('active-chat');
                        document.querySelector('#' + label.getAttribute('for')).checked = true;
                    }
                });
            })
        })
    });

});


document.querySelector('.edition').addEventListener('click', function(){
    let activeChats = [];
    document.querySelectorAll('.active-chat').forEach(chat => {
        activeChats.push(chat.textContent);
    })
    let data = {
        name: document.querySelector('input[name="name"]').value,
        sport: document.querySelector('.sport').value,
        chats: activeChats,
        difference: [
            +document.querySelector('#difference-from').value, 
            +document.querySelector('#difference-to').value
        ],
        fora: [
            +document.querySelector('#fora-from').value, 
            +document.querySelector('#fora-to').value
        ],
        total: [
            +document.querySelector('#total-from').value, 
            +document.querySelector('#total-to').value
        ],
        status: document.querySelector('.status').value,
    }
    fetch('/editionFilter', {
        method: 'post',
        headers:{
            "Content-Type": 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(result => {
        window.location.reload();
    })
});
