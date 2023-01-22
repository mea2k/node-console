#!/usr/bin/env -S node --disable-proto=throw \r\n

const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')

const fs = require('fs')
const path = require('path')

/////////////////////////////////////////////////
// ФОРМАТ ЗАПИСИ ЖУРНАЛА:
// каждая запись - JSON-структура, преобразованная в строку (JSON.stringify)
// Структура JSON-записи:
//  {
//    "time": время броска монеты (Date())
//    "coin_total_sides": число сторон у монеты (Number),
//    "coin_side": название выпавшей стороны монеты (String),
//    "answer_side": название указанной пользователем стороны монеты (String)
//}
/////////////////////////////////////////////////


/////////////////////////////////////////////////
// ПАРСИНГ ФАЙЛА ЖУРНАЛА
// PARAMS:
//  data - содержимое файла журнала (каждая запись с новой строки)
// RETURN
//  объект с посчитанной статистикой ({})
/////////////////////////////////////////////////
function fetchLogData(data) {
    let result = {}
    // преобразование текстового файла в массив JSON-ов
    // (каждая запись с новой строки)
    // и убираем последнюю пустую строку
    const dataArray = data.split('\n').filter(v=>v.length>0).map((v) => {
        let result = {}
        try {
            result = JSON.parse(v)
        }
        finally {
            return result
        }
    })
    // Общее число попыток - записей в журнале
    const totalAttempts = dataArray.length

    // Число победных попыток (выпавшая сторона монеты равна угаданной)
    const winAttempts = dataArray.filter((a) => a.coin_side === a.answer_side)
    // Число проигрышных попыток (которые не вошли в победные)
    const loseAttempts = dataArray.filter((a) => !winAttempts.includes(a))
    // Статистика по выпавшин сторонам ({sideName1: count1, sideName2: count2,...})
    const sideStat = dataArray.reduce((accum, next) => {
        if (accum[next.coin_side] == undefined)
            accum[next.coin_side] = 1
        else
            accum[next.coin_side]++
        return accum
    }, {})

    // Статистика по указыаванию стороны игроком ({sideName1: count1, sideName2: count2,...})
    const answerStat = dataArray.reduce((accum, next) => {
        if (accum[next.answer_side] == undefined)
            accum[next.answer_side] = 1
        else
            accum[next.answer_side]++
        return accum
    }, {})

    // дата первой игры
    const minDate = dataArray.reduce((accum, next) => new Date(accum.time).getTime() > new Date(next.time).getTime() ? next : accum, { time: new Date() }).time
    // дата последней игры
    const maxDate = dataArray.reduce((accum, next) => new Date(accum.time).getTime() < new Date(next.time).getTime() ? next : accum, { time: new Date(0) }).time

    // сумма временных интервалов между соседними играми
    let timeInterval = 0;
    let cycleTime = new Date(minDate).getTime()
    dataArray.forEach((e => {
        let eDate = new Date(e.time).getTime()
        if (!isNaN(eDate)) {
            timeInterval += eDate - cycleTime
            cycleTime = eDate
        }
    }))

    // среднее время между играми
    const attemptsIntervalms = timeInterval / totalAttempts
    const attemptsIntervalsec = Math.floor((attemptsIntervalms / 1000) % 60);
    const attemptsIntervalmin = Math.floor((attemptsIntervalsec / 1000 / 60) % 60);
    const attemptsIntervalhour = Math.floor((attemptsIntervalmin / 1000 / 60 / 60) % 24);

    // среднее время между играми в формате строки времени (чч:мм:сс)
    // лишние компоненты времени не будут отображены 
    //(например, если среднее время между играми 1 минута, то будет '01:00 s')
    let attemptsIntervalArray = [attemptsIntervalsec.toString().padStart(2, "0")]
    if (attemptsIntervalsec >= 60)
        attemptsIntervalArray.unshift(attemptsIntervalmin.toString().padStart(2, "0"))
    if (attemptsIntervalsec >= 3600)
        attemptsIntervalArray.unshift(attemptsIntervalhour.toString().padStart(2, "0"))
    const avgAttemptsInterval = attemptsIntervalArray.join(":") + " s"

    // Итоговые данные, собранные в одном месте
    result = {
        ...result,
        totalAttempts,
        winAttempts: winAttempts.length,
        winPercent: (Math.round(winAttempts.length / totalAttempts * 1000) / 10),
        loseAttempts: loseAttempts.length,
        losePercent: (Math.round(loseAttempts.length / totalAttempts * 1000) / 10),
        minDate,
        maxDate,
        avgAttemptsInterval,
        sideStat,
        answerStat
    }

    return result
}

/////////////////////////////////////////////////
// ОСНОВНАЯ ФУНКЦИЯ
// PARAMS:
//  аргументы командной строки:
//  l или log - имя файла журнала (logs.txt)
/////////////////////////////////////////////////
function logAnalyser(argv) {

    // название лог-файла (log.txt)
    const logFile = argv.log
    // полный путь до файла
    const fullFileName = path.join(__dirname, logFile)
    // данные из файла
    let data = ''


    // итоговая статистика
    let resultStat = {}
    process.stdout.write('Loading logfile...')
    // считывание данных из файла с использованием асинхронного потока
    const readerStream = fs.createReadStream(fullFileName)
    readerStream
        // кодировка
        .setEncoding('UTF8')
        // обработчики события ЗАГРУЗКА ОЧЕРЕДНОЙ ПОРЦИИ ДАННЫХ
        .on('data', (chank) => {
            // дозапись порции данных
            data += chank
        })
        // обработчики события КОНЕЦ ЗАГРУЗКИ
        .on('end', () => {
            console.log('done.')
            // вызов основного обработчика журнала
            resultStat = fetchLogData(data)
            // вывод на экран результирующей статистики
            console.log(resultStat)
        })
        // обработчики события ОШИБКА
        .on('error', (err) => {
            console.log('error', data)
            throw new Error(err)
        })
}

// параметры командной строки
const argv = yargs(hideBin(process.argv))
    .option('log', {
        alias: 'l',
        type: 'string',
        description: 'имя файла журнала',
        default: 'logs.txt'
    })
    .argv

// основная функция
logAnalyser(argv)