document.querySelector('.filter-create').addEventListener('click', function(){
    document.querySelector('.create-filter-popup').style.display = 'flex';
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


document.querySelector('.save').addEventListener('click', function(){
    let data = {
        name: document.querySelector('input[name="name"]').value,
        sport: document.querySelector('.sport').value,
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