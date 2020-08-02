'use strict';

document.addEventListener('DOMContentLoaded', function() {
  let tabHandler = new Event('tabHandler');

  let swipers = initSwiper();
  svg4everybody();
  initMainSwiper();
  initHeaderToggler();
  initAlbumsCardSlider();
  accordion();
  initAlbumsTypeSlider();
  tab(tabHandler);

  document.addEventListener('tabHandler', function() {
    if ( !swipers.length ) {
      return;
    }

    swipers.forEach(swiper => {
      swiper.update();
    });

  }, false);

  if ( window.innerWidth < 768 ) {
    initMainCardsSlider();
  }
});

function initHeaderToggler() {
  let toggler = document.querySelector('.js-header-toggler');
  let header = document.querySelector('.js-header');
  let pageWrap = document.querySelector('.js-page-wrap');
  let darkness = document.querySelector('.js-header-darkness');

  if ( toggler && header && pageWrap && darkness ) {
    toggler.addEventListener('click', function() {
      header.classList.toggle('is-open');
      toggler.classList.toggle('is-active');
      pageWrap.classList.toggle('scroll-blocked-mobile');
    });

    darkness.addEventListener('click', function() {
      header.classList.remove('is-open');
      toggler.classList.remove('is-active');
      pageWrap.classList.remove('scroll-blocked-mobile');
    });
  }
}

function initAlbumsCardSlider() {
  var mySwiper = new Swiper('.js-albums-card-slider', {
    speed: 400,
    slidesPerView: 1,
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
  });

  return mySwiper;
}

function initSwiper() {
  var mySwiper = new Swiper('.js-swiper-container', {
    speed: 400,
    slidesPerView: 6,
    spaceBetween: 40,
    loop: true,
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
    breakpoints: {
      459: {
        slidesPerView: 1,
      },
      599: {
        slidesPerView: 2,
      },
      767: {
        slidesPerView: 3,
      },
      1199: {
        slidesPerView: 4,
      },
    }
  });

  return mySwiper;
}

function initMainSwiper() {
  var mySwiper = new Swiper('.js-main-swiper-container', {
    speed: 400,
    slidesPerView: 1,
    loop: true,
    spaceBetween: 12,
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

function initAlbumsTypeSlider() {
  var mySwiper = new Swiper('.js-type-albums-swiper', {
    speed: 400,
    slidesPerView: 'auto',
    spaceBetween: 24,
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
  });

  return mySwiper;
}

function initMainCardsSlider() {
  var mySwiper = new Swiper('.js-main-card-slider', {
    speed: 400,
    slidesPerView: 1,
    loop: true,
    spaceBetween: 12,
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
  });

  return mySwiper;
}

function tab(tabHandler) {
    let tabsContainer = document.querySelector(".js-tab-container");

    if ( tabsContainer ) {
      let menuItems = tabsContainer.querySelectorAll(".js-tab-menu-item");
      let underline = tabsContainer.querySelector(".js-tab-underline");

      menuItems.forEach( (menuItem) => {
        if ( underline && menuItem.classList.contains("is-active") ) {
          setTimeout(() => {
            currentTabAccent(underline, menuItem);
          }, 100);
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

          if ( tabHandler ) {
            document.dispatchEvent(tabHandler);
          }
        };
      });
    }

  function currentTabAccent(underline, menuItem) {
    let itemPosition = menuItem.offsetLeft;
    let itemWidth = Number(menuItem.scrollWidth);

    return underline.setAttribute("style", `left: ${itemPosition}px; width: ${itemWidth}px;`);
  }

  function getActiveTab(element) {
    return element.classList.contains("is-active");
  }
}

function accordion() {
  let wrapper = document.querySelectorAll('.js-accordion');
  wrapper.forEach(wrapperItem => {
    let items = wrapperItem.querySelectorAll('.js-accordion-item');
    let individual = wrapperItem.getAttribute('individual') && wrapperItem.getAttribute('individual') !== 'false';

    items.forEach(item => {
      if ( item.classList.contains('is-active') ) {
        setTimeout(() => {
          let readyContent = item.querySelector('.js-accordion-content');
          let readyContentHeight = readyContent.scrollHeight;

          readyContent.style.maxHeight = readyContentHeight + 'px';
        }, 100);
      }

      let subItems = item.querySelectorAll('.js-accordion-subitem');

      for (const subItem of subItems) {
        if ( subItem.classList.contains('is-active') ) {
          setTimeout(() => {
            let readyContent = subItem.querySelector('.js-accordion-content');
            let readyContentHeight = readyContent.scrollHeight;
  
            readyContent.style.maxHeight = readyContentHeight + 'px';
          }, 100);
        }
      }

      itemIteration(item, items, individual);

      subItems.forEach(subitem => {
        itemIteration(subitem, subItems, individual, true)
      });
    })
  })
}

function itemIteration(item, items, individual, isSubitem) {
  let init = item.querySelector('.js-accordion-init');
  let content = item.querySelector('.js-accordion-content');

  if ( isSubitem === true ) {
    content.addEventListener('transitionend', function() {
      let parentItem = item.closest('.js-accordion-item');
      let parentContentHeight = parentItem.scrollHeight + 'px';
      let parentContent = parentItem.querySelector('.js-accordion-content');

      parentContent.setAttribute('style', `max-height: ${parentContentHeight}`);
    });
  }

  init.addEventListener('click', function() {
    if ( item.classList.contains('is-active') ) {
      item.classList.remove('is-active');
      content.style.maxHeight = '0px';

      return false
    }

    if ( isSubitem === true ) {
      let parentItem = item.closest('.js-accordion-item');
      let parentContent = parentItem.querySelector('.js-accordion-content');

      parentContent.setAttribute('style', `max-height: none`);
    }

    if ( individual ) {
      items.forEach((elem) => {
        let elemContent = elem.querySelector('.js-accordion-content');
        elem.classList.remove('is-active');
        elemContent.style.maxHeight = 0 + 'px';
      })
    }

    item.classList.add('is-active');
    content.style.maxHeight = content.scrollHeight + 'px';
  });
}
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0JztcblxuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIGZ1bmN0aW9uKCkge1xuICBsZXQgdGFiSGFuZGxlciA9IG5ldyBFdmVudCgndGFiSGFuZGxlcicpO1xuXG4gIGxldCBzd2lwZXJzID0gaW5pdFN3aXBlcigpO1xuICBzdmc0ZXZlcnlib2R5KCk7XG4gIGluaXRNYWluU3dpcGVyKCk7XG4gIGluaXRIZWFkZXJUb2dnbGVyKCk7XG4gIGluaXRBbGJ1bXNDYXJkU2xpZGVyKCk7XG4gIGFjY29yZGlvbigpO1xuICBpbml0QWxidW1zVHlwZVNsaWRlcigpO1xuICB0YWIodGFiSGFuZGxlcik7XG5cbiAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigndGFiSGFuZGxlcicsIGZ1bmN0aW9uKCkge1xuICAgIGlmICggIXN3aXBlcnMubGVuZ3RoICkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHN3aXBlcnMuZm9yRWFjaChzd2lwZXIgPT4ge1xuICAgICAgc3dpcGVyLnVwZGF0ZSgpO1xuICAgIH0pO1xuXG4gIH0sIGZhbHNlKTtcblxuICBpZiAoIHdpbmRvdy5pbm5lcldpZHRoIDwgNzY4ICkge1xuICAgIGluaXRNYWluQ2FyZHNTbGlkZXIoKTtcbiAgfVxufSk7XG5cbmZ1bmN0aW9uIGluaXRIZWFkZXJUb2dnbGVyKCkge1xuICBsZXQgdG9nZ2xlciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy1oZWFkZXItdG9nZ2xlcicpO1xuICBsZXQgaGVhZGVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLWhlYWRlcicpO1xuICBsZXQgcGFnZVdyYXAgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtcGFnZS13cmFwJyk7XG4gIGxldCBkYXJrbmVzcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy1oZWFkZXItZGFya25lc3MnKTtcblxuICBpZiAoIHRvZ2dsZXIgJiYgaGVhZGVyICYmIHBhZ2VXcmFwICYmIGRhcmtuZXNzICkge1xuICAgIHRvZ2dsZXIuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbigpIHtcbiAgICAgIGhlYWRlci5jbGFzc0xpc3QudG9nZ2xlKCdpcy1vcGVuJyk7XG4gICAgICB0b2dnbGVyLmNsYXNzTGlzdC50b2dnbGUoJ2lzLWFjdGl2ZScpO1xuICAgICAgcGFnZVdyYXAuY2xhc3NMaXN0LnRvZ2dsZSgnc2Nyb2xsLWJsb2NrZWQtbW9iaWxlJyk7XG4gICAgfSk7XG5cbiAgICBkYXJrbmVzcy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKCkge1xuICAgICAgaGVhZGVyLmNsYXNzTGlzdC5yZW1vdmUoJ2lzLW9wZW4nKTtcbiAgICAgIHRvZ2dsZXIuY2xhc3NMaXN0LnJlbW92ZSgnaXMtYWN0aXZlJyk7XG4gICAgICBwYWdlV3JhcC5jbGFzc0xpc3QucmVtb3ZlKCdzY3JvbGwtYmxvY2tlZC1tb2JpbGUnKTtcbiAgICB9KTtcbiAgfVxufVxuXG5mdW5jdGlvbiBpbml0QWxidW1zQ2FyZFNsaWRlcigpIHtcbiAgdmFyIG15U3dpcGVyID0gbmV3IFN3aXBlcignLmpzLWFsYnVtcy1jYXJkLXNsaWRlcicsIHtcbiAgICBzcGVlZDogNDAwLFxuICAgIHNsaWRlc1BlclZpZXc6IDEsXG4gICAgbmF2aWdhdGlvbjoge1xuICAgICAgbmV4dEVsOiAnLnN3aXBlci1idXR0b24tbmV4dCcsXG4gICAgICBwcmV2RWw6ICcuc3dpcGVyLWJ1dHRvbi1wcmV2JyxcbiAgICB9LFxuICB9KTtcblxuICByZXR1cm4gbXlTd2lwZXI7XG59XG5cbmZ1bmN0aW9uIGluaXRTd2lwZXIoKSB7XG4gIHZhciBteVN3aXBlciA9IG5ldyBTd2lwZXIoJy5qcy1zd2lwZXItY29udGFpbmVyJywge1xuICAgIHNwZWVkOiA0MDAsXG4gICAgc2xpZGVzUGVyVmlldzogNixcbiAgICBzcGFjZUJldHdlZW46IDQwLFxuICAgIGxvb3A6IHRydWUsXG4gICAgbmF2aWdhdGlvbjoge1xuICAgICAgbmV4dEVsOiAnLnN3aXBlci1idXR0b24tbmV4dCcsXG4gICAgICBwcmV2RWw6ICcuc3dpcGVyLWJ1dHRvbi1wcmV2JyxcbiAgICB9LFxuICAgIGJyZWFrcG9pbnRzOiB7XG4gICAgICA0NTk6IHtcbiAgICAgICAgc2xpZGVzUGVyVmlldzogMSxcbiAgICAgIH0sXG4gICAgICA1OTk6IHtcbiAgICAgICAgc2xpZGVzUGVyVmlldzogMixcbiAgICAgIH0sXG4gICAgICA3Njc6IHtcbiAgICAgICAgc2xpZGVzUGVyVmlldzogMyxcbiAgICAgIH0sXG4gICAgICAxMTk5OiB7XG4gICAgICAgIHNsaWRlc1BlclZpZXc6IDQsXG4gICAgICB9LFxuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIG15U3dpcGVyO1xufVxuXG5mdW5jdGlvbiBpbml0TWFpblN3aXBlcigpIHtcbiAgdmFyIG15U3dpcGVyID0gbmV3IFN3aXBlcignLmpzLW1haW4tc3dpcGVyLWNvbnRhaW5lcicsIHtcbiAgICBzcGVlZDogNDAwLFxuICAgIHNsaWRlc1BlclZpZXc6IDEsXG4gICAgbG9vcDogdHJ1ZSxcbiAgICBzcGFjZUJldHdlZW46IDEyLFxuICAgIHBhZ2luYXRpb246IHtcbiAgICAgIGVsOiAnLnN3aXBlci1wYWdpbmF0aW9uJyxcbiAgICAgIHR5cGU6ICdidWxsZXRzJyxcbiAgICAgIGNsaWNrYWJsZTogdHJ1ZVxuICAgIH0sXG4gICAgbmF2aWdhdGlvbjoge1xuICAgICAgbmV4dEVsOiAnLnN3aXBlci1idXR0b24tbmV4dCcsXG4gICAgICBwcmV2RWw6ICcuc3dpcGVyLWJ1dHRvbi1wcmV2JyxcbiAgICB9LFxuICB9KTtcblxuICByZXR1cm4gbXlTd2lwZXI7XG59XG5cbmZ1bmN0aW9uIGluaXRBbGJ1bXNUeXBlU2xpZGVyKCkge1xuICB2YXIgbXlTd2lwZXIgPSBuZXcgU3dpcGVyKCcuanMtdHlwZS1hbGJ1bXMtc3dpcGVyJywge1xuICAgIHNwZWVkOiA0MDAsXG4gICAgc2xpZGVzUGVyVmlldzogJ2F1dG8nLFxuICAgIHNwYWNlQmV0d2VlbjogMjQsXG4gICAgbmF2aWdhdGlvbjoge1xuICAgICAgbmV4dEVsOiAnLnN3aXBlci1idXR0b24tbmV4dCcsXG4gICAgICBwcmV2RWw6ICcuc3dpcGVyLWJ1dHRvbi1wcmV2JyxcbiAgICB9LFxuICB9KTtcblxuICByZXR1cm4gbXlTd2lwZXI7XG59XG5cbmZ1bmN0aW9uIGluaXRNYWluQ2FyZHNTbGlkZXIoKSB7XG4gIHZhciBteVN3aXBlciA9IG5ldyBTd2lwZXIoJy5qcy1tYWluLWNhcmQtc2xpZGVyJywge1xuICAgIHNwZWVkOiA0MDAsXG4gICAgc2xpZGVzUGVyVmlldzogMSxcbiAgICBsb29wOiB0cnVlLFxuICAgIHNwYWNlQmV0d2VlbjogMTIsXG4gICAgbmF2aWdhdGlvbjoge1xuICAgICAgbmV4dEVsOiAnLnN3aXBlci1idXR0b24tbmV4dCcsXG4gICAgICBwcmV2RWw6ICcuc3dpcGVyLWJ1dHRvbi1wcmV2JyxcbiAgICB9LFxuICB9KTtcblxuICByZXR1cm4gbXlTd2lwZXI7XG59XG5cbmZ1bmN0aW9uIHRhYih0YWJIYW5kbGVyKSB7XG4gICAgbGV0IHRhYnNDb250YWluZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmpzLXRhYi1jb250YWluZXJcIik7XG5cbiAgICBpZiAoIHRhYnNDb250YWluZXIgKSB7XG4gICAgICBsZXQgbWVudUl0ZW1zID0gdGFic0NvbnRhaW5lci5xdWVyeVNlbGVjdG9yQWxsKFwiLmpzLXRhYi1tZW51LWl0ZW1cIik7XG4gICAgICBsZXQgdW5kZXJsaW5lID0gdGFic0NvbnRhaW5lci5xdWVyeVNlbGVjdG9yKFwiLmpzLXRhYi11bmRlcmxpbmVcIik7XG5cbiAgICAgIG1lbnVJdGVtcy5mb3JFYWNoKCAobWVudUl0ZW0pID0+IHtcbiAgICAgICAgaWYgKCB1bmRlcmxpbmUgJiYgbWVudUl0ZW0uY2xhc3NMaXN0LmNvbnRhaW5zKFwiaXMtYWN0aXZlXCIpICkge1xuICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgY3VycmVudFRhYkFjY2VudCh1bmRlcmxpbmUsIG1lbnVJdGVtKTtcbiAgICAgICAgICB9LCAxMDApO1xuICAgICAgICB9XG5cbiAgICAgICAgbWVudUl0ZW0ub25jbGljayA9ICgpID0+IHtcbiAgICAgICAgICBsZXQgYWN0aXZlTWVudUl0ZW0gPSBBcnJheS5mcm9tKG1lbnVJdGVtcykuZmluZChnZXRBY3RpdmVUYWIpO1xuICAgICAgICAgIGxldCBhY3RpdmVDb250ZW50SXRlbSA9IHRhYnNDb250YWluZXIucXVlcnlTZWxlY3RvcihhY3RpdmVNZW51SXRlbS5kYXRhc2V0LnRhcmdldCk7XG4gICAgICAgICAgbGV0IGN1cnJlbnRDb250ZW50SXRlbSA9IHRhYnNDb250YWluZXIucXVlcnlTZWxlY3RvcihtZW51SXRlbS5kYXRhc2V0LnRhcmdldCk7XG5cbiAgICAgICAgICBhY3RpdmVNZW51SXRlbS5jbGFzc0xpc3QucmVtb3ZlKFwiaXMtYWN0aXZlXCIpO1xuXG4gICAgICAgICAgaWYgKCBhY3RpdmVDb250ZW50SXRlbSApIHtcbiAgICAgICAgICAgIGFjdGl2ZUNvbnRlbnRJdGVtLmNsYXNzTGlzdC5yZW1vdmUoXCJpcy1hY3RpdmVcIik7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKCBjdXJyZW50Q29udGVudEl0ZW0gKSB7XG4gICAgICAgICAgICBjdXJyZW50Q29udGVudEl0ZW0uY2xhc3NMaXN0LmFkZChcImlzLWFjdGl2ZVwiKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBtZW51SXRlbS5jbGFzc0xpc3QuYWRkKFwiaXMtYWN0aXZlXCIpO1xuXG4gICAgICAgICAgaWYgKCB1bmRlcmxpbmUgKSB7XG4gICAgICAgICAgICBjdXJyZW50VGFiQWNjZW50KHVuZGVybGluZSwgbWVudUl0ZW0pO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmICggdGFiSGFuZGxlciApIHtcbiAgICAgICAgICAgIGRvY3VtZW50LmRpc3BhdGNoRXZlbnQodGFiSGFuZGxlcik7XG4gICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgfSk7XG4gICAgfVxuXG4gIGZ1bmN0aW9uIGN1cnJlbnRUYWJBY2NlbnQodW5kZXJsaW5lLCBtZW51SXRlbSkge1xuICAgIGxldCBpdGVtUG9zaXRpb24gPSBtZW51SXRlbS5vZmZzZXRMZWZ0O1xuICAgIGxldCBpdGVtV2lkdGggPSBOdW1iZXIobWVudUl0ZW0uc2Nyb2xsV2lkdGgpO1xuXG4gICAgcmV0dXJuIHVuZGVybGluZS5zZXRBdHRyaWJ1dGUoXCJzdHlsZVwiLCBgbGVmdDogJHtpdGVtUG9zaXRpb259cHg7IHdpZHRoOiAke2l0ZW1XaWR0aH1weDtgKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGdldEFjdGl2ZVRhYihlbGVtZW50KSB7XG4gICAgcmV0dXJuIGVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKFwiaXMtYWN0aXZlXCIpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGFjY29yZGlvbigpIHtcbiAgbGV0IHdyYXBwZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuanMtYWNjb3JkaW9uJyk7XG4gIHdyYXBwZXIuZm9yRWFjaCh3cmFwcGVySXRlbSA9PiB7XG4gICAgbGV0IGl0ZW1zID0gd3JhcHBlckl0ZW0ucXVlcnlTZWxlY3RvckFsbCgnLmpzLWFjY29yZGlvbi1pdGVtJyk7XG4gICAgbGV0IGluZGl2aWR1YWwgPSB3cmFwcGVySXRlbS5nZXRBdHRyaWJ1dGUoJ2luZGl2aWR1YWwnKSAmJiB3cmFwcGVySXRlbS5nZXRBdHRyaWJ1dGUoJ2luZGl2aWR1YWwnKSAhPT0gJ2ZhbHNlJztcblxuICAgIGl0ZW1zLmZvckVhY2goaXRlbSA9PiB7XG4gICAgICBpZiAoIGl0ZW0uY2xhc3NMaXN0LmNvbnRhaW5zKCdpcy1hY3RpdmUnKSApIHtcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgbGV0IHJlYWR5Q29udGVudCA9IGl0ZW0ucXVlcnlTZWxlY3RvcignLmpzLWFjY29yZGlvbi1jb250ZW50Jyk7XG4gICAgICAgICAgbGV0IHJlYWR5Q29udGVudEhlaWdodCA9IHJlYWR5Q29udGVudC5zY3JvbGxIZWlnaHQ7XG5cbiAgICAgICAgICByZWFkeUNvbnRlbnQuc3R5bGUubWF4SGVpZ2h0ID0gcmVhZHlDb250ZW50SGVpZ2h0ICsgJ3B4JztcbiAgICAgICAgfSwgMTAwKTtcbiAgICAgIH1cblxuICAgICAgbGV0IHN1Ykl0ZW1zID0gaXRlbS5xdWVyeVNlbGVjdG9yQWxsKCcuanMtYWNjb3JkaW9uLXN1Yml0ZW0nKTtcblxuICAgICAgZm9yIChjb25zdCBzdWJJdGVtIG9mIHN1Ykl0ZW1zKSB7XG4gICAgICAgIGlmICggc3ViSXRlbS5jbGFzc0xpc3QuY29udGFpbnMoJ2lzLWFjdGl2ZScpICkge1xuICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgbGV0IHJlYWR5Q29udGVudCA9IHN1Ykl0ZW0ucXVlcnlTZWxlY3RvcignLmpzLWFjY29yZGlvbi1jb250ZW50Jyk7XG4gICAgICAgICAgICBsZXQgcmVhZHlDb250ZW50SGVpZ2h0ID0gcmVhZHlDb250ZW50LnNjcm9sbEhlaWdodDtcbiAgXG4gICAgICAgICAgICByZWFkeUNvbnRlbnQuc3R5bGUubWF4SGVpZ2h0ID0gcmVhZHlDb250ZW50SGVpZ2h0ICsgJ3B4JztcbiAgICAgICAgICB9LCAxMDApO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGl0ZW1JdGVyYXRpb24oaXRlbSwgaXRlbXMsIGluZGl2aWR1YWwpO1xuXG4gICAgICBzdWJJdGVtcy5mb3JFYWNoKHN1Yml0ZW0gPT4ge1xuICAgICAgICBpdGVtSXRlcmF0aW9uKHN1Yml0ZW0sIHN1Ykl0ZW1zLCBpbmRpdmlkdWFsLCB0cnVlKVxuICAgICAgfSk7XG4gICAgfSlcbiAgfSlcbn1cblxuZnVuY3Rpb24gaXRlbUl0ZXJhdGlvbihpdGVtLCBpdGVtcywgaW5kaXZpZHVhbCwgaXNTdWJpdGVtKSB7XG4gIGxldCBpbml0ID0gaXRlbS5xdWVyeVNlbGVjdG9yKCcuanMtYWNjb3JkaW9uLWluaXQnKTtcbiAgbGV0IGNvbnRlbnQgPSBpdGVtLnF1ZXJ5U2VsZWN0b3IoJy5qcy1hY2NvcmRpb24tY29udGVudCcpO1xuXG4gIGlmICggaXNTdWJpdGVtID09PSB0cnVlICkge1xuICAgIGNvbnRlbnQuYWRkRXZlbnRMaXN0ZW5lcigndHJhbnNpdGlvbmVuZCcsIGZ1bmN0aW9uKCkge1xuICAgICAgbGV0IHBhcmVudEl0ZW0gPSBpdGVtLmNsb3Nlc3QoJy5qcy1hY2NvcmRpb24taXRlbScpO1xuICAgICAgbGV0IHBhcmVudENvbnRlbnRIZWlnaHQgPSBwYXJlbnRJdGVtLnNjcm9sbEhlaWdodCArICdweCc7XG4gICAgICBsZXQgcGFyZW50Q29udGVudCA9IHBhcmVudEl0ZW0ucXVlcnlTZWxlY3RvcignLmpzLWFjY29yZGlvbi1jb250ZW50Jyk7XG5cbiAgICAgIHBhcmVudENvbnRlbnQuc2V0QXR0cmlidXRlKCdzdHlsZScsIGBtYXgtaGVpZ2h0OiAke3BhcmVudENvbnRlbnRIZWlnaHR9YCk7XG4gICAgfSk7XG4gIH1cblxuICBpbml0LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oKSB7XG4gICAgaWYgKCBpdGVtLmNsYXNzTGlzdC5jb250YWlucygnaXMtYWN0aXZlJykgKSB7XG4gICAgICBpdGVtLmNsYXNzTGlzdC5yZW1vdmUoJ2lzLWFjdGl2ZScpO1xuICAgICAgY29udGVudC5zdHlsZS5tYXhIZWlnaHQgPSAnMHB4JztcblxuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuXG4gICAgaWYgKCBpc1N1Yml0ZW0gPT09IHRydWUgKSB7XG4gICAgICBsZXQgcGFyZW50SXRlbSA9IGl0ZW0uY2xvc2VzdCgnLmpzLWFjY29yZGlvbi1pdGVtJyk7XG4gICAgICBsZXQgcGFyZW50Q29udGVudCA9IHBhcmVudEl0ZW0ucXVlcnlTZWxlY3RvcignLmpzLWFjY29yZGlvbi1jb250ZW50Jyk7XG5cbiAgICAgIHBhcmVudENvbnRlbnQuc2V0QXR0cmlidXRlKCdzdHlsZScsIGBtYXgtaGVpZ2h0OiBub25lYCk7XG4gICAgfVxuXG4gICAgaWYgKCBpbmRpdmlkdWFsICkge1xuICAgICAgaXRlbXMuZm9yRWFjaCgoZWxlbSkgPT4ge1xuICAgICAgICBsZXQgZWxlbUNvbnRlbnQgPSBlbGVtLnF1ZXJ5U2VsZWN0b3IoJy5qcy1hY2NvcmRpb24tY29udGVudCcpO1xuICAgICAgICBlbGVtLmNsYXNzTGlzdC5yZW1vdmUoJ2lzLWFjdGl2ZScpO1xuICAgICAgICBlbGVtQ29udGVudC5zdHlsZS5tYXhIZWlnaHQgPSAwICsgJ3B4JztcbiAgICAgIH0pXG4gICAgfVxuXG4gICAgaXRlbS5jbGFzc0xpc3QuYWRkKCdpcy1hY3RpdmUnKTtcbiAgICBjb250ZW50LnN0eWxlLm1heEhlaWdodCA9IGNvbnRlbnQuc2Nyb2xsSGVpZ2h0ICsgJ3B4JztcbiAgfSk7XG59Il19
