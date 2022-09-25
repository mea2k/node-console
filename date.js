#!/usr/bin/env -S node --disable-proto=throw \r\n

const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')


// Текущая дата
// MONTH - указать только текущий месяц
// YEAR - указать только текущий год
// DATE - указать текущую дату в календарном формате
// пусто - указать текущую дату в ISO-формате
function getCurrent(date, argv) {
    // console.log(argv)
 
    let result = ''
 
    if ('date' in argv) {
        result = date.toLocaleString()        
    }    
    else {
        result = date.toString()        
    }

    if ('month' in argv) {
        result = date.toLocaleString('default', { month: 'long' });
    }

    if ('year' in argv) {
        result = date.getFullYear();
    }

    console.log(result)
}


// Добавление даты
// DAY - добавить указанное число дней
// MONTH - добавить указанное число месяцев
// YEAR - добавить указанное число лет
// Новая дата выводится в ISO-формате
function addDate(date, argv) {
    // console.log(argv)
 
    let new_date = new Date(date)
 
     if ('day' in argv) {
        new_date.setDate(date.getDate() + (argv['day'] ? Number(argv['day']) : 0))        
    }    
  
    if ('month' in argv) {
        new_date.setMonth(date.getMonth() + (argv['month'] ? Number(argv['month']) : 0))        
    }    
    
    if ('year' in argv) {
        new_date.setFullYear(date.getFullYear() + (argv['year'] ? Number(argv['year']) : 0))        
    }      
    console.log(new_date)
}


// Удаление даты
// DAY - добавить указанное число дней
// MONTH - добавить указанное число месяцев
// YEAR - добавить указанное число лет
// Новая дата выводится в ISO-формате
function subDate(date, argv) {
    // console.log(argv)
 
    let new_date = new Date(date)
 
     if ('day' in argv) {
        new_date.setDate(date.getDate() - (argv['day'] ? Number(argv['day']) : 0))        
    }    
  
    if ('month' in argv) {
        new_date.setMonth(date.getMonth() - (argv['month'] ? Number(argv['month']) : 0))        
    }    
    
    if ('year' in argv) {
        new_date.setFullYear(date.getFullYear() - (argv['year'] ? Number(argv['year']) : 0))        
    }      
    console.log(new_date)
}


const argv = yargs(hideBin(process.argv))
    .command({
        command: 'current [-y|-m|-c]',
        aliases: ['cur'],
        desc: 'Отображение текущего времени',
        handler: (argv) => {
            console.log('CURRENT')
            const date = new Date()
            getCurrent(date, argv)
        },
    })
    .option('year', {
        alias: 'y',
        type: 'number',
        description: 'указание года',
        })
    .option('month', {
        alias: 'm',
        type: 'number',
        description: 'указание месяца',
    })
    .option('day', {
        alias: 'd',
        type: 'number',
        description: 'указание количества дней',
    })
    .option('date', {
        alias: 'c',
        type: 'boolean',
        description: 'указание даты в календарном формате',
    })

    .command({
        command: 'add [-y|-m|-d]',
        aliases: ['a'],
        desc: 'Добавление к текущей даты периода времени',
        handler: (argv) => {
            console.log('ADD')
            const date = new Date()
            addDate(date, argv)
        },
    })

    .command({
        command: 'sub [-y|-m|-d]',
        aliases: ['s'],
        desc: 'Вычитание из текущей даты периода времени',
        handler: (argv) => {
            console.log('SUB')
            const date = new Date()
            subDate(date, argv)
        },
    })

    .command({
        command: '$0',
        handler: (argv) => {
            console.log('DEFAULT')
            const date = new Date()
            getCurrent(date, argv)
        },
    })

    .argv

// console.log(argv)
// console.log(process.argv)