document.querySelector('.filter-create').addEventListener('click', function(){
    document.querySelector('.create-filter-popup').style.display = 'flex';
});
document.querySelectorAll('.close-popup-btn').forEach(elem => {
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
})