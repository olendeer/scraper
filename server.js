const express = require('express');
const cron = require('node-cron');
const puppeteer = require('puppeteer');
const date = require('date-and-time');
const mongoose = require('mongoose');
const TelegramBot = require('node-telegram-bot-api');


const PORT = process.env.PORT || 3000;
const TOKEN = '1178068165:AAHnNRDsp3s1tS9ViIw7DoRwBqFTmFUZVSY';

const app = express();
// const bot = new TelegramBot(TOKEN, {
// 	polling: true
// })

// bot.on('message', msg => {
// 	console.log(msg.text);
// 	if(msg.text == 'love'){
// 		bot.sendMessage(msg.chat.id, 'Зайка, я тебя люблю больше всего на свете!!!Твой любимый муж)')
// 		.then(res => console.log(res))
// 	}
// })

async function getProxy(){
	const browser = await puppeteer.launch({headless: false, args: ['--no-sandbox'], ignoreDefaultArgs: ['--disable-extensions']});
	const page = await browser.newPage();
	await page.goto('https://hidemy.name/ru/proxy-list/?maxtime=1500&type=h#list')
	.catch(error => {
		console.log('Error go to page')
		browser.close();
	})
	await page.waitForSelector('.services .table_block table tbody tr');
	let result = await page.evaluate(() => {
		let proxyList = [];
		document.querySelectorAll('.services .table_block table tbody tr').forEach(proxyLine => {
			let ip = proxyLine.querySelectorAll('td');
			proxyList.push({ip: ip[0].innerHTML, port: ip[1].innerHTML})
		})
		return proxyList;
	})
	browser.close();
	return result;
}

cron.schedule('*/1 * * * *', async () => {
	let proxys = await getProxy();
	console.log(proxys);
	// console.log('Start scraper line')
	// let countScraps = 0;
	// let filtersActive = await FilterItem.find({status: 'active'});
	// 	//Start scrape line
	// 	filtersActive.forEach(filter => {
	// 		scrapSportLine(filter.url, filter.sport)
	// 		.then(result => {
	// 			saveResultsLine(filter, result)
	// 		})
	// 	})
		
	// let startScrape = setInterval(() => {
	// 	console.log('Start scraper live events')
	// 	filtersActive.forEach(filter => {
	// 		EventLineItem.find({live: true, sport: filter.sport, fora: {$gte: filter.fora[0], $lte: filter.fora[1]}, total: {$gte: filter.total[0], $lte: filter.total[1]}, coefficient: {$gte: filter.difference[0], $lte: filter.difference[1]}})
	// 		.then(events => {
	// 				scrapSportLive(events, filter)
	// 				.then(result => {
	// 					// console.log(result)
	// 				})
	// 		})
	// 	})
	// 	countScraps ++;
	// 	if(countScraps == 5){
	// 		console.log('Cron reload');
	// 		clearInterval(startScrape)
	// 	}
	// }, 30000);
});





async function scrapSportLine(url, sport){
	const browser = await puppeteer.launch({headless: true, args: ['--no-sandbox'], ignoreDefaultArgs: ['--disable-extensions']});
	const page = await browser.newPage();
	// process.on('unhandledRejection', (reason, p) => {
	//     console.error('Unhandled Rejection at: Promise', p, 'reason:', reason);
	//     browser.close();
	//   });
	await page.goto(url)
	.catch(error => {
		console.log('Error go to page')
		browser.close();
	})
	await page.waitFor(5000);
	let result = await page.evaluate(() => {
		let findEvents = [];
		let events = document.querySelectorAll('app-line-event-unit');
		events.forEach(async event => {
			let players = [];
			let live;
			let findEvent = {
				time: 0,
				live: false,
				sendTelegramLive: false,
				messageId: '',
				leage: '-',
				url : 0,
				players:[],
				coefficient : 0,
				fora : 0,
				total: 0
			};
			//Поиск времени начала
			findEvent.time = event.querySelector('.line-event__time-static_large').innerHTML.trim();
			live = event.querySelector('.icon_live-text-grey');
			if(live != undefined){
				findEvent.live = true;
			}
			else{
				findEvent.live = false;
			}

			findEvent.leage = event.parentElement.querySelector('.line-champ__header-name a').innerHTML;
			findEvent.url = 'https://betcityru.com' + event.querySelector('.line-event__name').getAttribute('href').replace(/\?.*/g, '');
			findEvent.url = findEvent.url.replace(/line/g, 'live');
			//Поиск имён команд
			players = event.querySelectorAll('.line-event__name-teams b');
			players.forEach(player => {
				findEvent.players.push(player.innerHTML);
			})
			//Поиск форы
			let fora = event.querySelectorAll('.line-event__main-bets-button_left');
			findEvent.fora = +fora[0].innerHTML;
			if(findEvent.fora < 0){
				findEvent.fora = -findEvent.fora;
			}
			//Поиск Тотал
			if(fora[2].innerHTML == ''){
				findEvent.total = 0;
			}
			else{
				findEvent.total = +fora[2].textContent;
			}
			//Поиск коеффициента
			let coefficients = event.querySelectorAll('.line-event__main-bets-button_colored');
			if(coefficients.length > 0 ){
				
				findEvent.coefficient = +coefficients[0].innerHTML - +coefficients[1].innerHTML;
				if(findEvent.coefficient < 0){
					findEvent.coefficient = -findEvent.coefficient;
				}
				findEvent.coefficient = +findEvent.coefficient.toFixed(2);
			}
			//Добавление ивента в массив
			findEvents.push(findEvent);
		});
        return findEvents;

	});
	let thisTime = date.format(new Date(), 'HH:mm');
	result = result.filter(event => {
		event.time = countTime(thisTime, event.time)
		if(event.time < 30){
			event.sport = sport;
			return event;
		}
	})
	browser.close();
 	return result;
}

function countTime(thisTime, startEventTime){
	let thisTimeHours;
	let thisTimeMinutes;
	let thisTimeSeconds;

	let startEventTimeHours;
	let startEventTimeMinutes;
	let startEventTimeSeconds;

	let resultCountTime;
	if(thisTime.split(':')[0] == '00'){
		thisTimeHours = 24;
	}
	else{
		thisTimeHours = +thisTime.split(':')[0];
	}
	if(thisTime.split(':')[1] == '00'){
		thisTimeMinutes = 60;
		thisTimeHours -= 1;
	}
	else{
		thisTimeMinutes = +thisTime.split(':')[1];
	}
	thisTimeSeconds = ((60 * 60) * thisTimeHours) + (60 * thisTimeMinutes);

	if(startEventTime.split(':')[0] == '00'){
		startEventTimeHours = 24;
	}
	else{
		startEventTimeHours = +startEventTime.split(':')[0];
	}
	if(startEventTime.split(':')[1] == '00'){
		startEventTimeMinutes = 60;
		startEventTimeHours -= 1;
	}
	else{
		startEventTimeMinutes = +startEventTime.split(':')[1];
	}
	startEventTimeSeconds = ((60 * 60) * startEventTimeHours) + (60 * startEventTimeMinutes);


	resultCountTime = (startEventTimeSeconds - thisTimeSeconds) / 60;



	return resultCountTime;
}


async function saveResultsLine(filter, result){
	let error = false;
	result.forEach(async event => {
		let findEventLine =  await EventLineItem.findOne({url: event.url});
		if(findEventLine == null){
			error = false;
			if(event.coefficient < filter.difference[0] || event.coefficient > filter.difference[1]){
				error = true;
			}
			else if(event.fora < filter.fora[0] || event.fora > filter.fora[1]){
				error = true;
			}
			else if(event.total < filter.total[0] || event.fora > filter.total[1]){
				error = true;
			}
			if(error == false){
				let newEventLine = new EventLineItem(event);
				await newEventLine.save();
				sendTelegramLine(filter, event);
			}
		}
		else{
		}	
	})
	return false;
}


function sendTelegramLine(filter, event){
	let html = `
		<strong>*${event.sport.toUpperCase()}*</strong>
		<strong>*${event.leage}*</strong>
		П1/П2 : ${event.coefficient}
		Фора  : ${event.fora}
		Тотал : ${event.total}

		Фильтр: ${filter.name}
	`;
	filter.chats.forEach(chat => {
		ChannelItem.findOne({name: chat})
		.then(chat => {
			bot.sendMessage('@' + chat.chatId, html,{
				parse_mode: 'HTML',
				reply_markup: {
					inline_keyboard:[
						[
							{
								text: 'Ссылка',
								url : event.url
							}
						]
					]
				}
			})
			.catch(error => {
				console.log('Chat not found');
			})
		})
	})
}


async function sendTelegramLive(event, filter){
	let html = `
		<strong>*${event.sport.toUpperCase()}*</strong>
		<strong>*${event.leage}*</strong>

		Счёт в текущей четверти : __:__
		Номер четверти: __
		Счёт по четвертям: __:__
		Текущий тотал: ____ (_коэффициент_)
		Общий средний тотал: ____ (_коэффициент_) 
		Текущая фора:  ____ (_коэффициент_) 
		Фолы текущей четверти: __:__
		Процент попадания общ: __:__
		Время четверти в минутах и секундах (формат - мм:сс)
		Осталось набрать(Тотал): ___
		Осталось набрать(Фора): ___

		Фильтр: ${filter.name}
	`;
	await filter.chats.forEach(chat => {
		ChannelItem.findOne({name: chat})
		.then(chat => {
			bot.sendMessage('@' + chat.chatId, html,{
				parse_mode: 'HTML',
				reply_markup: {
					inline_keyboard:[
						[
							{
								text: 'Ссылка',
								url : event.url
							}
						]
					]
				}
			})
			.then(message => {
				event.messageIds.push({
					chatId: message.from.username,
					messageId: message.message_id
				})
			})
			.catch(error => {
				console.log('Chat not found');
			})
		})
	})
	return event;
}



function sendReportTelegram(filter, event){
	let html = `
		<strong>Отчёт</strong>
		Вид спорта: ${event.sport}
		Название игры: -
		Лига:${event.leage}
		Фильтр: ${filter.name}

	`;
	filter.chats.forEach(chat => {
		ChannelItem.findOne({name: chat})
		.then(chat => {
			bot.sendMessage('@' + chat.chatId, html,{
				parse_mode: 'HTML',
				reply_markup: {
					inline_keyboard:[
						[
							{
								text: 'Ссылка',
								url : event.url
							}
						]
					]
				}
			})
			.catch(error => {
				console.log('Chat not found');
			})
		})
	})
}

function updateTelegramLive(event, message_id){

}

async function start(){
	try{
		app.listen(PORT, () => {
			console.log('Server has been started...');
		});
		// await mongoose.connect('mongodb+srv://olendeer:1029384756qazqwertyuiop@scraper-7vfov.mongodb.net/test?retryWrites=true&w=majority', {useNewUrlParser: true, useUnifiedTopology: true});
		// console.log('Set connetion to data base');

	}catch(e){
		console.log(e)
		console.log('Not connetion!')
	}
}

start(); 
app.set('view engine', 'ejs');
app.use(express.static('public'));



async function saveResultsLine(filter, result){
	let error = false;
	result.forEach(async event => {
		let findEventLine =  await EventLineItem.findOne({url: event.url});
		if(findEventLine == null){
			error = false;
			if(event.coefficient < filter.difference[0] || event.coefficient > filter.difference[1]){
				error = true;
			}
			else if(event.fora < filter.fora[0] || event.fora > filter.fora[1]){
				error = true;
			}
			else if(event.total < filter.total[0] || event.fora > filter.total[1]){
				error = true;
			}
			if(error == false){
				let newEventLine = new EventLineItem(event);
				await newEventLine.save();
				sendTelegramLine(filter, event);
			}
		}
		else{
		}	
	})
	return false;
}


async function scrapSportLive(events, filter){
	const browser = await puppeteer.launch({headless: false, args: ['--no-sandbox'], ignoreDefaultArgs: ['--disable-extensions']});
	let page = await browser.newPage();
	// process.on('unhandledRejection', (reason, p) => {
	//     console.error('Unhandled Rejection at: Promise', p, 'reason:', reason);
	//     browser.close();
	//   });
	let c = 0;
	console.log(events.length);
	for(event of events){
		await scrapSportLivePage(event, browser, page)
		.then((result) => {
			console.log(result.result.operation)
		})
	}

	// Promise.all(events).then(async results => {
	// 	for(result of results){
	// 		console.log(result.result.operation)
	// 		// if(result.result.operation == 'delete'){
	// 		// 	let finishEventItem = new FinishEventItem({
	// 		// 		filter: filter.name,
	// 		// 		sport: filter.sport,
	// 		// 		leage: result.event.leage,
	// 		// 		player1: result.event.players[0],
	// 		// 		player2: result.event.players[1],
	// 		// 		rate: 'none',
	// 		// 		result: result.result.score
	// 		// 	});
	// 		// 	// console.log(finishEventItem)
	// 		// 	await finishEventItem.save();
	// 		// 	sendReportTelegram(filter, result.event);
	// 		// 	await EventLineItem.deleteOne({url: result.event.url})
	// 		// }
	// 		// else if(result.result.operation == 'update'){
	// 		// 	console.log(result.result.points)
	// 		// }
	// 	}
	// 	// browser.close();
	// });
	// setTimeout(()=>{
	// 	console.log(events);
	// },4000)
	// console.log(events);
	// browser.close();

	// let result = await page.evaluate(() => {
	// 	let score;
	// 	let quart;
	// 	let findEventLive = {
	// 		operation: 'update',
	// 		score: '0',
	// 	}
	// 	score =	document.querySelector('.scoreboard-content__previous-score');
	// 	if(score != undefined){
	// 		quart = document.querySelector('.scoreboard-content__info').innerHTML.trim();
	// 		if(quart == 'Событие завершено'){
	// 			return {
	// 				operation: 'delete',
	// 				score: score.innerHTML
	// 			}
	// 		}
	// 		else{
	// 			//Поиск остальных данных
	// 			findEventLive.score = score.innerHTML;
	// 			return findEventLive;
	// 		}
	// 	}
	// 	else{
	// 		return false;
	// 	}
	// });



	// if(result.operation == 'delete'){
	// 	let finishEventItem = new FinishEventItem({
	// 		filter: filter.name,
	// 		sport: filter.sport,
	// 		leage: event.leage,
	// 		player1: event.players[0],
	// 		player2: event.players[1],
	// 		rate: 'none',
	// 		result: result.score
	// 	});
	// 	await finishEventItem.save();
	// 	await EventLineItem.deleteOne({url: event.url})
	// 	//Отправить отчёт в телегу по результатам игры
	// 	// sendReportTelegram(filter, result.finishEvent);

	// 	browser.close();
 	// 	return false;

	// }
	// else if(result.operation == 'update'){
	// 	console.log('update')
	// 	if(event.sendTelegramLive == false){
	// 		sendTelegramLive(event, filter)
	// 		.then(async event => {
	// 			event.sendTelegramLive = true;
	// 			console.log(event)
	// 			await EventLineItem.updateOne({url : event.url}, event)
	// 		})
	// 	}
	// 	else{
	// 		// updateTelegramLive(liveEvent.sendTelegramLive)
	// 	}
	// 	browser.close();
	// 		return false;
	// }
	// else{
	// 	browser.close();
 	// 	return result;
	// }

}


async function scrapSportLivePage(event, browser, page){
	let waitSelector;
	// if(event.sport == 'basketball'){
	// 	waitSelector = '.scoreboard-content__previous-score';
	// }
	// else if(event.sport == 'tennis'){
	// 	waitSelector = '.scoreboard-content';
	// }
	console.log(event.url)
	// c++;
	let respone = await page.goto(event.url, {timeout: 20000})
	.catch(error => {
		return false;
		// browser.close();
		// resolve('Error');
	})
	if(!respone){
		// browser.close();
		return {
			result : {
				operation : false
			}
		}
	}
	let wait = await page.waitForSelector('.line-event__container-dops', {timeout: 20000})
	.then(() => {
		return true;
	})
	.catch(() => {
		return false;
	})
	if(wait){
		let result = await page.evaluate(() => {
			let score =	document.querySelector('.scoreboard-content__previous-score');
			// return score;
			if(score != null){
				let quart = document.querySelector('.scoreboard-content__info').innerHTML.trim();
				if(quart == 'Событие завершено'){
					//если матч завершён
					return {
						operation: 'delete',
						score: score.innerHTML
					};
				}
				else{
					//если баскетбол активный


					//Поиск остальных данных
					score = score.innerHTML;
					return {
						operation: 'update',
						score: score.innerHTML,
						quart: quart
					}
				}
			}
			else if(score == null){
				//если активный теннис или волейбол
				let points = document.querySelectorAll('.scoreboard-content__cell');
				return {
					operation: 'update',
					points: points.length
				}
			}
			else{
				return {
					operation: false
				}
			}
		})
		return {
			event: event,
			result: result
		}
	}
	else{
		//если не начат матч
		return {
			result: {
				operation: 'Not starting'
			}
		}
	}
		// let result = await page.evaluate(() => {
		// 	let score =	document.querySelector('.scoreboard-content__previous-score');
		// 	if(score != undefined){
		// 		let quart = document.querySelector('.scoreboard-content__info').innerHTML.trim();
		// 		if(quart == 'Событие завершено'){
		// 			return quart;
		// 		}
		// 		else{
		// 			//Поиск остальных данных
		// 			score = score.innerHTML;
		// 			return score;
		// 		}
		// 	}
		// 	else{
		// 		return false;
		// 	}
		// 	return score.innerHTML;
		// })
		// // console.log(result)
		// await page.close();
		// return result;
	// }
	// else{
	// 	await page.close();
	// 	resolve('Redirect');
	// }
}






let Filter = mongoose.Schema({
	name: String,
	sport: String,
	url: String,
	chats: Array,
    difference: Array,
    fora: Array,
	total: Array,
	status: String
});

let EventLine = mongoose.Schema({
	time: Number,
	live : Boolean,
	sendTelegramLive: Boolean,
	messageIds: Array,
	url: String,
	sport: String,
	leage: String,
	players: Array,
	coefficient : Number,
	fora : Number,
	total: Number
})

let FinishEvent = mongoose.Schema({
	filter: String,
	sport: String,
	leage: String,
	player1: String,
	player2: String,
	rate: String,
	result: String
})

let Channel = mongoose.Schema({
	name: String,
	chatId: String,
	url: String
})

const EventLineItem = mongoose.model('EventLine', EventLine);
const FilterItem = mongoose.model('Filter', Filter);
const FinishEventItem = mongoose.model('FinishEvent', FinishEvent);
const ChannelItem = mongoose.model('Channel', Channel);

// async function qwe(){
// 	let filtersActive = await FilterItem.find({status: 'active'});
// 	let startScrape = setTimeout(() => {
// 			console.log('Start scraper live events')
// 			filtersActive.forEach(filter => {
// 				EventLineItem.find({live: true, sport: filter.sport, fora: {$gte: filter.fora[0], $lte: filter.fora[1]}, total: {$gte: filter.total[0], $lte: filter.total[1]}, coefficient: {$gte: filter.difference[0], $lte: filter.difference[1]}})
// 				.then(events => {
// 						scrapSportLive(events, filter)
// 						.then(result => {
// 							// console.log(result)
// 						})
// 				})
// 			})
// 		}, 1000);
// }

// qwe();



const jsonParser = express.json();
app.get('/', (request, response) => {
	console.log('head')
	response.render('admin');
});
app.get('/filters', async (request, response) => {
	console.log('filter')
	response.render('filters', {filters: await FilterItem.find(), channels: await ChannelItem.find()});
});
app.get('/channels', async (request, response) => {
	console.log('channels')
	response.render('channels', {channels: await ChannelItem.find()});
});
app.get('/games', async (request, response) => {
	console.log('games')
	response.render('games', {games: await FinishEventItem.find().limit(30)});
});

app.post('/saveFilter', jsonParser, async (request, response) => {
	if(request.body.difference[1] == 0){
		request.body.difference[1] = 10000;
	}
	if(request.body.total[1] == 0){
		request.body.total[1] = 10000;
	}
	if(request.body.fora[1] == 0){
		request.body.fora[1] = 10000;
	}
	if(request.body.sport == 'none'){
		request.body.status = 'inactive';
	}
	let filterItem = new FilterItem(request.body);
	await filterItem.save();
	response.status(200).end();
});


app.post('/saveChannel', jsonParser, async (request, response) => {
	console.log(request.body)
	let channelItem = new ChannelItem(request.body);
	await channelItem.save();
	response.status(200).end();
});

app.post('/deleteFilter', jsonParser, async (request, response) => {
	await FilterItem.deleteOne({name: request.body.name})
	response.status(200).end();
});
app.post('/deleteChannel', jsonParser, async (request, response) => {
	await ChannelItem.deleteOne({chatId: request.body.chatId})
	response.status(200).end();
});

app.post('/activateFilter', jsonParser, async (request, response) => {
	await FilterItem.updateOne({name : request.body.name}, {$set: {status : 'active'}})
	response.status(200).end();
});

app.post('/inactivateFilter', jsonParser, async (request, response) => {
	await FilterItem.updateOne({name : request.body.name}, {$set: {status : 'inactive'}})
	response.status(200).end();
});

app.post('/editFilter', jsonParser, async (request, response) => {
	FilterItem.findOne({name : request.body.name})
	.then(result => {
		response.json(result);
	})
});


app.post('/editionFilter', jsonParser, async (request, response) => {
	await FilterItem.updateOne({name : request.body.name}, request.body, {upsert: true})
	response.status(200).end();
});