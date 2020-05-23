#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const moment = require('moment')
moment.locale('en')

const wellTeamClient = require('../')

const TIME_REGEX = /^(1[0-9]|2[0-4]|0[1-9]):[0-5][0-9]$/
const DATE_REGEX = /^\d{4}(-)(((0)[0-9])|((1)[0-2]))(-)([0-2][0-9]|(3)[0-1])$/
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

const commangArgs = (yargs) => {
    return yargs
        .option('username', {
            alias: 'u',
            describe: 'Your DailyTraining username',
            implies: ['password'],
            type: 'string'
        })
        .option('password', {
            alias: 'p',
            describe: 'Your DailyTraining password',
            implies: ['username'],
            type: 'string'
        })
        .option('config', {
            alias: 'c',
            describe: 'Config file contains username and password in JSON format',
            config: true,
            implies: ['password'],
            type: 'string'
        })
        .option('lesson', {
            alias: 'l',
            describe: 'Your DailyTraining lesson name',
            coerce: lesson => lesson.toUpperCase(),
            type: 'string'
        })
        .option('day', {
            alias: 'dow',
            describe: 'Day of week of your lesson',
            choices: DAY_OF_WEEK,
            type: 'string'
        })
        .option('date', {
            alias: 'd',
            describe: 'Lesson Date in YYYY-MM-DD format'
        })
        .option('start-time', {
            alias: 's',
            describe: 'Lesson Start Time in HH:MM format',
            type: 'string'
        })
        .option('end-time', {
            alias: 'e',
            describe: 'Lesson End Time in HH:MM format',
            type: 'string'
        })
}

const argv = require('yargs')
    .command('book', 'Book a lesson on DailyTraining', commangArgs)
    .command('cancel', 'Cancel an already booked lesson on DailyTraining', commangArgs)
    .command('lessons', 'Cancel an already booked lesson on DailyTraining')
    .demandCommand()
    .help()
    .locale('en')
    .argv

try {
    const configPath = path.join(process.cwd(), 'config.json')

    if (fs.existsSync(configPath) || (argv.username && argv.password)) {
        const config = fs.existsSync(configPath) ? require(configPath) : { username: argv.username, password: argv.password }

        const wellTeam = wellTeamClient(config)

        let startTime = null, endTime = null, lessonDay = null

        if (argv._ != 'lessons') {
            if (!TIME_REGEX.test(argv.startTime)) throw new Error(`start-time parameter should be in HH:MM format`)
            if (!TIME_REGEX.test(argv.endTime)) throw new Error(`end-time parameter should be in HH:MM format`)

            startTime = `${argv.startTime}:00`
            endTime = `${argv.endTime}:00`

            if (!argv.day && !argv.date) throw new Error(`day or date parameter is mandatory`)
            if (argv.day && !DAY_OF_WEEK.includes(argv.day)) throw new Error(`day parameter should be one of : ${DAY_OF_WEEK}`)
            if (argv.date && !DATE_REGEX.test(argv.date)) throw new Error(`date parameter should be in YYYY-MM-DD format`)

            lessonDay = argv.date ? moment(argv.date) : moment().day(moment().day(WIDE_DAY_OF_WEEK[argv.day]).day())
        }

        wellTeam[argv._](lessonDay, argv.lesson, startTime, endTime)
            .then(argv._ != 'lessons' ? console.log : console.table)
            .catch(error => console.error(`error: ${error}`))

    } else {
        console.log('file config.json does not exist')
        process.exit(1)
    }
} catch (e) {
    console.log(e)
    process.exit(1)
}