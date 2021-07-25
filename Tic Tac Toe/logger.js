const time = () => {
    const sec = new Date().getSeconds()
    const min = new Date().getMinutes()
    const hr = new Date().getHours()
    const date = new Date().getDate()
    const mon = new Date().getMonth() + 1
    const year = new Date().getFullYear()
    const time = hr + ":" + min + ":" + sec + " -- " + date + ":" + mon + ":" + year;
    return time;
}

const logger = (req, res, next) => {
    console.log(req.method, req.url, time() )
    next()
}

module.exports = logger