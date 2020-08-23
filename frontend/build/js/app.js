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
  listsOutput.textContent = albumLists;
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

      noUiSlider.create(slider, {
        start: [0],
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
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XHJcblxyXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgZnVuY3Rpb24oKSB7XHJcbiAgbGV0IHRhYkhhbmRsZXIgPSBuZXcgRXZlbnQoJ3RhYkhhbmRsZXInKTtcclxuICBsZXQgbW9kYWxTd2lwZXIgPSBpbml0TW9kYWxTd2lwZXIoKTtcclxuICBsZXQgc3dpcGVycyA9IGluaXRTd2lwZXIoKTtcclxuICBzdmc0ZXZlcnlib2R5KCk7XHJcbiAgaW5pdE1haW5Td2lwZXIoKTtcclxuICBpbml0SGVhZGVyVG9nZ2xlcigpO1xyXG4gIGluaXRBbGJ1bXNDYXJkU2xpZGVyKCk7XHJcbiAgYWNjb3JkaW9uKCk7XHJcbiAgaW5pdEFsYnVtc1R5cGVTbGlkZXIoKTtcclxuICBpbml0U3dpcGVyU3RhdGljaygpO1xyXG4gIGluaXRBbGJ1bVNsaWRlcigpO1xyXG4gIHRhYih0YWJIYW5kbGVyKTtcclxuICBpbml0UmFuZ2UoKTtcclxuICBpbml0RHJhZ05Ecm9wKCk7XHJcbiAgaW5pdE1vZGFsKG1vZGFsU3dpcGVyKTtcclxuICB2YWxpZGF0ZUZyb20oKTtcclxuICBjYXJkSGVhZGVySGFuZGxlKG1vZGFsU3dpcGVyLCAnL2FwaS9hbGJ1bS9pbWFnZXNfc2xpZGVyP2lkPScpO1xyXG4gIGNob2ljZVR5cGUoKTtcclxuICBzZXRIYW5kbGVyc1ByaWNlKCk7XHJcbiAgZ2V0VHJ1ZVByaWNlQ2FyZCgpO1xyXG4gIHNvcnREZXNpZ25zUGFnZSgpO1xyXG5cclxuICBpZiAoIHdpbmRvdy5sb2NhdGlvbi5oYXNoICkge1xyXG4gICAgbGV0IHRhcmdldCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYFtkYXRhLXRhcmdldD1cIiR7d2luZG93LmxvY2F0aW9uLmhhc2h9XCJdYCk7XHJcblxyXG4gICAgaWYgKCB0YXJnZXQgKSB7XHJcbiAgICAgIHRhcmdldC5jbGljaygpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigndGFiSGFuZGxlcicsIGZ1bmN0aW9uKCkge1xyXG4gICAgaWYgKCAhc3dpcGVycyApIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIHN3aXBlcnMuZm9yRWFjaChzd2lwZXIgPT4ge1xyXG4gICAgICBzd2lwZXIudXBkYXRlKCk7XHJcbiAgICB9KTtcclxuXHJcbiAgfSwgZmFsc2UpO1xyXG5cclxuICBpZiAoIHdpbmRvdy5pbm5lcldpZHRoIDwgNzY4ICkge1xyXG4gICAgaW5pdE1haW5DYXJkc1NsaWRlcigpO1xyXG4gIH1cclxufSk7XHJcblxyXG5mdW5jdGlvbiBzb3J0RGVzaWduc1BhZ2UoKSB7XHJcbiAgbGV0IHRhcmdldHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuanMtc29ydCBpbnB1dCcpO1xyXG4gIGxldCBhY2NlcHRCdG4gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtc29ydC1hY2NlcHQnKTtcclxuXHJcbiAgaWYgKCAhdGFyZ2V0cy5sZW5ndGggKSB7XHJcbiAgICByZXR1cm47XHJcbiAgfVxyXG5cclxuICBsZXQgYXJyID0gW107XHJcbiAgbGV0IGFsbCA9IGZhbHNlO1xyXG5cclxuICB0YXJnZXRzLmZvckVhY2goIHRhcmdldCA9PiB7XHJcbiAgICBsZXQgaWQgPSB0YXJnZXQuZGF0YXNldC5pZDtcclxuXHJcbiAgICB0YXJnZXQuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgIGlmICggdGFyZ2V0LmNoZWNrZWQgKSB7XHJcbiAgICAgICAgaWQgPT09ICdhbGwnID8gYWxsID0gdHJ1ZSA6IGFyci5wdXNoKGlkKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBpZCA9PT0gJ2FsbCcgPyBhbGwgPSBmYWxzZSA6IGFyci5maW5kKCAoaXRlbSwgaW5kZXgpID0+IGl0ZW0gPT0gaWQgJiYgYXJyLnNwbGljZShpbmRleCwgMSkgKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgaWYgKCBpZCAhPT0gJ2FsbCcgKSB7XHJcbiAgICAgIHRhcmdldC5jaGVja2VkICYmIGFyci5wdXNoKGlkKTtcclxuICAgIH0gZWxzZSBpZiAoIGlkID09PSAnYWxsJyAmJiB0YXJnZXQuY2hlY2tlZCApIHtcclxuICAgICAgYWxsID0gdHJ1ZTtcclxuICAgIH1cclxuICB9KTtcclxuXHJcbiAgYWNjZXB0QnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oKSB7XHJcbiAgICBpZiAoIHRhcmdldHMubGVuZ3RoIC0gMSA9PT0gYXJyLmxlbmd0aCApIHtcclxuICAgICAgYWxsID0gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICBzZXRVcmwoYXJyLCBhbGwpO1xyXG4gIH0pO1xyXG59XHJcblxyXG5mdW5jdGlvbiBzZXRVcmwoYXJyLCBhbGwpIHtcclxuICBsZXQgdXJsID0gbG9jYXRpb24ucHJvdG9jb2wgKyAnLy8nICsgbG9jYXRpb24uaG9zdCArIGxvY2F0aW9uLnBhdGhuYW1lO1xyXG4gIGxldCBwYXJhbXMgPSBhbGwgPyAnJyA6IGFyci5qb2luKCk7XHJcblxyXG4gIHJldHVybiB3aW5kb3cubG9jYXRpb24uaHJlZiA9IHVybCArICc/aWQ9JyArIHBhcmFtcztcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0VHJ1ZVByaWNlQ2FyZCgpIHtcclxuICBsZXQgdGFyZ2V0cyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy1jYXJkLXByaWNlLXdyYXBwZXInKTtcclxuXHJcbiAgaWYgKCB0YXJnZXRzLmxlbmd0aCApIHtcclxuICAgIGZvciAoY29uc3QgdGFyZ2V0IG9mIHRhcmdldHMpIHtcclxuICAgICAgbGV0IGlucHV0ID0gdGFyZ2V0LnF1ZXJ5U2VsZWN0b3IoJy5qcy1jYXJkLXByaWNlIGlucHV0Jyk7XHJcbiAgICAgIGxldCBvdXRwdXQgPSB0YXJnZXQucXVlcnlTZWxlY3RvcignLmpzLWNhcmQtcHJpY2Utb3V0cHV0Jyk7XHJcbiAgICAgIGxldCBiYXNlUHJpY2UgPSArb3V0cHV0LmRhdGFzZXQucHJpY2U7XHJcblxyXG4gICAgICBpbnB1dC5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBsZXQgcGVyY2FudGFnZSA9IGdldERpc2NvdW50UGVyY2VudCgraW5wdXQudmFsdWUpO1xyXG4gICAgICAgIGxldCBkaXNjb3VudFByaWNlID0gZ2V0RGlzY291bnRTdW1tKGJhc2VQcmljZSwgcGVyY2FudGFnZSk7XHJcblxyXG4gICAgICAgIG91dHB1dC50ZXh0Q29udGVudCA9IChiYXNlUHJpY2UgLSBkaXNjb3VudFByaWNlKSArICcg4oK9JztcclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBjaG9pY2VUeXBlKCkge1xyXG4gIGxldCB0eXBlcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy1jaG9pY2UtdHlwZScpO1xyXG4gIGxldCBjb250YWluZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtY2hvaWNlLXR5cGUtYWRkaW5ncycpO1xyXG4gIGxldCBvdXRwdXRDb250YWluZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtY2hvaWNlLXR5cGUtb3V0cHV0Jyk7XHJcblxyXG4gIGlmICggIXR5cGVzLmxlbmd0aCB8fCAhY29udGFpbmVyICkge1xyXG4gICAgcmV0dXJuXHJcbiAgfVxyXG5cclxuICBmb3IgKGNvbnN0IHR5cGUgb2YgdHlwZXMpIHtcclxuICAgIGxldCBsaXN0ID0gdHlwZS5xdWVyeVNlbGVjdG9yQWxsKCcuanMtY2hvaWNlLXR5cGUtbGlzdCBsaScpO1xyXG4gICAgbGV0IGFyckxpc3QgPSBbXTtcclxuXHJcbiAgICBmb3IgKGNvbnN0IGl0ZW0gb2YgbGlzdCkge1xyXG4gICAgICBhcnJMaXN0LnB1c2goaXRlbS50ZXh0Q29udGVudCk7XHJcbiAgICB9XHJcblxyXG4gICAgdHlwZS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKCkge1xyXG4gICAgICBpZiAoIHR5cGUuY2xhc3NMaXN0LmNvbnRhaW5zKCdpcy1hY3RpdmUnKSApIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGZvciAoY29uc3QgdHlwZUluIG9mIHR5cGVzKSB7XHJcbiAgICAgICAgdHlwZUluLmNsYXNzTGlzdC5yZW1vdmUoJ2lzLWFjdGl2ZScpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBjb250YWluZXIuY2xhc3NMaXN0LmFkZCgnaXMtYWN0aXZlJyk7XHJcblxyXG4gICAgICBpZiAoICFsaXN0Lmxlbmd0aCB8fCBsaXN0Lmxlbmd0aCA8IDIgKSB7XHJcbiAgICAgICAgY29udGFpbmVyLmNsYXNzTGlzdC5yZW1vdmUoJ2lzLWFjdGl2ZScpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB0eXBlLmNsYXNzTGlzdC5hZGQoJ2lzLWFjdGl2ZScpO1xyXG4gICAgICBvdXRwdXRDb250YWluZXIuaW5uZXJIVE1MID0gJyc7XHJcblxyXG4gICAgICBsaXN0LmZvckVhY2goKGl0ZW0sIGlkeCkgPT4ge1xyXG4gICAgICAgIGlmICggaWR4ID09PSAwICkge1xyXG4gICAgICAgICAgb3V0cHV0Q29udGFpbmVyLmFwcGVuZENoaWxkKGNyZWF0ZUNoZWNrbWFyayhpdGVtLnRleHRDb250ZW50LCB0cnVlLCBpdGVtLmRhdGFzZXQuYmFzZVByaWNlKSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIG91dHB1dENvbnRhaW5lci5hcHBlbmRDaGlsZChjcmVhdGVDaGVja21hcmsoaXRlbS50ZXh0Q29udGVudCwgZmFsc2UsIGl0ZW0uZGF0YXNldC5iYXNlUHJpY2UpKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgbGV0IGNoZWNrbWFya3MgPSBvdXRwdXRDb250YWluZXIucXVlcnlTZWxlY3RvckFsbCgnLmNoZWNrbWFyayBpbnB1dCcpO1xyXG5cclxuICAgICAgaWYgKCBjaGVja21hcmtzLmxlbmd0aCApIHtcclxuICAgICAgICBjaGVja21hcmtzWzBdLmNsaWNrKCk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gc2V0SGFuZGxlcnNQcmljZSgpIHtcclxuICBsZXQgdGFyZ2V0cyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy1jYWxjLWNoYW5nZScpO1xyXG5cclxuICBmb3IgKGNvbnN0IHRhcmdldCBvZiB0YXJnZXRzKSB7XHJcbiAgICBpZiAoIHRhcmdldC5ub1VpU2xpZGVyICkge1xyXG4gICAgICB0YXJnZXQubm9VaVNsaWRlci5vbignY2hhbmdlJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgY2hhbmdlUHJpY2VIYW5kbGUoKTtcclxuICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgdGFyZ2V0LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIGZ1bmN0aW9uKCkge1xyXG4gICAgICBjaGFuZ2VQcmljZUhhbmRsZSgpO1xyXG4gICAgfSk7XHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBjaGFuZ2VQcmljZUhhbmRsZSgpIHtcclxuICBsZXQgYmFzZVByaWNlcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy1jaG9pY2UtdHlwZS1vdXRwdXQgaW5wdXQnKTtcclxuICBsZXQgYmFzZVByaWNlSXRlbSA9IGdldEJhc2VQcmljZShiYXNlUHJpY2VzKTtcclxuICBsZXQgb3V0cHV0UHJpY2UgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtY2FsYy1wcmljZScpO1xyXG4gIGxldCBvdXRwdXREaXNjb3VudFByaWNlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLWNhbGMtZGlzY291bnQtcHJpY2UnKTtcclxuICBsZXQgdHlwZU91dHB1dCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy1jYWxjLXR5cGUtb3V0cHV0Jyk7XHJcbiAgbGV0IGxpc3RzT3V0cHV0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLWNhbGMtbGlzdHMtb3V0cHV0Jyk7XHJcbiAgbGV0IGFsYnVtc091dHB1dCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy1jYWxjLWFsYnVtcy1vdXRwdXQnKTtcclxuICBsZXQgcGVyc2FudGFnZU91dHB1dCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy1jYWxjLWRpc2NvdW50LXBlcnNhbnRhZ2Utb3V0cHV0Jyk7XHJcbiAgbGV0IGRpc2NvdW50U3VtbU91dHB1dCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy1jYWxjLWRpc2NvdW50LXN1bW0tb3V0cHV0Jyk7XHJcbiAgbGV0IGFsYnVtcyA9ICtkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtY2FsYy1hbGJ1bXMtbGVuZ3RoIGlucHV0JykudmFsdWU7XHJcbiAgbGV0IHBlb3BsZXMgPSArZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLWNhbGMtcGVvcGxlcycpLm5vVWlTbGlkZXIuZ2V0KCk7XHJcbiAgbGV0IHBlb3BsZXNPblR1cm4gPSArZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLWNhbGMtcGVvcGxlcy1vbi10dXJuJykubm9VaVNsaWRlci5nZXQoKTtcclxuICBsZXQgaGlzdG9yeVR1cm5zID0gK2RvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy1jYWxjLWhpc3RvcnktdHVybnMnKS5ub1VpU2xpZGVyLmdldCgpO1xyXG4gIGxldCBhY3RpdmVDaG9pY2UgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtY2hvaWNlLXR5cGUuaXMtYWN0aXZlJyk7XHJcbiAgbGV0IHJhbmdlc0NhbkJlRGlzYWJsZWQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuanMtcmFuZ2UtY2FuLWJlLWRpc2FibGVkJyk7XHJcblxyXG4gIGlmICggIWFjdGl2ZUNob2ljZSApIHtcclxuICAgIHJldHVyblxyXG4gIH1cclxuXHJcbiAgbGV0IGJhc2VMaXN0cyA9ICthY3RpdmVDaG9pY2UuZGF0YXNldC5iYXNlTGlzdHM7XHJcbiAgbGV0IGJhc2VUdXJuID0gK2FjdGl2ZUNob2ljZS5kYXRhc2V0LmJhc2VUdXJuO1xyXG4gIGxldCBiYXNlVHVyblByaWNlID0gK2FjdGl2ZUNob2ljZS5kYXRhc2V0LnR1cm5QcmljZTtcclxuICBsZXQgYmFzZVByaWNlID0gK2Jhc2VQcmljZUl0ZW0uZGF0YXNldC5iYXNlUHJpY2U7XHJcbiAgbGV0IGFsYnVtTGlzdHMgPSBnZXRMaXN0SW5BbGJ1bShwZW9wbGVzLCBwZW9wbGVzT25UdXJuLCBoaXN0b3J5VHVybnMsIGJhc2VUdXJuKTtcclxuICBsZXQgYWxidW1QcmljZSA9IGdldFByaWNlRm9yQWxidW0oYmFzZVByaWNlLCBhbGJ1bUxpc3RzLCBiYXNlTGlzdHMsIGJhc2VUdXJuUHJpY2UpO1xyXG4gIGxldCBwZXJjZW50YWdlID0gZ2V0RGlzY291bnRQZXJjZW50KGFsYnVtcyk7XHJcbiAgbGV0IGRpc2NvdW50U3VtbSA9IGdldERpc2NvdW50U3VtbShhbGJ1bVByaWNlLCBwZXJjZW50YWdlKTtcclxuICBsZXQgYWxidW1QcmljZVdpdGhEaXNjb3VudCA9IGdldFByaWNlRm9yQWxidW1EaXNjb3VudChhbGJ1bVByaWNlLCBkaXNjb3VudFN1bW0pO1xyXG5cclxuICBpZiAoIGJhc2VMaXN0cyA9PT0gMCAmJiByYW5nZXNDYW5CZURpc2FibGVkLmxlbmd0aCApIHtcclxuICAgIHJhbmdlc0NhbkJlRGlzYWJsZWQuZm9yRWFjaChpdGVtID0+IHtcclxuICAgICAgbGV0IHJhbmdlID0gaXRlbS5xdWVyeVNlbGVjdG9yKCcuanMtcmFuZ2UnKTtcclxuICAgICAgaXRlbS5jbGFzc0xpc3QuYWRkKCdkaXNhYmxlZCcpO1xyXG4gICAgICByYW5nZS5ub1VpU2xpZGVyLnNldCgwKTtcclxuICAgIH0pO1xyXG4gIH0gZWxzZSB7XHJcbiAgICByYW5nZXNDYW5CZURpc2FibGVkLmZvckVhY2goaXRlbSA9PiB7XHJcbiAgICAgIGl0ZW0uY2xhc3NMaXN0LnJlbW92ZSgnZGlzYWJsZWQnKTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgb3V0cHV0UHJpY2UudGV4dENvbnRlbnQgPSBhbGJ1bVByaWNlO1xyXG4gIG91dHB1dERpc2NvdW50UHJpY2UudGV4dENvbnRlbnQgPSBhbGJ1bVByaWNlV2l0aERpc2NvdW50O1xyXG4gIHR5cGVPdXRwdXQudGV4dENvbnRlbnQgPSBhY3RpdmVDaG9pY2UucXVlcnlTZWxlY3RvcignLmNhbGN1bGF0ZS10eXBlc19fdGl0bGUnKS50ZXh0Q29udGVudDtcclxuICBsaXN0c091dHB1dC50ZXh0Q29udGVudCA9IGFsYnVtTGlzdHM7XHJcbiAgYWxidW1zT3V0cHV0LnRleHRDb250ZW50ID0gYWxidW1zO1xyXG4gIHBlcnNhbnRhZ2VPdXRwdXQudGV4dENvbnRlbnQgPSBwZXJjZW50YWdlICsgJyUnO1xyXG4gIGRpc2NvdW50U3VtbU91dHB1dC50ZXh0Q29udGVudCA9IChhbGJ1bXMgKiBhbGJ1bVByaWNlV2l0aERpc2NvdW50KSArICcg4oK9JztcclxuXHJcbiAgd2luZG93LmNhbGNEYXRhID0gYNCS0LjQtCDQsNC70YzQsdC+0LzQsDogJHt0eXBlT3V0cHV0LnRleHRDb250ZW50fSxcXG4g0JrQvtC70LjRh9C10YHRgtCy0L4g0YHRgtGA0LDQvdC40YY6ICR7YWxidW1MaXN0c30sXFxuINCa0L7Qu9C40YfQtdGB0YLQstC+INCw0LvRjNCx0L7QvNC+0LI6ICR7YWxidW1zfSxcXG4g0JrQvtC70LjRh9C10YHRgtCy0L4g0LLRi9C/0YPRgdC60L3QuNC60L7QsiDQsiDQsNC70YzQsdC+0LzQtTogJHtwZW9wbGVzfSxcXG4g0JrQvtC70LjRh9C10YHRgtCy0L4g0YfQtdC70L7QstC10Log0L3QsCDQvtC00L3QvtC8INGA0LDQt9Cy0L7RgNC+0YLQtTogJHtwZW9wbGVzT25UdXJufSxcXG4g0JrQvtC70LjRh9C10YHRgtCy0L7QstC+INGA0LDQt9Cy0L7RgNC+0YLQvtCyINGBINGE0L7RgtC+0LjRgdGC0L7RgNC40LXQuTogJHtoaXN0b3J5VHVybnN9LFxcbiDQptC10L3QsCDQt9CwINCw0LvRjNCx0L7QvDogJHthbGJ1bVByaWNlfSxcXG4g0KHQutC40LTQutCwOiAke3BlcmNlbnRhZ2UgKyAnJSd9LFxcbiDQmNGC0L7Qs9C+0LLQsNGPINGB0YLQvtC40LzQvtGB0YLRjCDQsNC70YzQsdC+0LzQvtCyOiAkeyhhbGJ1bXMgKiBhbGJ1bVByaWNlV2l0aERpc2NvdW50KSArICcg4oK9J307YFxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRCYXNlUHJpY2UoYXJyKSB7XHJcbiAgaWYgKCBhcnIubGVuZ3RoICkge1xyXG4gICAgZm9yIChjb25zdCBpdGVtIG9mIGFycikge1xyXG4gICAgICBpZiAoIGl0ZW0uY2hlY2tlZCApIHtcclxuICAgICAgICByZXR1cm4gaXRlbTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0UHJpY2VGb3JBbGJ1bShiYXNlUHJpY2UsIGFsYnVtTGlzdHMsIGJhc2VMaXN0cywgYmFzZVR1cm5QcmljZSkge1xyXG4gIGxldCBzb21lID0gMDtcclxuXHJcbiAgaWYgKCBhbGJ1bUxpc3RzIC0gYmFzZUxpc3RzID4gMCApIHtcclxuICAgIHNvbWUgPSBhbGJ1bUxpc3RzIC0gYmFzZUxpc3RzO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIGJhc2VQcmljZSArIHNvbWUgKiBiYXNlVHVyblByaWNlO1xyXG59XHJcblxyXG5mdW5jdGlvbiBnZXREaXNjb3VudFBlcmNlbnQoYWxidW1zKSB7XHJcbiAgaWYgKCBhbGJ1bXMgPCA1ICkge1xyXG4gICAgcmV0dXJuIDA7XHJcbiAgfVxyXG5cclxuICBpZiAoIGFsYnVtcyA+IDIwICkge1xyXG4gICAgcmV0dXJuIDIwO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIGFsYnVtcztcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0UHJpY2VGb3JBbGJ1bURpc2NvdW50KGFsYnVtUHJpY2UsIGRpc2NvdW50U3VtbSkge1xyXG4gIHJldHVybiBhbGJ1bVByaWNlIC0gZGlzY291bnRTdW1tO1xyXG59XHJcblxyXG5mdW5jdGlvbiBnZXREaXNjb3VudFN1bW0oYWxidW1QcmljZSwgcGVyY2VudGFnZSkge1xyXG4gIHJldHVybiBNYXRoLmNlaWwoYWxidW1QcmljZSAqIHBlcmNlbnRhZ2UgLyAxMDApO1xyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRMaXN0SW5BbGJ1bShwZW9wbGVzLCBwZW9wbGVzT25UdXJuLCBoaXN0b3J5VHVybnMsIGJhc2VUdXJuKSB7XHJcbiAgcmV0dXJuIE1hdGguY2VpbChwZW9wbGVzIC8gcGVvcGxlc09uVHVybikgKyBoaXN0b3J5VHVybnMgKyBiYXNlVHVybjtcclxufVxyXG5cclxuZnVuY3Rpb24gY3JlYXRlQ2hlY2ttYXJrKHRleHQsIGZpcnN0LCBiYXNlUHJpY2UpIHtcclxuICBsZXQgY2hlY2ttYXJrV3JhcHBlcjtcclxuICBsZXQgY2hlY2ttYXJrID0gY3JlYXRlRWxlbWVudCgnbGFiZWwnLCAnY2hlY2ttYXJrJyk7XHJcbiAgbGV0IGlucHV0ID0gY3JlYXRlRWxlbWVudCgnaW5wdXQnLCAnJyk7XHJcbiAgc2V0QXR0cmlidXRlcyhpbnB1dCwge1xyXG4gICAgJ3R5cGUnOiAncmFkaW8nLFxyXG4gICAgJ25hbWUnOiAndHlwZXMnXHJcbiAgfSk7XHJcbiAgbGV0IG1hcmsgPSBjcmVhdGVFbGVtZW50KCdzcGFuJywgJ2NoZWNrbWFya19fbWFyaycpO1xyXG4gIGxldCB2YXJUZXh0ID0gY3JlYXRlRWxlbWVudCgncCcsICcnKTtcclxuXHJcbiAgaW5wdXQuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgZnVuY3Rpb24oKSB7XHJcbiAgICBjaGFuZ2VQcmljZUhhbmRsZSgpO1xyXG4gIH0pO1xyXG5cclxuICBpZiAoIGZpcnN0ICkge1xyXG4gICAgY2hlY2ttYXJrV3JhcHBlciA9IGNyZWF0ZUVsZW1lbnQoJ2RpdicsICdjb2wtMTInKTtcclxuICB9IGVsc2Uge1xyXG4gICAgY2hlY2ttYXJrV3JhcHBlciA9IGNyZWF0ZUVsZW1lbnQoJ2RpdicsICdjb2wtMTIgbXQtMycpO1xyXG4gIH1cclxuXHJcbiAgaW5wdXQuZGF0YXNldC5iYXNlUHJpY2UgPSBiYXNlUHJpY2UgPyBiYXNlUHJpY2UgOiAwO1xyXG4gIHZhclRleHQudGV4dENvbnRlbnQgPSB0ZXh0O1xyXG4gIGNoZWNrbWFyay5hcHBlbmRDaGlsZChpbnB1dCk7XHJcbiAgY2hlY2ttYXJrLmFwcGVuZENoaWxkKG1hcmspO1xyXG4gIGNoZWNrbWFyay5hcHBlbmRDaGlsZCh2YXJUZXh0KTtcclxuICBjaGVja21hcmtXcmFwcGVyLmFwcGVuZENoaWxkKGNoZWNrbWFyayk7XHJcblxyXG4gIHJldHVybiBjaGVja21hcmtXcmFwcGVyO1xyXG59XHJcblxyXG5mdW5jdGlvbiBjcmVhdGVFbGVtZW50KHRhZywgY2xhc3NOYW1lKSB7XHJcbiAgbGV0IGVsZW0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KHRhZyk7XHJcbiAgZWxlbS5jbGFzc0xpc3QgPSBjbGFzc05hbWU7XHJcblxyXG4gIHJldHVybiBlbGVtO1xyXG59XHJcblxyXG5mdW5jdGlvbiBzZXRBdHRyaWJ1dGVzKGVsLCBhdHRycykge1xyXG4gIGZvcih2YXIga2V5IGluIGF0dHJzKSB7XHJcbiAgICBlbC5zZXRBdHRyaWJ1dGUoa2V5LCBhdHRyc1trZXldKTtcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNhcmRIZWFkZXJIYW5kbGUobW9kYWxTd2lwZXIsIHVybCkge1xyXG4gIGxldCB0YXJnZXRzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmpzLW1vZGFsLWluaXQuanMtbW9kYWwtc2xpZGVyJyk7XHJcblxyXG4gIGlmICggdGFyZ2V0cy5sZW5ndGggKSB7XHJcbiAgICB0YXJnZXRzLmZvckVhY2godGFyZ2V0ID0+IHtcclxuICAgICAgbGV0IHRhcmdldElkID0gdGFyZ2V0LmRhdGFzZXQuaWQ7XHJcbiAgICAgIHRhcmdldC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGdldFNsaWRlcnNEYXRhKG1vZGFsU3dpcGVyLCBgJHt1cmwgKyB0YXJnZXRJZH1gKTtcclxuICAgICAgfSk7XHJcbiAgICB9KTtcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldFNsaWRlcnNEYXRhKG1vZGFsU3dpcGVyLCB1cmwpIHtcclxuICBsZXQgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XHJcbiAgeGhyLm9wZW4oJ0dFVCcsIHVybCk7XHJcbiAgeGhyLnNlbmQoKTtcclxuXHJcbiAgaWYgKCAhbW9kYWxTd2lwZXIgKSB7XHJcbiAgICByZXR1cm47XHJcbiAgfVxyXG5cclxuICB4aHIub25sb2FkID0gZnVuY3Rpb24oKSB7XHJcbiAgICBpZiAoeGhyLnN0YXR1cyAhPSAyMDApIHtcclxuICAgICAgY29uc29sZS5sb2coYNCe0YjQuNCx0LrQsCAke3hoci5zdGF0dXN9OiAke3hoci5zdGF0dXNUZXh0fWApO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgbGV0IGRhdGEgPSBKU09OLnBhcnNlKHhoci5yZXNwb25zZSk7XHJcbiAgICAgIG1vZGFsU3dpcGVyLnJlbW92ZUFsbFNsaWRlcygpO1xyXG5cclxuICAgICAgZGF0YS5mb3JFYWNoKGl0ZW0gPT4ge1xyXG4gICAgICAgIGxldCBzbGlkZUNvbnRlbnQgPSBjcmVhdGVTbGlkZShpdGVtKTtcclxuICAgICAgICBtb2RhbFN3aXBlci5hcHBlbmRTbGlkZShzbGlkZUNvbnRlbnQpO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgIG1vZGFsU3dpcGVyLnVwZGF0ZSgpO1xyXG4gICAgICB9LCAxMDApO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIHhoci5vbmVycm9yID0gZnVuY3Rpb24oKSB7XHJcbiAgICBjb25zb2xlLmxvZyhcItCX0LDQv9GA0L7RgSDQvdC1INGD0LTQsNC70YHRj1wiKTtcclxuICB9O1xyXG59XHJcblxyXG5mdW5jdGlvbiBjcmVhdGVTbGlkZShzdHIpIHtcclxuICBsZXQgaW1nID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW1nJyk7XHJcbiAgbGV0IHNsaWRlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgc2xpZGUuY2xhc3NMaXN0LmFkZCgnc3dpcGVyLXNsaWRlJywgJ21haW4tc2xpZGVyX19zbGlkZScpO1xyXG4gIGltZy5zcmMgPSBzdHI7XHJcbiAgc2xpZGUuYXBwZW5kQ2hpbGQoaW1nKTtcclxuXHJcbiAgcmV0dXJuIHNsaWRlO1xyXG59XHJcblxyXG5mdW5jdGlvbiB2YWxpZGF0ZUZyb20oKSB7XHJcbiAgbGV0IGZvcm1zID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmpzLWZvcm0tdmFsaWRhdGUnKTtcclxuXHJcbiAgaWYgKCBmb3Jtcy5sZW5ndGggKSB7XHJcbiAgICBmb3IgKGNvbnN0IGZvcm0gb2YgZm9ybXMpIHtcclxuICAgICAgbGV0IGZpZWxkcyA9IGZvcm0ucXVlcnlTZWxlY3RvckFsbCgnLmpzLWZvcm0tdmFsaWRhdGUtaW5wdXQgaW5wdXQnKTtcclxuICAgICAgbGV0IGZpbGUgPSBmb3JtLnF1ZXJ5U2VsZWN0b3IoJy5qcy1jYWxjdWxhdGUtZmlsZS1pbnB1dCcpO1xyXG4gICAgICBsZXQgdmFsaWRGb3JtID0gZmFsc2U7XHJcblxyXG4gICAgICBmb3IgKGNvbnN0IGZpZWxkIG9mIGZpZWxkcykge1xyXG4gICAgICAgIGZpZWxkLmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgaWYgKCAhdmFsaWRhdGVGaWVsZChmaWVsZCkgKSB7XHJcbiAgICAgICAgICAgIGZpZWxkLmNsYXNzTGlzdC5hZGQoJ2hhcy1lcnJvcicpO1xyXG4gICAgICAgICAgICB2YWxpZEZvcm0gPSBmYWxzZTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGZpZWxkLmNsYXNzTGlzdC5yZW1vdmUoJ2hhcy1lcnJvcicpO1xyXG4gICAgICAgICAgICB2YWxpZEZvcm0gPSB0cnVlO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBmb3JtLmFkZEV2ZW50TGlzdGVuZXIoJ3N1Ym1pdCcsIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcblxyXG4gICAgICAgIGZvciAoY29uc3QgZmllbGQgb2YgZmllbGRzKSB7XHJcbiAgICAgICAgICBpZiAoICF2YWxpZGF0ZUZpZWxkKGZpZWxkKSApIHtcclxuICAgICAgICAgICAgZmllbGQuY2xhc3NMaXN0LmFkZCgnaGFzLWVycm9yJyk7XHJcbiAgICAgICAgICAgIHZhbGlkRm9ybSA9IGZhbHNlO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgZmllbGQuY2xhc3NMaXN0LnJlbW92ZSgnaGFzLWVycm9yJyk7XHJcbiAgICAgICAgICAgIHZhbGlkRm9ybSA9IHRydWU7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIHZhbGlkRm9ybSApIHtcclxuICAgICAgICAgIGxldCBmb3JtRGF0YSA9IG5ldyBGb3JtRGF0YShmb3JtKTtcclxuXHJcbiAgICAgICAgICBpZiAoIGZpbGUgKSB7XHJcbiAgICAgICAgICAgIGZvcm1EYXRhLmFwcGVuZCgnZmlsZScsIGZpbGUuZmlsZXNbMF0pO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIGlmICggZm9ybS5jbGFzc0xpc3QuY29udGFpbnMoJ2pzLWZvcm0tY2FsYycpICkge1xyXG4gICAgICAgICAgICBmb3JtRGF0YS5hcHBlbmQoJ2RhdGEnLCB3aW5kb3cuY2FsY0RhdGEpO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIGxldCBzdWNjZXNzID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGZvcm0uY2xhc3NMaXN0LmFkZCgnc3VjY2VzcycpO1xyXG4gICAgICAgICAgICByZXNldEZvcm0oZm9ybSwgZm9ybURhdGEpO1xyXG4gICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICBzZW5kRGF0YShmb3JtRGF0YSwgJy9zZW5kX21lc3NhZ2UnLCBzdWNjZXNzKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgY29uc29sZS5sb2coJ3VudmFsaWQgZm9ybScpO1xyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgfSlcclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHJlc2V0Rm9ybShmb3JtLCBmb3JtZGF0YSkge1xyXG4gIGxldCBidG5zID0gZm9ybS5xdWVyeVNlbGVjdG9yQWxsKCcuanMtZm9ybS1jYWxjLXJlc2V0Jyk7XHJcbiAgbGV0IGZpbGVSZW1vdmVyID0gZm9ybS5xdWVyeVNlbGVjdG9yKCcuanMtY2FsY3VsYXRlLWZpbGUtcmVtb3ZlcicpO1xyXG5cclxuICBpZiAoIGJ0bnMubGVuZ3RoICkge1xyXG4gICAgZm9yIChjb25zdCBidG4gb2YgYnRucykge1xyXG4gICAgICBidG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbigpIHtcclxuICAgICAgICBmb3IgKHZhciBwYWlyIG9mIGZvcm1kYXRhLmVudHJpZXMoKSkge1xyXG4gICAgICAgICAgZm9ybWRhdGEuZGVsZXRlKHBhaXJbMF0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZm9ybS5yZXNldCgpO1xyXG4gICAgICAgIGZvcm0uY2xhc3NMaXN0LnJlbW92ZSgnc3VjY2VzcycpO1xyXG5cclxuICAgICAgICBpZiAoIGZpbGVSZW1vdmVyICkge1xyXG4gICAgICAgICAgZmlsZVJlbW92ZXIuY2xpY2soKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gdmFsaWRhdGVGaWVsZChpbnB1dCkge1xyXG4gIGxldCB2YWx1ZSA9IGlucHV0LnZhbHVlO1xyXG4gIGxldCB0eXBlID0gaW5wdXQudHlwZTtcclxuICBsZXQgcmVzdWx0ID0gZmFsc2U7XHJcblxyXG4gIGlmICggdHlwZSA9PSAndGVsJyApIHtcclxuICAgIHJlc3VsdCA9IHZhbGlkYXRlUGhvbmUodmFsdWUpO1xyXG4gIH0gZWxzZSBpZiAoIHR5cGUgPT0gJ2VtYWlsJyApIHtcclxuICAgIHJlc3VsdCA9IHZhbGlkYXRlTWFpbCh2YWx1ZSk7XHJcbiAgfSBlbHNlIHtcclxuICAgIHJlc3VsdCA9ICFpc0VtcHR5KHZhbHVlKTtcclxuICB9XHJcblxyXG4gIHJldHVybiByZXN1bHQ7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGlzRW1wdHkoc3RyKSB7XHJcbiAgcmV0dXJuIHN0ciA9PSAnJyAmJiB0cnVlO1xyXG59XHJcblxyXG5mdW5jdGlvbiB2YWxpZGF0ZVBob25lKHN0cikge1xyXG4gIGxldCByZWcgPSAvXltcXCtdP1soXT9bMC05XXszfVspXT9bLVxcc1xcLl0/WzAtOV17M31bLVxcc1xcLl0/WzAtOV17NCw2fSQvaW07XHJcbiAgcmV0dXJuIHRlc3RSZWcocmVnLCByZW1vdmVTcGFjZXMoc3RyKSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHZhbGlkYXRlTWFpbChzdHIpIHtcclxuICBsZXQgcmVzdWx0ID0gZmFsc2U7XHJcbiAgY29uc3QgcmVnID0gL14oKFtePD4oKVtcXF1cXFxcLiw7Olxcc0BcXFwiXSsoXFwuW148PigpW1xcXVxcXFwuLDs6XFxzQFxcXCJdKykqKXwoXFxcIi4rXFxcIikpQCgoXFxbWzAtOV17MSwzfVxcLlswLTldezEsM31cXC5bMC05XXsxLDN9XFwuWzAtOV17MSwzfVxcXSl8KChbYS16QS1aXFwtMC05XStcXC4pK1thLXpBLVpdezIsfSkpJC87XHJcbiAgcmVzdWx0ID0gdGVzdFJlZyhyZWcsIHN0cilcclxuICByZXR1cm4gcmVzdWx0O1xyXG59XHJcblxyXG5mdW5jdGlvbiByZW1vdmVTcGFjZXMoc3RyKSB7XHJcbiAgcmV0dXJuIHN0ci5yZXBsYWNlKC9cXHMvZywgJycpOztcclxufVxyXG5cclxuZnVuY3Rpb24gdGVzdFJlZyhyZSwgc3RyKXtcclxuICBpZiAocmUudGVzdChzdHIpKSB7XHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuICB9IGVsc2Uge1xyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gc2VuZERhdGEoZGF0YSwgdXJsLCBzdWNjZXNzKSB7XHJcbiAgaWYgKCAhZGF0YSB8fCAhdXJsICkge1xyXG4gICAgcmV0dXJuIGNvbnNvbGUubG9nKCdlcnJvciwgaGF2ZSBubyBkYXRhIG9yIHVybCcpO1xyXG4gIH1cclxuXHJcbiAgbGV0IHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xyXG5cclxuICB4aHIub25sb2FkZW5kID0gZnVuY3Rpb24oKSB7XHJcbiAgICBpZiAoeGhyLnN0YXR1cyA9PSAyMDApIHtcclxuICAgICAgbGV0IHN1Y2Nlc3NGdSA9IHN1Y2Nlc3M7XHJcblxyXG4gICAgICBzdWNjZXNzRnUoKTtcclxuICAgICAgY29uc29sZS5sb2coXCLQo9GB0L/QtdGFXCIpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgY29uc29sZS5sb2coXCLQntGI0LjQsdC60LAgXCIgKyB0aGlzLnN0YXR1cyk7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgeGhyLm9wZW4oXCJQT1NUXCIsIHVybCk7XHJcbiAgeGhyLnNlbmQoZGF0YSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGluaXRNb2RhbChtb2RhbFN3aXBlcikge1xyXG4gIGxldCBpbml0cyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy1tb2RhbC1pbml0Jyk7XHJcbiAgbGV0IGJvZHkgPSBkb2N1bWVudC5ib2R5O1xyXG5cclxuICBpZiAoIGluaXRzLmxlbmd0aCApIHtcclxuICAgIGZvciAoY29uc3QgaW5pdCBvZiBpbml0cykge1xyXG4gICAgICBsZXQgdGFyZ2V0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcihpbml0LmRhdGFzZXQudGFyZ2V0KTtcclxuICAgICAgbGV0IGNsb3NlcyA9IHRhcmdldC5xdWVyeVNlbGVjdG9yQWxsKCcuanMtbW9kYWwtY2xvc2UnKTtcclxuXHJcbiAgICAgIGlmICggdGFyZ2V0ICkge1xyXG4gICAgICAgIGlmICggY2xvc2VzLmxlbmd0aCApIHtcclxuICAgICAgICAgIGZvciAoY29uc3QgY2xvc2Ugb2YgY2xvc2VzKSB7XHJcbiAgICAgICAgICAgIGNsb3NlLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgdGFyZ2V0LmNsYXNzTGlzdC5yZW1vdmUoJ2lzLWFjdGl2ZScpO1xyXG4gICAgICAgICAgICAgIGJvZHkuY2xhc3NMaXN0LnJlbW92ZSgnbW9kYWwtaXMtYWN0aXZlJyk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaW5pdC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgdGFyZ2V0LmNsYXNzTGlzdC5hZGQoJ2lzLWFjdGl2ZScpO1xyXG4gICAgICAgICAgYm9keS5jbGFzc0xpc3QuYWRkKCdtb2RhbC1pcy1hY3RpdmUnKTtcclxuXHJcbiAgICAgICAgICBpZiAoIHRhcmdldC5kYXRhc2V0LnNsaWRlciA9PSAndHJ1ZScgKSB7XHJcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICAgIG1vZGFsU3dpcGVyLnVwZGF0ZSgpO1xyXG4gICAgICAgICAgICB9LCAxMDApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBpbml0RHJhZ05Ecm9wKCkge1xyXG4gIGxldCBjb250YWluZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtY2FsY3VsYXRlLWZpbGUnKTtcclxuICBsZXQgZHJvcEFyZWEgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtY2FsY3VsYXRlLWZpbGUtZHJvcGFyZWEnKTtcclxuICBsZXQgZmlsZUVsZW0gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtY2FsY3VsYXRlLWZpbGUtaW5wdXQnKTtcclxuICBsZXQgYWRkaW5ncyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy1jYWxjdWxhdGUtZmlsZS1hZGRpbmdzJyk7XHJcbiAgbGV0IGZpbGVOYW1lID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLWNhbGN1bGF0ZS1maWxlLW5hbWUnKTtcclxuICBsZXQgcmVtb3ZlciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy1jYWxjdWxhdGUtZmlsZS1yZW1vdmVyJyk7XHJcblxyXG4gIGlmICggIWNvbnRhaW5lciAmJiAhZHJvcEFyZWEgJiYgIWZpbGVFbGVtICYmICFhZGRpbmdzICYmICFmaWxlTmFtZSAmJiAhcmVtb3ZlciApIHtcclxuICAgIHJldHVybjtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIHByZXZlbnREZWZhdWx0cyAoZSkge1xyXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcclxuICB9O1xyXG5cclxuICBmdW5jdGlvbiBoaWdobGlnaHQoKSB7XHJcbiAgICBjb250YWluZXIuY2xhc3NMaXN0LmFkZCgnaGlnaGxpZ2h0Jyk7XHJcbiAgfTtcclxuXHJcbiAgZnVuY3Rpb24gdW5oaWdobGlnaHQoKSB7XHJcbiAgICBjb250YWluZXIuY2xhc3NMaXN0LnJlbW92ZSgnaGlnaGxpZ2h0Jyk7XHJcbiAgfTtcclxuXHJcbiAgZnVuY3Rpb24gaGFuZGxlRmlsZXMoZmlsZXMpIHtcclxuICAgIGFkZGluZ3MuY2xhc3NMaXN0LmFkZCgnaXMtc2hvdycpO1xyXG4gICAgY29udGFpbmVyLmNsYXNzTGlzdC5hZGQoJ2hhcy1yZXN1bHQnKTtcclxuICAgIGZpbGVOYW1lLnRleHRDb250ZW50ID0gZmlsZXNbMF0ubmFtZTtcclxuICB9O1xyXG5cclxuICBmdW5jdGlvbiBoYW5kbGVSZW1vdmVGaWxlcygpIHtcclxuICAgIGFkZGluZ3MuY2xhc3NMaXN0LnJlbW92ZSgnaXMtc2hvdycpO1xyXG4gICAgY29udGFpbmVyLmNsYXNzTGlzdC5yZW1vdmUoJ2hhcy1yZXN1bHQnKTtcclxuICAgIGZpbGVOYW1lLnRleHRDb250ZW50ID0gJyc7XHJcbiAgICBmaWxlRWxlbS52YWx1ZSA9ICcnO1xyXG4gIH07XHJcblxyXG4gIGZ1bmN0aW9uIGhhbmRsZURyb3AoZSkge1xyXG4gICAgbGV0IGR0ID0gZS5kYXRhVHJhbnNmZXI7XHJcbiAgICBsZXQgZmlsZXMgPSBkdC5maWxlcztcclxuXHJcbiAgICBpZiAoIFZhbGlkYXRlKHRoaXMpICkge1xyXG4gICAgICBoYW5kbGVGaWxlcyhmaWxlcyk7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgZmlsZUVsZW0uYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgZnVuY3Rpb24oKSB7XHJcbiAgICBpZiAoIFZhbGlkYXRlKHRoaXMpICkge1xyXG4gICAgICBoYW5kbGVGaWxlcyh0aGlzLmZpbGVzKTtcclxuICAgIH1cclxuICB9KTtcclxuXHJcbiAgcmVtb3Zlci5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKCkge1xyXG4gICAgaGFuZGxlUmVtb3ZlRmlsZXMoKTtcclxuICB9KTtcclxuXHJcbiAgWydkcmFnZW50ZXInLCAnZHJhZ292ZXInLCAnZHJhZ2xlYXZlJywgJ2Ryb3AnXS5mb3JFYWNoKGV2ZW50TmFtZSA9PiB7XHJcbiAgICBkcm9wQXJlYS5hZGRFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgcHJldmVudERlZmF1bHRzLCBmYWxzZSk7XHJcbiAgfSk7XHJcblxyXG4gIFsnZHJhZ2VudGVyJywgJ2RyYWdvdmVyJ10uZm9yRWFjaChldmVudE5hbWUgPT4ge1xyXG4gICAgZHJvcEFyZWEuYWRkRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIGhpZ2hsaWdodCwgZmFsc2UpO1xyXG4gIH0pO1xyXG4gIFxyXG4gIFsnZHJhZ2xlYXZlJywgJ2Ryb3AnXS5mb3JFYWNoKGV2ZW50TmFtZSA9PiB7XHJcbiAgICBkcm9wQXJlYS5hZGRFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgdW5oaWdobGlnaHQsIGZhbHNlKTtcclxuICB9KTtcclxuXHJcbiAgZHJvcEFyZWEuYWRkRXZlbnRMaXN0ZW5lcignZHJvcCcsIGhhbmRsZURyb3AsIGZhbHNlKTtcclxuXHJcbiAgdmFyIF92YWxpZEZpbGVFeHRlbnNpb25zID0gWycuemlwJywgJy5yYXInXTtcclxuXHJcbiAgZnVuY3Rpb24gVmFsaWRhdGUoaW5wdXQpIHtcclxuICAgIHZhciBzRmlsZU5hbWUgPSBpbnB1dC52YWx1ZTtcclxuXHJcbiAgICBpZiAoc0ZpbGVOYW1lLmxlbmd0aCA+IDApIHtcclxuICAgICAgdmFyIGJsblZhbGlkID0gZmFsc2U7XHJcbiAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgX3ZhbGlkRmlsZUV4dGVuc2lvbnMubGVuZ3RoOyBqKyspIHtcclxuICAgICAgICB2YXIgc0N1ckV4dGVuc2lvbiA9IF92YWxpZEZpbGVFeHRlbnNpb25zW2pdO1xyXG4gICAgICAgIGlmIChzRmlsZU5hbWUuc3Vic3RyKHNGaWxlTmFtZS5sZW5ndGggLSBzQ3VyRXh0ZW5zaW9uLmxlbmd0aCwgc0N1ckV4dGVuc2lvbi5sZW5ndGgpLnRvTG93ZXJDYXNlKCkgPT0gc0N1ckV4dGVuc2lvbi50b0xvd2VyQ2FzZSgpKSB7XHJcbiAgICAgICAgICBibG5WYWxpZCA9IHRydWU7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmICghYmxuVmFsaWQpIHtcclxuICAgICAgICBjb250YWluZXIuY2xhc3NMaXN0LmFkZCgnaGFzLWVycm9yJyk7XHJcblxyXG4gICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICBjb250YWluZXIuY2xhc3NMaXN0LnJlbW92ZSgnaGFzLWVycm9yJyk7XHJcbiAgICAgICAgfSwgMjAwMClcclxuXHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHRydWU7XHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBpbml0UmFuZ2UoKSB7XHJcbiAgdmFyIHNsaWRlcnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuanMtcmFuZ2UnKTtcclxuXHJcbiAgaWYgKCBzbGlkZXJzLmxlbmd0aCApIHtcclxuICAgIGZvciAoY29uc3Qgc2xpZGVyIG9mIHNsaWRlcnMpIHtcclxuICAgICAgbGV0IHNsaWRlclJhbmdlO1xyXG4gICAgICBsZXQgc2xpZGVyTWluID0gTnVtYmVyKHNsaWRlci5kYXRhc2V0Lm1pbik7XHJcbiAgICAgIGxldCBzbGlkZXJNYXggPSBOdW1iZXIoc2xpZGVyLmRhdGFzZXQubWF4KTtcclxuICAgICAgbGV0IHNsaWRlclN0ZXAgPSBOdW1iZXIoc2xpZGVyLmRhdGFzZXQuc3RlcCk7XHJcbiAgICAgIGxldCBzbGlkZXJQaXBzID0gTnVtYmVyKHNsaWRlci5kYXRhc2V0LnBpcHMpO1xyXG5cclxuICAgICAgaWYgKCBzbGlkZXIuZGF0YXNldC5pbmRpdmlkdWFsICkge1xyXG4gICAgICAgIHNsaWRlclJhbmdlID0ge1xyXG4gICAgICAgICAgJ21pbic6IFsxXSxcclxuICAgICAgICAgICcxMCUnOiBbMiwgMl0sXHJcbiAgICAgICAgICAnbWF4JzogWzhdXHJcbiAgICAgICAgfTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBzbGlkZXJSYW5nZSA9IHtcclxuICAgICAgICAgICdtaW4nOiBzbGlkZXJNaW4sXHJcbiAgICAgICAgICAnbWF4Jzogc2xpZGVyTWF4XHJcbiAgICAgICAgfTtcclxuICAgICAgfVxyXG5cclxuICAgICAgbm9VaVNsaWRlci5jcmVhdGUoc2xpZGVyLCB7XHJcbiAgICAgICAgc3RhcnQ6IFswXSxcclxuICAgICAgICBzdGVwOiBzbGlkZXJTdGVwLFxyXG4gICAgICAgIHJhbmdlOiBzbGlkZXJSYW5nZSxcclxuICAgICAgICBjb25uZWN0OiAnbG93ZXInLFxyXG4gICAgICAgIHRvb2x0aXBzOiB0cnVlLFxyXG4gICAgICAgIGZvcm1hdDogd051bWIoe1xyXG4gICAgICAgICAgZGVjaW1hbHM6IDMsXHJcbiAgICAgICAgICB0aG91c2FuZDogJy4nLFxyXG4gICAgICAgIH0pLFxyXG4gICAgICAgIHBpcHM6IHtcclxuICAgICAgICAgIG1vZGU6ICdjb3VudCcsXHJcbiAgICAgICAgICB2YWx1ZXM6IHNsaWRlclBpcHMsXHJcbiAgICAgICAgICBzdGVwcGVkOiBmYWxzZVxyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcblxyXG4gICAgICBsZXQgbWluaU1hcmtlcnMgPSBzbGlkZXIucXVlcnlTZWxlY3RvckFsbCgnLm5vVWktbWFya2VyLWhvcml6b250YWwubm9VaS1tYXJrZXInKTtcclxuXHJcbiAgICAgIGlmICggbWluaU1hcmtlcnMubGVuZ3RoICkge1xyXG4gICAgICAgIGZvciAoIGNvbnN0IG1pbmlNYXJrZXIgb2YgbWluaU1hcmtlcnMgKSB7XHJcbiAgICAgICAgICBtaW5pTWFya2VyLnJlbW92ZSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gaW5pdEhlYWRlclRvZ2dsZXIoKSB7XHJcbiAgbGV0IHRvZ2dsZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtaGVhZGVyLXRvZ2dsZXInKTtcclxuICBsZXQgaGVhZGVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLWhlYWRlcicpO1xyXG4gIGxldCBwYWdlV3JhcCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy1wYWdlLXdyYXAnKTtcclxuICBsZXQgZGFya25lc3MgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtaGVhZGVyLWRhcmtuZXNzJyk7XHJcblxyXG4gIGlmICggdG9nZ2xlciAmJiBoZWFkZXIgJiYgcGFnZVdyYXAgJiYgZGFya25lc3MgKSB7XHJcbiAgICB0b2dnbGVyLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgIGhlYWRlci5jbGFzc0xpc3QudG9nZ2xlKCdpcy1vcGVuJyk7XHJcbiAgICAgIHRvZ2dsZXIuY2xhc3NMaXN0LnRvZ2dsZSgnaXMtYWN0aXZlJyk7XHJcbiAgICAgIHBhZ2VXcmFwLmNsYXNzTGlzdC50b2dnbGUoJ3Njcm9sbC1ibG9ja2VkLW1vYmlsZScpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgZGFya25lc3MuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbigpIHtcclxuICAgICAgaGVhZGVyLmNsYXNzTGlzdC5yZW1vdmUoJ2lzLW9wZW4nKTtcclxuICAgICAgdG9nZ2xlci5jbGFzc0xpc3QucmVtb3ZlKCdpcy1hY3RpdmUnKTtcclxuICAgICAgcGFnZVdyYXAuY2xhc3NMaXN0LnJlbW92ZSgnc2Nyb2xsLWJsb2NrZWQtbW9iaWxlJyk7XHJcbiAgICB9KTtcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGluaXRBbGJ1bXNDYXJkU2xpZGVyKCkge1xyXG4gIHZhciBteVN3aXBlciA9IG5ldyBTd2lwZXIoJy5qcy1hbGJ1bXMtY2FyZC1zbGlkZXInLCB7XHJcbiAgICBzcGVlZDogNDAwLFxyXG4gICAgc2xpZGVzUGVyVmlldzogMSxcclxuICAgIG5hdmlnYXRpb246IHtcclxuICAgICAgbmV4dEVsOiAnLnN3aXBlci1idXR0b24tbmV4dCcsXHJcbiAgICAgIHByZXZFbDogJy5zd2lwZXItYnV0dG9uLXByZXYnLFxyXG4gICAgfSxcclxuICB9KTtcclxuXHJcbiAgcmV0dXJuIG15U3dpcGVyO1xyXG59XHJcblxyXG5mdW5jdGlvbiBpbml0QWxidW1TbGlkZXIoKSB7XHJcbiAgdmFyIG15U3dpcGVyID0gbmV3IFN3aXBlcignLmpzLXN3aXBlci1hbGJ1bScsIHtcclxuICAgIHNwZWVkOiA0MDAsXHJcbiAgICBzbGlkZXNQZXJWaWV3OiAxLFxyXG4gICAgbG9vcDogZmFsc2UsXHJcbiAgICBwcmVsb2FkSW1hZ2VzOiBmYWxzZSxcclxuICAgIHNwYWNlQmV0d2VlbjogMTIsXHJcbiAgICBsYXp5OiB0cnVlLFxyXG4gICAgbmF2aWdhdGlvbjoge1xyXG4gICAgICBuZXh0RWw6ICcuc3dpcGVyLWJ1dHRvbi1uZXh0JyxcclxuICAgICAgcHJldkVsOiAnLnN3aXBlci1idXR0b24tcHJldicsXHJcbiAgICB9LFxyXG4gIH0pO1xyXG5cclxuICByZXR1cm4gbXlTd2lwZXI7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGluaXRTd2lwZXIoKSB7XHJcbiAgbGV0IHRhcmdldHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuanMtc3dpcGVyLWNvbnRhaW5lcicpO1xyXG5cclxuICBpZiAoICF0YXJnZXRzLmxlbmd0aCApIHtcclxuICAgIHJldHVybjtcclxuICB9XHJcblxyXG4gIGxldCBzd2lwZXJzID0gW107XHJcblxyXG4gIHRhcmdldHMuZm9yRWFjaCggKHRhcmdldCwgaW5kZXgpID0+IHtcclxuICAgIGlmICggaW5kZXggPT0gMCB8fCAhdGFyZ2V0LmNsYXNzTGlzdC5jb250YWlucygnc3dpcGVyLWNvbnRhaW5lci1mYXQnKSApIHtcclxuICAgICAgdmFyIG15U3dpcGVyID0gbmV3IFN3aXBlcih0YXJnZXQsIHtcclxuICAgICAgICBzcGVlZDogNDAwLFxyXG4gICAgICAgIHNsaWRlc1BlclZpZXc6IDYsXHJcbiAgICAgICAgc3BhY2VCZXR3ZWVuOiAzMCxcclxuICAgICAgICBsb29wOiBmYWxzZSxcclxuICAgICAgICBwcmVsb2FkSW1hZ2VzOiBmYWxzZSxcclxuICAgICAgICBsYXp5OiB0cnVlLCBcclxuICAgICAgICBuYXZpZ2F0aW9uOiB7XHJcbiAgICAgICAgICBuZXh0RWw6ICcuc3dpcGVyLWJ1dHRvbi1uZXh0JyxcclxuICAgICAgICAgIHByZXZFbDogJy5zd2lwZXItYnV0dG9uLXByZXYnLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgYnJlYWtwb2ludHM6IHtcclxuICAgICAgICAgIDQ1OToge1xyXG4gICAgICAgICAgICBzbGlkZXNQZXJWaWV3OiAxLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIDU5OToge1xyXG4gICAgICAgICAgICBzbGlkZXNQZXJWaWV3OiAyLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIDc2Nzoge1xyXG4gICAgICAgICAgICBzbGlkZXNQZXJWaWV3OiAzLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIDExOTk6IHtcclxuICAgICAgICAgICAgc2xpZGVzUGVyVmlldzogNCxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHZhciBteVN3aXBlciA9IG5ldyBTd2lwZXIodGFyZ2V0LCB7XHJcbiAgICAgICAgc3BlZWQ6IDQwMCxcclxuICAgICAgICBzbGlkZXNQZXJWaWV3OiA0LFxyXG4gICAgICAgIHNwYWNlQmV0d2VlbjogMzAsXHJcbiAgICAgICAgbG9vcDogZmFsc2UsXHJcbiAgICAgICAgcHJlbG9hZEltYWdlczogZmFsc2UsXHJcbiAgICAgICAgbGF6eTogdHJ1ZSwgXHJcbiAgICAgICAgbmF2aWdhdGlvbjoge1xyXG4gICAgICAgICAgbmV4dEVsOiAnLnN3aXBlci1idXR0b24tbmV4dCcsXHJcbiAgICAgICAgICBwcmV2RWw6ICcuc3dpcGVyLWJ1dHRvbi1wcmV2JyxcclxuICAgICAgICB9LFxyXG4gICAgICAgIGJyZWFrcG9pbnRzOiB7XHJcbiAgICAgICAgICA3Njc6IHtcclxuICAgICAgICAgICAgc2xpZGVzUGVyVmlldzogMSxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICAxMTk5OiB7XHJcbiAgICAgICAgICAgIHNsaWRlc1BlclZpZXc6IDIsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgc3dpcGVycy5wdXNoKG15U3dpcGVyKTtcclxuICB9KTtcclxuXHJcbiAgcmV0dXJuIHN3aXBlcnM7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGluaXRTd2lwZXJTdGF0aWNrKCkge1xyXG4gIHZhciBteVN3aXBlciA9IG5ldyBTd2lwZXIoJy5qcy1zd2lwZXItY29udGFpbmVyLXN0YXRpY2snLCB7XHJcbiAgICBzcGVlZDogNDAwLFxyXG4gICAgc2xpZGVzUGVyVmlldzogNixcclxuICAgIHNwYWNlQmV0d2VlbjogNDAsXHJcbiAgICBsb29wOiBmYWxzZSxcclxuICAgIHByZWxvYWRJbWFnZXM6IGZhbHNlLFxyXG4gICAgbGF6eTogdHJ1ZSxcclxuICAgIGZvbGxvd0ZpbmdlcjogZmFsc2UsXHJcbiAgICBicmVha3BvaW50czoge1xyXG4gICAgICA0NTk6IHtcclxuICAgICAgICBzbGlkZXNQZXJWaWV3OiAxLFxyXG4gICAgICB9LFxyXG4gICAgICA1OTk6IHtcclxuICAgICAgICBzbGlkZXNQZXJWaWV3OiAyLFxyXG4gICAgICB9LFxyXG4gICAgICA3Njc6IHtcclxuICAgICAgICBzbGlkZXNQZXJWaWV3OiAzLFxyXG4gICAgICB9LFxyXG4gICAgICAxMTk5OiB7XHJcbiAgICAgICAgc2xpZGVzUGVyVmlldzogNCxcclxuICAgICAgfSxcclxuICAgIH1cclxuICB9KTtcclxuXHJcbiAgcmV0dXJuIG15U3dpcGVyO1xyXG59XHJcblxyXG5mdW5jdGlvbiBpbml0TWFpblN3aXBlcigpIHtcclxuICB2YXIgbXlTd2lwZXIgPSBuZXcgU3dpcGVyKCcuanMtbWFpbi1zd2lwZXItY29udGFpbmVyJywge1xyXG4gICAgc3BlZWQ6IDQwMCxcclxuICAgIHNsaWRlc1BlclZpZXc6IDEsXHJcbiAgICBsb29wOiB0cnVlLFxyXG4gICAgc3BhY2VCZXR3ZWVuOiAxMixcclxuICAgIGF1dG9IZWlnaHQ6IHRydWUsXHJcbiAgICBwYWdpbmF0aW9uOiB7XHJcbiAgICAgIGVsOiAnLnN3aXBlci1wYWdpbmF0aW9uJyxcclxuICAgICAgdHlwZTogJ2J1bGxldHMnLFxyXG4gICAgICBjbGlja2FibGU6IHRydWVcclxuICAgIH0sXHJcbiAgICBuYXZpZ2F0aW9uOiB7XHJcbiAgICAgIG5leHRFbDogJy5qcy1zd2lwZXItbWFpbi1uZXh0JyxcclxuICAgICAgcHJldkVsOiAnLmpzLXN3aXBlci1tYWluLXByZXYnLFxyXG4gICAgfSxcclxuICB9KTtcclxuXHJcbiAgcmV0dXJuIG15U3dpcGVyO1xyXG59XHJcblxyXG5mdW5jdGlvbiBpbml0TW9kYWxTd2lwZXIoKSB7XHJcbiAgdmFyIG15U3dpcGVyID0gbmV3IFN3aXBlcignLmpzLW1haW4tc3dpcGVyLW1vZGFsJywge1xyXG4gICAgc3BlZWQ6IDQwMCxcclxuICAgIHNsaWRlc1BlclZpZXc6IDEsXHJcbiAgICBsb29wOiB0cnVlLFxyXG4gICAgc3BhY2VCZXR3ZWVuOiAxMixcclxuICAgIHByZWxvYWRJbWFnZXM6IGZhbHNlLFxyXG4gICAgbGF6eTogdHJ1ZSxcclxuICAgIGF1dG9IZWlnaHQ6IHRydWUsXHJcbiAgICBwYWdpbmF0aW9uOiB7XHJcbiAgICAgIGVsOiAnLnN3aXBlci1wYWdpbmF0aW9uJyxcclxuICAgICAgdHlwZTogJ2J1bGxldHMnLFxyXG4gICAgICBjbGlja2FibGU6IHRydWVcclxuICAgIH0sXHJcbiAgICBuYXZpZ2F0aW9uOiB7XHJcbiAgICAgIG5leHRFbDogJy5qcy1tb2RhbC1zd2lwZXItbmV4dCcsXHJcbiAgICAgIHByZXZFbDogJy5qcy1tb2RhbC1zd2lwZXItcHJldicsXHJcbiAgICB9LFxyXG4gIH0pO1xyXG5cclxuICByZXR1cm4gbXlTd2lwZXI7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGluaXRBbGJ1bXNUeXBlU2xpZGVyKCkge1xyXG4gIHZhciBteVN3aXBlciA9IG5ldyBTd2lwZXIoJy5qcy10eXBlLWFsYnVtcy1zd2lwZXInLCB7XHJcbiAgICBzcGVlZDogNDAwLFxyXG4gICAgc2xpZGVzUGVyVmlldzogJ2F1dG8nLFxyXG4gICAgc2xpZGVzT2Zmc2V0QWZ0ZXI6IDEwMCxcclxuICAgIHNwYWNlQmV0d2VlbjogMjQsXHJcbiAgICBuYXZpZ2F0aW9uOiB7XHJcbiAgICAgIG5leHRFbDogJy5zd2lwZXItYnV0dG9uLW5leHQnLFxyXG4gICAgICBwcmV2RWw6ICcuc3dpcGVyLWJ1dHRvbi1wcmV2JyxcclxuICAgIH0sXHJcbiAgICBvbjoge1xyXG4gICAgICBzbGlkZUNoYW5nZTogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGlmICggdGhpcy5hY3RpdmVJbmRleCA+IDAgKSB7XHJcbiAgICAgICAgICB0aGlzLmVsLmNsYXNzTGlzdC5hZGQoJ25vdC1vbi1zdGFydCcpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICB0aGlzLmVsLmNsYXNzTGlzdC5yZW1vdmUoJ25vdC1vbi1zdGFydCcpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgfSk7XHJcblxyXG4gIHJldHVybiBteVN3aXBlcjtcclxufVxyXG5cclxuZnVuY3Rpb24gaW5pdE1haW5DYXJkc1NsaWRlcigpIHtcclxuICB2YXIgbXlTd2lwZXIgPSBuZXcgU3dpcGVyKCcuanMtbWFpbi1jYXJkLXNsaWRlcicsIHtcclxuICAgIHNwZWVkOiA0MDAsXHJcbiAgICBzbGlkZXNQZXJWaWV3OiAxLFxyXG4gICAgbG9vcDogdHJ1ZSxcclxuICAgIHNwYWNlQmV0d2VlbjogMTIsXHJcbiAgICBuYXZpZ2F0aW9uOiB7XHJcbiAgICAgIG5leHRFbDogJy5zd2lwZXItYnV0dG9uLW5leHQnLFxyXG4gICAgICBwcmV2RWw6ICcuc3dpcGVyLWJ1dHRvbi1wcmV2JyxcclxuICAgIH0sXHJcbiAgfSk7XHJcblxyXG4gIHJldHVybiBteVN3aXBlcjtcclxufVxyXG5cclxuZnVuY3Rpb24gdGFiKHRhYkhhbmRsZXIpIHtcclxuICAgIGxldCB0YWJzQ29udGFpbmVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5qcy10YWItY29udGFpbmVyXCIpO1xyXG5cclxuICAgIGlmICggdGFic0NvbnRhaW5lciApIHtcclxuICAgICAgbGV0IG1lbnVJdGVtcyA9IHRhYnNDb250YWluZXIucXVlcnlTZWxlY3RvckFsbChcIi5qcy10YWItbWVudS1pdGVtXCIpO1xyXG5cclxuICAgICAgbWVudUl0ZW1zLmZvckVhY2goIChtZW51SXRlbSkgPT4ge1xyXG5cclxuICAgICAgICBtZW51SXRlbS5vbmNsaWNrID0gKCkgPT4ge1xyXG4gICAgICAgICAgbGV0IGFjdGl2ZU1lbnVJdGVtID0gQXJyYXkuZnJvbShtZW51SXRlbXMpLmZpbmQoZ2V0QWN0aXZlVGFiKTtcclxuICAgICAgICAgIGxldCBhY3RpdmVDb250ZW50SXRlbSA9IHRhYnNDb250YWluZXIucXVlcnlTZWxlY3RvcihhY3RpdmVNZW51SXRlbS5kYXRhc2V0LnRhcmdldCk7XHJcbiAgICAgICAgICBsZXQgY3VycmVudENvbnRlbnRJdGVtID0gdGFic0NvbnRhaW5lci5xdWVyeVNlbGVjdG9yKG1lbnVJdGVtLmRhdGFzZXQudGFyZ2V0KTtcclxuXHJcbiAgICAgICAgICBhY3RpdmVNZW51SXRlbS5jbGFzc0xpc3QucmVtb3ZlKFwiaXMtYWN0aXZlXCIpO1xyXG5cclxuICAgICAgICAgIGlmICggYWN0aXZlQ29udGVudEl0ZW0gKSB7XHJcbiAgICAgICAgICAgIGFjdGl2ZUNvbnRlbnRJdGVtLmNsYXNzTGlzdC5yZW1vdmUoXCJpcy1hY3RpdmVcIik7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgaWYgKCBjdXJyZW50Q29udGVudEl0ZW0gKSB7XHJcbiAgICAgICAgICAgIGN1cnJlbnRDb250ZW50SXRlbS5jbGFzc0xpc3QuYWRkKFwiaXMtYWN0aXZlXCIpO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIG1lbnVJdGVtLmNsYXNzTGlzdC5hZGQoXCJpcy1hY3RpdmVcIik7XHJcblxyXG4gICAgICAgICAgaWYgKCB0YWJIYW5kbGVyICkge1xyXG4gICAgICAgICAgICBkb2N1bWVudC5kaXNwYXRjaEV2ZW50KHRhYkhhbmRsZXIpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICBmdW5jdGlvbiBnZXRBY3RpdmVUYWIoZWxlbWVudCkge1xyXG4gICAgcmV0dXJuIGVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKFwiaXMtYWN0aXZlXCIpO1xyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gYWNjb3JkaW9uKCkge1xyXG4gIGxldCB3cmFwcGVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmpzLWFjY29yZGlvbicpO1xyXG4gIHdyYXBwZXIuZm9yRWFjaCh3cmFwcGVySXRlbSA9PiB7XHJcbiAgICBsZXQgaXRlbXMgPSB3cmFwcGVySXRlbS5xdWVyeVNlbGVjdG9yQWxsKCcuanMtYWNjb3JkaW9uLWl0ZW0nKTtcclxuICAgIGxldCBpbmRpdmlkdWFsID0gd3JhcHBlckl0ZW0uZ2V0QXR0cmlidXRlKCdpbmRpdmlkdWFsJykgJiYgd3JhcHBlckl0ZW0uZ2V0QXR0cmlidXRlKCdpbmRpdmlkdWFsJykgIT09ICdmYWxzZSc7XHJcblxyXG4gICAgaXRlbXMuZm9yRWFjaChpdGVtID0+IHtcclxuICAgICAgaWYgKCBpdGVtLmNsYXNzTGlzdC5jb250YWlucygnaXMtYWN0aXZlJykgKSB7XHJcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICBsZXQgcmVhZHlDb250ZW50ID0gaXRlbS5xdWVyeVNlbGVjdG9yKCcuanMtYWNjb3JkaW9uLWNvbnRlbnQnKTtcclxuICAgICAgICAgIGxldCByZWFkeUNvbnRlbnRIZWlnaHQgPSByZWFkeUNvbnRlbnQuc2Nyb2xsSGVpZ2h0O1xyXG5cclxuICAgICAgICAgIHJlYWR5Q29udGVudC5zdHlsZS5tYXhIZWlnaHQgPSByZWFkeUNvbnRlbnRIZWlnaHQgKyAncHgnO1xyXG4gICAgICAgIH0sIDEwMCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGxldCBzdWJJdGVtcyA9IGl0ZW0ucXVlcnlTZWxlY3RvckFsbCgnLmpzLWFjY29yZGlvbi1zdWJpdGVtJyk7XHJcblxyXG4gICAgICBmb3IgKGNvbnN0IHN1Ykl0ZW0gb2Ygc3ViSXRlbXMpIHtcclxuICAgICAgICBpZiAoIHN1Ykl0ZW0uY2xhc3NMaXN0LmNvbnRhaW5zKCdpcy1hY3RpdmUnKSApIHtcclxuICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICBsZXQgcmVhZHlDb250ZW50ID0gc3ViSXRlbS5xdWVyeVNlbGVjdG9yKCcuanMtYWNjb3JkaW9uLWNvbnRlbnQnKTtcclxuICAgICAgICAgICAgbGV0IHJlYWR5Q29udGVudEhlaWdodCA9IHJlYWR5Q29udGVudC5zY3JvbGxIZWlnaHQ7XHJcbiAgXHJcbiAgICAgICAgICAgIHJlYWR5Q29udGVudC5zdHlsZS5tYXhIZWlnaHQgPSByZWFkeUNvbnRlbnRIZWlnaHQgKyAncHgnO1xyXG4gICAgICAgICAgfSwgMTAwKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGl0ZW1JdGVyYXRpb24oaXRlbSwgaXRlbXMsIGluZGl2aWR1YWwpO1xyXG5cclxuICAgICAgc3ViSXRlbXMuZm9yRWFjaChzdWJpdGVtID0+IHtcclxuICAgICAgICBpdGVtSXRlcmF0aW9uKHN1Yml0ZW0sIHN1Ykl0ZW1zLCBpbmRpdmlkdWFsLCB0cnVlKVxyXG4gICAgICB9KTtcclxuICAgIH0pXHJcbiAgfSlcclxufVxyXG5cclxuZnVuY3Rpb24gaXRlbUl0ZXJhdGlvbihpdGVtLCBpdGVtcywgaW5kaXZpZHVhbCwgaXNTdWJpdGVtKSB7XHJcbiAgbGV0IGluaXQgPSBpdGVtLnF1ZXJ5U2VsZWN0b3IoJy5qcy1hY2NvcmRpb24taW5pdCcpO1xyXG4gIGxldCBjb250ZW50ID0gaXRlbS5xdWVyeVNlbGVjdG9yKCcuanMtYWNjb3JkaW9uLWNvbnRlbnQnKTtcclxuXHJcbiAgaWYgKCBpc1N1Yml0ZW0gPT09IHRydWUgKSB7XHJcbiAgICBjb250ZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3RyYW5zaXRpb25lbmQnLCBmdW5jdGlvbigpIHtcclxuICAgICAgbGV0IHBhcmVudEl0ZW0gPSBpdGVtLmNsb3Nlc3QoJy5qcy1hY2NvcmRpb24taXRlbScpO1xyXG4gICAgICBsZXQgcGFyZW50Q29udGVudEhlaWdodCA9IHBhcmVudEl0ZW0uc2Nyb2xsSGVpZ2h0ICsgJ3B4JztcclxuICAgICAgbGV0IHBhcmVudENvbnRlbnQgPSBwYXJlbnRJdGVtLnF1ZXJ5U2VsZWN0b3IoJy5qcy1hY2NvcmRpb24tY29udGVudCcpO1xyXG5cclxuICAgICAgcGFyZW50Q29udGVudC5zZXRBdHRyaWJ1dGUoJ3N0eWxlJywgYG1heC1oZWlnaHQ6ICR7cGFyZW50Q29udGVudEhlaWdodH1gKTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgaW5pdC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKCkge1xyXG4gICAgaWYgKCBpdGVtLmNsYXNzTGlzdC5jb250YWlucygnaXMtYWN0aXZlJykgKSB7XHJcbiAgICAgIGl0ZW0uY2xhc3NMaXN0LnJlbW92ZSgnaXMtYWN0aXZlJyk7XHJcbiAgICAgIGNvbnRlbnQuc3R5bGUubWF4SGVpZ2h0ID0gJzBweCc7XHJcblxyXG4gICAgICByZXR1cm4gZmFsc2VcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIGlzU3ViaXRlbSA9PT0gdHJ1ZSApIHtcclxuICAgICAgbGV0IHBhcmVudEl0ZW0gPSBpdGVtLmNsb3Nlc3QoJy5qcy1hY2NvcmRpb24taXRlbScpO1xyXG4gICAgICBsZXQgcGFyZW50Q29udGVudCA9IHBhcmVudEl0ZW0ucXVlcnlTZWxlY3RvcignLmpzLWFjY29yZGlvbi1jb250ZW50Jyk7XHJcblxyXG4gICAgICBwYXJlbnRDb250ZW50LnNldEF0dHJpYnV0ZSgnc3R5bGUnLCBgbWF4LWhlaWdodDogbm9uZWApO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICggaW5kaXZpZHVhbCApIHtcclxuICAgICAgaXRlbXMuZm9yRWFjaCgoZWxlbSkgPT4ge1xyXG4gICAgICAgIGxldCBlbGVtQ29udGVudCA9IGVsZW0ucXVlcnlTZWxlY3RvcignLmpzLWFjY29yZGlvbi1jb250ZW50Jyk7XHJcbiAgICAgICAgZWxlbS5jbGFzc0xpc3QucmVtb3ZlKCdpcy1hY3RpdmUnKTtcclxuICAgICAgICBlbGVtQ29udGVudC5zdHlsZS5tYXhIZWlnaHQgPSAwICsgJ3B4JztcclxuICAgICAgfSlcclxuICAgIH1cclxuXHJcbiAgICBpdGVtLmNsYXNzTGlzdC5hZGQoJ2lzLWFjdGl2ZScpO1xyXG4gICAgY29udGVudC5zdHlsZS5tYXhIZWlnaHQgPSBjb250ZW50LnNjcm9sbEhlaWdodCArICdweCc7XHJcbiAgfSk7XHJcbn0iXX0=
