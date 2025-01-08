// ==UserScript==
// @name         Уникальные ID предметов
// @version      1.0.0
// @author       rek655869
// @license      MIT
// @match        https://catwar.net/cw3/
// @match        https://catwar.su/cw3/
// @require      http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js
// @updateURL    https://openuserjs.org/meta/rek655869/Уникальные_ID_предметов.meta.js
// @downloadURL  https://openuserjs.org/install/rek655869/Уникальные_ID_предметов.user.js
// ==/UserScript==

(function() {
    'use strict';
    $(document).ready(function () {

        const style = document.createElement('style');
        style.type = 'text/css';
        style.innerHTML = `
        /* Уникальные ID предметов */
        /* для тем */
        :root {
            --uniq_ids-bg-color: #f0f0f0;
            --uniq_ids-text-color: #535353;
            --uniq_ids-header-bg-color: #555;
            --uniq_ids-header-color: #e7e7e7;
            --uniq_ids-border-color: #ccc;
        }

        [data-theme="dark"] {
            --uniq_ids-bg-color: #2a2a2a;
            --uniq_ids-text-color: #c6c6c6;
            --uniq_ids-header-bg-color: #222222;
            --uniq_ids-header-color: #c6c6c6;
            --uniq_ids-border-color: #555;
        }

        /* для окна */
        .uniq_ids.window {
            position: absolute;
            width: 300px;
            height: 200px;
            top: 100px;
            left: 100px;
            background-color: var(--uniq_ids-bg-color);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
            border-radius: 8px;
            z-index: 1000;
            resize: both;
            overflow: hidden; // убираем внешний скроллбар
            color: var(--uniq_ids-text-color)
        }

        /* для заголовка */
        .uniq_ids.header {
            height: 30px;
            background-color: var(--uniq_ids-header-bg-color);
            color: var(--uniq_ids-header-color);
            padding: 5px 10px;
            cursor: move;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        /* для кнопки смены темы */
        .uniq_ids.theme_button {
            cursor: pointer;
            border: none;
            background: transparent;
            color: var(--uniq_ids-header-color);
            display: flex;
        }

        /* содержимое окна */
        .uniq_ids.content {
            padding: 5px;
            overflow-y: auto;
            height: calc(100% - 30px);
            color: var(--uniq_ids-text-color)
        }

        /* таблица */
        table.uniq_ids {
            width: 100%;
        }

        table.uniq_ids td {
           border-bottom: 1px solid var(--uniq_ids-border-color);
        }

        table.uniq_ids tr td:first-child {
            padding: 5px;
            width: 50px;
        }

        table.uniq_ids img {
            width: 50px;
            height: 50px;
        }

        table.uniq_ids tr td:last-child {
            padding: 5px;
        }
        `;
        document.head.appendChild(style);

        // инициализация темы
        let loadTheme = () => {
            let savedTheme = localStorage.getItem('uniq_ids-theme') || 'light';
            document.documentElement.setAttribute('data-theme', savedTheme);
        };

        let saveTheme = (theme) => {
            localStorage.setItem('uniq_ids-theme', theme);
        };

        loadTheme();

        let floatWindow = document.createElement('div');
        floatWindow.className = 'uniq_ids window';

        let header = document.createElement('div');
        header.className = 'uniq_ids header';
        header.innerText = 'Уникальные ID';

        let themeButton = document.createElement('button');
        themeButton.className = 'uniq_ids theme_button';
        themeButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" class="bi bi-sun" viewBox="0 0 16 16">
  <g><title>Сменить тему</title><path d="M8 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm0 1a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0zm0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13zm8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5zM3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8zm10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0zm-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0zm9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707zM4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .708z"/>
</g></svg>`;

        // переключение темы
        themeButton.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            saveTheme(newTheme);
        });

        header.appendChild(themeButton);

        // сохранение состояния окна
        let saveWindowState = () => {
            let state = {
                width: floatWindow.offsetWidth,
                height: floatWindow.offsetHeight,
                top: floatWindow.offsetTop,
                left: floatWindow.offsetLeft,
            };
            localStorage.setItem('uniq_ids-window-state', JSON.stringify(state));
        };

        // получение последнего состояния окна
        let loadWindowState = () => {
            let state = JSON.parse(localStorage.getItem('uniq_ids-window-state'));
            if (state) {
                floatWindow.style.width = `${state.width}px`;
                floatWindow.style.height = `${state.height}px`;
                floatWindow.style.top = `${state.top}px`;
                floatWindow.style.left = `${state.left}px`;
            }
        };

        loadWindowState();

        let content = document.createElement('div');
        content.className = 'uniq_ids content';

        let table = document.createElement('table');
        table.className = 'uniq_ids';

        // парсинг данных из #itemList
        let itemList = document.getElementById('itemList');
        if (itemList) {
            let items = itemList.querySelectorAll('.itemInMouth');
            let imageToIdsMap = new Map();

            items.forEach(item => {
                let id = item.id;
                let img = item.querySelector('img');
                let src = img ? img.src : null;

                if (src) {
                    if (!imageToIdsMap.has(src)) {
                        imageToIdsMap.set(src, []);
                    }
                    imageToIdsMap.get(src).push(id);
                }
            });

            // заполняем таблицу
            imageToIdsMap.forEach((ids, src) => {
                let row = document.createElement('tr');

                let imgCell = document.createElement('td');
                let imgElement = document.createElement('img');
                imgElement.src = src;
                imgCell.appendChild(imgElement);

                let idsCell = document.createElement('td');
                idsCell.innerText = ids.join(', ');

                row.appendChild(imgCell);
                row.appendChild(idsCell);
                table.appendChild(row);
            });
        }

        content.appendChild(table);
        floatWindow.appendChild(header);
        floatWindow.appendChild(content);
        document.body.appendChild(floatWindow);

        // Реализация перетаскивания
        let isDragging = false;
        let offsetX = 0;
        let offsetY = 0;

        header.addEventListener('mousedown', (e) => {
            isDragging = true;
            offsetX = e.clientX - floatWindow.offsetLeft;
            offsetY = e.clientY - floatWindow.offsetTop;
            document.body.style.userSelect = 'none';
        });

        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                floatWindow.style.left = `${e.clientX - offsetX}px`;
                floatWindow.style.top = `${e.clientY - offsetY}px`;
            }
        });

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                saveWindowState();
            }
            isDragging = false;
            document.body.style.userSelect = '';
        });

        window.addEventListener('beforeunload', saveWindowState);

        // Добавление наблюдателя для элемента #itemList
        let observeItemListChanges = () => {
            let itemList = document.getElementById('itemList');
            if (!itemList) return;

            let observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'childList' || mutation.type === 'attributes') {
                        // очистка таблицы
                        while (table.firstChild) {
                            table.removeChild(table.firstChild);
                        }

                        // перезаполнение таблицы
                        let items = itemList.querySelectorAll('.itemInMouth');
                        let imageToIdsMap = new Map();

                        items.forEach(item => {
                            let id = item.id;
                            let img = item.querySelector('img');
                            let src = img ? img.src : null;

                            if (src) {
                                if (!imageToIdsMap.has(src)) {
                                    imageToIdsMap.set(src, []);
                                }
                                imageToIdsMap.get(src).push(id);
                            }
                        });

                        imageToIdsMap.forEach((ids, src) => {
                            let row = document.createElement('tr');

                            let imgCell = document.createElement('td');
                            let imgElement = document.createElement('img');
                            imgElement.src = src;
                            imgCell.appendChild(imgElement);

                            let idsCell = document.createElement('td');
                            idsCell.innerText = ids.join(', ');

                            row.appendChild(imgCell);
                            row.appendChild(idsCell);
                            table.appendChild(row);
                        });
                    }
                });
            });

            observer.observe(itemList, {
                childList: true,
                attributes: true,
                subtree: true
            });
        };
        observeItemListChanges();
    });
})();
