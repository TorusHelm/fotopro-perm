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
  getTruePriceCard();

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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0JztcclxuXHJcbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBmdW5jdGlvbigpIHtcclxuICBsZXQgdGFiSGFuZGxlciA9IG5ldyBFdmVudCgndGFiSGFuZGxlcicpO1xyXG4gIGxldCBtb2RhbFN3aXBlciA9IGluaXRNb2RhbFN3aXBlcigpO1xyXG4gIGxldCBzd2lwZXJzID0gaW5pdFN3aXBlcigpO1xyXG4gIHN2ZzRldmVyeWJvZHkoKTtcclxuICBpbml0TWFpblN3aXBlcigpO1xyXG4gIGluaXRIZWFkZXJUb2dnbGVyKCk7XHJcbiAgaW5pdEFsYnVtc0NhcmRTbGlkZXIoKTtcclxuICBhY2NvcmRpb24oKTtcclxuICBpbml0QWxidW1zVHlwZVNsaWRlcigpO1xyXG4gIGluaXRTd2lwZXJTdGF0aWNrKCk7XHJcbiAgaW5pdEFsYnVtU2xpZGVyKCk7XHJcbiAgdGFiKHRhYkhhbmRsZXIpO1xyXG4gIGluaXRSYW5nZSgpO1xyXG4gIGluaXREcmFnTkRyb3AoKTtcclxuICBpbml0TW9kYWwobW9kYWxTd2lwZXIpO1xyXG4gIHZhbGlkYXRlRnJvbSgpO1xyXG4gIGNhcmRIZWFkZXJIYW5kbGUobW9kYWxTd2lwZXIsICdodHRwOi8vZjM2MzUwOTc1ODE3Lm5ncm9rLmlvL2FwaS9hbGJ1bS9pbWFnZXNfc2xpZGVyP2lkPScpO1xyXG4gIGNob2ljZVR5cGUoKTtcclxuICBzZXRIYW5kbGVyc1ByaWNlKCk7XHJcbiAgZ2V0VHJ1ZVByaWNlQ2FyZCgpO1xyXG5cclxuICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCd0YWJIYW5kbGVyJywgZnVuY3Rpb24oKSB7XHJcbiAgICBpZiAoICFzd2lwZXJzLmxlbmd0aCApIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIHN3aXBlcnMuZm9yRWFjaChzd2lwZXIgPT4ge1xyXG4gICAgICBzd2lwZXIudXBkYXRlKCk7XHJcbiAgICB9KTtcclxuXHJcbiAgfSwgZmFsc2UpO1xyXG5cclxuICBpZiAoIHdpbmRvdy5pbm5lcldpZHRoIDwgNzY4ICkge1xyXG4gICAgaW5pdE1haW5DYXJkc1NsaWRlcigpO1xyXG4gIH1cclxufSk7XHJcblxyXG5mdW5jdGlvbiBnZXRUcnVlUHJpY2VDYXJkKCkge1xyXG4gIGxldCB0YXJnZXRzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmpzLWNhcmQtcHJpY2Utd3JhcHBlcicpO1xyXG5cclxuICBpZiAoIHRhcmdldHMubGVuZ3RoICkge1xyXG4gICAgZm9yIChjb25zdCB0YXJnZXQgb2YgdGFyZ2V0cykge1xyXG4gICAgICBsZXQgaW5wdXQgPSB0YXJnZXQucXVlcnlTZWxlY3RvcignLmpzLWNhcmQtcHJpY2UgaW5wdXQnKTtcclxuICAgICAgbGV0IG91dHB1dCA9IHRhcmdldC5xdWVyeVNlbGVjdG9yKCcuanMtY2FyZC1wcmljZS1vdXRwdXQnKTtcclxuICAgICAgbGV0IGJhc2VQcmljZSA9ICtvdXRwdXQuZGF0YXNldC5wcmljZTtcclxuXHJcbiAgICAgIGlucHV0LmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGxldCBwZXJjYW50YWdlID0gZ2V0RGlzY291bnRQZXJjZW50KCtpbnB1dC52YWx1ZSk7XHJcbiAgICAgICAgbGV0IGRpc2NvdW50UHJpY2UgPSBnZXREaXNjb3VudFN1bW0oYmFzZVByaWNlLCBwZXJjYW50YWdlKTtcclxuXHJcbiAgICAgICAgb3V0cHV0LnRleHRDb250ZW50ID0gKGJhc2VQcmljZSAtIGRpc2NvdW50UHJpY2UpICsgJyDigr0nO1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNob2ljZVR5cGUoKSB7XHJcbiAgbGV0IHR5cGVzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmpzLWNob2ljZS10eXBlJyk7XHJcbiAgbGV0IGNvbnRhaW5lciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy1jaG9pY2UtdHlwZS1hZGRpbmdzJyk7XHJcbiAgbGV0IG91dHB1dENvbnRhaW5lciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy1jaG9pY2UtdHlwZS1vdXRwdXQnKTtcclxuXHJcbiAgaWYgKCAhdHlwZXMubGVuZ3RoIHx8ICFjb250YWluZXIgKSB7XHJcbiAgICByZXR1cm5cclxuICB9XHJcblxyXG4gIGZvciAoY29uc3QgdHlwZSBvZiB0eXBlcykge1xyXG4gICAgbGV0IGxpc3QgPSB0eXBlLnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy1jaG9pY2UtdHlwZS1saXN0IGxpJyk7XHJcbiAgICBsZXQgYXJyTGlzdCA9IFtdO1xyXG5cclxuICAgIGZvciAoY29uc3QgaXRlbSBvZiBsaXN0KSB7XHJcbiAgICAgIGFyckxpc3QucHVzaChpdGVtLnRleHRDb250ZW50KTtcclxuICAgIH1cclxuXHJcbiAgICB0eXBlLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgIGlmICggdHlwZS5jbGFzc0xpc3QuY29udGFpbnMoJ2lzLWFjdGl2ZScpICkge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG5cclxuICAgICAgZm9yIChjb25zdCB0eXBlSW4gb2YgdHlwZXMpIHtcclxuICAgICAgICB0eXBlSW4uY2xhc3NMaXN0LnJlbW92ZSgnaXMtYWN0aXZlJyk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGNvbnRhaW5lci5jbGFzc0xpc3QuYWRkKCdpcy1hY3RpdmUnKTtcclxuXHJcbiAgICAgIGlmICggIWxpc3QubGVuZ3RoIHx8IGxpc3QubGVuZ3RoIDwgMiApIHtcclxuICAgICAgICBjb250YWluZXIuY2xhc3NMaXN0LnJlbW92ZSgnaXMtYWN0aXZlJyk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHR5cGUuY2xhc3NMaXN0LmFkZCgnaXMtYWN0aXZlJyk7XHJcbiAgICAgIG91dHB1dENvbnRhaW5lci5pbm5lckhUTUwgPSAnJztcclxuXHJcbiAgICAgIGxpc3QuZm9yRWFjaCgoaXRlbSwgaWR4KSA9PiB7XHJcbiAgICAgICAgaWYgKCBpZHggPT09IDAgKSB7XHJcbiAgICAgICAgICBvdXRwdXRDb250YWluZXIuYXBwZW5kQ2hpbGQoY3JlYXRlQ2hlY2ttYXJrKGl0ZW0udGV4dENvbnRlbnQsIHRydWUsIGl0ZW0uZGF0YXNldC5iYXNlUHJpY2UpKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgb3V0cHV0Q29udGFpbmVyLmFwcGVuZENoaWxkKGNyZWF0ZUNoZWNrbWFyayhpdGVtLnRleHRDb250ZW50LCBmYWxzZSwgaXRlbS5kYXRhc2V0LmJhc2VQcmljZSkpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcblxyXG4gICAgICBsZXQgY2hlY2ttYXJrcyA9IG91dHB1dENvbnRhaW5lci5xdWVyeVNlbGVjdG9yQWxsKCcuY2hlY2ttYXJrIGlucHV0Jyk7XHJcblxyXG4gICAgICBpZiAoIGNoZWNrbWFya3MubGVuZ3RoICkge1xyXG4gICAgICAgIGNoZWNrbWFya3NbMF0uY2xpY2soKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBzZXRIYW5kbGVyc1ByaWNlKCkge1xyXG4gIGxldCB0YXJnZXRzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmpzLWNhbGMtY2hhbmdlJyk7XHJcblxyXG4gIGZvciAoY29uc3QgdGFyZ2V0IG9mIHRhcmdldHMpIHtcclxuICAgIGlmICggdGFyZ2V0Lm5vVWlTbGlkZXIgKSB7XHJcbiAgICAgIHRhcmdldC5ub1VpU2xpZGVyLm9uKCdjaGFuZ2UnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICBjaGFuZ2VQcmljZUhhbmRsZSgpO1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICB0YXJnZXQuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgIGNoYW5nZVByaWNlSGFuZGxlKCk7XHJcbiAgICB9KTtcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNoYW5nZVByaWNlSGFuZGxlKCkge1xyXG4gIGxldCBiYXNlUHJpY2VzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmpzLWNob2ljZS10eXBlLW91dHB1dCBpbnB1dCcpO1xyXG4gIGxldCBiYXNlUHJpY2VJdGVtID0gZ2V0QmFzZVByaWNlKGJhc2VQcmljZXMpO1xyXG4gIGxldCBvdXRwdXRQcmljZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy1jYWxjLXByaWNlJyk7XHJcbiAgbGV0IG91dHB1dERpc2NvdW50UHJpY2UgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtY2FsYy1kaXNjb3VudC1wcmljZScpO1xyXG4gIGxldCB0eXBlT3V0cHV0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLWNhbGMtdHlwZS1vdXRwdXQnKTtcclxuICBsZXQgbGlzdHNPdXRwdXQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtY2FsYy1saXN0cy1vdXRwdXQnKTtcclxuICBsZXQgYWxidW1zT3V0cHV0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLWNhbGMtYWxidW1zLW91dHB1dCcpO1xyXG4gIGxldCBwZXJzYW50YWdlT3V0cHV0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLWNhbGMtZGlzY291bnQtcGVyc2FudGFnZS1vdXRwdXQnKTtcclxuICBsZXQgZGlzY291bnRTdW1tT3V0cHV0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLWNhbGMtZGlzY291bnQtc3VtbS1vdXRwdXQnKTtcclxuICBsZXQgYWxidW1zID0gK2RvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy1jYWxjLWFsYnVtcy1sZW5ndGggaW5wdXQnKS52YWx1ZTtcclxuICBsZXQgcGVvcGxlcyA9ICtkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtY2FsYy1wZW9wbGVzJykubm9VaVNsaWRlci5nZXQoKTtcclxuICBsZXQgcGVvcGxlc09uVHVybiA9ICtkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtY2FsYy1wZW9wbGVzLW9uLXR1cm4nKS5ub1VpU2xpZGVyLmdldCgpO1xyXG4gIGxldCBoaXN0b3J5VHVybnMgPSArZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLWNhbGMtaGlzdG9yeS10dXJucycpLm5vVWlTbGlkZXIuZ2V0KCk7XHJcbiAgbGV0IGFjdGl2ZUNob2ljZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy1jaG9pY2UtdHlwZS5pcy1hY3RpdmUnKTtcclxuXHJcbiAgaWYgKCAhYWN0aXZlQ2hvaWNlICkge1xyXG4gICAgcmV0dXJuXHJcbiAgfVxyXG5cclxuICBsZXQgYmFzZUxpc3RzID0gK2FjdGl2ZUNob2ljZS5kYXRhc2V0LmJhc2VMaXN0cztcclxuICBsZXQgYmFzZVR1cm4gPSArYWN0aXZlQ2hvaWNlLmRhdGFzZXQuYmFzZVR1cm47XHJcbiAgbGV0IGJhc2VUdXJuUHJpY2UgPSArYWN0aXZlQ2hvaWNlLmRhdGFzZXQudHVyblByaWNlO1xyXG4gIGxldCBiYXNlUHJpY2UgPSArYmFzZVByaWNlSXRlbS5kYXRhc2V0LmJhc2VQcmljZTtcclxuICBsZXQgYWxidW1MaXN0cyA9IGdldExpc3RJbkFsYnVtKHBlb3BsZXMsIHBlb3BsZXNPblR1cm4sIGhpc3RvcnlUdXJucywgYmFzZVR1cm4pO1xyXG4gIGxldCBhbGJ1bVByaWNlID0gZ2V0UHJpY2VGb3JBbGJ1bShiYXNlUHJpY2UsIGFsYnVtTGlzdHMsIGJhc2VMaXN0cywgYmFzZVR1cm5QcmljZSk7XHJcbiAgbGV0IHBlcmNlbnRhZ2UgPSBnZXREaXNjb3VudFBlcmNlbnQoYWxidW1zKTtcclxuICBsZXQgZGlzY291bnRTdW1tID0gZ2V0RGlzY291bnRTdW1tKGFsYnVtUHJpY2UsIHBlcmNlbnRhZ2UpO1xyXG4gIGxldCBhbGJ1bVByaWNlV2l0aERpc2NvdW50ID0gZ2V0UHJpY2VGb3JBbGJ1bURpc2NvdW50KGFsYnVtUHJpY2UsIGRpc2NvdW50U3VtbSk7XHJcblxyXG4gIG91dHB1dFByaWNlLnRleHRDb250ZW50ID0gYWxidW1QcmljZTtcclxuICBvdXRwdXREaXNjb3VudFByaWNlLnRleHRDb250ZW50ID0gYWxidW1QcmljZVdpdGhEaXNjb3VudDtcclxuICB0eXBlT3V0cHV0LnRleHRDb250ZW50ID0gYWN0aXZlQ2hvaWNlLnF1ZXJ5U2VsZWN0b3IoJy5jYWxjdWxhdGUtdHlwZXNfX3RpdGxlJykudGV4dENvbnRlbnQ7XHJcbiAgbGlzdHNPdXRwdXQudGV4dENvbnRlbnQgPSBhbGJ1bUxpc3RzO1xyXG4gIGFsYnVtc091dHB1dC50ZXh0Q29udGVudCA9IGFsYnVtcztcclxuICBwZXJzYW50YWdlT3V0cHV0LnRleHRDb250ZW50ID0gcGVyY2VudGFnZSArICclJztcclxuICBkaXNjb3VudFN1bW1PdXRwdXQudGV4dENvbnRlbnQgPSAoYWxidW1zICogYWxidW1QcmljZVdpdGhEaXNjb3VudCkgKyAnIOKCvSc7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldEJhc2VQcmljZShhcnIpIHtcclxuICBpZiAoIGFyci5sZW5ndGggKSB7XHJcbiAgICBmb3IgKGNvbnN0IGl0ZW0gb2YgYXJyKSB7XHJcbiAgICAgIGlmICggaXRlbS5jaGVja2VkICkge1xyXG4gICAgICAgIHJldHVybiBpdGVtO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRQcmljZUZvckFsYnVtKGJhc2VQcmljZSwgYWxidW1MaXN0cywgYmFzZUxpc3RzLCBiYXNlVHVyblByaWNlKSB7XHJcbiAgbGV0IHNvbWUgPSAwO1xyXG5cclxuICBpZiAoIGFsYnVtTGlzdHMgLSBiYXNlTGlzdHMgPiAwICkge1xyXG4gICAgc29tZSA9IGFsYnVtTGlzdHMgLSBiYXNlTGlzdHM7XHJcbiAgfVxyXG5cclxuICByZXR1cm4gYmFzZVByaWNlICsgc29tZSAqIGJhc2VUdXJuUHJpY2U7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldERpc2NvdW50UGVyY2VudChhbGJ1bXMpIHtcclxuICBpZiAoIGFsYnVtcyA8IDUgKSB7XHJcbiAgICByZXR1cm4gMDtcclxuICB9XHJcblxyXG4gIGlmICggYWxidW1zID4gMjAgKSB7XHJcbiAgICByZXR1cm4gMjA7XHJcbiAgfVxyXG5cclxuICByZXR1cm4gYWxidW1zO1xyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRQcmljZUZvckFsYnVtRGlzY291bnQoYWxidW1QcmljZSwgZGlzY291bnRTdW1tKSB7XHJcbiAgcmV0dXJuIGFsYnVtUHJpY2UgLSBkaXNjb3VudFN1bW07XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldERpc2NvdW50U3VtbShhbGJ1bVByaWNlLCBwZXJjZW50YWdlKSB7XHJcbiAgcmV0dXJuIE1hdGguY2VpbChhbGJ1bVByaWNlICogcGVyY2VudGFnZSAvIDEwMCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldExpc3RJbkFsYnVtKHBlb3BsZXMsIHBlb3BsZXNPblR1cm4sIGhpc3RvcnlUdXJucywgYmFzZVR1cm4pIHtcclxuICByZXR1cm4gTWF0aC5jZWlsKHBlb3BsZXMgLyBwZW9wbGVzT25UdXJuKSArIGhpc3RvcnlUdXJucyArIGJhc2VUdXJuO1xyXG59XHJcblxyXG5mdW5jdGlvbiBjcmVhdGVDaGVja21hcmsodGV4dCwgZmlyc3QsIGJhc2VQcmljZSkge1xyXG4gIGxldCBjaGVja21hcmtXcmFwcGVyO1xyXG4gIGxldCBjaGVja21hcmsgPSBjcmVhdGVFbGVtZW50KCdsYWJlbCcsICdjaGVja21hcmsnKTtcclxuICBsZXQgaW5wdXQgPSBjcmVhdGVFbGVtZW50KCdpbnB1dCcsICcnKTtcclxuICBzZXRBdHRyaWJ1dGVzKGlucHV0LCB7XHJcbiAgICAndHlwZSc6ICdyYWRpbycsXHJcbiAgICAnbmFtZSc6ICd0eXBlcydcclxuICB9KTtcclxuICBsZXQgbWFyayA9IGNyZWF0ZUVsZW1lbnQoJ3NwYW4nLCAnY2hlY2ttYXJrX19tYXJrJyk7XHJcbiAgbGV0IHZhclRleHQgPSBjcmVhdGVFbGVtZW50KCdwJywgJycpO1xyXG5cclxuICBpbnB1dC5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCBmdW5jdGlvbigpIHtcclxuICAgIGNoYW5nZVByaWNlSGFuZGxlKCk7XHJcbiAgfSk7XHJcblxyXG4gIGlmICggZmlyc3QgKSB7XHJcbiAgICBjaGVja21hcmtXcmFwcGVyID0gY3JlYXRlRWxlbWVudCgnZGl2JywgJ2NvbC0xMicpO1xyXG4gIH0gZWxzZSB7XHJcbiAgICBjaGVja21hcmtXcmFwcGVyID0gY3JlYXRlRWxlbWVudCgnZGl2JywgJ2NvbC0xMiBtdC0zJyk7XHJcbiAgfVxyXG5cclxuICBpbnB1dC5kYXRhc2V0LmJhc2VQcmljZSA9IGJhc2VQcmljZSA/IGJhc2VQcmljZSA6IDA7XHJcbiAgdmFyVGV4dC50ZXh0Q29udGVudCA9IHRleHQ7XHJcbiAgY2hlY2ttYXJrLmFwcGVuZENoaWxkKGlucHV0KTtcclxuICBjaGVja21hcmsuYXBwZW5kQ2hpbGQobWFyayk7XHJcbiAgY2hlY2ttYXJrLmFwcGVuZENoaWxkKHZhclRleHQpO1xyXG4gIGNoZWNrbWFya1dyYXBwZXIuYXBwZW5kQ2hpbGQoY2hlY2ttYXJrKTtcclxuXHJcbiAgcmV0dXJuIGNoZWNrbWFya1dyYXBwZXI7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZUVsZW1lbnQodGFnLCBjbGFzc05hbWUpIHtcclxuICBsZXQgZWxlbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQodGFnKTtcclxuICBlbGVtLmNsYXNzTGlzdCA9IGNsYXNzTmFtZTtcclxuXHJcbiAgcmV0dXJuIGVsZW07XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHNldEF0dHJpYnV0ZXMoZWwsIGF0dHJzKSB7XHJcbiAgZm9yKHZhciBrZXkgaW4gYXR0cnMpIHtcclxuICAgIGVsLnNldEF0dHJpYnV0ZShrZXksIGF0dHJzW2tleV0pO1xyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gY2FyZEhlYWRlckhhbmRsZShtb2RhbFN3aXBlciwgdXJsKSB7XHJcbiAgbGV0IHRhcmdldHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuanMtbW9kYWwtaW5pdCcpO1xyXG5cclxuICBpZiAoIHRhcmdldHMubGVuZ3RoICkge1xyXG4gICAgdGFyZ2V0cy5mb3JFYWNoKHRhcmdldCA9PiB7XHJcbiAgICAgIGxldCB0YXJnZXRJZCA9IHRhcmdldC5kYXRhc2V0LmlkO1xyXG4gICAgICB0YXJnZXQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbigpIHtcclxuICAgICAgICBnZXRTbGlkZXJzRGF0YShtb2RhbFN3aXBlciwgYCR7dXJsICsgdGFyZ2V0SWR9YCk7XHJcbiAgICAgIH0pO1xyXG4gICAgfSk7XHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRTbGlkZXJzRGF0YShjb250YWluZXIsIHVybCkge1xyXG4gIGxldCB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcclxuICB4aHIub3BlbignR0VUJywgdXJsKTtcclxuICB4aHIuc2VuZCgpO1xyXG5cclxuICBpZiAoICFjb250YWluZXIgKSB7XHJcbiAgICByZXR1cm47XHJcbiAgfVxyXG5cclxuICB4aHIub25sb2FkID0gZnVuY3Rpb24oKSB7XHJcbiAgICBpZiAoeGhyLnN0YXR1cyAhPSAyMDApIHtcclxuICAgICAgY29uc29sZS5sb2coYNCe0YjQuNCx0LrQsCAke3hoci5zdGF0dXN9OiAke3hoci5zdGF0dXNUZXh0fWApO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgbGV0IGRhdGEgPSBKU09OLnBhcnNlKHhoci5yZXNwb25zZSk7XHJcbiAgICAgIGNvbnRhaW5lci5yZW1vdmVBbGxTbGlkZXMoKTtcclxuXHJcbiAgICAgIGRhdGEuZm9yRWFjaChpdGVtID0+IHtcclxuICAgICAgICBsZXQgc2xpZGVDb250ZW50ID0gY3JlYXRlU2xpZGUoaXRlbSk7XHJcbiAgICAgICAgY29udGFpbmVyLmFwcGVuZFNsaWRlKHNsaWRlQ29udGVudCk7XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIHhoci5vbmVycm9yID0gZnVuY3Rpb24oKSB7XHJcbiAgICBjb25zb2xlLmxvZyhcItCX0LDQv9GA0L7RgSDQvdC1INGD0LTQsNC70YHRj1wiKTtcclxuICB9O1xyXG59XHJcblxyXG5mdW5jdGlvbiBjcmVhdGVTbGlkZShzdHIpIHtcclxuICBsZXQgaW1nID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW1nJyk7XHJcbiAgbGV0IHNsaWRlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgc2xpZGUuY2xhc3NMaXN0LmFkZCgnc3dpcGVyLXNsaWRlJywgJ21haW4tc2xpZGVyX19zbGlkZScpO1xyXG4gIGltZy5zcmMgPSAnaHR0cDovL2YzNjM1MDk3NTgxNy5uZ3Jvay5pbycgKyBzdHI7XHJcbiAgc2xpZGUuYXBwZW5kQ2hpbGQoaW1nKTtcclxuXHJcbiAgcmV0dXJuIHNsaWRlO1xyXG59XHJcblxyXG5mdW5jdGlvbiB2YWxpZGF0ZUZyb20oKSB7XHJcbiAgbGV0IGZvcm1zID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmpzLWZvcm0tdmFsaWRhdGUnKTtcclxuXHJcbiAgaWYgKCBmb3Jtcy5sZW5ndGggKSB7XHJcbiAgICBmb3IgKGNvbnN0IGZvcm0gb2YgZm9ybXMpIHtcclxuICAgICAgbGV0IGZpZWxkcyA9IGZvcm0ucXVlcnlTZWxlY3RvckFsbCgnLmpzLWZvcm0tdmFsaWRhdGUtaW5wdXQgaW5wdXQnKTtcclxuICAgICAgbGV0IGZpbGUgPSBmb3JtLnF1ZXJ5U2VsZWN0b3IoJy5qcy1jYWxjdWxhdGUtZmlsZS1pbnB1dCcpO1xyXG4gICAgICBsZXQgdmFsaWRGb3JtID0gZmFsc2U7XHJcblxyXG4gICAgICBmb3IgKGNvbnN0IGZpZWxkIG9mIGZpZWxkcykge1xyXG4gICAgICAgIGZpZWxkLmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgaWYgKCAhdmFsaWRhdGVGaWVsZChmaWVsZCkgKSB7XHJcbiAgICAgICAgICAgIGZpZWxkLmNsYXNzTGlzdC5hZGQoJ2hhcy1lcnJvcicpO1xyXG4gICAgICAgICAgICB2YWxpZEZvcm0gPSBmYWxzZTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGZpZWxkLmNsYXNzTGlzdC5yZW1vdmUoJ2hhcy1lcnJvcicpO1xyXG4gICAgICAgICAgICB2YWxpZEZvcm0gPSB0cnVlO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBmb3JtLmFkZEV2ZW50TGlzdGVuZXIoJ3N1Ym1pdCcsIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcblxyXG4gICAgICAgIGZvciAoY29uc3QgZmllbGQgb2YgZmllbGRzKSB7XHJcbiAgICAgICAgICBpZiAoICF2YWxpZGF0ZUZpZWxkKGZpZWxkKSApIHtcclxuICAgICAgICAgICAgZmllbGQuY2xhc3NMaXN0LmFkZCgnaGFzLWVycm9yJyk7XHJcbiAgICAgICAgICAgIHZhbGlkRm9ybSA9IGZhbHNlO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuXHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBmaWVsZC5jbGFzc0xpc3QucmVtb3ZlKCdoYXMtZXJyb3InKTtcclxuICAgICAgICAgICAgdmFsaWRGb3JtID0gdHJ1ZTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICggdmFsaWRGb3JtICkge1xyXG4gICAgICAgICAgbGV0IGZvcm1EYXRhID0gbmV3IEZvcm1EYXRhKGZvcm0pO1xyXG5cclxuICAgICAgICAgIGlmICggZmlsZSApIHtcclxuICAgICAgICAgICAgZm9ybURhdGEuYXBwZW5kKCdmaWxlJywgZmlsZS5maWxlc1swXSk7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgbGV0IHN1Y2Nlc3MgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgZm9ybS5jbGFzc0xpc3QuYWRkKCdzdWNjZXNzJyk7XHJcbiAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgIHNlbmREYXRhKGZvcm1EYXRhLCAnLycsIHN1Y2Nlc3MpO1xyXG5cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgY29uc29sZS5sb2coJ3VudmFsaWQgZm9ybScpXHJcbiAgICAgICAgfVxyXG4gICAgICB9KVxyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gdmFsaWRhdGVGaWVsZChpbnB1dCkge1xyXG4gIGxldCB2YWx1ZSA9IGlucHV0LnZhbHVlO1xyXG4gIGxldCB0eXBlID0gaW5wdXQudHlwZTtcclxuICBsZXQgcmVzdWx0ID0gZmFsc2U7XHJcblxyXG4gIGlmICggdHlwZSA9PSAndGVsJyApIHtcclxuICAgIHJlc3VsdCA9IHZhbGlkYXRlUGhvbmUodmFsdWUpO1xyXG4gIH0gZWxzZSBpZiAoIHR5cGUgPT0gJ2VtYWlsJyApIHtcclxuICAgIHJlc3VsdCA9IHZhbGlkYXRlTWFpbCh2YWx1ZSk7XHJcbiAgfSBlbHNlIHtcclxuICAgIHJlc3VsdCA9ICFpc0VtcHR5KHZhbHVlKTtcclxuICB9XHJcblxyXG4gIHJldHVybiByZXN1bHQ7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGlzRW1wdHkoc3RyKSB7XHJcbiAgcmV0dXJuIHN0ciA9PSAnJyAmJiB0cnVlO1xyXG59XHJcblxyXG5mdW5jdGlvbiB2YWxpZGF0ZVBob25lKHN0cikge1xyXG4gIGxldCByZWcgPSAvXltcXCtdP1soXT9bMC05XXszfVspXT9bLVxcc1xcLl0/WzAtOV17M31bLVxcc1xcLl0/WzAtOV17NCw2fSQvaW07XHJcbiAgcmV0dXJuIHRlc3RSZWcocmVnLCByZW1vdmVTcGFjZXMoc3RyKSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHZhbGlkYXRlTWFpbChzdHIpIHtcclxuICBsZXQgcmVzdWx0ID0gZmFsc2U7XHJcbiAgY29uc3QgcmVnID0gL14oKFtePD4oKVtcXF1cXFxcLiw7Olxcc0BcXFwiXSsoXFwuW148PigpW1xcXVxcXFwuLDs6XFxzQFxcXCJdKykqKXwoXFxcIi4rXFxcIikpQCgoXFxbWzAtOV17MSwzfVxcLlswLTldezEsM31cXC5bMC05XXsxLDN9XFwuWzAtOV17MSwzfVxcXSl8KChbYS16QS1aXFwtMC05XStcXC4pK1thLXpBLVpdezIsfSkpJC87XHJcbiAgcmVzdWx0ID0gdGVzdFJlZyhyZWcsIHN0cilcclxuICByZXR1cm4gcmVzdWx0O1xyXG59XHJcblxyXG5mdW5jdGlvbiByZW1vdmVTcGFjZXMoc3RyKSB7XHJcbiAgcmV0dXJuIHN0ci5yZXBsYWNlKC9cXHMvZywgJycpOztcclxufVxyXG5cclxuZnVuY3Rpb24gdGVzdFJlZyhyZSwgc3RyKXtcclxuICBpZiAocmUudGVzdChzdHIpKSB7XHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuICB9IGVsc2Uge1xyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gc2VuZERhdGEoZGF0YSwgdXJsLCBzdWNjZXNzKSB7XHJcbiAgaWYgKCAhZGF0YSB8fCAhdXJsICkge1xyXG4gICAgcmV0dXJuIGNvbnNvbGUubG9nKCdlcnJvciwgaGF2ZSBubyBkYXRhIG9yIHVybCcpO1xyXG4gIH1cclxuXHJcbiAgbGV0IHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xyXG5cclxuICB4aHIub25sb2FkZW5kID0gZnVuY3Rpb24oKSB7XHJcbiAgICBpZiAoeGhyLnN0YXR1cyA9PSAyMDApIHtcclxuICAgICAgbGV0IHN1Y2Nlc3NGdSA9IHN1Y2Nlc3M7XHJcblxyXG4gICAgICBzdWNjZXNzRnUoKTtcclxuICAgICAgY29uc29sZS5sb2coXCLQo9GB0L/QtdGFXCIpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgY29uc29sZS5sb2coXCLQntGI0LjQsdC60LAgXCIgKyB0aGlzLnN0YXR1cyk7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgeGhyLm9wZW4oXCJQT1NUXCIsIHVybCk7XHJcbiAgeGhyLnNlbmQoZGF0YSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGluaXRNb2RhbChtb2RhbFN3aXBlcikge1xyXG4gIGxldCBpbml0cyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy1tb2RhbC1pbml0Jyk7XHJcbiAgbGV0IGJvZHkgPSBkb2N1bWVudC5ib2R5O1xyXG5cclxuICBpZiAoIGluaXRzLmxlbmd0aCApIHtcclxuICAgIGZvciAoY29uc3QgaW5pdCBvZiBpbml0cykge1xyXG4gICAgICBsZXQgdGFyZ2V0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcihpbml0LmRhdGFzZXQudGFyZ2V0KTtcclxuICAgICAgbGV0IGNsb3NlcyA9IHRhcmdldC5xdWVyeVNlbGVjdG9yQWxsKCcuanMtbW9kYWwtY2xvc2UnKTtcclxuXHJcbiAgICAgIGlmICggY2xvc2VzLmxlbmd0aCApIHtcclxuICAgICAgICBmb3IgKGNvbnN0IGNsb3NlIG9mIGNsb3Nlcykge1xyXG4gICAgICAgICAgY2xvc2UuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGFyZ2V0LmNsYXNzTGlzdC5yZW1vdmUoJ2lzLWFjdGl2ZScpO1xyXG4gICAgICAgICAgICBib2R5LmNsYXNzTGlzdC5yZW1vdmUoJ21vZGFsLWlzLWFjdGl2ZScpO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoIHRhcmdldCApIHtcclxuICAgICAgICBpbml0LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICB0YXJnZXQuY2xhc3NMaXN0LmFkZCgnaXMtYWN0aXZlJyk7XHJcbiAgICAgICAgICBib2R5LmNsYXNzTGlzdC5hZGQoJ21vZGFsLWlzLWFjdGl2ZScpO1xyXG5cclxuICAgICAgICAgIGlmICggdGFyZ2V0LmRhdGFzZXQuc2xpZGVyID09ICd0cnVlJyApIHtcclxuICAgICAgICAgICAgbW9kYWxTd2lwZXIudXBkYXRlKCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGluaXREcmFnTkRyb3AoKSB7XHJcbiAgbGV0IGNvbnRhaW5lciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy1jYWxjdWxhdGUtZmlsZScpO1xyXG4gIGxldCBkcm9wQXJlYSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy1jYWxjdWxhdGUtZmlsZS1kcm9wYXJlYScpO1xyXG4gIGxldCBmaWxlRWxlbSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy1jYWxjdWxhdGUtZmlsZS1pbnB1dCcpO1xyXG4gIGxldCBhZGRpbmdzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLWNhbGN1bGF0ZS1maWxlLWFkZGluZ3MnKTtcclxuICBsZXQgZmlsZU5hbWUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtY2FsY3VsYXRlLWZpbGUtbmFtZScpO1xyXG4gIGxldCByZW1vdmVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLWNhbGN1bGF0ZS1maWxlLXJlbW92ZXInKTtcclxuXHJcbiAgaWYgKCAhY29udGFpbmVyICYmICFkcm9wQXJlYSAmJiAhZmlsZUVsZW0gJiYgIWFkZGluZ3MgJiYgIWZpbGVOYW1lICYmICFyZW1vdmVyICkge1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gcHJldmVudERlZmF1bHRzIChlKSB7XHJcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gIH07XHJcblxyXG4gIGZ1bmN0aW9uIGhpZ2hsaWdodCgpIHtcclxuICAgIGNvbnRhaW5lci5jbGFzc0xpc3QuYWRkKCdoaWdobGlnaHQnKTtcclxuICB9O1xyXG5cclxuICBmdW5jdGlvbiB1bmhpZ2hsaWdodCgpIHtcclxuICAgIGNvbnRhaW5lci5jbGFzc0xpc3QucmVtb3ZlKCdoaWdobGlnaHQnKTtcclxuICB9O1xyXG5cclxuICBmdW5jdGlvbiBoYW5kbGVGaWxlcyhmaWxlcykge1xyXG4gICAgYWRkaW5ncy5jbGFzc0xpc3QuYWRkKCdpcy1zaG93Jyk7XHJcbiAgICBjb250YWluZXIuY2xhc3NMaXN0LmFkZCgnaGFzLXJlc3VsdCcpO1xyXG4gICAgZmlsZU5hbWUudGV4dENvbnRlbnQgPSBmaWxlc1swXS5uYW1lO1xyXG4gIH07XHJcblxyXG4gIGZ1bmN0aW9uIGhhbmRsZVJlbW92ZUZpbGVzKCkge1xyXG4gICAgYWRkaW5ncy5jbGFzc0xpc3QucmVtb3ZlKCdpcy1zaG93Jyk7XHJcbiAgICBjb250YWluZXIuY2xhc3NMaXN0LnJlbW92ZSgnaGFzLXJlc3VsdCcpO1xyXG4gICAgZmlsZU5hbWUudGV4dENvbnRlbnQgPSAnJztcclxuICAgIGZpbGVFbGVtLnZhbHVlID0gJyc7XHJcbiAgfTtcclxuXHJcbiAgZnVuY3Rpb24gaGFuZGxlRHJvcChlKSB7XHJcbiAgICBsZXQgZHQgPSBlLmRhdGFUcmFuc2ZlcjtcclxuICAgIGxldCBmaWxlcyA9IGR0LmZpbGVzO1xyXG5cclxuICAgIGlmICggVmFsaWRhdGUodGhpcykgKSB7XHJcbiAgICAgIGhhbmRsZUZpbGVzKGZpbGVzKTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICBmaWxlRWxlbS5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCBmdW5jdGlvbigpIHtcclxuICAgIGlmICggVmFsaWRhdGUodGhpcykgKSB7XHJcbiAgICAgIGhhbmRsZUZpbGVzKHRoaXMuZmlsZXMpO1xyXG4gICAgfVxyXG4gIH0pO1xyXG5cclxuICByZW1vdmVyLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oKSB7XHJcbiAgICBoYW5kbGVSZW1vdmVGaWxlcygpO1xyXG4gIH0pO1xyXG5cclxuICBbJ2RyYWdlbnRlcicsICdkcmFnb3ZlcicsICdkcmFnbGVhdmUnLCAnZHJvcCddLmZvckVhY2goZXZlbnROYW1lID0+IHtcclxuICAgIGRyb3BBcmVhLmFkZEV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCBwcmV2ZW50RGVmYXVsdHMsIGZhbHNlKTtcclxuICB9KTtcclxuXHJcbiAgWydkcmFnZW50ZXInLCAnZHJhZ292ZXInXS5mb3JFYWNoKGV2ZW50TmFtZSA9PiB7XHJcbiAgICBkcm9wQXJlYS5hZGRFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgaGlnaGxpZ2h0LCBmYWxzZSk7XHJcbiAgfSk7XHJcbiAgXHJcbiAgWydkcmFnbGVhdmUnLCAnZHJvcCddLmZvckVhY2goZXZlbnROYW1lID0+IHtcclxuICAgIGRyb3BBcmVhLmFkZEV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCB1bmhpZ2hsaWdodCwgZmFsc2UpO1xyXG4gIH0pO1xyXG5cclxuICBkcm9wQXJlYS5hZGRFdmVudExpc3RlbmVyKCdkcm9wJywgaGFuZGxlRHJvcCwgZmFsc2UpO1xyXG5cclxuICB2YXIgX3ZhbGlkRmlsZUV4dGVuc2lvbnMgPSBbJy56aXAnLCAnLnJhciddO1xyXG5cclxuICBmdW5jdGlvbiBWYWxpZGF0ZShpbnB1dCkge1xyXG4gICAgdmFyIHNGaWxlTmFtZSA9IGlucHV0LnZhbHVlO1xyXG5cclxuICAgIGlmIChzRmlsZU5hbWUubGVuZ3RoID4gMCkge1xyXG4gICAgICB2YXIgYmxuVmFsaWQgPSBmYWxzZTtcclxuICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBfdmFsaWRGaWxlRXh0ZW5zaW9ucy5sZW5ndGg7IGorKykge1xyXG4gICAgICAgIHZhciBzQ3VyRXh0ZW5zaW9uID0gX3ZhbGlkRmlsZUV4dGVuc2lvbnNbal07XHJcbiAgICAgICAgaWYgKHNGaWxlTmFtZS5zdWJzdHIoc0ZpbGVOYW1lLmxlbmd0aCAtIHNDdXJFeHRlbnNpb24ubGVuZ3RoLCBzQ3VyRXh0ZW5zaW9uLmxlbmd0aCkudG9Mb3dlckNhc2UoKSA9PSBzQ3VyRXh0ZW5zaW9uLnRvTG93ZXJDYXNlKCkpIHtcclxuICAgICAgICAgIGJsblZhbGlkID0gdHJ1ZTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKCFibG5WYWxpZCkge1xyXG4gICAgICAgIGNvbnRhaW5lci5jbGFzc0xpc3QuYWRkKCdoYXMtZXJyb3InKTtcclxuXHJcbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuICAgICAgICAgIGNvbnRhaW5lci5jbGFzc0xpc3QucmVtb3ZlKCdoYXMtZXJyb3InKTtcclxuICAgICAgICB9LCAyMDAwKVxyXG5cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGluaXRSYW5nZSgpIHtcclxuICB2YXIgc2xpZGVycyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy1yYW5nZScpO1xyXG5cclxuICBpZiAoIHNsaWRlcnMubGVuZ3RoICkge1xyXG4gICAgZm9yIChjb25zdCBzbGlkZXIgb2Ygc2xpZGVycykge1xyXG4gICAgICBsZXQgc2xpZGVyU3RlcCA9IE51bWJlcihzbGlkZXIuZGF0YXNldC5zdGVwKTtcclxuICAgICAgbGV0IHNsaWRlck1pbiA9IE51bWJlcihzbGlkZXIuZGF0YXNldC5taW4pO1xyXG4gICAgICBsZXQgc2xpZGVyTWF4ID0gTnVtYmVyKHNsaWRlci5kYXRhc2V0Lm1heCk7XHJcbiAgICAgIGxldCBzbGlkZXJQaXBzID0gTnVtYmVyKHNsaWRlci5kYXRhc2V0LnBpcHMpO1xyXG5cclxuICAgICAgbm9VaVNsaWRlci5jcmVhdGUoc2xpZGVyLCB7XHJcbiAgICAgICAgc3RhcnQ6IFswXSxcclxuICAgICAgICBzdGVwOiBzbGlkZXJTdGVwLFxyXG4gICAgICAgIHJhbmdlOiB7XHJcbiAgICAgICAgICAnbWluJzogc2xpZGVyTWluLFxyXG4gICAgICAgICAgJ21heCc6IHNsaWRlck1heFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgY29ubmVjdDogJ2xvd2VyJyxcclxuICAgICAgICB0b29sdGlwczogdHJ1ZSxcclxuICAgICAgICBmb3JtYXQ6IHdOdW1iKHtcclxuICAgICAgICAgIGRlY2ltYWxzOiAzLFxyXG4gICAgICAgICAgdGhvdXNhbmQ6ICcuJyxcclxuICAgICAgICB9KSxcclxuICAgICAgICBwaXBzOiB7XHJcbiAgICAgICAgICBtb2RlOiAnY291bnQnLFxyXG4gICAgICAgICAgdmFsdWVzOiBzbGlkZXJQaXBzLFxyXG4gICAgICAgICAgc3RlcHBlZDogZmFsc2VcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgbGV0IG1pbmlNYXJrZXJzID0gc2xpZGVyLnF1ZXJ5U2VsZWN0b3JBbGwoJy5ub1VpLW1hcmtlci1ob3Jpem9udGFsLm5vVWktbWFya2VyJyk7XHJcblxyXG4gICAgICBpZiAoIG1pbmlNYXJrZXJzLmxlbmd0aCApIHtcclxuICAgICAgICBmb3IgKCBjb25zdCBtaW5pTWFya2VyIG9mIG1pbmlNYXJrZXJzICkge1xyXG4gICAgICAgICAgbWluaU1hcmtlci5yZW1vdmUoKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGluaXRIZWFkZXJUb2dnbGVyKCkge1xyXG4gIGxldCB0b2dnbGVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLWhlYWRlci10b2dnbGVyJyk7XHJcbiAgbGV0IGhlYWRlciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy1oZWFkZXInKTtcclxuICBsZXQgcGFnZVdyYXAgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtcGFnZS13cmFwJyk7XHJcbiAgbGV0IGRhcmtuZXNzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLWhlYWRlci1kYXJrbmVzcycpO1xyXG5cclxuICBpZiAoIHRvZ2dsZXIgJiYgaGVhZGVyICYmIHBhZ2VXcmFwICYmIGRhcmtuZXNzICkge1xyXG4gICAgdG9nZ2xlci5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKCkge1xyXG4gICAgICBoZWFkZXIuY2xhc3NMaXN0LnRvZ2dsZSgnaXMtb3BlbicpO1xyXG4gICAgICB0b2dnbGVyLmNsYXNzTGlzdC50b2dnbGUoJ2lzLWFjdGl2ZScpO1xyXG4gICAgICBwYWdlV3JhcC5jbGFzc0xpc3QudG9nZ2xlKCdzY3JvbGwtYmxvY2tlZC1tb2JpbGUnKTtcclxuICAgIH0pO1xyXG5cclxuICAgIGRhcmtuZXNzLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgIGhlYWRlci5jbGFzc0xpc3QucmVtb3ZlKCdpcy1vcGVuJyk7XHJcbiAgICAgIHRvZ2dsZXIuY2xhc3NMaXN0LnJlbW92ZSgnaXMtYWN0aXZlJyk7XHJcbiAgICAgIHBhZ2VXcmFwLmNsYXNzTGlzdC5yZW1vdmUoJ3Njcm9sbC1ibG9ja2VkLW1vYmlsZScpO1xyXG4gICAgfSk7XHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBpbml0QWxidW1zQ2FyZFNsaWRlcigpIHtcclxuICB2YXIgbXlTd2lwZXIgPSBuZXcgU3dpcGVyKCcuanMtYWxidW1zLWNhcmQtc2xpZGVyJywge1xyXG4gICAgc3BlZWQ6IDQwMCxcclxuICAgIHNsaWRlc1BlclZpZXc6IDEsXHJcbiAgICBuYXZpZ2F0aW9uOiB7XHJcbiAgICAgIG5leHRFbDogJy5zd2lwZXItYnV0dG9uLW5leHQnLFxyXG4gICAgICBwcmV2RWw6ICcuc3dpcGVyLWJ1dHRvbi1wcmV2JyxcclxuICAgIH0sXHJcbiAgfSk7XHJcblxyXG4gIHJldHVybiBteVN3aXBlcjtcclxufVxyXG5cclxuZnVuY3Rpb24gaW5pdEFsYnVtU2xpZGVyKCkge1xyXG4gIHZhciBteVN3aXBlciA9IG5ldyBTd2lwZXIoJy5qcy1zd2lwZXItYWxidW0nLCB7XHJcbiAgICBzcGVlZDogNDAwLFxyXG4gICAgc2xpZGVzUGVyVmlldzogMSxcclxuICAgIGxvb3A6IGZhbHNlLFxyXG4gICAgcHJlbG9hZEltYWdlczogZmFsc2UsXHJcbiAgICBzcGFjZUJldHdlZW46IDEyLFxyXG4gICAgbGF6eTogdHJ1ZSxcclxuICAgIG5hdmlnYXRpb246IHtcclxuICAgICAgbmV4dEVsOiAnLnN3aXBlci1idXR0b24tbmV4dCcsXHJcbiAgICAgIHByZXZFbDogJy5zd2lwZXItYnV0dG9uLXByZXYnLFxyXG4gICAgfSxcclxuICB9KTtcclxuXHJcbiAgcmV0dXJuIG15U3dpcGVyO1xyXG59XHJcblxyXG5mdW5jdGlvbiBpbml0U3dpcGVyKCkge1xyXG4gIHZhciBteVN3aXBlciA9IG5ldyBTd2lwZXIoJy5qcy1zd2lwZXItY29udGFpbmVyJywge1xyXG4gICAgc3BlZWQ6IDQwMCxcclxuICAgIHNsaWRlc1BlclZpZXc6IDYsXHJcbiAgICBzcGFjZUJldHdlZW46IDQwLFxyXG4gICAgbG9vcDogZmFsc2UsXHJcbiAgICBwcmVsb2FkSW1hZ2VzOiBmYWxzZSxcclxuICAgIGxhenk6IHRydWUsIFxyXG4gICAgbmF2aWdhdGlvbjoge1xyXG4gICAgICBuZXh0RWw6ICcuc3dpcGVyLWJ1dHRvbi1uZXh0JyxcclxuICAgICAgcHJldkVsOiAnLnN3aXBlci1idXR0b24tcHJldicsXHJcbiAgICB9LFxyXG4gICAgYnJlYWtwb2ludHM6IHtcclxuICAgICAgNDU5OiB7XHJcbiAgICAgICAgc2xpZGVzUGVyVmlldzogMSxcclxuICAgICAgfSxcclxuICAgICAgNTk5OiB7XHJcbiAgICAgICAgc2xpZGVzUGVyVmlldzogMixcclxuICAgICAgfSxcclxuICAgICAgNzY3OiB7XHJcbiAgICAgICAgc2xpZGVzUGVyVmlldzogMyxcclxuICAgICAgfSxcclxuICAgICAgMTE5OToge1xyXG4gICAgICAgIHNsaWRlc1BlclZpZXc6IDQsXHJcbiAgICAgIH0sXHJcbiAgICB9XHJcbiAgfSk7XHJcblxyXG4gIHJldHVybiBteVN3aXBlcjtcclxufVxyXG5cclxuZnVuY3Rpb24gaW5pdFN3aXBlclN0YXRpY2soKSB7XHJcbiAgdmFyIG15U3dpcGVyID0gbmV3IFN3aXBlcignLmpzLXN3aXBlci1jb250YWluZXItc3RhdGljaycsIHtcclxuICAgIHNwZWVkOiA0MDAsXHJcbiAgICBzbGlkZXNQZXJWaWV3OiA2LFxyXG4gICAgc3BhY2VCZXR3ZWVuOiA0MCxcclxuICAgIGxvb3A6IGZhbHNlLFxyXG4gICAgcHJlbG9hZEltYWdlczogZmFsc2UsXHJcbiAgICBsYXp5OiB0cnVlLFxyXG4gICAgZm9sbG93RmluZ2VyOiBmYWxzZSxcclxuICAgIGJyZWFrcG9pbnRzOiB7XHJcbiAgICAgIDQ1OToge1xyXG4gICAgICAgIHNsaWRlc1BlclZpZXc6IDEsXHJcbiAgICAgIH0sXHJcbiAgICAgIDU5OToge1xyXG4gICAgICAgIHNsaWRlc1BlclZpZXc6IDIsXHJcbiAgICAgIH0sXHJcbiAgICAgIDc2Nzoge1xyXG4gICAgICAgIHNsaWRlc1BlclZpZXc6IDMsXHJcbiAgICAgIH0sXHJcbiAgICAgIDExOTk6IHtcclxuICAgICAgICBzbGlkZXNQZXJWaWV3OiA0LFxyXG4gICAgICB9LFxyXG4gICAgfVxyXG4gIH0pO1xyXG5cclxuICByZXR1cm4gbXlTd2lwZXI7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGluaXRNYWluU3dpcGVyKCkge1xyXG4gIHZhciBteVN3aXBlciA9IG5ldyBTd2lwZXIoJy5qcy1tYWluLXN3aXBlci1jb250YWluZXInLCB7XHJcbiAgICBzcGVlZDogNDAwLFxyXG4gICAgc2xpZGVzUGVyVmlldzogMSxcclxuICAgIGxvb3A6IHRydWUsXHJcbiAgICBzcGFjZUJldHdlZW46IDEyLFxyXG4gICAgcGFnaW5hdGlvbjoge1xyXG4gICAgICBlbDogJy5zd2lwZXItcGFnaW5hdGlvbicsXHJcbiAgICAgIHR5cGU6ICdidWxsZXRzJyxcclxuICAgICAgY2xpY2thYmxlOiB0cnVlXHJcbiAgICB9LFxyXG4gICAgbmF2aWdhdGlvbjoge1xyXG4gICAgICBuZXh0RWw6ICcuc3dpcGVyLWJ1dHRvbi1uZXh0JyxcclxuICAgICAgcHJldkVsOiAnLnN3aXBlci1idXR0b24tcHJldicsXHJcbiAgICB9LFxyXG4gIH0pO1xyXG5cclxuICByZXR1cm4gbXlTd2lwZXI7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGluaXRNb2RhbFN3aXBlcigpIHtcclxuICB2YXIgbXlTd2lwZXIgPSBuZXcgU3dpcGVyKCcuanMtbWFpbi1zd2lwZXItbW9kYWwnLCB7XHJcbiAgICBzcGVlZDogNDAwLFxyXG4gICAgc2xpZGVzUGVyVmlldzogMSxcclxuICAgIGxvb3A6IHRydWUsXHJcbiAgICBzcGFjZUJldHdlZW46IDEyLFxyXG4gICAgcHJlbG9hZEltYWdlczogZmFsc2UsXHJcbiAgICBsYXp5OiB0cnVlLFxyXG4gICAgcGFnaW5hdGlvbjoge1xyXG4gICAgICBlbDogJy5zd2lwZXItcGFnaW5hdGlvbicsXHJcbiAgICAgIHR5cGU6ICdidWxsZXRzJyxcclxuICAgICAgY2xpY2thYmxlOiB0cnVlXHJcbiAgICB9LFxyXG4gICAgbmF2aWdhdGlvbjoge1xyXG4gICAgICBuZXh0RWw6ICcuc3dpcGVyLWJ1dHRvbi1uZXh0JyxcclxuICAgICAgcHJldkVsOiAnLnN3aXBlci1idXR0b24tcHJldicsXHJcbiAgICB9LFxyXG4gIH0pO1xyXG5cclxuICByZXR1cm4gbXlTd2lwZXI7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGluaXRBbGJ1bXNUeXBlU2xpZGVyKCkge1xyXG4gIHZhciBteVN3aXBlciA9IG5ldyBTd2lwZXIoJy5qcy10eXBlLWFsYnVtcy1zd2lwZXInLCB7XHJcbiAgICBzcGVlZDogNDAwLFxyXG4gICAgc2xpZGVzUGVyVmlldzogJ2F1dG8nLFxyXG4gICAgc2xpZGVzT2Zmc2V0QWZ0ZXI6IDEwMCxcclxuICAgIHNwYWNlQmV0d2VlbjogMjQsXHJcbiAgICBuYXZpZ2F0aW9uOiB7XHJcbiAgICAgIG5leHRFbDogJy5zd2lwZXItYnV0dG9uLW5leHQnLFxyXG4gICAgICBwcmV2RWw6ICcuc3dpcGVyLWJ1dHRvbi1wcmV2JyxcclxuICAgIH0sXHJcbiAgICBvbjoge1xyXG4gICAgICBzbGlkZUNoYW5nZTogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGlmICggdGhpcy5hY3RpdmVJbmRleCA+IDAgKSB7XHJcbiAgICAgICAgICB0aGlzLmVsLmNsYXNzTGlzdC5hZGQoJ25vdC1vbi1zdGFydCcpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICB0aGlzLmVsLmNsYXNzTGlzdC5yZW1vdmUoJ25vdC1vbi1zdGFydCcpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgfSk7XHJcblxyXG4gIHJldHVybiBteVN3aXBlcjtcclxufVxyXG5cclxuZnVuY3Rpb24gaW5pdE1haW5DYXJkc1NsaWRlcigpIHtcclxuICB2YXIgbXlTd2lwZXIgPSBuZXcgU3dpcGVyKCcuanMtbWFpbi1jYXJkLXNsaWRlcicsIHtcclxuICAgIHNwZWVkOiA0MDAsXHJcbiAgICBzbGlkZXNQZXJWaWV3OiAxLFxyXG4gICAgbG9vcDogdHJ1ZSxcclxuICAgIHNwYWNlQmV0d2VlbjogMTIsXHJcbiAgICBuYXZpZ2F0aW9uOiB7XHJcbiAgICAgIG5leHRFbDogJy5zd2lwZXItYnV0dG9uLW5leHQnLFxyXG4gICAgICBwcmV2RWw6ICcuc3dpcGVyLWJ1dHRvbi1wcmV2JyxcclxuICAgIH0sXHJcbiAgfSk7XHJcblxyXG4gIHJldHVybiBteVN3aXBlcjtcclxufVxyXG5cclxuZnVuY3Rpb24gdGFiKHRhYkhhbmRsZXIpIHtcclxuICAgIGxldCB0YWJzQ29udGFpbmVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5qcy10YWItY29udGFpbmVyXCIpO1xyXG5cclxuICAgIGlmICggdGFic0NvbnRhaW5lciApIHtcclxuICAgICAgbGV0IG1lbnVJdGVtcyA9IHRhYnNDb250YWluZXIucXVlcnlTZWxlY3RvckFsbChcIi5qcy10YWItbWVudS1pdGVtXCIpO1xyXG4gICAgICBsZXQgdW5kZXJsaW5lID0gdGFic0NvbnRhaW5lci5xdWVyeVNlbGVjdG9yKFwiLmpzLXRhYi11bmRlcmxpbmVcIik7XHJcblxyXG4gICAgICBtZW51SXRlbXMuZm9yRWFjaCggKG1lbnVJdGVtKSA9PiB7XHJcbiAgICAgICAgaWYgKCB1bmRlcmxpbmUgJiYgbWVudUl0ZW0uY2xhc3NMaXN0LmNvbnRhaW5zKFwiaXMtYWN0aXZlXCIpICkge1xyXG4gICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgIGN1cnJlbnRUYWJBY2NlbnQodW5kZXJsaW5lLCBtZW51SXRlbSk7XHJcbiAgICAgICAgICB9LCAxMDApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbWVudUl0ZW0ub25jbGljayA9ICgpID0+IHtcclxuICAgICAgICAgIGxldCBhY3RpdmVNZW51SXRlbSA9IEFycmF5LmZyb20obWVudUl0ZW1zKS5maW5kKGdldEFjdGl2ZVRhYik7XHJcbiAgICAgICAgICBsZXQgYWN0aXZlQ29udGVudEl0ZW0gPSB0YWJzQ29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoYWN0aXZlTWVudUl0ZW0uZGF0YXNldC50YXJnZXQpO1xyXG4gICAgICAgICAgbGV0IGN1cnJlbnRDb250ZW50SXRlbSA9IHRhYnNDb250YWluZXIucXVlcnlTZWxlY3RvcihtZW51SXRlbS5kYXRhc2V0LnRhcmdldCk7XHJcblxyXG4gICAgICAgICAgYWN0aXZlTWVudUl0ZW0uY2xhc3NMaXN0LnJlbW92ZShcImlzLWFjdGl2ZVwiKTtcclxuXHJcbiAgICAgICAgICBpZiAoIGFjdGl2ZUNvbnRlbnRJdGVtICkge1xyXG4gICAgICAgICAgICBhY3RpdmVDb250ZW50SXRlbS5jbGFzc0xpc3QucmVtb3ZlKFwiaXMtYWN0aXZlXCIpO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIGlmICggY3VycmVudENvbnRlbnRJdGVtICkge1xyXG4gICAgICAgICAgICBjdXJyZW50Q29udGVudEl0ZW0uY2xhc3NMaXN0LmFkZChcImlzLWFjdGl2ZVwiKTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICBtZW51SXRlbS5jbGFzc0xpc3QuYWRkKFwiaXMtYWN0aXZlXCIpO1xyXG5cclxuICAgICAgICAgIGlmICggdW5kZXJsaW5lICkge1xyXG4gICAgICAgICAgICBjdXJyZW50VGFiQWNjZW50KHVuZGVybGluZSwgbWVudUl0ZW0pO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIGlmICggdGFiSGFuZGxlciApIHtcclxuICAgICAgICAgICAgZG9jdW1lbnQuZGlzcGF0Y2hFdmVudCh0YWJIYW5kbGVyKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgZnVuY3Rpb24gY3VycmVudFRhYkFjY2VudCh1bmRlcmxpbmUsIG1lbnVJdGVtKSB7XHJcbiAgICBsZXQgaXRlbVBvc2l0aW9uID0gbWVudUl0ZW0ub2Zmc2V0TGVmdDtcclxuICAgIGxldCBpdGVtV2lkdGggPSBOdW1iZXIobWVudUl0ZW0uc2Nyb2xsV2lkdGgpO1xyXG5cclxuICAgIHJldHVybiB1bmRlcmxpbmUuc2V0QXR0cmlidXRlKFwic3R5bGVcIiwgYGxlZnQ6ICR7aXRlbVBvc2l0aW9ufXB4OyB3aWR0aDogJHtpdGVtV2lkdGh9cHg7YCk7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBnZXRBY3RpdmVUYWIoZWxlbWVudCkge1xyXG4gICAgcmV0dXJuIGVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKFwiaXMtYWN0aXZlXCIpO1xyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gYWNjb3JkaW9uKCkge1xyXG4gIGxldCB3cmFwcGVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmpzLWFjY29yZGlvbicpO1xyXG4gIHdyYXBwZXIuZm9yRWFjaCh3cmFwcGVySXRlbSA9PiB7XHJcbiAgICBsZXQgaXRlbXMgPSB3cmFwcGVySXRlbS5xdWVyeVNlbGVjdG9yQWxsKCcuanMtYWNjb3JkaW9uLWl0ZW0nKTtcclxuICAgIGxldCBpbmRpdmlkdWFsID0gd3JhcHBlckl0ZW0uZ2V0QXR0cmlidXRlKCdpbmRpdmlkdWFsJykgJiYgd3JhcHBlckl0ZW0uZ2V0QXR0cmlidXRlKCdpbmRpdmlkdWFsJykgIT09ICdmYWxzZSc7XHJcblxyXG4gICAgaXRlbXMuZm9yRWFjaChpdGVtID0+IHtcclxuICAgICAgaWYgKCBpdGVtLmNsYXNzTGlzdC5jb250YWlucygnaXMtYWN0aXZlJykgKSB7XHJcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICBsZXQgcmVhZHlDb250ZW50ID0gaXRlbS5xdWVyeVNlbGVjdG9yKCcuanMtYWNjb3JkaW9uLWNvbnRlbnQnKTtcclxuICAgICAgICAgIGxldCByZWFkeUNvbnRlbnRIZWlnaHQgPSByZWFkeUNvbnRlbnQuc2Nyb2xsSGVpZ2h0O1xyXG5cclxuICAgICAgICAgIHJlYWR5Q29udGVudC5zdHlsZS5tYXhIZWlnaHQgPSByZWFkeUNvbnRlbnRIZWlnaHQgKyAncHgnO1xyXG4gICAgICAgIH0sIDEwMCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGxldCBzdWJJdGVtcyA9IGl0ZW0ucXVlcnlTZWxlY3RvckFsbCgnLmpzLWFjY29yZGlvbi1zdWJpdGVtJyk7XHJcblxyXG4gICAgICBmb3IgKGNvbnN0IHN1Ykl0ZW0gb2Ygc3ViSXRlbXMpIHtcclxuICAgICAgICBpZiAoIHN1Ykl0ZW0uY2xhc3NMaXN0LmNvbnRhaW5zKCdpcy1hY3RpdmUnKSApIHtcclxuICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICBsZXQgcmVhZHlDb250ZW50ID0gc3ViSXRlbS5xdWVyeVNlbGVjdG9yKCcuanMtYWNjb3JkaW9uLWNvbnRlbnQnKTtcclxuICAgICAgICAgICAgbGV0IHJlYWR5Q29udGVudEhlaWdodCA9IHJlYWR5Q29udGVudC5zY3JvbGxIZWlnaHQ7XHJcbiAgXHJcbiAgICAgICAgICAgIHJlYWR5Q29udGVudC5zdHlsZS5tYXhIZWlnaHQgPSByZWFkeUNvbnRlbnRIZWlnaHQgKyAncHgnO1xyXG4gICAgICAgICAgfSwgMTAwKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGl0ZW1JdGVyYXRpb24oaXRlbSwgaXRlbXMsIGluZGl2aWR1YWwpO1xyXG5cclxuICAgICAgc3ViSXRlbXMuZm9yRWFjaChzdWJpdGVtID0+IHtcclxuICAgICAgICBpdGVtSXRlcmF0aW9uKHN1Yml0ZW0sIHN1Ykl0ZW1zLCBpbmRpdmlkdWFsLCB0cnVlKVxyXG4gICAgICB9KTtcclxuICAgIH0pXHJcbiAgfSlcclxufVxyXG5cclxuZnVuY3Rpb24gaXRlbUl0ZXJhdGlvbihpdGVtLCBpdGVtcywgaW5kaXZpZHVhbCwgaXNTdWJpdGVtKSB7XHJcbiAgbGV0IGluaXQgPSBpdGVtLnF1ZXJ5U2VsZWN0b3IoJy5qcy1hY2NvcmRpb24taW5pdCcpO1xyXG4gIGxldCBjb250ZW50ID0gaXRlbS5xdWVyeVNlbGVjdG9yKCcuanMtYWNjb3JkaW9uLWNvbnRlbnQnKTtcclxuXHJcbiAgaWYgKCBpc1N1Yml0ZW0gPT09IHRydWUgKSB7XHJcbiAgICBjb250ZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3RyYW5zaXRpb25lbmQnLCBmdW5jdGlvbigpIHtcclxuICAgICAgbGV0IHBhcmVudEl0ZW0gPSBpdGVtLmNsb3Nlc3QoJy5qcy1hY2NvcmRpb24taXRlbScpO1xyXG4gICAgICBsZXQgcGFyZW50Q29udGVudEhlaWdodCA9IHBhcmVudEl0ZW0uc2Nyb2xsSGVpZ2h0ICsgJ3B4JztcclxuICAgICAgbGV0IHBhcmVudENvbnRlbnQgPSBwYXJlbnRJdGVtLnF1ZXJ5U2VsZWN0b3IoJy5qcy1hY2NvcmRpb24tY29udGVudCcpO1xyXG5cclxuICAgICAgcGFyZW50Q29udGVudC5zZXRBdHRyaWJ1dGUoJ3N0eWxlJywgYG1heC1oZWlnaHQ6ICR7cGFyZW50Q29udGVudEhlaWdodH1gKTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgaW5pdC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKCkge1xyXG4gICAgaWYgKCBpdGVtLmNsYXNzTGlzdC5jb250YWlucygnaXMtYWN0aXZlJykgKSB7XHJcbiAgICAgIGl0ZW0uY2xhc3NMaXN0LnJlbW92ZSgnaXMtYWN0aXZlJyk7XHJcbiAgICAgIGNvbnRlbnQuc3R5bGUubWF4SGVpZ2h0ID0gJzBweCc7XHJcblxyXG4gICAgICByZXR1cm4gZmFsc2VcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIGlzU3ViaXRlbSA9PT0gdHJ1ZSApIHtcclxuICAgICAgbGV0IHBhcmVudEl0ZW0gPSBpdGVtLmNsb3Nlc3QoJy5qcy1hY2NvcmRpb24taXRlbScpO1xyXG4gICAgICBsZXQgcGFyZW50Q29udGVudCA9IHBhcmVudEl0ZW0ucXVlcnlTZWxlY3RvcignLmpzLWFjY29yZGlvbi1jb250ZW50Jyk7XHJcblxyXG4gICAgICBwYXJlbnRDb250ZW50LnNldEF0dHJpYnV0ZSgnc3R5bGUnLCBgbWF4LWhlaWdodDogbm9uZWApO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICggaW5kaXZpZHVhbCApIHtcclxuICAgICAgaXRlbXMuZm9yRWFjaCgoZWxlbSkgPT4ge1xyXG4gICAgICAgIGxldCBlbGVtQ29udGVudCA9IGVsZW0ucXVlcnlTZWxlY3RvcignLmpzLWFjY29yZGlvbi1jb250ZW50Jyk7XHJcbiAgICAgICAgZWxlbS5jbGFzc0xpc3QucmVtb3ZlKCdpcy1hY3RpdmUnKTtcclxuICAgICAgICBlbGVtQ29udGVudC5zdHlsZS5tYXhIZWlnaHQgPSAwICsgJ3B4JztcclxuICAgICAgfSlcclxuICAgIH1cclxuXHJcbiAgICBpdGVtLmNsYXNzTGlzdC5hZGQoJ2lzLWFjdGl2ZScpO1xyXG4gICAgY29udGVudC5zdHlsZS5tYXhIZWlnaHQgPSBjb250ZW50LnNjcm9sbEhlaWdodCArICdweCc7XHJcbiAgfSk7XHJcbn0iXX0=
