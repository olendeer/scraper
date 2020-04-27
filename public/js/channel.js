document.querySelector('.channel-create').addEventListener('click', function(){
	document.querySelector('.create-channel-popup').style.display = 'flex';
});


document.querySelectorAll('.close-popup-btn, .save').forEach(elem => {
    elem.addEventListener('click', function(){
        document.querySelector('.create-channel-popup').style.display = 'none';
    });
})




document.querySelector('.save-channel').addEventListener('click', function(){
    let data = {
        name: document.querySelector('input[name="name"]').value,
        chatId: document.querySelector('input[name="id"]').value,
        url: document.querySelector('input[name="url"]').value,
    }
    fetch('/saveChannel', {
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
        let chatId = this.parentElement.parentElement.querySelector('.chatId').textContent;
        fetch('/deleteChannel', {
            method: 'post',
            headers: {
                "Content-Type": 'application/json'
            },
            body: JSON.stringify({
                chatId: chatId
            })
        })
        .then(result => {
            window.location.reload();
        })
    })
})

