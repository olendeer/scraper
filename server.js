const express = require('express');
const cron = require('node-cron');
const puppeteer = require('puppeteer');
const date = require('date-and-time');
const mongoose = require('mongoose');

cron.schedule('*/1 * * * *', () => {
	FilterItem.find()
	.then(filters => {
		if(filters.length > 0){
			console.log('Start scraper')
			// scrapping(filters).then(result => {
			// 	console.log(result);
			// })
			filtration(filters);
		}
		else{
			console.log('Filters not found')
			return false;
		}
	})
});

async function filtration(filters){
	filters.forEach(filter => {
		if(filter.status == 'active'){
			if(filter.sport == 'basketball'){
				scrapSport('https://betcityru.com/ru/line/bets?sp%5B%5D=3&ts=1')
				.then(result => {
					// console.log(result)
					saveResults(filter, result)
				})
			}
			else if(filter.sport == 'volleyball'){
				scrapSport('https://betcityru.com/ru/line/bets?sp%5B%5D=12&ts=1')
				.then(result => {
					// console.log(result)
					saveResults(filter, result)
				})
			}
			else if(filter.sport == 'tennis'){
				scrapSport('https://betcityru.com/ru/line/bets?sp%5B%5D=2&ts=1')
				.then(result => {
					// console.log(result)
					saveResults(filter, result)
				})
			}
		}
	})
	return false;
}



async function saveResults(filter, result){
	let results = [];
	let error = false;
	result.forEach(event => {
		error = false;
		// if(event.coefficient < filter.difference[0] || event.coefficient > filter.difference[1]){
		// 	error = true;
		// }
		// else if(event.fora < filter.fora[0] || event.fora > filter.fora[1]){
		// 	error = true;
		// }
		// else if(event.total < filter.total[0] || event.fora > filter.total[1]){
		// 	error = true;
		// }
		if(error == false){
			results.push(event);
		}
	})
	console.log(results);
}

// const multer = require('multer');
// const { base64encode, base64decode } = require('nodejs-base64');
// const btoa = require('btoa');
// const path = require('path');
// const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;


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

async function scrapSport(url){
	const browser = await puppeteer.launch({headless: false});
	const page = await browser.newPage();
	await page.goto(url);
	await page.waitFor(5000);
	let result = await page.evaluate(() => {
		let findEvents = [];
		let events = document.querySelectorAll('app-line-event-unit');
		console.log(events)
		events.forEach(async event => {
			let players = [];
			let findEvent = {
				time: 0,
				players:[],
				coefficient : 0,
				fora : 0,
				total: 0
			};
			//Поиск имён команд
			findEvent.time = event.querySelector('.line-event__time-static_large').innerHTML.trim()

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
			findEvent.total = +fora[2].innerHTML;
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



async function scrapVolleyball(){
	const browser = await puppeteer.launch({headless: false});
	const page = await browser.newPage();
	await page.goto('https://betcityru.com/ru/line/bets?sp%5B%5D=12');
	await page.waitFor(5000);
}
async function scrapTennis(){
	const browser = await puppeteer.launch({headless: false});
	const page = await browser.newPage();
	await page.goto('https://betcityru.com/ru/line/bets?sp%5B%5D=2');
	await page.waitFor(5000);
}


async function scrapping(filters){
	// if(filters.basketball != null){
		return await scrapBasketball();
	// }
}









let Filter = mongoose.Schema({
	name: String,
	sport: String,
    difference: Array,
    fora: Array,
	total: Array,
	status: String
	// favicon: String,
	// backgroundImage: String,
	// type: String,
	// typeLogo: String,
	// title: String,
	// metaTitle: String,
	// metaDescription: String,
	// domain: String,
	// name: String
});
const FilterItem = mongoose.model('Filter', Filter);

// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, __dirname + '/adminfiles/customImg/')
//     },
//     filename: function (req, file, cb) {
//         cb(null, file.originalname)
//     }
// });
// const upload = multer({ storage: storage });


// app.use((req, res, next) => {
//     res.append('Access-Control-Allow-Origin', ['*']);
//     res.append('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
//     res.append('Access-Control-Allow-Headers', 'origin, content-type, accept');
//     next();
// });



// app.post('/dropImg', upload.any(), (request, response) => {
// 	response.status(200).end();
// });


const jsonParser = express.json();
app.get('/', (request, response) => {
	console.log('head')
	response.render('admin');
});
app.get('/filters', async (request, response) => {
	console.log('filter')
	response.render('filters', {filters: await FilterItem.find()});
});
app.get('/channels', (request, response) => {
	console.log('channels')
	response.render('channels');
});
app.get('/games', (request, response) => {
	console.log('games')
	response.render('games');
});

app.post('/saveFilter', jsonParser, async (request, response) => {
	let filterItem = new FilterItem(request.body);
	await filterItem.save();
	response.status(200).end();
});

app.post('/deleteFilter', jsonParser, async (request, response) => {
	await FilterItem.deleteOne({name: request.body.name})
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



// app.get('/preview', (request, response) => {
// 	console.log('preview')
// 	response.render('preview');
// });


// let landing;
// let githubUpload = [];
// app.post('/createLanding', jsonParser, async (request, response) => {
// 	let data = request.body;
// 	landing = new Landing({
// 	    styles: data.styles,
// 	    configElements: data.configElements,
// 		logo: data.logo,
// 		favicon: data.favicon,
// 		backgroundImage: data.backgroundImage,
// 		type: data.type,
// 		typeLogo: data.typeLogo,
// 		title: data.title,
// 		metaTitle: data.metaTitle,
// 		metaDescription: data.metaDescription,
// 		domain: data.domain,
// 		name: data.name
// 	});

// 	githubUpload = [];
// 	let index = fs.readFileSync('default/index.html', 'utf8');
// 	githubUpload.push({
// 		filePath: 'default/index.html',
// 		file: base64encode(index)
// 	})

// 	let customImgs = fs.readdirSync('adminfiles/customImg');
// 	if(customImgs.length != 0){
// 		customImgs.forEach(fileName => {
// 			file = btoa(fs.readFileSync('adminfiles/customImg/' + fileName))
// 			githubUpload.push({
// 				filePath: 'default/customImg/' + fileName,
// 				file : file
// 			})
// 		})
// 	}
// 	await landing.save();
// 	fs.writeFileSync('default/js/configid.js', 'let id = "' + landing._id + '";');
// 	let id = fs.readFileSync('default/js/configid.js', 'utf8');
// 	githubUpload.push({
// 		filePath: 'default/js/configid.js',
// 		file: base64encode(id)
// 	})
// 	console.log('Create new landing - ' + landing.name);
// 	await clearWork();
// 	response.json(githubUpload);
// });

// async function clearWork(){
// 	let customImgs = fs.readdirSync('adminfiles/customImg');
// 	customImgs.forEach(img => {
// 		fs.unlinkSync('adminfiles/customImg/' + img)
// 	})
// }




// app.post('/getConfig', jsonParser, async (request, response) => {
// 	let config = request.body;
// 	let landing = await Landing.findOne({ "_id": config.id });
// 	console.log('Open landing - ' + landing.name)
// 	response.json(landing)
// });


// app.get('/default/:folder/:file', (request, response) => {
// 	let pathFile = __dirname + '/default/' + request.params.folder + '/'  + request.params.file;
// 	response.sendFile(pathFile)
// })
// app.get('/default/illustration/:folder/:file', (request, response) => {
// 	let pathFile = __dirname + '/default/illustration/' + request.params.folder + '/'  + request.params.file;
// 	response.sendFile(pathFile)
// })
