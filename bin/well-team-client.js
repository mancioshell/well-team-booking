#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const argv = require('yargs').argv
const moment = require('moment')
moment.locale('en')

const wellTeamClient = require('../')

const TIME_REGEX = /^(1[0-9]|2[0-4]|0[1-9]):[0-5][0-9]$/
const DAY_OF_WEEK = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']

WIDE_DAY_OF_WEEK = {
    'mon': 'monday',
    'tue': 'tuesday',
    'wed': 'wednesday',
    'thu': 'thursday',
    'fri': 'friday',
    'sat': 'saturday',
    'sun': 'sunday'
}

try {
    const configPath = path.join(process.cwd(), 'config.json')
    if (fs.existsSync(configPath)) {
        const config = require(configPath)

        const wellTeam = wellTeamClient(config)
        if (!TIME_REGEX.test(argv.startTime)) throw new Error(`start-time parameter format is not valid`)
        if (!TIME_REGEX.test(argv.endTime)) throw new Error(`end-time parameter format is not valid`)

        if (!DAY_OF_WEEK.includes(argv.day)) throw new Error(`day parameter should be one of : ${DAY_OF_WEEK}`)

        const day = moment().day(WIDE_DAY_OF_WEEK[argv.day]).day()
        const lessonDay = moment().day(day)

        const startTime = `${argv.startTime}:00`
        const endTime = `${argv.endTime}:00`

        switch (argv.action) {
            case "book":
                wellTeam.book(lessonDay, argv.lesson.toUpperCase(), startTime, endTime).then(console.log).catch(error => console.error(`error: ${error}`))
                break;
            case "cancel":
                wellTeam.cancel(lessonDay, argv.lesson.toUpperCase(), startTime, endTime).then(console.log).catch(error => console.error(`error: ${error}`))
                break;
            default:
                console.log(`action parameter should be one of: [book, cancel], but you have specified this value: ${argv.action}`)
        }
    } else {
        console.log('file config.json does not exist')
        process.exit(1)
    }
} catch (e) {
    console.log(e)
    process.exit(1)
}