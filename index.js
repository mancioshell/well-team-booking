const request = require('request-promise-native');
const moment = require('moment')
moment.locale('en')

const getGymInfo = async () => {
    const result = await request({ url: `https://inforyoumobile.teamsystem.com/api/v1/search?code=dailytraining`, json: true })

    const guid_app = result.Item.guid_app
    const iyes_url = result.Item.iyes_url

    if (!result.Successful) return Promise.reject(result.Comment)
    return Promise.resolve({ guid_app, iyes_url })
}

const getAppInfo = async (guid_app) => {
    const result = await request({ url: `http://iyes.inforyou.it/v1/token/${guid_app}`, json: true })
    const app_token = result.Item
    if (!result.Successful) return Promise.reject(result.Comment)
    return Promise.resolve({ app_token })
}

const getCompanyInfo = async (app_token, iyes_url) => {
    const result = await request({
        url: `https://inforyouwebgw.teamsystem.com/api/v1/webcompany/list`,
        json: true,
        headers: {
            'AppToken': app_token,
            'IYESUrl': iyes_url
        }
    })
    if (!result.Successful) return Promise.reject(result.Comment)
    if (result.Items.length > 0) {
        return Promise.resolve({ companyID: result.Items[0].ID })
    } else {
        return Promise.reject(`no companyID found`)
    }
}

const getAuthInfo = async (username, password, app_token, iyes_url, companyID) => {
    const result = await request({
        url: `https://inforyouwebgw.teamsystem.com/api/v1/security/authenticate?login=${username}&password=${password}&companyid=${companyID}`,
        json: true,
        headers: {
            'AppToken': app_token,
            'IYESUrl': iyes_url
        }
    })
    if (!result.Successful) return Promise.reject(result.Comment)
    const auth_token = result.Item
    return Promise.resolve({ auth_token })
}

const getLessonInfo = async (app_token, auth_token, iyes_url, companyID, lessonDay, lessonName, startTime, endTime) => {
    const lessonDayString = lessonDay.format('YYYY-MM-DDT')
    
    const result = await request({
        method: 'POST',
        url: `https://inforyouwebgw.teamsystem.com/api/v1/webbooking/listwithmine`,
        json: true,
        headers: {
            'AppToken': app_token,
            'IYESUrl': iyes_url,
            'AuthToken': auth_token
        },
        body: {
            "CompanyID": `${companyID}`,
            "EndDate": `${lessonDayString}23:30:00`,
            "StartDate": `${lessonDayString}00:00:00`,
            "TimeEnd": `${lessonDayString}${endTime}`,
            "TimeStart": `${lessonDayString}${startTime}`,
            "Types": []
        }
    })
    
    if (!result.Successful) return Promise.reject(result.Comment)

    if (!result.Items || result.Items.length <= 0) return Promise.reject(`no lesson found the ${lessonDay.format("dddd")} which starts at ${startTime} and end at ${endTime}`)
    const myLesson = result.Items.filter(elem => elem.ServiceDescription === lessonName)[0]
    if (!myLesson) return Promise.reject(`no lesson found with name: ${lessonName}`)
    return Promise.resolve({ serviceID: myLesson.IDServizio, lessonID: myLesson.IDLesson })
}

const bookLesson = async (app_token, auth_token, iyes_url, lessonDay, lessonID, serviceID, startTime, endTime) => {
    const lessonDayString = lessonDay.format('YYYY-MM-DDT')
    const result = await request({
        method: 'POST',
        json: true,
        body: {
            "EndTime": `${lessonDayString}${endTime}`,
            "StartTime": `${lessonDayString}${startTime}`,
            "IDLesson": lessonID,
            "BookingID": serviceID
        },
        url: `https://inforyouwebgw.teamsystem.com/api/v1/webbooking/book`,
        headers: {
            'AppToken': app_token,
            'IYESUrl': iyes_url,
            'AuthToken': auth_token
        }
    })

    if (!result.Successful) return Promise.reject(result.Comment)
    return Promise.resolve({ comment: result.Comment })
}


const cancelLesson = async (app_token, auth_token, iyes_url, lessonDay, lessonID, serviceID, startTime, endTime) => {
    const lessonDayString = lessonDay.format('YYYY-MM-DDT')
    const result = await request({
        method: 'POST',
        json: true,
        body: {
            "EndTime": `${lessonDayString}${endTime}`,
            "StartTime": `${lessonDayString}${startTime}`,
            "IDLesson": lessonID,
            "BookingID": serviceID
        },
        url: `https://inforyouwebgw.teamsystem.com/api/v1/webbooking/cancel`,
        headers: {
            'AppToken': app_token,
            'IYESUrl': iyes_url,
            'AuthToken': auth_token
        }
    })

    if (!result.Successful) return Promise.reject(result.Comment)
    return Promise.resolve({ comment: result.Comment })
}

const book = async (username, password, lessonDay, lessonName, startTime, endTime) => {

    const { guid_app, iyes_url } = await getGymInfo()
    const { app_token } = await getAppInfo(guid_app)
    const { companyID } = await getCompanyInfo(app_token, iyes_url)
    const { auth_token } = await getAuthInfo(username, password, app_token, iyes_url, companyID)

    const { serviceID, lessonID } = await getLessonInfo(app_token, auth_token, iyes_url, companyID, lessonDay, lessonName, startTime, endTime)

    const { comment } = await bookLesson(app_token, auth_token, iyes_url, lessonDay, lessonID, serviceID, startTime, endTime)
    return Promise.resolve(comment)
}

const cancel = async (username, password, lessonDay, lessonName, startTime, endTime) => {

    const { guid_app, iyes_url } = await getGymInfo()
    const { app_token } = await getAppInfo(guid_app)
    const { companyID } = await getCompanyInfo(app_token, iyes_url)
    const { auth_token } = await getAuthInfo(username, password, app_token, iyes_url, companyID)

    const { serviceID, lessonID } = await getLessonInfo(app_token, auth_token, iyes_url, companyID, lessonDay, lessonName, startTime, endTime)

    const { comment } = await cancelLesson(app_token, auth_token, iyes_url, lessonDay, lessonID, serviceID, startTime, endTime)
    return Promise.resolve(comment)
}

module.exports = (config) => {
    let { username, password } = config

    if (!username) throw new Error("username is required")
    if (!password) throw new Error('password is required')

    return {
        book: async (dayNumber, lessonName, startTime, endTime) => book.call(this, username, password, dayNumber, lessonName, startTime, endTime),
        cancel: async (dayNumber, lessonName, startTime, endTime) => cancel.call(this, username, password, dayNumber, lessonName, startTime, endTime)
    }
}