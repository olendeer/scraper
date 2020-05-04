const express = require('express');
const cron = require('node-cron');
const puppeteer = require('puppeteer');
const date = require('date-and-time');
const mongoose = require('mongoose');
const TelegramBot = require('node-telegram-bot-api');


const PORT = process.env.PORT || 3000;
const TOKEN = '1178068165:AAHnNRDsp3s1tS9ViIw7DoRwBqFTmFUZVSY';

const app = express();
const bot = new TelegramBot(TOKEN, {
	polling: true
})


// async function getProxy(){
// 	const browser = await puppeteer.launch({headless: false, args: ['--no-sandbox'], ignoreDefaultArgs: ['--disable-extensions']});
// 	const page = await browser.newPage();
// 	await page.goto('https://hidemy.name/ru/proxy-list/?maxtime=1500&type=h#list')
// 	.catch(error => {
// 		console.log('Error go to page')
// 		browser.close();
// 	})
// 	await page.waitForSelector('.services .table_block table tbody tr');
	// let result = await page.evaluate(() => {
	// 	let proxyList = [];
	// 	document.querySelectorAll('.services .table_block table tbody tr').forEach(proxyLine => {
	// 		let ip = proxyLine.querySelectorAll('td');
	// 		proxyList.push({ip: ip[0].innerHTML, port: ip[1].innerHTML})
	// 	})
	// 	return proxyList;
	// })
// 	console.log(result)
// 	browser.close();
// 	return result;
// }
// let activeProxy = 0;




// function newProxy(proxys){
// 	activeProxy++;
// 	return proxys[activeProxy];
// }

String.prototype.hex2bin = function()
{ 
   var i = 0, len = this.length, result = "";

   //Converting the hex string into an escaped string, so if the hex string is "a2b320", it will become "%a2%b3%20"
   for(; i < len; i+=2)
      result += '%' + this.substr(i, 2);      

   return unescape(result);
}

cron.schedule('*/1 * * * *', async () => {
	// let proxys = await getProxy();
	// console.log(proxys)
	console.log('Start scraper line')
	// let countScraps = 0;
	let filtersActive = await FilterItem.find({status: 'active'});
	// 	//Start scrape line
		filtersActive.forEach(filter => {
			scrapSportLine(filter.url, filter.sport)
			.then(result => {
				// console.log(result)
				saveResultsLine(filter, result)
			})
		})
		
	let startScrape = setTimeout(() => {
		// console.log('Start scraper live events')
		filtersActive.forEach(filter => {
			EventLineItem.find({live: true, sport: filter.sport, fora: {$gte: filter.fora[0], $lte: filter.fora[1]}, total: {$gte: filter.total[0], $lte: filter.total[1]}, coefficient: {$gte: filter.difference[0], $lte: filter.difference[1]}})
			.then(events => {
					scrapSportLive(events, filter)
					.then(result => {
						// console.log(result)
					})
			})
		})
		// countScraps ++;
		// if(countScraps == 5){
		// 	console.log('Cron reload');
		// 	clearInterval(startScrape)
		// }
	}, 15000);
});





async function scrapSportLine(url, sport, proxys){
	// let proxy = newProxy(proxys);
	const browser = await puppeteer.launch({headless: false, args: ['--no-sandbox'], ignoreDefaultArgs: ['--disable-extensions']});
	const page = await browser.newPage();
	process.on('unhandledRejection', (reason, p) => {
	    // console.error('Unhandled Rejection at: Promise', p, 'reason:', reason);
	    browser.close();
	  });
	await page.goto(url)
	.catch(error => {
		console.log(error);
		console.log('Error go to page')
		// scrapSportLine(url, sport, proxys)
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
				bet: '',
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
			event.bet = '#bet' + event.url.match(/[0-9]+\/[0-9]+/).join('0').replace('/', '');
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
	})
	return false;
}


function sendTelegramLine(filter, event){
	let html = `
		${event.bet}

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


async function sendTelegramLive(event, filter, data){
	let html;
	if(event.sport == 'basketball'){
		if(data.stopRate){
			html = `
				${event.bet}

				<strong>*${event.sport.toUpperCase()}*</strong>
				<strong>*${event.leage}*</strong>

				Номер четверти: ${data.quart}
				Счёт: ${data.score}

				Приём ставок временно остановлен
			`;
		}else{
			html = `
				${event.bet}

				<strong>*${event.sport.toUpperCase()}*</strong>
				<strong>*${event.leage}*</strong>

				Счёт в текущей четверти : ${data.scoreCurrent}
				Номер четверти: ${data.quart}
				Счёт по четвертям: ${data.score}
				Текущий тотал: ${data.currentTotal}
				Текущая фора:  ${data.currentFora}
				Фолы текущей четверти: ${data.foals}
				Процент попадания общ: ${data.hit}
				Время четверти в минутах и секундах: ${data.time}
				Осталось набрать(Тотал): ${data.totalRemains}
				Осталось набрать(Фора): ${data.foraRemains}

				Фильтр: ${filter.name}
			`;
		}
	}
	else if(event.sport == 'volleyball'){
		if(data.stopRate){
			html = `
				${event.bet}

				<strong>*${event.sport.toUpperCase()}*</strong>
				<strong>*${event.leage}*</strong>

				Номер четверти: ${data.quart}
				Счёт: ${data.points}

				Приём ставок временно остановлен
			`;
		}else{
			html = `
				${event.bet}

				<strong>*${event.sport.toUpperCase()}*</strong>
				<strong>*${event.leage}*</strong>

				Счёт текущего сета : ${data.pointsCurrent}
				Cет: ${data.quart}
				Счёт по сетам: ${data.points}
				Текущий тотал: ${data.total}
				Текущая фора:  ${data.currentFora}
				На свои подачах: __:__
				Подряд на своих: __:__
				Осталось набрать(Тотал): ${data.totalRemains}
				Осталось набрать(Фора): ${data.foraRemains}

				Фильтр: ${filter.name}
			`;
		}
	}
	else if(event.sport == 'tennis'){
		if(data.stopRate){
			html = `
				${event.bet}

				<strong>*${event.sport.toUpperCase()}*</strong>
				<strong>*${event.leage}*</strong>

				Номер четверти: ${data.quart}
				Счёт: ${data.points}

				Приём ставок временно остановлен
			`;
		}else{
			html = `
				${event.bet}

				<strong>*${event.sport.toUpperCase()}*</strong>
				<strong>*${event.leage}*</strong>

				Счёт текущего сета : ${data.pointsCurrent}
				Счёт по сетам: ${data.points}
				Текущий тотал: ${data.total}
				Текущая фора:  ${data.currentFora}
				Эйсы: ${data.ices}
				Двойные ошибки: ${data.errorTwo}
				% выигранных очков на первой подаче: __:__
				Реализация брейкпоинтов: ${data.breaks}
				Осталось набрать(Тотал): ${data.totalRemains}
				Осталось набрать(Фора): ${data.foraRemains}

				Фильтр: ${filter.name}
			`;
		}
	}
	for(chat of filter.chats){
		let messageIds = await ChannelItem.findOne({name: chat})
		.then(async chat => {
			return await bot.sendMessage('@' + chat.chatId, html,{
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
				return {
					chatId: message.chat.id,
					messageId: message.message_id
				}
			})
			.catch(async error => {
				// console.log('Error send');
				return await bot.sendMessage('@' + chat.chatId, html,{
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
					return {
						chatId: message.chat.id,
						messageId: message.message_id
					}
				})
			})
		})
		event.messageIds.push(messageIds);
	}
	return event;
}



function sendReportTelegram(filter, event){
	let html = `
		${event.bet}

		<strong>Отчёт</strong>
		Вид спорта: ${event.sport}
		Название игры: -
		Лига:${event.leage}
		Фильтр: ${filter.name}

		Четверть: __
		Ставка: __
		Результат: __
		Коэффициент: __
		Состояние: __
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
async function updateTelegramLive(event, filter, data){
	console.log('update')
	let html;
	if(event.sport == 'basketball'){
		if(data.stopRate){
			html = `
				${event.bet}

				<strong>*${event.sport.toUpperCase()}*</strong>
				<strong>*${event.leage}*</strong>

				Номер четверти: ${data.quart}
				Счёт: ${data.score}

				Приём ставок временно остановлен
			`;
		}else{
			html = `
				${event.bet}

				<strong>*${event.sport.toUpperCase()}*</strong>
				<strong>*${event.leage}*</strong>

				Счёт в текущей четверти : ${data.scoreCurrent}
				Номер четверти: ${data.quart}
				Счёт по четвертям: ${data.score}
				Текущий тотал: ${data.currentTotal}
				Текущая фора:  ${data.currentFora}
				Фолы текущей четверти: ${data.foals}
				Процент попадания общ: ${data.hit}
				Время четверти в минутах и секундах: ${data.time}
				Осталось набрать(Тотал): ${data.totalRemains}
				Осталось набрать(Фора): ${data.foraRemains}

				Фильтр: ${filter.name}
			`;
		}
	}
	else if(event.sport == 'volleyball'){
		if(data.stopRate){
			html = `
				${event.bet}

				<strong>*${event.sport.toUpperCase()}*</strong>
				<strong>*${event.leage}*</strong>

				Номер четверти: ${data.quart}
				Счёт: ${data.points}

				Приём ставок временно остановлен
			`;
		}else{
			html = `
				${event.bet}

				<strong>*${event.sport.toUpperCase()}*</strong>
				<strong>*${event.leage}*</strong>

				Счёт текущего сета : ${data.pointsCurrent}
				Cет: ${data.quart}
				Счёт по сетам: ${data.points}
				Текущий тотал: ${data.total}
				Текущая фора:  ${data.currentFora}
				На свои подачах: __:__
				Подряд на своих: __:__
				Осталось набрать(Тотал): ${data.totalRemains}
				Осталось набрать(Фора): ${data.foraRemains}

				Фильтр: ${filter.name}
			`;
		}
	}
	else if(event.sport == 'tennis'){
		if(data.stopRate){
			html = `
				${event.bet}

				<strong>*${event.sport.toUpperCase()}*</strong>
				<strong>*${event.leage}*</strong>

				Номер четверти: ${data.quart}
				Счёт: ${data.points}

				Приём ставок временно остановлен
			`;
		}else{
			html = `
				${event.bet}

				<strong>*${event.sport.toUpperCase()}*</strong>
				<strong>*${event.leage}*</strong>

				Счёт текущего сета : ${data.pointsCurrent}
				Счёт по сетам: ${data.points}
				Текущий тотал: ${data.total}
				Текущая фора:  ${data.currentFora}
				Эйсы: ${data.ices}
				Двойные ошибки: ${data.errorTwo}
				% выигранных очков на первой подаче: __:__
				Реализация брейкпоинтов: ${data.breaks}
				Осталось набрать(Тотал): ${data.totalRemains}
				Осталось набрать(Фора): ${data.foraRemains}

				Фильтр: ${filter.name}
			`;
		}
	}
	// console.log(event.messageIds
	for(message of event.messageIds){
		if(message == null){
			return false;
		}
		await bot.editMessageText(html, {
			chat_id: message.chatId,
			message_id: message.messageId,
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
		.then(() => false)
		.catch(async error => {
			return await bot.editMessageText(html, {
				chat_id: message.chatId,
				message_id: message.messageId,
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
			.then(() => false)
			.catch(error => {
				return false;
			})
		})
	}
}
// bot.editMessageText('update', {
// 	chat_id: 'olendeerTest',
// 	message_id: 430
// })
async function start(){
	try{
		app.listen(PORT, () => {
			console.log('Server has been started...');
		});
		await mongoose.connect('mongodb+srv://olendeer:1029384756qazqwertyuiop@scraper-7vfov.mongodb.net/test?retryWrites=true&w=majority', {useNewUrlParser: true, useUnifiedTopology: true});
		console.log('Set connetion to data base');

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
	process.on('unhandledRejection', (reason, p) => {
	    // console.error('Unhandled Rejection at: Promise', p, 'reason:', reason);
	    browser.close();
	  });
	let c = 0;
	console.log(events.length);
	for(event of events){
		await scrapSportLivePage(event, browser, page)
		.then( async result => {
			// console.log(result.result.operation)
			if(result.result.operation == 'delete'){
				let finishEventItem = new FinishEventItem({
					filter: filter.name,
					sport: filter.sport,
					leage: result.event.leage,
					player1: result.event.players[0],
					player2: result.event.players[1],
					rate: 'none',
					result: result.result.data.score
				});
				await finishEventItem.save();
				sendReportTelegram(filter, result.event);
				await EventLineItem.deleteOne({url: result.event.url})
			}
			else if(result.result.operation == 'update' || result.result.operation == 'update-stop'){
				if(result.event.sendTelegramLive == false){
					result.event.sendTelegramLive = true;
					event = await sendTelegramLive(result.event, filter, result.result.data);
					await EventLineItem.updateOne({url: event.url}, event)
				}
				else{
					await updateTelegramLive(result.event, filter, result.result.data)
				}
			}
		})
	}
	browser.close();

}

async function scrapSportLivePage(event, browser, page){
	let waitSelector;
	let wait;
	// else if(event.sport == 'tennis'){
	// 	waitSelector = '.scoreboard-content';
	// }
	console.log(event.url)
	let response = await page.goto(event.url, {timeout: 20000})
	.catch(error => {
		return false;
		// browser.close();
		// resolve('Error');
	})
	if(!response){
		// browser.close();
		return {
			result : {
				operation : 'Redirect'
			}
		}
	}
	let chain = response.request().redirectChain();
	if(chain.length > 0){
		response = false;
	}
	if(!response){
		// browser.close();
		return {
			result : {
				operation : 'Redirect'
			}
		}
	}
	wait = await page.waitForSelector('.scoreboard-container', {timeout: 5000})
	.then(() => {
		return true;
	})
	.catch(() => {
		return false;
	})
	if(wait){
		let result = await page.evaluate(() => {
			let score =	document.querySelector('.scoreboard-content__previous-score');

			if(score != null){
				let quart = document.querySelector('.scoreboard-content__info').innerHTML.trim();
				if(quart == 'Событие завершено'){
					//если матч завершён
					return {
						operation: 'delete',
						data: {
							score: score.innerHTML
						}
					};
				}
				else{
					//если баскетбол активный
					let stopRate = document.querySelector('.esm');
					if(stopRate != null){

						score = score.innerHTML.replace(/\).*/, '').replace(/.*\(/, '');
						quart = document.querySelector('.scoreboard-content__info b').innerHTML;
						quart = +quart.match(/\d/)[0];
						return {
							operation: 'update-stop',
							data: {
								score: score,
								quart: quart,
								stopRate: true
							}
						}
					}
					else{
						let scoreCurrent = score.innerHTML.replace(/\).*/, '').replace(/.*\(/, '').split(', ');
						scoreCurrent = scoreCurrent[scoreCurrent.length - 1];
						quart = document.querySelector('.scoreboard-content__info b').innerHTML;
						quart = +quart.match(/\d/)[0];
						score = score.innerHTML.replace(/\).*/, '').replace(/.*\(/, '');
						let currentTotal = document.querySelector('.scoreboard-content__main-score').innerHTML.split(':');
						currentTotal = +currentTotal[0] + +currentTotal[1] + 0.5;
						let currentFora = 0;
						let tempFora;
						let totalRemainsAll;
						let totalRemains = [];
						let totalRemainsVal = 0;
						let tempTotalRemains;
						document.querySelectorAll('.dops-item').forEach(elem => {
							if(elem.querySelector('.dops-item__title > span').innerHTML == 'Фора'){
								let currentForaAll = elem.querySelectorAll('.dops-item-row__block-left');
								// currentFora = currentFora[0].innerHTML
								currentForaAll.forEach(elem => {
									tempFora = +elem.innerHTML.replace(/\).*/, '').replace(/.*\(/, '');
									if(tempFora < 0){
										tempFora = -tempFora;
									}
									currentFora += tempFora;
								});
								currentFora = currentFora/currentForaAll.length
							}
							else if(elem.querySelector('.dops-item__title > span').innerHTML == 'Тотал'){
								totalRemainsAll = elem.querySelectorAll('.dops-item-row__block-content');
								totalRemainsAll.forEach(elem => {
									tempTotalRemains = elem.innerHTML.replace(/ /, '').match(/span/);
									if(tempTotalRemains == null){
										totalRemains.push(+elem.innerHTML.replace(/ /, ''));
									}
								});
								totalRemains.forEach(elem => {
									totalRemainsVal += elem;
								});
								totalRemainsVal = totalRemainsVal/totalRemains.length - currentTotal;
							}
						})
						let hits = document.querySelector('.scoreboard-content__main-score').innerHTML.split(':');
						let foraRemains = currentFora - (Math.max(+hits[0], +hits[1]) - Math.min(+hits[0], +hits[1]));
						let foalsCommand = document.querySelectorAll('.scoreboard-content__foals');
						let foals = [];
						if(foalsCommand != null){
							foalsCommand.forEach(elem => {
								foals.push(elem.querySelectorAll('.scoreboard-content__foals-item_active').length);
							})
						}
						foals = foals.join(':');
						let time = document.querySelector('.scoreboard-content__info span');
						if(time != null){
							time = time.innerHTML
						}
						else{
							time = 'На начата'
						}
						return {
							operation: 'update',
							data: {
								scoreCurrent: scoreCurrent,
								quart: quart,
								score: score,
								currentTotal: currentTotal,
								currentFora: currentFora,
								foals: foals,
								hit: 0,
								time: time,
								totalRemains: totalRemainsVal,
								foraRemains: foraRemains,
								stopRate: false
							}
						}
					}
				}
			}
			else if(score == null){
				let quart = document.querySelector('.scoreboard-content__info').innerHTML.trim();
				if(quart == 'Событие завершено'){
					//если матч завершён
					return {
						operation: 'delete',
						data: {
							score: 'Результат не указан'
						}
					};
				}
				//Если активный теннис или волейбол
				if(document.querySelector('.scoreboard-header__champ-name span').innerHTML == 'Волейбол'){
					let quart = document.querySelector('.scoreboard-content__info b').innerHTML;
					quart = +quart.match(/\d/)[0];
					let stopRate = document.querySelector('.esm');
					let pointsCurrentAll = document.querySelectorAll('.scoreboard-content__cell div');
					let pointsCurrentTemp = [];
					pointsCurrentAll.forEach(elem => {
						if(elem.innerHTML != ''){
							pointsCurrentTemp.push(+elem.innerHTML);
						}
					})
					let pointsCurrent = pointsCurrentTemp[quart] + ':' + pointsCurrentTemp[quart * 2 + 1];
					// pointsCurrent = pointsCurrentTemp.length;
					let points = pointsCurrentAll[0].innerHTML + ':' + pointsCurrentAll[6].innerHTML;
					if(stopRate != null){
						return {
							operation: 'update-stop',
							data: {
								pointsCurrent: pointsCurrent,
								quart: quart,
								points: points,
								stopRate: true
							}
						}
					}
					else{
						let totalSet = pointsCurrentTemp[quart] + pointsCurrentTemp[quart * 2 + 1] + 0.5;
						let total = 0;
						for(let i = 0; i < pointsCurrentAll.length; i++){
							if(i != 0 && i != 6){
								total += +pointsCurrentAll[i].innerHTML;
							}
						}
						total += 0.5;
						let currentFora = 0;
						let tempFora;
						let totalRemainsAll;
						let totalRemains = [];
						let totalRemainsVal = 0;
						let tempTotalRemains;
						document.querySelectorAll('.dops-item').forEach(elem => {
							if(elem.querySelector('.dops-item__title > span').innerHTML == 'Фора'){
								let currentForaAll = elem.querySelectorAll('.dops-item-row__block-left');
								currentForaAll.forEach(elem => {
									tempFora = +elem.innerHTML.replace(/\).*/, '').replace(/.*\(/, '');
									if(tempFora < 0){
										tempFora = -tempFora;
									}
									currentFora += tempFora;
								});
								currentFora = currentFora/currentForaAll.length
							}
							else if(elem.querySelector('.dops-item__title > span').innerHTML == 'Тотал'){
								totalRemainsAll = elem.querySelectorAll('.dops-item-row__block-content');
								totalRemainsAll.forEach(elem => {
									tempTotalRemains = elem.innerHTML.replace(/ /, '').match(/span/);
									if(tempTotalRemains == null){
										totalRemains.push(+elem.innerHTML.replace(/ /, ''));
									}
								});
								totalRemains.forEach(elem => {
									totalRemainsVal += elem;
								});
								totalRemainsVal = totalRemainsVal/totalRemains.length - total;
							}
						})
						let foraRemains = currentFora - (Math.max(pointsCurrentTemp[quart], pointsCurrentTemp[quart * 2 + 1]) - Math.min(pointsCurrentTemp[quart], pointsCurrentTemp[quart * 2 + 1]));
						return {
							operation: 'update',
							data: {
								pointsCurrent: pointsCurrent,
								quart: quart,
								points: points,
								totalSet: totalSet,
								total: total,
								currentFora: currentFora,
								totalRemains: totalRemainsVal,
								foraRemains: foraRemains,
								stopRate: false
							}
						}
					}
				}
				else if(document.querySelector('.scoreboard-header__champ-name span').innerHTML == 'Теннис'){
					let quart = document.querySelector('.scoreboard-content__info b');
					let pointsCurrent;
					let points;
					let pointsCurrentAll;
					let pointsCurrentTemp;
					if(quart != null){
						quart = quart.innerHTML
						quart = +quart.match(/\d/)[0];
						pointsCurrentAll = document.querySelectorAll('.scoreboard-content__cell div');
						pointsCurrentTemp = [];
						pointsCurrentAll.forEach(elem => {
							if(elem.innerHTML != ''){
								pointsCurrentTemp.push(+elem.innerHTML);
							}
						})
						pointsCurrent = pointsCurrentTemp[quart + 1] + ':' + pointsCurrentTemp[(quart + 1) * 2 + 1];
						points = pointsCurrentAll[0].innerHTML + ':' + pointsCurrentAll[5].innerHTML;
					}
					else{
						quart = 'Нет информации'
						pointsCurrent = 'Нет информации'
						points = 'Нет информации'
					}
					let stopRate = document.querySelector('.esm');
					if(stopRate != null){
						return {
							operation: 'update-stop',
							data: {
								pointsCurrent: pointsCurrent,
								quart: quart,
								points: points,
								stopRate: true
							}
						}
					}
					else{
						let total = 0;
						for(let i = 0; i < pointsCurrentAll.length; i++){
							if(i != 0 && i != 6 && i != 1 && i != 5){
								total += +pointsCurrentAll[i].innerHTML;
							}
						}
						total += 0.5;
						let currentFora = 0;
						let tempFora;
						let totalRemainsAll;
						let totalRemains = [];
						let totalRemainsVal = 0;
						let tempTotalRemains;
						document.querySelectorAll('.dops-item').forEach(elem => {
							if(elem.querySelector('.dops-item__title > span').innerHTML == 'Фора'){
								let currentForaAll = elem.querySelectorAll('.dops-item-row__block-left');
								// currentFora = currentFora[0].innerHTML
								currentForaAll.forEach(elem => {
									tempFora = +elem.innerHTML.replace(/\).*/, '').replace(/.*\(/, '');
									if(tempFora < 0){
										tempFora = -tempFora;
									}
									currentFora += tempFora;
								});
								currentFora = currentFora/currentForaAll.length
							}
							else if(elem.querySelector('.dops-item__title > span').innerHTML == 'Тотал'){
								totalRemainsAll = elem.querySelectorAll('.dops-item-row__block-content');
								totalRemainsAll.forEach(elem => {
									tempTotalRemains = elem.innerHTML.replace(/ /, '').match(/span/);
									if(tempTotalRemains == null){
										totalRemains.push(+elem.innerHTML.replace(/ /, ''));
									}
								});
								totalRemains.forEach(elem => {
									totalRemainsVal += elem;
								});
								totalRemainsVal = totalRemainsVal/totalRemains.length - total;
							}
						});
						let foraRemains = currentFora - (Math.max(pointsCurrentTemp[quart + 1], pointsCurrentTemp[(quart + 1) * 2 + 1]) - Math.min(pointsCurrentTemp[quart + 1], pointsCurrentTemp[(quart + 1) * 2 + 1]));
						let ices = '0:0';
						let errorTwo = '0:0';
						let breaks = '0:0';
						let statItems = document.querySelectorAll('.livestat-tennis-info__item span');
						if(statItems.length > 0){
							ices = statItems[0].innerHTML + ':' + statItems[2].innerHTML; 
							errorTwo = statItems[3].innerHTML + ':' + statItems[5].innerHTML; 
							breaks = statItems[6].innerHTML + ':' + statItems[8].innerHTML; 	
						}
						return {
							operation: 'update',
							data: {
								pointsCurrent: pointsCurrent,
								quart: quart,
								points: points,
								total: total,
								currentFora: currentFora,
								ices: ices,
								errorTwo: errorTwo,
								breaks: breaks,
								totalRemains: totalRemainsVal,
								foraRemains: foraRemains,
								stopRate: false
							}
						}
					}
				}
			}
			else{
				return {
					operation: 'Error score'
				}
			}
		})
		.catch(error => {
			return {
				operation: 'Error on page'
			}
		})
		// if(result.operation != 'delete' && result.operation != 'Error score' && result.operation != 'Error on page'){
		// 	if(event.sport == 'basketball'){
		// 		if(result.operation == 'update-stop'){
					
		// 		}
		// 	}
		// 	else if(event.sport == 'volleyball'){
	
		// 	}
		// 	else if(event.sport == 'tennis'){
	
		// 	}
		// }
		return {
			event: event,
			result: result
		}
	}
	else{
		//Если не начат матч или редирект в никуда
		// await EventLineItem.deleteOne({url: event.url});
		return {
			result: {
				operation: 'Not starting'
			}
		}
	}
}






let Filter = mongoose.Schema({
	name: String,
	sport: String,
	url: String,
	chats: Array,
    difference: Array,
    fora: Array,
	total: Array,
	status: String,
	currentScore: Array,
	quart: Array,
	score: Array,
	currentTotal: Array,
	currentFora: Array,
	time: Array,
	totalRemains: Array,
	foraRemains: Array,
	foals: Array,
	hits: Array,
	supply: Array,
	supplyContract: Array,
	ices: Array,
	erros: Array,
	percent: Array,
	breaks: Array
});

let EventLine = mongoose.Schema({
	bet: String,
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

async function qwe(){
	const browser = await puppeteer.launch({headless: false, args: ['--no-sandbox'], ignoreDefaultArgs: ['--disable-extensions']});
	let page = await browser.newPage();
	let event = {
		url : 'https://betcityru.com/ru/live/tennis/142823/7010302',
		sport : 'tennis'
	}
	let filter = await FilterItem.findOne({sport: 'basketball'});
	await scrapSportLivePage(event, browser, page)
		.then( async result => {
			console.log(result.result.operation)
			if(result.result.operation == 'delete'){
				let finishEventItem = new FinishEventItem({
					filter: filter.name,
					sport: filter.sport,
					leage: result.event.leage,
					player1: result.event.players[0],
					player2: result.event.players[1],
					rate: 'none',
					result: result.result.data.score
				});
				await finishEventItem.save();
				sendReportTelegram(filter, result.event);
				await EventLineItem.deleteOne({url: result.event.url})
			}
			else if(result.result.operation == 'update'){
				// console.log(result.result.data)
				if(result.event.sendTelegramLive == false){
					result.event.sendTelegramLive = true;
					event = await sendTelegramLive(result.event, filter, result.result.data);
					await EventLineItem.updateOne({url: event.url}, event)
				}
				else{
					await updateTelegramLive(result.event, filter, result.result.data)
				}
			}
		})
}

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
	// request.body.forEach(elem => {
	// 	if(elem[0] == undefined){
	// 		elem[0] = 0;
	// 	}
	// 	if(elem[1] == undefined){
	// 		elem[1] = 10000;
	// 	}
	// })
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