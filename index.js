const fs = require('fs');
const path = require('path');
const configPath = path.join(process.cwd(), 'config.json')
const config = require(configPath)
const argv = require('yargs').argv
const moment = require('moment')
moment.locale('it')

const TIME_REGEX = /^(1[0-9]|2[0-4]|0[1-9]):[0-5][0-9]$/
const DAY_OF_WEEK = ['lunedi', 'marted', 'mercoledi', 'giovedi', 'venerdi', 'sabato', 'domenica']

if (!TIME_REGEX.test(argv.startTime)) throw new Error(`il formato dell'ora del parametro start-time non è valido`)
if (!TIME_REGEX.test(argv.endTime)) throw new Error(`il formato dell'ora del parametro end-time non è valido`)

if(!DAY_OF_WEEK.includes(argv.day)) throw new Error(`il parametro day deve essere uno dei seguenti valori: ${DAY_OF_WEEK}`)

const wellTeam = require('./well-team')(config)

const day = moment().day(argv.day).day()
const startTime = `${argv.startTime}:00`
const endTime = `${argv.endTime}:00`

switch (argv.action) {
    case "book":
        wellTeam.book(day, argv.lesson.toUpperCase(), startTime, endTime).then(console.log).catch(error => console.error(`error: ${error}`))
        break;
    case "cancel":
        wellTeam.cancel(day, argv.lesson.toUpperCase(), startTime, endTime).then(console.log).catch(error => console.error(`error: ${error}`))
        break;
    default:
        console.log(`devi specificare un'azione con i seguenti valori: [book, cancel], ma hai specificato il seguente valore: ${argv.action}`)
} 