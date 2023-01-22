#!/usr/bin/env node

const readline = require('node:readline/promises');
const {stdin, stdout} = require('node:process');

const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')


async function runMe(argv) {
    // диапазон загадываемого числа
    const {from, to} = argv
    // число попыток (-1 - неограниченно)
    let {attempts} = argv
    // работа с консолью
    const rl = readline.createInterface({ input: stdin, output: stdout });

    // генерация числа
    const result = Math.floor(Math.random()*(to - from + 1) + from);
    // console.log({result, attempts})
    
    let answer = undefined;
    let question = '';
    // цикл отгадайки
    do {
        if (attempts > 0) {
            question = `[Осталось ${attempts} попыток] `
        }

        answer = await rl.question(`${question}Введите число от ${from} до ${to}: `);
        
        if (answer > result)
            console.log('Меньше');
        else if (answer < result) 
            console.log('Больше');
        else if (answer == result) {
            console.log(`Отгадано число ${result}!`)
            break
        }
        else
            console.log('Не число!');

        attempts--;

    }
    while(attempts != 0)

    if (answer != result) {
        console.log('Вы проиграли!')
    }
    rl.close();
}



const argv = yargs(hideBin(process.argv))
   .option('from', {
    alias: 'f',
    type: 'number',
    description: 'диапазон от',
    default: 1
})
.option('to', {
    alias: 't',
    type: 'number',
    description: 'диапазон до',
    default: 100
})
.option('attempts', {
    alias: 'a',
    type: 'number',
    description: 'число попыток',
    default: -1
})
.argv


runMe(argv)
