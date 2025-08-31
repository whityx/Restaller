# Restaller

![Restaller Screenshot](https://i.imgur.com/ZnmRD9M.png)

Простой интерфейс для `winget`. 

## Особенности

-   Установка приложений в один клик с помощью `winget`.
-   Удаление уже установленных приложений.
-   Просмотр подробной информации о приложении (версия, разработчик, описание).
-   Поиск по названию или ID пакета.
-   Приятный современный интерфейс.


## Установка

1. Проверьте есть ли у вас winget: (https://github.com/microsoft/winget-cli/releases в случае если нет)
```bash
winget
```
2.  Скачайте последний релиз:
```bash
https://github.com/whityx/Restaller/releases/tag/release
```
3.  Установите зависимости:
```bash
npm install
```
4.  Запустите приложение:
```bash
bash npm run make
```
## Сборка 

Для сборки в `.exe`  выполните команду: 

```bash
npm run make
