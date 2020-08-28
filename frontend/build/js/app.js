'use strict';

(function(ELEMENT) {
  ELEMENT.matches = ELEMENT.matches || ELEMENT.mozMatchesSelector || ELEMENT.msMatchesSelector || ELEMENT.oMatchesSelector || ELEMENT.webkitMatchesSelector;
  ELEMENT.closest = ELEMENT.closest || function closest(selector) {
    if (!this) return null;
    if (this.matches(selector)) return this;
    if (!this.parentElement) {return null}
    else return this.parentElement.closest(selector)
  };
}(Element.prototype));

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
  cardHeaderHandle(modalSwiper, '/api/album/images_slider?id=');
  choiceType();
  setHandlersPrice();
  getTruePriceCard();
  sortDesignsPage();

  if ( window.location.hash ) {
    let target = document.querySelector(`[data-target="${window.location.hash}"]`);

    if ( target ) {
      target.click();
    }
  }

  document.addEventListener('tabHandler', function() {
    if ( !swipers ) {
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

function sortDesignsPage() {
  let targets = document.querySelectorAll('.js-sort input');
  let acceptBtn = document.querySelector('.js-sort-accept');

  if ( !targets.length ) {
    return;
  }

  let arr = [];
  let all = false;

  targets.forEach( target => {
    let id = target.dataset.id;

    target.addEventListener('change', function() {
      if ( target.checked ) {
        id === 'all' ? all = true : arr.push(id);
      } else {
        id === 'all' ? all = false : arr.find( (item, index) => item == id && arr.splice(index, 1) );
      }
    });

    if ( id !== 'all' ) {
      target.checked && arr.push(id);
    } else if ( id === 'all' && target.checked ) {
      all = true;
    }
  });

  acceptBtn.addEventListener('click', function() {
    if ( targets.length - 1 === arr.length ) {
      all = true;
    }

    setUrl(arr, all);
  });
}

function setUrl(arr, all) {
  let url = location.protocol + '//' + location.host + location.pathname;
  let params = all ? '' : arr.join();

  return window.location.href = url + '?id=' + params;
}

function getTruePriceCard() {
  let targets = document.querySelectorAll('.js-card-price-wrapper');

  if ( targets.length ) {
    for (const target of targets) {
      let input = target.querySelector('.js-card-price input');
      let output = target.querySelector('.js-card-price-output');
      let basePrice = +output.dataset.price;

      input.addEventListener('input', function () {
        let percantage = getDiscountPercent(+input.value);
        let discountPrice = getDiscountSumm(basePrice, percantage);

        output.textContent = (basePrice - discountPrice) + ' ₽';
      });
    }
  }
}

function choiceType() {
  let types = document.querySelectorAll('.js-choice-type');
  let container = document.querySelector('.js-choice-type-addings');
  let outputContainer = document.querySelector('.js-choice-type-output');
  let ranges = document.querySelectorAll('.js-range');

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
      if ( ranges.length ) {
        ranges.forEach((range) => {
          let preset = range.dataset.preset;
          let rangeMin = range.dataset.min;
          let setMin = rangeMin ? rangeMin : 0;

          range.noUiSlider.set(preset ? preset : setMin);
        });
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
  let rangesCanBeDisabled = document.querySelectorAll('.js-range-can-be-disabled');

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

  if ( baseLists === 0 && rangesCanBeDisabled.length ) {
    rangesCanBeDisabled.forEach(item => {
      let range = item.querySelector('.js-range');
      item.classList.add('disabled');
      range.noUiSlider.set(0);
    });
  } else {
    rangesCanBeDisabled.forEach(item => {
      item.classList.remove('disabled');
    });
  }

  outputPrice.textContent = albumPrice;
  outputDiscountPrice.textContent = albumPriceWithDiscount;
  typeOutput.textContent = activeChoice.querySelector('.calculate-types__title').textContent;
  listsOutput.textContent = albumLists + baseLists;
  albumsOutput.textContent = albums;
  persantageOutput.textContent = percentage + '%';
  discountSummOutput.textContent = (albums * albumPriceWithDiscount) + ' ₽';

  window.calcData = `Вид альбома: ${typeOutput.textContent},\n Количество страниц: ${albumLists},\n Количество альбомов: ${albums},\n Количество выпускников в альбоме: ${peoples},\n Количество человек на одном развороте: ${peoplesOnTurn},\n Количествово разворотов с фотоисторией: ${historyTurns},\n Цена за альбом: ${albumPrice},\n Скидка: ${percentage + '%'},\n Итоговая стоимость альбомов: ${(albums * albumPriceWithDiscount) + ' ₽'};`
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
  let targets = document.querySelectorAll('.js-modal-init.js-modal-slider');

  if ( targets.length ) {
    targets.forEach(target => {
      let targetId = target.dataset.id;
      target.addEventListener('click', function() {
        getSlidersData(modalSwiper, `${url + targetId}`);
      });
    });
  }
}

function getSlidersData(modalSwiper, url) {
  let xhr = new XMLHttpRequest();
  xhr.open('GET', url);
  xhr.send();

  if ( !modalSwiper ) {
    return;
  }

  xhr.onload = function() {
    if (xhr.status != 200) {
      console.log(`Ошибка ${xhr.status}: ${xhr.statusText}`);
    } else {
      let data = JSON.parse(xhr.response);
      modalSwiper.removeAllSlides();

      data.forEach(item => {
        let slideContent = createSlide(item);
        modalSwiper.appendSlide(slideContent);
      });

      setTimeout(() => {
        modalSwiper.update();
      }, 100);
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
  img.src = str;
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

          if ( form.classList.contains('js-form-calc') ) {
            formData.append('data', window.calcData);
          }

          let success = function() {
            form.classList.add('success');
            resetForm(form, formData);
          };

          sendData(formData, '/send_message', success);
        } else {
          console.log('unvalid form');
          return;
        }
      })
    }
  }
}

function resetForm(form, formdata) {
  let btns = form.querySelectorAll('.js-form-calc-reset');
  let fileRemover = form.querySelector('.js-calculate-file-remover');

  if ( btns.length ) {
    for (const btn of btns) {
      btn.addEventListener('click', function() {
        for (var pair of formdata.entries()) {
          formdata.delete(pair[0]);
        }

        form.reset();
        form.classList.remove('success');

        if ( fileRemover ) {
          fileRemover.click();
        }
      });
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

      if ( target ) {
        if ( closes.length ) {
          for (const close of closes) {
            close.addEventListener('click', function() {
              target.classList.remove('is-active');
              body.classList.remove('modal-is-active');
            });
          }
        }

        init.addEventListener('click', function() {
          target.classList.add('is-active');
          body.classList.add('modal-is-active');

          if ( target.dataset.slider == 'true' ) {
            setTimeout(() => {
              modalSwiper.update();
            }, 100);
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
      let sliderRange;
      let sliderMin = Number(slider.dataset.min);
      let sliderMax = Number(slider.dataset.max);
      let sliderStep = Number(slider.dataset.step);
      let sliderPips = Number(slider.dataset.pips);
      let sliderPreset = Number(slider.dataset.preset);

      if ( slider.dataset.individual ) {
        sliderRange = {
          'min': [1],
          '10%': [2, 2],
          'max': [8]
        };
      } else {
        sliderRange = {
          'min': sliderMin,
          'max': sliderMax
        };
      }

      let preset = sliderPreset ? sliderPreset : 0;

      noUiSlider.create(slider, {
        start: [preset],
        step: sliderStep,
        range: sliderRange,
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
      nextEl: '.js-swiper-album-next',
      prevEl: '.js-swiper-album-prev',
    },
  });

  return mySwiper;
}

function initSwiper() {
  let targets = document.querySelectorAll('.js-swiper-container');

  if ( !targets.length ) {
    return;
  }

  let swipers = [];

  targets.forEach( (target, index) => {
    if ( index == 0 || !target.classList.contains('swiper-container-fat') ) {
      var mySwiper = new Swiper(target, {
        speed: 400,
        slidesPerView: 6,
        spaceBetween: 30,
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
    } else {
      var mySwiper = new Swiper(target, {
        speed: 400,
        slidesPerView: 4,
        spaceBetween: 30,
        loop: false,
        preloadImages: false,
        lazy: true,
        navigation: {
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev',
        },
        breakpoints: {
          767: {
            slidesPerView: 1,
          },
          1199: {
            slidesPerView: 2,
          },
        }
      });
    }

    swipers.push(mySwiper);
  });

  return swipers;
}

function initSwiperStatick() {
  var mySwiper = new Swiper('.js-swiper-container-statick', {
    speed: 400,
    slidesPerView: 6,
    spaceBetween: 40,
    loop: false,
    preloadImages: false,
    lazy: true,
    navigation: {
      nextEl: '.js-swiper-container-statick-next',
      prevEl: '.js-swiper-container-statick-prev',
    },
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
    autoHeight: true,
    pagination: {
      el: '.swiper-pagination',
      type: 'bullets',
      clickable: true
    },
    navigation: {
      nextEl: '.js-swiper-main-next',
      prevEl: '.js-swiper-main-prev',
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
    autoHeight: true,
    pagination: {
      el: '.swiper-pagination',
      type: 'bullets',
      clickable: true
    },
    navigation: {
      nextEl: '.js-modal-swiper-next',
      prevEl: '.js-modal-swiper-prev',
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

      menuItems.forEach( (menuItem) => {

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

          if ( tabHandler ) {
            document.dispatchEvent(tabHandler);
          }
        };
      });
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0JztcclxuXHJcbihmdW5jdGlvbihFTEVNRU5UKSB7XHJcbiAgRUxFTUVOVC5tYXRjaGVzID0gRUxFTUVOVC5tYXRjaGVzIHx8IEVMRU1FTlQubW96TWF0Y2hlc1NlbGVjdG9yIHx8IEVMRU1FTlQubXNNYXRjaGVzU2VsZWN0b3IgfHwgRUxFTUVOVC5vTWF0Y2hlc1NlbGVjdG9yIHx8IEVMRU1FTlQud2Via2l0TWF0Y2hlc1NlbGVjdG9yO1xyXG4gIEVMRU1FTlQuY2xvc2VzdCA9IEVMRU1FTlQuY2xvc2VzdCB8fCBmdW5jdGlvbiBjbG9zZXN0KHNlbGVjdG9yKSB7XHJcbiAgICBpZiAoIXRoaXMpIHJldHVybiBudWxsO1xyXG4gICAgaWYgKHRoaXMubWF0Y2hlcyhzZWxlY3RvcikpIHJldHVybiB0aGlzO1xyXG4gICAgaWYgKCF0aGlzLnBhcmVudEVsZW1lbnQpIHtyZXR1cm4gbnVsbH1cclxuICAgIGVsc2UgcmV0dXJuIHRoaXMucGFyZW50RWxlbWVudC5jbG9zZXN0KHNlbGVjdG9yKVxyXG4gIH07XHJcbn0oRWxlbWVudC5wcm90b3R5cGUpKTtcclxuXHJcbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBmdW5jdGlvbigpIHtcclxuICBsZXQgdGFiSGFuZGxlciA9IG5ldyBFdmVudCgndGFiSGFuZGxlcicpO1xyXG4gIGxldCBtb2RhbFN3aXBlciA9IGluaXRNb2RhbFN3aXBlcigpO1xyXG4gIGxldCBzd2lwZXJzID0gaW5pdFN3aXBlcigpO1xyXG4gIHN2ZzRldmVyeWJvZHkoKTtcclxuICBpbml0TWFpblN3aXBlcigpO1xyXG4gIGluaXRIZWFkZXJUb2dnbGVyKCk7XHJcbiAgaW5pdEFsYnVtc0NhcmRTbGlkZXIoKTtcclxuICBhY2NvcmRpb24oKTtcclxuICBpbml0QWxidW1zVHlwZVNsaWRlcigpO1xyXG4gIGluaXRTd2lwZXJTdGF0aWNrKCk7XHJcbiAgaW5pdEFsYnVtU2xpZGVyKCk7XHJcbiAgdGFiKHRhYkhhbmRsZXIpO1xyXG4gIGluaXRSYW5nZSgpO1xyXG4gIGluaXREcmFnTkRyb3AoKTtcclxuICBpbml0TW9kYWwobW9kYWxTd2lwZXIpO1xyXG4gIHZhbGlkYXRlRnJvbSgpO1xyXG4gIGNhcmRIZWFkZXJIYW5kbGUobW9kYWxTd2lwZXIsICcvYXBpL2FsYnVtL2ltYWdlc19zbGlkZXI/aWQ9Jyk7XHJcbiAgY2hvaWNlVHlwZSgpO1xyXG4gIHNldEhhbmRsZXJzUHJpY2UoKTtcclxuICBnZXRUcnVlUHJpY2VDYXJkKCk7XHJcbiAgc29ydERlc2lnbnNQYWdlKCk7XHJcblxyXG4gIGlmICggd2luZG93LmxvY2F0aW9uLmhhc2ggKSB7XHJcbiAgICBsZXQgdGFyZ2V0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgW2RhdGEtdGFyZ2V0PVwiJHt3aW5kb3cubG9jYXRpb24uaGFzaH1cIl1gKTtcclxuXHJcbiAgICBpZiAoIHRhcmdldCApIHtcclxuICAgICAgdGFyZ2V0LmNsaWNrKCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCd0YWJIYW5kbGVyJywgZnVuY3Rpb24oKSB7XHJcbiAgICBpZiAoICFzd2lwZXJzICkge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgc3dpcGVycy5mb3JFYWNoKHN3aXBlciA9PiB7XHJcbiAgICAgIHN3aXBlci51cGRhdGUoKTtcclxuICAgIH0pO1xyXG5cclxuICB9LCBmYWxzZSk7XHJcblxyXG4gIGlmICggd2luZG93LmlubmVyV2lkdGggPCA3NjggKSB7XHJcbiAgICBpbml0TWFpbkNhcmRzU2xpZGVyKCk7XHJcbiAgfVxyXG59KTtcclxuXHJcbmZ1bmN0aW9uIHNvcnREZXNpZ25zUGFnZSgpIHtcclxuICBsZXQgdGFyZ2V0cyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy1zb3J0IGlucHV0Jyk7XHJcbiAgbGV0IGFjY2VwdEJ0biA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy1zb3J0LWFjY2VwdCcpO1xyXG5cclxuICBpZiAoICF0YXJnZXRzLmxlbmd0aCApIHtcclxuICAgIHJldHVybjtcclxuICB9XHJcblxyXG4gIGxldCBhcnIgPSBbXTtcclxuICBsZXQgYWxsID0gZmFsc2U7XHJcblxyXG4gIHRhcmdldHMuZm9yRWFjaCggdGFyZ2V0ID0+IHtcclxuICAgIGxldCBpZCA9IHRhcmdldC5kYXRhc2V0LmlkO1xyXG5cclxuICAgIHRhcmdldC5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCBmdW5jdGlvbigpIHtcclxuICAgICAgaWYgKCB0YXJnZXQuY2hlY2tlZCApIHtcclxuICAgICAgICBpZCA9PT0gJ2FsbCcgPyBhbGwgPSB0cnVlIDogYXJyLnB1c2goaWQpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGlkID09PSAnYWxsJyA/IGFsbCA9IGZhbHNlIDogYXJyLmZpbmQoIChpdGVtLCBpbmRleCkgPT4gaXRlbSA9PSBpZCAmJiBhcnIuc3BsaWNlKGluZGV4LCAxKSApO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICBpZiAoIGlkICE9PSAnYWxsJyApIHtcclxuICAgICAgdGFyZ2V0LmNoZWNrZWQgJiYgYXJyLnB1c2goaWQpO1xyXG4gICAgfSBlbHNlIGlmICggaWQgPT09ICdhbGwnICYmIHRhcmdldC5jaGVja2VkICkge1xyXG4gICAgICBhbGwgPSB0cnVlO1xyXG4gICAgfVxyXG4gIH0pO1xyXG5cclxuICBhY2NlcHRCdG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbigpIHtcclxuICAgIGlmICggdGFyZ2V0cy5sZW5ndGggLSAxID09PSBhcnIubGVuZ3RoICkge1xyXG4gICAgICBhbGwgPSB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIHNldFVybChhcnIsIGFsbCk7XHJcbiAgfSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHNldFVybChhcnIsIGFsbCkge1xyXG4gIGxldCB1cmwgPSBsb2NhdGlvbi5wcm90b2NvbCArICcvLycgKyBsb2NhdGlvbi5ob3N0ICsgbG9jYXRpb24ucGF0aG5hbWU7XHJcbiAgbGV0IHBhcmFtcyA9IGFsbCA/ICcnIDogYXJyLmpvaW4oKTtcclxuXHJcbiAgcmV0dXJuIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gdXJsICsgJz9pZD0nICsgcGFyYW1zO1xyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRUcnVlUHJpY2VDYXJkKCkge1xyXG4gIGxldCB0YXJnZXRzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmpzLWNhcmQtcHJpY2Utd3JhcHBlcicpO1xyXG5cclxuICBpZiAoIHRhcmdldHMubGVuZ3RoICkge1xyXG4gICAgZm9yIChjb25zdCB0YXJnZXQgb2YgdGFyZ2V0cykge1xyXG4gICAgICBsZXQgaW5wdXQgPSB0YXJnZXQucXVlcnlTZWxlY3RvcignLmpzLWNhcmQtcHJpY2UgaW5wdXQnKTtcclxuICAgICAgbGV0IG91dHB1dCA9IHRhcmdldC5xdWVyeVNlbGVjdG9yKCcuanMtY2FyZC1wcmljZS1vdXRwdXQnKTtcclxuICAgICAgbGV0IGJhc2VQcmljZSA9ICtvdXRwdXQuZGF0YXNldC5wcmljZTtcclxuXHJcbiAgICAgIGlucHV0LmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGxldCBwZXJjYW50YWdlID0gZ2V0RGlzY291bnRQZXJjZW50KCtpbnB1dC52YWx1ZSk7XHJcbiAgICAgICAgbGV0IGRpc2NvdW50UHJpY2UgPSBnZXREaXNjb3VudFN1bW0oYmFzZVByaWNlLCBwZXJjYW50YWdlKTtcclxuXHJcbiAgICAgICAgb3V0cHV0LnRleHRDb250ZW50ID0gKGJhc2VQcmljZSAtIGRpc2NvdW50UHJpY2UpICsgJyDigr0nO1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNob2ljZVR5cGUoKSB7XHJcbiAgbGV0IHR5cGVzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmpzLWNob2ljZS10eXBlJyk7XHJcbiAgbGV0IGNvbnRhaW5lciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy1jaG9pY2UtdHlwZS1hZGRpbmdzJyk7XHJcbiAgbGV0IG91dHB1dENvbnRhaW5lciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy1jaG9pY2UtdHlwZS1vdXRwdXQnKTtcclxuICBsZXQgcmFuZ2VzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmpzLXJhbmdlJyk7XHJcblxyXG4gIGlmICggIXR5cGVzLmxlbmd0aCB8fCAhY29udGFpbmVyICkge1xyXG4gICAgcmV0dXJuXHJcbiAgfVxyXG5cclxuICBmb3IgKGNvbnN0IHR5cGUgb2YgdHlwZXMpIHtcclxuICAgIGxldCBsaXN0ID0gdHlwZS5xdWVyeVNlbGVjdG9yQWxsKCcuanMtY2hvaWNlLXR5cGUtbGlzdCBsaScpO1xyXG4gICAgbGV0IGFyckxpc3QgPSBbXTtcclxuXHJcbiAgICBmb3IgKGNvbnN0IGl0ZW0gb2YgbGlzdCkge1xyXG4gICAgICBhcnJMaXN0LnB1c2goaXRlbS50ZXh0Q29udGVudCk7XHJcbiAgICB9XHJcblxyXG4gICAgdHlwZS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKCkge1xyXG4gICAgICBpZiAoIHR5cGUuY2xhc3NMaXN0LmNvbnRhaW5zKCdpcy1hY3RpdmUnKSApIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuICAgICAgaWYgKCByYW5nZXMubGVuZ3RoICkge1xyXG4gICAgICAgIHJhbmdlcy5mb3JFYWNoKChyYW5nZSkgPT4ge1xyXG4gICAgICAgICAgbGV0IHByZXNldCA9IHJhbmdlLmRhdGFzZXQucHJlc2V0O1xyXG4gICAgICAgICAgbGV0IHJhbmdlTWluID0gcmFuZ2UuZGF0YXNldC5taW47XHJcbiAgICAgICAgICBsZXQgc2V0TWluID0gcmFuZ2VNaW4gPyByYW5nZU1pbiA6IDA7XHJcblxyXG4gICAgICAgICAgcmFuZ2Uubm9VaVNsaWRlci5zZXQocHJlc2V0ID8gcHJlc2V0IDogc2V0TWluKTtcclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG5cclxuICAgICAgZm9yIChjb25zdCB0eXBlSW4gb2YgdHlwZXMpIHtcclxuICAgICAgICB0eXBlSW4uY2xhc3NMaXN0LnJlbW92ZSgnaXMtYWN0aXZlJyk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGNvbnRhaW5lci5jbGFzc0xpc3QuYWRkKCdpcy1hY3RpdmUnKTtcclxuXHJcbiAgICAgIGlmICggIWxpc3QubGVuZ3RoIHx8IGxpc3QubGVuZ3RoIDwgMiApIHtcclxuICAgICAgICBjb250YWluZXIuY2xhc3NMaXN0LnJlbW92ZSgnaXMtYWN0aXZlJyk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHR5cGUuY2xhc3NMaXN0LmFkZCgnaXMtYWN0aXZlJyk7XHJcbiAgICAgIG91dHB1dENvbnRhaW5lci5pbm5lckhUTUwgPSAnJztcclxuXHJcbiAgICAgIGxpc3QuZm9yRWFjaCgoaXRlbSwgaWR4KSA9PiB7XHJcbiAgICAgICAgaWYgKCBpZHggPT09IDAgKSB7XHJcbiAgICAgICAgICBvdXRwdXRDb250YWluZXIuYXBwZW5kQ2hpbGQoY3JlYXRlQ2hlY2ttYXJrKGl0ZW0udGV4dENvbnRlbnQsIHRydWUsIGl0ZW0uZGF0YXNldC5iYXNlUHJpY2UpKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgb3V0cHV0Q29udGFpbmVyLmFwcGVuZENoaWxkKGNyZWF0ZUNoZWNrbWFyayhpdGVtLnRleHRDb250ZW50LCBmYWxzZSwgaXRlbS5kYXRhc2V0LmJhc2VQcmljZSkpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcblxyXG4gICAgICBsZXQgY2hlY2ttYXJrcyA9IG91dHB1dENvbnRhaW5lci5xdWVyeVNlbGVjdG9yQWxsKCcuY2hlY2ttYXJrIGlucHV0Jyk7XHJcblxyXG4gICAgICBpZiAoIGNoZWNrbWFya3MubGVuZ3RoICkge1xyXG4gICAgICAgIGNoZWNrbWFya3NbMF0uY2xpY2soKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBzZXRIYW5kbGVyc1ByaWNlKCkge1xyXG4gIGxldCB0YXJnZXRzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmpzLWNhbGMtY2hhbmdlJyk7XHJcblxyXG4gIGZvciAoY29uc3QgdGFyZ2V0IG9mIHRhcmdldHMpIHtcclxuICAgIGlmICggdGFyZ2V0Lm5vVWlTbGlkZXIgKSB7XHJcbiAgICAgIHRhcmdldC5ub1VpU2xpZGVyLm9uKCdjaGFuZ2UnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICBjaGFuZ2VQcmljZUhhbmRsZSgpO1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICB0YXJnZXQuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgIGNoYW5nZVByaWNlSGFuZGxlKCk7XHJcbiAgICB9KTtcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNoYW5nZVByaWNlSGFuZGxlKCkge1xyXG4gIGxldCBiYXNlUHJpY2VzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmpzLWNob2ljZS10eXBlLW91dHB1dCBpbnB1dCcpO1xyXG4gIGxldCBiYXNlUHJpY2VJdGVtID0gZ2V0QmFzZVByaWNlKGJhc2VQcmljZXMpO1xyXG4gIGxldCBvdXRwdXRQcmljZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy1jYWxjLXByaWNlJyk7XHJcbiAgbGV0IG91dHB1dERpc2NvdW50UHJpY2UgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtY2FsYy1kaXNjb3VudC1wcmljZScpO1xyXG4gIGxldCB0eXBlT3V0cHV0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLWNhbGMtdHlwZS1vdXRwdXQnKTtcclxuICBsZXQgbGlzdHNPdXRwdXQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtY2FsYy1saXN0cy1vdXRwdXQnKTtcclxuICBsZXQgYWxidW1zT3V0cHV0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLWNhbGMtYWxidW1zLW91dHB1dCcpO1xyXG4gIGxldCBwZXJzYW50YWdlT3V0cHV0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLWNhbGMtZGlzY291bnQtcGVyc2FudGFnZS1vdXRwdXQnKTtcclxuICBsZXQgZGlzY291bnRTdW1tT3V0cHV0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLWNhbGMtZGlzY291bnQtc3VtbS1vdXRwdXQnKTtcclxuICBsZXQgYWxidW1zID0gK2RvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy1jYWxjLWFsYnVtcy1sZW5ndGggaW5wdXQnKS52YWx1ZTtcclxuICBsZXQgcGVvcGxlcyA9ICtkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtY2FsYy1wZW9wbGVzJykubm9VaVNsaWRlci5nZXQoKTtcclxuICBsZXQgcGVvcGxlc09uVHVybiA9ICtkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtY2FsYy1wZW9wbGVzLW9uLXR1cm4nKS5ub1VpU2xpZGVyLmdldCgpO1xyXG4gIGxldCBoaXN0b3J5VHVybnMgPSArZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLWNhbGMtaGlzdG9yeS10dXJucycpLm5vVWlTbGlkZXIuZ2V0KCk7XHJcbiAgbGV0IGFjdGl2ZUNob2ljZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy1jaG9pY2UtdHlwZS5pcy1hY3RpdmUnKTtcclxuICBsZXQgcmFuZ2VzQ2FuQmVEaXNhYmxlZCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy1yYW5nZS1jYW4tYmUtZGlzYWJsZWQnKTtcclxuXHJcbiAgaWYgKCAhYWN0aXZlQ2hvaWNlICkge1xyXG4gICAgcmV0dXJuXHJcbiAgfVxyXG5cclxuICBsZXQgYmFzZUxpc3RzID0gK2FjdGl2ZUNob2ljZS5kYXRhc2V0LmJhc2VMaXN0cztcclxuICBsZXQgYmFzZVR1cm4gPSArYWN0aXZlQ2hvaWNlLmRhdGFzZXQuYmFzZVR1cm47XHJcbiAgbGV0IGJhc2VUdXJuUHJpY2UgPSArYWN0aXZlQ2hvaWNlLmRhdGFzZXQudHVyblByaWNlO1xyXG4gIGxldCBiYXNlUHJpY2UgPSArYmFzZVByaWNlSXRlbS5kYXRhc2V0LmJhc2VQcmljZTtcclxuICBsZXQgYWxidW1MaXN0cyA9IGdldExpc3RJbkFsYnVtKHBlb3BsZXMsIHBlb3BsZXNPblR1cm4sIGhpc3RvcnlUdXJucywgYmFzZVR1cm4pO1xyXG4gIGxldCBhbGJ1bVByaWNlID0gZ2V0UHJpY2VGb3JBbGJ1bShiYXNlUHJpY2UsIGFsYnVtTGlzdHMsIGJhc2VMaXN0cywgYmFzZVR1cm5QcmljZSk7XHJcbiAgbGV0IHBlcmNlbnRhZ2UgPSBnZXREaXNjb3VudFBlcmNlbnQoYWxidW1zKTtcclxuICBsZXQgZGlzY291bnRTdW1tID0gZ2V0RGlzY291bnRTdW1tKGFsYnVtUHJpY2UsIHBlcmNlbnRhZ2UpO1xyXG4gIGxldCBhbGJ1bVByaWNlV2l0aERpc2NvdW50ID0gZ2V0UHJpY2VGb3JBbGJ1bURpc2NvdW50KGFsYnVtUHJpY2UsIGRpc2NvdW50U3VtbSk7XHJcblxyXG4gIGlmICggYmFzZUxpc3RzID09PSAwICYmIHJhbmdlc0NhbkJlRGlzYWJsZWQubGVuZ3RoICkge1xyXG4gICAgcmFuZ2VzQ2FuQmVEaXNhYmxlZC5mb3JFYWNoKGl0ZW0gPT4ge1xyXG4gICAgICBsZXQgcmFuZ2UgPSBpdGVtLnF1ZXJ5U2VsZWN0b3IoJy5qcy1yYW5nZScpO1xyXG4gICAgICBpdGVtLmNsYXNzTGlzdC5hZGQoJ2Rpc2FibGVkJyk7XHJcbiAgICAgIHJhbmdlLm5vVWlTbGlkZXIuc2V0KDApO1xyXG4gICAgfSk7XHJcbiAgfSBlbHNlIHtcclxuICAgIHJhbmdlc0NhbkJlRGlzYWJsZWQuZm9yRWFjaChpdGVtID0+IHtcclxuICAgICAgaXRlbS5jbGFzc0xpc3QucmVtb3ZlKCdkaXNhYmxlZCcpO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBvdXRwdXRQcmljZS50ZXh0Q29udGVudCA9IGFsYnVtUHJpY2U7XHJcbiAgb3V0cHV0RGlzY291bnRQcmljZS50ZXh0Q29udGVudCA9IGFsYnVtUHJpY2VXaXRoRGlzY291bnQ7XHJcbiAgdHlwZU91dHB1dC50ZXh0Q29udGVudCA9IGFjdGl2ZUNob2ljZS5xdWVyeVNlbGVjdG9yKCcuY2FsY3VsYXRlLXR5cGVzX190aXRsZScpLnRleHRDb250ZW50O1xyXG4gIGxpc3RzT3V0cHV0LnRleHRDb250ZW50ID0gYWxidW1MaXN0cyArIGJhc2VMaXN0cztcclxuICBhbGJ1bXNPdXRwdXQudGV4dENvbnRlbnQgPSBhbGJ1bXM7XHJcbiAgcGVyc2FudGFnZU91dHB1dC50ZXh0Q29udGVudCA9IHBlcmNlbnRhZ2UgKyAnJSc7XHJcbiAgZGlzY291bnRTdW1tT3V0cHV0LnRleHRDb250ZW50ID0gKGFsYnVtcyAqIGFsYnVtUHJpY2VXaXRoRGlzY291bnQpICsgJyDigr0nO1xyXG5cclxuICB3aW5kb3cuY2FsY0RhdGEgPSBg0JLQuNC0INCw0LvRjNCx0L7QvNCwOiAke3R5cGVPdXRwdXQudGV4dENvbnRlbnR9LFxcbiDQmtC+0LvQuNGH0LXRgdGC0LLQviDRgdGC0YDQsNC90LjRhjogJHthbGJ1bUxpc3RzfSxcXG4g0JrQvtC70LjRh9C10YHRgtCy0L4g0LDQu9GM0LHQvtC80L7QsjogJHthbGJ1bXN9LFxcbiDQmtC+0LvQuNGH0LXRgdGC0LLQviDQstGL0L/Rg9GB0LrQvdC40LrQvtCyINCyINCw0LvRjNCx0L7QvNC1OiAke3Blb3BsZXN9LFxcbiDQmtC+0LvQuNGH0LXRgdGC0LLQviDRh9C10LvQvtCy0LXQuiDQvdCwINC+0LTQvdC+0Lwg0YDQsNC30LLQvtGA0L7RgtC1OiAke3Blb3BsZXNPblR1cm59LFxcbiDQmtC+0LvQuNGH0LXRgdGC0LLQvtCy0L4g0YDQsNC30LLQvtGA0L7RgtC+0LIg0YEg0YTQvtGC0L7QuNGB0YLQvtGA0LjQtdC5OiAke2hpc3RvcnlUdXJuc30sXFxuINCm0LXQvdCwINC30LAg0LDQu9GM0LHQvtC8OiAke2FsYnVtUHJpY2V9LFxcbiDQodC60LjQtNC60LA6ICR7cGVyY2VudGFnZSArICclJ30sXFxuINCY0YLQvtCz0L7QstCw0Y8g0YHRgtC+0LjQvNC+0YHRgtGMINCw0LvRjNCx0L7QvNC+0LI6ICR7KGFsYnVtcyAqIGFsYnVtUHJpY2VXaXRoRGlzY291bnQpICsgJyDigr0nfTtgXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldEJhc2VQcmljZShhcnIpIHtcclxuICBpZiAoIGFyci5sZW5ndGggKSB7XHJcbiAgICBmb3IgKGNvbnN0IGl0ZW0gb2YgYXJyKSB7XHJcbiAgICAgIGlmICggaXRlbS5jaGVja2VkICkge1xyXG4gICAgICAgIHJldHVybiBpdGVtO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRQcmljZUZvckFsYnVtKGJhc2VQcmljZSwgYWxidW1MaXN0cywgYmFzZUxpc3RzLCBiYXNlVHVyblByaWNlKSB7XHJcbiAgbGV0IHNvbWUgPSAwO1xyXG5cclxuICBpZiAoIGFsYnVtTGlzdHMgLSBiYXNlTGlzdHMgPiAwICkge1xyXG4gICAgc29tZSA9IGFsYnVtTGlzdHMgLSBiYXNlTGlzdHM7XHJcbiAgfVxyXG5cclxuICByZXR1cm4gYmFzZVByaWNlICsgc29tZSAqIGJhc2VUdXJuUHJpY2U7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldERpc2NvdW50UGVyY2VudChhbGJ1bXMpIHtcclxuICBpZiAoIGFsYnVtcyA8IDUgKSB7XHJcbiAgICByZXR1cm4gMDtcclxuICB9XHJcblxyXG4gIGlmICggYWxidW1zID4gMjAgKSB7XHJcbiAgICByZXR1cm4gMjA7XHJcbiAgfVxyXG5cclxuICByZXR1cm4gYWxidW1zO1xyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRQcmljZUZvckFsYnVtRGlzY291bnQoYWxidW1QcmljZSwgZGlzY291bnRTdW1tKSB7XHJcbiAgcmV0dXJuIGFsYnVtUHJpY2UgLSBkaXNjb3VudFN1bW07XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldERpc2NvdW50U3VtbShhbGJ1bVByaWNlLCBwZXJjZW50YWdlKSB7XHJcbiAgcmV0dXJuIE1hdGguY2VpbChhbGJ1bVByaWNlICogcGVyY2VudGFnZSAvIDEwMCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldExpc3RJbkFsYnVtKHBlb3BsZXMsIHBlb3BsZXNPblR1cm4sIGhpc3RvcnlUdXJucywgYmFzZVR1cm4pIHtcclxuICByZXR1cm4gTWF0aC5jZWlsKHBlb3BsZXMgLyBwZW9wbGVzT25UdXJuKSArIGhpc3RvcnlUdXJucyArIGJhc2VUdXJuO1xyXG59XHJcblxyXG5mdW5jdGlvbiBjcmVhdGVDaGVja21hcmsodGV4dCwgZmlyc3QsIGJhc2VQcmljZSkge1xyXG4gIGxldCBjaGVja21hcmtXcmFwcGVyO1xyXG4gIGxldCBjaGVja21hcmsgPSBjcmVhdGVFbGVtZW50KCdsYWJlbCcsICdjaGVja21hcmsnKTtcclxuICBsZXQgaW5wdXQgPSBjcmVhdGVFbGVtZW50KCdpbnB1dCcsICcnKTtcclxuICBzZXRBdHRyaWJ1dGVzKGlucHV0LCB7XHJcbiAgICAndHlwZSc6ICdyYWRpbycsXHJcbiAgICAnbmFtZSc6ICd0eXBlcydcclxuICB9KTtcclxuICBsZXQgbWFyayA9IGNyZWF0ZUVsZW1lbnQoJ3NwYW4nLCAnY2hlY2ttYXJrX19tYXJrJyk7XHJcbiAgbGV0IHZhclRleHQgPSBjcmVhdGVFbGVtZW50KCdwJywgJycpO1xyXG5cclxuICBpbnB1dC5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCBmdW5jdGlvbigpIHtcclxuICAgIGNoYW5nZVByaWNlSGFuZGxlKCk7XHJcbiAgfSk7XHJcblxyXG4gIGlmICggZmlyc3QgKSB7XHJcbiAgICBjaGVja21hcmtXcmFwcGVyID0gY3JlYXRlRWxlbWVudCgnZGl2JywgJ2NvbC0xMicpO1xyXG4gIH0gZWxzZSB7XHJcbiAgICBjaGVja21hcmtXcmFwcGVyID0gY3JlYXRlRWxlbWVudCgnZGl2JywgJ2NvbC0xMiBtdC0zJyk7XHJcbiAgfVxyXG5cclxuICBpbnB1dC5kYXRhc2V0LmJhc2VQcmljZSA9IGJhc2VQcmljZSA/IGJhc2VQcmljZSA6IDA7XHJcbiAgdmFyVGV4dC50ZXh0Q29udGVudCA9IHRleHQ7XHJcbiAgY2hlY2ttYXJrLmFwcGVuZENoaWxkKGlucHV0KTtcclxuICBjaGVja21hcmsuYXBwZW5kQ2hpbGQobWFyayk7XHJcbiAgY2hlY2ttYXJrLmFwcGVuZENoaWxkKHZhclRleHQpO1xyXG4gIGNoZWNrbWFya1dyYXBwZXIuYXBwZW5kQ2hpbGQoY2hlY2ttYXJrKTtcclxuXHJcbiAgcmV0dXJuIGNoZWNrbWFya1dyYXBwZXI7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZUVsZW1lbnQodGFnLCBjbGFzc05hbWUpIHtcclxuICBsZXQgZWxlbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQodGFnKTtcclxuICBlbGVtLmNsYXNzTGlzdCA9IGNsYXNzTmFtZTtcclxuXHJcbiAgcmV0dXJuIGVsZW07XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHNldEF0dHJpYnV0ZXMoZWwsIGF0dHJzKSB7XHJcbiAgZm9yKHZhciBrZXkgaW4gYXR0cnMpIHtcclxuICAgIGVsLnNldEF0dHJpYnV0ZShrZXksIGF0dHJzW2tleV0pO1xyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gY2FyZEhlYWRlckhhbmRsZShtb2RhbFN3aXBlciwgdXJsKSB7XHJcbiAgbGV0IHRhcmdldHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuanMtbW9kYWwtaW5pdC5qcy1tb2RhbC1zbGlkZXInKTtcclxuXHJcbiAgaWYgKCB0YXJnZXRzLmxlbmd0aCApIHtcclxuICAgIHRhcmdldHMuZm9yRWFjaCh0YXJnZXQgPT4ge1xyXG4gICAgICBsZXQgdGFyZ2V0SWQgPSB0YXJnZXQuZGF0YXNldC5pZDtcclxuICAgICAgdGFyZ2V0LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgZ2V0U2xpZGVyc0RhdGEobW9kYWxTd2lwZXIsIGAke3VybCArIHRhcmdldElkfWApO1xyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0U2xpZGVyc0RhdGEobW9kYWxTd2lwZXIsIHVybCkge1xyXG4gIGxldCB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcclxuICB4aHIub3BlbignR0VUJywgdXJsKTtcclxuICB4aHIuc2VuZCgpO1xyXG5cclxuICBpZiAoICFtb2RhbFN3aXBlciApIHtcclxuICAgIHJldHVybjtcclxuICB9XHJcblxyXG4gIHhoci5vbmxvYWQgPSBmdW5jdGlvbigpIHtcclxuICAgIGlmICh4aHIuc3RhdHVzICE9IDIwMCkge1xyXG4gICAgICBjb25zb2xlLmxvZyhg0J7RiNC40LHQutCwICR7eGhyLnN0YXR1c306ICR7eGhyLnN0YXR1c1RleHR9YCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBsZXQgZGF0YSA9IEpTT04ucGFyc2UoeGhyLnJlc3BvbnNlKTtcclxuICAgICAgbW9kYWxTd2lwZXIucmVtb3ZlQWxsU2xpZGVzKCk7XHJcblxyXG4gICAgICBkYXRhLmZvckVhY2goaXRlbSA9PiB7XHJcbiAgICAgICAgbGV0IHNsaWRlQ29udGVudCA9IGNyZWF0ZVNsaWRlKGl0ZW0pO1xyXG4gICAgICAgIG1vZGFsU3dpcGVyLmFwcGVuZFNsaWRlKHNsaWRlQ29udGVudCk7XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgbW9kYWxTd2lwZXIudXBkYXRlKCk7XHJcbiAgICAgIH0sIDEwMCk7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgeGhyLm9uZXJyb3IgPSBmdW5jdGlvbigpIHtcclxuICAgIGNvbnNvbGUubG9nKFwi0JfQsNC/0YDQvtGBINC90LUg0YPQtNCw0LvRgdGPXCIpO1xyXG4gIH07XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZVNsaWRlKHN0cikge1xyXG4gIGxldCBpbWcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbWcnKTtcclxuICBsZXQgc2xpZGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICBzbGlkZS5jbGFzc0xpc3QuYWRkKCdzd2lwZXItc2xpZGUnLCAnbWFpbi1zbGlkZXJfX3NsaWRlJyk7XHJcbiAgaW1nLnNyYyA9IHN0cjtcclxuICBzbGlkZS5hcHBlbmRDaGlsZChpbWcpO1xyXG5cclxuICByZXR1cm4gc2xpZGU7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHZhbGlkYXRlRnJvbSgpIHtcclxuICBsZXQgZm9ybXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuanMtZm9ybS12YWxpZGF0ZScpO1xyXG5cclxuICBpZiAoIGZvcm1zLmxlbmd0aCApIHtcclxuICAgIGZvciAoY29uc3QgZm9ybSBvZiBmb3Jtcykge1xyXG4gICAgICBsZXQgZmllbGRzID0gZm9ybS5xdWVyeVNlbGVjdG9yQWxsKCcuanMtZm9ybS12YWxpZGF0ZS1pbnB1dCBpbnB1dCcpO1xyXG4gICAgICBsZXQgZmlsZSA9IGZvcm0ucXVlcnlTZWxlY3RvcignLmpzLWNhbGN1bGF0ZS1maWxlLWlucHV0Jyk7XHJcbiAgICAgIGxldCB2YWxpZEZvcm0gPSBmYWxzZTtcclxuXHJcbiAgICAgIGZvciAoY29uc3QgZmllbGQgb2YgZmllbGRzKSB7XHJcbiAgICAgICAgZmllbGQuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICBpZiAoICF2YWxpZGF0ZUZpZWxkKGZpZWxkKSApIHtcclxuICAgICAgICAgICAgZmllbGQuY2xhc3NMaXN0LmFkZCgnaGFzLWVycm9yJyk7XHJcbiAgICAgICAgICAgIHZhbGlkRm9ybSA9IGZhbHNlO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgZmllbGQuY2xhc3NMaXN0LnJlbW92ZSgnaGFzLWVycm9yJyk7XHJcbiAgICAgICAgICAgIHZhbGlkRm9ybSA9IHRydWU7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGZvcm0uYWRkRXZlbnRMaXN0ZW5lcignc3VibWl0JywgZnVuY3Rpb24oZSkge1xyXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuXHJcbiAgICAgICAgZm9yIChjb25zdCBmaWVsZCBvZiBmaWVsZHMpIHtcclxuICAgICAgICAgIGlmICggIXZhbGlkYXRlRmllbGQoZmllbGQpICkge1xyXG4gICAgICAgICAgICBmaWVsZC5jbGFzc0xpc3QuYWRkKCdoYXMtZXJyb3InKTtcclxuICAgICAgICAgICAgdmFsaWRGb3JtID0gZmFsc2U7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBmaWVsZC5jbGFzc0xpc3QucmVtb3ZlKCdoYXMtZXJyb3InKTtcclxuICAgICAgICAgICAgdmFsaWRGb3JtID0gdHJ1ZTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICggdmFsaWRGb3JtICkge1xyXG4gICAgICAgICAgbGV0IGZvcm1EYXRhID0gbmV3IEZvcm1EYXRhKGZvcm0pO1xyXG5cclxuICAgICAgICAgIGlmICggZmlsZSApIHtcclxuICAgICAgICAgICAgZm9ybURhdGEuYXBwZW5kKCdmaWxlJywgZmlsZS5maWxlc1swXSk7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgaWYgKCBmb3JtLmNsYXNzTGlzdC5jb250YWlucygnanMtZm9ybS1jYWxjJykgKSB7XHJcbiAgICAgICAgICAgIGZvcm1EYXRhLmFwcGVuZCgnZGF0YScsIHdpbmRvdy5jYWxjRGF0YSk7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgbGV0IHN1Y2Nlc3MgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgZm9ybS5jbGFzc0xpc3QuYWRkKCdzdWNjZXNzJyk7XHJcbiAgICAgICAgICAgIHJlc2V0Rm9ybShmb3JtLCBmb3JtRGF0YSk7XHJcbiAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgIHNlbmREYXRhKGZvcm1EYXRhLCAnL3NlbmRfbWVzc2FnZScsIHN1Y2Nlc3MpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBjb25zb2xlLmxvZygndW52YWxpZCBmb3JtJyk7XHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICB9KVxyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gcmVzZXRGb3JtKGZvcm0sIGZvcm1kYXRhKSB7XHJcbiAgbGV0IGJ0bnMgPSBmb3JtLnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy1mb3JtLWNhbGMtcmVzZXQnKTtcclxuICBsZXQgZmlsZVJlbW92ZXIgPSBmb3JtLnF1ZXJ5U2VsZWN0b3IoJy5qcy1jYWxjdWxhdGUtZmlsZS1yZW1vdmVyJyk7XHJcblxyXG4gIGlmICggYnRucy5sZW5ndGggKSB7XHJcbiAgICBmb3IgKGNvbnN0IGJ0biBvZiBidG5zKSB7XHJcbiAgICAgIGJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGZvciAodmFyIHBhaXIgb2YgZm9ybWRhdGEuZW50cmllcygpKSB7XHJcbiAgICAgICAgICBmb3JtZGF0YS5kZWxldGUocGFpclswXSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmb3JtLnJlc2V0KCk7XHJcbiAgICAgICAgZm9ybS5jbGFzc0xpc3QucmVtb3ZlKCdzdWNjZXNzJyk7XHJcblxyXG4gICAgICAgIGlmICggZmlsZVJlbW92ZXIgKSB7XHJcbiAgICAgICAgICBmaWxlUmVtb3Zlci5jbGljaygpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiB2YWxpZGF0ZUZpZWxkKGlucHV0KSB7XHJcbiAgbGV0IHZhbHVlID0gaW5wdXQudmFsdWU7XHJcbiAgbGV0IHR5cGUgPSBpbnB1dC50eXBlO1xyXG4gIGxldCByZXN1bHQgPSBmYWxzZTtcclxuXHJcbiAgaWYgKCB0eXBlID09ICd0ZWwnICkge1xyXG4gICAgcmVzdWx0ID0gdmFsaWRhdGVQaG9uZSh2YWx1ZSk7XHJcbiAgfSBlbHNlIGlmICggdHlwZSA9PSAnZW1haWwnICkge1xyXG4gICAgcmVzdWx0ID0gdmFsaWRhdGVNYWlsKHZhbHVlKTtcclxuICB9IGVsc2Uge1xyXG4gICAgcmVzdWx0ID0gIWlzRW1wdHkodmFsdWUpO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHJlc3VsdDtcclxufVxyXG5cclxuZnVuY3Rpb24gaXNFbXB0eShzdHIpIHtcclxuICByZXR1cm4gc3RyID09ICcnICYmIHRydWU7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHZhbGlkYXRlUGhvbmUoc3RyKSB7XHJcbiAgbGV0IHJlZyA9IC9eW1xcK10/WyhdP1swLTldezN9WyldP1stXFxzXFwuXT9bMC05XXszfVstXFxzXFwuXT9bMC05XXs0LDZ9JC9pbTtcclxuICByZXR1cm4gdGVzdFJlZyhyZWcsIHJlbW92ZVNwYWNlcyhzdHIpKTtcclxufVxyXG5cclxuZnVuY3Rpb24gdmFsaWRhdGVNYWlsKHN0cikge1xyXG4gIGxldCByZXN1bHQgPSBmYWxzZTtcclxuICBjb25zdCByZWcgPSAvXigoW148PigpW1xcXVxcXFwuLDs6XFxzQFxcXCJdKyhcXC5bXjw+KClbXFxdXFxcXC4sOzpcXHNAXFxcIl0rKSopfChcXFwiLitcXFwiKSlAKChcXFtbMC05XXsxLDN9XFwuWzAtOV17MSwzfVxcLlswLTldezEsM31cXC5bMC05XXsxLDN9XFxdKXwoKFthLXpBLVpcXC0wLTldK1xcLikrW2EtekEtWl17Mix9KSkkLztcclxuICByZXN1bHQgPSB0ZXN0UmVnKHJlZywgc3RyKVxyXG4gIHJldHVybiByZXN1bHQ7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHJlbW92ZVNwYWNlcyhzdHIpIHtcclxuICByZXR1cm4gc3RyLnJlcGxhY2UoL1xccy9nLCAnJyk7O1xyXG59XHJcblxyXG5mdW5jdGlvbiB0ZXN0UmVnKHJlLCBzdHIpe1xyXG4gIGlmIChyZS50ZXN0KHN0cikpIHtcclxuICAgIHJldHVybiB0cnVlO1xyXG4gIH0gZWxzZSB7XHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBzZW5kRGF0YShkYXRhLCB1cmwsIHN1Y2Nlc3MpIHtcclxuICBpZiAoICFkYXRhIHx8ICF1cmwgKSB7XHJcbiAgICByZXR1cm4gY29uc29sZS5sb2coJ2Vycm9yLCBoYXZlIG5vIGRhdGEgb3IgdXJsJyk7XHJcbiAgfVxyXG5cclxuICBsZXQgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XHJcblxyXG4gIHhoci5vbmxvYWRlbmQgPSBmdW5jdGlvbigpIHtcclxuICAgIGlmICh4aHIuc3RhdHVzID09IDIwMCkge1xyXG4gICAgICBsZXQgc3VjY2Vzc0Z1ID0gc3VjY2VzcztcclxuXHJcbiAgICAgIHN1Y2Nlc3NGdSgpO1xyXG4gICAgICBjb25zb2xlLmxvZyhcItCj0YHQv9C10YVcIik7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBjb25zb2xlLmxvZyhcItCe0YjQuNCx0LrQsCBcIiArIHRoaXMuc3RhdHVzKTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICB4aHIub3BlbihcIlBPU1RcIiwgdXJsKTtcclxuICB4aHIuc2VuZChkYXRhKTtcclxufVxyXG5cclxuZnVuY3Rpb24gaW5pdE1vZGFsKG1vZGFsU3dpcGVyKSB7XHJcbiAgbGV0IGluaXRzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmpzLW1vZGFsLWluaXQnKTtcclxuICBsZXQgYm9keSA9IGRvY3VtZW50LmJvZHk7XHJcblxyXG4gIGlmICggaW5pdHMubGVuZ3RoICkge1xyXG4gICAgZm9yIChjb25zdCBpbml0IG9mIGluaXRzKSB7XHJcbiAgICAgIGxldCB0YXJnZXQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGluaXQuZGF0YXNldC50YXJnZXQpO1xyXG4gICAgICBsZXQgY2xvc2VzID0gdGFyZ2V0LnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy1tb2RhbC1jbG9zZScpO1xyXG5cclxuICAgICAgaWYgKCB0YXJnZXQgKSB7XHJcbiAgICAgICAgaWYgKCBjbG9zZXMubGVuZ3RoICkge1xyXG4gICAgICAgICAgZm9yIChjb25zdCBjbG9zZSBvZiBjbG9zZXMpIHtcclxuICAgICAgICAgICAgY2xvc2UuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICB0YXJnZXQuY2xhc3NMaXN0LnJlbW92ZSgnaXMtYWN0aXZlJyk7XHJcbiAgICAgICAgICAgICAgYm9keS5jbGFzc0xpc3QucmVtb3ZlKCdtb2RhbC1pcy1hY3RpdmUnKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpbml0LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICB0YXJnZXQuY2xhc3NMaXN0LmFkZCgnaXMtYWN0aXZlJyk7XHJcbiAgICAgICAgICBib2R5LmNsYXNzTGlzdC5hZGQoJ21vZGFsLWlzLWFjdGl2ZScpO1xyXG5cclxuICAgICAgICAgIGlmICggdGFyZ2V0LmRhdGFzZXQuc2xpZGVyID09ICd0cnVlJyApIHtcclxuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgbW9kYWxTd2lwZXIudXBkYXRlKCk7XHJcbiAgICAgICAgICAgIH0sIDEwMCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGluaXREcmFnTkRyb3AoKSB7XHJcbiAgbGV0IGNvbnRhaW5lciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy1jYWxjdWxhdGUtZmlsZScpO1xyXG4gIGxldCBkcm9wQXJlYSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy1jYWxjdWxhdGUtZmlsZS1kcm9wYXJlYScpO1xyXG4gIGxldCBmaWxlRWxlbSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy1jYWxjdWxhdGUtZmlsZS1pbnB1dCcpO1xyXG4gIGxldCBhZGRpbmdzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLWNhbGN1bGF0ZS1maWxlLWFkZGluZ3MnKTtcclxuICBsZXQgZmlsZU5hbWUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtY2FsY3VsYXRlLWZpbGUtbmFtZScpO1xyXG4gIGxldCByZW1vdmVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLWNhbGN1bGF0ZS1maWxlLXJlbW92ZXInKTtcclxuXHJcbiAgaWYgKCAhY29udGFpbmVyICYmICFkcm9wQXJlYSAmJiAhZmlsZUVsZW0gJiYgIWFkZGluZ3MgJiYgIWZpbGVOYW1lICYmICFyZW1vdmVyICkge1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gcHJldmVudERlZmF1bHRzIChlKSB7XHJcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gIH07XHJcblxyXG4gIGZ1bmN0aW9uIGhpZ2hsaWdodCgpIHtcclxuICAgIGNvbnRhaW5lci5jbGFzc0xpc3QuYWRkKCdoaWdobGlnaHQnKTtcclxuICB9O1xyXG5cclxuICBmdW5jdGlvbiB1bmhpZ2hsaWdodCgpIHtcclxuICAgIGNvbnRhaW5lci5jbGFzc0xpc3QucmVtb3ZlKCdoaWdobGlnaHQnKTtcclxuICB9O1xyXG5cclxuICBmdW5jdGlvbiBoYW5kbGVGaWxlcyhmaWxlcykge1xyXG4gICAgYWRkaW5ncy5jbGFzc0xpc3QuYWRkKCdpcy1zaG93Jyk7XHJcbiAgICBjb250YWluZXIuY2xhc3NMaXN0LmFkZCgnaGFzLXJlc3VsdCcpO1xyXG4gICAgZmlsZU5hbWUudGV4dENvbnRlbnQgPSBmaWxlc1swXS5uYW1lO1xyXG4gIH07XHJcblxyXG4gIGZ1bmN0aW9uIGhhbmRsZVJlbW92ZUZpbGVzKCkge1xyXG4gICAgYWRkaW5ncy5jbGFzc0xpc3QucmVtb3ZlKCdpcy1zaG93Jyk7XHJcbiAgICBjb250YWluZXIuY2xhc3NMaXN0LnJlbW92ZSgnaGFzLXJlc3VsdCcpO1xyXG4gICAgZmlsZU5hbWUudGV4dENvbnRlbnQgPSAnJztcclxuICAgIGZpbGVFbGVtLnZhbHVlID0gJyc7XHJcbiAgfTtcclxuXHJcbiAgZnVuY3Rpb24gaGFuZGxlRHJvcChlKSB7XHJcbiAgICBsZXQgZHQgPSBlLmRhdGFUcmFuc2ZlcjtcclxuICAgIGxldCBmaWxlcyA9IGR0LmZpbGVzO1xyXG5cclxuICAgIGlmICggVmFsaWRhdGUodGhpcykgKSB7XHJcbiAgICAgIGhhbmRsZUZpbGVzKGZpbGVzKTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICBmaWxlRWxlbS5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCBmdW5jdGlvbigpIHtcclxuICAgIGlmICggVmFsaWRhdGUodGhpcykgKSB7XHJcbiAgICAgIGhhbmRsZUZpbGVzKHRoaXMuZmlsZXMpO1xyXG4gICAgfVxyXG4gIH0pO1xyXG5cclxuICByZW1vdmVyLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oKSB7XHJcbiAgICBoYW5kbGVSZW1vdmVGaWxlcygpO1xyXG4gIH0pO1xyXG5cclxuICBbJ2RyYWdlbnRlcicsICdkcmFnb3ZlcicsICdkcmFnbGVhdmUnLCAnZHJvcCddLmZvckVhY2goZXZlbnROYW1lID0+IHtcclxuICAgIGRyb3BBcmVhLmFkZEV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCBwcmV2ZW50RGVmYXVsdHMsIGZhbHNlKTtcclxuICB9KTtcclxuXHJcbiAgWydkcmFnZW50ZXInLCAnZHJhZ292ZXInXS5mb3JFYWNoKGV2ZW50TmFtZSA9PiB7XHJcbiAgICBkcm9wQXJlYS5hZGRFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgaGlnaGxpZ2h0LCBmYWxzZSk7XHJcbiAgfSk7XHJcblxyXG4gIFsnZHJhZ2xlYXZlJywgJ2Ryb3AnXS5mb3JFYWNoKGV2ZW50TmFtZSA9PiB7XHJcbiAgICBkcm9wQXJlYS5hZGRFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgdW5oaWdobGlnaHQsIGZhbHNlKTtcclxuICB9KTtcclxuXHJcbiAgZHJvcEFyZWEuYWRkRXZlbnRMaXN0ZW5lcignZHJvcCcsIGhhbmRsZURyb3AsIGZhbHNlKTtcclxuXHJcbiAgdmFyIF92YWxpZEZpbGVFeHRlbnNpb25zID0gWycuemlwJywgJy5yYXInXTtcclxuXHJcbiAgZnVuY3Rpb24gVmFsaWRhdGUoaW5wdXQpIHtcclxuICAgIHZhciBzRmlsZU5hbWUgPSBpbnB1dC52YWx1ZTtcclxuXHJcbiAgICBpZiAoc0ZpbGVOYW1lLmxlbmd0aCA+IDApIHtcclxuICAgICAgdmFyIGJsblZhbGlkID0gZmFsc2U7XHJcbiAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgX3ZhbGlkRmlsZUV4dGVuc2lvbnMubGVuZ3RoOyBqKyspIHtcclxuICAgICAgICB2YXIgc0N1ckV4dGVuc2lvbiA9IF92YWxpZEZpbGVFeHRlbnNpb25zW2pdO1xyXG4gICAgICAgIGlmIChzRmlsZU5hbWUuc3Vic3RyKHNGaWxlTmFtZS5sZW5ndGggLSBzQ3VyRXh0ZW5zaW9uLmxlbmd0aCwgc0N1ckV4dGVuc2lvbi5sZW5ndGgpLnRvTG93ZXJDYXNlKCkgPT0gc0N1ckV4dGVuc2lvbi50b0xvd2VyQ2FzZSgpKSB7XHJcbiAgICAgICAgICBibG5WYWxpZCA9IHRydWU7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmICghYmxuVmFsaWQpIHtcclxuICAgICAgICBjb250YWluZXIuY2xhc3NMaXN0LmFkZCgnaGFzLWVycm9yJyk7XHJcblxyXG4gICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICBjb250YWluZXIuY2xhc3NMaXN0LnJlbW92ZSgnaGFzLWVycm9yJyk7XHJcbiAgICAgICAgfSwgMjAwMClcclxuXHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHRydWU7XHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBpbml0UmFuZ2UoKSB7XHJcbiAgdmFyIHNsaWRlcnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuanMtcmFuZ2UnKTtcclxuXHJcbiAgaWYgKCBzbGlkZXJzLmxlbmd0aCApIHtcclxuICAgIGZvciAoY29uc3Qgc2xpZGVyIG9mIHNsaWRlcnMpIHtcclxuICAgICAgbGV0IHNsaWRlclJhbmdlO1xyXG4gICAgICBsZXQgc2xpZGVyTWluID0gTnVtYmVyKHNsaWRlci5kYXRhc2V0Lm1pbik7XHJcbiAgICAgIGxldCBzbGlkZXJNYXggPSBOdW1iZXIoc2xpZGVyLmRhdGFzZXQubWF4KTtcclxuICAgICAgbGV0IHNsaWRlclN0ZXAgPSBOdW1iZXIoc2xpZGVyLmRhdGFzZXQuc3RlcCk7XHJcbiAgICAgIGxldCBzbGlkZXJQaXBzID0gTnVtYmVyKHNsaWRlci5kYXRhc2V0LnBpcHMpO1xyXG4gICAgICBsZXQgc2xpZGVyUHJlc2V0ID0gTnVtYmVyKHNsaWRlci5kYXRhc2V0LnByZXNldCk7XHJcblxyXG4gICAgICBpZiAoIHNsaWRlci5kYXRhc2V0LmluZGl2aWR1YWwgKSB7XHJcbiAgICAgICAgc2xpZGVyUmFuZ2UgPSB7XHJcbiAgICAgICAgICAnbWluJzogWzFdLFxyXG4gICAgICAgICAgJzEwJSc6IFsyLCAyXSxcclxuICAgICAgICAgICdtYXgnOiBbOF1cclxuICAgICAgICB9O1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHNsaWRlclJhbmdlID0ge1xyXG4gICAgICAgICAgJ21pbic6IHNsaWRlck1pbixcclxuICAgICAgICAgICdtYXgnOiBzbGlkZXJNYXhcclxuICAgICAgICB9O1xyXG4gICAgICB9XHJcblxyXG4gICAgICBsZXQgcHJlc2V0ID0gc2xpZGVyUHJlc2V0ID8gc2xpZGVyUHJlc2V0IDogMDtcclxuXHJcbiAgICAgIG5vVWlTbGlkZXIuY3JlYXRlKHNsaWRlciwge1xyXG4gICAgICAgIHN0YXJ0OiBbcHJlc2V0XSxcclxuICAgICAgICBzdGVwOiBzbGlkZXJTdGVwLFxyXG4gICAgICAgIHJhbmdlOiBzbGlkZXJSYW5nZSxcclxuICAgICAgICBjb25uZWN0OiAnbG93ZXInLFxyXG4gICAgICAgIHRvb2x0aXBzOiB0cnVlLFxyXG4gICAgICAgIGZvcm1hdDogd051bWIoe1xyXG4gICAgICAgICAgZGVjaW1hbHM6IDMsXHJcbiAgICAgICAgICB0aG91c2FuZDogJy4nLFxyXG4gICAgICAgIH0pLFxyXG4gICAgICAgIHBpcHM6IHtcclxuICAgICAgICAgIG1vZGU6ICdjb3VudCcsXHJcbiAgICAgICAgICB2YWx1ZXM6IHNsaWRlclBpcHMsXHJcbiAgICAgICAgICBzdGVwcGVkOiBmYWxzZVxyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcblxyXG4gICAgICBsZXQgbWluaU1hcmtlcnMgPSBzbGlkZXIucXVlcnlTZWxlY3RvckFsbCgnLm5vVWktbWFya2VyLWhvcml6b250YWwubm9VaS1tYXJrZXInKTtcclxuXHJcbiAgICAgIGlmICggbWluaU1hcmtlcnMubGVuZ3RoICkge1xyXG4gICAgICAgIGZvciAoIGNvbnN0IG1pbmlNYXJrZXIgb2YgbWluaU1hcmtlcnMgKSB7XHJcbiAgICAgICAgICBtaW5pTWFya2VyLnJlbW92ZSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gaW5pdEhlYWRlclRvZ2dsZXIoKSB7XHJcbiAgbGV0IHRvZ2dsZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtaGVhZGVyLXRvZ2dsZXInKTtcclxuICBsZXQgaGVhZGVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLWhlYWRlcicpO1xyXG4gIGxldCBwYWdlV3JhcCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy1wYWdlLXdyYXAnKTtcclxuICBsZXQgZGFya25lc3MgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtaGVhZGVyLWRhcmtuZXNzJyk7XHJcblxyXG4gIGlmICggdG9nZ2xlciAmJiBoZWFkZXIgJiYgcGFnZVdyYXAgJiYgZGFya25lc3MgKSB7XHJcbiAgICB0b2dnbGVyLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgIGhlYWRlci5jbGFzc0xpc3QudG9nZ2xlKCdpcy1vcGVuJyk7XHJcbiAgICAgIHRvZ2dsZXIuY2xhc3NMaXN0LnRvZ2dsZSgnaXMtYWN0aXZlJyk7XHJcbiAgICAgIHBhZ2VXcmFwLmNsYXNzTGlzdC50b2dnbGUoJ3Njcm9sbC1ibG9ja2VkLW1vYmlsZScpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgZGFya25lc3MuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbigpIHtcclxuICAgICAgaGVhZGVyLmNsYXNzTGlzdC5yZW1vdmUoJ2lzLW9wZW4nKTtcclxuICAgICAgdG9nZ2xlci5jbGFzc0xpc3QucmVtb3ZlKCdpcy1hY3RpdmUnKTtcclxuICAgICAgcGFnZVdyYXAuY2xhc3NMaXN0LnJlbW92ZSgnc2Nyb2xsLWJsb2NrZWQtbW9iaWxlJyk7XHJcbiAgICB9KTtcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGluaXRBbGJ1bXNDYXJkU2xpZGVyKCkge1xyXG4gIHZhciBteVN3aXBlciA9IG5ldyBTd2lwZXIoJy5qcy1hbGJ1bXMtY2FyZC1zbGlkZXInLCB7XHJcbiAgICBzcGVlZDogNDAwLFxyXG4gICAgc2xpZGVzUGVyVmlldzogMSxcclxuICAgIG5hdmlnYXRpb246IHtcclxuICAgICAgbmV4dEVsOiAnLnN3aXBlci1idXR0b24tbmV4dCcsXHJcbiAgICAgIHByZXZFbDogJy5zd2lwZXItYnV0dG9uLXByZXYnLFxyXG4gICAgfSxcclxuICB9KTtcclxuXHJcbiAgcmV0dXJuIG15U3dpcGVyO1xyXG59XHJcblxyXG5mdW5jdGlvbiBpbml0QWxidW1TbGlkZXIoKSB7XHJcbiAgdmFyIG15U3dpcGVyID0gbmV3IFN3aXBlcignLmpzLXN3aXBlci1hbGJ1bScsIHtcclxuICAgIHNwZWVkOiA0MDAsXHJcbiAgICBzbGlkZXNQZXJWaWV3OiAxLFxyXG4gICAgbG9vcDogZmFsc2UsXHJcbiAgICBwcmVsb2FkSW1hZ2VzOiBmYWxzZSxcclxuICAgIHNwYWNlQmV0d2VlbjogMTIsXHJcbiAgICBsYXp5OiB0cnVlLFxyXG4gICAgbmF2aWdhdGlvbjoge1xyXG4gICAgICBuZXh0RWw6ICcuanMtc3dpcGVyLWFsYnVtLW5leHQnLFxyXG4gICAgICBwcmV2RWw6ICcuanMtc3dpcGVyLWFsYnVtLXByZXYnLFxyXG4gICAgfSxcclxuICB9KTtcclxuXHJcbiAgcmV0dXJuIG15U3dpcGVyO1xyXG59XHJcblxyXG5mdW5jdGlvbiBpbml0U3dpcGVyKCkge1xyXG4gIGxldCB0YXJnZXRzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmpzLXN3aXBlci1jb250YWluZXInKTtcclxuXHJcbiAgaWYgKCAhdGFyZ2V0cy5sZW5ndGggKSB7XHJcbiAgICByZXR1cm47XHJcbiAgfVxyXG5cclxuICBsZXQgc3dpcGVycyA9IFtdO1xyXG5cclxuICB0YXJnZXRzLmZvckVhY2goICh0YXJnZXQsIGluZGV4KSA9PiB7XHJcbiAgICBpZiAoIGluZGV4ID09IDAgfHwgIXRhcmdldC5jbGFzc0xpc3QuY29udGFpbnMoJ3N3aXBlci1jb250YWluZXItZmF0JykgKSB7XHJcbiAgICAgIHZhciBteVN3aXBlciA9IG5ldyBTd2lwZXIodGFyZ2V0LCB7XHJcbiAgICAgICAgc3BlZWQ6IDQwMCxcclxuICAgICAgICBzbGlkZXNQZXJWaWV3OiA2LFxyXG4gICAgICAgIHNwYWNlQmV0d2VlbjogMzAsXHJcbiAgICAgICAgbG9vcDogZmFsc2UsXHJcbiAgICAgICAgcHJlbG9hZEltYWdlczogZmFsc2UsXHJcbiAgICAgICAgbGF6eTogdHJ1ZSxcclxuICAgICAgICBuYXZpZ2F0aW9uOiB7XHJcbiAgICAgICAgICBuZXh0RWw6ICcuc3dpcGVyLWJ1dHRvbi1uZXh0JyxcclxuICAgICAgICAgIHByZXZFbDogJy5zd2lwZXItYnV0dG9uLXByZXYnLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgYnJlYWtwb2ludHM6IHtcclxuICAgICAgICAgIDQ1OToge1xyXG4gICAgICAgICAgICBzbGlkZXNQZXJWaWV3OiAxLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIDU5OToge1xyXG4gICAgICAgICAgICBzbGlkZXNQZXJWaWV3OiAyLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIDc2Nzoge1xyXG4gICAgICAgICAgICBzbGlkZXNQZXJWaWV3OiAzLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIDExOTk6IHtcclxuICAgICAgICAgICAgc2xpZGVzUGVyVmlldzogNCxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHZhciBteVN3aXBlciA9IG5ldyBTd2lwZXIodGFyZ2V0LCB7XHJcbiAgICAgICAgc3BlZWQ6IDQwMCxcclxuICAgICAgICBzbGlkZXNQZXJWaWV3OiA0LFxyXG4gICAgICAgIHNwYWNlQmV0d2VlbjogMzAsXHJcbiAgICAgICAgbG9vcDogZmFsc2UsXHJcbiAgICAgICAgcHJlbG9hZEltYWdlczogZmFsc2UsXHJcbiAgICAgICAgbGF6eTogdHJ1ZSxcclxuICAgICAgICBuYXZpZ2F0aW9uOiB7XHJcbiAgICAgICAgICBuZXh0RWw6ICcuc3dpcGVyLWJ1dHRvbi1uZXh0JyxcclxuICAgICAgICAgIHByZXZFbDogJy5zd2lwZXItYnV0dG9uLXByZXYnLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgYnJlYWtwb2ludHM6IHtcclxuICAgICAgICAgIDc2Nzoge1xyXG4gICAgICAgICAgICBzbGlkZXNQZXJWaWV3OiAxLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIDExOTk6IHtcclxuICAgICAgICAgICAgc2xpZGVzUGVyVmlldzogMixcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBzd2lwZXJzLnB1c2gobXlTd2lwZXIpO1xyXG4gIH0pO1xyXG5cclxuICByZXR1cm4gc3dpcGVycztcclxufVxyXG5cclxuZnVuY3Rpb24gaW5pdFN3aXBlclN0YXRpY2soKSB7XHJcbiAgdmFyIG15U3dpcGVyID0gbmV3IFN3aXBlcignLmpzLXN3aXBlci1jb250YWluZXItc3RhdGljaycsIHtcclxuICAgIHNwZWVkOiA0MDAsXHJcbiAgICBzbGlkZXNQZXJWaWV3OiA2LFxyXG4gICAgc3BhY2VCZXR3ZWVuOiA0MCxcclxuICAgIGxvb3A6IGZhbHNlLFxyXG4gICAgcHJlbG9hZEltYWdlczogZmFsc2UsXHJcbiAgICBsYXp5OiB0cnVlLFxyXG4gICAgbmF2aWdhdGlvbjoge1xyXG4gICAgICBuZXh0RWw6ICcuanMtc3dpcGVyLWNvbnRhaW5lci1zdGF0aWNrLW5leHQnLFxyXG4gICAgICBwcmV2RWw6ICcuanMtc3dpcGVyLWNvbnRhaW5lci1zdGF0aWNrLXByZXYnLFxyXG4gICAgfSxcclxuICAgIGZvbGxvd0ZpbmdlcjogZmFsc2UsXHJcbiAgICBicmVha3BvaW50czoge1xyXG4gICAgICA0NTk6IHtcclxuICAgICAgICBzbGlkZXNQZXJWaWV3OiAxLFxyXG4gICAgICB9LFxyXG4gICAgICA1OTk6IHtcclxuICAgICAgICBzbGlkZXNQZXJWaWV3OiAyLFxyXG4gICAgICB9LFxyXG4gICAgICA3Njc6IHtcclxuICAgICAgICBzbGlkZXNQZXJWaWV3OiAzLFxyXG4gICAgICB9LFxyXG4gICAgICAxMTk5OiB7XHJcbiAgICAgICAgc2xpZGVzUGVyVmlldzogNCxcclxuICAgICAgfSxcclxuICAgIH1cclxuICB9KTtcclxuXHJcbiAgcmV0dXJuIG15U3dpcGVyO1xyXG59XHJcblxyXG5mdW5jdGlvbiBpbml0TWFpblN3aXBlcigpIHtcclxuICB2YXIgbXlTd2lwZXIgPSBuZXcgU3dpcGVyKCcuanMtbWFpbi1zd2lwZXItY29udGFpbmVyJywge1xyXG4gICAgc3BlZWQ6IDQwMCxcclxuICAgIHNsaWRlc1BlclZpZXc6IDEsXHJcbiAgICBsb29wOiB0cnVlLFxyXG4gICAgc3BhY2VCZXR3ZWVuOiAxMixcclxuICAgIGF1dG9IZWlnaHQ6IHRydWUsXHJcbiAgICBwYWdpbmF0aW9uOiB7XHJcbiAgICAgIGVsOiAnLnN3aXBlci1wYWdpbmF0aW9uJyxcclxuICAgICAgdHlwZTogJ2J1bGxldHMnLFxyXG4gICAgICBjbGlja2FibGU6IHRydWVcclxuICAgIH0sXHJcbiAgICBuYXZpZ2F0aW9uOiB7XHJcbiAgICAgIG5leHRFbDogJy5qcy1zd2lwZXItbWFpbi1uZXh0JyxcclxuICAgICAgcHJldkVsOiAnLmpzLXN3aXBlci1tYWluLXByZXYnLFxyXG4gICAgfSxcclxuICB9KTtcclxuXHJcbiAgcmV0dXJuIG15U3dpcGVyO1xyXG59XHJcblxyXG5mdW5jdGlvbiBpbml0TW9kYWxTd2lwZXIoKSB7XHJcbiAgdmFyIG15U3dpcGVyID0gbmV3IFN3aXBlcignLmpzLW1haW4tc3dpcGVyLW1vZGFsJywge1xyXG4gICAgc3BlZWQ6IDQwMCxcclxuICAgIHNsaWRlc1BlclZpZXc6IDEsXHJcbiAgICBsb29wOiB0cnVlLFxyXG4gICAgc3BhY2VCZXR3ZWVuOiAxMixcclxuICAgIHByZWxvYWRJbWFnZXM6IGZhbHNlLFxyXG4gICAgbGF6eTogdHJ1ZSxcclxuICAgIGF1dG9IZWlnaHQ6IHRydWUsXHJcbiAgICBwYWdpbmF0aW9uOiB7XHJcbiAgICAgIGVsOiAnLnN3aXBlci1wYWdpbmF0aW9uJyxcclxuICAgICAgdHlwZTogJ2J1bGxldHMnLFxyXG4gICAgICBjbGlja2FibGU6IHRydWVcclxuICAgIH0sXHJcbiAgICBuYXZpZ2F0aW9uOiB7XHJcbiAgICAgIG5leHRFbDogJy5qcy1tb2RhbC1zd2lwZXItbmV4dCcsXHJcbiAgICAgIHByZXZFbDogJy5qcy1tb2RhbC1zd2lwZXItcHJldicsXHJcbiAgICB9LFxyXG4gIH0pO1xyXG5cclxuICByZXR1cm4gbXlTd2lwZXI7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGluaXRBbGJ1bXNUeXBlU2xpZGVyKCkge1xyXG4gIHZhciBteVN3aXBlciA9IG5ldyBTd2lwZXIoJy5qcy10eXBlLWFsYnVtcy1zd2lwZXInLCB7XHJcbiAgICBzcGVlZDogNDAwLFxyXG4gICAgc2xpZGVzUGVyVmlldzogJ2F1dG8nLFxyXG4gICAgc2xpZGVzT2Zmc2V0QWZ0ZXI6IDEwMCxcclxuICAgIHNwYWNlQmV0d2VlbjogMjQsXHJcbiAgICBuYXZpZ2F0aW9uOiB7XHJcbiAgICAgIG5leHRFbDogJy5zd2lwZXItYnV0dG9uLW5leHQnLFxyXG4gICAgICBwcmV2RWw6ICcuc3dpcGVyLWJ1dHRvbi1wcmV2JyxcclxuICAgIH0sXHJcbiAgICBvbjoge1xyXG4gICAgICBzbGlkZUNoYW5nZTogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGlmICggdGhpcy5hY3RpdmVJbmRleCA+IDAgKSB7XHJcbiAgICAgICAgICB0aGlzLmVsLmNsYXNzTGlzdC5hZGQoJ25vdC1vbi1zdGFydCcpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICB0aGlzLmVsLmNsYXNzTGlzdC5yZW1vdmUoJ25vdC1vbi1zdGFydCcpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgfSk7XHJcblxyXG4gIHJldHVybiBteVN3aXBlcjtcclxufVxyXG5cclxuZnVuY3Rpb24gaW5pdE1haW5DYXJkc1NsaWRlcigpIHtcclxuICB2YXIgbXlTd2lwZXIgPSBuZXcgU3dpcGVyKCcuanMtbWFpbi1jYXJkLXNsaWRlcicsIHtcclxuICAgIHNwZWVkOiA0MDAsXHJcbiAgICBzbGlkZXNQZXJWaWV3OiAxLFxyXG4gICAgbG9vcDogdHJ1ZSxcclxuICAgIHNwYWNlQmV0d2VlbjogMTIsXHJcbiAgICBuYXZpZ2F0aW9uOiB7XHJcbiAgICAgIG5leHRFbDogJy5zd2lwZXItYnV0dG9uLW5leHQnLFxyXG4gICAgICBwcmV2RWw6ICcuc3dpcGVyLWJ1dHRvbi1wcmV2JyxcclxuICAgIH0sXHJcbiAgfSk7XHJcblxyXG4gIHJldHVybiBteVN3aXBlcjtcclxufVxyXG5cclxuZnVuY3Rpb24gdGFiKHRhYkhhbmRsZXIpIHtcclxuICAgIGxldCB0YWJzQ29udGFpbmVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5qcy10YWItY29udGFpbmVyXCIpO1xyXG5cclxuICAgIGlmICggdGFic0NvbnRhaW5lciApIHtcclxuICAgICAgbGV0IG1lbnVJdGVtcyA9IHRhYnNDb250YWluZXIucXVlcnlTZWxlY3RvckFsbChcIi5qcy10YWItbWVudS1pdGVtXCIpO1xyXG5cclxuICAgICAgbWVudUl0ZW1zLmZvckVhY2goIChtZW51SXRlbSkgPT4ge1xyXG5cclxuICAgICAgICBtZW51SXRlbS5vbmNsaWNrID0gKCkgPT4ge1xyXG4gICAgICAgICAgbGV0IGFjdGl2ZU1lbnVJdGVtID0gQXJyYXkuZnJvbShtZW51SXRlbXMpLmZpbmQoZ2V0QWN0aXZlVGFiKTtcclxuICAgICAgICAgIGxldCBhY3RpdmVDb250ZW50SXRlbSA9IHRhYnNDb250YWluZXIucXVlcnlTZWxlY3RvcihhY3RpdmVNZW51SXRlbS5kYXRhc2V0LnRhcmdldCk7XHJcbiAgICAgICAgICBsZXQgY3VycmVudENvbnRlbnRJdGVtID0gdGFic0NvbnRhaW5lci5xdWVyeVNlbGVjdG9yKG1lbnVJdGVtLmRhdGFzZXQudGFyZ2V0KTtcclxuXHJcbiAgICAgICAgICBhY3RpdmVNZW51SXRlbS5jbGFzc0xpc3QucmVtb3ZlKFwiaXMtYWN0aXZlXCIpO1xyXG5cclxuICAgICAgICAgIGlmICggYWN0aXZlQ29udGVudEl0ZW0gKSB7XHJcbiAgICAgICAgICAgIGFjdGl2ZUNvbnRlbnRJdGVtLmNsYXNzTGlzdC5yZW1vdmUoXCJpcy1hY3RpdmVcIik7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgaWYgKCBjdXJyZW50Q29udGVudEl0ZW0gKSB7XHJcbiAgICAgICAgICAgIGN1cnJlbnRDb250ZW50SXRlbS5jbGFzc0xpc3QuYWRkKFwiaXMtYWN0aXZlXCIpO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIG1lbnVJdGVtLmNsYXNzTGlzdC5hZGQoXCJpcy1hY3RpdmVcIik7XHJcblxyXG4gICAgICAgICAgaWYgKCB0YWJIYW5kbGVyICkge1xyXG4gICAgICAgICAgICBkb2N1bWVudC5kaXNwYXRjaEV2ZW50KHRhYkhhbmRsZXIpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICBmdW5jdGlvbiBnZXRBY3RpdmVUYWIoZWxlbWVudCkge1xyXG4gICAgcmV0dXJuIGVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKFwiaXMtYWN0aXZlXCIpO1xyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gYWNjb3JkaW9uKCkge1xyXG4gIGxldCB3cmFwcGVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmpzLWFjY29yZGlvbicpO1xyXG4gIHdyYXBwZXIuZm9yRWFjaCh3cmFwcGVySXRlbSA9PiB7XHJcbiAgICBsZXQgaXRlbXMgPSB3cmFwcGVySXRlbS5xdWVyeVNlbGVjdG9yQWxsKCcuanMtYWNjb3JkaW9uLWl0ZW0nKTtcclxuICAgIGxldCBpbmRpdmlkdWFsID0gd3JhcHBlckl0ZW0uZ2V0QXR0cmlidXRlKCdpbmRpdmlkdWFsJykgJiYgd3JhcHBlckl0ZW0uZ2V0QXR0cmlidXRlKCdpbmRpdmlkdWFsJykgIT09ICdmYWxzZSc7XHJcblxyXG4gICAgaXRlbXMuZm9yRWFjaChpdGVtID0+IHtcclxuICAgICAgaWYgKCBpdGVtLmNsYXNzTGlzdC5jb250YWlucygnaXMtYWN0aXZlJykgKSB7XHJcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICBsZXQgcmVhZHlDb250ZW50ID0gaXRlbS5xdWVyeVNlbGVjdG9yKCcuanMtYWNjb3JkaW9uLWNvbnRlbnQnKTtcclxuICAgICAgICAgIGxldCByZWFkeUNvbnRlbnRIZWlnaHQgPSByZWFkeUNvbnRlbnQuc2Nyb2xsSGVpZ2h0O1xyXG5cclxuICAgICAgICAgIHJlYWR5Q29udGVudC5zdHlsZS5tYXhIZWlnaHQgPSByZWFkeUNvbnRlbnRIZWlnaHQgKyAncHgnO1xyXG4gICAgICAgIH0sIDEwMCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGxldCBzdWJJdGVtcyA9IGl0ZW0ucXVlcnlTZWxlY3RvckFsbCgnLmpzLWFjY29yZGlvbi1zdWJpdGVtJyk7XHJcblxyXG4gICAgICBmb3IgKGNvbnN0IHN1Ykl0ZW0gb2Ygc3ViSXRlbXMpIHtcclxuICAgICAgICBpZiAoIHN1Ykl0ZW0uY2xhc3NMaXN0LmNvbnRhaW5zKCdpcy1hY3RpdmUnKSApIHtcclxuICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICBsZXQgcmVhZHlDb250ZW50ID0gc3ViSXRlbS5xdWVyeVNlbGVjdG9yKCcuanMtYWNjb3JkaW9uLWNvbnRlbnQnKTtcclxuICAgICAgICAgICAgbGV0IHJlYWR5Q29udGVudEhlaWdodCA9IHJlYWR5Q29udGVudC5zY3JvbGxIZWlnaHQ7XHJcblxyXG4gICAgICAgICAgICByZWFkeUNvbnRlbnQuc3R5bGUubWF4SGVpZ2h0ID0gcmVhZHlDb250ZW50SGVpZ2h0ICsgJ3B4JztcclxuICAgICAgICAgIH0sIDEwMCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICBpdGVtSXRlcmF0aW9uKGl0ZW0sIGl0ZW1zLCBpbmRpdmlkdWFsKTtcclxuXHJcbiAgICAgIHN1Ykl0ZW1zLmZvckVhY2goc3ViaXRlbSA9PiB7XHJcbiAgICAgICAgaXRlbUl0ZXJhdGlvbihzdWJpdGVtLCBzdWJJdGVtcywgaW5kaXZpZHVhbCwgdHJ1ZSlcclxuICAgICAgfSk7XHJcbiAgICB9KVxyXG4gIH0pXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGl0ZW1JdGVyYXRpb24oaXRlbSwgaXRlbXMsIGluZGl2aWR1YWwsIGlzU3ViaXRlbSkge1xyXG4gIGxldCBpbml0ID0gaXRlbS5xdWVyeVNlbGVjdG9yKCcuanMtYWNjb3JkaW9uLWluaXQnKTtcclxuICBsZXQgY29udGVudCA9IGl0ZW0ucXVlcnlTZWxlY3RvcignLmpzLWFjY29yZGlvbi1jb250ZW50Jyk7XHJcblxyXG4gIGlmICggaXNTdWJpdGVtID09PSB0cnVlICkge1xyXG4gICAgY29udGVudC5hZGRFdmVudExpc3RlbmVyKCd0cmFuc2l0aW9uZW5kJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgIGxldCBwYXJlbnRJdGVtID0gaXRlbS5jbG9zZXN0KCcuanMtYWNjb3JkaW9uLWl0ZW0nKTtcclxuICAgICAgbGV0IHBhcmVudENvbnRlbnRIZWlnaHQgPSBwYXJlbnRJdGVtLnNjcm9sbEhlaWdodCArICdweCc7XHJcbiAgICAgIGxldCBwYXJlbnRDb250ZW50ID0gcGFyZW50SXRlbS5xdWVyeVNlbGVjdG9yKCcuanMtYWNjb3JkaW9uLWNvbnRlbnQnKTtcclxuXHJcbiAgICAgIHBhcmVudENvbnRlbnQuc2V0QXR0cmlidXRlKCdzdHlsZScsIGBtYXgtaGVpZ2h0OiAke3BhcmVudENvbnRlbnRIZWlnaHR9YCk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIGluaXQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbigpIHtcclxuICAgIGlmICggaXRlbS5jbGFzc0xpc3QuY29udGFpbnMoJ2lzLWFjdGl2ZScpICkge1xyXG4gICAgICBpdGVtLmNsYXNzTGlzdC5yZW1vdmUoJ2lzLWFjdGl2ZScpO1xyXG4gICAgICBjb250ZW50LnN0eWxlLm1heEhlaWdodCA9ICcwcHgnO1xyXG5cclxuICAgICAgcmV0dXJuIGZhbHNlXHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCBpc1N1Yml0ZW0gPT09IHRydWUgKSB7XHJcbiAgICAgIGxldCBwYXJlbnRJdGVtID0gaXRlbS5jbG9zZXN0KCcuanMtYWNjb3JkaW9uLWl0ZW0nKTtcclxuICAgICAgbGV0IHBhcmVudENvbnRlbnQgPSBwYXJlbnRJdGVtLnF1ZXJ5U2VsZWN0b3IoJy5qcy1hY2NvcmRpb24tY29udGVudCcpO1xyXG5cclxuICAgICAgcGFyZW50Q29udGVudC5zZXRBdHRyaWJ1dGUoJ3N0eWxlJywgYG1heC1oZWlnaHQ6IG5vbmVgKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIGluZGl2aWR1YWwgKSB7XHJcbiAgICAgIGl0ZW1zLmZvckVhY2goKGVsZW0pID0+IHtcclxuICAgICAgICBsZXQgZWxlbUNvbnRlbnQgPSBlbGVtLnF1ZXJ5U2VsZWN0b3IoJy5qcy1hY2NvcmRpb24tY29udGVudCcpO1xyXG4gICAgICAgIGVsZW0uY2xhc3NMaXN0LnJlbW92ZSgnaXMtYWN0aXZlJyk7XHJcbiAgICAgICAgZWxlbUNvbnRlbnQuc3R5bGUubWF4SGVpZ2h0ID0gMCArICdweCc7XHJcbiAgICAgIH0pXHJcbiAgICB9XHJcblxyXG4gICAgaXRlbS5jbGFzc0xpc3QuYWRkKCdpcy1hY3RpdmUnKTtcclxuICAgIGNvbnRlbnQuc3R5bGUubWF4SGVpZ2h0ID0gY29udGVudC5zY3JvbGxIZWlnaHQgKyAncHgnO1xyXG4gIH0pO1xyXG59XHJcbiJdfQ==
