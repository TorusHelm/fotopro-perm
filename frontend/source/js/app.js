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