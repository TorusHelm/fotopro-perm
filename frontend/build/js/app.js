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

  if ( window.location.hash ) {
    let target = document.querySelector(`[data-target="${window.location.hash}"]`);

    if ( target ) {
      target.click();
    }
  }

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
          'min': [0],
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiYXBwLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xyXG5cclxuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIGZ1bmN0aW9uKCkge1xyXG4gIGxldCB0YWJIYW5kbGVyID0gbmV3IEV2ZW50KCd0YWJIYW5kbGVyJyk7XHJcbiAgbGV0IG1vZGFsU3dpcGVyID0gaW5pdE1vZGFsU3dpcGVyKCk7XHJcbiAgbGV0IHN3aXBlcnMgPSBpbml0U3dpcGVyKCk7XHJcbiAgc3ZnNGV2ZXJ5Ym9keSgpO1xyXG4gIGluaXRNYWluU3dpcGVyKCk7XHJcbiAgaW5pdEhlYWRlclRvZ2dsZXIoKTtcclxuICBpbml0QWxidW1zQ2FyZFNsaWRlcigpO1xyXG4gIGFjY29yZGlvbigpO1xyXG4gIGluaXRBbGJ1bXNUeXBlU2xpZGVyKCk7XHJcbiAgaW5pdFN3aXBlclN0YXRpY2soKTtcclxuICBpbml0QWxidW1TbGlkZXIoKTtcclxuICB0YWIodGFiSGFuZGxlcik7XHJcbiAgaW5pdFJhbmdlKCk7XHJcbiAgaW5pdERyYWdORHJvcCgpO1xyXG4gIGluaXRNb2RhbChtb2RhbFN3aXBlcik7XHJcbiAgdmFsaWRhdGVGcm9tKCk7XHJcbiAgY2FyZEhlYWRlckhhbmRsZShtb2RhbFN3aXBlciwgJy9hcGkvYWxidW0vaW1hZ2VzX3NsaWRlcj9pZD0nKTtcclxuICBjaG9pY2VUeXBlKCk7XHJcbiAgc2V0SGFuZGxlcnNQcmljZSgpO1xyXG4gIGdldFRydWVQcmljZUNhcmQoKTtcclxuXHJcbiAgaWYgKCB3aW5kb3cubG9jYXRpb24uaGFzaCApIHtcclxuICAgIGxldCB0YXJnZXQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGBbZGF0YS10YXJnZXQ9XCIke3dpbmRvdy5sb2NhdGlvbi5oYXNofVwiXWApO1xyXG5cclxuICAgIGlmICggdGFyZ2V0ICkge1xyXG4gICAgICB0YXJnZXQuY2xpY2soKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3RhYkhhbmRsZXInLCBmdW5jdGlvbigpIHtcclxuICAgIGlmICggIXN3aXBlcnMubGVuZ3RoICkge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgc3dpcGVycy5mb3JFYWNoKHN3aXBlciA9PiB7XHJcbiAgICAgIHN3aXBlci51cGRhdGUoKTtcclxuICAgIH0pO1xyXG5cclxuICB9LCBmYWxzZSk7XHJcblxyXG4gIGlmICggd2luZG93LmlubmVyV2lkdGggPCA3NjggKSB7XHJcbiAgICBpbml0TWFpbkNhcmRzU2xpZGVyKCk7XHJcbiAgfVxyXG59KTtcclxuXHJcbmZ1bmN0aW9uIGdldFRydWVQcmljZUNhcmQoKSB7XHJcbiAgbGV0IHRhcmdldHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuanMtY2FyZC1wcmljZS13cmFwcGVyJyk7XHJcblxyXG4gIGlmICggdGFyZ2V0cy5sZW5ndGggKSB7XHJcbiAgICBmb3IgKGNvbnN0IHRhcmdldCBvZiB0YXJnZXRzKSB7XHJcbiAgICAgIGxldCBpbnB1dCA9IHRhcmdldC5xdWVyeVNlbGVjdG9yKCcuanMtY2FyZC1wcmljZSBpbnB1dCcpO1xyXG4gICAgICBsZXQgb3V0cHV0ID0gdGFyZ2V0LnF1ZXJ5U2VsZWN0b3IoJy5qcy1jYXJkLXByaWNlLW91dHB1dCcpO1xyXG4gICAgICBsZXQgYmFzZVByaWNlID0gK291dHB1dC5kYXRhc2V0LnByaWNlO1xyXG5cclxuICAgICAgaW5wdXQuYWRkRXZlbnRMaXN0ZW5lcignaW5wdXQnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgbGV0IHBlcmNhbnRhZ2UgPSBnZXREaXNjb3VudFBlcmNlbnQoK2lucHV0LnZhbHVlKTtcclxuICAgICAgICBsZXQgZGlzY291bnRQcmljZSA9IGdldERpc2NvdW50U3VtbShiYXNlUHJpY2UsIHBlcmNhbnRhZ2UpO1xyXG5cclxuICAgICAgICBvdXRwdXQudGV4dENvbnRlbnQgPSAoYmFzZVByaWNlIC0gZGlzY291bnRQcmljZSkgKyAnIOKCvSc7XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gY2hvaWNlVHlwZSgpIHtcclxuICBsZXQgdHlwZXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuanMtY2hvaWNlLXR5cGUnKTtcclxuICBsZXQgY29udGFpbmVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLWNob2ljZS10eXBlLWFkZGluZ3MnKTtcclxuICBsZXQgb3V0cHV0Q29udGFpbmVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLWNob2ljZS10eXBlLW91dHB1dCcpO1xyXG5cclxuICBpZiAoICF0eXBlcy5sZW5ndGggfHwgIWNvbnRhaW5lciApIHtcclxuICAgIHJldHVyblxyXG4gIH1cclxuXHJcbiAgZm9yIChjb25zdCB0eXBlIG9mIHR5cGVzKSB7XHJcbiAgICBsZXQgbGlzdCA9IHR5cGUucXVlcnlTZWxlY3RvckFsbCgnLmpzLWNob2ljZS10eXBlLWxpc3QgbGknKTtcclxuICAgIGxldCBhcnJMaXN0ID0gW107XHJcblxyXG4gICAgZm9yIChjb25zdCBpdGVtIG9mIGxpc3QpIHtcclxuICAgICAgYXJyTGlzdC5wdXNoKGl0ZW0udGV4dENvbnRlbnQpO1xyXG4gICAgfVxyXG5cclxuICAgIHR5cGUuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbigpIHtcclxuICAgICAgaWYgKCB0eXBlLmNsYXNzTGlzdC5jb250YWlucygnaXMtYWN0aXZlJykgKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBmb3IgKGNvbnN0IHR5cGVJbiBvZiB0eXBlcykge1xyXG4gICAgICAgIHR5cGVJbi5jbGFzc0xpc3QucmVtb3ZlKCdpcy1hY3RpdmUnKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgY29udGFpbmVyLmNsYXNzTGlzdC5hZGQoJ2lzLWFjdGl2ZScpO1xyXG5cclxuICAgICAgaWYgKCAhbGlzdC5sZW5ndGggfHwgbGlzdC5sZW5ndGggPCAyICkge1xyXG4gICAgICAgIGNvbnRhaW5lci5jbGFzc0xpc3QucmVtb3ZlKCdpcy1hY3RpdmUnKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgdHlwZS5jbGFzc0xpc3QuYWRkKCdpcy1hY3RpdmUnKTtcclxuICAgICAgb3V0cHV0Q29udGFpbmVyLmlubmVySFRNTCA9ICcnO1xyXG5cclxuICAgICAgbGlzdC5mb3JFYWNoKChpdGVtLCBpZHgpID0+IHtcclxuICAgICAgICBpZiAoIGlkeCA9PT0gMCApIHtcclxuICAgICAgICAgIG91dHB1dENvbnRhaW5lci5hcHBlbmRDaGlsZChjcmVhdGVDaGVja21hcmsoaXRlbS50ZXh0Q29udGVudCwgdHJ1ZSwgaXRlbS5kYXRhc2V0LmJhc2VQcmljZSkpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBvdXRwdXRDb250YWluZXIuYXBwZW5kQ2hpbGQoY3JlYXRlQ2hlY2ttYXJrKGl0ZW0udGV4dENvbnRlbnQsIGZhbHNlLCBpdGVtLmRhdGFzZXQuYmFzZVByaWNlKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIGxldCBjaGVja21hcmtzID0gb3V0cHV0Q29udGFpbmVyLnF1ZXJ5U2VsZWN0b3JBbGwoJy5jaGVja21hcmsgaW5wdXQnKTtcclxuXHJcbiAgICAgIGlmICggY2hlY2ttYXJrcy5sZW5ndGggKSB7XHJcbiAgICAgICAgY2hlY2ttYXJrc1swXS5jbGljaygpO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHNldEhhbmRsZXJzUHJpY2UoKSB7XHJcbiAgbGV0IHRhcmdldHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuanMtY2FsYy1jaGFuZ2UnKTtcclxuXHJcbiAgZm9yIChjb25zdCB0YXJnZXQgb2YgdGFyZ2V0cykge1xyXG4gICAgaWYgKCB0YXJnZXQubm9VaVNsaWRlciApIHtcclxuICAgICAgdGFyZ2V0Lm5vVWlTbGlkZXIub24oJ2NoYW5nZScsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGNoYW5nZVByaWNlSGFuZGxlKCk7XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHRhcmdldC5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCBmdW5jdGlvbigpIHtcclxuICAgICAgY2hhbmdlUHJpY2VIYW5kbGUoKTtcclxuICAgIH0pO1xyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gY2hhbmdlUHJpY2VIYW5kbGUoKSB7XHJcbiAgbGV0IGJhc2VQcmljZXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuanMtY2hvaWNlLXR5cGUtb3V0cHV0IGlucHV0Jyk7XHJcbiAgbGV0IGJhc2VQcmljZUl0ZW0gPSBnZXRCYXNlUHJpY2UoYmFzZVByaWNlcyk7XHJcbiAgbGV0IG91dHB1dFByaWNlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLWNhbGMtcHJpY2UnKTtcclxuICBsZXQgb3V0cHV0RGlzY291bnRQcmljZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy1jYWxjLWRpc2NvdW50LXByaWNlJyk7XHJcbiAgbGV0IHR5cGVPdXRwdXQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtY2FsYy10eXBlLW91dHB1dCcpO1xyXG4gIGxldCBsaXN0c091dHB1dCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy1jYWxjLWxpc3RzLW91dHB1dCcpO1xyXG4gIGxldCBhbGJ1bXNPdXRwdXQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtY2FsYy1hbGJ1bXMtb3V0cHV0Jyk7XHJcbiAgbGV0IHBlcnNhbnRhZ2VPdXRwdXQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtY2FsYy1kaXNjb3VudC1wZXJzYW50YWdlLW91dHB1dCcpO1xyXG4gIGxldCBkaXNjb3VudFN1bW1PdXRwdXQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtY2FsYy1kaXNjb3VudC1zdW1tLW91dHB1dCcpO1xyXG4gIGxldCBhbGJ1bXMgPSArZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLWNhbGMtYWxidW1zLWxlbmd0aCBpbnB1dCcpLnZhbHVlO1xyXG4gIGxldCBwZW9wbGVzID0gK2RvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy1jYWxjLXBlb3BsZXMnKS5ub1VpU2xpZGVyLmdldCgpO1xyXG4gIGxldCBwZW9wbGVzT25UdXJuID0gK2RvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy1jYWxjLXBlb3BsZXMtb24tdHVybicpLm5vVWlTbGlkZXIuZ2V0KCk7XHJcbiAgbGV0IGhpc3RvcnlUdXJucyA9ICtkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtY2FsYy1oaXN0b3J5LXR1cm5zJykubm9VaVNsaWRlci5nZXQoKTtcclxuICBsZXQgYWN0aXZlQ2hvaWNlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLWNob2ljZS10eXBlLmlzLWFjdGl2ZScpO1xyXG4gIGxldCByYW5nZXNDYW5CZURpc2FibGVkID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmpzLXJhbmdlLWNhbi1iZS1kaXNhYmxlZCcpO1xyXG5cclxuICBpZiAoICFhY3RpdmVDaG9pY2UgKSB7XHJcbiAgICByZXR1cm5cclxuICB9XHJcblxyXG4gIGxldCBiYXNlTGlzdHMgPSArYWN0aXZlQ2hvaWNlLmRhdGFzZXQuYmFzZUxpc3RzO1xyXG4gIGxldCBiYXNlVHVybiA9ICthY3RpdmVDaG9pY2UuZGF0YXNldC5iYXNlVHVybjtcclxuICBsZXQgYmFzZVR1cm5QcmljZSA9ICthY3RpdmVDaG9pY2UuZGF0YXNldC50dXJuUHJpY2U7XHJcbiAgbGV0IGJhc2VQcmljZSA9ICtiYXNlUHJpY2VJdGVtLmRhdGFzZXQuYmFzZVByaWNlO1xyXG4gIGxldCBhbGJ1bUxpc3RzID0gZ2V0TGlzdEluQWxidW0ocGVvcGxlcywgcGVvcGxlc09uVHVybiwgaGlzdG9yeVR1cm5zLCBiYXNlVHVybik7XHJcbiAgbGV0IGFsYnVtUHJpY2UgPSBnZXRQcmljZUZvckFsYnVtKGJhc2VQcmljZSwgYWxidW1MaXN0cywgYmFzZUxpc3RzLCBiYXNlVHVyblByaWNlKTtcclxuICBsZXQgcGVyY2VudGFnZSA9IGdldERpc2NvdW50UGVyY2VudChhbGJ1bXMpO1xyXG4gIGxldCBkaXNjb3VudFN1bW0gPSBnZXREaXNjb3VudFN1bW0oYWxidW1QcmljZSwgcGVyY2VudGFnZSk7XHJcbiAgbGV0IGFsYnVtUHJpY2VXaXRoRGlzY291bnQgPSBnZXRQcmljZUZvckFsYnVtRGlzY291bnQoYWxidW1QcmljZSwgZGlzY291bnRTdW1tKTtcclxuXHJcbiAgaWYgKCBiYXNlTGlzdHMgPT09IDAgJiYgcmFuZ2VzQ2FuQmVEaXNhYmxlZC5sZW5ndGggKSB7XHJcbiAgICByYW5nZXNDYW5CZURpc2FibGVkLmZvckVhY2goaXRlbSA9PiB7XHJcbiAgICAgIGxldCByYW5nZSA9IGl0ZW0ucXVlcnlTZWxlY3RvcignLmpzLXJhbmdlJyk7XHJcbiAgICAgIGl0ZW0uY2xhc3NMaXN0LmFkZCgnZGlzYWJsZWQnKTtcclxuICAgICAgcmFuZ2Uubm9VaVNsaWRlci5zZXQoMCk7XHJcbiAgICB9KTtcclxuICB9IGVsc2Uge1xyXG4gICAgcmFuZ2VzQ2FuQmVEaXNhYmxlZC5mb3JFYWNoKGl0ZW0gPT4ge1xyXG4gICAgICBpdGVtLmNsYXNzTGlzdC5yZW1vdmUoJ2Rpc2FibGVkJyk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIG91dHB1dFByaWNlLnRleHRDb250ZW50ID0gYWxidW1QcmljZTtcclxuICBvdXRwdXREaXNjb3VudFByaWNlLnRleHRDb250ZW50ID0gYWxidW1QcmljZVdpdGhEaXNjb3VudDtcclxuICB0eXBlT3V0cHV0LnRleHRDb250ZW50ID0gYWN0aXZlQ2hvaWNlLnF1ZXJ5U2VsZWN0b3IoJy5jYWxjdWxhdGUtdHlwZXNfX3RpdGxlJykudGV4dENvbnRlbnQ7XHJcbiAgbGlzdHNPdXRwdXQudGV4dENvbnRlbnQgPSBhbGJ1bUxpc3RzO1xyXG4gIGFsYnVtc091dHB1dC50ZXh0Q29udGVudCA9IGFsYnVtcztcclxuICBwZXJzYW50YWdlT3V0cHV0LnRleHRDb250ZW50ID0gcGVyY2VudGFnZSArICclJztcclxuICBkaXNjb3VudFN1bW1PdXRwdXQudGV4dENvbnRlbnQgPSAoYWxidW1zICogYWxidW1QcmljZVdpdGhEaXNjb3VudCkgKyAnIOKCvSc7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldEJhc2VQcmljZShhcnIpIHtcclxuICBpZiAoIGFyci5sZW5ndGggKSB7XHJcbiAgICBmb3IgKGNvbnN0IGl0ZW0gb2YgYXJyKSB7XHJcbiAgICAgIGlmICggaXRlbS5jaGVja2VkICkge1xyXG4gICAgICAgIHJldHVybiBpdGVtO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRQcmljZUZvckFsYnVtKGJhc2VQcmljZSwgYWxidW1MaXN0cywgYmFzZUxpc3RzLCBiYXNlVHVyblByaWNlKSB7XHJcbiAgbGV0IHNvbWUgPSAwO1xyXG5cclxuICBpZiAoIGFsYnVtTGlzdHMgLSBiYXNlTGlzdHMgPiAwICkge1xyXG4gICAgc29tZSA9IGFsYnVtTGlzdHMgLSBiYXNlTGlzdHM7XHJcbiAgfVxyXG5cclxuICByZXR1cm4gYmFzZVByaWNlICsgc29tZSAqIGJhc2VUdXJuUHJpY2U7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldERpc2NvdW50UGVyY2VudChhbGJ1bXMpIHtcclxuICBpZiAoIGFsYnVtcyA8IDUgKSB7XHJcbiAgICByZXR1cm4gMDtcclxuICB9XHJcblxyXG4gIGlmICggYWxidW1zID4gMjAgKSB7XHJcbiAgICByZXR1cm4gMjA7XHJcbiAgfVxyXG5cclxuICByZXR1cm4gYWxidW1zO1xyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRQcmljZUZvckFsYnVtRGlzY291bnQoYWxidW1QcmljZSwgZGlzY291bnRTdW1tKSB7XHJcbiAgcmV0dXJuIGFsYnVtUHJpY2UgLSBkaXNjb3VudFN1bW07XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldERpc2NvdW50U3VtbShhbGJ1bVByaWNlLCBwZXJjZW50YWdlKSB7XHJcbiAgcmV0dXJuIE1hdGguY2VpbChhbGJ1bVByaWNlICogcGVyY2VudGFnZSAvIDEwMCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldExpc3RJbkFsYnVtKHBlb3BsZXMsIHBlb3BsZXNPblR1cm4sIGhpc3RvcnlUdXJucywgYmFzZVR1cm4pIHtcclxuICByZXR1cm4gTWF0aC5jZWlsKHBlb3BsZXMgLyBwZW9wbGVzT25UdXJuKSArIGhpc3RvcnlUdXJucyArIGJhc2VUdXJuO1xyXG59XHJcblxyXG5mdW5jdGlvbiBjcmVhdGVDaGVja21hcmsodGV4dCwgZmlyc3QsIGJhc2VQcmljZSkge1xyXG4gIGxldCBjaGVja21hcmtXcmFwcGVyO1xyXG4gIGxldCBjaGVja21hcmsgPSBjcmVhdGVFbGVtZW50KCdsYWJlbCcsICdjaGVja21hcmsnKTtcclxuICBsZXQgaW5wdXQgPSBjcmVhdGVFbGVtZW50KCdpbnB1dCcsICcnKTtcclxuICBzZXRBdHRyaWJ1dGVzKGlucHV0LCB7XHJcbiAgICAndHlwZSc6ICdyYWRpbycsXHJcbiAgICAnbmFtZSc6ICd0eXBlcydcclxuICB9KTtcclxuICBsZXQgbWFyayA9IGNyZWF0ZUVsZW1lbnQoJ3NwYW4nLCAnY2hlY2ttYXJrX19tYXJrJyk7XHJcbiAgbGV0IHZhclRleHQgPSBjcmVhdGVFbGVtZW50KCdwJywgJycpO1xyXG5cclxuICBpbnB1dC5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCBmdW5jdGlvbigpIHtcclxuICAgIGNoYW5nZVByaWNlSGFuZGxlKCk7XHJcbiAgfSk7XHJcblxyXG4gIGlmICggZmlyc3QgKSB7XHJcbiAgICBjaGVja21hcmtXcmFwcGVyID0gY3JlYXRlRWxlbWVudCgnZGl2JywgJ2NvbC0xMicpO1xyXG4gIH0gZWxzZSB7XHJcbiAgICBjaGVja21hcmtXcmFwcGVyID0gY3JlYXRlRWxlbWVudCgnZGl2JywgJ2NvbC0xMiBtdC0zJyk7XHJcbiAgfVxyXG5cclxuICBpbnB1dC5kYXRhc2V0LmJhc2VQcmljZSA9IGJhc2VQcmljZSA/IGJhc2VQcmljZSA6IDA7XHJcbiAgdmFyVGV4dC50ZXh0Q29udGVudCA9IHRleHQ7XHJcbiAgY2hlY2ttYXJrLmFwcGVuZENoaWxkKGlucHV0KTtcclxuICBjaGVja21hcmsuYXBwZW5kQ2hpbGQobWFyayk7XHJcbiAgY2hlY2ttYXJrLmFwcGVuZENoaWxkKHZhclRleHQpO1xyXG4gIGNoZWNrbWFya1dyYXBwZXIuYXBwZW5kQ2hpbGQoY2hlY2ttYXJrKTtcclxuXHJcbiAgcmV0dXJuIGNoZWNrbWFya1dyYXBwZXI7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZUVsZW1lbnQodGFnLCBjbGFzc05hbWUpIHtcclxuICBsZXQgZWxlbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQodGFnKTtcclxuICBlbGVtLmNsYXNzTGlzdCA9IGNsYXNzTmFtZTtcclxuXHJcbiAgcmV0dXJuIGVsZW07XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHNldEF0dHJpYnV0ZXMoZWwsIGF0dHJzKSB7XHJcbiAgZm9yKHZhciBrZXkgaW4gYXR0cnMpIHtcclxuICAgIGVsLnNldEF0dHJpYnV0ZShrZXksIGF0dHJzW2tleV0pO1xyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gY2FyZEhlYWRlckhhbmRsZShtb2RhbFN3aXBlciwgdXJsKSB7XHJcbiAgbGV0IHRhcmdldHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuanMtbW9kYWwtaW5pdCcpO1xyXG5cclxuICBpZiAoIHRhcmdldHMubGVuZ3RoICkge1xyXG4gICAgdGFyZ2V0cy5mb3JFYWNoKHRhcmdldCA9PiB7XHJcbiAgICAgIGxldCB0YXJnZXRJZCA9IHRhcmdldC5kYXRhc2V0LmlkO1xyXG4gICAgICB0YXJnZXQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbigpIHtcclxuICAgICAgICBnZXRTbGlkZXJzRGF0YShtb2RhbFN3aXBlciwgYCR7dXJsICsgdGFyZ2V0SWR9YCk7XHJcbiAgICAgIH0pO1xyXG4gICAgfSk7XHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRTbGlkZXJzRGF0YShtb2RhbFN3aXBlciwgdXJsKSB7XHJcbiAgbGV0IHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xyXG4gIHhoci5vcGVuKCdHRVQnLCB1cmwpO1xyXG4gIHhoci5zZW5kKCk7XHJcblxyXG4gIGlmICggIW1vZGFsU3dpcGVyICkge1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuXHJcbiAgeGhyLm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgaWYgKHhoci5zdGF0dXMgIT0gMjAwKSB7XHJcbiAgICAgIGNvbnNvbGUubG9nKGDQntGI0LjQsdC60LAgJHt4aHIuc3RhdHVzfTogJHt4aHIuc3RhdHVzVGV4dH1gKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGxldCBkYXRhID0gSlNPTi5wYXJzZSh4aHIucmVzcG9uc2UpO1xyXG4gICAgICBtb2RhbFN3aXBlci5yZW1vdmVBbGxTbGlkZXMoKTtcclxuXHJcbiAgICAgIGRhdGEuZm9yRWFjaChpdGVtID0+IHtcclxuICAgICAgICBsZXQgc2xpZGVDb250ZW50ID0gY3JlYXRlU2xpZGUoaXRlbSk7XHJcbiAgICAgICAgbW9kYWxTd2lwZXIuYXBwZW5kU2xpZGUoc2xpZGVDb250ZW50KTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICBtb2RhbFN3aXBlci51cGRhdGUoKTtcclxuICAgICAgfSwgMTAwKTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICB4aHIub25lcnJvciA9IGZ1bmN0aW9uKCkge1xyXG4gICAgY29uc29sZS5sb2coXCLQl9Cw0L/RgNC+0YEg0L3QtSDRg9C00LDQu9GB0Y9cIik7XHJcbiAgfTtcclxufVxyXG5cclxuZnVuY3Rpb24gY3JlYXRlU2xpZGUoc3RyKSB7XHJcbiAgbGV0IGltZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2ltZycpO1xyXG4gIGxldCBzbGlkZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gIHNsaWRlLmNsYXNzTGlzdC5hZGQoJ3N3aXBlci1zbGlkZScsICdtYWluLXNsaWRlcl9fc2xpZGUnKTtcclxuICBpbWcuc3JjID0gc3RyO1xyXG4gIHNsaWRlLmFwcGVuZENoaWxkKGltZyk7XHJcblxyXG4gIHJldHVybiBzbGlkZTtcclxufVxyXG5cclxuZnVuY3Rpb24gdmFsaWRhdGVGcm9tKCkge1xyXG4gIGxldCBmb3JtcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy1mb3JtLXZhbGlkYXRlJyk7XHJcblxyXG4gIGlmICggZm9ybXMubGVuZ3RoICkge1xyXG4gICAgZm9yIChjb25zdCBmb3JtIG9mIGZvcm1zKSB7XHJcbiAgICAgIGxldCBmaWVsZHMgPSBmb3JtLnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy1mb3JtLXZhbGlkYXRlLWlucHV0IGlucHV0Jyk7XHJcbiAgICAgIGxldCBmaWxlID0gZm9ybS5xdWVyeVNlbGVjdG9yKCcuanMtY2FsY3VsYXRlLWZpbGUtaW5wdXQnKTtcclxuICAgICAgbGV0IHZhbGlkRm9ybSA9IGZhbHNlO1xyXG5cclxuICAgICAgZm9yIChjb25zdCBmaWVsZCBvZiBmaWVsZHMpIHtcclxuICAgICAgICBmaWVsZC5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgIGlmICggIXZhbGlkYXRlRmllbGQoZmllbGQpICkge1xyXG4gICAgICAgICAgICBmaWVsZC5jbGFzc0xpc3QuYWRkKCdoYXMtZXJyb3InKTtcclxuICAgICAgICAgICAgdmFsaWRGb3JtID0gZmFsc2U7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBmaWVsZC5jbGFzc0xpc3QucmVtb3ZlKCdoYXMtZXJyb3InKTtcclxuICAgICAgICAgICAgdmFsaWRGb3JtID0gdHJ1ZTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG5cclxuICAgICAgZm9ybS5hZGRFdmVudExpc3RlbmVyKCdzdWJtaXQnLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cclxuICAgICAgICBmb3IgKGNvbnN0IGZpZWxkIG9mIGZpZWxkcykge1xyXG4gICAgICAgICAgaWYgKCAhdmFsaWRhdGVGaWVsZChmaWVsZCkgKSB7XHJcbiAgICAgICAgICAgIGZpZWxkLmNsYXNzTGlzdC5hZGQoJ2hhcy1lcnJvcicpO1xyXG4gICAgICAgICAgICB2YWxpZEZvcm0gPSBmYWxzZTtcclxuXHJcbiAgICAgICAgICAgIHJldHVyblxyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgZmllbGQuY2xhc3NMaXN0LnJlbW92ZSgnaGFzLWVycm9yJyk7XHJcbiAgICAgICAgICAgIHZhbGlkRm9ybSA9IHRydWU7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIHZhbGlkRm9ybSApIHtcclxuICAgICAgICAgIGxldCBmb3JtRGF0YSA9IG5ldyBGb3JtRGF0YShmb3JtKTtcclxuXHJcbiAgICAgICAgICBpZiAoIGZpbGUgKSB7XHJcbiAgICAgICAgICAgIGZvcm1EYXRhLmFwcGVuZCgnZmlsZScsIGZpbGUuZmlsZXNbMF0pO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIGxldCBzdWNjZXNzID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGZvcm0uY2xhc3NMaXN0LmFkZCgnc3VjY2VzcycpO1xyXG4gICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICBzZW5kRGF0YShmb3JtRGF0YSwgJy8nLCBzdWNjZXNzKTtcclxuXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGNvbnNvbGUubG9nKCd1bnZhbGlkIGZvcm0nKVxyXG4gICAgICAgIH1cclxuICAgICAgfSlcclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHZhbGlkYXRlRmllbGQoaW5wdXQpIHtcclxuICBsZXQgdmFsdWUgPSBpbnB1dC52YWx1ZTtcclxuICBsZXQgdHlwZSA9IGlucHV0LnR5cGU7XHJcbiAgbGV0IHJlc3VsdCA9IGZhbHNlO1xyXG5cclxuICBpZiAoIHR5cGUgPT0gJ3RlbCcgKSB7XHJcbiAgICByZXN1bHQgPSB2YWxpZGF0ZVBob25lKHZhbHVlKTtcclxuICB9IGVsc2UgaWYgKCB0eXBlID09ICdlbWFpbCcgKSB7XHJcbiAgICByZXN1bHQgPSB2YWxpZGF0ZU1haWwodmFsdWUpO1xyXG4gIH0gZWxzZSB7XHJcbiAgICByZXN1bHQgPSAhaXNFbXB0eSh2YWx1ZSk7XHJcbiAgfVxyXG5cclxuICByZXR1cm4gcmVzdWx0O1xyXG59XHJcblxyXG5mdW5jdGlvbiBpc0VtcHR5KHN0cikge1xyXG4gIHJldHVybiBzdHIgPT0gJycgJiYgdHJ1ZTtcclxufVxyXG5cclxuZnVuY3Rpb24gdmFsaWRhdGVQaG9uZShzdHIpIHtcclxuICBsZXQgcmVnID0gL15bXFwrXT9bKF0/WzAtOV17M31bKV0/Wy1cXHNcXC5dP1swLTldezN9Wy1cXHNcXC5dP1swLTldezQsNn0kL2ltO1xyXG4gIHJldHVybiB0ZXN0UmVnKHJlZywgcmVtb3ZlU3BhY2VzKHN0cikpO1xyXG59XHJcblxyXG5mdW5jdGlvbiB2YWxpZGF0ZU1haWwoc3RyKSB7XHJcbiAgbGV0IHJlc3VsdCA9IGZhbHNlO1xyXG4gIGNvbnN0IHJlZyA9IC9eKChbXjw+KClbXFxdXFxcXC4sOzpcXHNAXFxcIl0rKFxcLltePD4oKVtcXF1cXFxcLiw7Olxcc0BcXFwiXSspKil8KFxcXCIuK1xcXCIpKUAoKFxcW1swLTldezEsM31cXC5bMC05XXsxLDN9XFwuWzAtOV17MSwzfVxcLlswLTldezEsM31cXF0pfCgoW2EtekEtWlxcLTAtOV0rXFwuKStbYS16QS1aXXsyLH0pKSQvO1xyXG4gIHJlc3VsdCA9IHRlc3RSZWcocmVnLCBzdHIpXHJcbiAgcmV0dXJuIHJlc3VsdDtcclxufVxyXG5cclxuZnVuY3Rpb24gcmVtb3ZlU3BhY2VzKHN0cikge1xyXG4gIHJldHVybiBzdHIucmVwbGFjZSgvXFxzL2csICcnKTs7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHRlc3RSZWcocmUsIHN0cil7XHJcbiAgaWYgKHJlLnRlc3Qoc3RyKSkge1xyXG4gICAgcmV0dXJuIHRydWU7XHJcbiAgfSBlbHNlIHtcclxuICAgIHJldHVybiBmYWxzZTtcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHNlbmREYXRhKGRhdGEsIHVybCwgc3VjY2Vzcykge1xyXG4gIGlmICggIWRhdGEgfHwgIXVybCApIHtcclxuICAgIHJldHVybiBjb25zb2xlLmxvZygnZXJyb3IsIGhhdmUgbm8gZGF0YSBvciB1cmwnKTtcclxuICB9XHJcblxyXG4gIGxldCB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcclxuXHJcbiAgeGhyLm9ubG9hZGVuZCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgaWYgKHhoci5zdGF0dXMgPT0gMjAwKSB7XHJcbiAgICAgIGxldCBzdWNjZXNzRnUgPSBzdWNjZXNzO1xyXG5cclxuICAgICAgc3VjY2Vzc0Z1KCk7XHJcbiAgICAgIGNvbnNvbGUubG9nKFwi0KPRgdC/0LXRhVwiKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGNvbnNvbGUubG9nKFwi0J7RiNC40LHQutCwIFwiICsgdGhpcy5zdGF0dXMpO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIHhoci5vcGVuKFwiUE9TVFwiLCB1cmwpO1xyXG4gIHhoci5zZW5kKGRhdGEpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBpbml0TW9kYWwobW9kYWxTd2lwZXIpIHtcclxuICBsZXQgaW5pdHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuanMtbW9kYWwtaW5pdCcpO1xyXG4gIGxldCBib2R5ID0gZG9jdW1lbnQuYm9keTtcclxuXHJcbiAgaWYgKCBpbml0cy5sZW5ndGggKSB7XHJcbiAgICBmb3IgKGNvbnN0IGluaXQgb2YgaW5pdHMpIHtcclxuICAgICAgbGV0IHRhcmdldCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoaW5pdC5kYXRhc2V0LnRhcmdldCk7XHJcbiAgICAgIGxldCBjbG9zZXMgPSB0YXJnZXQucXVlcnlTZWxlY3RvckFsbCgnLmpzLW1vZGFsLWNsb3NlJyk7XHJcblxyXG4gICAgICBpZiAoIHRhcmdldCApIHtcclxuICAgICAgICBpZiAoIGNsb3Nlcy5sZW5ndGggKSB7XHJcbiAgICAgICAgICBmb3IgKGNvbnN0IGNsb3NlIG9mIGNsb3Nlcykge1xyXG4gICAgICAgICAgICBjbG9zZS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgIHRhcmdldC5jbGFzc0xpc3QucmVtb3ZlKCdpcy1hY3RpdmUnKTtcclxuICAgICAgICAgICAgICBib2R5LmNsYXNzTGlzdC5yZW1vdmUoJ21vZGFsLWlzLWFjdGl2ZScpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGluaXQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgIHRhcmdldC5jbGFzc0xpc3QuYWRkKCdpcy1hY3RpdmUnKTtcclxuICAgICAgICAgIGJvZHkuY2xhc3NMaXN0LmFkZCgnbW9kYWwtaXMtYWN0aXZlJyk7XHJcblxyXG4gICAgICAgICAgaWYgKCB0YXJnZXQuZGF0YXNldC5zbGlkZXIgPT0gJ3RydWUnICkge1xyXG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgICBtb2RhbFN3aXBlci51cGRhdGUoKTtcclxuICAgICAgICAgICAgfSwgMTAwKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gaW5pdERyYWdORHJvcCgpIHtcclxuICBsZXQgY29udGFpbmVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLWNhbGN1bGF0ZS1maWxlJyk7XHJcbiAgbGV0IGRyb3BBcmVhID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLWNhbGN1bGF0ZS1maWxlLWRyb3BhcmVhJyk7XHJcbiAgbGV0IGZpbGVFbGVtID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLWNhbGN1bGF0ZS1maWxlLWlucHV0Jyk7XHJcbiAgbGV0IGFkZGluZ3MgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtY2FsY3VsYXRlLWZpbGUtYWRkaW5ncycpO1xyXG4gIGxldCBmaWxlTmFtZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy1jYWxjdWxhdGUtZmlsZS1uYW1lJyk7XHJcbiAgbGV0IHJlbW92ZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtY2FsY3VsYXRlLWZpbGUtcmVtb3ZlcicpO1xyXG5cclxuICBpZiAoICFjb250YWluZXIgJiYgIWRyb3BBcmVhICYmICFmaWxlRWxlbSAmJiAhYWRkaW5ncyAmJiAhZmlsZU5hbWUgJiYgIXJlbW92ZXIgKSB7XHJcbiAgICByZXR1cm47XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBwcmV2ZW50RGVmYXVsdHMgKGUpIHtcclxuICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgfTtcclxuXHJcbiAgZnVuY3Rpb24gaGlnaGxpZ2h0KCkge1xyXG4gICAgY29udGFpbmVyLmNsYXNzTGlzdC5hZGQoJ2hpZ2hsaWdodCcpO1xyXG4gIH07XHJcblxyXG4gIGZ1bmN0aW9uIHVuaGlnaGxpZ2h0KCkge1xyXG4gICAgY29udGFpbmVyLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZ2hsaWdodCcpO1xyXG4gIH07XHJcblxyXG4gIGZ1bmN0aW9uIGhhbmRsZUZpbGVzKGZpbGVzKSB7XHJcbiAgICBhZGRpbmdzLmNsYXNzTGlzdC5hZGQoJ2lzLXNob3cnKTtcclxuICAgIGNvbnRhaW5lci5jbGFzc0xpc3QuYWRkKCdoYXMtcmVzdWx0Jyk7XHJcbiAgICBmaWxlTmFtZS50ZXh0Q29udGVudCA9IGZpbGVzWzBdLm5hbWU7XHJcbiAgfTtcclxuXHJcbiAgZnVuY3Rpb24gaGFuZGxlUmVtb3ZlRmlsZXMoKSB7XHJcbiAgICBhZGRpbmdzLmNsYXNzTGlzdC5yZW1vdmUoJ2lzLXNob3cnKTtcclxuICAgIGNvbnRhaW5lci5jbGFzc0xpc3QucmVtb3ZlKCdoYXMtcmVzdWx0Jyk7XHJcbiAgICBmaWxlTmFtZS50ZXh0Q29udGVudCA9ICcnO1xyXG4gICAgZmlsZUVsZW0udmFsdWUgPSAnJztcclxuICB9O1xyXG5cclxuICBmdW5jdGlvbiBoYW5kbGVEcm9wKGUpIHtcclxuICAgIGxldCBkdCA9IGUuZGF0YVRyYW5zZmVyO1xyXG4gICAgbGV0IGZpbGVzID0gZHQuZmlsZXM7XHJcblxyXG4gICAgaWYgKCBWYWxpZGF0ZSh0aGlzKSApIHtcclxuICAgICAgaGFuZGxlRmlsZXMoZmlsZXMpO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIGZpbGVFbGVtLmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIGZ1bmN0aW9uKCkge1xyXG4gICAgaWYgKCBWYWxpZGF0ZSh0aGlzKSApIHtcclxuICAgICAgaGFuZGxlRmlsZXModGhpcy5maWxlcyk7XHJcbiAgICB9XHJcbiAgfSk7XHJcblxyXG4gIHJlbW92ZXIuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbigpIHtcclxuICAgIGhhbmRsZVJlbW92ZUZpbGVzKCk7XHJcbiAgfSk7XHJcblxyXG4gIFsnZHJhZ2VudGVyJywgJ2RyYWdvdmVyJywgJ2RyYWdsZWF2ZScsICdkcm9wJ10uZm9yRWFjaChldmVudE5hbWUgPT4ge1xyXG4gICAgZHJvcEFyZWEuYWRkRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIHByZXZlbnREZWZhdWx0cywgZmFsc2UpO1xyXG4gIH0pO1xyXG5cclxuICBbJ2RyYWdlbnRlcicsICdkcmFnb3ZlciddLmZvckVhY2goZXZlbnROYW1lID0+IHtcclxuICAgIGRyb3BBcmVhLmFkZEV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCBoaWdobGlnaHQsIGZhbHNlKTtcclxuICB9KTtcclxuICBcclxuICBbJ2RyYWdsZWF2ZScsICdkcm9wJ10uZm9yRWFjaChldmVudE5hbWUgPT4ge1xyXG4gICAgZHJvcEFyZWEuYWRkRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIHVuaGlnaGxpZ2h0LCBmYWxzZSk7XHJcbiAgfSk7XHJcblxyXG4gIGRyb3BBcmVhLmFkZEV2ZW50TGlzdGVuZXIoJ2Ryb3AnLCBoYW5kbGVEcm9wLCBmYWxzZSk7XHJcblxyXG4gIHZhciBfdmFsaWRGaWxlRXh0ZW5zaW9ucyA9IFsnLnppcCcsICcucmFyJ107XHJcblxyXG4gIGZ1bmN0aW9uIFZhbGlkYXRlKGlucHV0KSB7XHJcbiAgICB2YXIgc0ZpbGVOYW1lID0gaW5wdXQudmFsdWU7XHJcblxyXG4gICAgaWYgKHNGaWxlTmFtZS5sZW5ndGggPiAwKSB7XHJcbiAgICAgIHZhciBibG5WYWxpZCA9IGZhbHNlO1xyXG4gICAgICBmb3IgKHZhciBqID0gMDsgaiA8IF92YWxpZEZpbGVFeHRlbnNpb25zLmxlbmd0aDsgaisrKSB7XHJcbiAgICAgICAgdmFyIHNDdXJFeHRlbnNpb24gPSBfdmFsaWRGaWxlRXh0ZW5zaW9uc1tqXTtcclxuICAgICAgICBpZiAoc0ZpbGVOYW1lLnN1YnN0cihzRmlsZU5hbWUubGVuZ3RoIC0gc0N1ckV4dGVuc2lvbi5sZW5ndGgsIHNDdXJFeHRlbnNpb24ubGVuZ3RoKS50b0xvd2VyQ2FzZSgpID09IHNDdXJFeHRlbnNpb24udG9Mb3dlckNhc2UoKSkge1xyXG4gICAgICAgICAgYmxuVmFsaWQgPSB0cnVlO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoIWJsblZhbGlkKSB7XHJcbiAgICAgICAgY29udGFpbmVyLmNsYXNzTGlzdC5hZGQoJ2hhcy1lcnJvcicpO1xyXG5cclxuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgY29udGFpbmVyLmNsYXNzTGlzdC5yZW1vdmUoJ2hhcy1lcnJvcicpO1xyXG4gICAgICAgIH0sIDIwMDApXHJcblxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0cnVlO1xyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gaW5pdFJhbmdlKCkge1xyXG4gIHZhciBzbGlkZXJzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmpzLXJhbmdlJyk7XHJcblxyXG4gIGlmICggc2xpZGVycy5sZW5ndGggKSB7XHJcbiAgICBmb3IgKGNvbnN0IHNsaWRlciBvZiBzbGlkZXJzKSB7XHJcbiAgICAgIGxldCBzbGlkZXJSYW5nZTtcclxuICAgICAgbGV0IHNsaWRlck1pbiA9IE51bWJlcihzbGlkZXIuZGF0YXNldC5taW4pO1xyXG4gICAgICBsZXQgc2xpZGVyTWF4ID0gTnVtYmVyKHNsaWRlci5kYXRhc2V0Lm1heCk7XHJcbiAgICAgIGxldCBzbGlkZXJTdGVwID0gTnVtYmVyKHNsaWRlci5kYXRhc2V0LnN0ZXApO1xyXG4gICAgICBsZXQgc2xpZGVyUGlwcyA9IE51bWJlcihzbGlkZXIuZGF0YXNldC5waXBzKTtcclxuXHJcbiAgICAgIGlmICggc2xpZGVyLmRhdGFzZXQuaW5kaXZpZHVhbCApIHtcclxuICAgICAgICBzbGlkZXJSYW5nZSA9IHtcclxuICAgICAgICAgICdtaW4nOiBbMF0sXHJcbiAgICAgICAgICAnMTAlJzogWzIsIDJdLFxyXG4gICAgICAgICAgJ21heCc6IFs4XVxyXG4gICAgICAgIH07XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgc2xpZGVyUmFuZ2UgPSB7XHJcbiAgICAgICAgICAnbWluJzogc2xpZGVyTWluLFxyXG4gICAgICAgICAgJ21heCc6IHNsaWRlck1heFxyXG4gICAgICAgIH07XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIG5vVWlTbGlkZXIuY3JlYXRlKHNsaWRlciwge1xyXG4gICAgICAgIHN0YXJ0OiBbMF0sXHJcbiAgICAgICAgc3RlcDogc2xpZGVyU3RlcCxcclxuICAgICAgICByYW5nZTogc2xpZGVyUmFuZ2UsXHJcbiAgICAgICAgY29ubmVjdDogJ2xvd2VyJyxcclxuICAgICAgICB0b29sdGlwczogdHJ1ZSxcclxuICAgICAgICBmb3JtYXQ6IHdOdW1iKHtcclxuICAgICAgICAgIGRlY2ltYWxzOiAzLFxyXG4gICAgICAgICAgdGhvdXNhbmQ6ICcuJyxcclxuICAgICAgICB9KSxcclxuICAgICAgICBwaXBzOiB7XHJcbiAgICAgICAgICBtb2RlOiAnY291bnQnLFxyXG4gICAgICAgICAgdmFsdWVzOiBzbGlkZXJQaXBzLFxyXG4gICAgICAgICAgc3RlcHBlZDogZmFsc2VcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgbGV0IG1pbmlNYXJrZXJzID0gc2xpZGVyLnF1ZXJ5U2VsZWN0b3JBbGwoJy5ub1VpLW1hcmtlci1ob3Jpem9udGFsLm5vVWktbWFya2VyJyk7XHJcblxyXG4gICAgICBpZiAoIG1pbmlNYXJrZXJzLmxlbmd0aCApIHtcclxuICAgICAgICBmb3IgKCBjb25zdCBtaW5pTWFya2VyIG9mIG1pbmlNYXJrZXJzICkge1xyXG4gICAgICAgICAgbWluaU1hcmtlci5yZW1vdmUoKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGluaXRIZWFkZXJUb2dnbGVyKCkge1xyXG4gIGxldCB0b2dnbGVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLWhlYWRlci10b2dnbGVyJyk7XHJcbiAgbGV0IGhlYWRlciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy1oZWFkZXInKTtcclxuICBsZXQgcGFnZVdyYXAgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtcGFnZS13cmFwJyk7XHJcbiAgbGV0IGRhcmtuZXNzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLWhlYWRlci1kYXJrbmVzcycpO1xyXG5cclxuICBpZiAoIHRvZ2dsZXIgJiYgaGVhZGVyICYmIHBhZ2VXcmFwICYmIGRhcmtuZXNzICkge1xyXG4gICAgdG9nZ2xlci5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKCkge1xyXG4gICAgICBoZWFkZXIuY2xhc3NMaXN0LnRvZ2dsZSgnaXMtb3BlbicpO1xyXG4gICAgICB0b2dnbGVyLmNsYXNzTGlzdC50b2dnbGUoJ2lzLWFjdGl2ZScpO1xyXG4gICAgICBwYWdlV3JhcC5jbGFzc0xpc3QudG9nZ2xlKCdzY3JvbGwtYmxvY2tlZC1tb2JpbGUnKTtcclxuICAgIH0pO1xyXG5cclxuICAgIGRhcmtuZXNzLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgIGhlYWRlci5jbGFzc0xpc3QucmVtb3ZlKCdpcy1vcGVuJyk7XHJcbiAgICAgIHRvZ2dsZXIuY2xhc3NMaXN0LnJlbW92ZSgnaXMtYWN0aXZlJyk7XHJcbiAgICAgIHBhZ2VXcmFwLmNsYXNzTGlzdC5yZW1vdmUoJ3Njcm9sbC1ibG9ja2VkLW1vYmlsZScpO1xyXG4gICAgfSk7XHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBpbml0QWxidW1zQ2FyZFNsaWRlcigpIHtcclxuICB2YXIgbXlTd2lwZXIgPSBuZXcgU3dpcGVyKCcuanMtYWxidW1zLWNhcmQtc2xpZGVyJywge1xyXG4gICAgc3BlZWQ6IDQwMCxcclxuICAgIHNsaWRlc1BlclZpZXc6IDEsXHJcbiAgICBuYXZpZ2F0aW9uOiB7XHJcbiAgICAgIG5leHRFbDogJy5zd2lwZXItYnV0dG9uLW5leHQnLFxyXG4gICAgICBwcmV2RWw6ICcuc3dpcGVyLWJ1dHRvbi1wcmV2JyxcclxuICAgIH0sXHJcbiAgfSk7XHJcblxyXG4gIHJldHVybiBteVN3aXBlcjtcclxufVxyXG5cclxuZnVuY3Rpb24gaW5pdEFsYnVtU2xpZGVyKCkge1xyXG4gIHZhciBteVN3aXBlciA9IG5ldyBTd2lwZXIoJy5qcy1zd2lwZXItYWxidW0nLCB7XHJcbiAgICBzcGVlZDogNDAwLFxyXG4gICAgc2xpZGVzUGVyVmlldzogMSxcclxuICAgIGxvb3A6IGZhbHNlLFxyXG4gICAgcHJlbG9hZEltYWdlczogZmFsc2UsXHJcbiAgICBzcGFjZUJldHdlZW46IDEyLFxyXG4gICAgbGF6eTogdHJ1ZSxcclxuICAgIG5hdmlnYXRpb246IHtcclxuICAgICAgbmV4dEVsOiAnLnN3aXBlci1idXR0b24tbmV4dCcsXHJcbiAgICAgIHByZXZFbDogJy5zd2lwZXItYnV0dG9uLXByZXYnLFxyXG4gICAgfSxcclxuICB9KTtcclxuXHJcbiAgcmV0dXJuIG15U3dpcGVyO1xyXG59XHJcblxyXG5mdW5jdGlvbiBpbml0U3dpcGVyKCkge1xyXG4gIGxldCB0YXJnZXRzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmpzLXN3aXBlci1jb250YWluZXInKTtcclxuXHJcbiAgaWYgKCAhdGFyZ2V0cy5sZW5ndGggKSB7XHJcbiAgICByZXR1cm47XHJcbiAgfVxyXG5cclxuICBsZXQgc3dpcGVycyA9IFtdO1xyXG5cclxuICB0YXJnZXRzLmZvckVhY2goICh0YXJnZXQsIGluZGV4KSA9PiB7XHJcbiAgICBpZiAoIGluZGV4ID09IDAgfHwgIXRhcmdldC5jbGFzc0xpc3QuY29udGFpbnMoJ3N3aXBlci1jb250YWluZXItZmF0JykgKSB7XHJcbiAgICAgIHZhciBteVN3aXBlciA9IG5ldyBTd2lwZXIodGFyZ2V0LCB7XHJcbiAgICAgICAgc3BlZWQ6IDQwMCxcclxuICAgICAgICBzbGlkZXNQZXJWaWV3OiA2LFxyXG4gICAgICAgIHNwYWNlQmV0d2VlbjogMzAsXHJcbiAgICAgICAgbG9vcDogZmFsc2UsXHJcbiAgICAgICAgcHJlbG9hZEltYWdlczogZmFsc2UsXHJcbiAgICAgICAgbGF6eTogdHJ1ZSwgXHJcbiAgICAgICAgbmF2aWdhdGlvbjoge1xyXG4gICAgICAgICAgbmV4dEVsOiAnLnN3aXBlci1idXR0b24tbmV4dCcsXHJcbiAgICAgICAgICBwcmV2RWw6ICcuc3dpcGVyLWJ1dHRvbi1wcmV2JyxcclxuICAgICAgICB9LFxyXG4gICAgICAgIGJyZWFrcG9pbnRzOiB7XHJcbiAgICAgICAgICA0NTk6IHtcclxuICAgICAgICAgICAgc2xpZGVzUGVyVmlldzogMSxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICA1OTk6IHtcclxuICAgICAgICAgICAgc2xpZGVzUGVyVmlldzogMixcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICA3Njc6IHtcclxuICAgICAgICAgICAgc2xpZGVzUGVyVmlldzogMyxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICAxMTk5OiB7XHJcbiAgICAgICAgICAgIHNsaWRlc1BlclZpZXc6IDQsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB2YXIgbXlTd2lwZXIgPSBuZXcgU3dpcGVyKHRhcmdldCwge1xyXG4gICAgICAgIHNwZWVkOiA0MDAsXHJcbiAgICAgICAgc2xpZGVzUGVyVmlldzogNCxcclxuICAgICAgICBzcGFjZUJldHdlZW46IDMwLFxyXG4gICAgICAgIGxvb3A6IGZhbHNlLFxyXG4gICAgICAgIHByZWxvYWRJbWFnZXM6IGZhbHNlLFxyXG4gICAgICAgIGxhenk6IHRydWUsIFxyXG4gICAgICAgIG5hdmlnYXRpb246IHtcclxuICAgICAgICAgIG5leHRFbDogJy5zd2lwZXItYnV0dG9uLW5leHQnLFxyXG4gICAgICAgICAgcHJldkVsOiAnLnN3aXBlci1idXR0b24tcHJldicsXHJcbiAgICAgICAgfSxcclxuICAgICAgICBicmVha3BvaW50czoge1xyXG4gICAgICAgICAgNzY3OiB7XHJcbiAgICAgICAgICAgIHNsaWRlc1BlclZpZXc6IDEsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgMTE5OToge1xyXG4gICAgICAgICAgICBzbGlkZXNQZXJWaWV3OiAyLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHN3aXBlcnMucHVzaChteVN3aXBlcik7XHJcbiAgfSk7XHJcblxyXG4gIHJldHVybiBzd2lwZXJzO1xyXG59XHJcblxyXG5mdW5jdGlvbiBpbml0U3dpcGVyU3RhdGljaygpIHtcclxuICB2YXIgbXlTd2lwZXIgPSBuZXcgU3dpcGVyKCcuanMtc3dpcGVyLWNvbnRhaW5lci1zdGF0aWNrJywge1xyXG4gICAgc3BlZWQ6IDQwMCxcclxuICAgIHNsaWRlc1BlclZpZXc6IDYsXHJcbiAgICBzcGFjZUJldHdlZW46IDQwLFxyXG4gICAgbG9vcDogZmFsc2UsXHJcbiAgICBwcmVsb2FkSW1hZ2VzOiBmYWxzZSxcclxuICAgIGxhenk6IHRydWUsXHJcbiAgICBmb2xsb3dGaW5nZXI6IGZhbHNlLFxyXG4gICAgYnJlYWtwb2ludHM6IHtcclxuICAgICAgNDU5OiB7XHJcbiAgICAgICAgc2xpZGVzUGVyVmlldzogMSxcclxuICAgICAgfSxcclxuICAgICAgNTk5OiB7XHJcbiAgICAgICAgc2xpZGVzUGVyVmlldzogMixcclxuICAgICAgfSxcclxuICAgICAgNzY3OiB7XHJcbiAgICAgICAgc2xpZGVzUGVyVmlldzogMyxcclxuICAgICAgfSxcclxuICAgICAgMTE5OToge1xyXG4gICAgICAgIHNsaWRlc1BlclZpZXc6IDQsXHJcbiAgICAgIH0sXHJcbiAgICB9XHJcbiAgfSk7XHJcblxyXG4gIHJldHVybiBteVN3aXBlcjtcclxufVxyXG5cclxuZnVuY3Rpb24gaW5pdE1haW5Td2lwZXIoKSB7XHJcbiAgdmFyIG15U3dpcGVyID0gbmV3IFN3aXBlcignLmpzLW1haW4tc3dpcGVyLWNvbnRhaW5lcicsIHtcclxuICAgIHNwZWVkOiA0MDAsXHJcbiAgICBzbGlkZXNQZXJWaWV3OiAxLFxyXG4gICAgbG9vcDogdHJ1ZSxcclxuICAgIHNwYWNlQmV0d2VlbjogMTIsXHJcbiAgICBhdXRvSGVpZ2h0OiB0cnVlLFxyXG4gICAgcGFnaW5hdGlvbjoge1xyXG4gICAgICBlbDogJy5zd2lwZXItcGFnaW5hdGlvbicsXHJcbiAgICAgIHR5cGU6ICdidWxsZXRzJyxcclxuICAgICAgY2xpY2thYmxlOiB0cnVlXHJcbiAgICB9LFxyXG4gICAgbmF2aWdhdGlvbjoge1xyXG4gICAgICBuZXh0RWw6ICcuanMtc3dpcGVyLW1haW4tbmV4dCcsXHJcbiAgICAgIHByZXZFbDogJy5qcy1zd2lwZXItbWFpbi1wcmV2JyxcclxuICAgIH0sXHJcbiAgfSk7XHJcblxyXG4gIHJldHVybiBteVN3aXBlcjtcclxufVxyXG5cclxuZnVuY3Rpb24gaW5pdE1vZGFsU3dpcGVyKCkge1xyXG4gIHZhciBteVN3aXBlciA9IG5ldyBTd2lwZXIoJy5qcy1tYWluLXN3aXBlci1tb2RhbCcsIHtcclxuICAgIHNwZWVkOiA0MDAsXHJcbiAgICBzbGlkZXNQZXJWaWV3OiAxLFxyXG4gICAgbG9vcDogdHJ1ZSxcclxuICAgIHNwYWNlQmV0d2VlbjogMTIsXHJcbiAgICBwcmVsb2FkSW1hZ2VzOiBmYWxzZSxcclxuICAgIGxhenk6IHRydWUsXHJcbiAgICBhdXRvSGVpZ2h0OiB0cnVlLFxyXG4gICAgcGFnaW5hdGlvbjoge1xyXG4gICAgICBlbDogJy5zd2lwZXItcGFnaW5hdGlvbicsXHJcbiAgICAgIHR5cGU6ICdidWxsZXRzJyxcclxuICAgICAgY2xpY2thYmxlOiB0cnVlXHJcbiAgICB9LFxyXG4gICAgbmF2aWdhdGlvbjoge1xyXG4gICAgICBuZXh0RWw6ICcuanMtbW9kYWwtc3dpcGVyLW5leHQnLFxyXG4gICAgICBwcmV2RWw6ICcuanMtbW9kYWwtc3dpcGVyLXByZXYnLFxyXG4gICAgfSxcclxuICB9KTtcclxuXHJcbiAgcmV0dXJuIG15U3dpcGVyO1xyXG59XHJcblxyXG5mdW5jdGlvbiBpbml0QWxidW1zVHlwZVNsaWRlcigpIHtcclxuICB2YXIgbXlTd2lwZXIgPSBuZXcgU3dpcGVyKCcuanMtdHlwZS1hbGJ1bXMtc3dpcGVyJywge1xyXG4gICAgc3BlZWQ6IDQwMCxcclxuICAgIHNsaWRlc1BlclZpZXc6ICdhdXRvJyxcclxuICAgIHNsaWRlc09mZnNldEFmdGVyOiAxMDAsXHJcbiAgICBzcGFjZUJldHdlZW46IDI0LFxyXG4gICAgbmF2aWdhdGlvbjoge1xyXG4gICAgICBuZXh0RWw6ICcuc3dpcGVyLWJ1dHRvbi1uZXh0JyxcclxuICAgICAgcHJldkVsOiAnLnN3aXBlci1idXR0b24tcHJldicsXHJcbiAgICB9LFxyXG4gICAgb246IHtcclxuICAgICAgc2xpZGVDaGFuZ2U6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBpZiAoIHRoaXMuYWN0aXZlSW5kZXggPiAwICkge1xyXG4gICAgICAgICAgdGhpcy5lbC5jbGFzc0xpc3QuYWRkKCdub3Qtb24tc3RhcnQnKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgdGhpcy5lbC5jbGFzc0xpc3QucmVtb3ZlKCdub3Qtb24tc3RhcnQnKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIH0pO1xyXG5cclxuICByZXR1cm4gbXlTd2lwZXI7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGluaXRNYWluQ2FyZHNTbGlkZXIoKSB7XHJcbiAgdmFyIG15U3dpcGVyID0gbmV3IFN3aXBlcignLmpzLW1haW4tY2FyZC1zbGlkZXInLCB7XHJcbiAgICBzcGVlZDogNDAwLFxyXG4gICAgc2xpZGVzUGVyVmlldzogMSxcclxuICAgIGxvb3A6IHRydWUsXHJcbiAgICBzcGFjZUJldHdlZW46IDEyLFxyXG4gICAgbmF2aWdhdGlvbjoge1xyXG4gICAgICBuZXh0RWw6ICcuc3dpcGVyLWJ1dHRvbi1uZXh0JyxcclxuICAgICAgcHJldkVsOiAnLnN3aXBlci1idXR0b24tcHJldicsXHJcbiAgICB9LFxyXG4gIH0pO1xyXG5cclxuICByZXR1cm4gbXlTd2lwZXI7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHRhYih0YWJIYW5kbGVyKSB7XHJcbiAgICBsZXQgdGFic0NvbnRhaW5lciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuanMtdGFiLWNvbnRhaW5lclwiKTtcclxuXHJcbiAgICBpZiAoIHRhYnNDb250YWluZXIgKSB7XHJcbiAgICAgIGxldCBtZW51SXRlbXMgPSB0YWJzQ29udGFpbmVyLnF1ZXJ5U2VsZWN0b3JBbGwoXCIuanMtdGFiLW1lbnUtaXRlbVwiKTtcclxuXHJcbiAgICAgIG1lbnVJdGVtcy5mb3JFYWNoKCAobWVudUl0ZW0pID0+IHtcclxuXHJcbiAgICAgICAgbWVudUl0ZW0ub25jbGljayA9ICgpID0+IHtcclxuICAgICAgICAgIGxldCBhY3RpdmVNZW51SXRlbSA9IEFycmF5LmZyb20obWVudUl0ZW1zKS5maW5kKGdldEFjdGl2ZVRhYik7XHJcbiAgICAgICAgICBsZXQgYWN0aXZlQ29udGVudEl0ZW0gPSB0YWJzQ29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoYWN0aXZlTWVudUl0ZW0uZGF0YXNldC50YXJnZXQpO1xyXG4gICAgICAgICAgbGV0IGN1cnJlbnRDb250ZW50SXRlbSA9IHRhYnNDb250YWluZXIucXVlcnlTZWxlY3RvcihtZW51SXRlbS5kYXRhc2V0LnRhcmdldCk7XHJcblxyXG4gICAgICAgICAgYWN0aXZlTWVudUl0ZW0uY2xhc3NMaXN0LnJlbW92ZShcImlzLWFjdGl2ZVwiKTtcclxuXHJcbiAgICAgICAgICBpZiAoIGFjdGl2ZUNvbnRlbnRJdGVtICkge1xyXG4gICAgICAgICAgICBhY3RpdmVDb250ZW50SXRlbS5jbGFzc0xpc3QucmVtb3ZlKFwiaXMtYWN0aXZlXCIpO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIGlmICggY3VycmVudENvbnRlbnRJdGVtICkge1xyXG4gICAgICAgICAgICBjdXJyZW50Q29udGVudEl0ZW0uY2xhc3NMaXN0LmFkZChcImlzLWFjdGl2ZVwiKTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICBtZW51SXRlbS5jbGFzc0xpc3QuYWRkKFwiaXMtYWN0aXZlXCIpO1xyXG5cclxuICAgICAgICAgIGlmICggdGFiSGFuZGxlciApIHtcclxuICAgICAgICAgICAgZG9jdW1lbnQuZGlzcGF0Y2hFdmVudCh0YWJIYW5kbGVyKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgZnVuY3Rpb24gZ2V0QWN0aXZlVGFiKGVsZW1lbnQpIHtcclxuICAgIHJldHVybiBlbGVtZW50LmNsYXNzTGlzdC5jb250YWlucyhcImlzLWFjdGl2ZVwiKTtcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGFjY29yZGlvbigpIHtcclxuICBsZXQgd3JhcHBlciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy1hY2NvcmRpb24nKTtcclxuICB3cmFwcGVyLmZvckVhY2god3JhcHBlckl0ZW0gPT4ge1xyXG4gICAgbGV0IGl0ZW1zID0gd3JhcHBlckl0ZW0ucXVlcnlTZWxlY3RvckFsbCgnLmpzLWFjY29yZGlvbi1pdGVtJyk7XHJcbiAgICBsZXQgaW5kaXZpZHVhbCA9IHdyYXBwZXJJdGVtLmdldEF0dHJpYnV0ZSgnaW5kaXZpZHVhbCcpICYmIHdyYXBwZXJJdGVtLmdldEF0dHJpYnV0ZSgnaW5kaXZpZHVhbCcpICE9PSAnZmFsc2UnO1xyXG5cclxuICAgIGl0ZW1zLmZvckVhY2goaXRlbSA9PiB7XHJcbiAgICAgIGlmICggaXRlbS5jbGFzc0xpc3QuY29udGFpbnMoJ2lzLWFjdGl2ZScpICkge1xyXG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgbGV0IHJlYWR5Q29udGVudCA9IGl0ZW0ucXVlcnlTZWxlY3RvcignLmpzLWFjY29yZGlvbi1jb250ZW50Jyk7XHJcbiAgICAgICAgICBsZXQgcmVhZHlDb250ZW50SGVpZ2h0ID0gcmVhZHlDb250ZW50LnNjcm9sbEhlaWdodDtcclxuXHJcbiAgICAgICAgICByZWFkeUNvbnRlbnQuc3R5bGUubWF4SGVpZ2h0ID0gcmVhZHlDb250ZW50SGVpZ2h0ICsgJ3B4JztcclxuICAgICAgICB9LCAxMDApO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBsZXQgc3ViSXRlbXMgPSBpdGVtLnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy1hY2NvcmRpb24tc3ViaXRlbScpO1xyXG5cclxuICAgICAgZm9yIChjb25zdCBzdWJJdGVtIG9mIHN1Ykl0ZW1zKSB7XHJcbiAgICAgICAgaWYgKCBzdWJJdGVtLmNsYXNzTGlzdC5jb250YWlucygnaXMtYWN0aXZlJykgKSB7XHJcbiAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgbGV0IHJlYWR5Q29udGVudCA9IHN1Ykl0ZW0ucXVlcnlTZWxlY3RvcignLmpzLWFjY29yZGlvbi1jb250ZW50Jyk7XHJcbiAgICAgICAgICAgIGxldCByZWFkeUNvbnRlbnRIZWlnaHQgPSByZWFkeUNvbnRlbnQuc2Nyb2xsSGVpZ2h0O1xyXG4gIFxyXG4gICAgICAgICAgICByZWFkeUNvbnRlbnQuc3R5bGUubWF4SGVpZ2h0ID0gcmVhZHlDb250ZW50SGVpZ2h0ICsgJ3B4JztcclxuICAgICAgICAgIH0sIDEwMCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICBpdGVtSXRlcmF0aW9uKGl0ZW0sIGl0ZW1zLCBpbmRpdmlkdWFsKTtcclxuXHJcbiAgICAgIHN1Ykl0ZW1zLmZvckVhY2goc3ViaXRlbSA9PiB7XHJcbiAgICAgICAgaXRlbUl0ZXJhdGlvbihzdWJpdGVtLCBzdWJJdGVtcywgaW5kaXZpZHVhbCwgdHJ1ZSlcclxuICAgICAgfSk7XHJcbiAgICB9KVxyXG4gIH0pXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGl0ZW1JdGVyYXRpb24oaXRlbSwgaXRlbXMsIGluZGl2aWR1YWwsIGlzU3ViaXRlbSkge1xyXG4gIGxldCBpbml0ID0gaXRlbS5xdWVyeVNlbGVjdG9yKCcuanMtYWNjb3JkaW9uLWluaXQnKTtcclxuICBsZXQgY29udGVudCA9IGl0ZW0ucXVlcnlTZWxlY3RvcignLmpzLWFjY29yZGlvbi1jb250ZW50Jyk7XHJcblxyXG4gIGlmICggaXNTdWJpdGVtID09PSB0cnVlICkge1xyXG4gICAgY29udGVudC5hZGRFdmVudExpc3RlbmVyKCd0cmFuc2l0aW9uZW5kJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgIGxldCBwYXJlbnRJdGVtID0gaXRlbS5jbG9zZXN0KCcuanMtYWNjb3JkaW9uLWl0ZW0nKTtcclxuICAgICAgbGV0IHBhcmVudENvbnRlbnRIZWlnaHQgPSBwYXJlbnRJdGVtLnNjcm9sbEhlaWdodCArICdweCc7XHJcbiAgICAgIGxldCBwYXJlbnRDb250ZW50ID0gcGFyZW50SXRlbS5xdWVyeVNlbGVjdG9yKCcuanMtYWNjb3JkaW9uLWNvbnRlbnQnKTtcclxuXHJcbiAgICAgIHBhcmVudENvbnRlbnQuc2V0QXR0cmlidXRlKCdzdHlsZScsIGBtYXgtaGVpZ2h0OiAke3BhcmVudENvbnRlbnRIZWlnaHR9YCk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIGluaXQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbigpIHtcclxuICAgIGlmICggaXRlbS5jbGFzc0xpc3QuY29udGFpbnMoJ2lzLWFjdGl2ZScpICkge1xyXG4gICAgICBpdGVtLmNsYXNzTGlzdC5yZW1vdmUoJ2lzLWFjdGl2ZScpO1xyXG4gICAgICBjb250ZW50LnN0eWxlLm1heEhlaWdodCA9ICcwcHgnO1xyXG5cclxuICAgICAgcmV0dXJuIGZhbHNlXHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCBpc1N1Yml0ZW0gPT09IHRydWUgKSB7XHJcbiAgICAgIGxldCBwYXJlbnRJdGVtID0gaXRlbS5jbG9zZXN0KCcuanMtYWNjb3JkaW9uLWl0ZW0nKTtcclxuICAgICAgbGV0IHBhcmVudENvbnRlbnQgPSBwYXJlbnRJdGVtLnF1ZXJ5U2VsZWN0b3IoJy5qcy1hY2NvcmRpb24tY29udGVudCcpO1xyXG5cclxuICAgICAgcGFyZW50Q29udGVudC5zZXRBdHRyaWJ1dGUoJ3N0eWxlJywgYG1heC1oZWlnaHQ6IG5vbmVgKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIGluZGl2aWR1YWwgKSB7XHJcbiAgICAgIGl0ZW1zLmZvckVhY2goKGVsZW0pID0+IHtcclxuICAgICAgICBsZXQgZWxlbUNvbnRlbnQgPSBlbGVtLnF1ZXJ5U2VsZWN0b3IoJy5qcy1hY2NvcmRpb24tY29udGVudCcpO1xyXG4gICAgICAgIGVsZW0uY2xhc3NMaXN0LnJlbW92ZSgnaXMtYWN0aXZlJyk7XHJcbiAgICAgICAgZWxlbUNvbnRlbnQuc3R5bGUubWF4SGVpZ2h0ID0gMCArICdweCc7XHJcbiAgICAgIH0pXHJcbiAgICB9XHJcblxyXG4gICAgaXRlbS5jbGFzc0xpc3QuYWRkKCdpcy1hY3RpdmUnKTtcclxuICAgIGNvbnRlbnQuc3R5bGUubWF4SGVpZ2h0ID0gY29udGVudC5zY3JvbGxIZWlnaHQgKyAncHgnO1xyXG4gIH0pO1xyXG59Il19
