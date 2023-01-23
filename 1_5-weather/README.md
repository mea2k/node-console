# ПОГОДА В МИРЕ

## Задание 1 и 2 - Погода в городах

### Используемые технологии
1. Работа с HTTP (`http.get()`)
2. Работа с переменными окружения (`process.env` и файл `.env`)
3. Работа с файлами и потоками (`fs` и `ReaderStream`)
4. Работа с аргументами командной строки (`yargs`)

### Формат команды

```
node weather
```
ИЛИ с использованием переменных окружения:
```
node -r dotenv/config weather.js
```

Аргументы командной строки
```
--help           Показать помощь                     [boolean]
--version        Версия программы                    [boolean]
-c, --city       Название города (если с пробелом, то в кавычках "")   [string]     
```

Основной файл - [weather.js](weather.js)


### Порядок запуска
1. Создать файл `.env` в папке с проектом.
2. Записать в него следующие параметры:
```
    weatherAPIToken=...
    weatherUrl=http://api.weatherstack.com/current
```
В качестве значения weatherAPIToken необходимо взять токен, получаемый при **бесплатной** регистрации на сайте [weatherstack.com](https://weatherstack.com/signup/free)

3. Запустить программу с помощью команды:
```
node -r dotenv/config weather.js [{-c|--city} name]
```

