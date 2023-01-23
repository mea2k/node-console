import fs from 'fs'

/////////////////////////////////////////////////
// ПОЛУЧЕНИЕ ОБЪЕКТА ({}) ИЗ МАССИВА НАЗВАНИЙ И МАССИВА ЗНАЧЕНИЙ
// PARAMS:
//  data     - массив значений
//  header  - массив названий атрибутов 
// RETURN
//  Объект {
//           header[0]: data[0],
//           header[1]: data[1],
//           ...   
//          }
function getObjectFromArray(data, header) {
    let res = {}
    for (let i = 0; i < header.length; i++) {
        res[header[i]] = data[i] ? data[i].trim() : data[i]
    }
    return res
}

/////////////////////////////////////////////////
// ПАРСИНГ CSV-ДАННЫХ В МАССИВ ОБЪЕКТОВ
// Формат файла подразумевает:
//   - первая строка - название полей
//   - каждая следующая строка - значения полей через разделитель 
// PARAMS:
//  data    - содржимое СSV-файла
//  options - параметры парсинга:
//            {
//              separator: - символ-разделитей значений (',')    
//              newLine:  символ конца строки ('\n')
//            }
// RETURN
//  массив объектов
function parseCsvData(data, options = { separator: ',', newLine: '\n' }) {
    let dataStrArray = data.split(options.newLine);
    // Заголовок
    // (избавляемся от лишних пробелов вначале и в конце)
    const header = dataStrArray.shift().split(options.separator).map((v) => v.trim())

    const dataArray = dataStrArray.map((v) =>
        getObjectFromArray(
            v.split(options.separator),
            header
        )
    )

    return dataArray
}


/////////////////////////////////////////////////
// ПАРСИНГ CSV-ФАЙЛА В МАССИВ ОБЪЕКТОВ
// Формат файла подразумевает:
//   - первая строка - название полей
//   - каждая следующая строка - значения полей через разделитель 
// PARAMS:
//  fileName  - имя CSV-файла (полный путь)
//  options   - параметры парсинга:
//              {
//                separator: - символ-разделитей значений (',')    
//                newLine:  символ конца строки ('\n')
//              } 
//  callback  - функция, вызываемая после загрузки данных 
// RETURN
//  вызов функции callback(data)
async function parseCsvFile(fileName, callback, options = { separator: ',', newLine: '\n' }) {
    let data = ''

    // загрузка данных из файла
    const readerStream = fs.createReadStream(fileName)
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
            // обработка данных
            let parsedData = parseCsvData(data, options)
            // вызов функции после обработки данных
            callback(parsedData)
        })
        // обработчики события ОШИБКА
        .on('error', (err) => {
            console.error('error', data)
            throw new Error(err)
        })
}


export { parseCsvData, parseCsvFile }
