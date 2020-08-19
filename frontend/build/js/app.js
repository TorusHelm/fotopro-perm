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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XHJcblxyXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgZnVuY3Rpb24oKSB7XHJcbiAgbGV0IHRhYkhhbmRsZXIgPSBuZXcgRXZlbnQoJ3RhYkhhbmRsZXInKTtcclxuICBsZXQgbW9kYWxTd2lwZXIgPSBpbml0TW9kYWxTd2lwZXIoKTtcclxuICBsZXQgc3dpcGVycyA9IGluaXRTd2lwZXIoKTtcclxuICBzdmc0ZXZlcnlib2R5KCk7XHJcbiAgaW5pdE1haW5Td2lwZXIoKTtcclxuICBpbml0SGVhZGVyVG9nZ2xlcigpO1xyXG4gIGluaXRBbGJ1bXNDYXJkU2xpZGVyKCk7XHJcbiAgYWNjb3JkaW9uKCk7XHJcbiAgaW5pdEFsYnVtc1R5cGVTbGlkZXIoKTtcclxuICBpbml0U3dpcGVyU3RhdGljaygpO1xyXG4gIGluaXRBbGJ1bVNsaWRlcigpO1xyXG4gIHRhYih0YWJIYW5kbGVyKTtcclxuICBpbml0UmFuZ2UoKTtcclxuICBpbml0RHJhZ05Ecm9wKCk7XHJcbiAgaW5pdE1vZGFsKG1vZGFsU3dpcGVyKTtcclxuICB2YWxpZGF0ZUZyb20oKTtcclxuICBjYXJkSGVhZGVySGFuZGxlKG1vZGFsU3dpcGVyLCAnL2FwaS9hbGJ1bS9pbWFnZXNfc2xpZGVyP2lkPScpO1xyXG4gIGNob2ljZVR5cGUoKTtcclxuICBzZXRIYW5kbGVyc1ByaWNlKCk7XHJcbiAgZ2V0VHJ1ZVByaWNlQ2FyZCgpO1xyXG5cclxuICBpZiAoIHdpbmRvdy5sb2NhdGlvbi5oYXNoICkge1xyXG4gICAgbGV0IHRhcmdldCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYFtkYXRhLXRhcmdldD1cIiR7d2luZG93LmxvY2F0aW9uLmhhc2h9XCJdYCk7XHJcblxyXG4gICAgaWYgKCB0YXJnZXQgKSB7XHJcbiAgICAgIHRhcmdldC5jbGljaygpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigndGFiSGFuZGxlcicsIGZ1bmN0aW9uKCkge1xyXG4gICAgaWYgKCAhc3dpcGVycy5sZW5ndGggKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBzd2lwZXJzLmZvckVhY2goc3dpcGVyID0+IHtcclxuICAgICAgc3dpcGVyLnVwZGF0ZSgpO1xyXG4gICAgfSk7XHJcblxyXG4gIH0sIGZhbHNlKTtcclxuXHJcbiAgaWYgKCB3aW5kb3cuaW5uZXJXaWR0aCA8IDc2OCApIHtcclxuICAgIGluaXRNYWluQ2FyZHNTbGlkZXIoKTtcclxuICB9XHJcbn0pO1xyXG5cclxuZnVuY3Rpb24gZ2V0VHJ1ZVByaWNlQ2FyZCgpIHtcclxuICBsZXQgdGFyZ2V0cyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy1jYXJkLXByaWNlLXdyYXBwZXInKTtcclxuXHJcbiAgaWYgKCB0YXJnZXRzLmxlbmd0aCApIHtcclxuICAgIGZvciAoY29uc3QgdGFyZ2V0IG9mIHRhcmdldHMpIHtcclxuICAgICAgbGV0IGlucHV0ID0gdGFyZ2V0LnF1ZXJ5U2VsZWN0b3IoJy5qcy1jYXJkLXByaWNlIGlucHV0Jyk7XHJcbiAgICAgIGxldCBvdXRwdXQgPSB0YXJnZXQucXVlcnlTZWxlY3RvcignLmpzLWNhcmQtcHJpY2Utb3V0cHV0Jyk7XHJcbiAgICAgIGxldCBiYXNlUHJpY2UgPSArb3V0cHV0LmRhdGFzZXQucHJpY2U7XHJcblxyXG4gICAgICBpbnB1dC5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBsZXQgcGVyY2FudGFnZSA9IGdldERpc2NvdW50UGVyY2VudCgraW5wdXQudmFsdWUpO1xyXG4gICAgICAgIGxldCBkaXNjb3VudFByaWNlID0gZ2V0RGlzY291bnRTdW1tKGJhc2VQcmljZSwgcGVyY2FudGFnZSk7XHJcblxyXG4gICAgICAgIG91dHB1dC50ZXh0Q29udGVudCA9IChiYXNlUHJpY2UgLSBkaXNjb3VudFByaWNlKSArICcg4oK9JztcclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBjaG9pY2VUeXBlKCkge1xyXG4gIGxldCB0eXBlcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy1jaG9pY2UtdHlwZScpO1xyXG4gIGxldCBjb250YWluZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtY2hvaWNlLXR5cGUtYWRkaW5ncycpO1xyXG4gIGxldCBvdXRwdXRDb250YWluZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtY2hvaWNlLXR5cGUtb3V0cHV0Jyk7XHJcblxyXG4gIGlmICggIXR5cGVzLmxlbmd0aCB8fCAhY29udGFpbmVyICkge1xyXG4gICAgcmV0dXJuXHJcbiAgfVxyXG5cclxuICBmb3IgKGNvbnN0IHR5cGUgb2YgdHlwZXMpIHtcclxuICAgIGxldCBsaXN0ID0gdHlwZS5xdWVyeVNlbGVjdG9yQWxsKCcuanMtY2hvaWNlLXR5cGUtbGlzdCBsaScpO1xyXG4gICAgbGV0IGFyckxpc3QgPSBbXTtcclxuXHJcbiAgICBmb3IgKGNvbnN0IGl0ZW0gb2YgbGlzdCkge1xyXG4gICAgICBhcnJMaXN0LnB1c2goaXRlbS50ZXh0Q29udGVudCk7XHJcbiAgICB9XHJcblxyXG4gICAgdHlwZS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKCkge1xyXG4gICAgICBpZiAoIHR5cGUuY2xhc3NMaXN0LmNvbnRhaW5zKCdpcy1hY3RpdmUnKSApIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGZvciAoY29uc3QgdHlwZUluIG9mIHR5cGVzKSB7XHJcbiAgICAgICAgdHlwZUluLmNsYXNzTGlzdC5yZW1vdmUoJ2lzLWFjdGl2ZScpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBjb250YWluZXIuY2xhc3NMaXN0LmFkZCgnaXMtYWN0aXZlJyk7XHJcblxyXG4gICAgICBpZiAoICFsaXN0Lmxlbmd0aCB8fCBsaXN0Lmxlbmd0aCA8IDIgKSB7XHJcbiAgICAgICAgY29udGFpbmVyLmNsYXNzTGlzdC5yZW1vdmUoJ2lzLWFjdGl2ZScpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB0eXBlLmNsYXNzTGlzdC5hZGQoJ2lzLWFjdGl2ZScpO1xyXG4gICAgICBvdXRwdXRDb250YWluZXIuaW5uZXJIVE1MID0gJyc7XHJcblxyXG4gICAgICBsaXN0LmZvckVhY2goKGl0ZW0sIGlkeCkgPT4ge1xyXG4gICAgICAgIGlmICggaWR4ID09PSAwICkge1xyXG4gICAgICAgICAgb3V0cHV0Q29udGFpbmVyLmFwcGVuZENoaWxkKGNyZWF0ZUNoZWNrbWFyayhpdGVtLnRleHRDb250ZW50LCB0cnVlLCBpdGVtLmRhdGFzZXQuYmFzZVByaWNlKSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIG91dHB1dENvbnRhaW5lci5hcHBlbmRDaGlsZChjcmVhdGVDaGVja21hcmsoaXRlbS50ZXh0Q29udGVudCwgZmFsc2UsIGl0ZW0uZGF0YXNldC5iYXNlUHJpY2UpKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgbGV0IGNoZWNrbWFya3MgPSBvdXRwdXRDb250YWluZXIucXVlcnlTZWxlY3RvckFsbCgnLmNoZWNrbWFyayBpbnB1dCcpO1xyXG5cclxuICAgICAgaWYgKCBjaGVja21hcmtzLmxlbmd0aCApIHtcclxuICAgICAgICBjaGVja21hcmtzWzBdLmNsaWNrKCk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gc2V0SGFuZGxlcnNQcmljZSgpIHtcclxuICBsZXQgdGFyZ2V0cyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy1jYWxjLWNoYW5nZScpO1xyXG5cclxuICBmb3IgKGNvbnN0IHRhcmdldCBvZiB0YXJnZXRzKSB7XHJcbiAgICBpZiAoIHRhcmdldC5ub1VpU2xpZGVyICkge1xyXG4gICAgICB0YXJnZXQubm9VaVNsaWRlci5vbignY2hhbmdlJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgY2hhbmdlUHJpY2VIYW5kbGUoKTtcclxuICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgdGFyZ2V0LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIGZ1bmN0aW9uKCkge1xyXG4gICAgICBjaGFuZ2VQcmljZUhhbmRsZSgpO1xyXG4gICAgfSk7XHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBjaGFuZ2VQcmljZUhhbmRsZSgpIHtcclxuICBsZXQgYmFzZVByaWNlcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy1jaG9pY2UtdHlwZS1vdXRwdXQgaW5wdXQnKTtcclxuICBsZXQgYmFzZVByaWNlSXRlbSA9IGdldEJhc2VQcmljZShiYXNlUHJpY2VzKTtcclxuICBsZXQgb3V0cHV0UHJpY2UgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtY2FsYy1wcmljZScpO1xyXG4gIGxldCBvdXRwdXREaXNjb3VudFByaWNlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLWNhbGMtZGlzY291bnQtcHJpY2UnKTtcclxuICBsZXQgdHlwZU91dHB1dCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy1jYWxjLXR5cGUtb3V0cHV0Jyk7XHJcbiAgbGV0IGxpc3RzT3V0cHV0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLWNhbGMtbGlzdHMtb3V0cHV0Jyk7XHJcbiAgbGV0IGFsYnVtc091dHB1dCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy1jYWxjLWFsYnVtcy1vdXRwdXQnKTtcclxuICBsZXQgcGVyc2FudGFnZU91dHB1dCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy1jYWxjLWRpc2NvdW50LXBlcnNhbnRhZ2Utb3V0cHV0Jyk7XHJcbiAgbGV0IGRpc2NvdW50U3VtbU91dHB1dCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy1jYWxjLWRpc2NvdW50LXN1bW0tb3V0cHV0Jyk7XHJcbiAgbGV0IGFsYnVtcyA9ICtkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtY2FsYy1hbGJ1bXMtbGVuZ3RoIGlucHV0JykudmFsdWU7XHJcbiAgbGV0IHBlb3BsZXMgPSArZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLWNhbGMtcGVvcGxlcycpLm5vVWlTbGlkZXIuZ2V0KCk7XHJcbiAgbGV0IHBlb3BsZXNPblR1cm4gPSArZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLWNhbGMtcGVvcGxlcy1vbi10dXJuJykubm9VaVNsaWRlci5nZXQoKTtcclxuICBsZXQgaGlzdG9yeVR1cm5zID0gK2RvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy1jYWxjLWhpc3RvcnktdHVybnMnKS5ub1VpU2xpZGVyLmdldCgpO1xyXG4gIGxldCBhY3RpdmVDaG9pY2UgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtY2hvaWNlLXR5cGUuaXMtYWN0aXZlJyk7XHJcblxyXG4gIGlmICggIWFjdGl2ZUNob2ljZSApIHtcclxuICAgIHJldHVyblxyXG4gIH1cclxuXHJcbiAgbGV0IGJhc2VMaXN0cyA9ICthY3RpdmVDaG9pY2UuZGF0YXNldC5iYXNlTGlzdHM7XHJcbiAgbGV0IGJhc2VUdXJuID0gK2FjdGl2ZUNob2ljZS5kYXRhc2V0LmJhc2VUdXJuO1xyXG4gIGxldCBiYXNlVHVyblByaWNlID0gK2FjdGl2ZUNob2ljZS5kYXRhc2V0LnR1cm5QcmljZTtcclxuICBsZXQgYmFzZVByaWNlID0gK2Jhc2VQcmljZUl0ZW0uZGF0YXNldC5iYXNlUHJpY2U7XHJcbiAgbGV0IGFsYnVtTGlzdHMgPSBnZXRMaXN0SW5BbGJ1bShwZW9wbGVzLCBwZW9wbGVzT25UdXJuLCBoaXN0b3J5VHVybnMsIGJhc2VUdXJuKTtcclxuICBsZXQgYWxidW1QcmljZSA9IGdldFByaWNlRm9yQWxidW0oYmFzZVByaWNlLCBhbGJ1bUxpc3RzLCBiYXNlTGlzdHMsIGJhc2VUdXJuUHJpY2UpO1xyXG4gIGxldCBwZXJjZW50YWdlID0gZ2V0RGlzY291bnRQZXJjZW50KGFsYnVtcyk7XHJcbiAgbGV0IGRpc2NvdW50U3VtbSA9IGdldERpc2NvdW50U3VtbShhbGJ1bVByaWNlLCBwZXJjZW50YWdlKTtcclxuICBsZXQgYWxidW1QcmljZVdpdGhEaXNjb3VudCA9IGdldFByaWNlRm9yQWxidW1EaXNjb3VudChhbGJ1bVByaWNlLCBkaXNjb3VudFN1bW0pO1xyXG5cclxuICBvdXRwdXRQcmljZS50ZXh0Q29udGVudCA9IGFsYnVtUHJpY2U7XHJcbiAgb3V0cHV0RGlzY291bnRQcmljZS50ZXh0Q29udGVudCA9IGFsYnVtUHJpY2VXaXRoRGlzY291bnQ7XHJcbiAgdHlwZU91dHB1dC50ZXh0Q29udGVudCA9IGFjdGl2ZUNob2ljZS5xdWVyeVNlbGVjdG9yKCcuY2FsY3VsYXRlLXR5cGVzX190aXRsZScpLnRleHRDb250ZW50O1xyXG4gIGxpc3RzT3V0cHV0LnRleHRDb250ZW50ID0gYWxidW1MaXN0cztcclxuICBhbGJ1bXNPdXRwdXQudGV4dENvbnRlbnQgPSBhbGJ1bXM7XHJcbiAgcGVyc2FudGFnZU91dHB1dC50ZXh0Q29udGVudCA9IHBlcmNlbnRhZ2UgKyAnJSc7XHJcbiAgZGlzY291bnRTdW1tT3V0cHV0LnRleHRDb250ZW50ID0gKGFsYnVtcyAqIGFsYnVtUHJpY2VXaXRoRGlzY291bnQpICsgJyDigr0nO1xyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRCYXNlUHJpY2UoYXJyKSB7XHJcbiAgaWYgKCBhcnIubGVuZ3RoICkge1xyXG4gICAgZm9yIChjb25zdCBpdGVtIG9mIGFycikge1xyXG4gICAgICBpZiAoIGl0ZW0uY2hlY2tlZCApIHtcclxuICAgICAgICByZXR1cm4gaXRlbTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0UHJpY2VGb3JBbGJ1bShiYXNlUHJpY2UsIGFsYnVtTGlzdHMsIGJhc2VMaXN0cywgYmFzZVR1cm5QcmljZSkge1xyXG4gIGxldCBzb21lID0gMDtcclxuXHJcbiAgaWYgKCBhbGJ1bUxpc3RzIC0gYmFzZUxpc3RzID4gMCApIHtcclxuICAgIHNvbWUgPSBhbGJ1bUxpc3RzIC0gYmFzZUxpc3RzO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIGJhc2VQcmljZSArIHNvbWUgKiBiYXNlVHVyblByaWNlO1xyXG59XHJcblxyXG5mdW5jdGlvbiBnZXREaXNjb3VudFBlcmNlbnQoYWxidW1zKSB7XHJcbiAgaWYgKCBhbGJ1bXMgPCA1ICkge1xyXG4gICAgcmV0dXJuIDA7XHJcbiAgfVxyXG5cclxuICBpZiAoIGFsYnVtcyA+IDIwICkge1xyXG4gICAgcmV0dXJuIDIwO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIGFsYnVtcztcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0UHJpY2VGb3JBbGJ1bURpc2NvdW50KGFsYnVtUHJpY2UsIGRpc2NvdW50U3VtbSkge1xyXG4gIHJldHVybiBhbGJ1bVByaWNlIC0gZGlzY291bnRTdW1tO1xyXG59XHJcblxyXG5mdW5jdGlvbiBnZXREaXNjb3VudFN1bW0oYWxidW1QcmljZSwgcGVyY2VudGFnZSkge1xyXG4gIHJldHVybiBNYXRoLmNlaWwoYWxidW1QcmljZSAqIHBlcmNlbnRhZ2UgLyAxMDApO1xyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRMaXN0SW5BbGJ1bShwZW9wbGVzLCBwZW9wbGVzT25UdXJuLCBoaXN0b3J5VHVybnMsIGJhc2VUdXJuKSB7XHJcbiAgcmV0dXJuIE1hdGguY2VpbChwZW9wbGVzIC8gcGVvcGxlc09uVHVybikgKyBoaXN0b3J5VHVybnMgKyBiYXNlVHVybjtcclxufVxyXG5cclxuZnVuY3Rpb24gY3JlYXRlQ2hlY2ttYXJrKHRleHQsIGZpcnN0LCBiYXNlUHJpY2UpIHtcclxuICBsZXQgY2hlY2ttYXJrV3JhcHBlcjtcclxuICBsZXQgY2hlY2ttYXJrID0gY3JlYXRlRWxlbWVudCgnbGFiZWwnLCAnY2hlY2ttYXJrJyk7XHJcbiAgbGV0IGlucHV0ID0gY3JlYXRlRWxlbWVudCgnaW5wdXQnLCAnJyk7XHJcbiAgc2V0QXR0cmlidXRlcyhpbnB1dCwge1xyXG4gICAgJ3R5cGUnOiAncmFkaW8nLFxyXG4gICAgJ25hbWUnOiAndHlwZXMnXHJcbiAgfSk7XHJcbiAgbGV0IG1hcmsgPSBjcmVhdGVFbGVtZW50KCdzcGFuJywgJ2NoZWNrbWFya19fbWFyaycpO1xyXG4gIGxldCB2YXJUZXh0ID0gY3JlYXRlRWxlbWVudCgncCcsICcnKTtcclxuXHJcbiAgaW5wdXQuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgZnVuY3Rpb24oKSB7XHJcbiAgICBjaGFuZ2VQcmljZUhhbmRsZSgpO1xyXG4gIH0pO1xyXG5cclxuICBpZiAoIGZpcnN0ICkge1xyXG4gICAgY2hlY2ttYXJrV3JhcHBlciA9IGNyZWF0ZUVsZW1lbnQoJ2RpdicsICdjb2wtMTInKTtcclxuICB9IGVsc2Uge1xyXG4gICAgY2hlY2ttYXJrV3JhcHBlciA9IGNyZWF0ZUVsZW1lbnQoJ2RpdicsICdjb2wtMTIgbXQtMycpO1xyXG4gIH1cclxuXHJcbiAgaW5wdXQuZGF0YXNldC5iYXNlUHJpY2UgPSBiYXNlUHJpY2UgPyBiYXNlUHJpY2UgOiAwO1xyXG4gIHZhclRleHQudGV4dENvbnRlbnQgPSB0ZXh0O1xyXG4gIGNoZWNrbWFyay5hcHBlbmRDaGlsZChpbnB1dCk7XHJcbiAgY2hlY2ttYXJrLmFwcGVuZENoaWxkKG1hcmspO1xyXG4gIGNoZWNrbWFyay5hcHBlbmRDaGlsZCh2YXJUZXh0KTtcclxuICBjaGVja21hcmtXcmFwcGVyLmFwcGVuZENoaWxkKGNoZWNrbWFyayk7XHJcblxyXG4gIHJldHVybiBjaGVja21hcmtXcmFwcGVyO1xyXG59XHJcblxyXG5mdW5jdGlvbiBjcmVhdGVFbGVtZW50KHRhZywgY2xhc3NOYW1lKSB7XHJcbiAgbGV0IGVsZW0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KHRhZyk7XHJcbiAgZWxlbS5jbGFzc0xpc3QgPSBjbGFzc05hbWU7XHJcblxyXG4gIHJldHVybiBlbGVtO1xyXG59XHJcblxyXG5mdW5jdGlvbiBzZXRBdHRyaWJ1dGVzKGVsLCBhdHRycykge1xyXG4gIGZvcih2YXIga2V5IGluIGF0dHJzKSB7XHJcbiAgICBlbC5zZXRBdHRyaWJ1dGUoa2V5LCBhdHRyc1trZXldKTtcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNhcmRIZWFkZXJIYW5kbGUobW9kYWxTd2lwZXIsIHVybCkge1xyXG4gIGxldCB0YXJnZXRzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmpzLW1vZGFsLWluaXQnKTtcclxuXHJcbiAgaWYgKCB0YXJnZXRzLmxlbmd0aCApIHtcclxuICAgIHRhcmdldHMuZm9yRWFjaCh0YXJnZXQgPT4ge1xyXG4gICAgICBsZXQgdGFyZ2V0SWQgPSB0YXJnZXQuZGF0YXNldC5pZDtcclxuICAgICAgdGFyZ2V0LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgZ2V0U2xpZGVyc0RhdGEobW9kYWxTd2lwZXIsIGAke3VybCArIHRhcmdldElkfWApO1xyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0U2xpZGVyc0RhdGEoY29udGFpbmVyLCB1cmwpIHtcclxuICBsZXQgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XHJcbiAgeGhyLm9wZW4oJ0dFVCcsIHVybCk7XHJcbiAgeGhyLnNlbmQoKTtcclxuXHJcbiAgaWYgKCAhY29udGFpbmVyICkge1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuXHJcbiAgeGhyLm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgaWYgKHhoci5zdGF0dXMgIT0gMjAwKSB7XHJcbiAgICAgIGNvbnNvbGUubG9nKGDQntGI0LjQsdC60LAgJHt4aHIuc3RhdHVzfTogJHt4aHIuc3RhdHVzVGV4dH1gKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGxldCBkYXRhID0gSlNPTi5wYXJzZSh4aHIucmVzcG9uc2UpO1xyXG4gICAgICBjb250YWluZXIucmVtb3ZlQWxsU2xpZGVzKCk7XHJcblxyXG4gICAgICBkYXRhLmZvckVhY2goaXRlbSA9PiB7XHJcbiAgICAgICAgbGV0IHNsaWRlQ29udGVudCA9IGNyZWF0ZVNsaWRlKGl0ZW0pO1xyXG4gICAgICAgIGNvbnRhaW5lci5hcHBlbmRTbGlkZShzbGlkZUNvbnRlbnQpO1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICB4aHIub25lcnJvciA9IGZ1bmN0aW9uKCkge1xyXG4gICAgY29uc29sZS5sb2coXCLQl9Cw0L/RgNC+0YEg0L3QtSDRg9C00LDQu9GB0Y9cIik7XHJcbiAgfTtcclxufVxyXG5cclxuZnVuY3Rpb24gY3JlYXRlU2xpZGUoc3RyKSB7XHJcbiAgbGV0IGltZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2ltZycpO1xyXG4gIGxldCBzbGlkZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gIHNsaWRlLmNsYXNzTGlzdC5hZGQoJ3N3aXBlci1zbGlkZScsICdtYWluLXNsaWRlcl9fc2xpZGUnKTtcclxuICBpbWcuc3JjID0gc3RyO1xyXG4gIHNsaWRlLmFwcGVuZENoaWxkKGltZyk7XHJcblxyXG4gIHJldHVybiBzbGlkZTtcclxufVxyXG5cclxuZnVuY3Rpb24gdmFsaWRhdGVGcm9tKCkge1xyXG4gIGxldCBmb3JtcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy1mb3JtLXZhbGlkYXRlJyk7XHJcblxyXG4gIGlmICggZm9ybXMubGVuZ3RoICkge1xyXG4gICAgZm9yIChjb25zdCBmb3JtIG9mIGZvcm1zKSB7XHJcbiAgICAgIGxldCBmaWVsZHMgPSBmb3JtLnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy1mb3JtLXZhbGlkYXRlLWlucHV0IGlucHV0Jyk7XHJcbiAgICAgIGxldCBmaWxlID0gZm9ybS5xdWVyeVNlbGVjdG9yKCcuanMtY2FsY3VsYXRlLWZpbGUtaW5wdXQnKTtcclxuICAgICAgbGV0IHZhbGlkRm9ybSA9IGZhbHNlO1xyXG5cclxuICAgICAgZm9yIChjb25zdCBmaWVsZCBvZiBmaWVsZHMpIHtcclxuICAgICAgICBmaWVsZC5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgIGlmICggIXZhbGlkYXRlRmllbGQoZmllbGQpICkge1xyXG4gICAgICAgICAgICBmaWVsZC5jbGFzc0xpc3QuYWRkKCdoYXMtZXJyb3InKTtcclxuICAgICAgICAgICAgdmFsaWRGb3JtID0gZmFsc2U7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBmaWVsZC5jbGFzc0xpc3QucmVtb3ZlKCdoYXMtZXJyb3InKTtcclxuICAgICAgICAgICAgdmFsaWRGb3JtID0gdHJ1ZTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG5cclxuICAgICAgZm9ybS5hZGRFdmVudExpc3RlbmVyKCdzdWJtaXQnLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cclxuICAgICAgICBmb3IgKGNvbnN0IGZpZWxkIG9mIGZpZWxkcykge1xyXG4gICAgICAgICAgaWYgKCAhdmFsaWRhdGVGaWVsZChmaWVsZCkgKSB7XHJcbiAgICAgICAgICAgIGZpZWxkLmNsYXNzTGlzdC5hZGQoJ2hhcy1lcnJvcicpO1xyXG4gICAgICAgICAgICB2YWxpZEZvcm0gPSBmYWxzZTtcclxuXHJcbiAgICAgICAgICAgIHJldHVyblxyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgZmllbGQuY2xhc3NMaXN0LnJlbW92ZSgnaGFzLWVycm9yJyk7XHJcbiAgICAgICAgICAgIHZhbGlkRm9ybSA9IHRydWU7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIHZhbGlkRm9ybSApIHtcclxuICAgICAgICAgIGxldCBmb3JtRGF0YSA9IG5ldyBGb3JtRGF0YShmb3JtKTtcclxuXHJcbiAgICAgICAgICBpZiAoIGZpbGUgKSB7XHJcbiAgICAgICAgICAgIGZvcm1EYXRhLmFwcGVuZCgnZmlsZScsIGZpbGUuZmlsZXNbMF0pO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIGxldCBzdWNjZXNzID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGZvcm0uY2xhc3NMaXN0LmFkZCgnc3VjY2VzcycpO1xyXG4gICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICBzZW5kRGF0YShmb3JtRGF0YSwgJy8nLCBzdWNjZXNzKTtcclxuXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGNvbnNvbGUubG9nKCd1bnZhbGlkIGZvcm0nKVxyXG4gICAgICAgIH1cclxuICAgICAgfSlcclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHZhbGlkYXRlRmllbGQoaW5wdXQpIHtcclxuICBsZXQgdmFsdWUgPSBpbnB1dC52YWx1ZTtcclxuICBsZXQgdHlwZSA9IGlucHV0LnR5cGU7XHJcbiAgbGV0IHJlc3VsdCA9IGZhbHNlO1xyXG5cclxuICBpZiAoIHR5cGUgPT0gJ3RlbCcgKSB7XHJcbiAgICByZXN1bHQgPSB2YWxpZGF0ZVBob25lKHZhbHVlKTtcclxuICB9IGVsc2UgaWYgKCB0eXBlID09ICdlbWFpbCcgKSB7XHJcbiAgICByZXN1bHQgPSB2YWxpZGF0ZU1haWwodmFsdWUpO1xyXG4gIH0gZWxzZSB7XHJcbiAgICByZXN1bHQgPSAhaXNFbXB0eSh2YWx1ZSk7XHJcbiAgfVxyXG5cclxuICByZXR1cm4gcmVzdWx0O1xyXG59XHJcblxyXG5mdW5jdGlvbiBpc0VtcHR5KHN0cikge1xyXG4gIHJldHVybiBzdHIgPT0gJycgJiYgdHJ1ZTtcclxufVxyXG5cclxuZnVuY3Rpb24gdmFsaWRhdGVQaG9uZShzdHIpIHtcclxuICBsZXQgcmVnID0gL15bXFwrXT9bKF0/WzAtOV17M31bKV0/Wy1cXHNcXC5dP1swLTldezN9Wy1cXHNcXC5dP1swLTldezQsNn0kL2ltO1xyXG4gIHJldHVybiB0ZXN0UmVnKHJlZywgcmVtb3ZlU3BhY2VzKHN0cikpO1xyXG59XHJcblxyXG5mdW5jdGlvbiB2YWxpZGF0ZU1haWwoc3RyKSB7XHJcbiAgbGV0IHJlc3VsdCA9IGZhbHNlO1xyXG4gIGNvbnN0IHJlZyA9IC9eKChbXjw+KClbXFxdXFxcXC4sOzpcXHNAXFxcIl0rKFxcLltePD4oKVtcXF1cXFxcLiw7Olxcc0BcXFwiXSspKil8KFxcXCIuK1xcXCIpKUAoKFxcW1swLTldezEsM31cXC5bMC05XXsxLDN9XFwuWzAtOV17MSwzfVxcLlswLTldezEsM31cXF0pfCgoW2EtekEtWlxcLTAtOV0rXFwuKStbYS16QS1aXXsyLH0pKSQvO1xyXG4gIHJlc3VsdCA9IHRlc3RSZWcocmVnLCBzdHIpXHJcbiAgcmV0dXJuIHJlc3VsdDtcclxufVxyXG5cclxuZnVuY3Rpb24gcmVtb3ZlU3BhY2VzKHN0cikge1xyXG4gIHJldHVybiBzdHIucmVwbGFjZSgvXFxzL2csICcnKTs7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHRlc3RSZWcocmUsIHN0cil7XHJcbiAgaWYgKHJlLnRlc3Qoc3RyKSkge1xyXG4gICAgcmV0dXJuIHRydWU7XHJcbiAgfSBlbHNlIHtcclxuICAgIHJldHVybiBmYWxzZTtcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHNlbmREYXRhKGRhdGEsIHVybCwgc3VjY2Vzcykge1xyXG4gIGlmICggIWRhdGEgfHwgIXVybCApIHtcclxuICAgIHJldHVybiBjb25zb2xlLmxvZygnZXJyb3IsIGhhdmUgbm8gZGF0YSBvciB1cmwnKTtcclxuICB9XHJcblxyXG4gIGxldCB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcclxuXHJcbiAgeGhyLm9ubG9hZGVuZCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgaWYgKHhoci5zdGF0dXMgPT0gMjAwKSB7XHJcbiAgICAgIGxldCBzdWNjZXNzRnUgPSBzdWNjZXNzO1xyXG5cclxuICAgICAgc3VjY2Vzc0Z1KCk7XHJcbiAgICAgIGNvbnNvbGUubG9nKFwi0KPRgdC/0LXRhVwiKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGNvbnNvbGUubG9nKFwi0J7RiNC40LHQutCwIFwiICsgdGhpcy5zdGF0dXMpO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIHhoci5vcGVuKFwiUE9TVFwiLCB1cmwpO1xyXG4gIHhoci5zZW5kKGRhdGEpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBpbml0TW9kYWwobW9kYWxTd2lwZXIpIHtcclxuICBsZXQgaW5pdHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuanMtbW9kYWwtaW5pdCcpO1xyXG4gIGxldCBib2R5ID0gZG9jdW1lbnQuYm9keTtcclxuXHJcbiAgaWYgKCBpbml0cy5sZW5ndGggKSB7XHJcbiAgICBmb3IgKGNvbnN0IGluaXQgb2YgaW5pdHMpIHtcclxuICAgICAgbGV0IHRhcmdldCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoaW5pdC5kYXRhc2V0LnRhcmdldCk7XHJcbiAgICAgIGxldCBjbG9zZXMgPSB0YXJnZXQucXVlcnlTZWxlY3RvckFsbCgnLmpzLW1vZGFsLWNsb3NlJyk7XHJcblxyXG4gICAgICBpZiAoIGNsb3Nlcy5sZW5ndGggKSB7XHJcbiAgICAgICAgZm9yIChjb25zdCBjbG9zZSBvZiBjbG9zZXMpIHtcclxuICAgICAgICAgIGNsb3NlLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRhcmdldC5jbGFzc0xpc3QucmVtb3ZlKCdpcy1hY3RpdmUnKTtcclxuICAgICAgICAgICAgYm9keS5jbGFzc0xpc3QucmVtb3ZlKCdtb2RhbC1pcy1hY3RpdmUnKTtcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKCB0YXJnZXQgKSB7XHJcbiAgICAgICAgaW5pdC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgdGFyZ2V0LmNsYXNzTGlzdC5hZGQoJ2lzLWFjdGl2ZScpO1xyXG4gICAgICAgICAgYm9keS5jbGFzc0xpc3QuYWRkKCdtb2RhbC1pcy1hY3RpdmUnKTtcclxuXHJcbiAgICAgICAgICBpZiAoIHRhcmdldC5kYXRhc2V0LnNsaWRlciA9PSAndHJ1ZScgKSB7XHJcbiAgICAgICAgICAgIG1vZGFsU3dpcGVyLnVwZGF0ZSgpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBpbml0RHJhZ05Ecm9wKCkge1xyXG4gIGxldCBjb250YWluZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtY2FsY3VsYXRlLWZpbGUnKTtcclxuICBsZXQgZHJvcEFyZWEgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtY2FsY3VsYXRlLWZpbGUtZHJvcGFyZWEnKTtcclxuICBsZXQgZmlsZUVsZW0gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtY2FsY3VsYXRlLWZpbGUtaW5wdXQnKTtcclxuICBsZXQgYWRkaW5ncyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy1jYWxjdWxhdGUtZmlsZS1hZGRpbmdzJyk7XHJcbiAgbGV0IGZpbGVOYW1lID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLWNhbGN1bGF0ZS1maWxlLW5hbWUnKTtcclxuICBsZXQgcmVtb3ZlciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy1jYWxjdWxhdGUtZmlsZS1yZW1vdmVyJyk7XHJcblxyXG4gIGlmICggIWNvbnRhaW5lciAmJiAhZHJvcEFyZWEgJiYgIWZpbGVFbGVtICYmICFhZGRpbmdzICYmICFmaWxlTmFtZSAmJiAhcmVtb3ZlciApIHtcclxuICAgIHJldHVybjtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIHByZXZlbnREZWZhdWx0cyAoZSkge1xyXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcclxuICB9O1xyXG5cclxuICBmdW5jdGlvbiBoaWdobGlnaHQoKSB7XHJcbiAgICBjb250YWluZXIuY2xhc3NMaXN0LmFkZCgnaGlnaGxpZ2h0Jyk7XHJcbiAgfTtcclxuXHJcbiAgZnVuY3Rpb24gdW5oaWdobGlnaHQoKSB7XHJcbiAgICBjb250YWluZXIuY2xhc3NMaXN0LnJlbW92ZSgnaGlnaGxpZ2h0Jyk7XHJcbiAgfTtcclxuXHJcbiAgZnVuY3Rpb24gaGFuZGxlRmlsZXMoZmlsZXMpIHtcclxuICAgIGFkZGluZ3MuY2xhc3NMaXN0LmFkZCgnaXMtc2hvdycpO1xyXG4gICAgY29udGFpbmVyLmNsYXNzTGlzdC5hZGQoJ2hhcy1yZXN1bHQnKTtcclxuICAgIGZpbGVOYW1lLnRleHRDb250ZW50ID0gZmlsZXNbMF0ubmFtZTtcclxuICB9O1xyXG5cclxuICBmdW5jdGlvbiBoYW5kbGVSZW1vdmVGaWxlcygpIHtcclxuICAgIGFkZGluZ3MuY2xhc3NMaXN0LnJlbW92ZSgnaXMtc2hvdycpO1xyXG4gICAgY29udGFpbmVyLmNsYXNzTGlzdC5yZW1vdmUoJ2hhcy1yZXN1bHQnKTtcclxuICAgIGZpbGVOYW1lLnRleHRDb250ZW50ID0gJyc7XHJcbiAgICBmaWxlRWxlbS52YWx1ZSA9ICcnO1xyXG4gIH07XHJcblxyXG4gIGZ1bmN0aW9uIGhhbmRsZURyb3AoZSkge1xyXG4gICAgbGV0IGR0ID0gZS5kYXRhVHJhbnNmZXI7XHJcbiAgICBsZXQgZmlsZXMgPSBkdC5maWxlcztcclxuXHJcbiAgICBpZiAoIFZhbGlkYXRlKHRoaXMpICkge1xyXG4gICAgICBoYW5kbGVGaWxlcyhmaWxlcyk7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgZmlsZUVsZW0uYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgZnVuY3Rpb24oKSB7XHJcbiAgICBpZiAoIFZhbGlkYXRlKHRoaXMpICkge1xyXG4gICAgICBoYW5kbGVGaWxlcyh0aGlzLmZpbGVzKTtcclxuICAgIH1cclxuICB9KTtcclxuXHJcbiAgcmVtb3Zlci5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKCkge1xyXG4gICAgaGFuZGxlUmVtb3ZlRmlsZXMoKTtcclxuICB9KTtcclxuXHJcbiAgWydkcmFnZW50ZXInLCAnZHJhZ292ZXInLCAnZHJhZ2xlYXZlJywgJ2Ryb3AnXS5mb3JFYWNoKGV2ZW50TmFtZSA9PiB7XHJcbiAgICBkcm9wQXJlYS5hZGRFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgcHJldmVudERlZmF1bHRzLCBmYWxzZSk7XHJcbiAgfSk7XHJcblxyXG4gIFsnZHJhZ2VudGVyJywgJ2RyYWdvdmVyJ10uZm9yRWFjaChldmVudE5hbWUgPT4ge1xyXG4gICAgZHJvcEFyZWEuYWRkRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIGhpZ2hsaWdodCwgZmFsc2UpO1xyXG4gIH0pO1xyXG4gIFxyXG4gIFsnZHJhZ2xlYXZlJywgJ2Ryb3AnXS5mb3JFYWNoKGV2ZW50TmFtZSA9PiB7XHJcbiAgICBkcm9wQXJlYS5hZGRFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgdW5oaWdobGlnaHQsIGZhbHNlKTtcclxuICB9KTtcclxuXHJcbiAgZHJvcEFyZWEuYWRkRXZlbnRMaXN0ZW5lcignZHJvcCcsIGhhbmRsZURyb3AsIGZhbHNlKTtcclxuXHJcbiAgdmFyIF92YWxpZEZpbGVFeHRlbnNpb25zID0gWycuemlwJywgJy5yYXInXTtcclxuXHJcbiAgZnVuY3Rpb24gVmFsaWRhdGUoaW5wdXQpIHtcclxuICAgIHZhciBzRmlsZU5hbWUgPSBpbnB1dC52YWx1ZTtcclxuXHJcbiAgICBpZiAoc0ZpbGVOYW1lLmxlbmd0aCA+IDApIHtcclxuICAgICAgdmFyIGJsblZhbGlkID0gZmFsc2U7XHJcbiAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgX3ZhbGlkRmlsZUV4dGVuc2lvbnMubGVuZ3RoOyBqKyspIHtcclxuICAgICAgICB2YXIgc0N1ckV4dGVuc2lvbiA9IF92YWxpZEZpbGVFeHRlbnNpb25zW2pdO1xyXG4gICAgICAgIGlmIChzRmlsZU5hbWUuc3Vic3RyKHNGaWxlTmFtZS5sZW5ndGggLSBzQ3VyRXh0ZW5zaW9uLmxlbmd0aCwgc0N1ckV4dGVuc2lvbi5sZW5ndGgpLnRvTG93ZXJDYXNlKCkgPT0gc0N1ckV4dGVuc2lvbi50b0xvd2VyQ2FzZSgpKSB7XHJcbiAgICAgICAgICBibG5WYWxpZCA9IHRydWU7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmICghYmxuVmFsaWQpIHtcclxuICAgICAgICBjb250YWluZXIuY2xhc3NMaXN0LmFkZCgnaGFzLWVycm9yJyk7XHJcblxyXG4gICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICBjb250YWluZXIuY2xhc3NMaXN0LnJlbW92ZSgnaGFzLWVycm9yJyk7XHJcbiAgICAgICAgfSwgMjAwMClcclxuXHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHRydWU7XHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBpbml0UmFuZ2UoKSB7XHJcbiAgdmFyIHNsaWRlcnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuanMtcmFuZ2UnKTtcclxuXHJcbiAgaWYgKCBzbGlkZXJzLmxlbmd0aCApIHtcclxuICAgIGZvciAoY29uc3Qgc2xpZGVyIG9mIHNsaWRlcnMpIHtcclxuICAgICAgbGV0IHNsaWRlclN0ZXAgPSBOdW1iZXIoc2xpZGVyLmRhdGFzZXQuc3RlcCk7XHJcbiAgICAgIGxldCBzbGlkZXJNaW4gPSBOdW1iZXIoc2xpZGVyLmRhdGFzZXQubWluKTtcclxuICAgICAgbGV0IHNsaWRlck1heCA9IE51bWJlcihzbGlkZXIuZGF0YXNldC5tYXgpO1xyXG4gICAgICBsZXQgc2xpZGVyUGlwcyA9IE51bWJlcihzbGlkZXIuZGF0YXNldC5waXBzKTtcclxuXHJcbiAgICAgIG5vVWlTbGlkZXIuY3JlYXRlKHNsaWRlciwge1xyXG4gICAgICAgIHN0YXJ0OiBbMF0sXHJcbiAgICAgICAgc3RlcDogc2xpZGVyU3RlcCxcclxuICAgICAgICByYW5nZToge1xyXG4gICAgICAgICAgJ21pbic6IHNsaWRlck1pbixcclxuICAgICAgICAgICdtYXgnOiBzbGlkZXJNYXhcclxuICAgICAgICB9LFxyXG4gICAgICAgIGNvbm5lY3Q6ICdsb3dlcicsXHJcbiAgICAgICAgdG9vbHRpcHM6IHRydWUsXHJcbiAgICAgICAgZm9ybWF0OiB3TnVtYih7XHJcbiAgICAgICAgICBkZWNpbWFsczogMyxcclxuICAgICAgICAgIHRob3VzYW5kOiAnLicsXHJcbiAgICAgICAgfSksXHJcbiAgICAgICAgcGlwczoge1xyXG4gICAgICAgICAgbW9kZTogJ2NvdW50JyxcclxuICAgICAgICAgIHZhbHVlczogc2xpZGVyUGlwcyxcclxuICAgICAgICAgIHN0ZXBwZWQ6IGZhbHNlXHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIGxldCBtaW5pTWFya2VycyA9IHNsaWRlci5xdWVyeVNlbGVjdG9yQWxsKCcubm9VaS1tYXJrZXItaG9yaXpvbnRhbC5ub1VpLW1hcmtlcicpO1xyXG5cclxuICAgICAgaWYgKCBtaW5pTWFya2Vycy5sZW5ndGggKSB7XHJcbiAgICAgICAgZm9yICggY29uc3QgbWluaU1hcmtlciBvZiBtaW5pTWFya2VycyApIHtcclxuICAgICAgICAgIG1pbmlNYXJrZXIucmVtb3ZlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBpbml0SGVhZGVyVG9nZ2xlcigpIHtcclxuICBsZXQgdG9nZ2xlciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy1oZWFkZXItdG9nZ2xlcicpO1xyXG4gIGxldCBoZWFkZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtaGVhZGVyJyk7XHJcbiAgbGV0IHBhZ2VXcmFwID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLXBhZ2Utd3JhcCcpO1xyXG4gIGxldCBkYXJrbmVzcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy1oZWFkZXItZGFya25lc3MnKTtcclxuXHJcbiAgaWYgKCB0b2dnbGVyICYmIGhlYWRlciAmJiBwYWdlV3JhcCAmJiBkYXJrbmVzcyApIHtcclxuICAgIHRvZ2dsZXIuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbigpIHtcclxuICAgICAgaGVhZGVyLmNsYXNzTGlzdC50b2dnbGUoJ2lzLW9wZW4nKTtcclxuICAgICAgdG9nZ2xlci5jbGFzc0xpc3QudG9nZ2xlKCdpcy1hY3RpdmUnKTtcclxuICAgICAgcGFnZVdyYXAuY2xhc3NMaXN0LnRvZ2dsZSgnc2Nyb2xsLWJsb2NrZWQtbW9iaWxlJyk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBkYXJrbmVzcy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKCkge1xyXG4gICAgICBoZWFkZXIuY2xhc3NMaXN0LnJlbW92ZSgnaXMtb3BlbicpO1xyXG4gICAgICB0b2dnbGVyLmNsYXNzTGlzdC5yZW1vdmUoJ2lzLWFjdGl2ZScpO1xyXG4gICAgICBwYWdlV3JhcC5jbGFzc0xpc3QucmVtb3ZlKCdzY3JvbGwtYmxvY2tlZC1tb2JpbGUnKTtcclxuICAgIH0pO1xyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gaW5pdEFsYnVtc0NhcmRTbGlkZXIoKSB7XHJcbiAgdmFyIG15U3dpcGVyID0gbmV3IFN3aXBlcignLmpzLWFsYnVtcy1jYXJkLXNsaWRlcicsIHtcclxuICAgIHNwZWVkOiA0MDAsXHJcbiAgICBzbGlkZXNQZXJWaWV3OiAxLFxyXG4gICAgbmF2aWdhdGlvbjoge1xyXG4gICAgICBuZXh0RWw6ICcuc3dpcGVyLWJ1dHRvbi1uZXh0JyxcclxuICAgICAgcHJldkVsOiAnLnN3aXBlci1idXR0b24tcHJldicsXHJcbiAgICB9LFxyXG4gIH0pO1xyXG5cclxuICByZXR1cm4gbXlTd2lwZXI7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGluaXRBbGJ1bVNsaWRlcigpIHtcclxuICB2YXIgbXlTd2lwZXIgPSBuZXcgU3dpcGVyKCcuanMtc3dpcGVyLWFsYnVtJywge1xyXG4gICAgc3BlZWQ6IDQwMCxcclxuICAgIHNsaWRlc1BlclZpZXc6IDEsXHJcbiAgICBsb29wOiBmYWxzZSxcclxuICAgIHByZWxvYWRJbWFnZXM6IGZhbHNlLFxyXG4gICAgc3BhY2VCZXR3ZWVuOiAxMixcclxuICAgIGxhenk6IHRydWUsXHJcbiAgICBuYXZpZ2F0aW9uOiB7XHJcbiAgICAgIG5leHRFbDogJy5zd2lwZXItYnV0dG9uLW5leHQnLFxyXG4gICAgICBwcmV2RWw6ICcuc3dpcGVyLWJ1dHRvbi1wcmV2JyxcclxuICAgIH0sXHJcbiAgfSk7XHJcblxyXG4gIHJldHVybiBteVN3aXBlcjtcclxufVxyXG5cclxuZnVuY3Rpb24gaW5pdFN3aXBlcigpIHtcclxuICBsZXQgdGFyZ2V0cyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy1zd2lwZXItY29udGFpbmVyJyk7XHJcblxyXG4gIGlmICggIXRhcmdldHMubGVuZ3RoICkge1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuXHJcbiAgbGV0IHN3aXBlcnMgPSBbXTtcclxuXHJcbiAgdGFyZ2V0cy5mb3JFYWNoKCAodGFyZ2V0LCBpbmRleCkgPT4ge1xyXG4gICAgaWYgKCBpbmRleCA9PSAwIHx8ICF0YXJnZXQuY2xhc3NMaXN0LmNvbnRhaW5zKCdzd2lwZXItY29udGFpbmVyLWZhdCcpICkge1xyXG4gICAgICB2YXIgbXlTd2lwZXIgPSBuZXcgU3dpcGVyKHRhcmdldCwge1xyXG4gICAgICAgIHNwZWVkOiA0MDAsXHJcbiAgICAgICAgc2xpZGVzUGVyVmlldzogNixcclxuICAgICAgICBzcGFjZUJldHdlZW46IDMwLFxyXG4gICAgICAgIGxvb3A6IGZhbHNlLFxyXG4gICAgICAgIHByZWxvYWRJbWFnZXM6IGZhbHNlLFxyXG4gICAgICAgIGxhenk6IHRydWUsIFxyXG4gICAgICAgIG5hdmlnYXRpb246IHtcclxuICAgICAgICAgIG5leHRFbDogJy5zd2lwZXItYnV0dG9uLW5leHQnLFxyXG4gICAgICAgICAgcHJldkVsOiAnLnN3aXBlci1idXR0b24tcHJldicsXHJcbiAgICAgICAgfSxcclxuICAgICAgICBicmVha3BvaW50czoge1xyXG4gICAgICAgICAgNDU5OiB7XHJcbiAgICAgICAgICAgIHNsaWRlc1BlclZpZXc6IDEsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgNTk5OiB7XHJcbiAgICAgICAgICAgIHNsaWRlc1BlclZpZXc6IDIsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgNzY3OiB7XHJcbiAgICAgICAgICAgIHNsaWRlc1BlclZpZXc6IDMsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgMTE5OToge1xyXG4gICAgICAgICAgICBzbGlkZXNQZXJWaWV3OiA0LFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdmFyIG15U3dpcGVyID0gbmV3IFN3aXBlcih0YXJnZXQsIHtcclxuICAgICAgICBzcGVlZDogNDAwLFxyXG4gICAgICAgIHNsaWRlc1BlclZpZXc6IDQsXHJcbiAgICAgICAgc3BhY2VCZXR3ZWVuOiAzMCxcclxuICAgICAgICBsb29wOiBmYWxzZSxcclxuICAgICAgICBwcmVsb2FkSW1hZ2VzOiBmYWxzZSxcclxuICAgICAgICBsYXp5OiB0cnVlLCBcclxuICAgICAgICBuYXZpZ2F0aW9uOiB7XHJcbiAgICAgICAgICBuZXh0RWw6ICcuc3dpcGVyLWJ1dHRvbi1uZXh0JyxcclxuICAgICAgICAgIHByZXZFbDogJy5zd2lwZXItYnV0dG9uLXByZXYnLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgYnJlYWtwb2ludHM6IHtcclxuICAgICAgICAgIDc2Nzoge1xyXG4gICAgICAgICAgICBzbGlkZXNQZXJWaWV3OiAxLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIDExOTk6IHtcclxuICAgICAgICAgICAgc2xpZGVzUGVyVmlldzogMixcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBzd2lwZXJzLnB1c2gobXlTd2lwZXIpO1xyXG4gIH0pO1xyXG5cclxuICByZXR1cm4gc3dpcGVycztcclxufVxyXG5cclxuZnVuY3Rpb24gaW5pdFN3aXBlclN0YXRpY2soKSB7XHJcbiAgdmFyIG15U3dpcGVyID0gbmV3IFN3aXBlcignLmpzLXN3aXBlci1jb250YWluZXItc3RhdGljaycsIHtcclxuICAgIHNwZWVkOiA0MDAsXHJcbiAgICBzbGlkZXNQZXJWaWV3OiA2LFxyXG4gICAgc3BhY2VCZXR3ZWVuOiA0MCxcclxuICAgIGxvb3A6IGZhbHNlLFxyXG4gICAgcHJlbG9hZEltYWdlczogZmFsc2UsXHJcbiAgICBsYXp5OiB0cnVlLFxyXG4gICAgZm9sbG93RmluZ2VyOiBmYWxzZSxcclxuICAgIGJyZWFrcG9pbnRzOiB7XHJcbiAgICAgIDQ1OToge1xyXG4gICAgICAgIHNsaWRlc1BlclZpZXc6IDEsXHJcbiAgICAgIH0sXHJcbiAgICAgIDU5OToge1xyXG4gICAgICAgIHNsaWRlc1BlclZpZXc6IDIsXHJcbiAgICAgIH0sXHJcbiAgICAgIDc2Nzoge1xyXG4gICAgICAgIHNsaWRlc1BlclZpZXc6IDMsXHJcbiAgICAgIH0sXHJcbiAgICAgIDExOTk6IHtcclxuICAgICAgICBzbGlkZXNQZXJWaWV3OiA0LFxyXG4gICAgICB9LFxyXG4gICAgfVxyXG4gIH0pO1xyXG5cclxuICByZXR1cm4gbXlTd2lwZXI7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGluaXRNYWluU3dpcGVyKCkge1xyXG4gIHZhciBteVN3aXBlciA9IG5ldyBTd2lwZXIoJy5qcy1tYWluLXN3aXBlci1jb250YWluZXInLCB7XHJcbiAgICBzcGVlZDogNDAwLFxyXG4gICAgc2xpZGVzUGVyVmlldzogMSxcclxuICAgIGxvb3A6IHRydWUsXHJcbiAgICBzcGFjZUJldHdlZW46IDEyLFxyXG4gICAgcGFnaW5hdGlvbjoge1xyXG4gICAgICBlbDogJy5zd2lwZXItcGFnaW5hdGlvbicsXHJcbiAgICAgIHR5cGU6ICdidWxsZXRzJyxcclxuICAgICAgY2xpY2thYmxlOiB0cnVlXHJcbiAgICB9LFxyXG4gICAgbmF2aWdhdGlvbjoge1xyXG4gICAgICBuZXh0RWw6ICcuanMtc3dpcGVyLW1haW4tbmV4dCcsXHJcbiAgICAgIHByZXZFbDogJy5qcy1zd2lwZXItbWFpbi1wcmV2JyxcclxuICAgIH0sXHJcbiAgfSk7XHJcblxyXG4gIHJldHVybiBteVN3aXBlcjtcclxufVxyXG5cclxuZnVuY3Rpb24gaW5pdE1vZGFsU3dpcGVyKCkge1xyXG4gIHZhciBteVN3aXBlciA9IG5ldyBTd2lwZXIoJy5qcy1tYWluLXN3aXBlci1tb2RhbCcsIHtcclxuICAgIHNwZWVkOiA0MDAsXHJcbiAgICBzbGlkZXNQZXJWaWV3OiAxLFxyXG4gICAgbG9vcDogdHJ1ZSxcclxuICAgIHNwYWNlQmV0d2VlbjogMTIsXHJcbiAgICBwcmVsb2FkSW1hZ2VzOiBmYWxzZSxcclxuICAgIGxhenk6IHRydWUsXHJcbiAgICBwYWdpbmF0aW9uOiB7XHJcbiAgICAgIGVsOiAnLnN3aXBlci1wYWdpbmF0aW9uJyxcclxuICAgICAgdHlwZTogJ2J1bGxldHMnLFxyXG4gICAgICBjbGlja2FibGU6IHRydWVcclxuICAgIH0sXHJcbiAgICBuYXZpZ2F0aW9uOiB7XHJcbiAgICAgIG5leHRFbDogJy5qcy1tb2RhbC1zd2lwZXItbmV4dCcsXHJcbiAgICAgIHByZXZFbDogJy5qcy1tb2RhbC1zd2lwZXItcHJldicsXHJcbiAgICB9LFxyXG4gIH0pO1xyXG5cclxuICByZXR1cm4gbXlTd2lwZXI7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGluaXRBbGJ1bXNUeXBlU2xpZGVyKCkge1xyXG4gIHZhciBteVN3aXBlciA9IG5ldyBTd2lwZXIoJy5qcy10eXBlLWFsYnVtcy1zd2lwZXInLCB7XHJcbiAgICBzcGVlZDogNDAwLFxyXG4gICAgc2xpZGVzUGVyVmlldzogJ2F1dG8nLFxyXG4gICAgc2xpZGVzT2Zmc2V0QWZ0ZXI6IDEwMCxcclxuICAgIHNwYWNlQmV0d2VlbjogMjQsXHJcbiAgICBuYXZpZ2F0aW9uOiB7XHJcbiAgICAgIG5leHRFbDogJy5zd2lwZXItYnV0dG9uLW5leHQnLFxyXG4gICAgICBwcmV2RWw6ICcuc3dpcGVyLWJ1dHRvbi1wcmV2JyxcclxuICAgIH0sXHJcbiAgICBvbjoge1xyXG4gICAgICBzbGlkZUNoYW5nZTogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGlmICggdGhpcy5hY3RpdmVJbmRleCA+IDAgKSB7XHJcbiAgICAgICAgICB0aGlzLmVsLmNsYXNzTGlzdC5hZGQoJ25vdC1vbi1zdGFydCcpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICB0aGlzLmVsLmNsYXNzTGlzdC5yZW1vdmUoJ25vdC1vbi1zdGFydCcpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgfSk7XHJcblxyXG4gIHJldHVybiBteVN3aXBlcjtcclxufVxyXG5cclxuZnVuY3Rpb24gaW5pdE1haW5DYXJkc1NsaWRlcigpIHtcclxuICB2YXIgbXlTd2lwZXIgPSBuZXcgU3dpcGVyKCcuanMtbWFpbi1jYXJkLXNsaWRlcicsIHtcclxuICAgIHNwZWVkOiA0MDAsXHJcbiAgICBzbGlkZXNQZXJWaWV3OiAxLFxyXG4gICAgbG9vcDogdHJ1ZSxcclxuICAgIHNwYWNlQmV0d2VlbjogMTIsXHJcbiAgICBuYXZpZ2F0aW9uOiB7XHJcbiAgICAgIG5leHRFbDogJy5zd2lwZXItYnV0dG9uLW5leHQnLFxyXG4gICAgICBwcmV2RWw6ICcuc3dpcGVyLWJ1dHRvbi1wcmV2JyxcclxuICAgIH0sXHJcbiAgfSk7XHJcblxyXG4gIHJldHVybiBteVN3aXBlcjtcclxufVxyXG5cclxuZnVuY3Rpb24gdGFiKHRhYkhhbmRsZXIpIHtcclxuICAgIGxldCB0YWJzQ29udGFpbmVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5qcy10YWItY29udGFpbmVyXCIpO1xyXG5cclxuICAgIGlmICggdGFic0NvbnRhaW5lciApIHtcclxuICAgICAgbGV0IG1lbnVJdGVtcyA9IHRhYnNDb250YWluZXIucXVlcnlTZWxlY3RvckFsbChcIi5qcy10YWItbWVudS1pdGVtXCIpO1xyXG5cclxuICAgICAgbWVudUl0ZW1zLmZvckVhY2goIChtZW51SXRlbSkgPT4ge1xyXG5cclxuICAgICAgICBtZW51SXRlbS5vbmNsaWNrID0gKCkgPT4ge1xyXG4gICAgICAgICAgbGV0IGFjdGl2ZU1lbnVJdGVtID0gQXJyYXkuZnJvbShtZW51SXRlbXMpLmZpbmQoZ2V0QWN0aXZlVGFiKTtcclxuICAgICAgICAgIGxldCBhY3RpdmVDb250ZW50SXRlbSA9IHRhYnNDb250YWluZXIucXVlcnlTZWxlY3RvcihhY3RpdmVNZW51SXRlbS5kYXRhc2V0LnRhcmdldCk7XHJcbiAgICAgICAgICBsZXQgY3VycmVudENvbnRlbnRJdGVtID0gdGFic0NvbnRhaW5lci5xdWVyeVNlbGVjdG9yKG1lbnVJdGVtLmRhdGFzZXQudGFyZ2V0KTtcclxuXHJcbiAgICAgICAgICBhY3RpdmVNZW51SXRlbS5jbGFzc0xpc3QucmVtb3ZlKFwiaXMtYWN0aXZlXCIpO1xyXG5cclxuICAgICAgICAgIGlmICggYWN0aXZlQ29udGVudEl0ZW0gKSB7XHJcbiAgICAgICAgICAgIGFjdGl2ZUNvbnRlbnRJdGVtLmNsYXNzTGlzdC5yZW1vdmUoXCJpcy1hY3RpdmVcIik7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgaWYgKCBjdXJyZW50Q29udGVudEl0ZW0gKSB7XHJcbiAgICAgICAgICAgIGN1cnJlbnRDb250ZW50SXRlbS5jbGFzc0xpc3QuYWRkKFwiaXMtYWN0aXZlXCIpO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIG1lbnVJdGVtLmNsYXNzTGlzdC5hZGQoXCJpcy1hY3RpdmVcIik7XHJcblxyXG4gICAgICAgICAgaWYgKCB0YWJIYW5kbGVyICkge1xyXG4gICAgICAgICAgICBkb2N1bWVudC5kaXNwYXRjaEV2ZW50KHRhYkhhbmRsZXIpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICBmdW5jdGlvbiBnZXRBY3RpdmVUYWIoZWxlbWVudCkge1xyXG4gICAgcmV0dXJuIGVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKFwiaXMtYWN0aXZlXCIpO1xyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gYWNjb3JkaW9uKCkge1xyXG4gIGxldCB3cmFwcGVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmpzLWFjY29yZGlvbicpO1xyXG4gIHdyYXBwZXIuZm9yRWFjaCh3cmFwcGVySXRlbSA9PiB7XHJcbiAgICBsZXQgaXRlbXMgPSB3cmFwcGVySXRlbS5xdWVyeVNlbGVjdG9yQWxsKCcuanMtYWNjb3JkaW9uLWl0ZW0nKTtcclxuICAgIGxldCBpbmRpdmlkdWFsID0gd3JhcHBlckl0ZW0uZ2V0QXR0cmlidXRlKCdpbmRpdmlkdWFsJykgJiYgd3JhcHBlckl0ZW0uZ2V0QXR0cmlidXRlKCdpbmRpdmlkdWFsJykgIT09ICdmYWxzZSc7XHJcblxyXG4gICAgaXRlbXMuZm9yRWFjaChpdGVtID0+IHtcclxuICAgICAgaWYgKCBpdGVtLmNsYXNzTGlzdC5jb250YWlucygnaXMtYWN0aXZlJykgKSB7XHJcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICBsZXQgcmVhZHlDb250ZW50ID0gaXRlbS5xdWVyeVNlbGVjdG9yKCcuanMtYWNjb3JkaW9uLWNvbnRlbnQnKTtcclxuICAgICAgICAgIGxldCByZWFkeUNvbnRlbnRIZWlnaHQgPSByZWFkeUNvbnRlbnQuc2Nyb2xsSGVpZ2h0O1xyXG5cclxuICAgICAgICAgIHJlYWR5Q29udGVudC5zdHlsZS5tYXhIZWlnaHQgPSByZWFkeUNvbnRlbnRIZWlnaHQgKyAncHgnO1xyXG4gICAgICAgIH0sIDEwMCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGxldCBzdWJJdGVtcyA9IGl0ZW0ucXVlcnlTZWxlY3RvckFsbCgnLmpzLWFjY29yZGlvbi1zdWJpdGVtJyk7XHJcblxyXG4gICAgICBmb3IgKGNvbnN0IHN1Ykl0ZW0gb2Ygc3ViSXRlbXMpIHtcclxuICAgICAgICBpZiAoIHN1Ykl0ZW0uY2xhc3NMaXN0LmNvbnRhaW5zKCdpcy1hY3RpdmUnKSApIHtcclxuICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICBsZXQgcmVhZHlDb250ZW50ID0gc3ViSXRlbS5xdWVyeVNlbGVjdG9yKCcuanMtYWNjb3JkaW9uLWNvbnRlbnQnKTtcclxuICAgICAgICAgICAgbGV0IHJlYWR5Q29udGVudEhlaWdodCA9IHJlYWR5Q29udGVudC5zY3JvbGxIZWlnaHQ7XHJcbiAgXHJcbiAgICAgICAgICAgIHJlYWR5Q29udGVudC5zdHlsZS5tYXhIZWlnaHQgPSByZWFkeUNvbnRlbnRIZWlnaHQgKyAncHgnO1xyXG4gICAgICAgICAgfSwgMTAwKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGl0ZW1JdGVyYXRpb24oaXRlbSwgaXRlbXMsIGluZGl2aWR1YWwpO1xyXG5cclxuICAgICAgc3ViSXRlbXMuZm9yRWFjaChzdWJpdGVtID0+IHtcclxuICAgICAgICBpdGVtSXRlcmF0aW9uKHN1Yml0ZW0sIHN1Ykl0ZW1zLCBpbmRpdmlkdWFsLCB0cnVlKVxyXG4gICAgICB9KTtcclxuICAgIH0pXHJcbiAgfSlcclxufVxyXG5cclxuZnVuY3Rpb24gaXRlbUl0ZXJhdGlvbihpdGVtLCBpdGVtcywgaW5kaXZpZHVhbCwgaXNTdWJpdGVtKSB7XHJcbiAgbGV0IGluaXQgPSBpdGVtLnF1ZXJ5U2VsZWN0b3IoJy5qcy1hY2NvcmRpb24taW5pdCcpO1xyXG4gIGxldCBjb250ZW50ID0gaXRlbS5xdWVyeVNlbGVjdG9yKCcuanMtYWNjb3JkaW9uLWNvbnRlbnQnKTtcclxuXHJcbiAgaWYgKCBpc1N1Yml0ZW0gPT09IHRydWUgKSB7XHJcbiAgICBjb250ZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3RyYW5zaXRpb25lbmQnLCBmdW5jdGlvbigpIHtcclxuICAgICAgbGV0IHBhcmVudEl0ZW0gPSBpdGVtLmNsb3Nlc3QoJy5qcy1hY2NvcmRpb24taXRlbScpO1xyXG4gICAgICBsZXQgcGFyZW50Q29udGVudEhlaWdodCA9IHBhcmVudEl0ZW0uc2Nyb2xsSGVpZ2h0ICsgJ3B4JztcclxuICAgICAgbGV0IHBhcmVudENvbnRlbnQgPSBwYXJlbnRJdGVtLnF1ZXJ5U2VsZWN0b3IoJy5qcy1hY2NvcmRpb24tY29udGVudCcpO1xyXG5cclxuICAgICAgcGFyZW50Q29udGVudC5zZXRBdHRyaWJ1dGUoJ3N0eWxlJywgYG1heC1oZWlnaHQ6ICR7cGFyZW50Q29udGVudEhlaWdodH1gKTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgaW5pdC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKCkge1xyXG4gICAgaWYgKCBpdGVtLmNsYXNzTGlzdC5jb250YWlucygnaXMtYWN0aXZlJykgKSB7XHJcbiAgICAgIGl0ZW0uY2xhc3NMaXN0LnJlbW92ZSgnaXMtYWN0aXZlJyk7XHJcbiAgICAgIGNvbnRlbnQuc3R5bGUubWF4SGVpZ2h0ID0gJzBweCc7XHJcblxyXG4gICAgICByZXR1cm4gZmFsc2VcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIGlzU3ViaXRlbSA9PT0gdHJ1ZSApIHtcclxuICAgICAgbGV0IHBhcmVudEl0ZW0gPSBpdGVtLmNsb3Nlc3QoJy5qcy1hY2NvcmRpb24taXRlbScpO1xyXG4gICAgICBsZXQgcGFyZW50Q29udGVudCA9IHBhcmVudEl0ZW0ucXVlcnlTZWxlY3RvcignLmpzLWFjY29yZGlvbi1jb250ZW50Jyk7XHJcblxyXG4gICAgICBwYXJlbnRDb250ZW50LnNldEF0dHJpYnV0ZSgnc3R5bGUnLCBgbWF4LWhlaWdodDogbm9uZWApO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICggaW5kaXZpZHVhbCApIHtcclxuICAgICAgaXRlbXMuZm9yRWFjaCgoZWxlbSkgPT4ge1xyXG4gICAgICAgIGxldCBlbGVtQ29udGVudCA9IGVsZW0ucXVlcnlTZWxlY3RvcignLmpzLWFjY29yZGlvbi1jb250ZW50Jyk7XHJcbiAgICAgICAgZWxlbS5jbGFzc0xpc3QucmVtb3ZlKCdpcy1hY3RpdmUnKTtcclxuICAgICAgICBlbGVtQ29udGVudC5zdHlsZS5tYXhIZWlnaHQgPSAwICsgJ3B4JztcclxuICAgICAgfSlcclxuICAgIH1cclxuXHJcbiAgICBpdGVtLmNsYXNzTGlzdC5hZGQoJ2lzLWFjdGl2ZScpO1xyXG4gICAgY29udGVudC5zdHlsZS5tYXhIZWlnaHQgPSBjb250ZW50LnNjcm9sbEhlaWdodCArICdweCc7XHJcbiAgfSk7XHJcbn0iXX0=
