'use strict';

document.addEventListener('DOMContentLoaded', function() {
  let tabHandler = new Event('tabHandler');
  let modalSwiper = initModalSwiper();
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
  initModal(modalSwiper);
  validateFrom();
  cardHeaderHandle(modalSwiper, 'http://f36350975817.ngrok.io/api/album/images_slider?id=');
  choiceType();

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

function choiceType() {
  let types = document.querySelectorAll('.js-choice-type');
  let container = document.querySelector('.js-choice-type-addings');
  let outputContainer = document.querySelector('.js-choice-type-output');

  if ( !types.length || !container ) {
    return
  }

  for (const type of types) {
    let wrapper = type.querySelector('.calculate-types__wrapper');
    let list = type.querySelectorAll('.js-choice-type-list li');
    let arrList = [];

    for (const item of list) {
      arrList.push(item.textContent);
    }

    type.addEventListener('click', function() {
      for (const typeIn of types) {
        let wrap = typeIn.querySelector('.calculate-types__wrapper');
        wrap.classList.remove('is-active');
      }

      if ( !list.length || list.length < 2 ) {
        container.classList.remove('is-active');

        return
      }

      wrapper.classList.add('is-active');
      container.classList.add('is-active');
      outputContainer.innerHTML = '';

      list.forEach((item, idx) => {
        if ( idx === 0 ) {
          outputContainer.appendChild(createCheckmark(item.textContent, true));
        } else {
          outputContainer.appendChild(createCheckmark(item.textContent, false));
        }
      });
    });
  }
}

function createCheckmark(text, first) {
  let checkmarkWrapper;

  if ( first ) {
    checkmarkWrapper = createElement('div', 'col-12');
  } else {
    checkmarkWrapper = createElement('div', 'col-12 mt-3');
  }

  let checkmark = createElement('label', 'checkmark');
  let input = createElement('input', '');
  setAttributes(input, {
    'type': 'radio',
    'name': 'types'
  });
  let mark = createElement('span', 'checkmark__mark');
  let varText = createElement('p', '');

  varText.textContent = text;
  checkmark.appendChild(input);
  checkmark.appendChild(mark);
  checkmark.appendChild(varText);
  checkmarkWrapper.appendChild(checkmark);

  return checkmarkWrapper;
}

function createElement(tag, className) {
  let elem = document.createElement(tag);
  elem.classList = className;

  return elem;
}

function setAttributes(el, attrs) {
  for(var key in attrs) {
    el.setAttribute(key, attrs[key]);
  }
}

function cardHeaderHandle(modalSwiper, url) {
  let targets = document.querySelectorAll('.js-modal-init');

  if ( targets.length ) {
    targets.forEach(target => {
      let targetId = target.dataset.id;
      target.addEventListener('click', function() {
        getSlidersData(modalSwiper, `${url + targetId}`);
      });
    });
  }
}

function getSlidersData(container, url) {
  let xhr = new XMLHttpRequest();
  xhr.open('GET', url);
  xhr.send();

  if ( !container ) {
    return;
  }

  xhr.onload = function() {
    if (xhr.status != 200) {
      console.log(`Ошибка ${xhr.status}: ${xhr.statusText}`);
    } else {
      let data = JSON.parse(xhr.response);
      container.removeAllSlides();

      data.forEach(item => {
        let slideContent = createSlide(item);
        container.appendSlide(slideContent);
      });
    }
  };

  xhr.onerror = function() {
    console.log("Запрос не удался");
  };
}

function createSlide(str) {
  let img = document.createElement('img');
  let slide = document.createElement('div');
  slide.classList.add('swiper-slide', 'main-slider__slide');
  img.src = 'http://f36350975817.ngrok.io' + str;
  slide.appendChild(img);

  return slide;
}

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

function initModal(modalSwiper) {
  let inits = document.querySelectorAll('.js-modal-init');
  let body = document.body;

  if ( inits.length ) {
    for (const init of inits) {
      let target = document.querySelector(init.dataset.target);
      let closes = target.querySelectorAll('.js-modal-close');

      if ( closes.length ) {
        for (const close of closes) {
          close.addEventListener('click', function() {
            target.classList.remove('is-active');
            body.classList.remove('modal-is-active');
          });
        }
      }

      if ( target ) {
        init.addEventListener('click', function() {
          target.classList.add('is-active');
          body.classList.add('modal-is-active');

          if ( target.dataset.slider == 'true' ) {
            modalSwiper.update();
          }
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

function initModalSwiper() {
  var mySwiper = new Swiper('.js-main-swiper-modal', {
    speed: 400,
    slidesPerView: 1,
    loop: true,
    spaceBetween: 12,
    preloadImages: false,
    lazy: true,
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiYXBwLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xuXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgZnVuY3Rpb24oKSB7XG4gIGxldCB0YWJIYW5kbGVyID0gbmV3IEV2ZW50KCd0YWJIYW5kbGVyJyk7XG4gIGxldCBtb2RhbFN3aXBlciA9IGluaXRNb2RhbFN3aXBlcigpO1xuICBsZXQgc3dpcGVycyA9IGluaXRTd2lwZXIoKTtcbiAgc3ZnNGV2ZXJ5Ym9keSgpO1xuICBpbml0TWFpblN3aXBlcigpO1xuICBpbml0SGVhZGVyVG9nZ2xlcigpO1xuICBpbml0QWxidW1zQ2FyZFNsaWRlcigpO1xuICBhY2NvcmRpb24oKTtcbiAgaW5pdEFsYnVtc1R5cGVTbGlkZXIoKTtcbiAgaW5pdFN3aXBlclN0YXRpY2soKTtcbiAgaW5pdEFsYnVtU2xpZGVyKCk7XG4gIHRhYih0YWJIYW5kbGVyKTtcbiAgaW5pdFJhbmdlKCk7XG4gIGluaXREcmFnTkRyb3AoKTtcbiAgaW5pdE1vZGFsKG1vZGFsU3dpcGVyKTtcbiAgdmFsaWRhdGVGcm9tKCk7XG4gIGNhcmRIZWFkZXJIYW5kbGUobW9kYWxTd2lwZXIsICdodHRwOi8vZjM2MzUwOTc1ODE3Lm5ncm9rLmlvL2FwaS9hbGJ1bS9pbWFnZXNfc2xpZGVyP2lkPScpO1xuICBjaG9pY2VUeXBlKCk7XG5cbiAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigndGFiSGFuZGxlcicsIGZ1bmN0aW9uKCkge1xuICAgIGlmICggIXN3aXBlcnMubGVuZ3RoICkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHN3aXBlcnMuZm9yRWFjaChzd2lwZXIgPT4ge1xuICAgICAgc3dpcGVyLnVwZGF0ZSgpO1xuICAgIH0pO1xuXG4gIH0sIGZhbHNlKTtcblxuICBpZiAoIHdpbmRvdy5pbm5lcldpZHRoIDwgNzY4ICkge1xuICAgIGluaXRNYWluQ2FyZHNTbGlkZXIoKTtcbiAgfVxufSk7XG5cbmZ1bmN0aW9uIGNob2ljZVR5cGUoKSB7XG4gIGxldCB0eXBlcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy1jaG9pY2UtdHlwZScpO1xuICBsZXQgY29udGFpbmVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLWNob2ljZS10eXBlLWFkZGluZ3MnKTtcbiAgbGV0IG91dHB1dENvbnRhaW5lciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy1jaG9pY2UtdHlwZS1vdXRwdXQnKTtcblxuICBpZiAoICF0eXBlcy5sZW5ndGggfHwgIWNvbnRhaW5lciApIHtcbiAgICByZXR1cm5cbiAgfVxuXG4gIGZvciAoY29uc3QgdHlwZSBvZiB0eXBlcykge1xuICAgIGxldCB3cmFwcGVyID0gdHlwZS5xdWVyeVNlbGVjdG9yKCcuY2FsY3VsYXRlLXR5cGVzX193cmFwcGVyJyk7XG4gICAgbGV0IGxpc3QgPSB0eXBlLnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy1jaG9pY2UtdHlwZS1saXN0IGxpJyk7XG4gICAgbGV0IGFyckxpc3QgPSBbXTtcblxuICAgIGZvciAoY29uc3QgaXRlbSBvZiBsaXN0KSB7XG4gICAgICBhcnJMaXN0LnB1c2goaXRlbS50ZXh0Q29udGVudCk7XG4gICAgfVxuXG4gICAgdHlwZS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKCkge1xuICAgICAgZm9yIChjb25zdCB0eXBlSW4gb2YgdHlwZXMpIHtcbiAgICAgICAgbGV0IHdyYXAgPSB0eXBlSW4ucXVlcnlTZWxlY3RvcignLmNhbGN1bGF0ZS10eXBlc19fd3JhcHBlcicpO1xuICAgICAgICB3cmFwLmNsYXNzTGlzdC5yZW1vdmUoJ2lzLWFjdGl2ZScpO1xuICAgICAgfVxuXG4gICAgICBpZiAoICFsaXN0Lmxlbmd0aCB8fCBsaXN0Lmxlbmd0aCA8IDIgKSB7XG4gICAgICAgIGNvbnRhaW5lci5jbGFzc0xpc3QucmVtb3ZlKCdpcy1hY3RpdmUnKTtcblxuICAgICAgICByZXR1cm5cbiAgICAgIH1cblxuICAgICAgd3JhcHBlci5jbGFzc0xpc3QuYWRkKCdpcy1hY3RpdmUnKTtcbiAgICAgIGNvbnRhaW5lci5jbGFzc0xpc3QuYWRkKCdpcy1hY3RpdmUnKTtcbiAgICAgIG91dHB1dENvbnRhaW5lci5pbm5lckhUTUwgPSAnJztcblxuICAgICAgbGlzdC5mb3JFYWNoKChpdGVtLCBpZHgpID0+IHtcbiAgICAgICAgaWYgKCBpZHggPT09IDAgKSB7XG4gICAgICAgICAgb3V0cHV0Q29udGFpbmVyLmFwcGVuZENoaWxkKGNyZWF0ZUNoZWNrbWFyayhpdGVtLnRleHRDb250ZW50LCB0cnVlKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgb3V0cHV0Q29udGFpbmVyLmFwcGVuZENoaWxkKGNyZWF0ZUNoZWNrbWFyayhpdGVtLnRleHRDb250ZW50LCBmYWxzZSkpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxufVxuXG5mdW5jdGlvbiBjcmVhdGVDaGVja21hcmsodGV4dCwgZmlyc3QpIHtcbiAgbGV0IGNoZWNrbWFya1dyYXBwZXI7XG5cbiAgaWYgKCBmaXJzdCApIHtcbiAgICBjaGVja21hcmtXcmFwcGVyID0gY3JlYXRlRWxlbWVudCgnZGl2JywgJ2NvbC0xMicpO1xuICB9IGVsc2Uge1xuICAgIGNoZWNrbWFya1dyYXBwZXIgPSBjcmVhdGVFbGVtZW50KCdkaXYnLCAnY29sLTEyIG10LTMnKTtcbiAgfVxuXG4gIGxldCBjaGVja21hcmsgPSBjcmVhdGVFbGVtZW50KCdsYWJlbCcsICdjaGVja21hcmsnKTtcbiAgbGV0IGlucHV0ID0gY3JlYXRlRWxlbWVudCgnaW5wdXQnLCAnJyk7XG4gIHNldEF0dHJpYnV0ZXMoaW5wdXQsIHtcbiAgICAndHlwZSc6ICdyYWRpbycsXG4gICAgJ25hbWUnOiAndHlwZXMnXG4gIH0pO1xuICBsZXQgbWFyayA9IGNyZWF0ZUVsZW1lbnQoJ3NwYW4nLCAnY2hlY2ttYXJrX19tYXJrJyk7XG4gIGxldCB2YXJUZXh0ID0gY3JlYXRlRWxlbWVudCgncCcsICcnKTtcblxuICB2YXJUZXh0LnRleHRDb250ZW50ID0gdGV4dDtcbiAgY2hlY2ttYXJrLmFwcGVuZENoaWxkKGlucHV0KTtcbiAgY2hlY2ttYXJrLmFwcGVuZENoaWxkKG1hcmspO1xuICBjaGVja21hcmsuYXBwZW5kQ2hpbGQodmFyVGV4dCk7XG4gIGNoZWNrbWFya1dyYXBwZXIuYXBwZW5kQ2hpbGQoY2hlY2ttYXJrKTtcblxuICByZXR1cm4gY2hlY2ttYXJrV3JhcHBlcjtcbn1cblxuZnVuY3Rpb24gY3JlYXRlRWxlbWVudCh0YWcsIGNsYXNzTmFtZSkge1xuICBsZXQgZWxlbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQodGFnKTtcbiAgZWxlbS5jbGFzc0xpc3QgPSBjbGFzc05hbWU7XG5cbiAgcmV0dXJuIGVsZW07XG59XG5cbmZ1bmN0aW9uIHNldEF0dHJpYnV0ZXMoZWwsIGF0dHJzKSB7XG4gIGZvcih2YXIga2V5IGluIGF0dHJzKSB7XG4gICAgZWwuc2V0QXR0cmlidXRlKGtleSwgYXR0cnNba2V5XSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gY2FyZEhlYWRlckhhbmRsZShtb2RhbFN3aXBlciwgdXJsKSB7XG4gIGxldCB0YXJnZXRzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmpzLW1vZGFsLWluaXQnKTtcblxuICBpZiAoIHRhcmdldHMubGVuZ3RoICkge1xuICAgIHRhcmdldHMuZm9yRWFjaCh0YXJnZXQgPT4ge1xuICAgICAgbGV0IHRhcmdldElkID0gdGFyZ2V0LmRhdGFzZXQuaWQ7XG4gICAgICB0YXJnZXQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbigpIHtcbiAgICAgICAgZ2V0U2xpZGVyc0RhdGEobW9kYWxTd2lwZXIsIGAke3VybCArIHRhcmdldElkfWApO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gZ2V0U2xpZGVyc0RhdGEoY29udGFpbmVyLCB1cmwpIHtcbiAgbGV0IHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuICB4aHIub3BlbignR0VUJywgdXJsKTtcbiAgeGhyLnNlbmQoKTtcblxuICBpZiAoICFjb250YWluZXIgKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgeGhyLm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgIGlmICh4aHIuc3RhdHVzICE9IDIwMCkge1xuICAgICAgY29uc29sZS5sb2coYNCe0YjQuNCx0LrQsCAke3hoci5zdGF0dXN9OiAke3hoci5zdGF0dXNUZXh0fWApO1xuICAgIH0gZWxzZSB7XG4gICAgICBsZXQgZGF0YSA9IEpTT04ucGFyc2UoeGhyLnJlc3BvbnNlKTtcbiAgICAgIGNvbnRhaW5lci5yZW1vdmVBbGxTbGlkZXMoKTtcblxuICAgICAgZGF0YS5mb3JFYWNoKGl0ZW0gPT4ge1xuICAgICAgICBsZXQgc2xpZGVDb250ZW50ID0gY3JlYXRlU2xpZGUoaXRlbSk7XG4gICAgICAgIGNvbnRhaW5lci5hcHBlbmRTbGlkZShzbGlkZUNvbnRlbnQpO1xuICAgICAgfSk7XG4gICAgfVxuICB9O1xuXG4gIHhoci5vbmVycm9yID0gZnVuY3Rpb24oKSB7XG4gICAgY29uc29sZS5sb2coXCLQl9Cw0L/RgNC+0YEg0L3QtSDRg9C00LDQu9GB0Y9cIik7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVNsaWRlKHN0cikge1xuICBsZXQgaW1nID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW1nJyk7XG4gIGxldCBzbGlkZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICBzbGlkZS5jbGFzc0xpc3QuYWRkKCdzd2lwZXItc2xpZGUnLCAnbWFpbi1zbGlkZXJfX3NsaWRlJyk7XG4gIGltZy5zcmMgPSAnaHR0cDovL2YzNjM1MDk3NTgxNy5uZ3Jvay5pbycgKyBzdHI7XG4gIHNsaWRlLmFwcGVuZENoaWxkKGltZyk7XG5cbiAgcmV0dXJuIHNsaWRlO1xufVxuXG5mdW5jdGlvbiB2YWxpZGF0ZUZyb20oKSB7XG4gIGxldCBmb3JtcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy1mb3JtLXZhbGlkYXRlJyk7XG5cbiAgaWYgKCBmb3Jtcy5sZW5ndGggKSB7XG4gICAgZm9yIChjb25zdCBmb3JtIG9mIGZvcm1zKSB7XG4gICAgICBsZXQgZmllbGRzID0gZm9ybS5xdWVyeVNlbGVjdG9yQWxsKCcuanMtZm9ybS12YWxpZGF0ZS1pbnB1dCBpbnB1dCcpO1xuICAgICAgbGV0IGZpbGUgPSBmb3JtLnF1ZXJ5U2VsZWN0b3IoJy5qcy1jYWxjdWxhdGUtZmlsZS1pbnB1dCcpO1xuICAgICAgbGV0IHZhbGlkRm9ybSA9IGZhbHNlO1xuXG4gICAgICBmb3IgKGNvbnN0IGZpZWxkIG9mIGZpZWxkcykge1xuICAgICAgICBmaWVsZC5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICBpZiAoICF2YWxpZGF0ZUZpZWxkKGZpZWxkKSApIHtcbiAgICAgICAgICAgIGZpZWxkLmNsYXNzTGlzdC5hZGQoJ2hhcy1lcnJvcicpO1xuICAgICAgICAgICAgdmFsaWRGb3JtID0gZmFsc2U7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGZpZWxkLmNsYXNzTGlzdC5yZW1vdmUoJ2hhcy1lcnJvcicpO1xuICAgICAgICAgICAgdmFsaWRGb3JtID0gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICBmb3JtLmFkZEV2ZW50TGlzdGVuZXIoJ3N1Ym1pdCcsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgIGZvciAoY29uc3QgZmllbGQgb2YgZmllbGRzKSB7XG4gICAgICAgICAgaWYgKCAhdmFsaWRhdGVGaWVsZChmaWVsZCkgKSB7XG4gICAgICAgICAgICBmaWVsZC5jbGFzc0xpc3QuYWRkKCdoYXMtZXJyb3InKTtcbiAgICAgICAgICAgIHZhbGlkRm9ybSA9IGZhbHNlO1xuXG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZmllbGQuY2xhc3NMaXN0LnJlbW92ZSgnaGFzLWVycm9yJyk7XG4gICAgICAgICAgICB2YWxpZEZvcm0gPSB0cnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmICggdmFsaWRGb3JtICkge1xuICAgICAgICAgIGxldCBmb3JtRGF0YSA9IG5ldyBGb3JtRGF0YShmb3JtKTtcblxuICAgICAgICAgIGlmICggZmlsZSApIHtcbiAgICAgICAgICAgIGZvcm1EYXRhLmFwcGVuZCgnZmlsZScsIGZpbGUuZmlsZXNbMF0pO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGxldCBzdWNjZXNzID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBmb3JtLmNsYXNzTGlzdC5hZGQoJ3N1Y2Nlc3MnKTtcbiAgICAgICAgICB9O1xuXG4gICAgICAgICAgc2VuZERhdGEoZm9ybURhdGEsICcvJywgc3VjY2Vzcyk7XG5cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb25zb2xlLmxvZygndW52YWxpZCBmb3JtJylcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gdmFsaWRhdGVGaWVsZChpbnB1dCkge1xuICBsZXQgdmFsdWUgPSBpbnB1dC52YWx1ZTtcbiAgbGV0IHR5cGUgPSBpbnB1dC50eXBlO1xuICBsZXQgcmVzdWx0ID0gZmFsc2U7XG5cbiAgaWYgKCB0eXBlID09ICd0ZWwnICkge1xuICAgIHJlc3VsdCA9IHZhbGlkYXRlUGhvbmUodmFsdWUpO1xuICB9IGVsc2UgaWYgKCB0eXBlID09ICdlbWFpbCcgKSB7XG4gICAgcmVzdWx0ID0gdmFsaWRhdGVNYWlsKHZhbHVlKTtcbiAgfSBlbHNlIHtcbiAgICByZXN1bHQgPSAhaXNFbXB0eSh2YWx1ZSk7XG4gIH1cblxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5mdW5jdGlvbiBpc0VtcHR5KHN0cikge1xuICByZXR1cm4gc3RyID09ICcnICYmIHRydWU7XG59XG5cbmZ1bmN0aW9uIHZhbGlkYXRlUGhvbmUoc3RyKSB7XG4gIGxldCByZWcgPSAvXltcXCtdP1soXT9bMC05XXszfVspXT9bLVxcc1xcLl0/WzAtOV17M31bLVxcc1xcLl0/WzAtOV17NCw2fSQvaW07XG4gIHJldHVybiB0ZXN0UmVnKHJlZywgcmVtb3ZlU3BhY2VzKHN0cikpO1xufVxuXG5mdW5jdGlvbiB2YWxpZGF0ZU1haWwoc3RyKSB7XG4gIGxldCByZXN1bHQgPSBmYWxzZTtcbiAgY29uc3QgcmVnID0gL14oKFtePD4oKVtcXF1cXFxcLiw7Olxcc0BcXFwiXSsoXFwuW148PigpW1xcXVxcXFwuLDs6XFxzQFxcXCJdKykqKXwoXFxcIi4rXFxcIikpQCgoXFxbWzAtOV17MSwzfVxcLlswLTldezEsM31cXC5bMC05XXsxLDN9XFwuWzAtOV17MSwzfVxcXSl8KChbYS16QS1aXFwtMC05XStcXC4pK1thLXpBLVpdezIsfSkpJC87XG4gIHJlc3VsdCA9IHRlc3RSZWcocmVnLCBzdHIpXG4gIHJldHVybiByZXN1bHQ7XG59XG5cbmZ1bmN0aW9uIHJlbW92ZVNwYWNlcyhzdHIpIHtcbiAgcmV0dXJuIHN0ci5yZXBsYWNlKC9cXHMvZywgJycpOztcbn1cblxuZnVuY3Rpb24gdGVzdFJlZyhyZSwgc3RyKXtcbiAgaWYgKHJlLnRlc3Qoc3RyKSkge1xuICAgIHJldHVybiB0cnVlO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxufVxuXG5mdW5jdGlvbiBzZW5kRGF0YShkYXRhLCB1cmwsIHN1Y2Nlc3MpIHtcbiAgaWYgKCAhZGF0YSB8fCAhdXJsICkge1xuICAgIHJldHVybiBjb25zb2xlLmxvZygnZXJyb3IsIGhhdmUgbm8gZGF0YSBvciB1cmwnKTtcbiAgfVxuXG4gIGxldCB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcblxuICB4aHIub25sb2FkZW5kID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKHhoci5zdGF0dXMgPT0gMjAwKSB7XG4gICAgICBsZXQgc3VjY2Vzc0Z1ID0gc3VjY2VzcztcblxuICAgICAgc3VjY2Vzc0Z1KCk7XG4gICAgICBjb25zb2xlLmxvZyhcItCj0YHQv9C10YVcIik7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUubG9nKFwi0J7RiNC40LHQutCwIFwiICsgdGhpcy5zdGF0dXMpO1xuICAgIH1cbiAgfTtcblxuICB4aHIub3BlbihcIlBPU1RcIiwgdXJsKTtcbiAgeGhyLnNlbmQoZGF0YSk7XG59XG5cbmZ1bmN0aW9uIGluaXRNb2RhbChtb2RhbFN3aXBlcikge1xuICBsZXQgaW5pdHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuanMtbW9kYWwtaW5pdCcpO1xuICBsZXQgYm9keSA9IGRvY3VtZW50LmJvZHk7XG5cbiAgaWYgKCBpbml0cy5sZW5ndGggKSB7XG4gICAgZm9yIChjb25zdCBpbml0IG9mIGluaXRzKSB7XG4gICAgICBsZXQgdGFyZ2V0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcihpbml0LmRhdGFzZXQudGFyZ2V0KTtcbiAgICAgIGxldCBjbG9zZXMgPSB0YXJnZXQucXVlcnlTZWxlY3RvckFsbCgnLmpzLW1vZGFsLWNsb3NlJyk7XG5cbiAgICAgIGlmICggY2xvc2VzLmxlbmd0aCApIHtcbiAgICAgICAgZm9yIChjb25zdCBjbG9zZSBvZiBjbG9zZXMpIHtcbiAgICAgICAgICBjbG9zZS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGFyZ2V0LmNsYXNzTGlzdC5yZW1vdmUoJ2lzLWFjdGl2ZScpO1xuICAgICAgICAgICAgYm9keS5jbGFzc0xpc3QucmVtb3ZlKCdtb2RhbC1pcy1hY3RpdmUnKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoIHRhcmdldCApIHtcbiAgICAgICAgaW5pdC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHRhcmdldC5jbGFzc0xpc3QuYWRkKCdpcy1hY3RpdmUnKTtcbiAgICAgICAgICBib2R5LmNsYXNzTGlzdC5hZGQoJ21vZGFsLWlzLWFjdGl2ZScpO1xuXG4gICAgICAgICAgaWYgKCB0YXJnZXQuZGF0YXNldC5zbGlkZXIgPT0gJ3RydWUnICkge1xuICAgICAgICAgICAgbW9kYWxTd2lwZXIudXBkYXRlKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gaW5pdERyYWdORHJvcCgpIHtcbiAgbGV0IGNvbnRhaW5lciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy1jYWxjdWxhdGUtZmlsZScpO1xuICBsZXQgZHJvcEFyZWEgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtY2FsY3VsYXRlLWZpbGUtZHJvcGFyZWEnKTtcbiAgbGV0IGZpbGVFbGVtID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLWNhbGN1bGF0ZS1maWxlLWlucHV0Jyk7XG4gIGxldCBhZGRpbmdzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLWNhbGN1bGF0ZS1maWxlLWFkZGluZ3MnKTtcbiAgbGV0IGZpbGVOYW1lID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLWNhbGN1bGF0ZS1maWxlLW5hbWUnKTtcbiAgbGV0IHJlbW92ZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtY2FsY3VsYXRlLWZpbGUtcmVtb3ZlcicpO1xuXG4gIGlmICggIWNvbnRhaW5lciAmJiAhZHJvcEFyZWEgJiYgIWZpbGVFbGVtICYmICFhZGRpbmdzICYmICFmaWxlTmFtZSAmJiAhcmVtb3ZlciApIHtcbiAgICByZXR1cm47XG4gIH1cblxuICBmdW5jdGlvbiBwcmV2ZW50RGVmYXVsdHMgKGUpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgfTtcblxuICBmdW5jdGlvbiBoaWdobGlnaHQoKSB7XG4gICAgY29udGFpbmVyLmNsYXNzTGlzdC5hZGQoJ2hpZ2hsaWdodCcpO1xuICB9O1xuXG4gIGZ1bmN0aW9uIHVuaGlnaGxpZ2h0KCkge1xuICAgIGNvbnRhaW5lci5jbGFzc0xpc3QucmVtb3ZlKCdoaWdobGlnaHQnKTtcbiAgfTtcblxuICBmdW5jdGlvbiBoYW5kbGVGaWxlcyhmaWxlcykge1xuICAgIGFkZGluZ3MuY2xhc3NMaXN0LmFkZCgnaXMtc2hvdycpO1xuICAgIGNvbnRhaW5lci5jbGFzc0xpc3QuYWRkKCdoYXMtcmVzdWx0Jyk7XG4gICAgZmlsZU5hbWUudGV4dENvbnRlbnQgPSBmaWxlc1swXS5uYW1lO1xuICB9O1xuXG4gIGZ1bmN0aW9uIGhhbmRsZVJlbW92ZUZpbGVzKCkge1xuICAgIGFkZGluZ3MuY2xhc3NMaXN0LnJlbW92ZSgnaXMtc2hvdycpO1xuICAgIGNvbnRhaW5lci5jbGFzc0xpc3QucmVtb3ZlKCdoYXMtcmVzdWx0Jyk7XG4gICAgZmlsZU5hbWUudGV4dENvbnRlbnQgPSAnJztcbiAgICBmaWxlRWxlbS52YWx1ZSA9ICcnO1xuICB9O1xuXG4gIGZ1bmN0aW9uIGhhbmRsZURyb3AoZSkge1xuICAgIGxldCBkdCA9IGUuZGF0YVRyYW5zZmVyO1xuICAgIGxldCBmaWxlcyA9IGR0LmZpbGVzO1xuXG4gICAgaWYgKCBWYWxpZGF0ZSh0aGlzKSApIHtcbiAgICAgIGhhbmRsZUZpbGVzKGZpbGVzKTtcbiAgICB9XG4gIH07XG5cbiAgZmlsZUVsZW0uYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgZnVuY3Rpb24oKSB7XG4gICAgaWYgKCBWYWxpZGF0ZSh0aGlzKSApIHtcbiAgICAgIGhhbmRsZUZpbGVzKHRoaXMuZmlsZXMpO1xuICAgIH1cbiAgfSk7XG5cbiAgcmVtb3Zlci5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKCkge1xuICAgIGhhbmRsZVJlbW92ZUZpbGVzKCk7XG4gIH0pO1xuXG4gIFsnZHJhZ2VudGVyJywgJ2RyYWdvdmVyJywgJ2RyYWdsZWF2ZScsICdkcm9wJ10uZm9yRWFjaChldmVudE5hbWUgPT4ge1xuICAgIGRyb3BBcmVhLmFkZEV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCBwcmV2ZW50RGVmYXVsdHMsIGZhbHNlKTtcbiAgfSk7XG5cbiAgWydkcmFnZW50ZXInLCAnZHJhZ292ZXInXS5mb3JFYWNoKGV2ZW50TmFtZSA9PiB7XG4gICAgZHJvcEFyZWEuYWRkRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIGhpZ2hsaWdodCwgZmFsc2UpO1xuICB9KTtcbiAgXG4gIFsnZHJhZ2xlYXZlJywgJ2Ryb3AnXS5mb3JFYWNoKGV2ZW50TmFtZSA9PiB7XG4gICAgZHJvcEFyZWEuYWRkRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIHVuaGlnaGxpZ2h0LCBmYWxzZSk7XG4gIH0pO1xuXG4gIGRyb3BBcmVhLmFkZEV2ZW50TGlzdGVuZXIoJ2Ryb3AnLCBoYW5kbGVEcm9wLCBmYWxzZSk7XG5cbiAgdmFyIF92YWxpZEZpbGVFeHRlbnNpb25zID0gWycuemlwJywgJy5yYXInXTtcblxuICBmdW5jdGlvbiBWYWxpZGF0ZShpbnB1dCkge1xuICAgIHZhciBzRmlsZU5hbWUgPSBpbnB1dC52YWx1ZTtcblxuICAgIGlmIChzRmlsZU5hbWUubGVuZ3RoID4gMCkge1xuICAgICAgdmFyIGJsblZhbGlkID0gZmFsc2U7XG4gICAgICBmb3IgKHZhciBqID0gMDsgaiA8IF92YWxpZEZpbGVFeHRlbnNpb25zLmxlbmd0aDsgaisrKSB7XG4gICAgICAgIHZhciBzQ3VyRXh0ZW5zaW9uID0gX3ZhbGlkRmlsZUV4dGVuc2lvbnNbal07XG4gICAgICAgIGlmIChzRmlsZU5hbWUuc3Vic3RyKHNGaWxlTmFtZS5sZW5ndGggLSBzQ3VyRXh0ZW5zaW9uLmxlbmd0aCwgc0N1ckV4dGVuc2lvbi5sZW5ndGgpLnRvTG93ZXJDYXNlKCkgPT0gc0N1ckV4dGVuc2lvbi50b0xvd2VyQ2FzZSgpKSB7XG4gICAgICAgICAgYmxuVmFsaWQgPSB0cnVlO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmICghYmxuVmFsaWQpIHtcbiAgICAgICAgY29udGFpbmVyLmNsYXNzTGlzdC5hZGQoJ2hhcy1lcnJvcicpO1xuXG4gICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgY29udGFpbmVyLmNsYXNzTGlzdC5yZW1vdmUoJ2hhcy1lcnJvcicpO1xuICAgICAgICB9LCAyMDAwKVxuXG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxufVxuXG5mdW5jdGlvbiBpbml0UmFuZ2UoKSB7XG4gIHZhciBzbGlkZXJzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmpzLXJhbmdlJyk7XG5cbiAgaWYgKCBzbGlkZXJzLmxlbmd0aCApIHtcbiAgICBmb3IgKGNvbnN0IHNsaWRlciBvZiBzbGlkZXJzKSB7XG4gICAgICBsZXQgc2xpZGVyU3RlcCA9IE51bWJlcihzbGlkZXIuZGF0YXNldC5zdGVwKTtcbiAgICAgIGxldCBzbGlkZXJNaW4gPSBOdW1iZXIoc2xpZGVyLmRhdGFzZXQubWluKTtcbiAgICAgIGxldCBzbGlkZXJNYXggPSBOdW1iZXIoc2xpZGVyLmRhdGFzZXQubWF4KTtcbiAgICAgIGxldCBzbGlkZXJQaXBzID0gTnVtYmVyKHNsaWRlci5kYXRhc2V0LnBpcHMpO1xuXG4gICAgICBub1VpU2xpZGVyLmNyZWF0ZShzbGlkZXIsIHtcbiAgICAgICAgc3RhcnQ6IFswXSxcbiAgICAgICAgc3RlcDogc2xpZGVyU3RlcCxcbiAgICAgICAgcmFuZ2U6IHtcbiAgICAgICAgICAnbWluJzogc2xpZGVyTWluLFxuICAgICAgICAgICdtYXgnOiBzbGlkZXJNYXhcbiAgICAgICAgfSxcbiAgICAgICAgY29ubmVjdDogJ2xvd2VyJyxcbiAgICAgICAgdG9vbHRpcHM6IHRydWUsXG4gICAgICAgIGZvcm1hdDogd051bWIoe1xuICAgICAgICAgIGRlY2ltYWxzOiAzLFxuICAgICAgICAgIHRob3VzYW5kOiAnLicsXG4gICAgICAgIH0pLFxuICAgICAgICBwaXBzOiB7XG4gICAgICAgICAgbW9kZTogJ2NvdW50JyxcbiAgICAgICAgICB2YWx1ZXM6IHNsaWRlclBpcHMsXG4gICAgICAgICAgc3RlcHBlZDogZmFsc2VcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIGxldCBtaW5pTWFya2VycyA9IHNsaWRlci5xdWVyeVNlbGVjdG9yQWxsKCcubm9VaS1tYXJrZXItaG9yaXpvbnRhbC5ub1VpLW1hcmtlcicpO1xuXG4gICAgICBpZiAoIG1pbmlNYXJrZXJzLmxlbmd0aCApIHtcbiAgICAgICAgZm9yICggY29uc3QgbWluaU1hcmtlciBvZiBtaW5pTWFya2VycyApIHtcbiAgICAgICAgICBtaW5pTWFya2VyLnJlbW92ZSgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGluaXRIZWFkZXJUb2dnbGVyKCkge1xuICBsZXQgdG9nZ2xlciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy1oZWFkZXItdG9nZ2xlcicpO1xuICBsZXQgaGVhZGVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLWhlYWRlcicpO1xuICBsZXQgcGFnZVdyYXAgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtcGFnZS13cmFwJyk7XG4gIGxldCBkYXJrbmVzcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy1oZWFkZXItZGFya25lc3MnKTtcblxuICBpZiAoIHRvZ2dsZXIgJiYgaGVhZGVyICYmIHBhZ2VXcmFwICYmIGRhcmtuZXNzICkge1xuICAgIHRvZ2dsZXIuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbigpIHtcbiAgICAgIGhlYWRlci5jbGFzc0xpc3QudG9nZ2xlKCdpcy1vcGVuJyk7XG4gICAgICB0b2dnbGVyLmNsYXNzTGlzdC50b2dnbGUoJ2lzLWFjdGl2ZScpO1xuICAgICAgcGFnZVdyYXAuY2xhc3NMaXN0LnRvZ2dsZSgnc2Nyb2xsLWJsb2NrZWQtbW9iaWxlJyk7XG4gICAgfSk7XG5cbiAgICBkYXJrbmVzcy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKCkge1xuICAgICAgaGVhZGVyLmNsYXNzTGlzdC5yZW1vdmUoJ2lzLW9wZW4nKTtcbiAgICAgIHRvZ2dsZXIuY2xhc3NMaXN0LnJlbW92ZSgnaXMtYWN0aXZlJyk7XG4gICAgICBwYWdlV3JhcC5jbGFzc0xpc3QucmVtb3ZlKCdzY3JvbGwtYmxvY2tlZC1tb2JpbGUnKTtcbiAgICB9KTtcbiAgfVxufVxuXG5mdW5jdGlvbiBpbml0QWxidW1zQ2FyZFNsaWRlcigpIHtcbiAgdmFyIG15U3dpcGVyID0gbmV3IFN3aXBlcignLmpzLWFsYnVtcy1jYXJkLXNsaWRlcicsIHtcbiAgICBzcGVlZDogNDAwLFxuICAgIHNsaWRlc1BlclZpZXc6IDEsXG4gICAgbmF2aWdhdGlvbjoge1xuICAgICAgbmV4dEVsOiAnLnN3aXBlci1idXR0b24tbmV4dCcsXG4gICAgICBwcmV2RWw6ICcuc3dpcGVyLWJ1dHRvbi1wcmV2JyxcbiAgICB9LFxuICB9KTtcblxuICByZXR1cm4gbXlTd2lwZXI7XG59XG5cbmZ1bmN0aW9uIGluaXRBbGJ1bVNsaWRlcigpIHtcbiAgdmFyIG15U3dpcGVyID0gbmV3IFN3aXBlcignLmpzLXN3aXBlci1hbGJ1bScsIHtcbiAgICBzcGVlZDogNDAwLFxuICAgIHNsaWRlc1BlclZpZXc6IDEsXG4gICAgbG9vcDogZmFsc2UsXG4gICAgcHJlbG9hZEltYWdlczogZmFsc2UsXG4gICAgc3BhY2VCZXR3ZWVuOiAxMixcbiAgICBsYXp5OiB0cnVlLFxuICAgIG5hdmlnYXRpb246IHtcbiAgICAgIG5leHRFbDogJy5zd2lwZXItYnV0dG9uLW5leHQnLFxuICAgICAgcHJldkVsOiAnLnN3aXBlci1idXR0b24tcHJldicsXG4gICAgfSxcbiAgfSk7XG5cbiAgcmV0dXJuIG15U3dpcGVyO1xufVxuXG5mdW5jdGlvbiBpbml0U3dpcGVyKCkge1xuICB2YXIgbXlTd2lwZXIgPSBuZXcgU3dpcGVyKCcuanMtc3dpcGVyLWNvbnRhaW5lcicsIHtcbiAgICBzcGVlZDogNDAwLFxuICAgIHNsaWRlc1BlclZpZXc6IDYsXG4gICAgc3BhY2VCZXR3ZWVuOiA0MCxcbiAgICBsb29wOiBmYWxzZSxcbiAgICBwcmVsb2FkSW1hZ2VzOiBmYWxzZSxcbiAgICBsYXp5OiB0cnVlLCBcbiAgICBuYXZpZ2F0aW9uOiB7XG4gICAgICBuZXh0RWw6ICcuc3dpcGVyLWJ1dHRvbi1uZXh0JyxcbiAgICAgIHByZXZFbDogJy5zd2lwZXItYnV0dG9uLXByZXYnLFxuICAgIH0sXG4gICAgYnJlYWtwb2ludHM6IHtcbiAgICAgIDQ1OToge1xuICAgICAgICBzbGlkZXNQZXJWaWV3OiAxLFxuICAgICAgfSxcbiAgICAgIDU5OToge1xuICAgICAgICBzbGlkZXNQZXJWaWV3OiAyLFxuICAgICAgfSxcbiAgICAgIDc2Nzoge1xuICAgICAgICBzbGlkZXNQZXJWaWV3OiAzLFxuICAgICAgfSxcbiAgICAgIDExOTk6IHtcbiAgICAgICAgc2xpZGVzUGVyVmlldzogNCxcbiAgICAgIH0sXG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gbXlTd2lwZXI7XG59XG5cbmZ1bmN0aW9uIGluaXRTd2lwZXJTdGF0aWNrKCkge1xuICB2YXIgbXlTd2lwZXIgPSBuZXcgU3dpcGVyKCcuanMtc3dpcGVyLWNvbnRhaW5lci1zdGF0aWNrJywge1xuICAgIHNwZWVkOiA0MDAsXG4gICAgc2xpZGVzUGVyVmlldzogNixcbiAgICBzcGFjZUJldHdlZW46IDQwLFxuICAgIGxvb3A6IGZhbHNlLFxuICAgIHByZWxvYWRJbWFnZXM6IGZhbHNlLFxuICAgIGxhenk6IHRydWUsXG4gICAgZm9sbG93RmluZ2VyOiBmYWxzZSxcbiAgICBicmVha3BvaW50czoge1xuICAgICAgNDU5OiB7XG4gICAgICAgIHNsaWRlc1BlclZpZXc6IDEsXG4gICAgICB9LFxuICAgICAgNTk5OiB7XG4gICAgICAgIHNsaWRlc1BlclZpZXc6IDIsXG4gICAgICB9LFxuICAgICAgNzY3OiB7XG4gICAgICAgIHNsaWRlc1BlclZpZXc6IDMsXG4gICAgICB9LFxuICAgICAgMTE5OToge1xuICAgICAgICBzbGlkZXNQZXJWaWV3OiA0LFxuICAgICAgfSxcbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiBteVN3aXBlcjtcbn1cblxuZnVuY3Rpb24gaW5pdE1haW5Td2lwZXIoKSB7XG4gIHZhciBteVN3aXBlciA9IG5ldyBTd2lwZXIoJy5qcy1tYWluLXN3aXBlci1jb250YWluZXInLCB7XG4gICAgc3BlZWQ6IDQwMCxcbiAgICBzbGlkZXNQZXJWaWV3OiAxLFxuICAgIGxvb3A6IHRydWUsXG4gICAgc3BhY2VCZXR3ZWVuOiAxMixcbiAgICBwYWdpbmF0aW9uOiB7XG4gICAgICBlbDogJy5zd2lwZXItcGFnaW5hdGlvbicsXG4gICAgICB0eXBlOiAnYnVsbGV0cycsXG4gICAgICBjbGlja2FibGU6IHRydWVcbiAgICB9LFxuICAgIG5hdmlnYXRpb246IHtcbiAgICAgIG5leHRFbDogJy5zd2lwZXItYnV0dG9uLW5leHQnLFxuICAgICAgcHJldkVsOiAnLnN3aXBlci1idXR0b24tcHJldicsXG4gICAgfSxcbiAgfSk7XG5cbiAgcmV0dXJuIG15U3dpcGVyO1xufVxuXG5mdW5jdGlvbiBpbml0TW9kYWxTd2lwZXIoKSB7XG4gIHZhciBteVN3aXBlciA9IG5ldyBTd2lwZXIoJy5qcy1tYWluLXN3aXBlci1tb2RhbCcsIHtcbiAgICBzcGVlZDogNDAwLFxuICAgIHNsaWRlc1BlclZpZXc6IDEsXG4gICAgbG9vcDogdHJ1ZSxcbiAgICBzcGFjZUJldHdlZW46IDEyLFxuICAgIHByZWxvYWRJbWFnZXM6IGZhbHNlLFxuICAgIGxhenk6IHRydWUsXG4gICAgcGFnaW5hdGlvbjoge1xuICAgICAgZWw6ICcuc3dpcGVyLXBhZ2luYXRpb24nLFxuICAgICAgdHlwZTogJ2J1bGxldHMnLFxuICAgICAgY2xpY2thYmxlOiB0cnVlXG4gICAgfSxcbiAgICBuYXZpZ2F0aW9uOiB7XG4gICAgICBuZXh0RWw6ICcuc3dpcGVyLWJ1dHRvbi1uZXh0JyxcbiAgICAgIHByZXZFbDogJy5zd2lwZXItYnV0dG9uLXByZXYnLFxuICAgIH0sXG4gIH0pO1xuXG4gIHJldHVybiBteVN3aXBlcjtcbn1cblxuZnVuY3Rpb24gaW5pdEFsYnVtc1R5cGVTbGlkZXIoKSB7XG4gIHZhciBteVN3aXBlciA9IG5ldyBTd2lwZXIoJy5qcy10eXBlLWFsYnVtcy1zd2lwZXInLCB7XG4gICAgc3BlZWQ6IDQwMCxcbiAgICBzbGlkZXNQZXJWaWV3OiAnYXV0bycsXG4gICAgc2xpZGVzT2Zmc2V0QWZ0ZXI6IDEwMCxcbiAgICBzcGFjZUJldHdlZW46IDI0LFxuICAgIG5hdmlnYXRpb246IHtcbiAgICAgIG5leHRFbDogJy5zd2lwZXItYnV0dG9uLW5leHQnLFxuICAgICAgcHJldkVsOiAnLnN3aXBlci1idXR0b24tcHJldicsXG4gICAgfSxcbiAgICBvbjoge1xuICAgICAgc2xpZGVDaGFuZ2U6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKCB0aGlzLmFjdGl2ZUluZGV4ID4gMCApIHtcbiAgICAgICAgICB0aGlzLmVsLmNsYXNzTGlzdC5hZGQoJ25vdC1vbi1zdGFydCcpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuZWwuY2xhc3NMaXN0LnJlbW92ZSgnbm90LW9uLXN0YXJ0Jyk7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgfSxcbiAgfSk7XG5cbiAgcmV0dXJuIG15U3dpcGVyO1xufVxuXG5mdW5jdGlvbiBpbml0TWFpbkNhcmRzU2xpZGVyKCkge1xuICB2YXIgbXlTd2lwZXIgPSBuZXcgU3dpcGVyKCcuanMtbWFpbi1jYXJkLXNsaWRlcicsIHtcbiAgICBzcGVlZDogNDAwLFxuICAgIHNsaWRlc1BlclZpZXc6IDEsXG4gICAgbG9vcDogdHJ1ZSxcbiAgICBzcGFjZUJldHdlZW46IDEyLFxuICAgIG5hdmlnYXRpb246IHtcbiAgICAgIG5leHRFbDogJy5zd2lwZXItYnV0dG9uLW5leHQnLFxuICAgICAgcHJldkVsOiAnLnN3aXBlci1idXR0b24tcHJldicsXG4gICAgfSxcbiAgfSk7XG5cbiAgcmV0dXJuIG15U3dpcGVyO1xufVxuXG5mdW5jdGlvbiB0YWIodGFiSGFuZGxlcikge1xuICAgIGxldCB0YWJzQ29udGFpbmVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5qcy10YWItY29udGFpbmVyXCIpO1xuXG4gICAgaWYgKCB0YWJzQ29udGFpbmVyICkge1xuICAgICAgbGV0IG1lbnVJdGVtcyA9IHRhYnNDb250YWluZXIucXVlcnlTZWxlY3RvckFsbChcIi5qcy10YWItbWVudS1pdGVtXCIpO1xuICAgICAgbGV0IHVuZGVybGluZSA9IHRhYnNDb250YWluZXIucXVlcnlTZWxlY3RvcihcIi5qcy10YWItdW5kZXJsaW5lXCIpO1xuXG4gICAgICBtZW51SXRlbXMuZm9yRWFjaCggKG1lbnVJdGVtKSA9PiB7XG4gICAgICAgIGlmICggdW5kZXJsaW5lICYmIG1lbnVJdGVtLmNsYXNzTGlzdC5jb250YWlucyhcImlzLWFjdGl2ZVwiKSApIHtcbiAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIGN1cnJlbnRUYWJBY2NlbnQodW5kZXJsaW5lLCBtZW51SXRlbSk7XG4gICAgICAgICAgfSwgMTAwKTtcbiAgICAgICAgfVxuXG4gICAgICAgIG1lbnVJdGVtLm9uY2xpY2sgPSAoKSA9PiB7XG4gICAgICAgICAgbGV0IGFjdGl2ZU1lbnVJdGVtID0gQXJyYXkuZnJvbShtZW51SXRlbXMpLmZpbmQoZ2V0QWN0aXZlVGFiKTtcbiAgICAgICAgICBsZXQgYWN0aXZlQ29udGVudEl0ZW0gPSB0YWJzQ29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoYWN0aXZlTWVudUl0ZW0uZGF0YXNldC50YXJnZXQpO1xuICAgICAgICAgIGxldCBjdXJyZW50Q29udGVudEl0ZW0gPSB0YWJzQ29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IobWVudUl0ZW0uZGF0YXNldC50YXJnZXQpO1xuXG4gICAgICAgICAgYWN0aXZlTWVudUl0ZW0uY2xhc3NMaXN0LnJlbW92ZShcImlzLWFjdGl2ZVwiKTtcblxuICAgICAgICAgIGlmICggYWN0aXZlQ29udGVudEl0ZW0gKSB7XG4gICAgICAgICAgICBhY3RpdmVDb250ZW50SXRlbS5jbGFzc0xpc3QucmVtb3ZlKFwiaXMtYWN0aXZlXCIpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmICggY3VycmVudENvbnRlbnRJdGVtICkge1xuICAgICAgICAgICAgY3VycmVudENvbnRlbnRJdGVtLmNsYXNzTGlzdC5hZGQoXCJpcy1hY3RpdmVcIik7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgbWVudUl0ZW0uY2xhc3NMaXN0LmFkZChcImlzLWFjdGl2ZVwiKTtcblxuICAgICAgICAgIGlmICggdW5kZXJsaW5lICkge1xuICAgICAgICAgICAgY3VycmVudFRhYkFjY2VudCh1bmRlcmxpbmUsIG1lbnVJdGVtKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoIHRhYkhhbmRsZXIgKSB7XG4gICAgICAgICAgICBkb2N1bWVudC5kaXNwYXRjaEV2ZW50KHRhYkhhbmRsZXIpO1xuICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgIH0pO1xuICAgIH1cblxuICBmdW5jdGlvbiBjdXJyZW50VGFiQWNjZW50KHVuZGVybGluZSwgbWVudUl0ZW0pIHtcbiAgICBsZXQgaXRlbVBvc2l0aW9uID0gbWVudUl0ZW0ub2Zmc2V0TGVmdDtcbiAgICBsZXQgaXRlbVdpZHRoID0gTnVtYmVyKG1lbnVJdGVtLnNjcm9sbFdpZHRoKTtcblxuICAgIHJldHVybiB1bmRlcmxpbmUuc2V0QXR0cmlidXRlKFwic3R5bGVcIiwgYGxlZnQ6ICR7aXRlbVBvc2l0aW9ufXB4OyB3aWR0aDogJHtpdGVtV2lkdGh9cHg7YCk7XG4gIH1cblxuICBmdW5jdGlvbiBnZXRBY3RpdmVUYWIoZWxlbWVudCkge1xuICAgIHJldHVybiBlbGVtZW50LmNsYXNzTGlzdC5jb250YWlucyhcImlzLWFjdGl2ZVwiKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBhY2NvcmRpb24oKSB7XG4gIGxldCB3cmFwcGVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmpzLWFjY29yZGlvbicpO1xuICB3cmFwcGVyLmZvckVhY2god3JhcHBlckl0ZW0gPT4ge1xuICAgIGxldCBpdGVtcyA9IHdyYXBwZXJJdGVtLnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy1hY2NvcmRpb24taXRlbScpO1xuICAgIGxldCBpbmRpdmlkdWFsID0gd3JhcHBlckl0ZW0uZ2V0QXR0cmlidXRlKCdpbmRpdmlkdWFsJykgJiYgd3JhcHBlckl0ZW0uZ2V0QXR0cmlidXRlKCdpbmRpdmlkdWFsJykgIT09ICdmYWxzZSc7XG5cbiAgICBpdGVtcy5mb3JFYWNoKGl0ZW0gPT4ge1xuICAgICAgaWYgKCBpdGVtLmNsYXNzTGlzdC5jb250YWlucygnaXMtYWN0aXZlJykgKSB7XG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgIGxldCByZWFkeUNvbnRlbnQgPSBpdGVtLnF1ZXJ5U2VsZWN0b3IoJy5qcy1hY2NvcmRpb24tY29udGVudCcpO1xuICAgICAgICAgIGxldCByZWFkeUNvbnRlbnRIZWlnaHQgPSByZWFkeUNvbnRlbnQuc2Nyb2xsSGVpZ2h0O1xuXG4gICAgICAgICAgcmVhZHlDb250ZW50LnN0eWxlLm1heEhlaWdodCA9IHJlYWR5Q29udGVudEhlaWdodCArICdweCc7XG4gICAgICAgIH0sIDEwMCk7XG4gICAgICB9XG5cbiAgICAgIGxldCBzdWJJdGVtcyA9IGl0ZW0ucXVlcnlTZWxlY3RvckFsbCgnLmpzLWFjY29yZGlvbi1zdWJpdGVtJyk7XG5cbiAgICAgIGZvciAoY29uc3Qgc3ViSXRlbSBvZiBzdWJJdGVtcykge1xuICAgICAgICBpZiAoIHN1Ykl0ZW0uY2xhc3NMaXN0LmNvbnRhaW5zKCdpcy1hY3RpdmUnKSApIHtcbiAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIGxldCByZWFkeUNvbnRlbnQgPSBzdWJJdGVtLnF1ZXJ5U2VsZWN0b3IoJy5qcy1hY2NvcmRpb24tY29udGVudCcpO1xuICAgICAgICAgICAgbGV0IHJlYWR5Q29udGVudEhlaWdodCA9IHJlYWR5Q29udGVudC5zY3JvbGxIZWlnaHQ7XG4gIFxuICAgICAgICAgICAgcmVhZHlDb250ZW50LnN0eWxlLm1heEhlaWdodCA9IHJlYWR5Q29udGVudEhlaWdodCArICdweCc7XG4gICAgICAgICAgfSwgMTAwKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpdGVtSXRlcmF0aW9uKGl0ZW0sIGl0ZW1zLCBpbmRpdmlkdWFsKTtcblxuICAgICAgc3ViSXRlbXMuZm9yRWFjaChzdWJpdGVtID0+IHtcbiAgICAgICAgaXRlbUl0ZXJhdGlvbihzdWJpdGVtLCBzdWJJdGVtcywgaW5kaXZpZHVhbCwgdHJ1ZSlcbiAgICAgIH0pO1xuICAgIH0pXG4gIH0pXG59XG5cbmZ1bmN0aW9uIGl0ZW1JdGVyYXRpb24oaXRlbSwgaXRlbXMsIGluZGl2aWR1YWwsIGlzU3ViaXRlbSkge1xuICBsZXQgaW5pdCA9IGl0ZW0ucXVlcnlTZWxlY3RvcignLmpzLWFjY29yZGlvbi1pbml0Jyk7XG4gIGxldCBjb250ZW50ID0gaXRlbS5xdWVyeVNlbGVjdG9yKCcuanMtYWNjb3JkaW9uLWNvbnRlbnQnKTtcblxuICBpZiAoIGlzU3ViaXRlbSA9PT0gdHJ1ZSApIHtcbiAgICBjb250ZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3RyYW5zaXRpb25lbmQnLCBmdW5jdGlvbigpIHtcbiAgICAgIGxldCBwYXJlbnRJdGVtID0gaXRlbS5jbG9zZXN0KCcuanMtYWNjb3JkaW9uLWl0ZW0nKTtcbiAgICAgIGxldCBwYXJlbnRDb250ZW50SGVpZ2h0ID0gcGFyZW50SXRlbS5zY3JvbGxIZWlnaHQgKyAncHgnO1xuICAgICAgbGV0IHBhcmVudENvbnRlbnQgPSBwYXJlbnRJdGVtLnF1ZXJ5U2VsZWN0b3IoJy5qcy1hY2NvcmRpb24tY29udGVudCcpO1xuXG4gICAgICBwYXJlbnRDb250ZW50LnNldEF0dHJpYnV0ZSgnc3R5bGUnLCBgbWF4LWhlaWdodDogJHtwYXJlbnRDb250ZW50SGVpZ2h0fWApO1xuICAgIH0pO1xuICB9XG5cbiAgaW5pdC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKCkge1xuICAgIGlmICggaXRlbS5jbGFzc0xpc3QuY29udGFpbnMoJ2lzLWFjdGl2ZScpICkge1xuICAgICAgaXRlbS5jbGFzc0xpc3QucmVtb3ZlKCdpcy1hY3RpdmUnKTtcbiAgICAgIGNvbnRlbnQuc3R5bGUubWF4SGVpZ2h0ID0gJzBweCc7XG5cbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cblxuICAgIGlmICggaXNTdWJpdGVtID09PSB0cnVlICkge1xuICAgICAgbGV0IHBhcmVudEl0ZW0gPSBpdGVtLmNsb3Nlc3QoJy5qcy1hY2NvcmRpb24taXRlbScpO1xuICAgICAgbGV0IHBhcmVudENvbnRlbnQgPSBwYXJlbnRJdGVtLnF1ZXJ5U2VsZWN0b3IoJy5qcy1hY2NvcmRpb24tY29udGVudCcpO1xuXG4gICAgICBwYXJlbnRDb250ZW50LnNldEF0dHJpYnV0ZSgnc3R5bGUnLCBgbWF4LWhlaWdodDogbm9uZWApO1xuICAgIH1cblxuICAgIGlmICggaW5kaXZpZHVhbCApIHtcbiAgICAgIGl0ZW1zLmZvckVhY2goKGVsZW0pID0+IHtcbiAgICAgICAgbGV0IGVsZW1Db250ZW50ID0gZWxlbS5xdWVyeVNlbGVjdG9yKCcuanMtYWNjb3JkaW9uLWNvbnRlbnQnKTtcbiAgICAgICAgZWxlbS5jbGFzc0xpc3QucmVtb3ZlKCdpcy1hY3RpdmUnKTtcbiAgICAgICAgZWxlbUNvbnRlbnQuc3R5bGUubWF4SGVpZ2h0ID0gMCArICdweCc7XG4gICAgICB9KVxuICAgIH1cblxuICAgIGl0ZW0uY2xhc3NMaXN0LmFkZCgnaXMtYWN0aXZlJyk7XG4gICAgY29udGVudC5zdHlsZS5tYXhIZWlnaHQgPSBjb250ZW50LnNjcm9sbEhlaWdodCArICdweCc7XG4gIH0pO1xufSJdfQ==
