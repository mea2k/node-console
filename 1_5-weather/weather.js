#!/usr/bin/env node

// импорт модуля http для web-запросов
import http from 'http'
// импорт из конфигурационного файла настроек для http
import { weatherAPIToken, weatherUrl } from './config.js'

// импорт для работы с консолью
import readline from 'node:readline/promises'
import { stdin, stdout } from 'node:process'

// импорт для обработки аргументов командной строки
import yargs from 'yargs/yargs'
import { hideBin } from 'yargs/helpers'

// для работы с файлами
import fs from 'fs'
import path from 'path'

// для работы с csv
import { parseCsvData, parseCsvFile } from './csv.js'

/////////////////////////////////////////////////
/////////////////////////////////////////////////


/////////////////////////////////////////////////
// ВЫВОД В КОНСОЛЬ ИНФОРМАЦИИ О ПОГОДЕ
// PARAMS:
//  weatherData         - сведения о погоде
//  weatherDescription  - дополнительные сведения о кодах погоды и их описании 
// RETURN
//  NONE
function showWeather(weatherData, weatherDescription) {
    console.log(weatherData)
}


/////////////////////////////////////////////////
// ВЫВОД НА ЖКРАН ТЕКУЩЕЙ ПОГОДЫ В ГОРОДЕ
// PARAMS:
//  weatherData  - сведения о погоде
//  file  - имя файла (CSV), содержащего 
//          дополнительные сведения о кодах погоды и их описании 
// RETURN
//  NONE
function showCurrentWeather(weatherData, file = 'Multilingual_Weather_Conditions.csv') {
    // получение полного пути до файла CSV с описанием кодов погоды
    const fullFileName = path.join(path.resolve(path.dirname('weather-codes')), 'weather-codes', file)
    //console.log(fullFileName)

    parseCsvFile(fullFileName, (res) =>
        showWeather(weatherData, res)
    )
}


/////////////////////////////////////////////////
// ПОЛУЧЕНИЕ ПОГОДЫ через webAPI
// PARAMS:
//  city - название города
// RETURN
//  ответ сервера (JSON)
/////////////////////////////////////////////////
async function getWeatherWeb(city) {
    // формирование строки запроса для API-метода
    let result = {}
    const queryParams = {
        "access_key": weatherAPIToken,
        "query": city,
        "unit": "m",
    }

    // формирование полного URL с доп.параметрами
    const fullURL = weatherUrl + '?' + new URLSearchParams(queryParams)
    //console.log(fullURL)

    // отправка http-запроса
    http.get(fullURL, (res) => {
        const { statusCode } = res
        if (statusCode !== 200) {
            console.log(`statusCode: ${statusCode}`)
            return
        }
        // обработка полученного ответа (res)
        res.setEncoding('utf8')
        let rowData = ''
        res.on('data', (chunk) => rowData += chunk)
        res.on('end', () => {
            let parseData = JSON.parse(rowData)
            // вывод на экран текущей погоды
            showCurrentWeather(parseData.current)
            result = parseData
        })
    })
        .on('error', (err) => {
            console.error(err)
            throw new Error(err)
        })

}


/////////////////////////////////////////////////
// ПОЛУЧЕНИЕ ПОГОДЫ 
// PARAMS:
//  argv - параметры (коллекция):
//         {
//            "city": название города (по умолчанию '')
//         }
/////////////////////////////////////////////////
async function getWeather(argv) {
    // город мз аргументов командной строки
    let { city } = argv
    // работа с консолью
    const rl = readline.createInterface({ input: stdin, output: stdout });

    // если город не указан - запрашиваем с клавиатуры
    if (!city) {
        city = await rl.question('Введите город: ');
    }

    // запрос на webAPI
    await getWeatherWeb(city)
}

/////////////////////////////////////////////////
/////////////////////////////////////////////////

// описание параметров командной строки
const argv = yargs(hideBin(process.argv))
    .option('city', {
        alias: 'c',
        type: 'string',
        description: 'город',
        default: ''
    })
    .argv

/////////////////////////////////////////////////
/////////////////////////////////////////////////

// запуск основной программы
await getWeather(argv)
