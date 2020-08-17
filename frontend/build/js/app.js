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
  setHandlersPrice();

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
    let list = type.querySelectorAll('.js-choice-type-list li');
    let arrList = [];

    for (const item of list) {
      arrList.push(item.textContent);
    }

    type.addEventListener('click', function() {
      if ( type.classList.contains('is-active') ) {
        return;
      }

      for (const typeIn of types) {
        typeIn.classList.remove('is-active');
      }

      container.classList.add('is-active');

      if ( !list.length || list.length < 2 ) {
        container.classList.remove('is-active');
      }

      type.classList.add('is-active');
      outputContainer.innerHTML = '';

      list.forEach((item, idx) => {
        if ( idx === 0 ) {
          outputContainer.appendChild(createCheckmark(item.textContent, true, item.dataset.basePrice));
        } else {
          outputContainer.appendChild(createCheckmark(item.textContent, false, item.dataset.basePrice));
        }
      });

      let checkmarks = outputContainer.querySelectorAll('.checkmark input');

      if ( checkmarks.length ) {
        checkmarks[0].click();
      }
    });
  }
}

function setHandlersPrice() {
  let targets = document.querySelectorAll('.js-calc-change');

  for (const target of targets) {
    if ( target.noUiSlider ) {
      target.noUiSlider.on('change', function() {
        changePriceHandle();
      });
    }

    target.addEventListener('change', function() {
      changePriceHandle();
    });
  }
}

function changePriceHandle() {
  let basePrices = document.querySelectorAll('.js-choice-type-output input');
  let basePriceItem = getBasePrice(basePrices);
  let outputPrice = document.querySelector('.js-calc-price');
  let outputDiscountPrice = document.querySelector('.js-calc-discount-price');
  let typeOutput = document.querySelector('.js-calc-type-output');
  let listsOutput = document.querySelector('.js-calc-lists-output');
  let albumsOutput = document.querySelector('.js-calc-albums-output');
  let persantageOutput = document.querySelector('.js-calc-discount-persantage-output');
  let discountSummOutput = document.querySelector('.js-calc-discount-summ-output');
  let albums = +document.querySelector('.js-calc-albums-length input').value;
  let peoples = +document.querySelector('.js-calc-peoples').noUiSlider.get();
  let peoplesOnTurn = +document.querySelector('.js-calc-peoples-on-turn').noUiSlider.get();
  let historyTurns = +document.querySelector('.js-calc-history-turns').noUiSlider.get();
  let activeChoice = document.querySelector('.js-choice-type.is-active');

  if ( !activeChoice ) {
    return
  }

  let baseLists = +activeChoice.dataset.baseLists;
  let baseTurn = +activeChoice.dataset.baseTurn;
  let baseTurnPrice = +activeChoice.dataset.turnPrice;
  let basePrice = +basePriceItem.dataset.basePrice;
  let albumLists = getListInAlbum(peoples, peoplesOnTurn, historyTurns, baseTurn);
  let albumPrice = getPriceForAlbum(basePrice, albumLists, baseLists, baseTurnPrice);
  let percentage = getDiscountPercent(albums);
  let discountSumm = getDiscountSumm(albumPrice, percentage);
  let albumPriceWithDiscount = getPriceForAlbumDiscount(albumPrice, discountSumm);

  outputPrice.textContent = albumPrice;
  outputDiscountPrice.textContent = albumPriceWithDiscount;
  typeOutput.textContent = activeChoice.querySelector('.calculate-types__title').textContent;
  listsOutput.textContent = albumLists;
  albumsOutput.textContent = albums;
  persantageOutput.textContent = percentage + '%';
  discountSummOutput.textContent = (albums * albumPriceWithDiscount) + ' ₽';
}

function getBasePrice(arr) {
  if ( arr.length ) {
    for (const item of arr) {
      if ( item.checked ) {
        return item;
      }
    }
  }
}

function getPriceForAlbum(basePrice, albumLists, baseLists, baseTurnPrice) {
  let some = 0;

  if ( albumLists - baseLists > 0 ) {
    some = albumLists - baseLists;
  }

  return basePrice + some * baseTurnPrice;
}

function getDiscountPercent(albums) {
  if ( albums < 5 ) {
    return 0;
  }

  if ( albums > 20 ) {
    return 20;
  }

  return albums;
}

function getPriceForAlbumDiscount(albumPrice, discountSumm) {
  return albumPrice - discountSumm;
}

function getDiscountSumm(albumPrice, percentage) {
  return Math.ceil(albumPrice * percentage / 100);
}

function getListInAlbum(peoples, peoplesOnTurn, historyTurns, baseTurn) {
  return Math.ceil(peoples / peoplesOnTurn) + historyTurns + baseTurn;
}

function createCheckmark(text, first, basePrice) {
  let checkmarkWrapper;
  let checkmark = createElement('label', 'checkmark');
  let input = createElement('input', '');
  setAttributes(input, {
    'type': 'radio',
    'name': 'types'
  });
  let mark = createElement('span', 'checkmark__mark');
  let varText = createElement('p', '');

  input.addEventListener('change', function() {
    changePriceHandle();
  });

  if ( first ) {
    checkmarkWrapper = createElement('div', 'col-12');
  } else {
    checkmarkWrapper = createElement('div', 'col-12 mt-3');
  }

  input.dataset.basePrice = basePrice ? basePrice : 0;
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiYXBwLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xyXG5cclxuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIGZ1bmN0aW9uKCkge1xyXG4gIGxldCB0YWJIYW5kbGVyID0gbmV3IEV2ZW50KCd0YWJIYW5kbGVyJyk7XHJcbiAgbGV0IG1vZGFsU3dpcGVyID0gaW5pdE1vZGFsU3dpcGVyKCk7XHJcbiAgbGV0IHN3aXBlcnMgPSBpbml0U3dpcGVyKCk7XHJcbiAgc3ZnNGV2ZXJ5Ym9keSgpO1xyXG4gIGluaXRNYWluU3dpcGVyKCk7XHJcbiAgaW5pdEhlYWRlclRvZ2dsZXIoKTtcclxuICBpbml0QWxidW1zQ2FyZFNsaWRlcigpO1xyXG4gIGFjY29yZGlvbigpO1xyXG4gIGluaXRBbGJ1bXNUeXBlU2xpZGVyKCk7XHJcbiAgaW5pdFN3aXBlclN0YXRpY2soKTtcclxuICBpbml0QWxidW1TbGlkZXIoKTtcclxuICB0YWIodGFiSGFuZGxlcik7XHJcbiAgaW5pdFJhbmdlKCk7XHJcbiAgaW5pdERyYWdORHJvcCgpO1xyXG4gIGluaXRNb2RhbChtb2RhbFN3aXBlcik7XHJcbiAgdmFsaWRhdGVGcm9tKCk7XHJcbiAgY2FyZEhlYWRlckhhbmRsZShtb2RhbFN3aXBlciwgJ2h0dHA6Ly9mMzYzNTA5NzU4MTcubmdyb2suaW8vYXBpL2FsYnVtL2ltYWdlc19zbGlkZXI/aWQ9Jyk7XHJcbiAgY2hvaWNlVHlwZSgpO1xyXG4gIHNldEhhbmRsZXJzUHJpY2UoKTtcclxuXHJcbiAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigndGFiSGFuZGxlcicsIGZ1bmN0aW9uKCkge1xyXG4gICAgaWYgKCAhc3dpcGVycy5sZW5ndGggKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBzd2lwZXJzLmZvckVhY2goc3dpcGVyID0+IHtcclxuICAgICAgc3dpcGVyLnVwZGF0ZSgpO1xyXG4gICAgfSk7XHJcblxyXG4gIH0sIGZhbHNlKTtcclxuXHJcbiAgaWYgKCB3aW5kb3cuaW5uZXJXaWR0aCA8IDc2OCApIHtcclxuICAgIGluaXRNYWluQ2FyZHNTbGlkZXIoKTtcclxuICB9XHJcbn0pO1xyXG5cclxuZnVuY3Rpb24gY2hvaWNlVHlwZSgpIHtcclxuICBsZXQgdHlwZXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuanMtY2hvaWNlLXR5cGUnKTtcclxuICBsZXQgY29udGFpbmVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLWNob2ljZS10eXBlLWFkZGluZ3MnKTtcclxuICBsZXQgb3V0cHV0Q29udGFpbmVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLWNob2ljZS10eXBlLW91dHB1dCcpO1xyXG5cclxuICBpZiAoICF0eXBlcy5sZW5ndGggfHwgIWNvbnRhaW5lciApIHtcclxuICAgIHJldHVyblxyXG4gIH1cclxuXHJcbiAgZm9yIChjb25zdCB0eXBlIG9mIHR5cGVzKSB7XHJcbiAgICBsZXQgbGlzdCA9IHR5cGUucXVlcnlTZWxlY3RvckFsbCgnLmpzLWNob2ljZS10eXBlLWxpc3QgbGknKTtcclxuICAgIGxldCBhcnJMaXN0ID0gW107XHJcblxyXG4gICAgZm9yIChjb25zdCBpdGVtIG9mIGxpc3QpIHtcclxuICAgICAgYXJyTGlzdC5wdXNoKGl0ZW0udGV4dENvbnRlbnQpO1xyXG4gICAgfVxyXG5cclxuICAgIHR5cGUuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbigpIHtcclxuICAgICAgaWYgKCB0eXBlLmNsYXNzTGlzdC5jb250YWlucygnaXMtYWN0aXZlJykgKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBmb3IgKGNvbnN0IHR5cGVJbiBvZiB0eXBlcykge1xyXG4gICAgICAgIHR5cGVJbi5jbGFzc0xpc3QucmVtb3ZlKCdpcy1hY3RpdmUnKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgY29udGFpbmVyLmNsYXNzTGlzdC5hZGQoJ2lzLWFjdGl2ZScpO1xyXG5cclxuICAgICAgaWYgKCAhbGlzdC5sZW5ndGggfHwgbGlzdC5sZW5ndGggPCAyICkge1xyXG4gICAgICAgIGNvbnRhaW5lci5jbGFzc0xpc3QucmVtb3ZlKCdpcy1hY3RpdmUnKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgdHlwZS5jbGFzc0xpc3QuYWRkKCdpcy1hY3RpdmUnKTtcclxuICAgICAgb3V0cHV0Q29udGFpbmVyLmlubmVySFRNTCA9ICcnO1xyXG5cclxuICAgICAgbGlzdC5mb3JFYWNoKChpdGVtLCBpZHgpID0+IHtcclxuICAgICAgICBpZiAoIGlkeCA9PT0gMCApIHtcclxuICAgICAgICAgIG91dHB1dENvbnRhaW5lci5hcHBlbmRDaGlsZChjcmVhdGVDaGVja21hcmsoaXRlbS50ZXh0Q29udGVudCwgdHJ1ZSwgaXRlbS5kYXRhc2V0LmJhc2VQcmljZSkpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBvdXRwdXRDb250YWluZXIuYXBwZW5kQ2hpbGQoY3JlYXRlQ2hlY2ttYXJrKGl0ZW0udGV4dENvbnRlbnQsIGZhbHNlLCBpdGVtLmRhdGFzZXQuYmFzZVByaWNlKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIGxldCBjaGVja21hcmtzID0gb3V0cHV0Q29udGFpbmVyLnF1ZXJ5U2VsZWN0b3JBbGwoJy5jaGVja21hcmsgaW5wdXQnKTtcclxuXHJcbiAgICAgIGlmICggY2hlY2ttYXJrcy5sZW5ndGggKSB7XHJcbiAgICAgICAgY2hlY2ttYXJrc1swXS5jbGljaygpO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHNldEhhbmRsZXJzUHJpY2UoKSB7XHJcbiAgbGV0IHRhcmdldHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuanMtY2FsYy1jaGFuZ2UnKTtcclxuXHJcbiAgZm9yIChjb25zdCB0YXJnZXQgb2YgdGFyZ2V0cykge1xyXG4gICAgaWYgKCB0YXJnZXQubm9VaVNsaWRlciApIHtcclxuICAgICAgdGFyZ2V0Lm5vVWlTbGlkZXIub24oJ2NoYW5nZScsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGNoYW5nZVByaWNlSGFuZGxlKCk7XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHRhcmdldC5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCBmdW5jdGlvbigpIHtcclxuICAgICAgY2hhbmdlUHJpY2VIYW5kbGUoKTtcclxuICAgIH0pO1xyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gY2hhbmdlUHJpY2VIYW5kbGUoKSB7XHJcbiAgbGV0IGJhc2VQcmljZXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuanMtY2hvaWNlLXR5cGUtb3V0cHV0IGlucHV0Jyk7XHJcbiAgbGV0IGJhc2VQcmljZUl0ZW0gPSBnZXRCYXNlUHJpY2UoYmFzZVByaWNlcyk7XHJcbiAgbGV0IG91dHB1dFByaWNlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLWNhbGMtcHJpY2UnKTtcclxuICBsZXQgb3V0cHV0RGlzY291bnRQcmljZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy1jYWxjLWRpc2NvdW50LXByaWNlJyk7XHJcbiAgbGV0IHR5cGVPdXRwdXQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtY2FsYy10eXBlLW91dHB1dCcpO1xyXG4gIGxldCBsaXN0c091dHB1dCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy1jYWxjLWxpc3RzLW91dHB1dCcpO1xyXG4gIGxldCBhbGJ1bXNPdXRwdXQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtY2FsYy1hbGJ1bXMtb3V0cHV0Jyk7XHJcbiAgbGV0IHBlcnNhbnRhZ2VPdXRwdXQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtY2FsYy1kaXNjb3VudC1wZXJzYW50YWdlLW91dHB1dCcpO1xyXG4gIGxldCBkaXNjb3VudFN1bW1PdXRwdXQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtY2FsYy1kaXNjb3VudC1zdW1tLW91dHB1dCcpO1xyXG4gIGxldCBhbGJ1bXMgPSArZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLWNhbGMtYWxidW1zLWxlbmd0aCBpbnB1dCcpLnZhbHVlO1xyXG4gIGxldCBwZW9wbGVzID0gK2RvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy1jYWxjLXBlb3BsZXMnKS5ub1VpU2xpZGVyLmdldCgpO1xyXG4gIGxldCBwZW9wbGVzT25UdXJuID0gK2RvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy1jYWxjLXBlb3BsZXMtb24tdHVybicpLm5vVWlTbGlkZXIuZ2V0KCk7XHJcbiAgbGV0IGhpc3RvcnlUdXJucyA9ICtkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtY2FsYy1oaXN0b3J5LXR1cm5zJykubm9VaVNsaWRlci5nZXQoKTtcclxuICBsZXQgYWN0aXZlQ2hvaWNlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLWNob2ljZS10eXBlLmlzLWFjdGl2ZScpO1xyXG5cclxuICBpZiAoICFhY3RpdmVDaG9pY2UgKSB7XHJcbiAgICByZXR1cm5cclxuICB9XHJcblxyXG4gIGxldCBiYXNlTGlzdHMgPSArYWN0aXZlQ2hvaWNlLmRhdGFzZXQuYmFzZUxpc3RzO1xyXG4gIGxldCBiYXNlVHVybiA9ICthY3RpdmVDaG9pY2UuZGF0YXNldC5iYXNlVHVybjtcclxuICBsZXQgYmFzZVR1cm5QcmljZSA9ICthY3RpdmVDaG9pY2UuZGF0YXNldC50dXJuUHJpY2U7XHJcbiAgbGV0IGJhc2VQcmljZSA9ICtiYXNlUHJpY2VJdGVtLmRhdGFzZXQuYmFzZVByaWNlO1xyXG4gIGxldCBhbGJ1bUxpc3RzID0gZ2V0TGlzdEluQWxidW0ocGVvcGxlcywgcGVvcGxlc09uVHVybiwgaGlzdG9yeVR1cm5zLCBiYXNlVHVybik7XHJcbiAgbGV0IGFsYnVtUHJpY2UgPSBnZXRQcmljZUZvckFsYnVtKGJhc2VQcmljZSwgYWxidW1MaXN0cywgYmFzZUxpc3RzLCBiYXNlVHVyblByaWNlKTtcclxuICBsZXQgcGVyY2VudGFnZSA9IGdldERpc2NvdW50UGVyY2VudChhbGJ1bXMpO1xyXG4gIGxldCBkaXNjb3VudFN1bW0gPSBnZXREaXNjb3VudFN1bW0oYWxidW1QcmljZSwgcGVyY2VudGFnZSk7XHJcbiAgbGV0IGFsYnVtUHJpY2VXaXRoRGlzY291bnQgPSBnZXRQcmljZUZvckFsYnVtRGlzY291bnQoYWxidW1QcmljZSwgZGlzY291bnRTdW1tKTtcclxuXHJcbiAgb3V0cHV0UHJpY2UudGV4dENvbnRlbnQgPSBhbGJ1bVByaWNlO1xyXG4gIG91dHB1dERpc2NvdW50UHJpY2UudGV4dENvbnRlbnQgPSBhbGJ1bVByaWNlV2l0aERpc2NvdW50O1xyXG4gIHR5cGVPdXRwdXQudGV4dENvbnRlbnQgPSBhY3RpdmVDaG9pY2UucXVlcnlTZWxlY3RvcignLmNhbGN1bGF0ZS10eXBlc19fdGl0bGUnKS50ZXh0Q29udGVudDtcclxuICBsaXN0c091dHB1dC50ZXh0Q29udGVudCA9IGFsYnVtTGlzdHM7XHJcbiAgYWxidW1zT3V0cHV0LnRleHRDb250ZW50ID0gYWxidW1zO1xyXG4gIHBlcnNhbnRhZ2VPdXRwdXQudGV4dENvbnRlbnQgPSBwZXJjZW50YWdlICsgJyUnO1xyXG4gIGRpc2NvdW50U3VtbU91dHB1dC50ZXh0Q29udGVudCA9IChhbGJ1bXMgKiBhbGJ1bVByaWNlV2l0aERpc2NvdW50KSArICcg4oK9JztcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0QmFzZVByaWNlKGFycikge1xyXG4gIGlmICggYXJyLmxlbmd0aCApIHtcclxuICAgIGZvciAoY29uc3QgaXRlbSBvZiBhcnIpIHtcclxuICAgICAgaWYgKCBpdGVtLmNoZWNrZWQgKSB7XHJcbiAgICAgICAgcmV0dXJuIGl0ZW07XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldFByaWNlRm9yQWxidW0oYmFzZVByaWNlLCBhbGJ1bUxpc3RzLCBiYXNlTGlzdHMsIGJhc2VUdXJuUHJpY2UpIHtcclxuICBsZXQgc29tZSA9IDA7XHJcblxyXG4gIGlmICggYWxidW1MaXN0cyAtIGJhc2VMaXN0cyA+IDAgKSB7XHJcbiAgICBzb21lID0gYWxidW1MaXN0cyAtIGJhc2VMaXN0cztcclxuICB9XHJcblxyXG4gIHJldHVybiBiYXNlUHJpY2UgKyBzb21lICogYmFzZVR1cm5QcmljZTtcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0RGlzY291bnRQZXJjZW50KGFsYnVtcykge1xyXG4gIGlmICggYWxidW1zIDwgNSApIHtcclxuICAgIHJldHVybiAwO1xyXG4gIH1cclxuXHJcbiAgaWYgKCBhbGJ1bXMgPiAyMCApIHtcclxuICAgIHJldHVybiAyMDtcclxuICB9XHJcblxyXG4gIHJldHVybiBhbGJ1bXM7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldFByaWNlRm9yQWxidW1EaXNjb3VudChhbGJ1bVByaWNlLCBkaXNjb3VudFN1bW0pIHtcclxuICByZXR1cm4gYWxidW1QcmljZSAtIGRpc2NvdW50U3VtbTtcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0RGlzY291bnRTdW1tKGFsYnVtUHJpY2UsIHBlcmNlbnRhZ2UpIHtcclxuICByZXR1cm4gTWF0aC5jZWlsKGFsYnVtUHJpY2UgKiBwZXJjZW50YWdlIC8gMTAwKTtcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0TGlzdEluQWxidW0ocGVvcGxlcywgcGVvcGxlc09uVHVybiwgaGlzdG9yeVR1cm5zLCBiYXNlVHVybikge1xyXG4gIHJldHVybiBNYXRoLmNlaWwocGVvcGxlcyAvIHBlb3BsZXNPblR1cm4pICsgaGlzdG9yeVR1cm5zICsgYmFzZVR1cm47XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZUNoZWNrbWFyayh0ZXh0LCBmaXJzdCwgYmFzZVByaWNlKSB7XHJcbiAgbGV0IGNoZWNrbWFya1dyYXBwZXI7XHJcbiAgbGV0IGNoZWNrbWFyayA9IGNyZWF0ZUVsZW1lbnQoJ2xhYmVsJywgJ2NoZWNrbWFyaycpO1xyXG4gIGxldCBpbnB1dCA9IGNyZWF0ZUVsZW1lbnQoJ2lucHV0JywgJycpO1xyXG4gIHNldEF0dHJpYnV0ZXMoaW5wdXQsIHtcclxuICAgICd0eXBlJzogJ3JhZGlvJyxcclxuICAgICduYW1lJzogJ3R5cGVzJ1xyXG4gIH0pO1xyXG4gIGxldCBtYXJrID0gY3JlYXRlRWxlbWVudCgnc3BhbicsICdjaGVja21hcmtfX21hcmsnKTtcclxuICBsZXQgdmFyVGV4dCA9IGNyZWF0ZUVsZW1lbnQoJ3AnLCAnJyk7XHJcblxyXG4gIGlucHV0LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIGZ1bmN0aW9uKCkge1xyXG4gICAgY2hhbmdlUHJpY2VIYW5kbGUoKTtcclxuICB9KTtcclxuXHJcbiAgaWYgKCBmaXJzdCApIHtcclxuICAgIGNoZWNrbWFya1dyYXBwZXIgPSBjcmVhdGVFbGVtZW50KCdkaXYnLCAnY29sLTEyJyk7XHJcbiAgfSBlbHNlIHtcclxuICAgIGNoZWNrbWFya1dyYXBwZXIgPSBjcmVhdGVFbGVtZW50KCdkaXYnLCAnY29sLTEyIG10LTMnKTtcclxuICB9XHJcblxyXG4gIGlucHV0LmRhdGFzZXQuYmFzZVByaWNlID0gYmFzZVByaWNlID8gYmFzZVByaWNlIDogMDtcclxuICB2YXJUZXh0LnRleHRDb250ZW50ID0gdGV4dDtcclxuICBjaGVja21hcmsuYXBwZW5kQ2hpbGQoaW5wdXQpO1xyXG4gIGNoZWNrbWFyay5hcHBlbmRDaGlsZChtYXJrKTtcclxuICBjaGVja21hcmsuYXBwZW5kQ2hpbGQodmFyVGV4dCk7XHJcbiAgY2hlY2ttYXJrV3JhcHBlci5hcHBlbmRDaGlsZChjaGVja21hcmspO1xyXG5cclxuICByZXR1cm4gY2hlY2ttYXJrV3JhcHBlcjtcclxufVxyXG5cclxuZnVuY3Rpb24gY3JlYXRlRWxlbWVudCh0YWcsIGNsYXNzTmFtZSkge1xyXG4gIGxldCBlbGVtID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCh0YWcpO1xyXG4gIGVsZW0uY2xhc3NMaXN0ID0gY2xhc3NOYW1lO1xyXG5cclxuICByZXR1cm4gZWxlbTtcclxufVxyXG5cclxuZnVuY3Rpb24gc2V0QXR0cmlidXRlcyhlbCwgYXR0cnMpIHtcclxuICBmb3IodmFyIGtleSBpbiBhdHRycykge1xyXG4gICAgZWwuc2V0QXR0cmlidXRlKGtleSwgYXR0cnNba2V5XSk7XHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBjYXJkSGVhZGVySGFuZGxlKG1vZGFsU3dpcGVyLCB1cmwpIHtcclxuICBsZXQgdGFyZ2V0cyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy1tb2RhbC1pbml0Jyk7XHJcblxyXG4gIGlmICggdGFyZ2V0cy5sZW5ndGggKSB7XHJcbiAgICB0YXJnZXRzLmZvckVhY2godGFyZ2V0ID0+IHtcclxuICAgICAgbGV0IHRhcmdldElkID0gdGFyZ2V0LmRhdGFzZXQuaWQ7XHJcbiAgICAgIHRhcmdldC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGdldFNsaWRlcnNEYXRhKG1vZGFsU3dpcGVyLCBgJHt1cmwgKyB0YXJnZXRJZH1gKTtcclxuICAgICAgfSk7XHJcbiAgICB9KTtcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldFNsaWRlcnNEYXRhKGNvbnRhaW5lciwgdXJsKSB7XHJcbiAgbGV0IHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xyXG4gIHhoci5vcGVuKCdHRVQnLCB1cmwpO1xyXG4gIHhoci5zZW5kKCk7XHJcblxyXG4gIGlmICggIWNvbnRhaW5lciApIHtcclxuICAgIHJldHVybjtcclxuICB9XHJcblxyXG4gIHhoci5vbmxvYWQgPSBmdW5jdGlvbigpIHtcclxuICAgIGlmICh4aHIuc3RhdHVzICE9IDIwMCkge1xyXG4gICAgICBjb25zb2xlLmxvZyhg0J7RiNC40LHQutCwICR7eGhyLnN0YXR1c306ICR7eGhyLnN0YXR1c1RleHR9YCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBsZXQgZGF0YSA9IEpTT04ucGFyc2UoeGhyLnJlc3BvbnNlKTtcclxuICAgICAgY29udGFpbmVyLnJlbW92ZUFsbFNsaWRlcygpO1xyXG5cclxuICAgICAgZGF0YS5mb3JFYWNoKGl0ZW0gPT4ge1xyXG4gICAgICAgIGxldCBzbGlkZUNvbnRlbnQgPSBjcmVhdGVTbGlkZShpdGVtKTtcclxuICAgICAgICBjb250YWluZXIuYXBwZW5kU2xpZGUoc2xpZGVDb250ZW50KTtcclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgeGhyLm9uZXJyb3IgPSBmdW5jdGlvbigpIHtcclxuICAgIGNvbnNvbGUubG9nKFwi0JfQsNC/0YDQvtGBINC90LUg0YPQtNCw0LvRgdGPXCIpO1xyXG4gIH07XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZVNsaWRlKHN0cikge1xyXG4gIGxldCBpbWcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbWcnKTtcclxuICBsZXQgc2xpZGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICBzbGlkZS5jbGFzc0xpc3QuYWRkKCdzd2lwZXItc2xpZGUnLCAnbWFpbi1zbGlkZXJfX3NsaWRlJyk7XHJcbiAgaW1nLnNyYyA9ICdodHRwOi8vZjM2MzUwOTc1ODE3Lm5ncm9rLmlvJyArIHN0cjtcclxuICBzbGlkZS5hcHBlbmRDaGlsZChpbWcpO1xyXG5cclxuICByZXR1cm4gc2xpZGU7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHZhbGlkYXRlRnJvbSgpIHtcclxuICBsZXQgZm9ybXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuanMtZm9ybS12YWxpZGF0ZScpO1xyXG5cclxuICBpZiAoIGZvcm1zLmxlbmd0aCApIHtcclxuICAgIGZvciAoY29uc3QgZm9ybSBvZiBmb3Jtcykge1xyXG4gICAgICBsZXQgZmllbGRzID0gZm9ybS5xdWVyeVNlbGVjdG9yQWxsKCcuanMtZm9ybS12YWxpZGF0ZS1pbnB1dCBpbnB1dCcpO1xyXG4gICAgICBsZXQgZmlsZSA9IGZvcm0ucXVlcnlTZWxlY3RvcignLmpzLWNhbGN1bGF0ZS1maWxlLWlucHV0Jyk7XHJcbiAgICAgIGxldCB2YWxpZEZvcm0gPSBmYWxzZTtcclxuXHJcbiAgICAgIGZvciAoY29uc3QgZmllbGQgb2YgZmllbGRzKSB7XHJcbiAgICAgICAgZmllbGQuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICBpZiAoICF2YWxpZGF0ZUZpZWxkKGZpZWxkKSApIHtcclxuICAgICAgICAgICAgZmllbGQuY2xhc3NMaXN0LmFkZCgnaGFzLWVycm9yJyk7XHJcbiAgICAgICAgICAgIHZhbGlkRm9ybSA9IGZhbHNlO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgZmllbGQuY2xhc3NMaXN0LnJlbW92ZSgnaGFzLWVycm9yJyk7XHJcbiAgICAgICAgICAgIHZhbGlkRm9ybSA9IHRydWU7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGZvcm0uYWRkRXZlbnRMaXN0ZW5lcignc3VibWl0JywgZnVuY3Rpb24oZSkge1xyXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuXHJcbiAgICAgICAgZm9yIChjb25zdCBmaWVsZCBvZiBmaWVsZHMpIHtcclxuICAgICAgICAgIGlmICggIXZhbGlkYXRlRmllbGQoZmllbGQpICkge1xyXG4gICAgICAgICAgICBmaWVsZC5jbGFzc0xpc3QuYWRkKCdoYXMtZXJyb3InKTtcclxuICAgICAgICAgICAgdmFsaWRGb3JtID0gZmFsc2U7XHJcblxyXG4gICAgICAgICAgICByZXR1cm5cclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGZpZWxkLmNsYXNzTGlzdC5yZW1vdmUoJ2hhcy1lcnJvcicpO1xyXG4gICAgICAgICAgICB2YWxpZEZvcm0gPSB0cnVlO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCB2YWxpZEZvcm0gKSB7XHJcbiAgICAgICAgICBsZXQgZm9ybURhdGEgPSBuZXcgRm9ybURhdGEoZm9ybSk7XHJcblxyXG4gICAgICAgICAgaWYgKCBmaWxlICkge1xyXG4gICAgICAgICAgICBmb3JtRGF0YS5hcHBlbmQoJ2ZpbGUnLCBmaWxlLmZpbGVzWzBdKTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICBsZXQgc3VjY2VzcyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBmb3JtLmNsYXNzTGlzdC5hZGQoJ3N1Y2Nlc3MnKTtcclxuICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgc2VuZERhdGEoZm9ybURhdGEsICcvJywgc3VjY2Vzcyk7XHJcblxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBjb25zb2xlLmxvZygndW52YWxpZCBmb3JtJylcclxuICAgICAgICB9XHJcbiAgICAgIH0pXHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiB2YWxpZGF0ZUZpZWxkKGlucHV0KSB7XHJcbiAgbGV0IHZhbHVlID0gaW5wdXQudmFsdWU7XHJcbiAgbGV0IHR5cGUgPSBpbnB1dC50eXBlO1xyXG4gIGxldCByZXN1bHQgPSBmYWxzZTtcclxuXHJcbiAgaWYgKCB0eXBlID09ICd0ZWwnICkge1xyXG4gICAgcmVzdWx0ID0gdmFsaWRhdGVQaG9uZSh2YWx1ZSk7XHJcbiAgfSBlbHNlIGlmICggdHlwZSA9PSAnZW1haWwnICkge1xyXG4gICAgcmVzdWx0ID0gdmFsaWRhdGVNYWlsKHZhbHVlKTtcclxuICB9IGVsc2Uge1xyXG4gICAgcmVzdWx0ID0gIWlzRW1wdHkodmFsdWUpO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHJlc3VsdDtcclxufVxyXG5cclxuZnVuY3Rpb24gaXNFbXB0eShzdHIpIHtcclxuICByZXR1cm4gc3RyID09ICcnICYmIHRydWU7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHZhbGlkYXRlUGhvbmUoc3RyKSB7XHJcbiAgbGV0IHJlZyA9IC9eW1xcK10/WyhdP1swLTldezN9WyldP1stXFxzXFwuXT9bMC05XXszfVstXFxzXFwuXT9bMC05XXs0LDZ9JC9pbTtcclxuICByZXR1cm4gdGVzdFJlZyhyZWcsIHJlbW92ZVNwYWNlcyhzdHIpKTtcclxufVxyXG5cclxuZnVuY3Rpb24gdmFsaWRhdGVNYWlsKHN0cikge1xyXG4gIGxldCByZXN1bHQgPSBmYWxzZTtcclxuICBjb25zdCByZWcgPSAvXigoW148PigpW1xcXVxcXFwuLDs6XFxzQFxcXCJdKyhcXC5bXjw+KClbXFxdXFxcXC4sOzpcXHNAXFxcIl0rKSopfChcXFwiLitcXFwiKSlAKChcXFtbMC05XXsxLDN9XFwuWzAtOV17MSwzfVxcLlswLTldezEsM31cXC5bMC05XXsxLDN9XFxdKXwoKFthLXpBLVpcXC0wLTldK1xcLikrW2EtekEtWl17Mix9KSkkLztcclxuICByZXN1bHQgPSB0ZXN0UmVnKHJlZywgc3RyKVxyXG4gIHJldHVybiByZXN1bHQ7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHJlbW92ZVNwYWNlcyhzdHIpIHtcclxuICByZXR1cm4gc3RyLnJlcGxhY2UoL1xccy9nLCAnJyk7O1xyXG59XHJcblxyXG5mdW5jdGlvbiB0ZXN0UmVnKHJlLCBzdHIpe1xyXG4gIGlmIChyZS50ZXN0KHN0cikpIHtcclxuICAgIHJldHVybiB0cnVlO1xyXG4gIH0gZWxzZSB7XHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBzZW5kRGF0YShkYXRhLCB1cmwsIHN1Y2Nlc3MpIHtcclxuICBpZiAoICFkYXRhIHx8ICF1cmwgKSB7XHJcbiAgICByZXR1cm4gY29uc29sZS5sb2coJ2Vycm9yLCBoYXZlIG5vIGRhdGEgb3IgdXJsJyk7XHJcbiAgfVxyXG5cclxuICBsZXQgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XHJcblxyXG4gIHhoci5vbmxvYWRlbmQgPSBmdW5jdGlvbigpIHtcclxuICAgIGlmICh4aHIuc3RhdHVzID09IDIwMCkge1xyXG4gICAgICBsZXQgc3VjY2Vzc0Z1ID0gc3VjY2VzcztcclxuXHJcbiAgICAgIHN1Y2Nlc3NGdSgpO1xyXG4gICAgICBjb25zb2xlLmxvZyhcItCj0YHQv9C10YVcIik7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBjb25zb2xlLmxvZyhcItCe0YjQuNCx0LrQsCBcIiArIHRoaXMuc3RhdHVzKTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICB4aHIub3BlbihcIlBPU1RcIiwgdXJsKTtcclxuICB4aHIuc2VuZChkYXRhKTtcclxufVxyXG5cclxuZnVuY3Rpb24gaW5pdE1vZGFsKG1vZGFsU3dpcGVyKSB7XHJcbiAgbGV0IGluaXRzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmpzLW1vZGFsLWluaXQnKTtcclxuICBsZXQgYm9keSA9IGRvY3VtZW50LmJvZHk7XHJcblxyXG4gIGlmICggaW5pdHMubGVuZ3RoICkge1xyXG4gICAgZm9yIChjb25zdCBpbml0IG9mIGluaXRzKSB7XHJcbiAgICAgIGxldCB0YXJnZXQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGluaXQuZGF0YXNldC50YXJnZXQpO1xyXG4gICAgICBsZXQgY2xvc2VzID0gdGFyZ2V0LnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy1tb2RhbC1jbG9zZScpO1xyXG5cclxuICAgICAgaWYgKCBjbG9zZXMubGVuZ3RoICkge1xyXG4gICAgICAgIGZvciAoY29uc3QgY2xvc2Ugb2YgY2xvc2VzKSB7XHJcbiAgICAgICAgICBjbG9zZS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0YXJnZXQuY2xhc3NMaXN0LnJlbW92ZSgnaXMtYWN0aXZlJyk7XHJcbiAgICAgICAgICAgIGJvZHkuY2xhc3NMaXN0LnJlbW92ZSgnbW9kYWwtaXMtYWN0aXZlJyk7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmICggdGFyZ2V0ICkge1xyXG4gICAgICAgIGluaXQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgIHRhcmdldC5jbGFzc0xpc3QuYWRkKCdpcy1hY3RpdmUnKTtcclxuICAgICAgICAgIGJvZHkuY2xhc3NMaXN0LmFkZCgnbW9kYWwtaXMtYWN0aXZlJyk7XHJcblxyXG4gICAgICAgICAgaWYgKCB0YXJnZXQuZGF0YXNldC5zbGlkZXIgPT0gJ3RydWUnICkge1xyXG4gICAgICAgICAgICBtb2RhbFN3aXBlci51cGRhdGUoKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gaW5pdERyYWdORHJvcCgpIHtcclxuICBsZXQgY29udGFpbmVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLWNhbGN1bGF0ZS1maWxlJyk7XHJcbiAgbGV0IGRyb3BBcmVhID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLWNhbGN1bGF0ZS1maWxlLWRyb3BhcmVhJyk7XHJcbiAgbGV0IGZpbGVFbGVtID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLWNhbGN1bGF0ZS1maWxlLWlucHV0Jyk7XHJcbiAgbGV0IGFkZGluZ3MgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtY2FsY3VsYXRlLWZpbGUtYWRkaW5ncycpO1xyXG4gIGxldCBmaWxlTmFtZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy1jYWxjdWxhdGUtZmlsZS1uYW1lJyk7XHJcbiAgbGV0IHJlbW92ZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtY2FsY3VsYXRlLWZpbGUtcmVtb3ZlcicpO1xyXG5cclxuICBpZiAoICFjb250YWluZXIgJiYgIWRyb3BBcmVhICYmICFmaWxlRWxlbSAmJiAhYWRkaW5ncyAmJiAhZmlsZU5hbWUgJiYgIXJlbW92ZXIgKSB7XHJcbiAgICByZXR1cm47XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBwcmV2ZW50RGVmYXVsdHMgKGUpIHtcclxuICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgfTtcclxuXHJcbiAgZnVuY3Rpb24gaGlnaGxpZ2h0KCkge1xyXG4gICAgY29udGFpbmVyLmNsYXNzTGlzdC5hZGQoJ2hpZ2hsaWdodCcpO1xyXG4gIH07XHJcblxyXG4gIGZ1bmN0aW9uIHVuaGlnaGxpZ2h0KCkge1xyXG4gICAgY29udGFpbmVyLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZ2hsaWdodCcpO1xyXG4gIH07XHJcblxyXG4gIGZ1bmN0aW9uIGhhbmRsZUZpbGVzKGZpbGVzKSB7XHJcbiAgICBhZGRpbmdzLmNsYXNzTGlzdC5hZGQoJ2lzLXNob3cnKTtcclxuICAgIGNvbnRhaW5lci5jbGFzc0xpc3QuYWRkKCdoYXMtcmVzdWx0Jyk7XHJcbiAgICBmaWxlTmFtZS50ZXh0Q29udGVudCA9IGZpbGVzWzBdLm5hbWU7XHJcbiAgfTtcclxuXHJcbiAgZnVuY3Rpb24gaGFuZGxlUmVtb3ZlRmlsZXMoKSB7XHJcbiAgICBhZGRpbmdzLmNsYXNzTGlzdC5yZW1vdmUoJ2lzLXNob3cnKTtcclxuICAgIGNvbnRhaW5lci5jbGFzc0xpc3QucmVtb3ZlKCdoYXMtcmVzdWx0Jyk7XHJcbiAgICBmaWxlTmFtZS50ZXh0Q29udGVudCA9ICcnO1xyXG4gICAgZmlsZUVsZW0udmFsdWUgPSAnJztcclxuICB9O1xyXG5cclxuICBmdW5jdGlvbiBoYW5kbGVEcm9wKGUpIHtcclxuICAgIGxldCBkdCA9IGUuZGF0YVRyYW5zZmVyO1xyXG4gICAgbGV0IGZpbGVzID0gZHQuZmlsZXM7XHJcblxyXG4gICAgaWYgKCBWYWxpZGF0ZSh0aGlzKSApIHtcclxuICAgICAgaGFuZGxlRmlsZXMoZmlsZXMpO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIGZpbGVFbGVtLmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIGZ1bmN0aW9uKCkge1xyXG4gICAgaWYgKCBWYWxpZGF0ZSh0aGlzKSApIHtcclxuICAgICAgaGFuZGxlRmlsZXModGhpcy5maWxlcyk7XHJcbiAgICB9XHJcbiAgfSk7XHJcblxyXG4gIHJlbW92ZXIuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbigpIHtcclxuICAgIGhhbmRsZVJlbW92ZUZpbGVzKCk7XHJcbiAgfSk7XHJcblxyXG4gIFsnZHJhZ2VudGVyJywgJ2RyYWdvdmVyJywgJ2RyYWdsZWF2ZScsICdkcm9wJ10uZm9yRWFjaChldmVudE5hbWUgPT4ge1xyXG4gICAgZHJvcEFyZWEuYWRkRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIHByZXZlbnREZWZhdWx0cywgZmFsc2UpO1xyXG4gIH0pO1xyXG5cclxuICBbJ2RyYWdlbnRlcicsICdkcmFnb3ZlciddLmZvckVhY2goZXZlbnROYW1lID0+IHtcclxuICAgIGRyb3BBcmVhLmFkZEV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCBoaWdobGlnaHQsIGZhbHNlKTtcclxuICB9KTtcclxuICBcclxuICBbJ2RyYWdsZWF2ZScsICdkcm9wJ10uZm9yRWFjaChldmVudE5hbWUgPT4ge1xyXG4gICAgZHJvcEFyZWEuYWRkRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIHVuaGlnaGxpZ2h0LCBmYWxzZSk7XHJcbiAgfSk7XHJcblxyXG4gIGRyb3BBcmVhLmFkZEV2ZW50TGlzdGVuZXIoJ2Ryb3AnLCBoYW5kbGVEcm9wLCBmYWxzZSk7XHJcblxyXG4gIHZhciBfdmFsaWRGaWxlRXh0ZW5zaW9ucyA9IFsnLnppcCcsICcucmFyJ107XHJcblxyXG4gIGZ1bmN0aW9uIFZhbGlkYXRlKGlucHV0KSB7XHJcbiAgICB2YXIgc0ZpbGVOYW1lID0gaW5wdXQudmFsdWU7XHJcblxyXG4gICAgaWYgKHNGaWxlTmFtZS5sZW5ndGggPiAwKSB7XHJcbiAgICAgIHZhciBibG5WYWxpZCA9IGZhbHNlO1xyXG4gICAgICBmb3IgKHZhciBqID0gMDsgaiA8IF92YWxpZEZpbGVFeHRlbnNpb25zLmxlbmd0aDsgaisrKSB7XHJcbiAgICAgICAgdmFyIHNDdXJFeHRlbnNpb24gPSBfdmFsaWRGaWxlRXh0ZW5zaW9uc1tqXTtcclxuICAgICAgICBpZiAoc0ZpbGVOYW1lLnN1YnN0cihzRmlsZU5hbWUubGVuZ3RoIC0gc0N1ckV4dGVuc2lvbi5sZW5ndGgsIHNDdXJFeHRlbnNpb24ubGVuZ3RoKS50b0xvd2VyQ2FzZSgpID09IHNDdXJFeHRlbnNpb24udG9Mb3dlckNhc2UoKSkge1xyXG4gICAgICAgICAgYmxuVmFsaWQgPSB0cnVlO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoIWJsblZhbGlkKSB7XHJcbiAgICAgICAgY29udGFpbmVyLmNsYXNzTGlzdC5hZGQoJ2hhcy1lcnJvcicpO1xyXG5cclxuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgY29udGFpbmVyLmNsYXNzTGlzdC5yZW1vdmUoJ2hhcy1lcnJvcicpO1xyXG4gICAgICAgIH0sIDIwMDApXHJcblxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0cnVlO1xyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gaW5pdFJhbmdlKCkge1xyXG4gIHZhciBzbGlkZXJzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmpzLXJhbmdlJyk7XHJcblxyXG4gIGlmICggc2xpZGVycy5sZW5ndGggKSB7XHJcbiAgICBmb3IgKGNvbnN0IHNsaWRlciBvZiBzbGlkZXJzKSB7XHJcbiAgICAgIGxldCBzbGlkZXJTdGVwID0gTnVtYmVyKHNsaWRlci5kYXRhc2V0LnN0ZXApO1xyXG4gICAgICBsZXQgc2xpZGVyTWluID0gTnVtYmVyKHNsaWRlci5kYXRhc2V0Lm1pbik7XHJcbiAgICAgIGxldCBzbGlkZXJNYXggPSBOdW1iZXIoc2xpZGVyLmRhdGFzZXQubWF4KTtcclxuICAgICAgbGV0IHNsaWRlclBpcHMgPSBOdW1iZXIoc2xpZGVyLmRhdGFzZXQucGlwcyk7XHJcblxyXG4gICAgICBub1VpU2xpZGVyLmNyZWF0ZShzbGlkZXIsIHtcclxuICAgICAgICBzdGFydDogWzBdLFxyXG4gICAgICAgIHN0ZXA6IHNsaWRlclN0ZXAsXHJcbiAgICAgICAgcmFuZ2U6IHtcclxuICAgICAgICAgICdtaW4nOiBzbGlkZXJNaW4sXHJcbiAgICAgICAgICAnbWF4Jzogc2xpZGVyTWF4XHJcbiAgICAgICAgfSxcclxuICAgICAgICBjb25uZWN0OiAnbG93ZXInLFxyXG4gICAgICAgIHRvb2x0aXBzOiB0cnVlLFxyXG4gICAgICAgIGZvcm1hdDogd051bWIoe1xyXG4gICAgICAgICAgZGVjaW1hbHM6IDMsXHJcbiAgICAgICAgICB0aG91c2FuZDogJy4nLFxyXG4gICAgICAgIH0pLFxyXG4gICAgICAgIHBpcHM6IHtcclxuICAgICAgICAgIG1vZGU6ICdjb3VudCcsXHJcbiAgICAgICAgICB2YWx1ZXM6IHNsaWRlclBpcHMsXHJcbiAgICAgICAgICBzdGVwcGVkOiBmYWxzZVxyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcblxyXG4gICAgICBsZXQgbWluaU1hcmtlcnMgPSBzbGlkZXIucXVlcnlTZWxlY3RvckFsbCgnLm5vVWktbWFya2VyLWhvcml6b250YWwubm9VaS1tYXJrZXInKTtcclxuXHJcbiAgICAgIGlmICggbWluaU1hcmtlcnMubGVuZ3RoICkge1xyXG4gICAgICAgIGZvciAoIGNvbnN0IG1pbmlNYXJrZXIgb2YgbWluaU1hcmtlcnMgKSB7XHJcbiAgICAgICAgICBtaW5pTWFya2VyLnJlbW92ZSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gaW5pdEhlYWRlclRvZ2dsZXIoKSB7XHJcbiAgbGV0IHRvZ2dsZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtaGVhZGVyLXRvZ2dsZXInKTtcclxuICBsZXQgaGVhZGVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLWhlYWRlcicpO1xyXG4gIGxldCBwYWdlV3JhcCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy1wYWdlLXdyYXAnKTtcclxuICBsZXQgZGFya25lc3MgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtaGVhZGVyLWRhcmtuZXNzJyk7XHJcblxyXG4gIGlmICggdG9nZ2xlciAmJiBoZWFkZXIgJiYgcGFnZVdyYXAgJiYgZGFya25lc3MgKSB7XHJcbiAgICB0b2dnbGVyLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgIGhlYWRlci5jbGFzc0xpc3QudG9nZ2xlKCdpcy1vcGVuJyk7XHJcbiAgICAgIHRvZ2dsZXIuY2xhc3NMaXN0LnRvZ2dsZSgnaXMtYWN0aXZlJyk7XHJcbiAgICAgIHBhZ2VXcmFwLmNsYXNzTGlzdC50b2dnbGUoJ3Njcm9sbC1ibG9ja2VkLW1vYmlsZScpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgZGFya25lc3MuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbigpIHtcclxuICAgICAgaGVhZGVyLmNsYXNzTGlzdC5yZW1vdmUoJ2lzLW9wZW4nKTtcclxuICAgICAgdG9nZ2xlci5jbGFzc0xpc3QucmVtb3ZlKCdpcy1hY3RpdmUnKTtcclxuICAgICAgcGFnZVdyYXAuY2xhc3NMaXN0LnJlbW92ZSgnc2Nyb2xsLWJsb2NrZWQtbW9iaWxlJyk7XHJcbiAgICB9KTtcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGluaXRBbGJ1bXNDYXJkU2xpZGVyKCkge1xyXG4gIHZhciBteVN3aXBlciA9IG5ldyBTd2lwZXIoJy5qcy1hbGJ1bXMtY2FyZC1zbGlkZXInLCB7XHJcbiAgICBzcGVlZDogNDAwLFxyXG4gICAgc2xpZGVzUGVyVmlldzogMSxcclxuICAgIG5hdmlnYXRpb246IHtcclxuICAgICAgbmV4dEVsOiAnLnN3aXBlci1idXR0b24tbmV4dCcsXHJcbiAgICAgIHByZXZFbDogJy5zd2lwZXItYnV0dG9uLXByZXYnLFxyXG4gICAgfSxcclxuICB9KTtcclxuXHJcbiAgcmV0dXJuIG15U3dpcGVyO1xyXG59XHJcblxyXG5mdW5jdGlvbiBpbml0QWxidW1TbGlkZXIoKSB7XHJcbiAgdmFyIG15U3dpcGVyID0gbmV3IFN3aXBlcignLmpzLXN3aXBlci1hbGJ1bScsIHtcclxuICAgIHNwZWVkOiA0MDAsXHJcbiAgICBzbGlkZXNQZXJWaWV3OiAxLFxyXG4gICAgbG9vcDogZmFsc2UsXHJcbiAgICBwcmVsb2FkSW1hZ2VzOiBmYWxzZSxcclxuICAgIHNwYWNlQmV0d2VlbjogMTIsXHJcbiAgICBsYXp5OiB0cnVlLFxyXG4gICAgbmF2aWdhdGlvbjoge1xyXG4gICAgICBuZXh0RWw6ICcuc3dpcGVyLWJ1dHRvbi1uZXh0JyxcclxuICAgICAgcHJldkVsOiAnLnN3aXBlci1idXR0b24tcHJldicsXHJcbiAgICB9LFxyXG4gIH0pO1xyXG5cclxuICByZXR1cm4gbXlTd2lwZXI7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGluaXRTd2lwZXIoKSB7XHJcbiAgdmFyIG15U3dpcGVyID0gbmV3IFN3aXBlcignLmpzLXN3aXBlci1jb250YWluZXInLCB7XHJcbiAgICBzcGVlZDogNDAwLFxyXG4gICAgc2xpZGVzUGVyVmlldzogNixcclxuICAgIHNwYWNlQmV0d2VlbjogNDAsXHJcbiAgICBsb29wOiBmYWxzZSxcclxuICAgIHByZWxvYWRJbWFnZXM6IGZhbHNlLFxyXG4gICAgbGF6eTogdHJ1ZSwgXHJcbiAgICBuYXZpZ2F0aW9uOiB7XHJcbiAgICAgIG5leHRFbDogJy5zd2lwZXItYnV0dG9uLW5leHQnLFxyXG4gICAgICBwcmV2RWw6ICcuc3dpcGVyLWJ1dHRvbi1wcmV2JyxcclxuICAgIH0sXHJcbiAgICBicmVha3BvaW50czoge1xyXG4gICAgICA0NTk6IHtcclxuICAgICAgICBzbGlkZXNQZXJWaWV3OiAxLFxyXG4gICAgICB9LFxyXG4gICAgICA1OTk6IHtcclxuICAgICAgICBzbGlkZXNQZXJWaWV3OiAyLFxyXG4gICAgICB9LFxyXG4gICAgICA3Njc6IHtcclxuICAgICAgICBzbGlkZXNQZXJWaWV3OiAzLFxyXG4gICAgICB9LFxyXG4gICAgICAxMTk5OiB7XHJcbiAgICAgICAgc2xpZGVzUGVyVmlldzogNCxcclxuICAgICAgfSxcclxuICAgIH1cclxuICB9KTtcclxuXHJcbiAgcmV0dXJuIG15U3dpcGVyO1xyXG59XHJcblxyXG5mdW5jdGlvbiBpbml0U3dpcGVyU3RhdGljaygpIHtcclxuICB2YXIgbXlTd2lwZXIgPSBuZXcgU3dpcGVyKCcuanMtc3dpcGVyLWNvbnRhaW5lci1zdGF0aWNrJywge1xyXG4gICAgc3BlZWQ6IDQwMCxcclxuICAgIHNsaWRlc1BlclZpZXc6IDYsXHJcbiAgICBzcGFjZUJldHdlZW46IDQwLFxyXG4gICAgbG9vcDogZmFsc2UsXHJcbiAgICBwcmVsb2FkSW1hZ2VzOiBmYWxzZSxcclxuICAgIGxhenk6IHRydWUsXHJcbiAgICBmb2xsb3dGaW5nZXI6IGZhbHNlLFxyXG4gICAgYnJlYWtwb2ludHM6IHtcclxuICAgICAgNDU5OiB7XHJcbiAgICAgICAgc2xpZGVzUGVyVmlldzogMSxcclxuICAgICAgfSxcclxuICAgICAgNTk5OiB7XHJcbiAgICAgICAgc2xpZGVzUGVyVmlldzogMixcclxuICAgICAgfSxcclxuICAgICAgNzY3OiB7XHJcbiAgICAgICAgc2xpZGVzUGVyVmlldzogMyxcclxuICAgICAgfSxcclxuICAgICAgMTE5OToge1xyXG4gICAgICAgIHNsaWRlc1BlclZpZXc6IDQsXHJcbiAgICAgIH0sXHJcbiAgICB9XHJcbiAgfSk7XHJcblxyXG4gIHJldHVybiBteVN3aXBlcjtcclxufVxyXG5cclxuZnVuY3Rpb24gaW5pdE1haW5Td2lwZXIoKSB7XHJcbiAgdmFyIG15U3dpcGVyID0gbmV3IFN3aXBlcignLmpzLW1haW4tc3dpcGVyLWNvbnRhaW5lcicsIHtcclxuICAgIHNwZWVkOiA0MDAsXHJcbiAgICBzbGlkZXNQZXJWaWV3OiAxLFxyXG4gICAgbG9vcDogdHJ1ZSxcclxuICAgIHNwYWNlQmV0d2VlbjogMTIsXHJcbiAgICBwYWdpbmF0aW9uOiB7XHJcbiAgICAgIGVsOiAnLnN3aXBlci1wYWdpbmF0aW9uJyxcclxuICAgICAgdHlwZTogJ2J1bGxldHMnLFxyXG4gICAgICBjbGlja2FibGU6IHRydWVcclxuICAgIH0sXHJcbiAgICBuYXZpZ2F0aW9uOiB7XHJcbiAgICAgIG5leHRFbDogJy5zd2lwZXItYnV0dG9uLW5leHQnLFxyXG4gICAgICBwcmV2RWw6ICcuc3dpcGVyLWJ1dHRvbi1wcmV2JyxcclxuICAgIH0sXHJcbiAgfSk7XHJcblxyXG4gIHJldHVybiBteVN3aXBlcjtcclxufVxyXG5cclxuZnVuY3Rpb24gaW5pdE1vZGFsU3dpcGVyKCkge1xyXG4gIHZhciBteVN3aXBlciA9IG5ldyBTd2lwZXIoJy5qcy1tYWluLXN3aXBlci1tb2RhbCcsIHtcclxuICAgIHNwZWVkOiA0MDAsXHJcbiAgICBzbGlkZXNQZXJWaWV3OiAxLFxyXG4gICAgbG9vcDogdHJ1ZSxcclxuICAgIHNwYWNlQmV0d2VlbjogMTIsXHJcbiAgICBwcmVsb2FkSW1hZ2VzOiBmYWxzZSxcclxuICAgIGxhenk6IHRydWUsXHJcbiAgICBwYWdpbmF0aW9uOiB7XHJcbiAgICAgIGVsOiAnLnN3aXBlci1wYWdpbmF0aW9uJyxcclxuICAgICAgdHlwZTogJ2J1bGxldHMnLFxyXG4gICAgICBjbGlja2FibGU6IHRydWVcclxuICAgIH0sXHJcbiAgICBuYXZpZ2F0aW9uOiB7XHJcbiAgICAgIG5leHRFbDogJy5zd2lwZXItYnV0dG9uLW5leHQnLFxyXG4gICAgICBwcmV2RWw6ICcuc3dpcGVyLWJ1dHRvbi1wcmV2JyxcclxuICAgIH0sXHJcbiAgfSk7XHJcblxyXG4gIHJldHVybiBteVN3aXBlcjtcclxufVxyXG5cclxuZnVuY3Rpb24gaW5pdEFsYnVtc1R5cGVTbGlkZXIoKSB7XHJcbiAgdmFyIG15U3dpcGVyID0gbmV3IFN3aXBlcignLmpzLXR5cGUtYWxidW1zLXN3aXBlcicsIHtcclxuICAgIHNwZWVkOiA0MDAsXHJcbiAgICBzbGlkZXNQZXJWaWV3OiAnYXV0bycsXHJcbiAgICBzbGlkZXNPZmZzZXRBZnRlcjogMTAwLFxyXG4gICAgc3BhY2VCZXR3ZWVuOiAyNCxcclxuICAgIG5hdmlnYXRpb246IHtcclxuICAgICAgbmV4dEVsOiAnLnN3aXBlci1idXR0b24tbmV4dCcsXHJcbiAgICAgIHByZXZFbDogJy5zd2lwZXItYnV0dG9uLXByZXYnLFxyXG4gICAgfSxcclxuICAgIG9uOiB7XHJcbiAgICAgIHNsaWRlQ2hhbmdlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgaWYgKCB0aGlzLmFjdGl2ZUluZGV4ID4gMCApIHtcclxuICAgICAgICAgIHRoaXMuZWwuY2xhc3NMaXN0LmFkZCgnbm90LW9uLXN0YXJ0Jyk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHRoaXMuZWwuY2xhc3NMaXN0LnJlbW92ZSgnbm90LW9uLXN0YXJ0Jyk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICB9KTtcclxuXHJcbiAgcmV0dXJuIG15U3dpcGVyO1xyXG59XHJcblxyXG5mdW5jdGlvbiBpbml0TWFpbkNhcmRzU2xpZGVyKCkge1xyXG4gIHZhciBteVN3aXBlciA9IG5ldyBTd2lwZXIoJy5qcy1tYWluLWNhcmQtc2xpZGVyJywge1xyXG4gICAgc3BlZWQ6IDQwMCxcclxuICAgIHNsaWRlc1BlclZpZXc6IDEsXHJcbiAgICBsb29wOiB0cnVlLFxyXG4gICAgc3BhY2VCZXR3ZWVuOiAxMixcclxuICAgIG5hdmlnYXRpb246IHtcclxuICAgICAgbmV4dEVsOiAnLnN3aXBlci1idXR0b24tbmV4dCcsXHJcbiAgICAgIHByZXZFbDogJy5zd2lwZXItYnV0dG9uLXByZXYnLFxyXG4gICAgfSxcclxuICB9KTtcclxuXHJcbiAgcmV0dXJuIG15U3dpcGVyO1xyXG59XHJcblxyXG5mdW5jdGlvbiB0YWIodGFiSGFuZGxlcikge1xyXG4gICAgbGV0IHRhYnNDb250YWluZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmpzLXRhYi1jb250YWluZXJcIik7XHJcblxyXG4gICAgaWYgKCB0YWJzQ29udGFpbmVyICkge1xyXG4gICAgICBsZXQgbWVudUl0ZW1zID0gdGFic0NvbnRhaW5lci5xdWVyeVNlbGVjdG9yQWxsKFwiLmpzLXRhYi1tZW51LWl0ZW1cIik7XHJcbiAgICAgIGxldCB1bmRlcmxpbmUgPSB0YWJzQ29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoXCIuanMtdGFiLXVuZGVybGluZVwiKTtcclxuXHJcbiAgICAgIG1lbnVJdGVtcy5mb3JFYWNoKCAobWVudUl0ZW0pID0+IHtcclxuICAgICAgICBpZiAoIHVuZGVybGluZSAmJiBtZW51SXRlbS5jbGFzc0xpc3QuY29udGFpbnMoXCJpcy1hY3RpdmVcIikgKSB7XHJcbiAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgY3VycmVudFRhYkFjY2VudCh1bmRlcmxpbmUsIG1lbnVJdGVtKTtcclxuICAgICAgICAgIH0sIDEwMCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBtZW51SXRlbS5vbmNsaWNrID0gKCkgPT4ge1xyXG4gICAgICAgICAgbGV0IGFjdGl2ZU1lbnVJdGVtID0gQXJyYXkuZnJvbShtZW51SXRlbXMpLmZpbmQoZ2V0QWN0aXZlVGFiKTtcclxuICAgICAgICAgIGxldCBhY3RpdmVDb250ZW50SXRlbSA9IHRhYnNDb250YWluZXIucXVlcnlTZWxlY3RvcihhY3RpdmVNZW51SXRlbS5kYXRhc2V0LnRhcmdldCk7XHJcbiAgICAgICAgICBsZXQgY3VycmVudENvbnRlbnRJdGVtID0gdGFic0NvbnRhaW5lci5xdWVyeVNlbGVjdG9yKG1lbnVJdGVtLmRhdGFzZXQudGFyZ2V0KTtcclxuXHJcbiAgICAgICAgICBhY3RpdmVNZW51SXRlbS5jbGFzc0xpc3QucmVtb3ZlKFwiaXMtYWN0aXZlXCIpO1xyXG5cclxuICAgICAgICAgIGlmICggYWN0aXZlQ29udGVudEl0ZW0gKSB7XHJcbiAgICAgICAgICAgIGFjdGl2ZUNvbnRlbnRJdGVtLmNsYXNzTGlzdC5yZW1vdmUoXCJpcy1hY3RpdmVcIik7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgaWYgKCBjdXJyZW50Q29udGVudEl0ZW0gKSB7XHJcbiAgICAgICAgICAgIGN1cnJlbnRDb250ZW50SXRlbS5jbGFzc0xpc3QuYWRkKFwiaXMtYWN0aXZlXCIpO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIG1lbnVJdGVtLmNsYXNzTGlzdC5hZGQoXCJpcy1hY3RpdmVcIik7XHJcblxyXG4gICAgICAgICAgaWYgKCB1bmRlcmxpbmUgKSB7XHJcbiAgICAgICAgICAgIGN1cnJlbnRUYWJBY2NlbnQodW5kZXJsaW5lLCBtZW51SXRlbSk7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgaWYgKCB0YWJIYW5kbGVyICkge1xyXG4gICAgICAgICAgICBkb2N1bWVudC5kaXNwYXRjaEV2ZW50KHRhYkhhbmRsZXIpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICBmdW5jdGlvbiBjdXJyZW50VGFiQWNjZW50KHVuZGVybGluZSwgbWVudUl0ZW0pIHtcclxuICAgIGxldCBpdGVtUG9zaXRpb24gPSBtZW51SXRlbS5vZmZzZXRMZWZ0O1xyXG4gICAgbGV0IGl0ZW1XaWR0aCA9IE51bWJlcihtZW51SXRlbS5zY3JvbGxXaWR0aCk7XHJcblxyXG4gICAgcmV0dXJuIHVuZGVybGluZS5zZXRBdHRyaWJ1dGUoXCJzdHlsZVwiLCBgbGVmdDogJHtpdGVtUG9zaXRpb259cHg7IHdpZHRoOiAke2l0ZW1XaWR0aH1weDtgKTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGdldEFjdGl2ZVRhYihlbGVtZW50KSB7XHJcbiAgICByZXR1cm4gZWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoXCJpcy1hY3RpdmVcIik7XHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBhY2NvcmRpb24oKSB7XHJcbiAgbGV0IHdyYXBwZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuanMtYWNjb3JkaW9uJyk7XHJcbiAgd3JhcHBlci5mb3JFYWNoKHdyYXBwZXJJdGVtID0+IHtcclxuICAgIGxldCBpdGVtcyA9IHdyYXBwZXJJdGVtLnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy1hY2NvcmRpb24taXRlbScpO1xyXG4gICAgbGV0IGluZGl2aWR1YWwgPSB3cmFwcGVySXRlbS5nZXRBdHRyaWJ1dGUoJ2luZGl2aWR1YWwnKSAmJiB3cmFwcGVySXRlbS5nZXRBdHRyaWJ1dGUoJ2luZGl2aWR1YWwnKSAhPT0gJ2ZhbHNlJztcclxuXHJcbiAgICBpdGVtcy5mb3JFYWNoKGl0ZW0gPT4ge1xyXG4gICAgICBpZiAoIGl0ZW0uY2xhc3NMaXN0LmNvbnRhaW5zKCdpcy1hY3RpdmUnKSApIHtcclxuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgIGxldCByZWFkeUNvbnRlbnQgPSBpdGVtLnF1ZXJ5U2VsZWN0b3IoJy5qcy1hY2NvcmRpb24tY29udGVudCcpO1xyXG4gICAgICAgICAgbGV0IHJlYWR5Q29udGVudEhlaWdodCA9IHJlYWR5Q29udGVudC5zY3JvbGxIZWlnaHQ7XHJcblxyXG4gICAgICAgICAgcmVhZHlDb250ZW50LnN0eWxlLm1heEhlaWdodCA9IHJlYWR5Q29udGVudEhlaWdodCArICdweCc7XHJcbiAgICAgICAgfSwgMTAwKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgbGV0IHN1Ykl0ZW1zID0gaXRlbS5xdWVyeVNlbGVjdG9yQWxsKCcuanMtYWNjb3JkaW9uLXN1Yml0ZW0nKTtcclxuXHJcbiAgICAgIGZvciAoY29uc3Qgc3ViSXRlbSBvZiBzdWJJdGVtcykge1xyXG4gICAgICAgIGlmICggc3ViSXRlbS5jbGFzc0xpc3QuY29udGFpbnMoJ2lzLWFjdGl2ZScpICkge1xyXG4gICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgIGxldCByZWFkeUNvbnRlbnQgPSBzdWJJdGVtLnF1ZXJ5U2VsZWN0b3IoJy5qcy1hY2NvcmRpb24tY29udGVudCcpO1xyXG4gICAgICAgICAgICBsZXQgcmVhZHlDb250ZW50SGVpZ2h0ID0gcmVhZHlDb250ZW50LnNjcm9sbEhlaWdodDtcclxuICBcclxuICAgICAgICAgICAgcmVhZHlDb250ZW50LnN0eWxlLm1heEhlaWdodCA9IHJlYWR5Q29udGVudEhlaWdodCArICdweCc7XHJcbiAgICAgICAgICB9LCAxMDApO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgaXRlbUl0ZXJhdGlvbihpdGVtLCBpdGVtcywgaW5kaXZpZHVhbCk7XHJcblxyXG4gICAgICBzdWJJdGVtcy5mb3JFYWNoKHN1Yml0ZW0gPT4ge1xyXG4gICAgICAgIGl0ZW1JdGVyYXRpb24oc3ViaXRlbSwgc3ViSXRlbXMsIGluZGl2aWR1YWwsIHRydWUpXHJcbiAgICAgIH0pO1xyXG4gICAgfSlcclxuICB9KVxyXG59XHJcblxyXG5mdW5jdGlvbiBpdGVtSXRlcmF0aW9uKGl0ZW0sIGl0ZW1zLCBpbmRpdmlkdWFsLCBpc1N1Yml0ZW0pIHtcclxuICBsZXQgaW5pdCA9IGl0ZW0ucXVlcnlTZWxlY3RvcignLmpzLWFjY29yZGlvbi1pbml0Jyk7XHJcbiAgbGV0IGNvbnRlbnQgPSBpdGVtLnF1ZXJ5U2VsZWN0b3IoJy5qcy1hY2NvcmRpb24tY29udGVudCcpO1xyXG5cclxuICBpZiAoIGlzU3ViaXRlbSA9PT0gdHJ1ZSApIHtcclxuICAgIGNvbnRlbnQuYWRkRXZlbnRMaXN0ZW5lcigndHJhbnNpdGlvbmVuZCcsIGZ1bmN0aW9uKCkge1xyXG4gICAgICBsZXQgcGFyZW50SXRlbSA9IGl0ZW0uY2xvc2VzdCgnLmpzLWFjY29yZGlvbi1pdGVtJyk7XHJcbiAgICAgIGxldCBwYXJlbnRDb250ZW50SGVpZ2h0ID0gcGFyZW50SXRlbS5zY3JvbGxIZWlnaHQgKyAncHgnO1xyXG4gICAgICBsZXQgcGFyZW50Q29udGVudCA9IHBhcmVudEl0ZW0ucXVlcnlTZWxlY3RvcignLmpzLWFjY29yZGlvbi1jb250ZW50Jyk7XHJcblxyXG4gICAgICBwYXJlbnRDb250ZW50LnNldEF0dHJpYnV0ZSgnc3R5bGUnLCBgbWF4LWhlaWdodDogJHtwYXJlbnRDb250ZW50SGVpZ2h0fWApO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBpbml0LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oKSB7XHJcbiAgICBpZiAoIGl0ZW0uY2xhc3NMaXN0LmNvbnRhaW5zKCdpcy1hY3RpdmUnKSApIHtcclxuICAgICAgaXRlbS5jbGFzc0xpc3QucmVtb3ZlKCdpcy1hY3RpdmUnKTtcclxuICAgICAgY29udGVudC5zdHlsZS5tYXhIZWlnaHQgPSAnMHB4JztcclxuXHJcbiAgICAgIHJldHVybiBmYWxzZVxyXG4gICAgfVxyXG5cclxuICAgIGlmICggaXNTdWJpdGVtID09PSB0cnVlICkge1xyXG4gICAgICBsZXQgcGFyZW50SXRlbSA9IGl0ZW0uY2xvc2VzdCgnLmpzLWFjY29yZGlvbi1pdGVtJyk7XHJcbiAgICAgIGxldCBwYXJlbnRDb250ZW50ID0gcGFyZW50SXRlbS5xdWVyeVNlbGVjdG9yKCcuanMtYWNjb3JkaW9uLWNvbnRlbnQnKTtcclxuXHJcbiAgICAgIHBhcmVudENvbnRlbnQuc2V0QXR0cmlidXRlKCdzdHlsZScsIGBtYXgtaGVpZ2h0OiBub25lYCk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCBpbmRpdmlkdWFsICkge1xyXG4gICAgICBpdGVtcy5mb3JFYWNoKChlbGVtKSA9PiB7XHJcbiAgICAgICAgbGV0IGVsZW1Db250ZW50ID0gZWxlbS5xdWVyeVNlbGVjdG9yKCcuanMtYWNjb3JkaW9uLWNvbnRlbnQnKTtcclxuICAgICAgICBlbGVtLmNsYXNzTGlzdC5yZW1vdmUoJ2lzLWFjdGl2ZScpO1xyXG4gICAgICAgIGVsZW1Db250ZW50LnN0eWxlLm1heEhlaWdodCA9IDAgKyAncHgnO1xyXG4gICAgICB9KVxyXG4gICAgfVxyXG5cclxuICAgIGl0ZW0uY2xhc3NMaXN0LmFkZCgnaXMtYWN0aXZlJyk7XHJcbiAgICBjb250ZW50LnN0eWxlLm1heEhlaWdodCA9IGNvbnRlbnQuc2Nyb2xsSGVpZ2h0ICsgJ3B4JztcclxuICB9KTtcclxufSJdfQ==
