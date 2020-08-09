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
  initModal();
  validateFrom();

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

function validateFrom() {
  let forms = document.querySelectorAll('.js-form-validate');

  if ( forms.length ) {
    for (const form of forms) {
      let fields = form.querySelectorAll('.js-form-validate-input input');
      let file = form.querySelector('.js-calculate-file-input');
      let validForm = false;

      for (const field of fields) {
        field.addEventListener('change', function() {
          if ( !validateField(field) ) {
            field.classList.add('has-error');
            validForm = false;
          } else {
            field.classList.remove('has-error');
            validForm = true;
          }
        });
      }

      form.addEventListener('submit', function(e) {
        e.preventDefault();

        for (const field of fields) {
          if ( !validateField(field) ) {
            field.classList.add('has-error');
            validForm = false;

            return
          } else {
            field.classList.remove('has-error');
            validForm = true;
          }
        }

        if ( validForm ) {
          let formData = new FormData(form);

          if ( file ) {
            formData.append('file', file.files[0]);
          }

          let success = function() {
            form.classList.add('success');
          };

          sendData(formData, '/', success);

        } else {
          console.log('unvalid form')
        }
      })
    }
  }
}

function validateField(input) {
  let value = input.value;
  let type = input.type;
  let result = false;

  if ( type == 'tel' ) {
    result = validatePhone(value);
  } else if ( type == 'email' ) {
    result = validateMail(value);
  } else {
    result = !isEmpty(value);
  }

  return result;
}

function isEmpty(str) {
  return str == '' && true;
}

function validatePhone(str) {
  let reg = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im;
  return testReg(reg, removeSpaces(str));
}

function validateMail(str) {
  let result = false;
  const reg = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  result = testReg(reg, str)
  return result;
}

function removeSpaces(str) {
  return str.replace(/\s/g, '');;
}

function testReg(re, str){
  if (re.test(str)) {
    return true;
  } else {
    return false;
  }
}

function sendData(data, url, success) {
  if ( !data || !url ) {
    return console.log('error, have no data or url');
  }

  let xhr = new XMLHttpRequest();

  xhr.onloadend = function() {
    if (xhr.status == 200) {
      let successFu = success;

      successFu();
      console.log("Успех");
    } else {
      console.log("Ошибка " + this.status);
    }
  };

  xhr.open("POST", url);
  xhr.send(data);
}

function initModal() {
  let inits = document.querySelectorAll('.js-modal-init');
  let body = document.body;

  if ( inits.length ) {
    for (const init of inits) {
      let target = document.querySelector(init.dataset.target);
      let close = target.querySelector('.js-modal-close');

      if ( close ) {
        close.addEventListener('click', function() {
          target.classList.remove('is-active');
          body.classList.remove('modal-is-active');
        });
      }

      if ( target ) {
        init.addEventListener('click', function() {
          target.classList.add('is-active');
          body.classList.add('modal-is-active');
        });
      }
    }
  }
}

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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0JztcblxuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIGZ1bmN0aW9uKCkge1xuICBsZXQgdGFiSGFuZGxlciA9IG5ldyBFdmVudCgndGFiSGFuZGxlcicpO1xuXG4gIGxldCBzd2lwZXJzID0gaW5pdFN3aXBlcigpO1xuICBzdmc0ZXZlcnlib2R5KCk7XG4gIGluaXRNYWluU3dpcGVyKCk7XG4gIGluaXRIZWFkZXJUb2dnbGVyKCk7XG4gIGluaXRBbGJ1bXNDYXJkU2xpZGVyKCk7XG4gIGFjY29yZGlvbigpO1xuICBpbml0QWxidW1zVHlwZVNsaWRlcigpO1xuICBpbml0U3dpcGVyU3RhdGljaygpO1xuICBpbml0QWxidW1TbGlkZXIoKTtcbiAgdGFiKHRhYkhhbmRsZXIpO1xuICBpbml0UmFuZ2UoKTtcbiAgaW5pdERyYWdORHJvcCgpO1xuICBpbml0TW9kYWwoKTtcbiAgdmFsaWRhdGVGcm9tKCk7XG5cbiAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigndGFiSGFuZGxlcicsIGZ1bmN0aW9uKCkge1xuICAgIGlmICggIXN3aXBlcnMubGVuZ3RoICkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHN3aXBlcnMuZm9yRWFjaChzd2lwZXIgPT4ge1xuICAgICAgc3dpcGVyLnVwZGF0ZSgpO1xuICAgIH0pO1xuXG4gIH0sIGZhbHNlKTtcblxuICBpZiAoIHdpbmRvdy5pbm5lcldpZHRoIDwgNzY4ICkge1xuICAgIGluaXRNYWluQ2FyZHNTbGlkZXIoKTtcbiAgfVxufSk7XG5cbmZ1bmN0aW9uIHZhbGlkYXRlRnJvbSgpIHtcbiAgbGV0IGZvcm1zID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmpzLWZvcm0tdmFsaWRhdGUnKTtcblxuICBpZiAoIGZvcm1zLmxlbmd0aCApIHtcbiAgICBmb3IgKGNvbnN0IGZvcm0gb2YgZm9ybXMpIHtcbiAgICAgIGxldCBmaWVsZHMgPSBmb3JtLnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy1mb3JtLXZhbGlkYXRlLWlucHV0IGlucHV0Jyk7XG4gICAgICBsZXQgZmlsZSA9IGZvcm0ucXVlcnlTZWxlY3RvcignLmpzLWNhbGN1bGF0ZS1maWxlLWlucHV0Jyk7XG4gICAgICBsZXQgdmFsaWRGb3JtID0gZmFsc2U7XG5cbiAgICAgIGZvciAoY29uc3QgZmllbGQgb2YgZmllbGRzKSB7XG4gICAgICAgIGZpZWxkLmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGlmICggIXZhbGlkYXRlRmllbGQoZmllbGQpICkge1xuICAgICAgICAgICAgZmllbGQuY2xhc3NMaXN0LmFkZCgnaGFzLWVycm9yJyk7XG4gICAgICAgICAgICB2YWxpZEZvcm0gPSBmYWxzZTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZmllbGQuY2xhc3NMaXN0LnJlbW92ZSgnaGFzLWVycm9yJyk7XG4gICAgICAgICAgICB2YWxpZEZvcm0gPSB0cnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIGZvcm0uYWRkRXZlbnRMaXN0ZW5lcignc3VibWl0JywgZnVuY3Rpb24oZSkge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgZm9yIChjb25zdCBmaWVsZCBvZiBmaWVsZHMpIHtcbiAgICAgICAgICBpZiAoICF2YWxpZGF0ZUZpZWxkKGZpZWxkKSApIHtcbiAgICAgICAgICAgIGZpZWxkLmNsYXNzTGlzdC5hZGQoJ2hhcy1lcnJvcicpO1xuICAgICAgICAgICAgdmFsaWRGb3JtID0gZmFsc2U7XG5cbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBmaWVsZC5jbGFzc0xpc3QucmVtb3ZlKCdoYXMtZXJyb3InKTtcbiAgICAgICAgICAgIHZhbGlkRm9ybSA9IHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCB2YWxpZEZvcm0gKSB7XG4gICAgICAgICAgbGV0IGZvcm1EYXRhID0gbmV3IEZvcm1EYXRhKGZvcm0pO1xuXG4gICAgICAgICAgaWYgKCBmaWxlICkge1xuICAgICAgICAgICAgZm9ybURhdGEuYXBwZW5kKCdmaWxlJywgZmlsZS5maWxlc1swXSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgbGV0IHN1Y2Nlc3MgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGZvcm0uY2xhc3NMaXN0LmFkZCgnc3VjY2VzcycpO1xuICAgICAgICAgIH07XG5cbiAgICAgICAgICBzZW5kRGF0YShmb3JtRGF0YSwgJy8nLCBzdWNjZXNzKTtcblxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbnNvbGUubG9nKCd1bnZhbGlkIGZvcm0nKVxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiB2YWxpZGF0ZUZpZWxkKGlucHV0KSB7XG4gIGxldCB2YWx1ZSA9IGlucHV0LnZhbHVlO1xuICBsZXQgdHlwZSA9IGlucHV0LnR5cGU7XG4gIGxldCByZXN1bHQgPSBmYWxzZTtcblxuICBpZiAoIHR5cGUgPT0gJ3RlbCcgKSB7XG4gICAgcmVzdWx0ID0gdmFsaWRhdGVQaG9uZSh2YWx1ZSk7XG4gIH0gZWxzZSBpZiAoIHR5cGUgPT0gJ2VtYWlsJyApIHtcbiAgICByZXN1bHQgPSB2YWxpZGF0ZU1haWwodmFsdWUpO1xuICB9IGVsc2Uge1xuICAgIHJlc3VsdCA9ICFpc0VtcHR5KHZhbHVlKTtcbiAgfVxuXG4gIHJldHVybiByZXN1bHQ7XG59XG5cbmZ1bmN0aW9uIGlzRW1wdHkoc3RyKSB7XG4gIHJldHVybiBzdHIgPT0gJycgJiYgdHJ1ZTtcbn1cblxuZnVuY3Rpb24gdmFsaWRhdGVQaG9uZShzdHIpIHtcbiAgbGV0IHJlZyA9IC9eW1xcK10/WyhdP1swLTldezN9WyldP1stXFxzXFwuXT9bMC05XXszfVstXFxzXFwuXT9bMC05XXs0LDZ9JC9pbTtcbiAgcmV0dXJuIHRlc3RSZWcocmVnLCByZW1vdmVTcGFjZXMoc3RyKSk7XG59XG5cbmZ1bmN0aW9uIHZhbGlkYXRlTWFpbChzdHIpIHtcbiAgbGV0IHJlc3VsdCA9IGZhbHNlO1xuICBjb25zdCByZWcgPSAvXigoW148PigpW1xcXVxcXFwuLDs6XFxzQFxcXCJdKyhcXC5bXjw+KClbXFxdXFxcXC4sOzpcXHNAXFxcIl0rKSopfChcXFwiLitcXFwiKSlAKChcXFtbMC05XXsxLDN9XFwuWzAtOV17MSwzfVxcLlswLTldezEsM31cXC5bMC05XXsxLDN9XFxdKXwoKFthLXpBLVpcXC0wLTldK1xcLikrW2EtekEtWl17Mix9KSkkLztcbiAgcmVzdWx0ID0gdGVzdFJlZyhyZWcsIHN0cilcbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZnVuY3Rpb24gcmVtb3ZlU3BhY2VzKHN0cikge1xuICByZXR1cm4gc3RyLnJlcGxhY2UoL1xccy9nLCAnJyk7O1xufVxuXG5mdW5jdGlvbiB0ZXN0UmVnKHJlLCBzdHIpe1xuICBpZiAocmUudGVzdChzdHIpKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG59XG5cbmZ1bmN0aW9uIHNlbmREYXRhKGRhdGEsIHVybCwgc3VjY2Vzcykge1xuICBpZiAoICFkYXRhIHx8ICF1cmwgKSB7XG4gICAgcmV0dXJuIGNvbnNvbGUubG9nKCdlcnJvciwgaGF2ZSBubyBkYXRhIG9yIHVybCcpO1xuICB9XG5cbiAgbGV0IHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuXG4gIHhoci5vbmxvYWRlbmQgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAoeGhyLnN0YXR1cyA9PSAyMDApIHtcbiAgICAgIGxldCBzdWNjZXNzRnUgPSBzdWNjZXNzO1xuXG4gICAgICBzdWNjZXNzRnUoKTtcbiAgICAgIGNvbnNvbGUubG9nKFwi0KPRgdC/0LXRhVwiKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS5sb2coXCLQntGI0LjQsdC60LAgXCIgKyB0aGlzLnN0YXR1cyk7XG4gICAgfVxuICB9O1xuXG4gIHhoci5vcGVuKFwiUE9TVFwiLCB1cmwpO1xuICB4aHIuc2VuZChkYXRhKTtcbn1cblxuZnVuY3Rpb24gaW5pdE1vZGFsKCkge1xuICBsZXQgaW5pdHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuanMtbW9kYWwtaW5pdCcpO1xuICBsZXQgYm9keSA9IGRvY3VtZW50LmJvZHk7XG5cbiAgaWYgKCBpbml0cy5sZW5ndGggKSB7XG4gICAgZm9yIChjb25zdCBpbml0IG9mIGluaXRzKSB7XG4gICAgICBsZXQgdGFyZ2V0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcihpbml0LmRhdGFzZXQudGFyZ2V0KTtcbiAgICAgIGxldCBjbG9zZSA9IHRhcmdldC5xdWVyeVNlbGVjdG9yKCcuanMtbW9kYWwtY2xvc2UnKTtcblxuICAgICAgaWYgKCBjbG9zZSApIHtcbiAgICAgICAgY2xvc2UuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICB0YXJnZXQuY2xhc3NMaXN0LnJlbW92ZSgnaXMtYWN0aXZlJyk7XG4gICAgICAgICAgYm9keS5jbGFzc0xpc3QucmVtb3ZlKCdtb2RhbC1pcy1hY3RpdmUnKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIGlmICggdGFyZ2V0ICkge1xuICAgICAgICBpbml0LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgdGFyZ2V0LmNsYXNzTGlzdC5hZGQoJ2lzLWFjdGl2ZScpO1xuICAgICAgICAgIGJvZHkuY2xhc3NMaXN0LmFkZCgnbW9kYWwtaXMtYWN0aXZlJyk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBpbml0RHJhZ05Ecm9wKCkge1xuICBsZXQgY29udGFpbmVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLWNhbGN1bGF0ZS1maWxlJyk7XG4gIGxldCBkcm9wQXJlYSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy1jYWxjdWxhdGUtZmlsZS1kcm9wYXJlYScpO1xuICBsZXQgZmlsZUVsZW0gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtY2FsY3VsYXRlLWZpbGUtaW5wdXQnKTtcbiAgbGV0IGFkZGluZ3MgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtY2FsY3VsYXRlLWZpbGUtYWRkaW5ncycpO1xuICBsZXQgZmlsZU5hbWUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtY2FsY3VsYXRlLWZpbGUtbmFtZScpO1xuICBsZXQgcmVtb3ZlciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy1jYWxjdWxhdGUtZmlsZS1yZW1vdmVyJyk7XG5cbiAgaWYgKCAhY29udGFpbmVyICYmICFkcm9wQXJlYSAmJiAhZmlsZUVsZW0gJiYgIWFkZGluZ3MgJiYgIWZpbGVOYW1lICYmICFyZW1vdmVyICkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGZ1bmN0aW9uIHByZXZlbnREZWZhdWx0cyAoZSkge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICB9O1xuXG4gIGZ1bmN0aW9uIGhpZ2hsaWdodCgpIHtcbiAgICBjb250YWluZXIuY2xhc3NMaXN0LmFkZCgnaGlnaGxpZ2h0Jyk7XG4gIH07XG5cbiAgZnVuY3Rpb24gdW5oaWdobGlnaHQoKSB7XG4gICAgY29udGFpbmVyLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZ2hsaWdodCcpO1xuICB9O1xuXG4gIGZ1bmN0aW9uIGhhbmRsZUZpbGVzKGZpbGVzKSB7XG4gICAgYWRkaW5ncy5jbGFzc0xpc3QuYWRkKCdpcy1zaG93Jyk7XG4gICAgY29udGFpbmVyLmNsYXNzTGlzdC5hZGQoJ2hhcy1yZXN1bHQnKTtcbiAgICBmaWxlTmFtZS50ZXh0Q29udGVudCA9IGZpbGVzWzBdLm5hbWU7XG4gIH07XG5cbiAgZnVuY3Rpb24gaGFuZGxlUmVtb3ZlRmlsZXMoKSB7XG4gICAgYWRkaW5ncy5jbGFzc0xpc3QucmVtb3ZlKCdpcy1zaG93Jyk7XG4gICAgY29udGFpbmVyLmNsYXNzTGlzdC5yZW1vdmUoJ2hhcy1yZXN1bHQnKTtcbiAgICBmaWxlTmFtZS50ZXh0Q29udGVudCA9ICcnO1xuICAgIGZpbGVFbGVtLnZhbHVlID0gJyc7XG4gIH07XG5cbiAgZnVuY3Rpb24gaGFuZGxlRHJvcChlKSB7XG4gICAgbGV0IGR0ID0gZS5kYXRhVHJhbnNmZXI7XG4gICAgbGV0IGZpbGVzID0gZHQuZmlsZXM7XG5cbiAgICBpZiAoIFZhbGlkYXRlKHRoaXMpICkge1xuICAgICAgaGFuZGxlRmlsZXMoZmlsZXMpO1xuICAgIH1cbiAgfTtcblxuICBmaWxlRWxlbS5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCBmdW5jdGlvbigpIHtcbiAgICBpZiAoIFZhbGlkYXRlKHRoaXMpICkge1xuICAgICAgaGFuZGxlRmlsZXModGhpcy5maWxlcyk7XG4gICAgfVxuICB9KTtcblxuICByZW1vdmVyLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oKSB7XG4gICAgaGFuZGxlUmVtb3ZlRmlsZXMoKTtcbiAgfSk7XG5cbiAgWydkcmFnZW50ZXInLCAnZHJhZ292ZXInLCAnZHJhZ2xlYXZlJywgJ2Ryb3AnXS5mb3JFYWNoKGV2ZW50TmFtZSA9PiB7XG4gICAgZHJvcEFyZWEuYWRkRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIHByZXZlbnREZWZhdWx0cywgZmFsc2UpO1xuICB9KTtcblxuICBbJ2RyYWdlbnRlcicsICdkcmFnb3ZlciddLmZvckVhY2goZXZlbnROYW1lID0+IHtcbiAgICBkcm9wQXJlYS5hZGRFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgaGlnaGxpZ2h0LCBmYWxzZSk7XG4gIH0pO1xuICBcbiAgWydkcmFnbGVhdmUnLCAnZHJvcCddLmZvckVhY2goZXZlbnROYW1lID0+IHtcbiAgICBkcm9wQXJlYS5hZGRFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgdW5oaWdobGlnaHQsIGZhbHNlKTtcbiAgfSk7XG5cbiAgZHJvcEFyZWEuYWRkRXZlbnRMaXN0ZW5lcignZHJvcCcsIGhhbmRsZURyb3AsIGZhbHNlKTtcblxuICB2YXIgX3ZhbGlkRmlsZUV4dGVuc2lvbnMgPSBbJy56aXAnLCAnLnJhciddO1xuXG4gIGZ1bmN0aW9uIFZhbGlkYXRlKGlucHV0KSB7XG4gICAgdmFyIHNGaWxlTmFtZSA9IGlucHV0LnZhbHVlO1xuXG4gICAgaWYgKHNGaWxlTmFtZS5sZW5ndGggPiAwKSB7XG4gICAgICB2YXIgYmxuVmFsaWQgPSBmYWxzZTtcbiAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgX3ZhbGlkRmlsZUV4dGVuc2lvbnMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgdmFyIHNDdXJFeHRlbnNpb24gPSBfdmFsaWRGaWxlRXh0ZW5zaW9uc1tqXTtcbiAgICAgICAgaWYgKHNGaWxlTmFtZS5zdWJzdHIoc0ZpbGVOYW1lLmxlbmd0aCAtIHNDdXJFeHRlbnNpb24ubGVuZ3RoLCBzQ3VyRXh0ZW5zaW9uLmxlbmd0aCkudG9Mb3dlckNhc2UoKSA9PSBzQ3VyRXh0ZW5zaW9uLnRvTG93ZXJDYXNlKCkpIHtcbiAgICAgICAgICBibG5WYWxpZCA9IHRydWU7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKCFibG5WYWxpZCkge1xuICAgICAgICBjb250YWluZXIuY2xhc3NMaXN0LmFkZCgnaGFzLWVycm9yJyk7XG5cbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICBjb250YWluZXIuY2xhc3NMaXN0LnJlbW92ZSgnaGFzLWVycm9yJyk7XG4gICAgICAgIH0sIDIwMDApXG5cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB0cnVlO1xuICB9XG59XG5cbmZ1bmN0aW9uIGluaXRSYW5nZSgpIHtcbiAgdmFyIHNsaWRlcnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuanMtcmFuZ2UnKTtcblxuICBpZiAoIHNsaWRlcnMubGVuZ3RoICkge1xuICAgIGZvciAoY29uc3Qgc2xpZGVyIG9mIHNsaWRlcnMpIHtcbiAgICAgIGxldCBzbGlkZXJTdGVwID0gTnVtYmVyKHNsaWRlci5kYXRhc2V0LnN0ZXApO1xuICAgICAgbGV0IHNsaWRlck1pbiA9IE51bWJlcihzbGlkZXIuZGF0YXNldC5taW4pO1xuICAgICAgbGV0IHNsaWRlck1heCA9IE51bWJlcihzbGlkZXIuZGF0YXNldC5tYXgpO1xuICAgICAgbGV0IHNsaWRlclBpcHMgPSBOdW1iZXIoc2xpZGVyLmRhdGFzZXQucGlwcyk7XG5cbiAgICAgIG5vVWlTbGlkZXIuY3JlYXRlKHNsaWRlciwge1xuICAgICAgICBzdGFydDogWzBdLFxuICAgICAgICBzdGVwOiBzbGlkZXJTdGVwLFxuICAgICAgICByYW5nZToge1xuICAgICAgICAgICdtaW4nOiBzbGlkZXJNaW4sXG4gICAgICAgICAgJ21heCc6IHNsaWRlck1heFxuICAgICAgICB9LFxuICAgICAgICBjb25uZWN0OiAnbG93ZXInLFxuICAgICAgICB0b29sdGlwczogdHJ1ZSxcbiAgICAgICAgZm9ybWF0OiB3TnVtYih7XG4gICAgICAgICAgZGVjaW1hbHM6IDMsXG4gICAgICAgICAgdGhvdXNhbmQ6ICcuJyxcbiAgICAgICAgfSksXG4gICAgICAgIHBpcHM6IHtcbiAgICAgICAgICBtb2RlOiAnY291bnQnLFxuICAgICAgICAgIHZhbHVlczogc2xpZGVyUGlwcyxcbiAgICAgICAgICBzdGVwcGVkOiBmYWxzZVxuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgbGV0IG1pbmlNYXJrZXJzID0gc2xpZGVyLnF1ZXJ5U2VsZWN0b3JBbGwoJy5ub1VpLW1hcmtlci1ob3Jpem9udGFsLm5vVWktbWFya2VyJyk7XG5cbiAgICAgIGlmICggbWluaU1hcmtlcnMubGVuZ3RoICkge1xuICAgICAgICBmb3IgKCBjb25zdCBtaW5pTWFya2VyIG9mIG1pbmlNYXJrZXJzICkge1xuICAgICAgICAgIG1pbmlNYXJrZXIucmVtb3ZlKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gaW5pdEhlYWRlclRvZ2dsZXIoKSB7XG4gIGxldCB0b2dnbGVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLWhlYWRlci10b2dnbGVyJyk7XG4gIGxldCBoZWFkZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtaGVhZGVyJyk7XG4gIGxldCBwYWdlV3JhcCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy1wYWdlLXdyYXAnKTtcbiAgbGV0IGRhcmtuZXNzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLWhlYWRlci1kYXJrbmVzcycpO1xuXG4gIGlmICggdG9nZ2xlciAmJiBoZWFkZXIgJiYgcGFnZVdyYXAgJiYgZGFya25lc3MgKSB7XG4gICAgdG9nZ2xlci5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKCkge1xuICAgICAgaGVhZGVyLmNsYXNzTGlzdC50b2dnbGUoJ2lzLW9wZW4nKTtcbiAgICAgIHRvZ2dsZXIuY2xhc3NMaXN0LnRvZ2dsZSgnaXMtYWN0aXZlJyk7XG4gICAgICBwYWdlV3JhcC5jbGFzc0xpc3QudG9nZ2xlKCdzY3JvbGwtYmxvY2tlZC1tb2JpbGUnKTtcbiAgICB9KTtcblxuICAgIGRhcmtuZXNzLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oKSB7XG4gICAgICBoZWFkZXIuY2xhc3NMaXN0LnJlbW92ZSgnaXMtb3BlbicpO1xuICAgICAgdG9nZ2xlci5jbGFzc0xpc3QucmVtb3ZlKCdpcy1hY3RpdmUnKTtcbiAgICAgIHBhZ2VXcmFwLmNsYXNzTGlzdC5yZW1vdmUoJ3Njcm9sbC1ibG9ja2VkLW1vYmlsZScpO1xuICAgIH0pO1xuICB9XG59XG5cbmZ1bmN0aW9uIGluaXRBbGJ1bXNDYXJkU2xpZGVyKCkge1xuICB2YXIgbXlTd2lwZXIgPSBuZXcgU3dpcGVyKCcuanMtYWxidW1zLWNhcmQtc2xpZGVyJywge1xuICAgIHNwZWVkOiA0MDAsXG4gICAgc2xpZGVzUGVyVmlldzogMSxcbiAgICBuYXZpZ2F0aW9uOiB7XG4gICAgICBuZXh0RWw6ICcuc3dpcGVyLWJ1dHRvbi1uZXh0JyxcbiAgICAgIHByZXZFbDogJy5zd2lwZXItYnV0dG9uLXByZXYnLFxuICAgIH0sXG4gIH0pO1xuXG4gIHJldHVybiBteVN3aXBlcjtcbn1cblxuZnVuY3Rpb24gaW5pdEFsYnVtU2xpZGVyKCkge1xuICB2YXIgbXlTd2lwZXIgPSBuZXcgU3dpcGVyKCcuanMtc3dpcGVyLWFsYnVtJywge1xuICAgIHNwZWVkOiA0MDAsXG4gICAgc2xpZGVzUGVyVmlldzogMSxcbiAgICBsb29wOiBmYWxzZSxcbiAgICBwcmVsb2FkSW1hZ2VzOiBmYWxzZSxcbiAgICBzcGFjZUJldHdlZW46IDEyLFxuICAgIGxhenk6IHRydWUsXG4gICAgbmF2aWdhdGlvbjoge1xuICAgICAgbmV4dEVsOiAnLnN3aXBlci1idXR0b24tbmV4dCcsXG4gICAgICBwcmV2RWw6ICcuc3dpcGVyLWJ1dHRvbi1wcmV2JyxcbiAgICB9LFxuICB9KTtcblxuICByZXR1cm4gbXlTd2lwZXI7XG59XG5cbmZ1bmN0aW9uIGluaXRTd2lwZXIoKSB7XG4gIHZhciBteVN3aXBlciA9IG5ldyBTd2lwZXIoJy5qcy1zd2lwZXItY29udGFpbmVyJywge1xuICAgIHNwZWVkOiA0MDAsXG4gICAgc2xpZGVzUGVyVmlldzogNixcbiAgICBzcGFjZUJldHdlZW46IDQwLFxuICAgIGxvb3A6IGZhbHNlLFxuICAgIHByZWxvYWRJbWFnZXM6IGZhbHNlLFxuICAgIGxhenk6IHRydWUsIFxuICAgIG5hdmlnYXRpb246IHtcbiAgICAgIG5leHRFbDogJy5zd2lwZXItYnV0dG9uLW5leHQnLFxuICAgICAgcHJldkVsOiAnLnN3aXBlci1idXR0b24tcHJldicsXG4gICAgfSxcbiAgICBicmVha3BvaW50czoge1xuICAgICAgNDU5OiB7XG4gICAgICAgIHNsaWRlc1BlclZpZXc6IDEsXG4gICAgICB9LFxuICAgICAgNTk5OiB7XG4gICAgICAgIHNsaWRlc1BlclZpZXc6IDIsXG4gICAgICB9LFxuICAgICAgNzY3OiB7XG4gICAgICAgIHNsaWRlc1BlclZpZXc6IDMsXG4gICAgICB9LFxuICAgICAgMTE5OToge1xuICAgICAgICBzbGlkZXNQZXJWaWV3OiA0LFxuICAgICAgfSxcbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiBteVN3aXBlcjtcbn1cblxuZnVuY3Rpb24gaW5pdFN3aXBlclN0YXRpY2soKSB7XG4gIHZhciBteVN3aXBlciA9IG5ldyBTd2lwZXIoJy5qcy1zd2lwZXItY29udGFpbmVyLXN0YXRpY2snLCB7XG4gICAgc3BlZWQ6IDQwMCxcbiAgICBzbGlkZXNQZXJWaWV3OiA2LFxuICAgIHNwYWNlQmV0d2VlbjogNDAsXG4gICAgbG9vcDogZmFsc2UsXG4gICAgcHJlbG9hZEltYWdlczogZmFsc2UsXG4gICAgbGF6eTogdHJ1ZSxcbiAgICBmb2xsb3dGaW5nZXI6IGZhbHNlLFxuICAgIGJyZWFrcG9pbnRzOiB7XG4gICAgICA0NTk6IHtcbiAgICAgICAgc2xpZGVzUGVyVmlldzogMSxcbiAgICAgIH0sXG4gICAgICA1OTk6IHtcbiAgICAgICAgc2xpZGVzUGVyVmlldzogMixcbiAgICAgIH0sXG4gICAgICA3Njc6IHtcbiAgICAgICAgc2xpZGVzUGVyVmlldzogMyxcbiAgICAgIH0sXG4gICAgICAxMTk5OiB7XG4gICAgICAgIHNsaWRlc1BlclZpZXc6IDQsXG4gICAgICB9LFxuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIG15U3dpcGVyO1xufVxuXG5mdW5jdGlvbiBpbml0TWFpblN3aXBlcigpIHtcbiAgdmFyIG15U3dpcGVyID0gbmV3IFN3aXBlcignLmpzLW1haW4tc3dpcGVyLWNvbnRhaW5lcicsIHtcbiAgICBzcGVlZDogNDAwLFxuICAgIHNsaWRlc1BlclZpZXc6IDEsXG4gICAgbG9vcDogdHJ1ZSxcbiAgICBzcGFjZUJldHdlZW46IDEyLFxuICAgIHBhZ2luYXRpb246IHtcbiAgICAgIGVsOiAnLnN3aXBlci1wYWdpbmF0aW9uJyxcbiAgICAgIHR5cGU6ICdidWxsZXRzJyxcbiAgICAgIGNsaWNrYWJsZTogdHJ1ZVxuICAgIH0sXG4gICAgbmF2aWdhdGlvbjoge1xuICAgICAgbmV4dEVsOiAnLnN3aXBlci1idXR0b24tbmV4dCcsXG4gICAgICBwcmV2RWw6ICcuc3dpcGVyLWJ1dHRvbi1wcmV2JyxcbiAgICB9LFxuICB9KTtcblxuICByZXR1cm4gbXlTd2lwZXI7XG59XG5cbmZ1bmN0aW9uIGluaXRBbGJ1bXNUeXBlU2xpZGVyKCkge1xuICB2YXIgbXlTd2lwZXIgPSBuZXcgU3dpcGVyKCcuanMtdHlwZS1hbGJ1bXMtc3dpcGVyJywge1xuICAgIHNwZWVkOiA0MDAsXG4gICAgc2xpZGVzUGVyVmlldzogJ2F1dG8nLFxuICAgIHNsaWRlc09mZnNldEFmdGVyOiAxMDAsXG4gICAgc3BhY2VCZXR3ZWVuOiAyNCxcbiAgICBuYXZpZ2F0aW9uOiB7XG4gICAgICBuZXh0RWw6ICcuc3dpcGVyLWJ1dHRvbi1uZXh0JyxcbiAgICAgIHByZXZFbDogJy5zd2lwZXItYnV0dG9uLXByZXYnLFxuICAgIH0sXG4gICAgb246IHtcbiAgICAgIHNsaWRlQ2hhbmdlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICggdGhpcy5hY3RpdmVJbmRleCA+IDAgKSB7XG4gICAgICAgICAgdGhpcy5lbC5jbGFzc0xpc3QuYWRkKCdub3Qtb24tc3RhcnQnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLmVsLmNsYXNzTGlzdC5yZW1vdmUoJ25vdC1vbi1zdGFydCcpO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgIH0sXG4gIH0pO1xuXG4gIHJldHVybiBteVN3aXBlcjtcbn1cblxuZnVuY3Rpb24gaW5pdE1haW5DYXJkc1NsaWRlcigpIHtcbiAgdmFyIG15U3dpcGVyID0gbmV3IFN3aXBlcignLmpzLW1haW4tY2FyZC1zbGlkZXInLCB7XG4gICAgc3BlZWQ6IDQwMCxcbiAgICBzbGlkZXNQZXJWaWV3OiAxLFxuICAgIGxvb3A6IHRydWUsXG4gICAgc3BhY2VCZXR3ZWVuOiAxMixcbiAgICBuYXZpZ2F0aW9uOiB7XG4gICAgICBuZXh0RWw6ICcuc3dpcGVyLWJ1dHRvbi1uZXh0JyxcbiAgICAgIHByZXZFbDogJy5zd2lwZXItYnV0dG9uLXByZXYnLFxuICAgIH0sXG4gIH0pO1xuXG4gIHJldHVybiBteVN3aXBlcjtcbn1cblxuZnVuY3Rpb24gdGFiKHRhYkhhbmRsZXIpIHtcbiAgICBsZXQgdGFic0NvbnRhaW5lciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuanMtdGFiLWNvbnRhaW5lclwiKTtcblxuICAgIGlmICggdGFic0NvbnRhaW5lciApIHtcbiAgICAgIGxldCBtZW51SXRlbXMgPSB0YWJzQ29udGFpbmVyLnF1ZXJ5U2VsZWN0b3JBbGwoXCIuanMtdGFiLW1lbnUtaXRlbVwiKTtcbiAgICAgIGxldCB1bmRlcmxpbmUgPSB0YWJzQ29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoXCIuanMtdGFiLXVuZGVybGluZVwiKTtcblxuICAgICAgbWVudUl0ZW1zLmZvckVhY2goIChtZW51SXRlbSkgPT4ge1xuICAgICAgICBpZiAoIHVuZGVybGluZSAmJiBtZW51SXRlbS5jbGFzc0xpc3QuY29udGFpbnMoXCJpcy1hY3RpdmVcIikgKSB7XG4gICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICBjdXJyZW50VGFiQWNjZW50KHVuZGVybGluZSwgbWVudUl0ZW0pO1xuICAgICAgICAgIH0sIDEwMCk7XG4gICAgICAgIH1cblxuICAgICAgICBtZW51SXRlbS5vbmNsaWNrID0gKCkgPT4ge1xuICAgICAgICAgIGxldCBhY3RpdmVNZW51SXRlbSA9IEFycmF5LmZyb20obWVudUl0ZW1zKS5maW5kKGdldEFjdGl2ZVRhYik7XG4gICAgICAgICAgbGV0IGFjdGl2ZUNvbnRlbnRJdGVtID0gdGFic0NvbnRhaW5lci5xdWVyeVNlbGVjdG9yKGFjdGl2ZU1lbnVJdGVtLmRhdGFzZXQudGFyZ2V0KTtcbiAgICAgICAgICBsZXQgY3VycmVudENvbnRlbnRJdGVtID0gdGFic0NvbnRhaW5lci5xdWVyeVNlbGVjdG9yKG1lbnVJdGVtLmRhdGFzZXQudGFyZ2V0KTtcblxuICAgICAgICAgIGFjdGl2ZU1lbnVJdGVtLmNsYXNzTGlzdC5yZW1vdmUoXCJpcy1hY3RpdmVcIik7XG5cbiAgICAgICAgICBpZiAoIGFjdGl2ZUNvbnRlbnRJdGVtICkge1xuICAgICAgICAgICAgYWN0aXZlQ29udGVudEl0ZW0uY2xhc3NMaXN0LnJlbW92ZShcImlzLWFjdGl2ZVwiKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoIGN1cnJlbnRDb250ZW50SXRlbSApIHtcbiAgICAgICAgICAgIGN1cnJlbnRDb250ZW50SXRlbS5jbGFzc0xpc3QuYWRkKFwiaXMtYWN0aXZlXCIpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIG1lbnVJdGVtLmNsYXNzTGlzdC5hZGQoXCJpcy1hY3RpdmVcIik7XG5cbiAgICAgICAgICBpZiAoIHVuZGVybGluZSApIHtcbiAgICAgICAgICAgIGN1cnJlbnRUYWJBY2NlbnQodW5kZXJsaW5lLCBtZW51SXRlbSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKCB0YWJIYW5kbGVyICkge1xuICAgICAgICAgICAgZG9jdW1lbnQuZGlzcGF0Y2hFdmVudCh0YWJIYW5kbGVyKTtcbiAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICB9KTtcbiAgICB9XG5cbiAgZnVuY3Rpb24gY3VycmVudFRhYkFjY2VudCh1bmRlcmxpbmUsIG1lbnVJdGVtKSB7XG4gICAgbGV0IGl0ZW1Qb3NpdGlvbiA9IG1lbnVJdGVtLm9mZnNldExlZnQ7XG4gICAgbGV0IGl0ZW1XaWR0aCA9IE51bWJlcihtZW51SXRlbS5zY3JvbGxXaWR0aCk7XG5cbiAgICByZXR1cm4gdW5kZXJsaW5lLnNldEF0dHJpYnV0ZShcInN0eWxlXCIsIGBsZWZ0OiAke2l0ZW1Qb3NpdGlvbn1weDsgd2lkdGg6ICR7aXRlbVdpZHRofXB4O2ApO1xuICB9XG5cbiAgZnVuY3Rpb24gZ2V0QWN0aXZlVGFiKGVsZW1lbnQpIHtcbiAgICByZXR1cm4gZWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoXCJpcy1hY3RpdmVcIik7XG4gIH1cbn1cblxuZnVuY3Rpb24gYWNjb3JkaW9uKCkge1xuICBsZXQgd3JhcHBlciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy1hY2NvcmRpb24nKTtcbiAgd3JhcHBlci5mb3JFYWNoKHdyYXBwZXJJdGVtID0+IHtcbiAgICBsZXQgaXRlbXMgPSB3cmFwcGVySXRlbS5xdWVyeVNlbGVjdG9yQWxsKCcuanMtYWNjb3JkaW9uLWl0ZW0nKTtcbiAgICBsZXQgaW5kaXZpZHVhbCA9IHdyYXBwZXJJdGVtLmdldEF0dHJpYnV0ZSgnaW5kaXZpZHVhbCcpICYmIHdyYXBwZXJJdGVtLmdldEF0dHJpYnV0ZSgnaW5kaXZpZHVhbCcpICE9PSAnZmFsc2UnO1xuXG4gICAgaXRlbXMuZm9yRWFjaChpdGVtID0+IHtcbiAgICAgIGlmICggaXRlbS5jbGFzc0xpc3QuY29udGFpbnMoJ2lzLWFjdGl2ZScpICkge1xuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICBsZXQgcmVhZHlDb250ZW50ID0gaXRlbS5xdWVyeVNlbGVjdG9yKCcuanMtYWNjb3JkaW9uLWNvbnRlbnQnKTtcbiAgICAgICAgICBsZXQgcmVhZHlDb250ZW50SGVpZ2h0ID0gcmVhZHlDb250ZW50LnNjcm9sbEhlaWdodDtcblxuICAgICAgICAgIHJlYWR5Q29udGVudC5zdHlsZS5tYXhIZWlnaHQgPSByZWFkeUNvbnRlbnRIZWlnaHQgKyAncHgnO1xuICAgICAgICB9LCAxMDApO1xuICAgICAgfVxuXG4gICAgICBsZXQgc3ViSXRlbXMgPSBpdGVtLnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy1hY2NvcmRpb24tc3ViaXRlbScpO1xuXG4gICAgICBmb3IgKGNvbnN0IHN1Ykl0ZW0gb2Ygc3ViSXRlbXMpIHtcbiAgICAgICAgaWYgKCBzdWJJdGVtLmNsYXNzTGlzdC5jb250YWlucygnaXMtYWN0aXZlJykgKSB7XG4gICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICBsZXQgcmVhZHlDb250ZW50ID0gc3ViSXRlbS5xdWVyeVNlbGVjdG9yKCcuanMtYWNjb3JkaW9uLWNvbnRlbnQnKTtcbiAgICAgICAgICAgIGxldCByZWFkeUNvbnRlbnRIZWlnaHQgPSByZWFkeUNvbnRlbnQuc2Nyb2xsSGVpZ2h0O1xuICBcbiAgICAgICAgICAgIHJlYWR5Q29udGVudC5zdHlsZS5tYXhIZWlnaHQgPSByZWFkeUNvbnRlbnRIZWlnaHQgKyAncHgnO1xuICAgICAgICAgIH0sIDEwMCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaXRlbUl0ZXJhdGlvbihpdGVtLCBpdGVtcywgaW5kaXZpZHVhbCk7XG5cbiAgICAgIHN1Ykl0ZW1zLmZvckVhY2goc3ViaXRlbSA9PiB7XG4gICAgICAgIGl0ZW1JdGVyYXRpb24oc3ViaXRlbSwgc3ViSXRlbXMsIGluZGl2aWR1YWwsIHRydWUpXG4gICAgICB9KTtcbiAgICB9KVxuICB9KVxufVxuXG5mdW5jdGlvbiBpdGVtSXRlcmF0aW9uKGl0ZW0sIGl0ZW1zLCBpbmRpdmlkdWFsLCBpc1N1Yml0ZW0pIHtcbiAgbGV0IGluaXQgPSBpdGVtLnF1ZXJ5U2VsZWN0b3IoJy5qcy1hY2NvcmRpb24taW5pdCcpO1xuICBsZXQgY29udGVudCA9IGl0ZW0ucXVlcnlTZWxlY3RvcignLmpzLWFjY29yZGlvbi1jb250ZW50Jyk7XG5cbiAgaWYgKCBpc1N1Yml0ZW0gPT09IHRydWUgKSB7XG4gICAgY29udGVudC5hZGRFdmVudExpc3RlbmVyKCd0cmFuc2l0aW9uZW5kJywgZnVuY3Rpb24oKSB7XG4gICAgICBsZXQgcGFyZW50SXRlbSA9IGl0ZW0uY2xvc2VzdCgnLmpzLWFjY29yZGlvbi1pdGVtJyk7XG4gICAgICBsZXQgcGFyZW50Q29udGVudEhlaWdodCA9IHBhcmVudEl0ZW0uc2Nyb2xsSGVpZ2h0ICsgJ3B4JztcbiAgICAgIGxldCBwYXJlbnRDb250ZW50ID0gcGFyZW50SXRlbS5xdWVyeVNlbGVjdG9yKCcuanMtYWNjb3JkaW9uLWNvbnRlbnQnKTtcblxuICAgICAgcGFyZW50Q29udGVudC5zZXRBdHRyaWJ1dGUoJ3N0eWxlJywgYG1heC1oZWlnaHQ6ICR7cGFyZW50Q29udGVudEhlaWdodH1gKTtcbiAgICB9KTtcbiAgfVxuXG4gIGluaXQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbigpIHtcbiAgICBpZiAoIGl0ZW0uY2xhc3NMaXN0LmNvbnRhaW5zKCdpcy1hY3RpdmUnKSApIHtcbiAgICAgIGl0ZW0uY2xhc3NMaXN0LnJlbW92ZSgnaXMtYWN0aXZlJyk7XG4gICAgICBjb250ZW50LnN0eWxlLm1heEhlaWdodCA9ICcwcHgnO1xuXG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG5cbiAgICBpZiAoIGlzU3ViaXRlbSA9PT0gdHJ1ZSApIHtcbiAgICAgIGxldCBwYXJlbnRJdGVtID0gaXRlbS5jbG9zZXN0KCcuanMtYWNjb3JkaW9uLWl0ZW0nKTtcbiAgICAgIGxldCBwYXJlbnRDb250ZW50ID0gcGFyZW50SXRlbS5xdWVyeVNlbGVjdG9yKCcuanMtYWNjb3JkaW9uLWNvbnRlbnQnKTtcblxuICAgICAgcGFyZW50Q29udGVudC5zZXRBdHRyaWJ1dGUoJ3N0eWxlJywgYG1heC1oZWlnaHQ6IG5vbmVgKTtcbiAgICB9XG5cbiAgICBpZiAoIGluZGl2aWR1YWwgKSB7XG4gICAgICBpdGVtcy5mb3JFYWNoKChlbGVtKSA9PiB7XG4gICAgICAgIGxldCBlbGVtQ29udGVudCA9IGVsZW0ucXVlcnlTZWxlY3RvcignLmpzLWFjY29yZGlvbi1jb250ZW50Jyk7XG4gICAgICAgIGVsZW0uY2xhc3NMaXN0LnJlbW92ZSgnaXMtYWN0aXZlJyk7XG4gICAgICAgIGVsZW1Db250ZW50LnN0eWxlLm1heEhlaWdodCA9IDAgKyAncHgnO1xuICAgICAgfSlcbiAgICB9XG5cbiAgICBpdGVtLmNsYXNzTGlzdC5hZGQoJ2lzLWFjdGl2ZScpO1xuICAgIGNvbnRlbnQuc3R5bGUubWF4SGVpZ2h0ID0gY29udGVudC5zY3JvbGxIZWlnaHQgKyAncHgnO1xuICB9KTtcbn0iXX0=
