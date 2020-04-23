const express = require('express');
const cron = require('node-cron');
const puppeteer = require('puppeteer');

cron.schedule('*/1 * * * *', () => {
  	console.log('Прошла минута')
});
// const multer = require('multer');
const mongoose = require('mongoose');
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


// let rounded = function(number){
//     return +number.toFixed(2);
// }




async function scrapBasketball(){
	const browser = await puppeteer.launch({headless: false});
	const page = await browser.newPage();
	await page.goto('https://betcityru.com/ru/line/bets?sp%5B%5D=3');
	await page.waitFor(5000);
	const result = await page.evaluate(() => {
		let findEvents = [];
		let events = document.querySelectorAll('app-line-event-unit');
		events.forEach(async event => {
			let players = [];
			let findEvent = {
				players:[],
				coefficient : 0,
				fora : 0,
				total: 0
			};
			//Поиск имён команд
			players = event.querySelectorAll('.line-event__name-teams b');
			players.forEach(player => {
				findEvent.players.push(player.innerHTML);
			})
			//Поиск форы
			let fora = event.querySelectorAll('.line-event__main-bets-button_left');
			findEvent.fora = fora[0].innerHTML + ' / ' + fora[1].innerHTML;
			//Поиск Тотал
			findEvent.total = fora[2].innerHTML;
			//Поиск коеффициента
			let coefficients = event.querySelectorAll('.line-event__main-bets-button_colored');
			if(coefficients.length != null){
				
				findEvent.coefficient = +coefficients[0].innerHTML - +coefficients[1].innerHTML;
				if(findEvent.coefficient < 0){
					findEvent.coefficient = -findEvent.coefficient;
				}
				findEvent.coefficient = +findEvent.coefficient.toFixed(2);
			}
			//Добавление ивента в массив
			findEvents.push(findEvent);
		});

		// lineMatchs.forEach(lineMatch => {
		// 	koefDifs = [];
		// 	let koefDif;
		// 	lineMatch = lineMatch.querySelectorAll('.line-event__main-bets-button_colored');
		// 	if(lineMatch.length != 0){
		// 		koefDif = +lineMatch[0].innerHTML - +lineMatch[1].innerHTML;
		// 		resultLineMatchs.push(koefDifs);
		// 	}
		// });
        return findEvents;

	});
	browser.close();
 	return result;
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


// async function scrapping(){
// 	const browser = await puppeteer.launch({headless: false});
// 	const page = await browser.newPage();
// 	await page.goto('https://betcityru.com/ru/line/bets?line_ids%5B%5D=2&line_ids%5B%5D=3&line_ids%5B%5D=12&sp%5B%5D=3&sp%5B%5D=12&sp%5B%5D=2');
// 	await page.waitFor(5000);

// 	const result = await page.evaluate(() => {
// 		let resultLineMatchs = [];
// 		let koefDifs = [];
// 		let lineMatchs = document.querySelectorAll('.line-event__main-bets');
// 		lineMatchs.forEach(lineMatch => {
// 			koefDifs = [];
// 			lineMatch.querySelectorAll('.line-event__main-bets-button_colored').forEach(koefDif => {
// 				koefDifs.push(koefDif.innerHTML);
// 			})
// 			if(koefDifs.length != 0){
// 				resultLineMatchs.push(koefDifs);
// 			}
// 			// resultKoefDifs.push(element.innerHTML);
// 		});

// 		// console.log(test);
//         // let price = document.querySelector('.price_color').innerText;
		
//         return resultLineMatchs;

//     });


// 	browser.close();
//  	return result;
// }

async function scrapping(filters){
	if(filters.basketball != null){
		return await scrapBasketball();
	}
}


let filters = {
	basketball: {

	},
	vollayball: null,
	tennis:null
}

scrapping(filters).then(result => {
	console.log(result);
})








// var Schema = mongoose.Schema({
//     styles: Array,
//     configElements: Array,
// 	logo: Array,
// 	favicon: String,
// 	backgroundImage: String,
// 	type: String,
// 	typeLogo: String,
// 	title: String,
// 	metaTitle: String,
// 	metaDescription: String,
// 	domain: String,
// 	name: String
// });
// const Landing = mongoose.model('Landing', Schema);

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


// const jsonParser = express.json();
app.get('/', (request, response) => {
	console.log('head')
	response.render('admin');
});
app.get('/filters', (request, response) => {
	console.log('filter')
	response.render('filters');
});
app.get('/channels', (request, response) => {
	console.log('channels')
	response.render('channels');
});
app.get('/games', (request, response) => {
	console.log('games')
	response.render('games');
});

// app.get('/edit', (request, response) => {
// 	console.log('edit')
// 	response.render('edit');
// });
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
