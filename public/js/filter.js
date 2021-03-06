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
    let data;
    if(sport == 'basketball'){
        url = 'https://betcityru.com/ru/line/bets?sp%5B%5D=3&ts=1';
        data = {
            name: document.querySelector('input[name="name"]').value,
            sport: sport,
            url: url,
            chats: activeChats,
            sex: document.querySelector('.gender').value,
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
            currentScore: [
                +document.querySelector('#score-from-bask').value, 
                +document.querySelector('#score-to-bask').value
            ],
            quart:[
                +document.querySelector('#number-quarters-from-bask').value, 
                +document.querySelector('#number-quarters-to-bask').value
            ],
            score: [
                +document.querySelector('#score-quarters-from-bask').value, 
                +document.querySelector('#score-quarters-to-bask').value
            ],
            currentTotal : [
                +document.querySelector('#current-total-from-bask').value, 
                +document.querySelector('#current-total-to-bask').value
            ],
            currentFora: [
                +document.querySelector('#current-fora-from-bask').value, 
                +document.querySelector('#current-fora-to-bask').value
            ],
            time: [
                document.querySelector('#time-quarters-from-bask').value, 
                document.querySelector('#time-quarters-to-bask').value
            ],
            totalRemains: [
                +document.querySelector('#remained-total-from-bask').value, 
                +document.querySelector('#remained-total-to-bask').value
            ],
            foraRemains: [
                +document.querySelector('#remained-fora-from-bask').value, 
                +document.querySelector('#remained-fora-to-bask').value
            ],
            foals: [
                +document.querySelector('#folls-from-bask').value, 
                +document.querySelector('#folls-to-bask').value
            ],
            hits: [
                +document.querySelector('#hits-from-bask').value, 
                +document.querySelector('#hits-to-bask').value
            ]
        }
    }
    else if(sport == 'volleyball'){
        url = 'https://betcityru.com/ru/line/bets?sp%5B%5D=12&ts=1';
        data = {
            name: document.querySelector('input[name="name"]').value,
            sport: sport,
            url: url,
            chats: activeChats,
            sex: document.querySelector('.gender').value,
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
            currentScore: [
                +document.querySelector('#score-from-vol').value, 
                +document.querySelector('#score-to-vol').value
            ],
            quart:[
                +document.querySelector('#number-quarters-from-vol').value, 
                +document.querySelector('#number-quarters-to-vol').value
            ],
            score: [
                +document.querySelector('#score-quarters-from-vol').value, 
                +document.querySelector('#score-quarters-to-vol').value
            ],
            currentTotal : [
                +document.querySelector('#current-total-from-vol').value, 
                +document.querySelector('#current-total-to-vol').value
            ],
            total: [
                +document.querySelector('#overall-total-from-vol').value, 
                +document.querySelector('#overall-total-to-vol').value
            ],
            supply: [
                document.querySelector('#supply-from-vol').value, 
                document.querySelector('#supply-to-vol').value
            ],
            supplyContract: [
                +document.querySelector('#contract-supply-from-vol').value, 
                +document.querySelector('#contract-supply-to-vol').value
            ],
            totalRemains: [
                +document.querySelector('#remained-total-from-vol').value, 
                +document.querySelector('#remained-total-to-vol').value
            ],
            foraRemains: [
                +document.querySelector('#remained-fora-from-vol').value, 
                +document.querySelector('#remained-fora-to-vol').value
            ],
        }
    }
    else if(sport == 'tennis'){
        url = 'https://betcityru.com/ru/line/bets?sp%5B%5D=2&ts=1';
        data = {
            name: document.querySelector('input[name="name"]').value,
            sport: sport,
            url: url,
            chats: activeChats,
            sex: document.querySelector('.gender').value,
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
            currentScore: [
                +document.querySelector('#score-from-ten').value, 
                +document.querySelector('#score-to-ten').value
            ],
            quart:[
                +document.querySelector('#number-quarters-from-ten').value, 
                +document.querySelector('#number-quarters-to-ten').value
            ],
            score: [
                +document.querySelector('#score-quarters-from-ten').value, 
                +document.querySelector('#score-quarters-to-ten').value
            ],
            currentTotal : [
                +document.querySelector('#current-total-from-ten').value, 
                +document.querySelector('#current-total-to-ten').value
            ],
            totalRemains: [
                +document.querySelector('#remained-from-ten').value, 
                +document.querySelector('#remained-to-ten').value
            ],
            ices: [
                document.querySelector('#ice-from-ten').value, 
                document.querySelector('#ice-to-ten').value
            ],
            errors: [
                +document.querySelector('#errors-from-ten').value, 
                +document.querySelector('#errors-to-ten').value
            ],
            percent: [
                +document.querySelector('#percent-from-ten').value, 
                +document.querySelector('#percent-to-ten').value
            ],
            breaks: [
                +document.querySelector('#break-from-ten').value, 
                +document.querySelector('#break-to-ten').value
            ]
        }
    }


    document.querySelectorAll('.active-chat').forEach(chat => {
        activeChats.push(chat.textContent);
    })
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
            document.querySelector('.gender').value = result.sex;
            let changeSport = result.sport;
            if(changeSport != 'none'){
                document.querySelector('.live-scrap-' + changeSport).style.display = 'block';
            }
            if(changeSport == 'basketball'){
                document.querySelector('.sport-setting').style.display = 'block';
                document.querySelector('#score-from-bask').value = result.currentScore[0];
                document.querySelector('#score-to-bask').value = result.currentScore[1];
                document.querySelector('#number-quarters-from-bask').value = result.quart[0];
                document.querySelector('#number-quarters-to-bask').value = result.quart[1];
                document.querySelector('#score-quarters-from-bask').value = result.score[0];
                document.querySelector('#score-quarters-to-bask').value = result.score[1];
                document.querySelector('#current-total-from-bask').value = result.currentTotal[0];
                document.querySelector('#current-total-to-bask').value = result.currentTotal[1];
                document.querySelector('#current-fora-from-bask').value = result.currentFora[0];
                document.querySelector('#current-fora-to-bask').value = result.currentFora[1];
                document.querySelector('#time-quarters-from-bask').value = result.time[0];
                document.querySelector('#time-quarters-to-bask').value = result.time[1];
                document.querySelector('#remained-total-from-bask').value = result.totalRemains[0];
                document.querySelector('#remained-total-to-bask').value = result.totalRemains[1];
                document.querySelector('#remained-fora-from-bask').value = result.foraRemains[0];
                document.querySelector('#remained-fora-to-bask').value = result.foraRemains[1];
                document.querySelector('#folls-from-bask').value = result.foals[0];
                document.querySelector('#folls-to-bask').value = result.foals[1];
                document.querySelector('#hits-from-bask').value = result.hits[0];
                document.querySelector('#hits-to-bask').value = result.hits[1];
            }
            else if(changeSport == 'volleyball'){
                document.querySelector('.sport-setting').style.display = 'block';
                document.querySelector('#score-from-bask').value = result.currentScore[0];
                document.querySelector('#score-to-bask').value = result.currentScore[1];
                document.querySelector('#number-quarters-from-bask').value = result.quart[0];
                document.querySelector('#number-quarters-to-bask').value = result.quart[1];
                document.querySelector('#score-quarters-from-bask').value = result.score[0];
                document.querySelector('#score-quarters-to-bask').value = result.score[1];
                document.querySelector('#current-total-from-bask').value = result.currentTotal[0];
                document.querySelector('#current-total-to-bask').value = result.currentTotal[1];
                document.querySelector('#remained-total-from-bask').value = result.totalRemains[0];
                document.querySelector('#remained-total-to-bask').value = result.totalRemains[1];
                document.querySelector('#remained-fora-from-bask').value = result.foraRemains[0];
                document.querySelector('#remained-fora-to-bask').value = result.foraRemains[1];
                document.querySelector('#overall-total-from-vol').value = result.total[0];
                document.querySelector('#overall-total-to-vol').value = result.total[1];
                document.querySelector('#supply-from-vol').value = result.supply[0];
                document.querySelector('#supply-to-vol').value = result.supply[1];
                document.querySelector('#contract-supply-from-vol').value = result.supplyContract[0];
                document.querySelector('#contract-supply-to-vol').value = result.supplyContract[1];
            }
            else if(changeSport == 'tennis'){
                document.querySelector('.sport-setting').style.display = 'block';
                document.querySelector('#score-from-bask').value = result.currentScore[0];
                document.querySelector('#score-to-bask').value = result.currentScore[1];
                document.querySelector('#number-quarters-from-bask').value = result.quart[0];
                document.querySelector('#number-quarters-to-bask').value = result.quart[1];
                document.querySelector('#score-quarters-from-bask').value = result.score[0];
                document.querySelector('#score-quarters-to-bask').value = result.score[1];
                document.querySelector('#current-total-from-bask').value = result.currentTotal[0];
                document.querySelector('#current-total-to-bask').value = result.currentTotal[1];
                document.querySelector('#remained-total-from-bask').value = result.totalRemains[0];
                document.querySelector('#remained-total-to-bask').value = result.totalRemains[1];
                document.querySelector('#ice-from-ten').value = result.ices[0];
                document.querySelector('#ice-to-ten').value = result.ices[1];
                document.querySelector('#errors-from-ten').value = result.errors[0];
                document.querySelector('#errors-to-ten').value = result.errors[1];
                document.querySelector('#percent-from-ten').value = result.percent[0];
                document.querySelector('#percent-to-ten').value = result.percent[1];
                document.querySelector('#break-from-ten').value = result.breaks[0]; 
                document.querySelector('#break-to-ten').value = result.breaks[1];
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
    let url;
    let sport = document.querySelector('.sport').value;
    let data;
    if(sport == 'basketball'){
        url = 'https://betcityru.com/ru/line/bets?sp%5B%5D=3&ts=1';
        data = {
            name: document.querySelector('input[name="name"]').value,
            sport: sport,
            url: url,
            chats: activeChats,
            sex: document.querySelector('.gender').value,
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
            currentScore: [
                +document.querySelector('#score-from-bask').value, 
                +document.querySelector('#score-to-bask').value
            ],
            quart:[
                +document.querySelector('#number-quarters-from-bask').value, 
                +document.querySelector('#number-quarters-to-bask').value
            ],
            score: [
                +document.querySelector('#score-quarters-from-bask').value, 
                +document.querySelector('#score-quarters-to-bask').value
            ],
            currentTotal : [
                +document.querySelector('#current-total-from-bask').value, 
                +document.querySelector('#current-total-to-bask').value
            ],
            currentFora: [
                +document.querySelector('#current-fora-from-bask').value, 
                +document.querySelector('#current-fora-to-bask').value
            ],
            time: [
                document.querySelector('#time-quarters-from-bask').value, 
                document.querySelector('#time-quarters-to-bask').value
            ],
            totalRemains: [
                +document.querySelector('#remained-total-from-bask').value, 
                +document.querySelector('#remained-total-to-bask').value
            ],
            foraRemains: [
                +document.querySelector('#remained-fora-from-bask').value, 
                +document.querySelector('#remained-fora-to-bask').value
            ],
            foals: [
                +document.querySelector('#folls-from-bask').value, 
                +document.querySelector('#folls-to-bask').value
            ],
            hits: [
                +document.querySelector('#hits-from-bask').value, 
                +document.querySelector('#hits-to-bask').value
            ]
        }
    }
    else if(sport == 'volleyball'){
        url = 'https://betcityru.com/ru/line/bets?sp%5B%5D=12&ts=1';
        data = {
            name: document.querySelector('input[name="name"]').value,
            sport: sport,
            url: url,
            chats: activeChats,
            sex: document.querySelector('.gender').value,
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
            currentScore: [
                +document.querySelector('#score-from-vol').value, 
                +document.querySelector('#score-to-vol').value
            ],
            quart:[
                +document.querySelector('#number-quarters-from-vol').value, 
                +document.querySelector('#number-quarters-to-vol').value
            ],
            score: [
                +document.querySelector('#score-quarters-from-vol').value, 
                +document.querySelector('#score-quarters-to-vol').value
            ],
            currentTotal : [
                +document.querySelector('#current-total-from-vol').value, 
                +document.querySelector('#current-total-to-vol').value
            ],
            total: [
                +document.querySelector('#overall-total-from-vol').value, 
                +document.querySelector('#overall-total-to-vol').value
            ],
            supply: [
                document.querySelector('#supply-from-vol').value, 
                document.querySelector('#supply-to-vol').value
            ],
            supplyContract: [
                +document.querySelector('#contract-supply-from-vol').value, 
                +document.querySelector('#contract-supply-to-vol').value
            ],
            totalRemains: [
                +document.querySelector('#remained-total-from-vol').value, 
                +document.querySelector('#remained-total-to-vol').value
            ],
            foraRemains: [
                +document.querySelector('#remained-fora-from-vol').value, 
                +document.querySelector('#remained-fora-to-vol').value
            ],
        }
    }
    else if(sport == 'tennis'){
        url = 'https://betcityru.com/ru/line/bets?sp%5B%5D=2&ts=1';
        data = {
            name: document.querySelector('input[name="name"]').value,
            sport: sport,
            url: url,
            chats: activeChats,
            sex: document.querySelector('.gender').value,
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
            currentScore: [
                +document.querySelector('#score-from-ten').value, 
                +document.querySelector('#score-to-ten').value
            ],
            quart:[
                +document.querySelector('#number-quarters-from-ten').value, 
                +document.querySelector('#number-quarters-to-ten').value
            ],
            score: [
                +document.querySelector('#score-quarters-from-ten').value, 
                +document.querySelector('#score-quarters-to-ten').value
            ],
            currentTotal : [
                +document.querySelector('#current-total-from-ten').value, 
                +document.querySelector('#current-total-to-ten').value
            ],
            totalRemains: [
                +document.querySelector('#remained-from-ten').value, 
                +document.querySelector('#remained-to-ten').value
            ],
            ices: [
                document.querySelector('#ice-from-ten').value, 
                document.querySelector('#ice-to-ten').value
            ],
            errors: [
                +document.querySelector('#errors-from-ten').value, 
                +document.querySelector('#errors-to-ten').value
            ],
            percent: [
                +document.querySelector('#percent-from-ten').value, 
                +document.querySelector('#percent-to-ten').value
            ],
            breaks: [
                +document.querySelector('#break-from-ten').value, 
                +document.querySelector('#break-to-ten').value
            ]
        }
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
