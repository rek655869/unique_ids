// ==UserScript==
// @name         Уникальные ID предметов
// @version      1.1.0
// @author       rek655869
// @license      MIT
// @match        https://catwar.net/cw3/
// @match        https://catwar.su/cw3/
// @require      https://ajax.googleapis.com/ajax/libs/jquery/3.7.1/jquery.min.js
// ==/UserScript==

(function ($, window, document) {
  $(function () {
    const style = $('<style></style>').text(`
      /* Уникальные ID предметов */
      /* для тем */

      .uniq_ids {
        --uniq_ids-bg-color: #f0f0f0;
        --uniq_ids-text-color: #535353;
        --uniq_ids-header-bg-color: #555;
        --uniq_ids-header-color: #e7e7e7;
        --uniq_ids-border-color: #ccc;
      }

      .uniq_ids[theme="dark"] {
        --uniq_ids-bg-color: #2a2a2a;
        --uniq_ids-text-color: #c6c6c6;
        --uniq_ids-header-bg-color: #222222;
        --uniq_ids-header-color: #c6c6c6;
        --uniq_ids-border-color: #555;
      }

      /* для окна */

      #uniq_ids-window {
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
        color: var(--uniq_ids-text-color);
      }

      /* для заголовка */

      #uniq_ids-header {
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

      #uniq_ids-theme_button {
        cursor: pointer;
        border: none;
        background: transparent;
        color: var(--uniq_ids-header-color);
        display: flex;
      }
      
      /* для кнопки копирования */
      
      .uniq_ids-copy-button {
        cursor: pointer;
        border: none;
        background: transparent;
        color: var(--uniq_ids-text-color);
        position: absolute;
        top: 50%;
        right: 0.01rem;
        transform: translateY(-50%);
      }

      /* содержимое окна */

      #uniq_ids-content {
        padding: 5px;
        overflow-y: auto;
        height: calc(100% - 30px);
        color: var(--uniq_ids-text-color);
      }

      /* таблица */

      #uniq_ids-content table {
        width: 100%;
      }

      #uniq_ids-content table td {
        border-bottom: 1px solid var(--uniq_ids-border-color);
      }
      
      #uniq_ids-content table td:last-of-type {
        position: relative;
      }

      #uniq_ids-content table tr td:first-child {
        padding: 5px;
        width: 50px;
      }

      #uniq_ids-content table img {
        width: 50px;
        height: 50px;
      }

      #uniq_ids-content table tr td:last-child {
        padding: 5px;
      }
    `);

    const baseClipboard = `<svg xmlns="http://www.w3.org/2000/svg" width="27" height="27" fill="currentColor" class="bi bi-clipboard-check-fill" viewBox="0 0 22 22"><g>
<path fill-rule="evenodd" d="M5.5 9.5A.5.5 0 0 1 6 9h4a.5.5 0 0 1 0 1H6a.5.5 0 0 1-.5-.5"/>
  <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1z"/>
  <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0z"/>
</g></svg>`;
    const fillClipboard = `<svg xmlns="http://www.w3.org/2000/svg" width="27" height="27" fill="currentColor" class="bi bi-clipboard-check-fill" viewBox="0 0 22 22"><g>
  <path d="M6.5 0A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0zm3 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5z"/>
  <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1A2.5 2.5 0 0 1 9.5 5h-3A2.5 2.5 0 0 1 4 2.5zm6.854 7.354-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 0 1 .708-.708L7.5 10.793l2.646-2.647a.5.5 0 0 1 .708.708"/>
</g></svg>`;

    let $settings = JSON.parse(localStorage.getItem('uniq_ids-settings')) || {
      theme: 'light',
      window: {
        width: 300,
        height: 300,
        top: 20,
        left: 500,
      },
    };
    const saveSettings = () =>
      localStorage.setItem('uniq_ids-settings', JSON.stringify($settings));

    // ждём открытие страницы и её загрузку
    const observer = new MutationObserver(() => {
      if (
        location.href === 'https://catwar.net/cw3/' ||
        location.href === 'https://catwar.su/cw3/'
      ) {
        let $itemList = $('#itemList');
        if ($itemList.length) {
          showWindow($itemList);
          $('head').append(style);
          observer.disconnect();
        }
      }
    });

    function showWindow($itemList) {
      let $floatWindow = $('<div></div>')
        .addClass('uniq_ids')
        .attr({
          id: 'uniq_ids-window',
          theme: $settings.theme,
        })
        .css({
          width: `${$settings.window.width}px`,
          height: `${$settings.window.height}px`,
          top: `${$settings.window.top}px`,
          left: `${$settings.window.left}px`,
        });
      let $header = $('<div></div>')
        .attr('id', 'uniq_ids-header')
        .text('Уникальные ID предметов');

      let $themeButton = $('<button></button>').attr(
        'id',
        'uniq_ids-theme_button',
      )
        .html(`<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" class="bi bi-sun" viewBox="0 0 16 16">
  <g><title>Сменить тему</title><path d="M8 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm0 1a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0zm0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13zm8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5zM3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8zm10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0zm-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0zm9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707zM4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .708z"/>
</g></svg>`);

      // переключение темы
      $themeButton.on('click', () => {
        const newTheme = $settings.theme === 'dark' ? 'light' : 'dark';
        $floatWindow.attr('theme', newTheme);
        $settings.theme = newTheme;
      });
      $header.append($themeButton);

      let $content = $('<div></div>').attr('id', 'uniq_ids-content');
      let $table = $('<table></table>');

      parseItems($itemList, $table);

      $content.append($table);
      $floatWindow.append($header);
      $floatWindow.append($content);
      $('body').append($floatWindow);

      // реализация перетаскивания
      let isDragging = false;
      let offsetX = 0;
      let offsetY = 0;

      $header.on('mousedown', (e) => {
        isDragging = true;
        offsetX = e.clientX - $floatWindow.offset().left;
        offsetY = e.clientY - $floatWindow.offset().top;
        $('body').css('userSelect', 'none');
      });

      $(document).on('mousemove', (e) => {
        if (isDragging) {
          $floatWindow.css({
            left: `${e.clientX - offsetX}px`,
            top: `${e.clientY - offsetY}px`,
          });
        }
      });

      $(document).on('mouseup', () => {
        $settings.window.top = $floatWindow.offset().top;
        $settings.window.left = $floatWindow.offset().left;
        saveSettings();
        isDragging = false;
        $('body').css('userSelect', '');
      });

      window.addEventListener('beforeunload', () => {
        $settings.window.width = $floatWindow.width();
        $settings.window.height = $floatWindow.height();
        saveSettings();
      });

      // добавление наблюдателя для элемента #itemList
      let observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList' || mutation.type === 'attributes') {
            $table.empty();
            parseItems($itemList, $table);
          }
        });
      });

      observer.observe($itemList[0], {
        childList: true,
        attributes: false,
        subtree: true,
      });
    }

    /**
     * Парсинг данных из itemList
     * @param $table Таблица, в которую будут добавлены данные
     * @param $itemList Список предметов
     */
    function parseItems($itemList, $table) {
      let $items = $itemList.find('.itemInMouth');
      let imageToIdsMap = new Map();

      $items.each(function () {
        const $item = $(this);
        let id = $item.attr('id');
        let $img = $item.find('img');
        let src = $img.length > 0 ? $img[0].src : null;

        if (src) {
          if (!imageToIdsMap.has(src)) {
            imageToIdsMap.set(src, []);
          }
          imageToIdsMap.get(src).push(id);
        }
      });

      // заполняем таблицу
      imageToIdsMap.forEach((ids, src) => {
        let $row = $('<tr></tr>');

        let $imgElement = $('<img />').attr('src', src);

        let $copyButton = $('<button></button>')
          .addClass('uniq_ids-copy-button')
          .html(baseClipboard);

        $copyButton.on('click', () => {
          $('.uniq_ids-copy-button').html(baseClipboard);
          navigator.clipboard.writeText(ids.join('\n')).then(() => {
            $copyButton.html(fillClipboard);
          });
        });

        $row.append($('<td></td>').append($imgElement));
        $row.append($('<td></td>').text(ids.join(', ')));
        $row.append($('<td></td>').append($copyButton));
        $table.append($row);
      });
    }

    observer.observe(document, { childList: true, subtree: true });
  });
})(window.jQuery, window, document);
