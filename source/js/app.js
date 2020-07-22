'use strict';

document.addEventListener('DOMContentLoaded', function() {
  svg4everybody();
  initSwiper();
  initMainSwiper();
  tab();
});

function initSwiper() {
  var mySwiper = new Swiper('.js-swiper-container', {
    speed: 400,
    slidesPerView: 6,
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
  });

  return mySwiper;
}
function initMainSwiper() {
  var mySwiper = new Swiper('.js-main-swiper-container', {
    speed: 400,
    slidesPerView: 1,
    pagination: {
      el: '.swiper-pagination',
      type: 'bullets',
      clickable: true
    },
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
  });

  return mySwiper;
}

function tab() {
    let tabsContainer = document.querySelector(".js-tab-container");

    if ( tabsContainer ) {
      let menuItems = tabsContainer.querySelectorAll(".js-tab-menu-item");
      let underline = tabsContainer.querySelector(".js-tab-underline");

      menuItems.forEach( (menuItem) => {
        if ( underline && menuItem.classList.contains("is-active") ) {
          currentTabAccent(underline, menuItem);
        }

        menuItem.onclick = () => {
          let activeMenuItem = Array.from(menuItems).find(getActiveTab);
          let activeContentItem = tabsContainer.querySelector(activeMenuItem.dataset.target);
          let currentContentItem = tabsContainer.querySelector(menuItem.dataset.target);

          activeMenuItem.classList.remove("is-active");

          if ( activeContentItem ) {
            activeContentItem.classList.remove("is-active");
          }

          if ( currentContentItem ) {
            currentContentItem.classList.add("is-active");
          }

          menuItem.classList.add("is-active");

          if ( underline ) {
            currentTabAccent(underline, menuItem);
          }
        };
      });
    }

  function currentTabAccent(underline, menuItem) {
    let trueStyles = window.getComputedStyle(menuItem);
    let itemPosition = menuItem.offsetLeft;
    let itemWidth = Number(trueStyles.width.split("px")[0]);
    let itemPaddingLeft = Number(trueStyles.paddingLeft.split("px")[0]);
    let itemPaddingRight = Number(trueStyles.paddingRight.split("px")[0]);

    return underline.setAttribute("style", `left: ${itemPosition + itemPaddingLeft}px; width: ${itemWidth - itemPaddingLeft - itemPaddingRight}px;`);
  }

  function getActiveTab(element) {
    return element.classList.contains("is-active");
  }
}