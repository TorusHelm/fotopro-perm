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
  initModal();
  videPlay();
  // scrollToBlock();

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

function initModal() {
  let inits = document.querySelectorAll('.js-modal-init');
  let body = document.body;

  if (inits.length) {
    for (const init of inits) {
      let target = document.querySelector(init.dataset.target);
      let closes = target.querySelectorAll('.js-modal-close');
      let video = target.querySelector(".js-modal-video");
      let play = target.querySelector(".js-modal-video-play");
      let initVideo = init.querySelector("video");

      if (target) {
        if (closes.length) {
          for (const close of closes) {
            close.addEventListener('click', function () {
              target.classList.remove('is-active');
              body.classList.remove('modal-is-active');

              video && video.pause();
              play && play.classList.remove("d-none");
              init.classList.contains("js-modal-init-video") && initVideo.play();
            });
          }
        }

        init.addEventListener('click', function () {
          target.classList.add('is-active');
          body.classList.add('modal-is-active');

          init.classList.contains("js-modal-init-video") && initVideo.pause();
        });
      }
    }
  }
}

function scrollToBlock() {
  let inits = document.querySelectorAll('.js-scrollToBlock-init');

  if ( inits.length ) {
    inits.forEach(function(init) {
      let target = document.querySelector(init.dataset.target);

      init.addEventListener('click', function() {
        target.scrollIntoView({block: "center", behavior: "smooth"});
      });
    });
  }
}

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
  listsOutput.textContent = baseLists > 0 ? albumLists : baseLists; // Количество листов
  albumsOutput.textContent = albums;
  persantageOutput.textContent = percentage + '%';
  discountSummOutput.textContent = (albums * albumPriceWithDiscount) + ' ₽';

  window.calcData = `Вид альбома: ${typeOutput.textContent},\n Количество листов: ${albumLists},\n Количество альбомов: ${albums},\n Количество выпускников в альбоме: ${peoples},\n Количество человек на одном развороте: ${peoplesOnTurn},\n Количествово разворотов с фотоисторией: ${historyTurns},\n Цена за альбом: ${albumPrice},\n Скидка: ${percentage + '%'},\n Итоговая стоимость альбомов: ${(albums * albumPriceWithDiscount) + ' ₽'};`
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

  return (some * baseTurnPrice) + basePrice;
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

      if ( target ) {
        let closes = target.querySelectorAll('.js-modal-close');

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

          if ( target.dataset.slider == 'true' && modalSwiper ) {
            setTimeout(() => {
              modalSwiper.update();
            }, 100);
          }
        });
      }
    }
  }
}

function videPlay() {
  let modalVideo = document.querySelector(".js-modal-video-container");

  if (!modalVideo) return;

  let play = modalVideo.querySelector(".js-modal-video-play");
  let video = modalVideo.querySelector(".js-modal-video");

  video.addEventListener("click", function() {
    if (video.paused) {
      play.classList.add("d-none");
    } else {
      play.classList.remove("d-none");
    }
  });
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
    // preloadImages: false,
    spaceBetween: 12,
    autoHeight: true,
    // lazy: true,
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
  var mySwiper = new Swiper('.js-swiper-container-static', {
    speed: 400,
    slidesPerView: 6,
    spaceBetween: 40,
    loop: false,
    preloadImages: false,
    lazy: true,
    navigation: {
      nextEl: '.js-swiper-container-static-next',
      prevEl: '.js-swiper-container-static-prev',
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

  if ( mySwiper.slides && mySwiper.slides.length ) {
    let currentActiveIndex;

    for (let i = 0; i < mySwiper.slides.length; i++) {
      let item = mySwiper.slides[i];
      let currentActive = item.querySelector('.album-preview.is-active');

      if ( currentActive ) {
        currentActiveIndex = i;
      }
    }

    if ( currentActiveIndex ) {
      mySwiper.slideTo(currentActiveIndex);
    }
  }


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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XHJcblxyXG4oZnVuY3Rpb24oRUxFTUVOVCkge1xyXG4gIEVMRU1FTlQubWF0Y2hlcyA9IEVMRU1FTlQubWF0Y2hlcyB8fCBFTEVNRU5ULm1vek1hdGNoZXNTZWxlY3RvciB8fCBFTEVNRU5ULm1zTWF0Y2hlc1NlbGVjdG9yIHx8IEVMRU1FTlQub01hdGNoZXNTZWxlY3RvciB8fCBFTEVNRU5ULndlYmtpdE1hdGNoZXNTZWxlY3RvcjtcclxuICBFTEVNRU5ULmNsb3Nlc3QgPSBFTEVNRU5ULmNsb3Nlc3QgfHwgZnVuY3Rpb24gY2xvc2VzdChzZWxlY3Rvcikge1xyXG4gICAgaWYgKCF0aGlzKSByZXR1cm4gbnVsbDtcclxuICAgIGlmICh0aGlzLm1hdGNoZXMoc2VsZWN0b3IpKSByZXR1cm4gdGhpcztcclxuICAgIGlmICghdGhpcy5wYXJlbnRFbGVtZW50KSB7cmV0dXJuIG51bGx9XHJcbiAgICBlbHNlIHJldHVybiB0aGlzLnBhcmVudEVsZW1lbnQuY2xvc2VzdChzZWxlY3RvcilcclxuICB9O1xyXG59KEVsZW1lbnQucHJvdG90eXBlKSk7XHJcblxyXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgZnVuY3Rpb24oKSB7XHJcbiAgbGV0IHRhYkhhbmRsZXIgPSBuZXcgRXZlbnQoJ3RhYkhhbmRsZXInKTtcclxuICBsZXQgbW9kYWxTd2lwZXIgPSBpbml0TW9kYWxTd2lwZXIoKTtcclxuICBsZXQgc3dpcGVycyA9IGluaXRTd2lwZXIoKTtcclxuICBzdmc0ZXZlcnlib2R5KCk7XHJcbiAgaW5pdE1haW5Td2lwZXIoKTtcclxuICBpbml0SGVhZGVyVG9nZ2xlcigpO1xyXG4gIGluaXRBbGJ1bXNDYXJkU2xpZGVyKCk7XHJcbiAgYWNjb3JkaW9uKCk7XHJcbiAgaW5pdEFsYnVtc1R5cGVTbGlkZXIoKTtcclxuICBpbml0U3dpcGVyU3RhdGljaygpO1xyXG4gIGluaXRBbGJ1bVNsaWRlcigpO1xyXG4gIHRhYih0YWJIYW5kbGVyKTtcclxuICBpbml0UmFuZ2UoKTtcclxuICBpbml0RHJhZ05Ecm9wKCk7XHJcbiAgaW5pdE1vZGFsKG1vZGFsU3dpcGVyKTtcclxuICB2YWxpZGF0ZUZyb20oKTtcclxuICBjYXJkSGVhZGVySGFuZGxlKG1vZGFsU3dpcGVyLCAnL2FwaS9hbGJ1bS9pbWFnZXNfc2xpZGVyP2lkPScpO1xyXG4gIGNob2ljZVR5cGUoKTtcclxuICBzZXRIYW5kbGVyc1ByaWNlKCk7XHJcbiAgZ2V0VHJ1ZVByaWNlQ2FyZCgpO1xyXG4gIHNvcnREZXNpZ25zUGFnZSgpO1xyXG4gIGluaXRNb2RhbCgpO1xyXG4gIHZpZGVQbGF5KCk7XHJcbiAgLy8gc2Nyb2xsVG9CbG9jaygpO1xyXG5cclxuICBpZiAoIHdpbmRvdy5sb2NhdGlvbi5oYXNoICkge1xyXG4gICAgbGV0IHRhcmdldCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYFtkYXRhLXRhcmdldD1cIiR7d2luZG93LmxvY2F0aW9uLmhhc2h9XCJdYCk7XHJcblxyXG4gICAgaWYgKCB0YXJnZXQgKSB7XHJcbiAgICAgIHRhcmdldC5jbGljaygpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigndGFiSGFuZGxlcicsIGZ1bmN0aW9uKCkge1xyXG4gICAgaWYgKCAhc3dpcGVycyApIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIHN3aXBlcnMuZm9yRWFjaChzd2lwZXIgPT4ge1xyXG4gICAgICBzd2lwZXIudXBkYXRlKCk7XHJcbiAgICB9KTtcclxuXHJcbiAgfSwgZmFsc2UpO1xyXG5cclxuICBpZiAoIHdpbmRvdy5pbm5lcldpZHRoIDwgNzY4ICkge1xyXG4gICAgaW5pdE1haW5DYXJkc1NsaWRlcigpO1xyXG4gIH1cclxufSk7XHJcblxyXG5mdW5jdGlvbiBpbml0TW9kYWwoKSB7XHJcbiAgbGV0IGluaXRzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmpzLW1vZGFsLWluaXQnKTtcclxuICBsZXQgYm9keSA9IGRvY3VtZW50LmJvZHk7XHJcblxyXG4gIGlmIChpbml0cy5sZW5ndGgpIHtcclxuICAgIGZvciAoY29uc3QgaW5pdCBvZiBpbml0cykge1xyXG4gICAgICBsZXQgdGFyZ2V0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcihpbml0LmRhdGFzZXQudGFyZ2V0KTtcclxuICAgICAgbGV0IGNsb3NlcyA9IHRhcmdldC5xdWVyeVNlbGVjdG9yQWxsKCcuanMtbW9kYWwtY2xvc2UnKTtcclxuICAgICAgbGV0IHZpZGVvID0gdGFyZ2V0LnF1ZXJ5U2VsZWN0b3IoXCIuanMtbW9kYWwtdmlkZW9cIik7XHJcbiAgICAgIGxldCBwbGF5ID0gdGFyZ2V0LnF1ZXJ5U2VsZWN0b3IoXCIuanMtbW9kYWwtdmlkZW8tcGxheVwiKTtcclxuICAgICAgbGV0IGluaXRWaWRlbyA9IGluaXQucXVlcnlTZWxlY3RvcihcInZpZGVvXCIpO1xyXG5cclxuICAgICAgaWYgKHRhcmdldCkge1xyXG4gICAgICAgIGlmIChjbG9zZXMubGVuZ3RoKSB7XHJcbiAgICAgICAgICBmb3IgKGNvbnN0IGNsb3NlIG9mIGNsb3Nlcykge1xyXG4gICAgICAgICAgICBjbG9zZS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICB0YXJnZXQuY2xhc3NMaXN0LnJlbW92ZSgnaXMtYWN0aXZlJyk7XHJcbiAgICAgICAgICAgICAgYm9keS5jbGFzc0xpc3QucmVtb3ZlKCdtb2RhbC1pcy1hY3RpdmUnKTtcclxuXHJcbiAgICAgICAgICAgICAgdmlkZW8gJiYgdmlkZW8ucGF1c2UoKTtcclxuICAgICAgICAgICAgICBwbGF5ICYmIHBsYXkuY2xhc3NMaXN0LnJlbW92ZShcImQtbm9uZVwiKTtcclxuICAgICAgICAgICAgICBpbml0LmNsYXNzTGlzdC5jb250YWlucyhcImpzLW1vZGFsLWluaXQtdmlkZW9cIikgJiYgaW5pdFZpZGVvLnBsYXkoKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpbml0LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgdGFyZ2V0LmNsYXNzTGlzdC5hZGQoJ2lzLWFjdGl2ZScpO1xyXG4gICAgICAgICAgYm9keS5jbGFzc0xpc3QuYWRkKCdtb2RhbC1pcy1hY3RpdmUnKTtcclxuXHJcbiAgICAgICAgICBpbml0LmNsYXNzTGlzdC5jb250YWlucyhcImpzLW1vZGFsLWluaXQtdmlkZW9cIikgJiYgaW5pdFZpZGVvLnBhdXNlKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHNjcm9sbFRvQmxvY2soKSB7XHJcbiAgbGV0IGluaXRzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmpzLXNjcm9sbFRvQmxvY2staW5pdCcpO1xyXG5cclxuICBpZiAoIGluaXRzLmxlbmd0aCApIHtcclxuICAgIGluaXRzLmZvckVhY2goZnVuY3Rpb24oaW5pdCkge1xyXG4gICAgICBsZXQgdGFyZ2V0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcihpbml0LmRhdGFzZXQudGFyZ2V0KTtcclxuXHJcbiAgICAgIGluaXQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbigpIHtcclxuICAgICAgICB0YXJnZXQuc2Nyb2xsSW50b1ZpZXcoe2Jsb2NrOiBcImNlbnRlclwiLCBiZWhhdmlvcjogXCJzbW9vdGhcIn0pO1xyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gc29ydERlc2lnbnNQYWdlKCkge1xyXG4gIGxldCB0YXJnZXRzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmpzLXNvcnQgaW5wdXQnKTtcclxuICBsZXQgYWNjZXB0QnRuID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLXNvcnQtYWNjZXB0Jyk7XHJcblxyXG4gIGlmICggIXRhcmdldHMubGVuZ3RoICkge1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuXHJcbiAgbGV0IGFyciA9IFtdO1xyXG4gIGxldCBhbGwgPSBmYWxzZTtcclxuXHJcbiAgdGFyZ2V0cy5mb3JFYWNoKCB0YXJnZXQgPT4ge1xyXG4gICAgbGV0IGlkID0gdGFyZ2V0LmRhdGFzZXQuaWQ7XHJcblxyXG4gICAgdGFyZ2V0LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIGZ1bmN0aW9uKCkge1xyXG4gICAgICBpZiAoIHRhcmdldC5jaGVja2VkICkge1xyXG4gICAgICAgIGlkID09PSAnYWxsJyA/IGFsbCA9IHRydWUgOiBhcnIucHVzaChpZCk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgaWQgPT09ICdhbGwnID8gYWxsID0gZmFsc2UgOiBhcnIuZmluZCggKGl0ZW0sIGluZGV4KSA9PiBpdGVtID09IGlkICYmIGFyci5zcGxpY2UoaW5kZXgsIDEpICk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIGlmICggaWQgIT09ICdhbGwnICkge1xyXG4gICAgICB0YXJnZXQuY2hlY2tlZCAmJiBhcnIucHVzaChpZCk7XHJcbiAgICB9IGVsc2UgaWYgKCBpZCA9PT0gJ2FsbCcgJiYgdGFyZ2V0LmNoZWNrZWQgKSB7XHJcbiAgICAgIGFsbCA9IHRydWU7XHJcbiAgICB9XHJcbiAgfSk7XHJcblxyXG4gIGFjY2VwdEJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKCkge1xyXG4gICAgaWYgKCB0YXJnZXRzLmxlbmd0aCAtIDEgPT09IGFyci5sZW5ndGggKSB7XHJcbiAgICAgIGFsbCA9IHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0VXJsKGFyciwgYWxsKTtcclxuICB9KTtcclxufVxyXG5cclxuZnVuY3Rpb24gc2V0VXJsKGFyciwgYWxsKSB7XHJcbiAgbGV0IHVybCA9IGxvY2F0aW9uLnByb3RvY29sICsgJy8vJyArIGxvY2F0aW9uLmhvc3QgKyBsb2NhdGlvbi5wYXRobmFtZTtcclxuICBsZXQgcGFyYW1zID0gYWxsID8gJycgOiBhcnIuam9pbigpO1xyXG5cclxuICByZXR1cm4gd2luZG93LmxvY2F0aW9uLmhyZWYgPSB1cmwgKyAnP2lkPScgKyBwYXJhbXM7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldFRydWVQcmljZUNhcmQoKSB7XHJcbiAgbGV0IHRhcmdldHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuanMtY2FyZC1wcmljZS13cmFwcGVyJyk7XHJcblxyXG4gIGlmICggdGFyZ2V0cy5sZW5ndGggKSB7XHJcbiAgICBmb3IgKGNvbnN0IHRhcmdldCBvZiB0YXJnZXRzKSB7XHJcbiAgICAgIGxldCBpbnB1dCA9IHRhcmdldC5xdWVyeVNlbGVjdG9yKCcuanMtY2FyZC1wcmljZSBpbnB1dCcpO1xyXG4gICAgICBsZXQgb3V0cHV0ID0gdGFyZ2V0LnF1ZXJ5U2VsZWN0b3IoJy5qcy1jYXJkLXByaWNlLW91dHB1dCcpO1xyXG4gICAgICBsZXQgYmFzZVByaWNlID0gK291dHB1dC5kYXRhc2V0LnByaWNlO1xyXG5cclxuICAgICAgaW5wdXQuYWRkRXZlbnRMaXN0ZW5lcignaW5wdXQnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgbGV0IHBlcmNhbnRhZ2UgPSBnZXREaXNjb3VudFBlcmNlbnQoK2lucHV0LnZhbHVlKTtcclxuICAgICAgICBsZXQgZGlzY291bnRQcmljZSA9IGdldERpc2NvdW50U3VtbShiYXNlUHJpY2UsIHBlcmNhbnRhZ2UpO1xyXG5cclxuICAgICAgICBvdXRwdXQudGV4dENvbnRlbnQgPSAoYmFzZVByaWNlIC0gZGlzY291bnRQcmljZSkgKyAnIOKCvSc7XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gY2hvaWNlVHlwZSgpIHtcclxuICBsZXQgdHlwZXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuanMtY2hvaWNlLXR5cGUnKTtcclxuICBsZXQgY29udGFpbmVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLWNob2ljZS10eXBlLWFkZGluZ3MnKTtcclxuICBsZXQgb3V0cHV0Q29udGFpbmVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLWNob2ljZS10eXBlLW91dHB1dCcpO1xyXG4gIGxldCByYW5nZXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuanMtcmFuZ2UnKTtcclxuXHJcbiAgaWYgKCAhdHlwZXMubGVuZ3RoIHx8ICFjb250YWluZXIgKSB7XHJcbiAgICByZXR1cm5cclxuICB9XHJcblxyXG4gIGZvciAoY29uc3QgdHlwZSBvZiB0eXBlcykge1xyXG4gICAgbGV0IGxpc3QgPSB0eXBlLnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy1jaG9pY2UtdHlwZS1saXN0IGxpJyk7XHJcbiAgICBsZXQgYXJyTGlzdCA9IFtdO1xyXG5cclxuICAgIGZvciAoY29uc3QgaXRlbSBvZiBsaXN0KSB7XHJcbiAgICAgIGFyckxpc3QucHVzaChpdGVtLnRleHRDb250ZW50KTtcclxuICAgIH1cclxuXHJcbiAgICB0eXBlLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgIGlmICggdHlwZS5jbGFzc0xpc3QuY29udGFpbnMoJ2lzLWFjdGl2ZScpICkge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKCByYW5nZXMubGVuZ3RoICkge1xyXG4gICAgICAgIHJhbmdlcy5mb3JFYWNoKChyYW5nZSkgPT4ge1xyXG4gICAgICAgICAgbGV0IHByZXNldCA9IHJhbmdlLmRhdGFzZXQucHJlc2V0O1xyXG4gICAgICAgICAgbGV0IHJhbmdlTWluID0gcmFuZ2UuZGF0YXNldC5taW47XHJcbiAgICAgICAgICBsZXQgc2V0TWluID0gcmFuZ2VNaW4gPyByYW5nZU1pbiA6IDA7XHJcblxyXG4gICAgICAgICAgcmFuZ2Uubm9VaVNsaWRlci5zZXQocHJlc2V0ID8gcHJlc2V0IDogc2V0TWluKTtcclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG5cclxuICAgICAgZm9yIChjb25zdCB0eXBlSW4gb2YgdHlwZXMpIHtcclxuICAgICAgICB0eXBlSW4uY2xhc3NMaXN0LnJlbW92ZSgnaXMtYWN0aXZlJyk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGNvbnRhaW5lci5jbGFzc0xpc3QuYWRkKCdpcy1hY3RpdmUnKTtcclxuXHJcbiAgICAgIGlmICggIWxpc3QubGVuZ3RoIHx8IGxpc3QubGVuZ3RoIDwgMiApIHtcclxuICAgICAgICBjb250YWluZXIuY2xhc3NMaXN0LnJlbW92ZSgnaXMtYWN0aXZlJyk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHR5cGUuY2xhc3NMaXN0LmFkZCgnaXMtYWN0aXZlJyk7XHJcbiAgICAgIG91dHB1dENvbnRhaW5lci5pbm5lckhUTUwgPSAnJztcclxuXHJcbiAgICAgIGxpc3QuZm9yRWFjaCgoaXRlbSwgaWR4KSA9PiB7XHJcbiAgICAgICAgaWYgKCBpZHggPT09IDAgKSB7XHJcbiAgICAgICAgICBvdXRwdXRDb250YWluZXIuYXBwZW5kQ2hpbGQoY3JlYXRlQ2hlY2ttYXJrKGl0ZW0udGV4dENvbnRlbnQsIHRydWUsIGl0ZW0uZGF0YXNldC5iYXNlUHJpY2UpKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgb3V0cHV0Q29udGFpbmVyLmFwcGVuZENoaWxkKGNyZWF0ZUNoZWNrbWFyayhpdGVtLnRleHRDb250ZW50LCBmYWxzZSwgaXRlbS5kYXRhc2V0LmJhc2VQcmljZSkpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcblxyXG4gICAgICBsZXQgY2hlY2ttYXJrcyA9IG91dHB1dENvbnRhaW5lci5xdWVyeVNlbGVjdG9yQWxsKCcuY2hlY2ttYXJrIGlucHV0Jyk7XHJcblxyXG4gICAgICBpZiAoIGNoZWNrbWFya3MubGVuZ3RoICkge1xyXG4gICAgICAgIGNoZWNrbWFya3NbMF0uY2xpY2soKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBzZXRIYW5kbGVyc1ByaWNlKCkge1xyXG4gIGxldCB0YXJnZXRzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmpzLWNhbGMtY2hhbmdlJyk7XHJcblxyXG4gIGZvciAoY29uc3QgdGFyZ2V0IG9mIHRhcmdldHMpIHtcclxuICAgIGlmICggdGFyZ2V0Lm5vVWlTbGlkZXIgKSB7XHJcbiAgICAgIHRhcmdldC5ub1VpU2xpZGVyLm9uKCdjaGFuZ2UnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICBjaGFuZ2VQcmljZUhhbmRsZSgpO1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICB0YXJnZXQuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgIGNoYW5nZVByaWNlSGFuZGxlKCk7XHJcbiAgICB9KTtcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNoYW5nZVByaWNlSGFuZGxlKCkge1xyXG4gIGxldCBiYXNlUHJpY2VzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmpzLWNob2ljZS10eXBlLW91dHB1dCBpbnB1dCcpO1xyXG4gIGxldCBiYXNlUHJpY2VJdGVtID0gZ2V0QmFzZVByaWNlKGJhc2VQcmljZXMpO1xyXG4gIGxldCBvdXRwdXRQcmljZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy1jYWxjLXByaWNlJyk7XHJcbiAgbGV0IG91dHB1dERpc2NvdW50UHJpY2UgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtY2FsYy1kaXNjb3VudC1wcmljZScpO1xyXG4gIGxldCB0eXBlT3V0cHV0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLWNhbGMtdHlwZS1vdXRwdXQnKTtcclxuICBsZXQgbGlzdHNPdXRwdXQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtY2FsYy1saXN0cy1vdXRwdXQnKTtcclxuICBsZXQgYWxidW1zT3V0cHV0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLWNhbGMtYWxidW1zLW91dHB1dCcpO1xyXG4gIGxldCBwZXJzYW50YWdlT3V0cHV0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLWNhbGMtZGlzY291bnQtcGVyc2FudGFnZS1vdXRwdXQnKTtcclxuICBsZXQgZGlzY291bnRTdW1tT3V0cHV0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLWNhbGMtZGlzY291bnQtc3VtbS1vdXRwdXQnKTtcclxuICBsZXQgYWxidW1zID0gK2RvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy1jYWxjLWFsYnVtcy1sZW5ndGggaW5wdXQnKS52YWx1ZTtcclxuICBsZXQgcGVvcGxlcyA9ICtkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtY2FsYy1wZW9wbGVzJykubm9VaVNsaWRlci5nZXQoKTtcclxuICBsZXQgcGVvcGxlc09uVHVybiA9ICtkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtY2FsYy1wZW9wbGVzLW9uLXR1cm4nKS5ub1VpU2xpZGVyLmdldCgpO1xyXG4gIGxldCBoaXN0b3J5VHVybnMgPSArZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLWNhbGMtaGlzdG9yeS10dXJucycpLm5vVWlTbGlkZXIuZ2V0KCk7XHJcbiAgbGV0IGFjdGl2ZUNob2ljZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy1jaG9pY2UtdHlwZS5pcy1hY3RpdmUnKTtcclxuICBsZXQgcmFuZ2VzQ2FuQmVEaXNhYmxlZCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy1yYW5nZS1jYW4tYmUtZGlzYWJsZWQnKTtcclxuXHJcbiAgaWYgKCAhYWN0aXZlQ2hvaWNlICkge1xyXG4gICAgcmV0dXJuXHJcbiAgfVxyXG5cclxuICBsZXQgYmFzZUxpc3RzID0gK2FjdGl2ZUNob2ljZS5kYXRhc2V0LmJhc2VMaXN0cztcclxuICBsZXQgYmFzZVR1cm4gPSArYWN0aXZlQ2hvaWNlLmRhdGFzZXQuYmFzZVR1cm47XHJcbiAgbGV0IGJhc2VUdXJuUHJpY2UgPSArYWN0aXZlQ2hvaWNlLmRhdGFzZXQudHVyblByaWNlO1xyXG4gIGxldCBiYXNlUHJpY2UgPSArYmFzZVByaWNlSXRlbS5kYXRhc2V0LmJhc2VQcmljZTtcclxuICBsZXQgYWxidW1MaXN0cyA9IGdldExpc3RJbkFsYnVtKHBlb3BsZXMsIHBlb3BsZXNPblR1cm4sIGhpc3RvcnlUdXJucywgYmFzZVR1cm4pO1xyXG4gIGxldCBhbGJ1bVByaWNlID0gZ2V0UHJpY2VGb3JBbGJ1bShiYXNlUHJpY2UsIGFsYnVtTGlzdHMsIGJhc2VMaXN0cywgYmFzZVR1cm5QcmljZSk7XHJcbiAgbGV0IHBlcmNlbnRhZ2UgPSBnZXREaXNjb3VudFBlcmNlbnQoYWxidW1zKTtcclxuICBsZXQgZGlzY291bnRTdW1tID0gZ2V0RGlzY291bnRTdW1tKGFsYnVtUHJpY2UsIHBlcmNlbnRhZ2UpO1xyXG4gIGxldCBhbGJ1bVByaWNlV2l0aERpc2NvdW50ID0gZ2V0UHJpY2VGb3JBbGJ1bURpc2NvdW50KGFsYnVtUHJpY2UsIGRpc2NvdW50U3VtbSk7XHJcblxyXG4gIGlmICggYmFzZUxpc3RzID09PSAwICYmIHJhbmdlc0NhbkJlRGlzYWJsZWQubGVuZ3RoICkge1xyXG4gICAgcmFuZ2VzQ2FuQmVEaXNhYmxlZC5mb3JFYWNoKGl0ZW0gPT4ge1xyXG4gICAgICBsZXQgcmFuZ2UgPSBpdGVtLnF1ZXJ5U2VsZWN0b3IoJy5qcy1yYW5nZScpO1xyXG4gICAgICBpdGVtLmNsYXNzTGlzdC5hZGQoJ2Rpc2FibGVkJyk7XHJcbiAgICAgIHJhbmdlLm5vVWlTbGlkZXIuc2V0KDApO1xyXG4gICAgfSk7XHJcbiAgfSBlbHNlIHtcclxuICAgIHJhbmdlc0NhbkJlRGlzYWJsZWQuZm9yRWFjaChpdGVtID0+IHtcclxuICAgICAgaXRlbS5jbGFzc0xpc3QucmVtb3ZlKCdkaXNhYmxlZCcpO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBvdXRwdXRQcmljZS50ZXh0Q29udGVudCA9IGFsYnVtUHJpY2U7XHJcbiAgb3V0cHV0RGlzY291bnRQcmljZS50ZXh0Q29udGVudCA9IGFsYnVtUHJpY2VXaXRoRGlzY291bnQ7XHJcbiAgdHlwZU91dHB1dC50ZXh0Q29udGVudCA9IGFjdGl2ZUNob2ljZS5xdWVyeVNlbGVjdG9yKCcuY2FsY3VsYXRlLXR5cGVzX190aXRsZScpLnRleHRDb250ZW50O1xyXG4gIGxpc3RzT3V0cHV0LnRleHRDb250ZW50ID0gYmFzZUxpc3RzID4gMCA/IGFsYnVtTGlzdHMgOiBiYXNlTGlzdHM7IC8vINCa0L7Qu9C40YfQtdGB0YLQstC+INC70LjRgdGC0L7QslxyXG4gIGFsYnVtc091dHB1dC50ZXh0Q29udGVudCA9IGFsYnVtcztcclxuICBwZXJzYW50YWdlT3V0cHV0LnRleHRDb250ZW50ID0gcGVyY2VudGFnZSArICclJztcclxuICBkaXNjb3VudFN1bW1PdXRwdXQudGV4dENvbnRlbnQgPSAoYWxidW1zICogYWxidW1QcmljZVdpdGhEaXNjb3VudCkgKyAnIOKCvSc7XHJcblxyXG4gIHdpbmRvdy5jYWxjRGF0YSA9IGDQktC40LQg0LDQu9GM0LHQvtC80LA6ICR7dHlwZU91dHB1dC50ZXh0Q29udGVudH0sXFxuINCa0L7Qu9C40YfQtdGB0YLQstC+INC70LjRgdGC0L7QsjogJHthbGJ1bUxpc3RzfSxcXG4g0JrQvtC70LjRh9C10YHRgtCy0L4g0LDQu9GM0LHQvtC80L7QsjogJHthbGJ1bXN9LFxcbiDQmtC+0LvQuNGH0LXRgdGC0LLQviDQstGL0L/Rg9GB0LrQvdC40LrQvtCyINCyINCw0LvRjNCx0L7QvNC1OiAke3Blb3BsZXN9LFxcbiDQmtC+0LvQuNGH0LXRgdGC0LLQviDRh9C10LvQvtCy0LXQuiDQvdCwINC+0LTQvdC+0Lwg0YDQsNC30LLQvtGA0L7RgtC1OiAke3Blb3BsZXNPblR1cm59LFxcbiDQmtC+0LvQuNGH0LXRgdGC0LLQvtCy0L4g0YDQsNC30LLQvtGA0L7RgtC+0LIg0YEg0YTQvtGC0L7QuNGB0YLQvtGA0LjQtdC5OiAke2hpc3RvcnlUdXJuc30sXFxuINCm0LXQvdCwINC30LAg0LDQu9GM0LHQvtC8OiAke2FsYnVtUHJpY2V9LFxcbiDQodC60LjQtNC60LA6ICR7cGVyY2VudGFnZSArICclJ30sXFxuINCY0YLQvtCz0L7QstCw0Y8g0YHRgtC+0LjQvNC+0YHRgtGMINCw0LvRjNCx0L7QvNC+0LI6ICR7KGFsYnVtcyAqIGFsYnVtUHJpY2VXaXRoRGlzY291bnQpICsgJyDigr0nfTtgXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldEJhc2VQcmljZShhcnIpIHtcclxuICBpZiAoIGFyci5sZW5ndGggKSB7XHJcbiAgICBmb3IgKGNvbnN0IGl0ZW0gb2YgYXJyKSB7XHJcbiAgICAgIGlmICggaXRlbS5jaGVja2VkICkge1xyXG4gICAgICAgIHJldHVybiBpdGVtO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRQcmljZUZvckFsYnVtKGJhc2VQcmljZSwgYWxidW1MaXN0cywgYmFzZUxpc3RzLCBiYXNlVHVyblByaWNlKSB7XHJcbiAgbGV0IHNvbWUgPSAwO1xyXG5cclxuICBpZiAoIGFsYnVtTGlzdHMgLSBiYXNlTGlzdHMgPiAwICkge1xyXG4gICAgc29tZSA9IGFsYnVtTGlzdHMgLSBiYXNlTGlzdHM7XHJcbiAgfVxyXG5cclxuICByZXR1cm4gKHNvbWUgKiBiYXNlVHVyblByaWNlKSArIGJhc2VQcmljZTtcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0RGlzY291bnRQZXJjZW50KGFsYnVtcykge1xyXG4gIGlmICggYWxidW1zIDwgNSApIHtcclxuICAgIHJldHVybiAwO1xyXG4gIH1cclxuXHJcbiAgaWYgKCBhbGJ1bXMgPiAyMCApIHtcclxuICAgIHJldHVybiAyMDtcclxuICB9XHJcblxyXG4gIHJldHVybiBhbGJ1bXM7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldFByaWNlRm9yQWxidW1EaXNjb3VudChhbGJ1bVByaWNlLCBkaXNjb3VudFN1bW0pIHtcclxuICByZXR1cm4gYWxidW1QcmljZSAtIGRpc2NvdW50U3VtbTtcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0RGlzY291bnRTdW1tKGFsYnVtUHJpY2UsIHBlcmNlbnRhZ2UpIHtcclxuICByZXR1cm4gTWF0aC5jZWlsKGFsYnVtUHJpY2UgKiBwZXJjZW50YWdlIC8gMTAwKTtcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0TGlzdEluQWxidW0ocGVvcGxlcywgcGVvcGxlc09uVHVybiwgaGlzdG9yeVR1cm5zLCBiYXNlVHVybikge1xyXG4gIHJldHVybiBNYXRoLmNlaWwocGVvcGxlcyAvIHBlb3BsZXNPblR1cm4pICsgaGlzdG9yeVR1cm5zICsgYmFzZVR1cm47XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZUNoZWNrbWFyayh0ZXh0LCBmaXJzdCwgYmFzZVByaWNlKSB7XHJcbiAgbGV0IGNoZWNrbWFya1dyYXBwZXI7XHJcbiAgbGV0IGNoZWNrbWFyayA9IGNyZWF0ZUVsZW1lbnQoJ2xhYmVsJywgJ2NoZWNrbWFyaycpO1xyXG4gIGxldCBpbnB1dCA9IGNyZWF0ZUVsZW1lbnQoJ2lucHV0JywgJycpO1xyXG4gIHNldEF0dHJpYnV0ZXMoaW5wdXQsIHtcclxuICAgICd0eXBlJzogJ3JhZGlvJyxcclxuICAgICduYW1lJzogJ3R5cGVzJ1xyXG4gIH0pO1xyXG4gIGxldCBtYXJrID0gY3JlYXRlRWxlbWVudCgnc3BhbicsICdjaGVja21hcmtfX21hcmsnKTtcclxuICBsZXQgdmFyVGV4dCA9IGNyZWF0ZUVsZW1lbnQoJ3AnLCAnJyk7XHJcblxyXG4gIGlucHV0LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIGZ1bmN0aW9uKCkge1xyXG4gICAgY2hhbmdlUHJpY2VIYW5kbGUoKTtcclxuICB9KTtcclxuXHJcbiAgaWYgKCBmaXJzdCApIHtcclxuICAgIGNoZWNrbWFya1dyYXBwZXIgPSBjcmVhdGVFbGVtZW50KCdkaXYnLCAnY29sLTEyJyk7XHJcbiAgfSBlbHNlIHtcclxuICAgIGNoZWNrbWFya1dyYXBwZXIgPSBjcmVhdGVFbGVtZW50KCdkaXYnLCAnY29sLTEyIG10LTMnKTtcclxuICB9XHJcblxyXG4gIGlucHV0LmRhdGFzZXQuYmFzZVByaWNlID0gYmFzZVByaWNlID8gYmFzZVByaWNlIDogMDtcclxuICB2YXJUZXh0LnRleHRDb250ZW50ID0gdGV4dDtcclxuICBjaGVja21hcmsuYXBwZW5kQ2hpbGQoaW5wdXQpO1xyXG4gIGNoZWNrbWFyay5hcHBlbmRDaGlsZChtYXJrKTtcclxuICBjaGVja21hcmsuYXBwZW5kQ2hpbGQodmFyVGV4dCk7XHJcbiAgY2hlY2ttYXJrV3JhcHBlci5hcHBlbmRDaGlsZChjaGVja21hcmspO1xyXG5cclxuICByZXR1cm4gY2hlY2ttYXJrV3JhcHBlcjtcclxufVxyXG5cclxuZnVuY3Rpb24gY3JlYXRlRWxlbWVudCh0YWcsIGNsYXNzTmFtZSkge1xyXG4gIGxldCBlbGVtID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCh0YWcpO1xyXG4gIGVsZW0uY2xhc3NMaXN0ID0gY2xhc3NOYW1lO1xyXG5cclxuICByZXR1cm4gZWxlbTtcclxufVxyXG5cclxuZnVuY3Rpb24gc2V0QXR0cmlidXRlcyhlbCwgYXR0cnMpIHtcclxuICBmb3IodmFyIGtleSBpbiBhdHRycykge1xyXG4gICAgZWwuc2V0QXR0cmlidXRlKGtleSwgYXR0cnNba2V5XSk7XHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBjYXJkSGVhZGVySGFuZGxlKG1vZGFsU3dpcGVyLCB1cmwpIHtcclxuICBsZXQgdGFyZ2V0cyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy1tb2RhbC1pbml0LmpzLW1vZGFsLXNsaWRlcicpO1xyXG5cclxuICBpZiAoIHRhcmdldHMubGVuZ3RoICkge1xyXG4gICAgdGFyZ2V0cy5mb3JFYWNoKHRhcmdldCA9PiB7XHJcbiAgICAgIGxldCB0YXJnZXRJZCA9IHRhcmdldC5kYXRhc2V0LmlkO1xyXG4gICAgICB0YXJnZXQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbigpIHtcclxuICAgICAgICBnZXRTbGlkZXJzRGF0YShtb2RhbFN3aXBlciwgYCR7dXJsICsgdGFyZ2V0SWR9YCk7XHJcbiAgICAgIH0pO1xyXG4gICAgfSk7XHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRTbGlkZXJzRGF0YShtb2RhbFN3aXBlciwgdXJsKSB7XHJcbiAgbGV0IHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xyXG4gIHhoci5vcGVuKCdHRVQnLCB1cmwpO1xyXG4gIHhoci5zZW5kKCk7XHJcblxyXG4gIGlmICggIW1vZGFsU3dpcGVyICkge1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuXHJcbiAgeGhyLm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgaWYgKHhoci5zdGF0dXMgIT0gMjAwKSB7XHJcbiAgICAgIGNvbnNvbGUubG9nKGDQntGI0LjQsdC60LAgJHt4aHIuc3RhdHVzfTogJHt4aHIuc3RhdHVzVGV4dH1gKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGxldCBkYXRhID0gSlNPTi5wYXJzZSh4aHIucmVzcG9uc2UpO1xyXG4gICAgICBtb2RhbFN3aXBlci5yZW1vdmVBbGxTbGlkZXMoKTtcclxuXHJcbiAgICAgIGRhdGEuZm9yRWFjaChpdGVtID0+IHtcclxuICAgICAgICBsZXQgc2xpZGVDb250ZW50ID0gY3JlYXRlU2xpZGUoaXRlbSk7XHJcbiAgICAgICAgbW9kYWxTd2lwZXIuYXBwZW5kU2xpZGUoc2xpZGVDb250ZW50KTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICBtb2RhbFN3aXBlci51cGRhdGUoKTtcclxuICAgICAgfSwgMTAwKTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICB4aHIub25lcnJvciA9IGZ1bmN0aW9uKCkge1xyXG4gICAgY29uc29sZS5sb2coXCLQl9Cw0L/RgNC+0YEg0L3QtSDRg9C00LDQu9GB0Y9cIik7XHJcbiAgfTtcclxufVxyXG5cclxuZnVuY3Rpb24gY3JlYXRlU2xpZGUoc3RyKSB7XHJcbiAgbGV0IGltZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2ltZycpO1xyXG4gIGxldCBzbGlkZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gIHNsaWRlLmNsYXNzTGlzdC5hZGQoJ3N3aXBlci1zbGlkZScsICdtYWluLXNsaWRlcl9fc2xpZGUnKTtcclxuICBpbWcuc3JjID0gc3RyO1xyXG4gIHNsaWRlLmFwcGVuZENoaWxkKGltZyk7XHJcblxyXG4gIHJldHVybiBzbGlkZTtcclxufVxyXG5cclxuZnVuY3Rpb24gdmFsaWRhdGVGcm9tKCkge1xyXG4gIGxldCBmb3JtcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy1mb3JtLXZhbGlkYXRlJyk7XHJcblxyXG4gIGlmICggZm9ybXMubGVuZ3RoICkge1xyXG4gICAgZm9yIChjb25zdCBmb3JtIG9mIGZvcm1zKSB7XHJcbiAgICAgIGxldCBmaWVsZHMgPSBmb3JtLnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy1mb3JtLXZhbGlkYXRlLWlucHV0IGlucHV0Jyk7XHJcbiAgICAgIGxldCBmaWxlID0gZm9ybS5xdWVyeVNlbGVjdG9yKCcuanMtY2FsY3VsYXRlLWZpbGUtaW5wdXQnKTtcclxuICAgICAgbGV0IHZhbGlkRm9ybSA9IGZhbHNlO1xyXG5cclxuICAgICAgZm9yIChjb25zdCBmaWVsZCBvZiBmaWVsZHMpIHtcclxuICAgICAgICBmaWVsZC5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgIGlmICggIXZhbGlkYXRlRmllbGQoZmllbGQpICkge1xyXG4gICAgICAgICAgICBmaWVsZC5jbGFzc0xpc3QuYWRkKCdoYXMtZXJyb3InKTtcclxuICAgICAgICAgICAgdmFsaWRGb3JtID0gZmFsc2U7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBmaWVsZC5jbGFzc0xpc3QucmVtb3ZlKCdoYXMtZXJyb3InKTtcclxuICAgICAgICAgICAgdmFsaWRGb3JtID0gdHJ1ZTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG5cclxuICAgICAgZm9ybS5hZGRFdmVudExpc3RlbmVyKCdzdWJtaXQnLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cclxuICAgICAgICBmb3IgKGNvbnN0IGZpZWxkIG9mIGZpZWxkcykge1xyXG4gICAgICAgICAgaWYgKCAhdmFsaWRhdGVGaWVsZChmaWVsZCkgKSB7XHJcbiAgICAgICAgICAgIGZpZWxkLmNsYXNzTGlzdC5hZGQoJ2hhcy1lcnJvcicpO1xyXG4gICAgICAgICAgICB2YWxpZEZvcm0gPSBmYWxzZTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGZpZWxkLmNsYXNzTGlzdC5yZW1vdmUoJ2hhcy1lcnJvcicpO1xyXG4gICAgICAgICAgICB2YWxpZEZvcm0gPSB0cnVlO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCB2YWxpZEZvcm0gKSB7XHJcbiAgICAgICAgICBsZXQgZm9ybURhdGEgPSBuZXcgRm9ybURhdGEoZm9ybSk7XHJcblxyXG4gICAgICAgICAgaWYgKCBmaWxlICkge1xyXG4gICAgICAgICAgICBmb3JtRGF0YS5hcHBlbmQoJ2ZpbGUnLCBmaWxlLmZpbGVzWzBdKTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICBpZiAoIGZvcm0uY2xhc3NMaXN0LmNvbnRhaW5zKCdqcy1mb3JtLWNhbGMnKSApIHtcclxuICAgICAgICAgICAgZm9ybURhdGEuYXBwZW5kKCdkYXRhJywgd2luZG93LmNhbGNEYXRhKTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICBsZXQgc3VjY2VzcyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBmb3JtLmNsYXNzTGlzdC5hZGQoJ3N1Y2Nlc3MnKTtcclxuICAgICAgICAgICAgcmVzZXRGb3JtKGZvcm0sIGZvcm1EYXRhKTtcclxuICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgc2VuZERhdGEoZm9ybURhdGEsICcvc2VuZF9tZXNzYWdlJywgc3VjY2Vzcyk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGNvbnNvbGUubG9nKCd1bnZhbGlkIGZvcm0nKTtcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgIH0pXHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiByZXNldEZvcm0oZm9ybSwgZm9ybWRhdGEpIHtcclxuICBsZXQgYnRucyA9IGZvcm0ucXVlcnlTZWxlY3RvckFsbCgnLmpzLWZvcm0tY2FsYy1yZXNldCcpO1xyXG4gIGxldCBmaWxlUmVtb3ZlciA9IGZvcm0ucXVlcnlTZWxlY3RvcignLmpzLWNhbGN1bGF0ZS1maWxlLXJlbW92ZXInKTtcclxuXHJcbiAgaWYgKCBidG5zLmxlbmd0aCApIHtcclxuICAgIGZvciAoY29uc3QgYnRuIG9mIGJ0bnMpIHtcclxuICAgICAgYnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgZm9yICh2YXIgcGFpciBvZiBmb3JtZGF0YS5lbnRyaWVzKCkpIHtcclxuICAgICAgICAgIGZvcm1kYXRhLmRlbGV0ZShwYWlyWzBdKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZvcm0ucmVzZXQoKTtcclxuICAgICAgICBmb3JtLmNsYXNzTGlzdC5yZW1vdmUoJ3N1Y2Nlc3MnKTtcclxuXHJcbiAgICAgICAgaWYgKCBmaWxlUmVtb3ZlciApIHtcclxuICAgICAgICAgIGZpbGVSZW1vdmVyLmNsaWNrKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHZhbGlkYXRlRmllbGQoaW5wdXQpIHtcclxuICBsZXQgdmFsdWUgPSBpbnB1dC52YWx1ZTtcclxuICBsZXQgdHlwZSA9IGlucHV0LnR5cGU7XHJcbiAgbGV0IHJlc3VsdCA9IGZhbHNlO1xyXG5cclxuICBpZiAoIHR5cGUgPT0gJ3RlbCcgKSB7XHJcbiAgICByZXN1bHQgPSB2YWxpZGF0ZVBob25lKHZhbHVlKTtcclxuICB9IGVsc2UgaWYgKCB0eXBlID09ICdlbWFpbCcgKSB7XHJcbiAgICByZXN1bHQgPSB2YWxpZGF0ZU1haWwodmFsdWUpO1xyXG4gIH0gZWxzZSB7XHJcbiAgICByZXN1bHQgPSAhaXNFbXB0eSh2YWx1ZSk7XHJcbiAgfVxyXG5cclxuICByZXR1cm4gcmVzdWx0O1xyXG59XHJcblxyXG5mdW5jdGlvbiBpc0VtcHR5KHN0cikge1xyXG4gIHJldHVybiBzdHIgPT0gJycgJiYgdHJ1ZTtcclxufVxyXG5cclxuZnVuY3Rpb24gdmFsaWRhdGVQaG9uZShzdHIpIHtcclxuICBsZXQgcmVnID0gL15bXFwrXT9bKF0/WzAtOV17M31bKV0/Wy1cXHNcXC5dP1swLTldezN9Wy1cXHNcXC5dP1swLTldezQsNn0kL2ltO1xyXG4gIHJldHVybiB0ZXN0UmVnKHJlZywgcmVtb3ZlU3BhY2VzKHN0cikpO1xyXG59XHJcblxyXG5mdW5jdGlvbiB2YWxpZGF0ZU1haWwoc3RyKSB7XHJcbiAgbGV0IHJlc3VsdCA9IGZhbHNlO1xyXG4gIGNvbnN0IHJlZyA9IC9eKChbXjw+KClbXFxdXFxcXC4sOzpcXHNAXFxcIl0rKFxcLltePD4oKVtcXF1cXFxcLiw7Olxcc0BcXFwiXSspKil8KFxcXCIuK1xcXCIpKUAoKFxcW1swLTldezEsM31cXC5bMC05XXsxLDN9XFwuWzAtOV17MSwzfVxcLlswLTldezEsM31cXF0pfCgoW2EtekEtWlxcLTAtOV0rXFwuKStbYS16QS1aXXsyLH0pKSQvO1xyXG4gIHJlc3VsdCA9IHRlc3RSZWcocmVnLCBzdHIpXHJcbiAgcmV0dXJuIHJlc3VsdDtcclxufVxyXG5cclxuZnVuY3Rpb24gcmVtb3ZlU3BhY2VzKHN0cikge1xyXG4gIHJldHVybiBzdHIucmVwbGFjZSgvXFxzL2csICcnKTs7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHRlc3RSZWcocmUsIHN0cil7XHJcbiAgaWYgKHJlLnRlc3Qoc3RyKSkge1xyXG4gICAgcmV0dXJuIHRydWU7XHJcbiAgfSBlbHNlIHtcclxuICAgIHJldHVybiBmYWxzZTtcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHNlbmREYXRhKGRhdGEsIHVybCwgc3VjY2Vzcykge1xyXG4gIGlmICggIWRhdGEgfHwgIXVybCApIHtcclxuICAgIHJldHVybiBjb25zb2xlLmxvZygnZXJyb3IsIGhhdmUgbm8gZGF0YSBvciB1cmwnKTtcclxuICB9XHJcblxyXG4gIGxldCB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcclxuXHJcbiAgeGhyLm9ubG9hZGVuZCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgaWYgKHhoci5zdGF0dXMgPT0gMjAwKSB7XHJcbiAgICAgIGxldCBzdWNjZXNzRnUgPSBzdWNjZXNzO1xyXG5cclxuICAgICAgc3VjY2Vzc0Z1KCk7XHJcbiAgICAgIGNvbnNvbGUubG9nKFwi0KPRgdC/0LXRhVwiKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGNvbnNvbGUubG9nKFwi0J7RiNC40LHQutCwIFwiICsgdGhpcy5zdGF0dXMpO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIHhoci5vcGVuKFwiUE9TVFwiLCB1cmwpO1xyXG4gIHhoci5zZW5kKGRhdGEpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBpbml0TW9kYWwobW9kYWxTd2lwZXIpIHtcclxuICBsZXQgaW5pdHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuanMtbW9kYWwtaW5pdCcpO1xyXG4gIGxldCBib2R5ID0gZG9jdW1lbnQuYm9keTtcclxuXHJcbiAgaWYgKCBpbml0cy5sZW5ndGggKSB7XHJcbiAgICBmb3IgKGNvbnN0IGluaXQgb2YgaW5pdHMpIHtcclxuICAgICAgbGV0IHRhcmdldCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoaW5pdC5kYXRhc2V0LnRhcmdldCk7XHJcblxyXG4gICAgICBpZiAoIHRhcmdldCApIHtcclxuICAgICAgICBsZXQgY2xvc2VzID0gdGFyZ2V0LnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy1tb2RhbC1jbG9zZScpO1xyXG5cclxuICAgICAgICBpZiAoIGNsb3Nlcy5sZW5ndGggKSB7XHJcbiAgICAgICAgICBmb3IgKGNvbnN0IGNsb3NlIG9mIGNsb3Nlcykge1xyXG4gICAgICAgICAgICBjbG9zZS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgIHRhcmdldC5jbGFzc0xpc3QucmVtb3ZlKCdpcy1hY3RpdmUnKTtcclxuICAgICAgICAgICAgICBib2R5LmNsYXNzTGlzdC5yZW1vdmUoJ21vZGFsLWlzLWFjdGl2ZScpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGluaXQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgIHRhcmdldC5jbGFzc0xpc3QuYWRkKCdpcy1hY3RpdmUnKTtcclxuICAgICAgICAgIGJvZHkuY2xhc3NMaXN0LmFkZCgnbW9kYWwtaXMtYWN0aXZlJyk7XHJcblxyXG4gICAgICAgICAgaWYgKCB0YXJnZXQuZGF0YXNldC5zbGlkZXIgPT0gJ3RydWUnICYmIG1vZGFsU3dpcGVyICkge1xyXG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgICBtb2RhbFN3aXBlci51cGRhdGUoKTtcclxuICAgICAgICAgICAgfSwgMTAwKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gdmlkZVBsYXkoKSB7XHJcbiAgbGV0IG1vZGFsVmlkZW8gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmpzLW1vZGFsLXZpZGVvLWNvbnRhaW5lclwiKTtcclxuXHJcbiAgaWYgKCFtb2RhbFZpZGVvKSByZXR1cm47XHJcblxyXG4gIGxldCBwbGF5ID0gbW9kYWxWaWRlby5xdWVyeVNlbGVjdG9yKFwiLmpzLW1vZGFsLXZpZGVvLXBsYXlcIik7XHJcbiAgbGV0IHZpZGVvID0gbW9kYWxWaWRlby5xdWVyeVNlbGVjdG9yKFwiLmpzLW1vZGFsLXZpZGVvXCIpO1xyXG5cclxuICB2aWRlby5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24oKSB7XHJcbiAgICBpZiAodmlkZW8ucGF1c2VkKSB7XHJcbiAgICAgIHBsYXkuY2xhc3NMaXN0LmFkZChcImQtbm9uZVwiKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHBsYXkuY2xhc3NMaXN0LnJlbW92ZShcImQtbm9uZVwiKTtcclxuICAgIH1cclxuICB9KTtcclxufVxyXG5cclxuZnVuY3Rpb24gaW5pdERyYWdORHJvcCgpIHtcclxuICBsZXQgY29udGFpbmVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLWNhbGN1bGF0ZS1maWxlJyk7XHJcbiAgbGV0IGRyb3BBcmVhID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLWNhbGN1bGF0ZS1maWxlLWRyb3BhcmVhJyk7XHJcbiAgbGV0IGZpbGVFbGVtID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLWNhbGN1bGF0ZS1maWxlLWlucHV0Jyk7XHJcbiAgbGV0IGFkZGluZ3MgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtY2FsY3VsYXRlLWZpbGUtYWRkaW5ncycpO1xyXG4gIGxldCBmaWxlTmFtZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy1jYWxjdWxhdGUtZmlsZS1uYW1lJyk7XHJcbiAgbGV0IHJlbW92ZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtY2FsY3VsYXRlLWZpbGUtcmVtb3ZlcicpO1xyXG5cclxuICBpZiAoICFjb250YWluZXIgJiYgIWRyb3BBcmVhICYmICFmaWxlRWxlbSAmJiAhYWRkaW5ncyAmJiAhZmlsZU5hbWUgJiYgIXJlbW92ZXIgKSB7XHJcbiAgICByZXR1cm47XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBwcmV2ZW50RGVmYXVsdHMgKGUpIHtcclxuICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgfTtcclxuXHJcbiAgZnVuY3Rpb24gaGlnaGxpZ2h0KCkge1xyXG4gICAgY29udGFpbmVyLmNsYXNzTGlzdC5hZGQoJ2hpZ2hsaWdodCcpO1xyXG4gIH07XHJcblxyXG4gIGZ1bmN0aW9uIHVuaGlnaGxpZ2h0KCkge1xyXG4gICAgY29udGFpbmVyLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZ2hsaWdodCcpO1xyXG4gIH07XHJcblxyXG4gIGZ1bmN0aW9uIGhhbmRsZUZpbGVzKGZpbGVzKSB7XHJcbiAgICBhZGRpbmdzLmNsYXNzTGlzdC5hZGQoJ2lzLXNob3cnKTtcclxuICAgIGNvbnRhaW5lci5jbGFzc0xpc3QuYWRkKCdoYXMtcmVzdWx0Jyk7XHJcbiAgICBmaWxlTmFtZS50ZXh0Q29udGVudCA9IGZpbGVzWzBdLm5hbWU7XHJcbiAgfTtcclxuXHJcbiAgZnVuY3Rpb24gaGFuZGxlUmVtb3ZlRmlsZXMoKSB7XHJcbiAgICBhZGRpbmdzLmNsYXNzTGlzdC5yZW1vdmUoJ2lzLXNob3cnKTtcclxuICAgIGNvbnRhaW5lci5jbGFzc0xpc3QucmVtb3ZlKCdoYXMtcmVzdWx0Jyk7XHJcbiAgICBmaWxlTmFtZS50ZXh0Q29udGVudCA9ICcnO1xyXG4gICAgZmlsZUVsZW0udmFsdWUgPSAnJztcclxuICB9O1xyXG5cclxuICBmdW5jdGlvbiBoYW5kbGVEcm9wKGUpIHtcclxuICAgIGxldCBkdCA9IGUuZGF0YVRyYW5zZmVyO1xyXG4gICAgbGV0IGZpbGVzID0gZHQuZmlsZXM7XHJcblxyXG4gICAgaWYgKCBWYWxpZGF0ZSh0aGlzKSApIHtcclxuICAgICAgaGFuZGxlRmlsZXMoZmlsZXMpO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIGZpbGVFbGVtLmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIGZ1bmN0aW9uKCkge1xyXG4gICAgaWYgKCBWYWxpZGF0ZSh0aGlzKSApIHtcclxuICAgICAgaGFuZGxlRmlsZXModGhpcy5maWxlcyk7XHJcbiAgICB9XHJcbiAgfSk7XHJcblxyXG4gIHJlbW92ZXIuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbigpIHtcclxuICAgIGhhbmRsZVJlbW92ZUZpbGVzKCk7XHJcbiAgfSk7XHJcblxyXG4gIFsnZHJhZ2VudGVyJywgJ2RyYWdvdmVyJywgJ2RyYWdsZWF2ZScsICdkcm9wJ10uZm9yRWFjaChldmVudE5hbWUgPT4ge1xyXG4gICAgZHJvcEFyZWEuYWRkRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIHByZXZlbnREZWZhdWx0cywgZmFsc2UpO1xyXG4gIH0pO1xyXG5cclxuICBbJ2RyYWdlbnRlcicsICdkcmFnb3ZlciddLmZvckVhY2goZXZlbnROYW1lID0+IHtcclxuICAgIGRyb3BBcmVhLmFkZEV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCBoaWdobGlnaHQsIGZhbHNlKTtcclxuICB9KTtcclxuXHJcbiAgWydkcmFnbGVhdmUnLCAnZHJvcCddLmZvckVhY2goZXZlbnROYW1lID0+IHtcclxuICAgIGRyb3BBcmVhLmFkZEV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCB1bmhpZ2hsaWdodCwgZmFsc2UpO1xyXG4gIH0pO1xyXG5cclxuICBkcm9wQXJlYS5hZGRFdmVudExpc3RlbmVyKCdkcm9wJywgaGFuZGxlRHJvcCwgZmFsc2UpO1xyXG5cclxuICB2YXIgX3ZhbGlkRmlsZUV4dGVuc2lvbnMgPSBbJy56aXAnLCAnLnJhciddO1xyXG5cclxuICBmdW5jdGlvbiBWYWxpZGF0ZShpbnB1dCkge1xyXG4gICAgdmFyIHNGaWxlTmFtZSA9IGlucHV0LnZhbHVlO1xyXG5cclxuICAgIGlmIChzRmlsZU5hbWUubGVuZ3RoID4gMCkge1xyXG4gICAgICB2YXIgYmxuVmFsaWQgPSBmYWxzZTtcclxuICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBfdmFsaWRGaWxlRXh0ZW5zaW9ucy5sZW5ndGg7IGorKykge1xyXG4gICAgICAgIHZhciBzQ3VyRXh0ZW5zaW9uID0gX3ZhbGlkRmlsZUV4dGVuc2lvbnNbal07XHJcbiAgICAgICAgaWYgKHNGaWxlTmFtZS5zdWJzdHIoc0ZpbGVOYW1lLmxlbmd0aCAtIHNDdXJFeHRlbnNpb24ubGVuZ3RoLCBzQ3VyRXh0ZW5zaW9uLmxlbmd0aCkudG9Mb3dlckNhc2UoKSA9PSBzQ3VyRXh0ZW5zaW9uLnRvTG93ZXJDYXNlKCkpIHtcclxuICAgICAgICAgIGJsblZhbGlkID0gdHJ1ZTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKCFibG5WYWxpZCkge1xyXG4gICAgICAgIGNvbnRhaW5lci5jbGFzc0xpc3QuYWRkKCdoYXMtZXJyb3InKTtcclxuXHJcbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuICAgICAgICAgIGNvbnRhaW5lci5jbGFzc0xpc3QucmVtb3ZlKCdoYXMtZXJyb3InKTtcclxuICAgICAgICB9LCAyMDAwKVxyXG5cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGluaXRSYW5nZSgpIHtcclxuICB2YXIgc2xpZGVycyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy1yYW5nZScpO1xyXG5cclxuICBpZiAoIHNsaWRlcnMubGVuZ3RoICkge1xyXG4gICAgZm9yIChjb25zdCBzbGlkZXIgb2Ygc2xpZGVycykge1xyXG4gICAgICBsZXQgc2xpZGVyUmFuZ2U7XHJcbiAgICAgIGxldCBzbGlkZXJNaW4gPSBOdW1iZXIoc2xpZGVyLmRhdGFzZXQubWluKTtcclxuICAgICAgbGV0IHNsaWRlck1heCA9IE51bWJlcihzbGlkZXIuZGF0YXNldC5tYXgpO1xyXG4gICAgICBsZXQgc2xpZGVyU3RlcCA9IE51bWJlcihzbGlkZXIuZGF0YXNldC5zdGVwKTtcclxuICAgICAgbGV0IHNsaWRlclBpcHMgPSBOdW1iZXIoc2xpZGVyLmRhdGFzZXQucGlwcyk7XHJcbiAgICAgIGxldCBzbGlkZXJQcmVzZXQgPSBOdW1iZXIoc2xpZGVyLmRhdGFzZXQucHJlc2V0KTtcclxuXHJcbiAgICAgIGlmICggc2xpZGVyLmRhdGFzZXQuaW5kaXZpZHVhbCApIHtcclxuICAgICAgICBzbGlkZXJSYW5nZSA9IHtcclxuICAgICAgICAgICdtaW4nOiBbMV0sXHJcbiAgICAgICAgICAnMTAlJzogWzIsIDJdLFxyXG4gICAgICAgICAgJ21heCc6IFs4XVxyXG4gICAgICAgIH07XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgc2xpZGVyUmFuZ2UgPSB7XHJcbiAgICAgICAgICAnbWluJzogc2xpZGVyTWluLFxyXG4gICAgICAgICAgJ21heCc6IHNsaWRlck1heFxyXG4gICAgICAgIH07XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGxldCBwcmVzZXQgPSBzbGlkZXJQcmVzZXQgPyBzbGlkZXJQcmVzZXQgOiAwO1xyXG5cclxuICAgICAgbm9VaVNsaWRlci5jcmVhdGUoc2xpZGVyLCB7XHJcbiAgICAgICAgc3RhcnQ6IFtwcmVzZXRdLFxyXG4gICAgICAgIHN0ZXA6IHNsaWRlclN0ZXAsXHJcbiAgICAgICAgcmFuZ2U6IHNsaWRlclJhbmdlLFxyXG4gICAgICAgIGNvbm5lY3Q6ICdsb3dlcicsXHJcbiAgICAgICAgdG9vbHRpcHM6IHRydWUsXHJcbiAgICAgICAgZm9ybWF0OiB3TnVtYih7XHJcbiAgICAgICAgICBkZWNpbWFsczogMyxcclxuICAgICAgICAgIHRob3VzYW5kOiAnLicsXHJcbiAgICAgICAgfSksXHJcbiAgICAgICAgcGlwczoge1xyXG4gICAgICAgICAgbW9kZTogJ2NvdW50JyxcclxuICAgICAgICAgIHZhbHVlczogc2xpZGVyUGlwcyxcclxuICAgICAgICAgIHN0ZXBwZWQ6IGZhbHNlXHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIGxldCBtaW5pTWFya2VycyA9IHNsaWRlci5xdWVyeVNlbGVjdG9yQWxsKCcubm9VaS1tYXJrZXItaG9yaXpvbnRhbC5ub1VpLW1hcmtlcicpO1xyXG5cclxuICAgICAgaWYgKCBtaW5pTWFya2Vycy5sZW5ndGggKSB7XHJcbiAgICAgICAgZm9yICggY29uc3QgbWluaU1hcmtlciBvZiBtaW5pTWFya2VycyApIHtcclxuICAgICAgICAgIG1pbmlNYXJrZXIucmVtb3ZlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBpbml0SGVhZGVyVG9nZ2xlcigpIHtcclxuICBsZXQgdG9nZ2xlciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy1oZWFkZXItdG9nZ2xlcicpO1xyXG4gIGxldCBoZWFkZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtaGVhZGVyJyk7XHJcbiAgbGV0IHBhZ2VXcmFwID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLXBhZ2Utd3JhcCcpO1xyXG4gIGxldCBkYXJrbmVzcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy1oZWFkZXItZGFya25lc3MnKTtcclxuXHJcbiAgaWYgKCB0b2dnbGVyICYmIGhlYWRlciAmJiBwYWdlV3JhcCAmJiBkYXJrbmVzcyApIHtcclxuICAgIHRvZ2dsZXIuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbigpIHtcclxuICAgICAgaGVhZGVyLmNsYXNzTGlzdC50b2dnbGUoJ2lzLW9wZW4nKTtcclxuICAgICAgdG9nZ2xlci5jbGFzc0xpc3QudG9nZ2xlKCdpcy1hY3RpdmUnKTtcclxuICAgICAgcGFnZVdyYXAuY2xhc3NMaXN0LnRvZ2dsZSgnc2Nyb2xsLWJsb2NrZWQtbW9iaWxlJyk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBkYXJrbmVzcy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKCkge1xyXG4gICAgICBoZWFkZXIuY2xhc3NMaXN0LnJlbW92ZSgnaXMtb3BlbicpO1xyXG4gICAgICB0b2dnbGVyLmNsYXNzTGlzdC5yZW1vdmUoJ2lzLWFjdGl2ZScpO1xyXG4gICAgICBwYWdlV3JhcC5jbGFzc0xpc3QucmVtb3ZlKCdzY3JvbGwtYmxvY2tlZC1tb2JpbGUnKTtcclxuICAgIH0pO1xyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gaW5pdEFsYnVtc0NhcmRTbGlkZXIoKSB7XHJcbiAgdmFyIG15U3dpcGVyID0gbmV3IFN3aXBlcignLmpzLWFsYnVtcy1jYXJkLXNsaWRlcicsIHtcclxuICAgIHNwZWVkOiA0MDAsXHJcbiAgICBzbGlkZXNQZXJWaWV3OiAxLFxyXG4gICAgbmF2aWdhdGlvbjoge1xyXG4gICAgICBuZXh0RWw6ICcuc3dpcGVyLWJ1dHRvbi1uZXh0JyxcclxuICAgICAgcHJldkVsOiAnLnN3aXBlci1idXR0b24tcHJldicsXHJcbiAgICB9LFxyXG4gIH0pO1xyXG5cclxuICByZXR1cm4gbXlTd2lwZXI7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGluaXRBbGJ1bVNsaWRlcigpIHtcclxuICB2YXIgbXlTd2lwZXIgPSBuZXcgU3dpcGVyKCcuanMtc3dpcGVyLWFsYnVtJywge1xyXG4gICAgc3BlZWQ6IDQwMCxcclxuICAgIHNsaWRlc1BlclZpZXc6IDEsXHJcbiAgICBsb29wOiBmYWxzZSxcclxuICAgIC8vIHByZWxvYWRJbWFnZXM6IGZhbHNlLFxyXG4gICAgc3BhY2VCZXR3ZWVuOiAxMixcclxuICAgIGF1dG9IZWlnaHQ6IHRydWUsXHJcbiAgICAvLyBsYXp5OiB0cnVlLFxyXG4gICAgbmF2aWdhdGlvbjoge1xyXG4gICAgICBuZXh0RWw6ICcuanMtc3dpcGVyLWFsYnVtLW5leHQnLFxyXG4gICAgICBwcmV2RWw6ICcuanMtc3dpcGVyLWFsYnVtLXByZXYnLFxyXG4gICAgfSxcclxuICB9KTtcclxuXHJcbiAgcmV0dXJuIG15U3dpcGVyO1xyXG59XHJcblxyXG5mdW5jdGlvbiBpbml0U3dpcGVyKCkge1xyXG4gIGxldCB0YXJnZXRzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmpzLXN3aXBlci1jb250YWluZXInKTtcclxuXHJcbiAgaWYgKCAhdGFyZ2V0cy5sZW5ndGggKSB7XHJcbiAgICByZXR1cm47XHJcbiAgfVxyXG5cclxuICBsZXQgc3dpcGVycyA9IFtdO1xyXG5cclxuICB0YXJnZXRzLmZvckVhY2goICh0YXJnZXQsIGluZGV4KSA9PiB7XHJcbiAgICBpZiAoIGluZGV4ID09IDAgfHwgIXRhcmdldC5jbGFzc0xpc3QuY29udGFpbnMoJ3N3aXBlci1jb250YWluZXItZmF0JykgKSB7XHJcbiAgICAgIHZhciBteVN3aXBlciA9IG5ldyBTd2lwZXIodGFyZ2V0LCB7XHJcbiAgICAgICAgc3BlZWQ6IDQwMCxcclxuICAgICAgICBzbGlkZXNQZXJWaWV3OiA2LFxyXG4gICAgICAgIHNwYWNlQmV0d2VlbjogMzAsXHJcbiAgICAgICAgbG9vcDogZmFsc2UsXHJcbiAgICAgICAgcHJlbG9hZEltYWdlczogZmFsc2UsXHJcbiAgICAgICAgbGF6eTogdHJ1ZSxcclxuICAgICAgICBuYXZpZ2F0aW9uOiB7XHJcbiAgICAgICAgICBuZXh0RWw6ICcuc3dpcGVyLWJ1dHRvbi1uZXh0JyxcclxuICAgICAgICAgIHByZXZFbDogJy5zd2lwZXItYnV0dG9uLXByZXYnLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgYnJlYWtwb2ludHM6IHtcclxuICAgICAgICAgIDQ1OToge1xyXG4gICAgICAgICAgICBzbGlkZXNQZXJWaWV3OiAxLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIDU5OToge1xyXG4gICAgICAgICAgICBzbGlkZXNQZXJWaWV3OiAyLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIDc2Nzoge1xyXG4gICAgICAgICAgICBzbGlkZXNQZXJWaWV3OiAzLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIDExOTk6IHtcclxuICAgICAgICAgICAgc2xpZGVzUGVyVmlldzogNCxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHZhciBteVN3aXBlciA9IG5ldyBTd2lwZXIodGFyZ2V0LCB7XHJcbiAgICAgICAgc3BlZWQ6IDQwMCxcclxuICAgICAgICBzbGlkZXNQZXJWaWV3OiA0LFxyXG4gICAgICAgIHNwYWNlQmV0d2VlbjogMzAsXHJcbiAgICAgICAgbG9vcDogZmFsc2UsXHJcbiAgICAgICAgcHJlbG9hZEltYWdlczogZmFsc2UsXHJcbiAgICAgICAgbGF6eTogdHJ1ZSxcclxuICAgICAgICBuYXZpZ2F0aW9uOiB7XHJcbiAgICAgICAgICBuZXh0RWw6ICcuc3dpcGVyLWJ1dHRvbi1uZXh0JyxcclxuICAgICAgICAgIHByZXZFbDogJy5zd2lwZXItYnV0dG9uLXByZXYnLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgYnJlYWtwb2ludHM6IHtcclxuICAgICAgICAgIDc2Nzoge1xyXG4gICAgICAgICAgICBzbGlkZXNQZXJWaWV3OiAxLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIDExOTk6IHtcclxuICAgICAgICAgICAgc2xpZGVzUGVyVmlldzogMixcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBzd2lwZXJzLnB1c2gobXlTd2lwZXIpO1xyXG4gIH0pO1xyXG5cclxuICByZXR1cm4gc3dpcGVycztcclxufVxyXG5cclxuZnVuY3Rpb24gaW5pdFN3aXBlclN0YXRpY2soKSB7XHJcbiAgdmFyIG15U3dpcGVyID0gbmV3IFN3aXBlcignLmpzLXN3aXBlci1jb250YWluZXItc3RhdGljJywge1xyXG4gICAgc3BlZWQ6IDQwMCxcclxuICAgIHNsaWRlc1BlclZpZXc6IDYsXHJcbiAgICBzcGFjZUJldHdlZW46IDQwLFxyXG4gICAgbG9vcDogZmFsc2UsXHJcbiAgICBwcmVsb2FkSW1hZ2VzOiBmYWxzZSxcclxuICAgIGxhenk6IHRydWUsXHJcbiAgICBuYXZpZ2F0aW9uOiB7XHJcbiAgICAgIG5leHRFbDogJy5qcy1zd2lwZXItY29udGFpbmVyLXN0YXRpYy1uZXh0JyxcclxuICAgICAgcHJldkVsOiAnLmpzLXN3aXBlci1jb250YWluZXItc3RhdGljLXByZXYnLFxyXG4gICAgfSxcclxuICAgIGZvbGxvd0ZpbmdlcjogZmFsc2UsXHJcbiAgICBicmVha3BvaW50czoge1xyXG4gICAgICA0NTk6IHtcclxuICAgICAgICBzbGlkZXNQZXJWaWV3OiAxLFxyXG4gICAgICB9LFxyXG4gICAgICA1OTk6IHtcclxuICAgICAgICBzbGlkZXNQZXJWaWV3OiAyLFxyXG4gICAgICB9LFxyXG4gICAgICA3Njc6IHtcclxuICAgICAgICBzbGlkZXNQZXJWaWV3OiAzLFxyXG4gICAgICB9LFxyXG4gICAgICAxMTk5OiB7XHJcbiAgICAgICAgc2xpZGVzUGVyVmlldzogNCxcclxuICAgICAgfSxcclxuICAgIH1cclxuICB9KTtcclxuXHJcbiAgaWYgKCBteVN3aXBlci5zbGlkZXMgJiYgbXlTd2lwZXIuc2xpZGVzLmxlbmd0aCApIHtcclxuICAgIGxldCBjdXJyZW50QWN0aXZlSW5kZXg7XHJcblxyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBteVN3aXBlci5zbGlkZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgbGV0IGl0ZW0gPSBteVN3aXBlci5zbGlkZXNbaV07XHJcbiAgICAgIGxldCBjdXJyZW50QWN0aXZlID0gaXRlbS5xdWVyeVNlbGVjdG9yKCcuYWxidW0tcHJldmlldy5pcy1hY3RpdmUnKTtcclxuXHJcbiAgICAgIGlmICggY3VycmVudEFjdGl2ZSApIHtcclxuICAgICAgICBjdXJyZW50QWN0aXZlSW5kZXggPSBpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCBjdXJyZW50QWN0aXZlSW5kZXggKSB7XHJcbiAgICAgIG15U3dpcGVyLnNsaWRlVG8oY3VycmVudEFjdGl2ZUluZGV4KTtcclxuICAgIH1cclxuICB9XHJcblxyXG5cclxuICByZXR1cm4gbXlTd2lwZXI7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGluaXRNYWluU3dpcGVyKCkge1xyXG4gIHZhciBteVN3aXBlciA9IG5ldyBTd2lwZXIoJy5qcy1tYWluLXN3aXBlci1jb250YWluZXInLCB7XHJcbiAgICBzcGVlZDogNDAwLFxyXG4gICAgc2xpZGVzUGVyVmlldzogMSxcclxuICAgIGxvb3A6IHRydWUsXHJcbiAgICBzcGFjZUJldHdlZW46IDEyLFxyXG4gICAgYXV0b0hlaWdodDogdHJ1ZSxcclxuICAgIHBhZ2luYXRpb246IHtcclxuICAgICAgZWw6ICcuc3dpcGVyLXBhZ2luYXRpb24nLFxyXG4gICAgICB0eXBlOiAnYnVsbGV0cycsXHJcbiAgICAgIGNsaWNrYWJsZTogdHJ1ZVxyXG4gICAgfSxcclxuICAgIG5hdmlnYXRpb246IHtcclxuICAgICAgbmV4dEVsOiAnLmpzLXN3aXBlci1tYWluLW5leHQnLFxyXG4gICAgICBwcmV2RWw6ICcuanMtc3dpcGVyLW1haW4tcHJldicsXHJcbiAgICB9LFxyXG4gIH0pO1xyXG5cclxuICByZXR1cm4gbXlTd2lwZXI7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGluaXRNb2RhbFN3aXBlcigpIHtcclxuICB2YXIgbXlTd2lwZXIgPSBuZXcgU3dpcGVyKCcuanMtbWFpbi1zd2lwZXItbW9kYWwnLCB7XHJcbiAgICBzcGVlZDogNDAwLFxyXG4gICAgc2xpZGVzUGVyVmlldzogMSxcclxuICAgIGxvb3A6IHRydWUsXHJcbiAgICBzcGFjZUJldHdlZW46IDEyLFxyXG4gICAgcHJlbG9hZEltYWdlczogZmFsc2UsXHJcbiAgICBsYXp5OiB0cnVlLFxyXG4gICAgYXV0b0hlaWdodDogdHJ1ZSxcclxuICAgIHBhZ2luYXRpb246IHtcclxuICAgICAgZWw6ICcuc3dpcGVyLXBhZ2luYXRpb24nLFxyXG4gICAgICB0eXBlOiAnYnVsbGV0cycsXHJcbiAgICAgIGNsaWNrYWJsZTogdHJ1ZVxyXG4gICAgfSxcclxuICAgIG5hdmlnYXRpb246IHtcclxuICAgICAgbmV4dEVsOiAnLmpzLW1vZGFsLXN3aXBlci1uZXh0JyxcclxuICAgICAgcHJldkVsOiAnLmpzLW1vZGFsLXN3aXBlci1wcmV2JyxcclxuICAgIH0sXHJcbiAgfSk7XHJcblxyXG4gIHJldHVybiBteVN3aXBlcjtcclxufVxyXG5cclxuZnVuY3Rpb24gaW5pdEFsYnVtc1R5cGVTbGlkZXIoKSB7XHJcbiAgdmFyIG15U3dpcGVyID0gbmV3IFN3aXBlcignLmpzLXR5cGUtYWxidW1zLXN3aXBlcicsIHtcclxuICAgIHNwZWVkOiA0MDAsXHJcbiAgICBzbGlkZXNQZXJWaWV3OiAnYXV0bycsXHJcbiAgICBzbGlkZXNPZmZzZXRBZnRlcjogMTAwLFxyXG4gICAgc3BhY2VCZXR3ZWVuOiAyNCxcclxuICAgIG5hdmlnYXRpb246IHtcclxuICAgICAgbmV4dEVsOiAnLnN3aXBlci1idXR0b24tbmV4dCcsXHJcbiAgICAgIHByZXZFbDogJy5zd2lwZXItYnV0dG9uLXByZXYnLFxyXG4gICAgfSxcclxuICAgIG9uOiB7XHJcbiAgICAgIHNsaWRlQ2hhbmdlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgaWYgKCB0aGlzLmFjdGl2ZUluZGV4ID4gMCApIHtcclxuICAgICAgICAgIHRoaXMuZWwuY2xhc3NMaXN0LmFkZCgnbm90LW9uLXN0YXJ0Jyk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHRoaXMuZWwuY2xhc3NMaXN0LnJlbW92ZSgnbm90LW9uLXN0YXJ0Jyk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICB9KTtcclxuXHJcbiAgcmV0dXJuIG15U3dpcGVyO1xyXG59XHJcblxyXG5mdW5jdGlvbiBpbml0TWFpbkNhcmRzU2xpZGVyKCkge1xyXG4gIHZhciBteVN3aXBlciA9IG5ldyBTd2lwZXIoJy5qcy1tYWluLWNhcmQtc2xpZGVyJywge1xyXG4gICAgc3BlZWQ6IDQwMCxcclxuICAgIHNsaWRlc1BlclZpZXc6IDEsXHJcbiAgICBsb29wOiB0cnVlLFxyXG4gICAgc3BhY2VCZXR3ZWVuOiAxMixcclxuICAgIG5hdmlnYXRpb246IHtcclxuICAgICAgbmV4dEVsOiAnLnN3aXBlci1idXR0b24tbmV4dCcsXHJcbiAgICAgIHByZXZFbDogJy5zd2lwZXItYnV0dG9uLXByZXYnLFxyXG4gICAgfSxcclxuICB9KTtcclxuXHJcbiAgcmV0dXJuIG15U3dpcGVyO1xyXG59XHJcblxyXG5mdW5jdGlvbiB0YWIodGFiSGFuZGxlcikge1xyXG4gIGxldCB0YWJzQ29udGFpbmVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5qcy10YWItY29udGFpbmVyXCIpO1xyXG5cclxuICBpZiAoIHRhYnNDb250YWluZXIgKSB7XHJcbiAgICBsZXQgbWVudUl0ZW1zID0gdGFic0NvbnRhaW5lci5xdWVyeVNlbGVjdG9yQWxsKFwiLmpzLXRhYi1tZW51LWl0ZW1cIik7XHJcblxyXG4gICAgbWVudUl0ZW1zLmZvckVhY2goIChtZW51SXRlbSkgPT4ge1xyXG5cclxuICAgICAgbWVudUl0ZW0ub25jbGljayA9ICgpID0+IHtcclxuICAgICAgICBsZXQgYWN0aXZlTWVudUl0ZW0gPSBBcnJheS5mcm9tKG1lbnVJdGVtcykuZmluZChnZXRBY3RpdmVUYWIpO1xyXG4gICAgICAgIGxldCBhY3RpdmVDb250ZW50SXRlbSA9IHRhYnNDb250YWluZXIucXVlcnlTZWxlY3RvcihhY3RpdmVNZW51SXRlbS5kYXRhc2V0LnRhcmdldCk7XHJcbiAgICAgICAgbGV0IGN1cnJlbnRDb250ZW50SXRlbSA9IHRhYnNDb250YWluZXIucXVlcnlTZWxlY3RvcihtZW51SXRlbS5kYXRhc2V0LnRhcmdldCk7XHJcblxyXG4gICAgICAgIGFjdGl2ZU1lbnVJdGVtLmNsYXNzTGlzdC5yZW1vdmUoXCJpcy1hY3RpdmVcIik7XHJcblxyXG4gICAgICAgIGlmICggYWN0aXZlQ29udGVudEl0ZW0gKSB7XHJcbiAgICAgICAgICBhY3RpdmVDb250ZW50SXRlbS5jbGFzc0xpc3QucmVtb3ZlKFwiaXMtYWN0aXZlXCIpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCBjdXJyZW50Q29udGVudEl0ZW0gKSB7XHJcbiAgICAgICAgICBjdXJyZW50Q29udGVudEl0ZW0uY2xhc3NMaXN0LmFkZChcImlzLWFjdGl2ZVwiKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIG1lbnVJdGVtLmNsYXNzTGlzdC5hZGQoXCJpcy1hY3RpdmVcIik7XHJcblxyXG4gICAgICAgIGlmICggdGFiSGFuZGxlciApIHtcclxuICAgICAgICAgIGRvY3VtZW50LmRpc3BhdGNoRXZlbnQodGFiSGFuZGxlcik7XHJcbiAgICAgICAgfVxyXG4gICAgICB9O1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBnZXRBY3RpdmVUYWIoZWxlbWVudCkge1xyXG4gICAgcmV0dXJuIGVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKFwiaXMtYWN0aXZlXCIpO1xyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gYWNjb3JkaW9uKCkge1xyXG4gIGxldCB3cmFwcGVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmpzLWFjY29yZGlvbicpO1xyXG4gIHdyYXBwZXIuZm9yRWFjaCh3cmFwcGVySXRlbSA9PiB7XHJcbiAgICBsZXQgaXRlbXMgPSB3cmFwcGVySXRlbS5xdWVyeVNlbGVjdG9yQWxsKCcuanMtYWNjb3JkaW9uLWl0ZW0nKTtcclxuICAgIGxldCBpbmRpdmlkdWFsID0gd3JhcHBlckl0ZW0uZ2V0QXR0cmlidXRlKCdpbmRpdmlkdWFsJykgJiYgd3JhcHBlckl0ZW0uZ2V0QXR0cmlidXRlKCdpbmRpdmlkdWFsJykgIT09ICdmYWxzZSc7XHJcblxyXG4gICAgaXRlbXMuZm9yRWFjaChpdGVtID0+IHtcclxuICAgICAgaWYgKCBpdGVtLmNsYXNzTGlzdC5jb250YWlucygnaXMtYWN0aXZlJykgKSB7XHJcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICBsZXQgcmVhZHlDb250ZW50ID0gaXRlbS5xdWVyeVNlbGVjdG9yKCcuanMtYWNjb3JkaW9uLWNvbnRlbnQnKTtcclxuICAgICAgICAgIGxldCByZWFkeUNvbnRlbnRIZWlnaHQgPSByZWFkeUNvbnRlbnQuc2Nyb2xsSGVpZ2h0O1xyXG5cclxuICAgICAgICAgIHJlYWR5Q29udGVudC5zdHlsZS5tYXhIZWlnaHQgPSByZWFkeUNvbnRlbnRIZWlnaHQgKyAncHgnO1xyXG4gICAgICAgIH0sIDEwMCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGxldCBzdWJJdGVtcyA9IGl0ZW0ucXVlcnlTZWxlY3RvckFsbCgnLmpzLWFjY29yZGlvbi1zdWJpdGVtJyk7XHJcblxyXG4gICAgICBmb3IgKGNvbnN0IHN1Ykl0ZW0gb2Ygc3ViSXRlbXMpIHtcclxuICAgICAgICBpZiAoIHN1Ykl0ZW0uY2xhc3NMaXN0LmNvbnRhaW5zKCdpcy1hY3RpdmUnKSApIHtcclxuICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICBsZXQgcmVhZHlDb250ZW50ID0gc3ViSXRlbS5xdWVyeVNlbGVjdG9yKCcuanMtYWNjb3JkaW9uLWNvbnRlbnQnKTtcclxuICAgICAgICAgICAgbGV0IHJlYWR5Q29udGVudEhlaWdodCA9IHJlYWR5Q29udGVudC5zY3JvbGxIZWlnaHQ7XHJcblxyXG4gICAgICAgICAgICByZWFkeUNvbnRlbnQuc3R5bGUubWF4SGVpZ2h0ID0gcmVhZHlDb250ZW50SGVpZ2h0ICsgJ3B4JztcclxuICAgICAgICAgIH0sIDEwMCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICBpdGVtSXRlcmF0aW9uKGl0ZW0sIGl0ZW1zLCBpbmRpdmlkdWFsKTtcclxuXHJcbiAgICAgIHN1Ykl0ZW1zLmZvckVhY2goc3ViaXRlbSA9PiB7XHJcbiAgICAgICAgaXRlbUl0ZXJhdGlvbihzdWJpdGVtLCBzdWJJdGVtcywgaW5kaXZpZHVhbCwgdHJ1ZSlcclxuICAgICAgfSk7XHJcbiAgICB9KVxyXG4gIH0pXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGl0ZW1JdGVyYXRpb24oaXRlbSwgaXRlbXMsIGluZGl2aWR1YWwsIGlzU3ViaXRlbSkge1xyXG4gIGxldCBpbml0ID0gaXRlbS5xdWVyeVNlbGVjdG9yKCcuanMtYWNjb3JkaW9uLWluaXQnKTtcclxuICBsZXQgY29udGVudCA9IGl0ZW0ucXVlcnlTZWxlY3RvcignLmpzLWFjY29yZGlvbi1jb250ZW50Jyk7XHJcblxyXG4gIGlmICggaXNTdWJpdGVtID09PSB0cnVlICkge1xyXG4gICAgY29udGVudC5hZGRFdmVudExpc3RlbmVyKCd0cmFuc2l0aW9uZW5kJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgIGxldCBwYXJlbnRJdGVtID0gaXRlbS5jbG9zZXN0KCcuanMtYWNjb3JkaW9uLWl0ZW0nKTtcclxuICAgICAgbGV0IHBhcmVudENvbnRlbnRIZWlnaHQgPSBwYXJlbnRJdGVtLnNjcm9sbEhlaWdodCArICdweCc7XHJcbiAgICAgIGxldCBwYXJlbnRDb250ZW50ID0gcGFyZW50SXRlbS5xdWVyeVNlbGVjdG9yKCcuanMtYWNjb3JkaW9uLWNvbnRlbnQnKTtcclxuXHJcbiAgICAgIHBhcmVudENvbnRlbnQuc2V0QXR0cmlidXRlKCdzdHlsZScsIGBtYXgtaGVpZ2h0OiAke3BhcmVudENvbnRlbnRIZWlnaHR9YCk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIGluaXQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbigpIHtcclxuICAgIGlmICggaXRlbS5jbGFzc0xpc3QuY29udGFpbnMoJ2lzLWFjdGl2ZScpICkge1xyXG4gICAgICBpdGVtLmNsYXNzTGlzdC5yZW1vdmUoJ2lzLWFjdGl2ZScpO1xyXG4gICAgICBjb250ZW50LnN0eWxlLm1heEhlaWdodCA9ICcwcHgnO1xyXG5cclxuICAgICAgcmV0dXJuIGZhbHNlXHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCBpc1N1Yml0ZW0gPT09IHRydWUgKSB7XHJcbiAgICAgIGxldCBwYXJlbnRJdGVtID0gaXRlbS5jbG9zZXN0KCcuanMtYWNjb3JkaW9uLWl0ZW0nKTtcclxuICAgICAgbGV0IHBhcmVudENvbnRlbnQgPSBwYXJlbnRJdGVtLnF1ZXJ5U2VsZWN0b3IoJy5qcy1hY2NvcmRpb24tY29udGVudCcpO1xyXG5cclxuICAgICAgcGFyZW50Q29udGVudC5zZXRBdHRyaWJ1dGUoJ3N0eWxlJywgYG1heC1oZWlnaHQ6IG5vbmVgKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIGluZGl2aWR1YWwgKSB7XHJcbiAgICAgIGl0ZW1zLmZvckVhY2goKGVsZW0pID0+IHtcclxuICAgICAgICBsZXQgZWxlbUNvbnRlbnQgPSBlbGVtLnF1ZXJ5U2VsZWN0b3IoJy5qcy1hY2NvcmRpb24tY29udGVudCcpO1xyXG4gICAgICAgIGVsZW0uY2xhc3NMaXN0LnJlbW92ZSgnaXMtYWN0aXZlJyk7XHJcbiAgICAgICAgZWxlbUNvbnRlbnQuc3R5bGUubWF4SGVpZ2h0ID0gMCArICdweCc7XHJcbiAgICAgIH0pXHJcbiAgICB9XHJcblxyXG4gICAgaXRlbS5jbGFzc0xpc3QuYWRkKCdpcy1hY3RpdmUnKTtcclxuICAgIGNvbnRlbnQuc3R5bGUubWF4SGVpZ2h0ID0gY29udGVudC5zY3JvbGxIZWlnaHQgKyAncHgnO1xyXG4gIH0pO1xyXG59XHJcbiJdfQ==
