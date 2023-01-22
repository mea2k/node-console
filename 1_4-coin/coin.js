#!/usr/bin/env node

const readline = require('node:readline/promises');
const { stdin, stdout } = require('node:process');

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
function makeLogData(result, answer, sides) {
    let data = {
        "time": new Date(),
        "coin_total_sides": sides,
        "coin_side": result,
        "answer_side": answer
    }
    return data
}

function log(data, file) {
    const fullFileName = path.join(__dirname, file)
    fs.appendFile(fullFileName, JSON.stringify(data) + '\n', (err) => {
        if (err) {
            console.error(`Error write to log file ${fullFileName}!`)
            throw Error(err)
        }
        //console.log('Log writed')
    })

}

/////////////////////////////////////////////////
// Бросаем монетку с N сторонами
// PARAMS:
//  argv - описание монетки (коллекция):
//          {"sides": N - число сторон
//           "sideNames": ["obverse", "reverse"] - названия сторон
//           "attempts": K - число бросков (-1 - неограниченно)
//          }
/////////////////////////////////////////////////
async function dropCoin(argv) {

    console.log(argv)

    // число сторон
    const { sides } = argv
    // формируем массив имен сторон из строки (разделитель - запятые)
    const sideNames = argv.sidenames.split(',')
    // число бросков (-1 - неограниченно)
    const { attempts } = argv
    // название лог-файла (log.txt)
    const logFile = argv.log
    // работа с консолью
    const rl = readline.createInterface({ input: stdin, output: stdout });

    let answer = undefined;
    let question = '';
    // множитель для получения случайного индекса монеты
    let multiplier = 1;
    let buf = sides;
    do {
        multiplier *= 10;
        buf = Math.floor(buf / 10);
    }
    while (buf > 0);

    let result = 0
    let counter = 0

    // цикл отгадайки
    do {
        if (attempts > 0) {
            question = `[Бросок ${counter + 1}] `
        }

        // бросок монеты
        result = Math.floor(Math.floor(Math.random() * multiplier) * sides / multiplier);
        //console.log({result, attempts})

        answer = await rl.question(`${question}Угадайте сторону от ${1} до ${sides}}: `);

        if (answer == result + 1)
            console.log(`Вы угадали! Сторона - ${sideNames[result]}`);
        else
            console.log(`Вы не угадали! Сторона - ${sideNames[result]}`);

        log(makeLogData(sideNames[result], sideNames[answer - 1], sides), logFile)

        counter++;

    }
    while (counter != attempts)
    rl.close();
}


// описание параметров командной строки
const argv = yargs(hideBin(process.argv))
    .option('sides', {
        alias: 's',
        type: 'number',
        description: 'число сторон монеты',
        default: 2
    })
    .option('sidenames', {
        alias: 'n',
        type: 'string',
        description: 'список названий сторон через запятую без пробела',
        default: 'obverse,reverse'
    })
    .option('attempts', {
        alias: 'a',
        type: 'number',
        description: 'число попыток',
        default: -1
    })
    .option('log', {
        alias: 'l',
        type: 'string',
        description: 'имя файла журнала',
        default: 'logs.txt'
    })
    .argv

// запуск основной программы
dropCoin(argv)
