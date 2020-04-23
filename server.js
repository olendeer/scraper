const express = require('express');
const cron = require('node-cron');
const puppeteer = require('puppeteer');
 
cron.schedule('*/1 * * * *', () => {
  	console.log('Прошла минута')
});
// const multer = require('multer');
// const mongoose = require('mongoose');
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
		// await mongoose.connect('mongodb+srv://olendeer:1029384756qazqwertyuiop@multilanding-rqsma.gcp.mongodb.net/Multilanding?retryWrites=true&w=majority', {useNewUrlParser: true, useUnifiedTopology: true});
		// console.log('Set connetion to data base');
	}catch(e){
		console.log(e)
		console.log('Not connetion!')
	}
}

start();

app.set('view engine', 'ejs');
app.use(express.static('public'));




// async function scrapping(){
// 	const browser = await puppeteer.launch({headless: false});
// 	const page = await browser.newPage();
// 	await page.goto('https://betcityru.com/ru');
// 	await page.waitFor(1000);

// 	const result = await page.evaluate(() => {
//         let title = document.querySelector('.menu__item[_ngcontent-desktop-ng-cli-c10]').innerText;
//         // let price = document.querySelector('.price_color').innerText;

//         return {
//             title
//         }

//     });


// 	browser.close();
//  	return result;
// }

// scrapping().then(result => {
// 	console.log(result);
// })








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
