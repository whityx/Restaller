# Restaller

![Restaller Screenshot](https://i.imgur.com/ZnmRD9M.png)
![Restaller Screenshot2](https://i.imgur.com/5UcWFQ6.png)
Простой интерфейс для `winget`. 

## Особенности

-   Установка приложений в один клик с помощью `winget`.
-   Удаление уже установленных приложений.
-   Просмотр подробной информации о приложении (версия, разработчик, описание).
-   Поиск по названию или ID пакета.
-   Приятный современный интерфейс.


## Установка

1. Проверьте есть ли у вас winget: 
```bash
winget
```
2. В случае если нет
```bash
Add-AppxPackage -RegisterByFamilyName -MainPackage Microsoft.DesktopAppInstaller_8wekyb3d8bbwe
```
3.  Скачайте последний релиз:
```bash
https://github.com/whityx/Restaller/releases/
```
4.  Установите зависимости:
```bash
npm install
```
5.  Запустите приложение:
```bash
bash npm run make
```
## Сборка 

Для сборки в `.exe`  выполните команду: 

```bash
npm run make
