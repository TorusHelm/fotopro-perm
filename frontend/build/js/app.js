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
  initSwiperStatick();
  initAlbumSlider();
  tab(tabHandler);
  initRange();
  initDragNDrop();

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

function initDragNDrop() {
  let container = document.querySelector('.js-calculate-file');
  let dropArea = document.querySelector('.js-calculate-file-droparea');
  let fileElem = document.querySelector('.js-calculate-file-input');
  let addings = document.querySelector('.js-calculate-file-addings');
  let fileName = document.querySelector('.js-calculate-file-name');
  let remover = document.querySelector('.js-calculate-file-remover');

  if ( !container && !dropArea && !fileElem && !addings && !fileName && !remover ) {
    return;
  }

  function preventDefaults (e) {
    e.preventDefault();
    e.stopPropagation();
  };

  function highlight() {
    container.classList.add('highlight');
  };

  function unhighlight() {
    container.classList.remove('highlight');
  };

  function handleFiles(files) {
    addings.classList.add('is-show');
    container.classList.add('has-result');
    fileName.textContent = files[0].name;
  };

  function handleRemoveFiles() {
    addings.classList.remove('is-show');
    container.classList.remove('has-result');
    fileName.textContent = '';
    fileElem.value = '';
  };

  function handleDrop(e) {
    let dt = e.dataTransfer;
    let files = dt.files;

    if ( Validate(this) ) {
      handleFiles(files);
    }
  };

  fileElem.addEventListener('change', function() {
    if ( Validate(this) ) {
      handleFiles(this.files);
    }
  });

  remover.addEventListener('click', function() {
    handleRemoveFiles();
  });

  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, preventDefaults, false);
  });

  ['dragenter', 'dragover'].forEach(eventName => {
    dropArea.addEventListener(eventName, highlight, false);
  });
  
  ['dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, unhighlight, false);
  });

  dropArea.addEventListener('drop', handleDrop, false);

  var _validFileExtensions = ['.zip', '.rar'];

  function Validate(input) {
    var sFileName = input.value;

    if (sFileName.length > 0) {
      var blnValid = false;
      for (var j = 0; j < _validFileExtensions.length; j++) {
        var sCurExtension = _validFileExtensions[j];
        if (sFileName.substr(sFileName.length - sCurExtension.length, sCurExtension.length).toLowerCase() == sCurExtension.toLowerCase()) {
          blnValid = true;
          break;
        }
      }

      if (!blnValid) {
        container.classList.add('has-error');

        setTimeout(function() {
          container.classList.remove('has-error');
        }, 2000)

        return false;
      }
    }

    return true;
  }
}

function initRange() {
  var sliders = document.querySelectorAll('.js-range');

  if ( sliders.length ) {
    for (const slider of sliders) {
      let sliderStep = Number(slider.dataset.step);
      let sliderMin = Number(slider.dataset.min);
      let sliderMax = Number(slider.dataset.max);
      let sliderPips = Number(slider.dataset.pips);

      noUiSlider.create(slider, {
        start: [0],
        step: sliderStep,
        range: {
          'min': sliderMin,
          'max': sliderMax
        },
        connect: 'lower',
        tooltips: true,
        format: wNumb({
          decimals: 3,
          thousand: '.',
        }),
        pips: {
          mode: 'count',
          values: sliderPips,
          stepped: false
        }
      });

      let miniMarkers = slider.querySelectorAll('.noUi-marker-horizontal.noUi-marker');

      if ( miniMarkers.length ) {
        for ( const miniMarker of miniMarkers ) {
          miniMarker.remove();
        }
      }
    }
  }
}

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

function initAlbumSlider() {
  var mySwiper = new Swiper('.js-swiper-album', {
    speed: 400,
    slidesPerView: 1,
    loop: false,
    preloadImages: false,
    spaceBetween: 12,
    lazy: true,
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
    loop: false,
    preloadImages: false,
    lazy: true, 
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

function initSwiperStatick() {
  var mySwiper = new Swiper('.js-swiper-container-statick', {
    speed: 400,
    slidesPerView: 6,
    spaceBetween: 40,
    loop: false,
    preloadImages: false,
    lazy: true,
    followFinger: false,
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
    slidesOffsetAfter: 100,
    spaceBetween: 24,
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
    on: {
      slideChange: function () {
        if ( this.activeIndex > 0 ) {
          this.el.classList.add('not-on-start');
        } else {
          this.el.classList.remove('not-on-start');
        }
      },
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG5cbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBmdW5jdGlvbigpIHtcbiAgbGV0IHRhYkhhbmRsZXIgPSBuZXcgRXZlbnQoJ3RhYkhhbmRsZXInKTtcblxuICBsZXQgc3dpcGVycyA9IGluaXRTd2lwZXIoKTtcbiAgc3ZnNGV2ZXJ5Ym9keSgpO1xuICBpbml0TWFpblN3aXBlcigpO1xuICBpbml0SGVhZGVyVG9nZ2xlcigpO1xuICBpbml0QWxidW1zQ2FyZFNsaWRlcigpO1xuICBhY2NvcmRpb24oKTtcbiAgaW5pdEFsYnVtc1R5cGVTbGlkZXIoKTtcbiAgaW5pdFN3aXBlclN0YXRpY2soKTtcbiAgaW5pdEFsYnVtU2xpZGVyKCk7XG4gIHRhYih0YWJIYW5kbGVyKTtcbiAgaW5pdFJhbmdlKCk7XG4gIGluaXREcmFnTkRyb3AoKTtcblxuICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCd0YWJIYW5kbGVyJywgZnVuY3Rpb24oKSB7XG4gICAgaWYgKCAhc3dpcGVycy5sZW5ndGggKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgc3dpcGVycy5mb3JFYWNoKHN3aXBlciA9PiB7XG4gICAgICBzd2lwZXIudXBkYXRlKCk7XG4gICAgfSk7XG5cbiAgfSwgZmFsc2UpO1xuXG4gIGlmICggd2luZG93LmlubmVyV2lkdGggPCA3NjggKSB7XG4gICAgaW5pdE1haW5DYXJkc1NsaWRlcigpO1xuICB9XG59KTtcblxuZnVuY3Rpb24gaW5pdERyYWdORHJvcCgpIHtcbiAgbGV0IGNvbnRhaW5lciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy1jYWxjdWxhdGUtZmlsZScpO1xuICBsZXQgZHJvcEFyZWEgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtY2FsY3VsYXRlLWZpbGUtZHJvcGFyZWEnKTtcbiAgbGV0IGZpbGVFbGVtID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLWNhbGN1bGF0ZS1maWxlLWlucHV0Jyk7XG4gIGxldCBhZGRpbmdzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLWNhbGN1bGF0ZS1maWxlLWFkZGluZ3MnKTtcbiAgbGV0IGZpbGVOYW1lID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLWNhbGN1bGF0ZS1maWxlLW5hbWUnKTtcbiAgbGV0IHJlbW92ZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtY2FsY3VsYXRlLWZpbGUtcmVtb3ZlcicpO1xuXG4gIGlmICggIWNvbnRhaW5lciAmJiAhZHJvcEFyZWEgJiYgIWZpbGVFbGVtICYmICFhZGRpbmdzICYmICFmaWxlTmFtZSAmJiAhcmVtb3ZlciApIHtcbiAgICByZXR1cm47XG4gIH1cblxuICBmdW5jdGlvbiBwcmV2ZW50RGVmYXVsdHMgKGUpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgfTtcblxuICBmdW5jdGlvbiBoaWdobGlnaHQoKSB7XG4gICAgY29udGFpbmVyLmNsYXNzTGlzdC5hZGQoJ2hpZ2hsaWdodCcpO1xuICB9O1xuXG4gIGZ1bmN0aW9uIHVuaGlnaGxpZ2h0KCkge1xuICAgIGNvbnRhaW5lci5jbGFzc0xpc3QucmVtb3ZlKCdoaWdobGlnaHQnKTtcbiAgfTtcblxuICBmdW5jdGlvbiBoYW5kbGVGaWxlcyhmaWxlcykge1xuICAgIGFkZGluZ3MuY2xhc3NMaXN0LmFkZCgnaXMtc2hvdycpO1xuICAgIGNvbnRhaW5lci5jbGFzc0xpc3QuYWRkKCdoYXMtcmVzdWx0Jyk7XG4gICAgZmlsZU5hbWUudGV4dENvbnRlbnQgPSBmaWxlc1swXS5uYW1lO1xuICB9O1xuXG4gIGZ1bmN0aW9uIGhhbmRsZVJlbW92ZUZpbGVzKCkge1xuICAgIGFkZGluZ3MuY2xhc3NMaXN0LnJlbW92ZSgnaXMtc2hvdycpO1xuICAgIGNvbnRhaW5lci5jbGFzc0xpc3QucmVtb3ZlKCdoYXMtcmVzdWx0Jyk7XG4gICAgZmlsZU5hbWUudGV4dENvbnRlbnQgPSAnJztcbiAgICBmaWxlRWxlbS52YWx1ZSA9ICcnO1xuICB9O1xuXG4gIGZ1bmN0aW9uIGhhbmRsZURyb3AoZSkge1xuICAgIGxldCBkdCA9IGUuZGF0YVRyYW5zZmVyO1xuICAgIGxldCBmaWxlcyA9IGR0LmZpbGVzO1xuXG4gICAgaWYgKCBWYWxpZGF0ZSh0aGlzKSApIHtcbiAgICAgIGhhbmRsZUZpbGVzKGZpbGVzKTtcbiAgICB9XG4gIH07XG5cbiAgZmlsZUVsZW0uYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgZnVuY3Rpb24oKSB7XG4gICAgaWYgKCBWYWxpZGF0ZSh0aGlzKSApIHtcbiAgICAgIGhhbmRsZUZpbGVzKHRoaXMuZmlsZXMpO1xuICAgIH1cbiAgfSk7XG5cbiAgcmVtb3Zlci5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKCkge1xuICAgIGhhbmRsZVJlbW92ZUZpbGVzKCk7XG4gIH0pO1xuXG4gIFsnZHJhZ2VudGVyJywgJ2RyYWdvdmVyJywgJ2RyYWdsZWF2ZScsICdkcm9wJ10uZm9yRWFjaChldmVudE5hbWUgPT4ge1xuICAgIGRyb3BBcmVhLmFkZEV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCBwcmV2ZW50RGVmYXVsdHMsIGZhbHNlKTtcbiAgfSk7XG5cbiAgWydkcmFnZW50ZXInLCAnZHJhZ292ZXInXS5mb3JFYWNoKGV2ZW50TmFtZSA9PiB7XG4gICAgZHJvcEFyZWEuYWRkRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIGhpZ2hsaWdodCwgZmFsc2UpO1xuICB9KTtcbiAgXG4gIFsnZHJhZ2xlYXZlJywgJ2Ryb3AnXS5mb3JFYWNoKGV2ZW50TmFtZSA9PiB7XG4gICAgZHJvcEFyZWEuYWRkRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIHVuaGlnaGxpZ2h0LCBmYWxzZSk7XG4gIH0pO1xuXG4gIGRyb3BBcmVhLmFkZEV2ZW50TGlzdGVuZXIoJ2Ryb3AnLCBoYW5kbGVEcm9wLCBmYWxzZSk7XG5cbiAgdmFyIF92YWxpZEZpbGVFeHRlbnNpb25zID0gWycuemlwJywgJy5yYXInXTtcblxuICBmdW5jdGlvbiBWYWxpZGF0ZShpbnB1dCkge1xuICAgIHZhciBzRmlsZU5hbWUgPSBpbnB1dC52YWx1ZTtcblxuICAgIGlmIChzRmlsZU5hbWUubGVuZ3RoID4gMCkge1xuICAgICAgdmFyIGJsblZhbGlkID0gZmFsc2U7XG4gICAgICBmb3IgKHZhciBqID0gMDsgaiA8IF92YWxpZEZpbGVFeHRlbnNpb25zLmxlbmd0aDsgaisrKSB7XG4gICAgICAgIHZhciBzQ3VyRXh0ZW5zaW9uID0gX3ZhbGlkRmlsZUV4dGVuc2lvbnNbal07XG4gICAgICAgIGlmIChzRmlsZU5hbWUuc3Vic3RyKHNGaWxlTmFtZS5sZW5ndGggLSBzQ3VyRXh0ZW5zaW9uLmxlbmd0aCwgc0N1ckV4dGVuc2lvbi5sZW5ndGgpLnRvTG93ZXJDYXNlKCkgPT0gc0N1ckV4dGVuc2lvbi50b0xvd2VyQ2FzZSgpKSB7XG4gICAgICAgICAgYmxuVmFsaWQgPSB0cnVlO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmICghYmxuVmFsaWQpIHtcbiAgICAgICAgY29udGFpbmVyLmNsYXNzTGlzdC5hZGQoJ2hhcy1lcnJvcicpO1xuXG4gICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgY29udGFpbmVyLmNsYXNzTGlzdC5yZW1vdmUoJ2hhcy1lcnJvcicpO1xuICAgICAgICB9LCAyMDAwKVxuXG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxufVxuXG5mdW5jdGlvbiBpbml0UmFuZ2UoKSB7XG4gIHZhciBzbGlkZXJzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmpzLXJhbmdlJyk7XG5cbiAgaWYgKCBzbGlkZXJzLmxlbmd0aCApIHtcbiAgICBmb3IgKGNvbnN0IHNsaWRlciBvZiBzbGlkZXJzKSB7XG4gICAgICBsZXQgc2xpZGVyU3RlcCA9IE51bWJlcihzbGlkZXIuZGF0YXNldC5zdGVwKTtcbiAgICAgIGxldCBzbGlkZXJNaW4gPSBOdW1iZXIoc2xpZGVyLmRhdGFzZXQubWluKTtcbiAgICAgIGxldCBzbGlkZXJNYXggPSBOdW1iZXIoc2xpZGVyLmRhdGFzZXQubWF4KTtcbiAgICAgIGxldCBzbGlkZXJQaXBzID0gTnVtYmVyKHNsaWRlci5kYXRhc2V0LnBpcHMpO1xuXG4gICAgICBub1VpU2xpZGVyLmNyZWF0ZShzbGlkZXIsIHtcbiAgICAgICAgc3RhcnQ6IFswXSxcbiAgICAgICAgc3RlcDogc2xpZGVyU3RlcCxcbiAgICAgICAgcmFuZ2U6IHtcbiAgICAgICAgICAnbWluJzogc2xpZGVyTWluLFxuICAgICAgICAgICdtYXgnOiBzbGlkZXJNYXhcbiAgICAgICAgfSxcbiAgICAgICAgY29ubmVjdDogJ2xvd2VyJyxcbiAgICAgICAgdG9vbHRpcHM6IHRydWUsXG4gICAgICAgIGZvcm1hdDogd051bWIoe1xuICAgICAgICAgIGRlY2ltYWxzOiAzLFxuICAgICAgICAgIHRob3VzYW5kOiAnLicsXG4gICAgICAgIH0pLFxuICAgICAgICBwaXBzOiB7XG4gICAgICAgICAgbW9kZTogJ2NvdW50JyxcbiAgICAgICAgICB2YWx1ZXM6IHNsaWRlclBpcHMsXG4gICAgICAgICAgc3RlcHBlZDogZmFsc2VcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIGxldCBtaW5pTWFya2VycyA9IHNsaWRlci5xdWVyeVNlbGVjdG9yQWxsKCcubm9VaS1tYXJrZXItaG9yaXpvbnRhbC5ub1VpLW1hcmtlcicpO1xuXG4gICAgICBpZiAoIG1pbmlNYXJrZXJzLmxlbmd0aCApIHtcbiAgICAgICAgZm9yICggY29uc3QgbWluaU1hcmtlciBvZiBtaW5pTWFya2VycyApIHtcbiAgICAgICAgICBtaW5pTWFya2VyLnJlbW92ZSgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGluaXRIZWFkZXJUb2dnbGVyKCkge1xuICBsZXQgdG9nZ2xlciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy1oZWFkZXItdG9nZ2xlcicpO1xuICBsZXQgaGVhZGVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLWhlYWRlcicpO1xuICBsZXQgcGFnZVdyYXAgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtcGFnZS13cmFwJyk7XG4gIGxldCBkYXJrbmVzcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy1oZWFkZXItZGFya25lc3MnKTtcblxuICBpZiAoIHRvZ2dsZXIgJiYgaGVhZGVyICYmIHBhZ2VXcmFwICYmIGRhcmtuZXNzICkge1xuICAgIHRvZ2dsZXIuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbigpIHtcbiAgICAgIGhlYWRlci5jbGFzc0xpc3QudG9nZ2xlKCdpcy1vcGVuJyk7XG4gICAgICB0b2dnbGVyLmNsYXNzTGlzdC50b2dnbGUoJ2lzLWFjdGl2ZScpO1xuICAgICAgcGFnZVdyYXAuY2xhc3NMaXN0LnRvZ2dsZSgnc2Nyb2xsLWJsb2NrZWQtbW9iaWxlJyk7XG4gICAgfSk7XG5cbiAgICBkYXJrbmVzcy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKCkge1xuICAgICAgaGVhZGVyLmNsYXNzTGlzdC5yZW1vdmUoJ2lzLW9wZW4nKTtcbiAgICAgIHRvZ2dsZXIuY2xhc3NMaXN0LnJlbW92ZSgnaXMtYWN0aXZlJyk7XG4gICAgICBwYWdlV3JhcC5jbGFzc0xpc3QucmVtb3ZlKCdzY3JvbGwtYmxvY2tlZC1tb2JpbGUnKTtcbiAgICB9KTtcbiAgfVxufVxuXG5mdW5jdGlvbiBpbml0QWxidW1zQ2FyZFNsaWRlcigpIHtcbiAgdmFyIG15U3dpcGVyID0gbmV3IFN3aXBlcignLmpzLWFsYnVtcy1jYXJkLXNsaWRlcicsIHtcbiAgICBzcGVlZDogNDAwLFxuICAgIHNsaWRlc1BlclZpZXc6IDEsXG4gICAgbmF2aWdhdGlvbjoge1xuICAgICAgbmV4dEVsOiAnLnN3aXBlci1idXR0b24tbmV4dCcsXG4gICAgICBwcmV2RWw6ICcuc3dpcGVyLWJ1dHRvbi1wcmV2JyxcbiAgICB9LFxuICB9KTtcblxuICByZXR1cm4gbXlTd2lwZXI7XG59XG5cbmZ1bmN0aW9uIGluaXRBbGJ1bVNsaWRlcigpIHtcbiAgdmFyIG15U3dpcGVyID0gbmV3IFN3aXBlcignLmpzLXN3aXBlci1hbGJ1bScsIHtcbiAgICBzcGVlZDogNDAwLFxuICAgIHNsaWRlc1BlclZpZXc6IDEsXG4gICAgbG9vcDogZmFsc2UsXG4gICAgcHJlbG9hZEltYWdlczogZmFsc2UsXG4gICAgc3BhY2VCZXR3ZWVuOiAxMixcbiAgICBsYXp5OiB0cnVlLFxuICAgIG5hdmlnYXRpb246IHtcbiAgICAgIG5leHRFbDogJy5zd2lwZXItYnV0dG9uLW5leHQnLFxuICAgICAgcHJldkVsOiAnLnN3aXBlci1idXR0b24tcHJldicsXG4gICAgfSxcbiAgfSk7XG5cbiAgcmV0dXJuIG15U3dpcGVyO1xufVxuXG5mdW5jdGlvbiBpbml0U3dpcGVyKCkge1xuICB2YXIgbXlTd2lwZXIgPSBuZXcgU3dpcGVyKCcuanMtc3dpcGVyLWNvbnRhaW5lcicsIHtcbiAgICBzcGVlZDogNDAwLFxuICAgIHNsaWRlc1BlclZpZXc6IDYsXG4gICAgc3BhY2VCZXR3ZWVuOiA0MCxcbiAgICBsb29wOiBmYWxzZSxcbiAgICBwcmVsb2FkSW1hZ2VzOiBmYWxzZSxcbiAgICBsYXp5OiB0cnVlLCBcbiAgICBuYXZpZ2F0aW9uOiB7XG4gICAgICBuZXh0RWw6ICcuc3dpcGVyLWJ1dHRvbi1uZXh0JyxcbiAgICAgIHByZXZFbDogJy5zd2lwZXItYnV0dG9uLXByZXYnLFxuICAgIH0sXG4gICAgYnJlYWtwb2ludHM6IHtcbiAgICAgIDQ1OToge1xuICAgICAgICBzbGlkZXNQZXJWaWV3OiAxLFxuICAgICAgfSxcbiAgICAgIDU5OToge1xuICAgICAgICBzbGlkZXNQZXJWaWV3OiAyLFxuICAgICAgfSxcbiAgICAgIDc2Nzoge1xuICAgICAgICBzbGlkZXNQZXJWaWV3OiAzLFxuICAgICAgfSxcbiAgICAgIDExOTk6IHtcbiAgICAgICAgc2xpZGVzUGVyVmlldzogNCxcbiAgICAgIH0sXG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gbXlTd2lwZXI7XG59XG5cbmZ1bmN0aW9uIGluaXRTd2lwZXJTdGF0aWNrKCkge1xuICB2YXIgbXlTd2lwZXIgPSBuZXcgU3dpcGVyKCcuanMtc3dpcGVyLWNvbnRhaW5lci1zdGF0aWNrJywge1xuICAgIHNwZWVkOiA0MDAsXG4gICAgc2xpZGVzUGVyVmlldzogNixcbiAgICBzcGFjZUJldHdlZW46IDQwLFxuICAgIGxvb3A6IGZhbHNlLFxuICAgIHByZWxvYWRJbWFnZXM6IGZhbHNlLFxuICAgIGxhenk6IHRydWUsXG4gICAgZm9sbG93RmluZ2VyOiBmYWxzZSxcbiAgICBicmVha3BvaW50czoge1xuICAgICAgNDU5OiB7XG4gICAgICAgIHNsaWRlc1BlclZpZXc6IDEsXG4gICAgICB9LFxuICAgICAgNTk5OiB7XG4gICAgICAgIHNsaWRlc1BlclZpZXc6IDIsXG4gICAgICB9LFxuICAgICAgNzY3OiB7XG4gICAgICAgIHNsaWRlc1BlclZpZXc6IDMsXG4gICAgICB9LFxuICAgICAgMTE5OToge1xuICAgICAgICBzbGlkZXNQZXJWaWV3OiA0LFxuICAgICAgfSxcbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiBteVN3aXBlcjtcbn1cblxuZnVuY3Rpb24gaW5pdE1haW5Td2lwZXIoKSB7XG4gIHZhciBteVN3aXBlciA9IG5ldyBTd2lwZXIoJy5qcy1tYWluLXN3aXBlci1jb250YWluZXInLCB7XG4gICAgc3BlZWQ6IDQwMCxcbiAgICBzbGlkZXNQZXJWaWV3OiAxLFxuICAgIGxvb3A6IHRydWUsXG4gICAgc3BhY2VCZXR3ZWVuOiAxMixcbiAgICBwYWdpbmF0aW9uOiB7XG4gICAgICBlbDogJy5zd2lwZXItcGFnaW5hdGlvbicsXG4gICAgICB0eXBlOiAnYnVsbGV0cycsXG4gICAgICBjbGlja2FibGU6IHRydWVcbiAgICB9LFxuICAgIG5hdmlnYXRpb246IHtcbiAgICAgIG5leHRFbDogJy5zd2lwZXItYnV0dG9uLW5leHQnLFxuICAgICAgcHJldkVsOiAnLnN3aXBlci1idXR0b24tcHJldicsXG4gICAgfSxcbiAgfSk7XG5cbiAgcmV0dXJuIG15U3dpcGVyO1xufVxuXG5mdW5jdGlvbiBpbml0QWxidW1zVHlwZVNsaWRlcigpIHtcbiAgdmFyIG15U3dpcGVyID0gbmV3IFN3aXBlcignLmpzLXR5cGUtYWxidW1zLXN3aXBlcicsIHtcbiAgICBzcGVlZDogNDAwLFxuICAgIHNsaWRlc1BlclZpZXc6ICdhdXRvJyxcbiAgICBzbGlkZXNPZmZzZXRBZnRlcjogMTAwLFxuICAgIHNwYWNlQmV0d2VlbjogMjQsXG4gICAgbmF2aWdhdGlvbjoge1xuICAgICAgbmV4dEVsOiAnLnN3aXBlci1idXR0b24tbmV4dCcsXG4gICAgICBwcmV2RWw6ICcuc3dpcGVyLWJ1dHRvbi1wcmV2JyxcbiAgICB9LFxuICAgIG9uOiB7XG4gICAgICBzbGlkZUNoYW5nZTogZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAoIHRoaXMuYWN0aXZlSW5kZXggPiAwICkge1xuICAgICAgICAgIHRoaXMuZWwuY2xhc3NMaXN0LmFkZCgnbm90LW9uLXN0YXJ0Jyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5lbC5jbGFzc0xpc3QucmVtb3ZlKCdub3Qtb24tc3RhcnQnKTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICB9LFxuICB9KTtcblxuICByZXR1cm4gbXlTd2lwZXI7XG59XG5cbmZ1bmN0aW9uIGluaXRNYWluQ2FyZHNTbGlkZXIoKSB7XG4gIHZhciBteVN3aXBlciA9IG5ldyBTd2lwZXIoJy5qcy1tYWluLWNhcmQtc2xpZGVyJywge1xuICAgIHNwZWVkOiA0MDAsXG4gICAgc2xpZGVzUGVyVmlldzogMSxcbiAgICBsb29wOiB0cnVlLFxuICAgIHNwYWNlQmV0d2VlbjogMTIsXG4gICAgbmF2aWdhdGlvbjoge1xuICAgICAgbmV4dEVsOiAnLnN3aXBlci1idXR0b24tbmV4dCcsXG4gICAgICBwcmV2RWw6ICcuc3dpcGVyLWJ1dHRvbi1wcmV2JyxcbiAgICB9LFxuICB9KTtcblxuICByZXR1cm4gbXlTd2lwZXI7XG59XG5cbmZ1bmN0aW9uIHRhYih0YWJIYW5kbGVyKSB7XG4gICAgbGV0IHRhYnNDb250YWluZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmpzLXRhYi1jb250YWluZXJcIik7XG5cbiAgICBpZiAoIHRhYnNDb250YWluZXIgKSB7XG4gICAgICBsZXQgbWVudUl0ZW1zID0gdGFic0NvbnRhaW5lci5xdWVyeVNlbGVjdG9yQWxsKFwiLmpzLXRhYi1tZW51LWl0ZW1cIik7XG4gICAgICBsZXQgdW5kZXJsaW5lID0gdGFic0NvbnRhaW5lci5xdWVyeVNlbGVjdG9yKFwiLmpzLXRhYi11bmRlcmxpbmVcIik7XG5cbiAgICAgIG1lbnVJdGVtcy5mb3JFYWNoKCAobWVudUl0ZW0pID0+IHtcbiAgICAgICAgaWYgKCB1bmRlcmxpbmUgJiYgbWVudUl0ZW0uY2xhc3NMaXN0LmNvbnRhaW5zKFwiaXMtYWN0aXZlXCIpICkge1xuICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgY3VycmVudFRhYkFjY2VudCh1bmRlcmxpbmUsIG1lbnVJdGVtKTtcbiAgICAgICAgICB9LCAxMDApO1xuICAgICAgICB9XG5cbiAgICAgICAgbWVudUl0ZW0ub25jbGljayA9ICgpID0+IHtcbiAgICAgICAgICBsZXQgYWN0aXZlTWVudUl0ZW0gPSBBcnJheS5mcm9tKG1lbnVJdGVtcykuZmluZChnZXRBY3RpdmVUYWIpO1xuICAgICAgICAgIGxldCBhY3RpdmVDb250ZW50SXRlbSA9IHRhYnNDb250YWluZXIucXVlcnlTZWxlY3RvcihhY3RpdmVNZW51SXRlbS5kYXRhc2V0LnRhcmdldCk7XG4gICAgICAgICAgbGV0IGN1cnJlbnRDb250ZW50SXRlbSA9IHRhYnNDb250YWluZXIucXVlcnlTZWxlY3RvcihtZW51SXRlbS5kYXRhc2V0LnRhcmdldCk7XG5cbiAgICAgICAgICBhY3RpdmVNZW51SXRlbS5jbGFzc0xpc3QucmVtb3ZlKFwiaXMtYWN0aXZlXCIpO1xuXG4gICAgICAgICAgaWYgKCBhY3RpdmVDb250ZW50SXRlbSApIHtcbiAgICAgICAgICAgIGFjdGl2ZUNvbnRlbnRJdGVtLmNsYXNzTGlzdC5yZW1vdmUoXCJpcy1hY3RpdmVcIik7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKCBjdXJyZW50Q29udGVudEl0ZW0gKSB7XG4gICAgICAgICAgICBjdXJyZW50Q29udGVudEl0ZW0uY2xhc3NMaXN0LmFkZChcImlzLWFjdGl2ZVwiKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBtZW51SXRlbS5jbGFzc0xpc3QuYWRkKFwiaXMtYWN0aXZlXCIpO1xuXG4gICAgICAgICAgaWYgKCB1bmRlcmxpbmUgKSB7XG4gICAgICAgICAgICBjdXJyZW50VGFiQWNjZW50KHVuZGVybGluZSwgbWVudUl0ZW0pO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmICggdGFiSGFuZGxlciApIHtcbiAgICAgICAgICAgIGRvY3VtZW50LmRpc3BhdGNoRXZlbnQodGFiSGFuZGxlcik7XG4gICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgfSk7XG4gICAgfVxuXG4gIGZ1bmN0aW9uIGN1cnJlbnRUYWJBY2NlbnQodW5kZXJsaW5lLCBtZW51SXRlbSkge1xuICAgIGxldCBpdGVtUG9zaXRpb24gPSBtZW51SXRlbS5vZmZzZXRMZWZ0O1xuICAgIGxldCBpdGVtV2lkdGggPSBOdW1iZXIobWVudUl0ZW0uc2Nyb2xsV2lkdGgpO1xuXG4gICAgcmV0dXJuIHVuZGVybGluZS5zZXRBdHRyaWJ1dGUoXCJzdHlsZVwiLCBgbGVmdDogJHtpdGVtUG9zaXRpb259cHg7IHdpZHRoOiAke2l0ZW1XaWR0aH1weDtgKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGdldEFjdGl2ZVRhYihlbGVtZW50KSB7XG4gICAgcmV0dXJuIGVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKFwiaXMtYWN0aXZlXCIpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGFjY29yZGlvbigpIHtcbiAgbGV0IHdyYXBwZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuanMtYWNjb3JkaW9uJyk7XG4gIHdyYXBwZXIuZm9yRWFjaCh3cmFwcGVySXRlbSA9PiB7XG4gICAgbGV0IGl0ZW1zID0gd3JhcHBlckl0ZW0ucXVlcnlTZWxlY3RvckFsbCgnLmpzLWFjY29yZGlvbi1pdGVtJyk7XG4gICAgbGV0IGluZGl2aWR1YWwgPSB3cmFwcGVySXRlbS5nZXRBdHRyaWJ1dGUoJ2luZGl2aWR1YWwnKSAmJiB3cmFwcGVySXRlbS5nZXRBdHRyaWJ1dGUoJ2luZGl2aWR1YWwnKSAhPT0gJ2ZhbHNlJztcblxuICAgIGl0ZW1zLmZvckVhY2goaXRlbSA9PiB7XG4gICAgICBpZiAoIGl0ZW0uY2xhc3NMaXN0LmNvbnRhaW5zKCdpcy1hY3RpdmUnKSApIHtcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgbGV0IHJlYWR5Q29udGVudCA9IGl0ZW0ucXVlcnlTZWxlY3RvcignLmpzLWFjY29yZGlvbi1jb250ZW50Jyk7XG4gICAgICAgICAgbGV0IHJlYWR5Q29udGVudEhlaWdodCA9IHJlYWR5Q29udGVudC5zY3JvbGxIZWlnaHQ7XG5cbiAgICAgICAgICByZWFkeUNvbnRlbnQuc3R5bGUubWF4SGVpZ2h0ID0gcmVhZHlDb250ZW50SGVpZ2h0ICsgJ3B4JztcbiAgICAgICAgfSwgMTAwKTtcbiAgICAgIH1cblxuICAgICAgbGV0IHN1Ykl0ZW1zID0gaXRlbS5xdWVyeVNlbGVjdG9yQWxsKCcuanMtYWNjb3JkaW9uLXN1Yml0ZW0nKTtcblxuICAgICAgZm9yIChjb25zdCBzdWJJdGVtIG9mIHN1Ykl0ZW1zKSB7XG4gICAgICAgIGlmICggc3ViSXRlbS5jbGFzc0xpc3QuY29udGFpbnMoJ2lzLWFjdGl2ZScpICkge1xuICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgbGV0IHJlYWR5Q29udGVudCA9IHN1Ykl0ZW0ucXVlcnlTZWxlY3RvcignLmpzLWFjY29yZGlvbi1jb250ZW50Jyk7XG4gICAgICAgICAgICBsZXQgcmVhZHlDb250ZW50SGVpZ2h0ID0gcmVhZHlDb250ZW50LnNjcm9sbEhlaWdodDtcbiAgXG4gICAgICAgICAgICByZWFkeUNvbnRlbnQuc3R5bGUubWF4SGVpZ2h0ID0gcmVhZHlDb250ZW50SGVpZ2h0ICsgJ3B4JztcbiAgICAgICAgICB9LCAxMDApO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGl0ZW1JdGVyYXRpb24oaXRlbSwgaXRlbXMsIGluZGl2aWR1YWwpO1xuXG4gICAgICBzdWJJdGVtcy5mb3JFYWNoKHN1Yml0ZW0gPT4ge1xuICAgICAgICBpdGVtSXRlcmF0aW9uKHN1Yml0ZW0sIHN1Ykl0ZW1zLCBpbmRpdmlkdWFsLCB0cnVlKVxuICAgICAgfSk7XG4gICAgfSlcbiAgfSlcbn1cblxuZnVuY3Rpb24gaXRlbUl0ZXJhdGlvbihpdGVtLCBpdGVtcywgaW5kaXZpZHVhbCwgaXNTdWJpdGVtKSB7XG4gIGxldCBpbml0ID0gaXRlbS5xdWVyeVNlbGVjdG9yKCcuanMtYWNjb3JkaW9uLWluaXQnKTtcbiAgbGV0IGNvbnRlbnQgPSBpdGVtLnF1ZXJ5U2VsZWN0b3IoJy5qcy1hY2NvcmRpb24tY29udGVudCcpO1xuXG4gIGlmICggaXNTdWJpdGVtID09PSB0cnVlICkge1xuICAgIGNvbnRlbnQuYWRkRXZlbnRMaXN0ZW5lcigndHJhbnNpdGlvbmVuZCcsIGZ1bmN0aW9uKCkge1xuICAgICAgbGV0IHBhcmVudEl0ZW0gPSBpdGVtLmNsb3Nlc3QoJy5qcy1hY2NvcmRpb24taXRlbScpO1xuICAgICAgbGV0IHBhcmVudENvbnRlbnRIZWlnaHQgPSBwYXJlbnRJdGVtLnNjcm9sbEhlaWdodCArICdweCc7XG4gICAgICBsZXQgcGFyZW50Q29udGVudCA9IHBhcmVudEl0ZW0ucXVlcnlTZWxlY3RvcignLmpzLWFjY29yZGlvbi1jb250ZW50Jyk7XG5cbiAgICAgIHBhcmVudENvbnRlbnQuc2V0QXR0cmlidXRlKCdzdHlsZScsIGBtYXgtaGVpZ2h0OiAke3BhcmVudENvbnRlbnRIZWlnaHR9YCk7XG4gICAgfSk7XG4gIH1cblxuICBpbml0LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oKSB7XG4gICAgaWYgKCBpdGVtLmNsYXNzTGlzdC5jb250YWlucygnaXMtYWN0aXZlJykgKSB7XG4gICAgICBpdGVtLmNsYXNzTGlzdC5yZW1vdmUoJ2lzLWFjdGl2ZScpO1xuICAgICAgY29udGVudC5zdHlsZS5tYXhIZWlnaHQgPSAnMHB4JztcblxuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuXG4gICAgaWYgKCBpc1N1Yml0ZW0gPT09IHRydWUgKSB7XG4gICAgICBsZXQgcGFyZW50SXRlbSA9IGl0ZW0uY2xvc2VzdCgnLmpzLWFjY29yZGlvbi1pdGVtJyk7XG4gICAgICBsZXQgcGFyZW50Q29udGVudCA9IHBhcmVudEl0ZW0ucXVlcnlTZWxlY3RvcignLmpzLWFjY29yZGlvbi1jb250ZW50Jyk7XG5cbiAgICAgIHBhcmVudENvbnRlbnQuc2V0QXR0cmlidXRlKCdzdHlsZScsIGBtYXgtaGVpZ2h0OiBub25lYCk7XG4gICAgfVxuXG4gICAgaWYgKCBpbmRpdmlkdWFsICkge1xuICAgICAgaXRlbXMuZm9yRWFjaCgoZWxlbSkgPT4ge1xuICAgICAgICBsZXQgZWxlbUNvbnRlbnQgPSBlbGVtLnF1ZXJ5U2VsZWN0b3IoJy5qcy1hY2NvcmRpb24tY29udGVudCcpO1xuICAgICAgICBlbGVtLmNsYXNzTGlzdC5yZW1vdmUoJ2lzLWFjdGl2ZScpO1xuICAgICAgICBlbGVtQ29udGVudC5zdHlsZS5tYXhIZWlnaHQgPSAwICsgJ3B4JztcbiAgICAgIH0pXG4gICAgfVxuXG4gICAgaXRlbS5jbGFzc0xpc3QuYWRkKCdpcy1hY3RpdmUnKTtcbiAgICBjb250ZW50LnN0eWxlLm1heEhlaWdodCA9IGNvbnRlbnQuc2Nyb2xsSGVpZ2h0ICsgJ3B4JztcbiAgfSk7XG59Il19
