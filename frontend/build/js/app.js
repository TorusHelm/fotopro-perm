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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG5cbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBmdW5jdGlvbigpIHtcbiAgbGV0IHRhYkhhbmRsZXIgPSBuZXcgRXZlbnQoJ3RhYkhhbmRsZXInKTtcbiAgbGV0IG1vZGFsU3dpcGVyID0gaW5pdE1vZGFsU3dpcGVyKCk7XG4gIGxldCBzd2lwZXJzID0gaW5pdFN3aXBlcigpO1xuICBzdmc0ZXZlcnlib2R5KCk7XG4gIGluaXRNYWluU3dpcGVyKCk7XG4gIGluaXRIZWFkZXJUb2dnbGVyKCk7XG4gIGluaXRBbGJ1bXNDYXJkU2xpZGVyKCk7XG4gIGFjY29yZGlvbigpO1xuICBpbml0QWxidW1zVHlwZVNsaWRlcigpO1xuICBpbml0U3dpcGVyU3RhdGljaygpO1xuICBpbml0QWxidW1TbGlkZXIoKTtcbiAgdGFiKHRhYkhhbmRsZXIpO1xuICBpbml0UmFuZ2UoKTtcbiAgaW5pdERyYWdORHJvcCgpO1xuICBpbml0TW9kYWwobW9kYWxTd2lwZXIpO1xuICB2YWxpZGF0ZUZyb20oKTtcbiAgY2FyZEhlYWRlckhhbmRsZShtb2RhbFN3aXBlciwgJ2h0dHA6Ly9mMzYzNTA5NzU4MTcubmdyb2suaW8vYXBpL2FsYnVtL2ltYWdlc19zbGlkZXI/aWQ9Jyk7XG5cbiAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigndGFiSGFuZGxlcicsIGZ1bmN0aW9uKCkge1xuICAgIGlmICggIXN3aXBlcnMubGVuZ3RoICkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHN3aXBlcnMuZm9yRWFjaChzd2lwZXIgPT4ge1xuICAgICAgc3dpcGVyLnVwZGF0ZSgpO1xuICAgIH0pO1xuXG4gIH0sIGZhbHNlKTtcblxuICBpZiAoIHdpbmRvdy5pbm5lcldpZHRoIDwgNzY4ICkge1xuICAgIGluaXRNYWluQ2FyZHNTbGlkZXIoKTtcbiAgfVxufSk7XG5cbmZ1bmN0aW9uIGNhcmRIZWFkZXJIYW5kbGUobW9kYWxTd2lwZXIsIHVybCkge1xuICBsZXQgdGFyZ2V0cyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy1tb2RhbC1pbml0Jyk7XG5cbiAgaWYgKCB0YXJnZXRzLmxlbmd0aCApIHtcbiAgICB0YXJnZXRzLmZvckVhY2godGFyZ2V0ID0+IHtcbiAgICAgIGxldCB0YXJnZXRJZCA9IHRhcmdldC5kYXRhc2V0LmlkO1xuICAgICAgdGFyZ2V0LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oKSB7XG4gICAgICAgIGdldFNsaWRlcnNEYXRhKG1vZGFsU3dpcGVyLCBgJHt1cmwgKyB0YXJnZXRJZH1gKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG59XG5cbmZ1bmN0aW9uIGdldFNsaWRlcnNEYXRhKGNvbnRhaW5lciwgdXJsKSB7XG4gIGxldCB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcbiAgeGhyLm9wZW4oJ0dFVCcsIHVybCk7XG4gIHhoci5zZW5kKCk7XG5cbiAgaWYgKCAhY29udGFpbmVyICkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHhoci5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAoeGhyLnN0YXR1cyAhPSAyMDApIHtcbiAgICAgIGNvbnNvbGUubG9nKGDQntGI0LjQsdC60LAgJHt4aHIuc3RhdHVzfTogJHt4aHIuc3RhdHVzVGV4dH1gKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbGV0IGRhdGEgPSBKU09OLnBhcnNlKHhoci5yZXNwb25zZSk7XG4gICAgICBjb250YWluZXIucmVtb3ZlQWxsU2xpZGVzKCk7XG5cbiAgICAgIGRhdGEuZm9yRWFjaChpdGVtID0+IHtcbiAgICAgICAgbGV0IHNsaWRlQ29udGVudCA9IGNyZWF0ZVNsaWRlKGl0ZW0pO1xuICAgICAgICBjb250YWluZXIuYXBwZW5kU2xpZGUoc2xpZGVDb250ZW50KTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcblxuICB4aHIub25lcnJvciA9IGZ1bmN0aW9uKCkge1xuICAgIGNvbnNvbGUubG9nKFwi0JfQsNC/0YDQvtGBINC90LUg0YPQtNCw0LvRgdGPXCIpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBjcmVhdGVTbGlkZShzdHIpIHtcbiAgbGV0IGltZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2ltZycpO1xuICBsZXQgc2xpZGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgc2xpZGUuY2xhc3NMaXN0LmFkZCgnc3dpcGVyLXNsaWRlJywgJ21haW4tc2xpZGVyX19zbGlkZScpO1xuICBpbWcuc3JjID0gJ2h0dHA6Ly9mMzYzNTA5NzU4MTcubmdyb2suaW8nICsgc3RyO1xuICBzbGlkZS5hcHBlbmRDaGlsZChpbWcpO1xuXG4gIHJldHVybiBzbGlkZTtcbn1cblxuZnVuY3Rpb24gdmFsaWRhdGVGcm9tKCkge1xuICBsZXQgZm9ybXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuanMtZm9ybS12YWxpZGF0ZScpO1xuXG4gIGlmICggZm9ybXMubGVuZ3RoICkge1xuICAgIGZvciAoY29uc3QgZm9ybSBvZiBmb3Jtcykge1xuICAgICAgbGV0IGZpZWxkcyA9IGZvcm0ucXVlcnlTZWxlY3RvckFsbCgnLmpzLWZvcm0tdmFsaWRhdGUtaW5wdXQgaW5wdXQnKTtcbiAgICAgIGxldCBmaWxlID0gZm9ybS5xdWVyeVNlbGVjdG9yKCcuanMtY2FsY3VsYXRlLWZpbGUtaW5wdXQnKTtcbiAgICAgIGxldCB2YWxpZEZvcm0gPSBmYWxzZTtcblxuICAgICAgZm9yIChjb25zdCBmaWVsZCBvZiBmaWVsZHMpIHtcbiAgICAgICAgZmllbGQuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgaWYgKCAhdmFsaWRhdGVGaWVsZChmaWVsZCkgKSB7XG4gICAgICAgICAgICBmaWVsZC5jbGFzc0xpc3QuYWRkKCdoYXMtZXJyb3InKTtcbiAgICAgICAgICAgIHZhbGlkRm9ybSA9IGZhbHNlO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBmaWVsZC5jbGFzc0xpc3QucmVtb3ZlKCdoYXMtZXJyb3InKTtcbiAgICAgICAgICAgIHZhbGlkRm9ybSA9IHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgZm9ybS5hZGRFdmVudExpc3RlbmVyKCdzdWJtaXQnLCBmdW5jdGlvbihlKSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICBmb3IgKGNvbnN0IGZpZWxkIG9mIGZpZWxkcykge1xuICAgICAgICAgIGlmICggIXZhbGlkYXRlRmllbGQoZmllbGQpICkge1xuICAgICAgICAgICAgZmllbGQuY2xhc3NMaXN0LmFkZCgnaGFzLWVycm9yJyk7XG4gICAgICAgICAgICB2YWxpZEZvcm0gPSBmYWxzZTtcblxuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGZpZWxkLmNsYXNzTGlzdC5yZW1vdmUoJ2hhcy1lcnJvcicpO1xuICAgICAgICAgICAgdmFsaWRGb3JtID0gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIHZhbGlkRm9ybSApIHtcbiAgICAgICAgICBsZXQgZm9ybURhdGEgPSBuZXcgRm9ybURhdGEoZm9ybSk7XG5cbiAgICAgICAgICBpZiAoIGZpbGUgKSB7XG4gICAgICAgICAgICBmb3JtRGF0YS5hcHBlbmQoJ2ZpbGUnLCBmaWxlLmZpbGVzWzBdKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBsZXQgc3VjY2VzcyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgZm9ybS5jbGFzc0xpc3QuYWRkKCdzdWNjZXNzJyk7XG4gICAgICAgICAgfTtcblxuICAgICAgICAgIHNlbmREYXRhKGZvcm1EYXRhLCAnLycsIHN1Y2Nlc3MpO1xuXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29uc29sZS5sb2coJ3VudmFsaWQgZm9ybScpXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIHZhbGlkYXRlRmllbGQoaW5wdXQpIHtcbiAgbGV0IHZhbHVlID0gaW5wdXQudmFsdWU7XG4gIGxldCB0eXBlID0gaW5wdXQudHlwZTtcbiAgbGV0IHJlc3VsdCA9IGZhbHNlO1xuXG4gIGlmICggdHlwZSA9PSAndGVsJyApIHtcbiAgICByZXN1bHQgPSB2YWxpZGF0ZVBob25lKHZhbHVlKTtcbiAgfSBlbHNlIGlmICggdHlwZSA9PSAnZW1haWwnICkge1xuICAgIHJlc3VsdCA9IHZhbGlkYXRlTWFpbCh2YWx1ZSk7XG4gIH0gZWxzZSB7XG4gICAgcmVzdWx0ID0gIWlzRW1wdHkodmFsdWUpO1xuICB9XG5cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZnVuY3Rpb24gaXNFbXB0eShzdHIpIHtcbiAgcmV0dXJuIHN0ciA9PSAnJyAmJiB0cnVlO1xufVxuXG5mdW5jdGlvbiB2YWxpZGF0ZVBob25lKHN0cikge1xuICBsZXQgcmVnID0gL15bXFwrXT9bKF0/WzAtOV17M31bKV0/Wy1cXHNcXC5dP1swLTldezN9Wy1cXHNcXC5dP1swLTldezQsNn0kL2ltO1xuICByZXR1cm4gdGVzdFJlZyhyZWcsIHJlbW92ZVNwYWNlcyhzdHIpKTtcbn1cblxuZnVuY3Rpb24gdmFsaWRhdGVNYWlsKHN0cikge1xuICBsZXQgcmVzdWx0ID0gZmFsc2U7XG4gIGNvbnN0IHJlZyA9IC9eKChbXjw+KClbXFxdXFxcXC4sOzpcXHNAXFxcIl0rKFxcLltePD4oKVtcXF1cXFxcLiw7Olxcc0BcXFwiXSspKil8KFxcXCIuK1xcXCIpKUAoKFxcW1swLTldezEsM31cXC5bMC05XXsxLDN9XFwuWzAtOV17MSwzfVxcLlswLTldezEsM31cXF0pfCgoW2EtekEtWlxcLTAtOV0rXFwuKStbYS16QS1aXXsyLH0pKSQvO1xuICByZXN1bHQgPSB0ZXN0UmVnKHJlZywgc3RyKVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5mdW5jdGlvbiByZW1vdmVTcGFjZXMoc3RyKSB7XG4gIHJldHVybiBzdHIucmVwbGFjZSgvXFxzL2csICcnKTs7XG59XG5cbmZ1bmN0aW9uIHRlc3RSZWcocmUsIHN0cil7XG4gIGlmIChyZS50ZXN0KHN0cikpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn1cblxuZnVuY3Rpb24gc2VuZERhdGEoZGF0YSwgdXJsLCBzdWNjZXNzKSB7XG4gIGlmICggIWRhdGEgfHwgIXVybCApIHtcbiAgICByZXR1cm4gY29uc29sZS5sb2coJ2Vycm9yLCBoYXZlIG5vIGRhdGEgb3IgdXJsJyk7XG4gIH1cblxuICBsZXQgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG5cbiAgeGhyLm9ubG9hZGVuZCA9IGZ1bmN0aW9uKCkge1xuICAgIGlmICh4aHIuc3RhdHVzID09IDIwMCkge1xuICAgICAgbGV0IHN1Y2Nlc3NGdSA9IHN1Y2Nlc3M7XG5cbiAgICAgIHN1Y2Nlc3NGdSgpO1xuICAgICAgY29uc29sZS5sb2coXCLQo9GB0L/QtdGFXCIpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLmxvZyhcItCe0YjQuNCx0LrQsCBcIiArIHRoaXMuc3RhdHVzKTtcbiAgICB9XG4gIH07XG5cbiAgeGhyLm9wZW4oXCJQT1NUXCIsIHVybCk7XG4gIHhoci5zZW5kKGRhdGEpO1xufVxuXG5mdW5jdGlvbiBpbml0TW9kYWwobW9kYWxTd2lwZXIpIHtcbiAgbGV0IGluaXRzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmpzLW1vZGFsLWluaXQnKTtcbiAgbGV0IGJvZHkgPSBkb2N1bWVudC5ib2R5O1xuXG4gIGlmICggaW5pdHMubGVuZ3RoICkge1xuICAgIGZvciAoY29uc3QgaW5pdCBvZiBpbml0cykge1xuICAgICAgbGV0IHRhcmdldCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoaW5pdC5kYXRhc2V0LnRhcmdldCk7XG4gICAgICBsZXQgY2xvc2VzID0gdGFyZ2V0LnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy1tb2RhbC1jbG9zZScpO1xuXG4gICAgICBpZiAoIGNsb3Nlcy5sZW5ndGggKSB7XG4gICAgICAgIGZvciAoY29uc3QgY2xvc2Ugb2YgY2xvc2VzKSB7XG4gICAgICAgICAgY2xvc2UuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRhcmdldC5jbGFzc0xpc3QucmVtb3ZlKCdpcy1hY3RpdmUnKTtcbiAgICAgICAgICAgIGJvZHkuY2xhc3NMaXN0LnJlbW92ZSgnbW9kYWwtaXMtYWN0aXZlJyk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKCB0YXJnZXQgKSB7XG4gICAgICAgIGluaXQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICB0YXJnZXQuY2xhc3NMaXN0LmFkZCgnaXMtYWN0aXZlJyk7XG4gICAgICAgICAgYm9keS5jbGFzc0xpc3QuYWRkKCdtb2RhbC1pcy1hY3RpdmUnKTtcblxuICAgICAgICAgIGlmICggdGFyZ2V0LmRhdGFzZXQuc2xpZGVyID09ICd0cnVlJyApIHtcbiAgICAgICAgICAgIG1vZGFsU3dpcGVyLnVwZGF0ZSgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGluaXREcmFnTkRyb3AoKSB7XG4gIGxldCBjb250YWluZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtY2FsY3VsYXRlLWZpbGUnKTtcbiAgbGV0IGRyb3BBcmVhID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLWNhbGN1bGF0ZS1maWxlLWRyb3BhcmVhJyk7XG4gIGxldCBmaWxlRWxlbSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy1jYWxjdWxhdGUtZmlsZS1pbnB1dCcpO1xuICBsZXQgYWRkaW5ncyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy1jYWxjdWxhdGUtZmlsZS1hZGRpbmdzJyk7XG4gIGxldCBmaWxlTmFtZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy1jYWxjdWxhdGUtZmlsZS1uYW1lJyk7XG4gIGxldCByZW1vdmVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLWNhbGN1bGF0ZS1maWxlLXJlbW92ZXInKTtcblxuICBpZiAoICFjb250YWluZXIgJiYgIWRyb3BBcmVhICYmICFmaWxlRWxlbSAmJiAhYWRkaW5ncyAmJiAhZmlsZU5hbWUgJiYgIXJlbW92ZXIgKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgZnVuY3Rpb24gcHJldmVudERlZmF1bHRzIChlKSB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gIH07XG5cbiAgZnVuY3Rpb24gaGlnaGxpZ2h0KCkge1xuICAgIGNvbnRhaW5lci5jbGFzc0xpc3QuYWRkKCdoaWdobGlnaHQnKTtcbiAgfTtcblxuICBmdW5jdGlvbiB1bmhpZ2hsaWdodCgpIHtcbiAgICBjb250YWluZXIuY2xhc3NMaXN0LnJlbW92ZSgnaGlnaGxpZ2h0Jyk7XG4gIH07XG5cbiAgZnVuY3Rpb24gaGFuZGxlRmlsZXMoZmlsZXMpIHtcbiAgICBhZGRpbmdzLmNsYXNzTGlzdC5hZGQoJ2lzLXNob3cnKTtcbiAgICBjb250YWluZXIuY2xhc3NMaXN0LmFkZCgnaGFzLXJlc3VsdCcpO1xuICAgIGZpbGVOYW1lLnRleHRDb250ZW50ID0gZmlsZXNbMF0ubmFtZTtcbiAgfTtcblxuICBmdW5jdGlvbiBoYW5kbGVSZW1vdmVGaWxlcygpIHtcbiAgICBhZGRpbmdzLmNsYXNzTGlzdC5yZW1vdmUoJ2lzLXNob3cnKTtcbiAgICBjb250YWluZXIuY2xhc3NMaXN0LnJlbW92ZSgnaGFzLXJlc3VsdCcpO1xuICAgIGZpbGVOYW1lLnRleHRDb250ZW50ID0gJyc7XG4gICAgZmlsZUVsZW0udmFsdWUgPSAnJztcbiAgfTtcblxuICBmdW5jdGlvbiBoYW5kbGVEcm9wKGUpIHtcbiAgICBsZXQgZHQgPSBlLmRhdGFUcmFuc2ZlcjtcbiAgICBsZXQgZmlsZXMgPSBkdC5maWxlcztcblxuICAgIGlmICggVmFsaWRhdGUodGhpcykgKSB7XG4gICAgICBoYW5kbGVGaWxlcyhmaWxlcyk7XG4gICAgfVxuICB9O1xuXG4gIGZpbGVFbGVtLmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIGZ1bmN0aW9uKCkge1xuICAgIGlmICggVmFsaWRhdGUodGhpcykgKSB7XG4gICAgICBoYW5kbGVGaWxlcyh0aGlzLmZpbGVzKTtcbiAgICB9XG4gIH0pO1xuXG4gIHJlbW92ZXIuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbigpIHtcbiAgICBoYW5kbGVSZW1vdmVGaWxlcygpO1xuICB9KTtcblxuICBbJ2RyYWdlbnRlcicsICdkcmFnb3ZlcicsICdkcmFnbGVhdmUnLCAnZHJvcCddLmZvckVhY2goZXZlbnROYW1lID0+IHtcbiAgICBkcm9wQXJlYS5hZGRFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgcHJldmVudERlZmF1bHRzLCBmYWxzZSk7XG4gIH0pO1xuXG4gIFsnZHJhZ2VudGVyJywgJ2RyYWdvdmVyJ10uZm9yRWFjaChldmVudE5hbWUgPT4ge1xuICAgIGRyb3BBcmVhLmFkZEV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCBoaWdobGlnaHQsIGZhbHNlKTtcbiAgfSk7XG4gIFxuICBbJ2RyYWdsZWF2ZScsICdkcm9wJ10uZm9yRWFjaChldmVudE5hbWUgPT4ge1xuICAgIGRyb3BBcmVhLmFkZEV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCB1bmhpZ2hsaWdodCwgZmFsc2UpO1xuICB9KTtcblxuICBkcm9wQXJlYS5hZGRFdmVudExpc3RlbmVyKCdkcm9wJywgaGFuZGxlRHJvcCwgZmFsc2UpO1xuXG4gIHZhciBfdmFsaWRGaWxlRXh0ZW5zaW9ucyA9IFsnLnppcCcsICcucmFyJ107XG5cbiAgZnVuY3Rpb24gVmFsaWRhdGUoaW5wdXQpIHtcbiAgICB2YXIgc0ZpbGVOYW1lID0gaW5wdXQudmFsdWU7XG5cbiAgICBpZiAoc0ZpbGVOYW1lLmxlbmd0aCA+IDApIHtcbiAgICAgIHZhciBibG5WYWxpZCA9IGZhbHNlO1xuICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBfdmFsaWRGaWxlRXh0ZW5zaW9ucy5sZW5ndGg7IGorKykge1xuICAgICAgICB2YXIgc0N1ckV4dGVuc2lvbiA9IF92YWxpZEZpbGVFeHRlbnNpb25zW2pdO1xuICAgICAgICBpZiAoc0ZpbGVOYW1lLnN1YnN0cihzRmlsZU5hbWUubGVuZ3RoIC0gc0N1ckV4dGVuc2lvbi5sZW5ndGgsIHNDdXJFeHRlbnNpb24ubGVuZ3RoKS50b0xvd2VyQ2FzZSgpID09IHNDdXJFeHRlbnNpb24udG9Mb3dlckNhc2UoKSkge1xuICAgICAgICAgIGJsblZhbGlkID0gdHJ1ZTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoIWJsblZhbGlkKSB7XG4gICAgICAgIGNvbnRhaW5lci5jbGFzc0xpc3QuYWRkKCdoYXMtZXJyb3InKTtcblxuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGNvbnRhaW5lci5jbGFzc0xpc3QucmVtb3ZlKCdoYXMtZXJyb3InKTtcbiAgICAgICAgfSwgMjAwMClcblxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbn1cblxuZnVuY3Rpb24gaW5pdFJhbmdlKCkge1xuICB2YXIgc2xpZGVycyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy1yYW5nZScpO1xuXG4gIGlmICggc2xpZGVycy5sZW5ndGggKSB7XG4gICAgZm9yIChjb25zdCBzbGlkZXIgb2Ygc2xpZGVycykge1xuICAgICAgbGV0IHNsaWRlclN0ZXAgPSBOdW1iZXIoc2xpZGVyLmRhdGFzZXQuc3RlcCk7XG4gICAgICBsZXQgc2xpZGVyTWluID0gTnVtYmVyKHNsaWRlci5kYXRhc2V0Lm1pbik7XG4gICAgICBsZXQgc2xpZGVyTWF4ID0gTnVtYmVyKHNsaWRlci5kYXRhc2V0Lm1heCk7XG4gICAgICBsZXQgc2xpZGVyUGlwcyA9IE51bWJlcihzbGlkZXIuZGF0YXNldC5waXBzKTtcblxuICAgICAgbm9VaVNsaWRlci5jcmVhdGUoc2xpZGVyLCB7XG4gICAgICAgIHN0YXJ0OiBbMF0sXG4gICAgICAgIHN0ZXA6IHNsaWRlclN0ZXAsXG4gICAgICAgIHJhbmdlOiB7XG4gICAgICAgICAgJ21pbic6IHNsaWRlck1pbixcbiAgICAgICAgICAnbWF4Jzogc2xpZGVyTWF4XG4gICAgICAgIH0sXG4gICAgICAgIGNvbm5lY3Q6ICdsb3dlcicsXG4gICAgICAgIHRvb2x0aXBzOiB0cnVlLFxuICAgICAgICBmb3JtYXQ6IHdOdW1iKHtcbiAgICAgICAgICBkZWNpbWFsczogMyxcbiAgICAgICAgICB0aG91c2FuZDogJy4nLFxuICAgICAgICB9KSxcbiAgICAgICAgcGlwczoge1xuICAgICAgICAgIG1vZGU6ICdjb3VudCcsXG4gICAgICAgICAgdmFsdWVzOiBzbGlkZXJQaXBzLFxuICAgICAgICAgIHN0ZXBwZWQ6IGZhbHNlXG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICBsZXQgbWluaU1hcmtlcnMgPSBzbGlkZXIucXVlcnlTZWxlY3RvckFsbCgnLm5vVWktbWFya2VyLWhvcml6b250YWwubm9VaS1tYXJrZXInKTtcblxuICAgICAgaWYgKCBtaW5pTWFya2Vycy5sZW5ndGggKSB7XG4gICAgICAgIGZvciAoIGNvbnN0IG1pbmlNYXJrZXIgb2YgbWluaU1hcmtlcnMgKSB7XG4gICAgICAgICAgbWluaU1hcmtlci5yZW1vdmUoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBpbml0SGVhZGVyVG9nZ2xlcigpIHtcbiAgbGV0IHRvZ2dsZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtaGVhZGVyLXRvZ2dsZXInKTtcbiAgbGV0IGhlYWRlciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy1oZWFkZXInKTtcbiAgbGV0IHBhZ2VXcmFwID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLXBhZ2Utd3JhcCcpO1xuICBsZXQgZGFya25lc3MgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtaGVhZGVyLWRhcmtuZXNzJyk7XG5cbiAgaWYgKCB0b2dnbGVyICYmIGhlYWRlciAmJiBwYWdlV3JhcCAmJiBkYXJrbmVzcyApIHtcbiAgICB0b2dnbGVyLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oKSB7XG4gICAgICBoZWFkZXIuY2xhc3NMaXN0LnRvZ2dsZSgnaXMtb3BlbicpO1xuICAgICAgdG9nZ2xlci5jbGFzc0xpc3QudG9nZ2xlKCdpcy1hY3RpdmUnKTtcbiAgICAgIHBhZ2VXcmFwLmNsYXNzTGlzdC50b2dnbGUoJ3Njcm9sbC1ibG9ja2VkLW1vYmlsZScpO1xuICAgIH0pO1xuXG4gICAgZGFya25lc3MuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbigpIHtcbiAgICAgIGhlYWRlci5jbGFzc0xpc3QucmVtb3ZlKCdpcy1vcGVuJyk7XG4gICAgICB0b2dnbGVyLmNsYXNzTGlzdC5yZW1vdmUoJ2lzLWFjdGl2ZScpO1xuICAgICAgcGFnZVdyYXAuY2xhc3NMaXN0LnJlbW92ZSgnc2Nyb2xsLWJsb2NrZWQtbW9iaWxlJyk7XG4gICAgfSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gaW5pdEFsYnVtc0NhcmRTbGlkZXIoKSB7XG4gIHZhciBteVN3aXBlciA9IG5ldyBTd2lwZXIoJy5qcy1hbGJ1bXMtY2FyZC1zbGlkZXInLCB7XG4gICAgc3BlZWQ6IDQwMCxcbiAgICBzbGlkZXNQZXJWaWV3OiAxLFxuICAgIG5hdmlnYXRpb246IHtcbiAgICAgIG5leHRFbDogJy5zd2lwZXItYnV0dG9uLW5leHQnLFxuICAgICAgcHJldkVsOiAnLnN3aXBlci1idXR0b24tcHJldicsXG4gICAgfSxcbiAgfSk7XG5cbiAgcmV0dXJuIG15U3dpcGVyO1xufVxuXG5mdW5jdGlvbiBpbml0QWxidW1TbGlkZXIoKSB7XG4gIHZhciBteVN3aXBlciA9IG5ldyBTd2lwZXIoJy5qcy1zd2lwZXItYWxidW0nLCB7XG4gICAgc3BlZWQ6IDQwMCxcbiAgICBzbGlkZXNQZXJWaWV3OiAxLFxuICAgIGxvb3A6IGZhbHNlLFxuICAgIHByZWxvYWRJbWFnZXM6IGZhbHNlLFxuICAgIHNwYWNlQmV0d2VlbjogMTIsXG4gICAgbGF6eTogdHJ1ZSxcbiAgICBuYXZpZ2F0aW9uOiB7XG4gICAgICBuZXh0RWw6ICcuc3dpcGVyLWJ1dHRvbi1uZXh0JyxcbiAgICAgIHByZXZFbDogJy5zd2lwZXItYnV0dG9uLXByZXYnLFxuICAgIH0sXG4gIH0pO1xuXG4gIHJldHVybiBteVN3aXBlcjtcbn1cblxuZnVuY3Rpb24gaW5pdFN3aXBlcigpIHtcbiAgdmFyIG15U3dpcGVyID0gbmV3IFN3aXBlcignLmpzLXN3aXBlci1jb250YWluZXInLCB7XG4gICAgc3BlZWQ6IDQwMCxcbiAgICBzbGlkZXNQZXJWaWV3OiA2LFxuICAgIHNwYWNlQmV0d2VlbjogNDAsXG4gICAgbG9vcDogZmFsc2UsXG4gICAgcHJlbG9hZEltYWdlczogZmFsc2UsXG4gICAgbGF6eTogdHJ1ZSwgXG4gICAgbmF2aWdhdGlvbjoge1xuICAgICAgbmV4dEVsOiAnLnN3aXBlci1idXR0b24tbmV4dCcsXG4gICAgICBwcmV2RWw6ICcuc3dpcGVyLWJ1dHRvbi1wcmV2JyxcbiAgICB9LFxuICAgIGJyZWFrcG9pbnRzOiB7XG4gICAgICA0NTk6IHtcbiAgICAgICAgc2xpZGVzUGVyVmlldzogMSxcbiAgICAgIH0sXG4gICAgICA1OTk6IHtcbiAgICAgICAgc2xpZGVzUGVyVmlldzogMixcbiAgICAgIH0sXG4gICAgICA3Njc6IHtcbiAgICAgICAgc2xpZGVzUGVyVmlldzogMyxcbiAgICAgIH0sXG4gICAgICAxMTk5OiB7XG4gICAgICAgIHNsaWRlc1BlclZpZXc6IDQsXG4gICAgICB9LFxuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIG15U3dpcGVyO1xufVxuXG5mdW5jdGlvbiBpbml0U3dpcGVyU3RhdGljaygpIHtcbiAgdmFyIG15U3dpcGVyID0gbmV3IFN3aXBlcignLmpzLXN3aXBlci1jb250YWluZXItc3RhdGljaycsIHtcbiAgICBzcGVlZDogNDAwLFxuICAgIHNsaWRlc1BlclZpZXc6IDYsXG4gICAgc3BhY2VCZXR3ZWVuOiA0MCxcbiAgICBsb29wOiBmYWxzZSxcbiAgICBwcmVsb2FkSW1hZ2VzOiBmYWxzZSxcbiAgICBsYXp5OiB0cnVlLFxuICAgIGZvbGxvd0ZpbmdlcjogZmFsc2UsXG4gICAgYnJlYWtwb2ludHM6IHtcbiAgICAgIDQ1OToge1xuICAgICAgICBzbGlkZXNQZXJWaWV3OiAxLFxuICAgICAgfSxcbiAgICAgIDU5OToge1xuICAgICAgICBzbGlkZXNQZXJWaWV3OiAyLFxuICAgICAgfSxcbiAgICAgIDc2Nzoge1xuICAgICAgICBzbGlkZXNQZXJWaWV3OiAzLFxuICAgICAgfSxcbiAgICAgIDExOTk6IHtcbiAgICAgICAgc2xpZGVzUGVyVmlldzogNCxcbiAgICAgIH0sXG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gbXlTd2lwZXI7XG59XG5cbmZ1bmN0aW9uIGluaXRNYWluU3dpcGVyKCkge1xuICB2YXIgbXlTd2lwZXIgPSBuZXcgU3dpcGVyKCcuanMtbWFpbi1zd2lwZXItY29udGFpbmVyJywge1xuICAgIHNwZWVkOiA0MDAsXG4gICAgc2xpZGVzUGVyVmlldzogMSxcbiAgICBsb29wOiB0cnVlLFxuICAgIHNwYWNlQmV0d2VlbjogMTIsXG4gICAgcGFnaW5hdGlvbjoge1xuICAgICAgZWw6ICcuc3dpcGVyLXBhZ2luYXRpb24nLFxuICAgICAgdHlwZTogJ2J1bGxldHMnLFxuICAgICAgY2xpY2thYmxlOiB0cnVlXG4gICAgfSxcbiAgICBuYXZpZ2F0aW9uOiB7XG4gICAgICBuZXh0RWw6ICcuc3dpcGVyLWJ1dHRvbi1uZXh0JyxcbiAgICAgIHByZXZFbDogJy5zd2lwZXItYnV0dG9uLXByZXYnLFxuICAgIH0sXG4gIH0pO1xuXG4gIHJldHVybiBteVN3aXBlcjtcbn1cblxuZnVuY3Rpb24gaW5pdE1vZGFsU3dpcGVyKCkge1xuICB2YXIgbXlTd2lwZXIgPSBuZXcgU3dpcGVyKCcuanMtbWFpbi1zd2lwZXItbW9kYWwnLCB7XG4gICAgc3BlZWQ6IDQwMCxcbiAgICBzbGlkZXNQZXJWaWV3OiAxLFxuICAgIGxvb3A6IHRydWUsXG4gICAgc3BhY2VCZXR3ZWVuOiAxMixcbiAgICBwcmVsb2FkSW1hZ2VzOiBmYWxzZSxcbiAgICBsYXp5OiB0cnVlLFxuICAgIHBhZ2luYXRpb246IHtcbiAgICAgIGVsOiAnLnN3aXBlci1wYWdpbmF0aW9uJyxcbiAgICAgIHR5cGU6ICdidWxsZXRzJyxcbiAgICAgIGNsaWNrYWJsZTogdHJ1ZVxuICAgIH0sXG4gICAgbmF2aWdhdGlvbjoge1xuICAgICAgbmV4dEVsOiAnLnN3aXBlci1idXR0b24tbmV4dCcsXG4gICAgICBwcmV2RWw6ICcuc3dpcGVyLWJ1dHRvbi1wcmV2JyxcbiAgICB9LFxuICB9KTtcblxuICByZXR1cm4gbXlTd2lwZXI7XG59XG5cbmZ1bmN0aW9uIGluaXRBbGJ1bXNUeXBlU2xpZGVyKCkge1xuICB2YXIgbXlTd2lwZXIgPSBuZXcgU3dpcGVyKCcuanMtdHlwZS1hbGJ1bXMtc3dpcGVyJywge1xuICAgIHNwZWVkOiA0MDAsXG4gICAgc2xpZGVzUGVyVmlldzogJ2F1dG8nLFxuICAgIHNsaWRlc09mZnNldEFmdGVyOiAxMDAsXG4gICAgc3BhY2VCZXR3ZWVuOiAyNCxcbiAgICBuYXZpZ2F0aW9uOiB7XG4gICAgICBuZXh0RWw6ICcuc3dpcGVyLWJ1dHRvbi1uZXh0JyxcbiAgICAgIHByZXZFbDogJy5zd2lwZXItYnV0dG9uLXByZXYnLFxuICAgIH0sXG4gICAgb246IHtcbiAgICAgIHNsaWRlQ2hhbmdlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICggdGhpcy5hY3RpdmVJbmRleCA+IDAgKSB7XG4gICAgICAgICAgdGhpcy5lbC5jbGFzc0xpc3QuYWRkKCdub3Qtb24tc3RhcnQnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLmVsLmNsYXNzTGlzdC5yZW1vdmUoJ25vdC1vbi1zdGFydCcpO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgIH0sXG4gIH0pO1xuXG4gIHJldHVybiBteVN3aXBlcjtcbn1cblxuZnVuY3Rpb24gaW5pdE1haW5DYXJkc1NsaWRlcigpIHtcbiAgdmFyIG15U3dpcGVyID0gbmV3IFN3aXBlcignLmpzLW1haW4tY2FyZC1zbGlkZXInLCB7XG4gICAgc3BlZWQ6IDQwMCxcbiAgICBzbGlkZXNQZXJWaWV3OiAxLFxuICAgIGxvb3A6IHRydWUsXG4gICAgc3BhY2VCZXR3ZWVuOiAxMixcbiAgICBuYXZpZ2F0aW9uOiB7XG4gICAgICBuZXh0RWw6ICcuc3dpcGVyLWJ1dHRvbi1uZXh0JyxcbiAgICAgIHByZXZFbDogJy5zd2lwZXItYnV0dG9uLXByZXYnLFxuICAgIH0sXG4gIH0pO1xuXG4gIHJldHVybiBteVN3aXBlcjtcbn1cblxuZnVuY3Rpb24gdGFiKHRhYkhhbmRsZXIpIHtcbiAgICBsZXQgdGFic0NvbnRhaW5lciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuanMtdGFiLWNvbnRhaW5lclwiKTtcblxuICAgIGlmICggdGFic0NvbnRhaW5lciApIHtcbiAgICAgIGxldCBtZW51SXRlbXMgPSB0YWJzQ29udGFpbmVyLnF1ZXJ5U2VsZWN0b3JBbGwoXCIuanMtdGFiLW1lbnUtaXRlbVwiKTtcbiAgICAgIGxldCB1bmRlcmxpbmUgPSB0YWJzQ29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoXCIuanMtdGFiLXVuZGVybGluZVwiKTtcblxuICAgICAgbWVudUl0ZW1zLmZvckVhY2goIChtZW51SXRlbSkgPT4ge1xuICAgICAgICBpZiAoIHVuZGVybGluZSAmJiBtZW51SXRlbS5jbGFzc0xpc3QuY29udGFpbnMoXCJpcy1hY3RpdmVcIikgKSB7XG4gICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICBjdXJyZW50VGFiQWNjZW50KHVuZGVybGluZSwgbWVudUl0ZW0pO1xuICAgICAgICAgIH0sIDEwMCk7XG4gICAgICAgIH1cblxuICAgICAgICBtZW51SXRlbS5vbmNsaWNrID0gKCkgPT4ge1xuICAgICAgICAgIGxldCBhY3RpdmVNZW51SXRlbSA9IEFycmF5LmZyb20obWVudUl0ZW1zKS5maW5kKGdldEFjdGl2ZVRhYik7XG4gICAgICAgICAgbGV0IGFjdGl2ZUNvbnRlbnRJdGVtID0gdGFic0NvbnRhaW5lci5xdWVyeVNlbGVjdG9yKGFjdGl2ZU1lbnVJdGVtLmRhdGFzZXQudGFyZ2V0KTtcbiAgICAgICAgICBsZXQgY3VycmVudENvbnRlbnRJdGVtID0gdGFic0NvbnRhaW5lci5xdWVyeVNlbGVjdG9yKG1lbnVJdGVtLmRhdGFzZXQudGFyZ2V0KTtcblxuICAgICAgICAgIGFjdGl2ZU1lbnVJdGVtLmNsYXNzTGlzdC5yZW1vdmUoXCJpcy1hY3RpdmVcIik7XG5cbiAgICAgICAgICBpZiAoIGFjdGl2ZUNvbnRlbnRJdGVtICkge1xuICAgICAgICAgICAgYWN0aXZlQ29udGVudEl0ZW0uY2xhc3NMaXN0LnJlbW92ZShcImlzLWFjdGl2ZVwiKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoIGN1cnJlbnRDb250ZW50SXRlbSApIHtcbiAgICAgICAgICAgIGN1cnJlbnRDb250ZW50SXRlbS5jbGFzc0xpc3QuYWRkKFwiaXMtYWN0aXZlXCIpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIG1lbnVJdGVtLmNsYXNzTGlzdC5hZGQoXCJpcy1hY3RpdmVcIik7XG5cbiAgICAgICAgICBpZiAoIHVuZGVybGluZSApIHtcbiAgICAgICAgICAgIGN1cnJlbnRUYWJBY2NlbnQodW5kZXJsaW5lLCBtZW51SXRlbSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKCB0YWJIYW5kbGVyICkge1xuICAgICAgICAgICAgZG9jdW1lbnQuZGlzcGF0Y2hFdmVudCh0YWJIYW5kbGVyKTtcbiAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICB9KTtcbiAgICB9XG5cbiAgZnVuY3Rpb24gY3VycmVudFRhYkFjY2VudCh1bmRlcmxpbmUsIG1lbnVJdGVtKSB7XG4gICAgbGV0IGl0ZW1Qb3NpdGlvbiA9IG1lbnVJdGVtLm9mZnNldExlZnQ7XG4gICAgbGV0IGl0ZW1XaWR0aCA9IE51bWJlcihtZW51SXRlbS5zY3JvbGxXaWR0aCk7XG5cbiAgICByZXR1cm4gdW5kZXJsaW5lLnNldEF0dHJpYnV0ZShcInN0eWxlXCIsIGBsZWZ0OiAke2l0ZW1Qb3NpdGlvbn1weDsgd2lkdGg6ICR7aXRlbVdpZHRofXB4O2ApO1xuICB9XG5cbiAgZnVuY3Rpb24gZ2V0QWN0aXZlVGFiKGVsZW1lbnQpIHtcbiAgICByZXR1cm4gZWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoXCJpcy1hY3RpdmVcIik7XG4gIH1cbn1cblxuZnVuY3Rpb24gYWNjb3JkaW9uKCkge1xuICBsZXQgd3JhcHBlciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy1hY2NvcmRpb24nKTtcbiAgd3JhcHBlci5mb3JFYWNoKHdyYXBwZXJJdGVtID0+IHtcbiAgICBsZXQgaXRlbXMgPSB3cmFwcGVySXRlbS5xdWVyeVNlbGVjdG9yQWxsKCcuanMtYWNjb3JkaW9uLWl0ZW0nKTtcbiAgICBsZXQgaW5kaXZpZHVhbCA9IHdyYXBwZXJJdGVtLmdldEF0dHJpYnV0ZSgnaW5kaXZpZHVhbCcpICYmIHdyYXBwZXJJdGVtLmdldEF0dHJpYnV0ZSgnaW5kaXZpZHVhbCcpICE9PSAnZmFsc2UnO1xuXG4gICAgaXRlbXMuZm9yRWFjaChpdGVtID0+IHtcbiAgICAgIGlmICggaXRlbS5jbGFzc0xpc3QuY29udGFpbnMoJ2lzLWFjdGl2ZScpICkge1xuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICBsZXQgcmVhZHlDb250ZW50ID0gaXRlbS5xdWVyeVNlbGVjdG9yKCcuanMtYWNjb3JkaW9uLWNvbnRlbnQnKTtcbiAgICAgICAgICBsZXQgcmVhZHlDb250ZW50SGVpZ2h0ID0gcmVhZHlDb250ZW50LnNjcm9sbEhlaWdodDtcblxuICAgICAgICAgIHJlYWR5Q29udGVudC5zdHlsZS5tYXhIZWlnaHQgPSByZWFkeUNvbnRlbnRIZWlnaHQgKyAncHgnO1xuICAgICAgICB9LCAxMDApO1xuICAgICAgfVxuXG4gICAgICBsZXQgc3ViSXRlbXMgPSBpdGVtLnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy1hY2NvcmRpb24tc3ViaXRlbScpO1xuXG4gICAgICBmb3IgKGNvbnN0IHN1Ykl0ZW0gb2Ygc3ViSXRlbXMpIHtcbiAgICAgICAgaWYgKCBzdWJJdGVtLmNsYXNzTGlzdC5jb250YWlucygnaXMtYWN0aXZlJykgKSB7XG4gICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICBsZXQgcmVhZHlDb250ZW50ID0gc3ViSXRlbS5xdWVyeVNlbGVjdG9yKCcuanMtYWNjb3JkaW9uLWNvbnRlbnQnKTtcbiAgICAgICAgICAgIGxldCByZWFkeUNvbnRlbnRIZWlnaHQgPSByZWFkeUNvbnRlbnQuc2Nyb2xsSGVpZ2h0O1xuICBcbiAgICAgICAgICAgIHJlYWR5Q29udGVudC5zdHlsZS5tYXhIZWlnaHQgPSByZWFkeUNvbnRlbnRIZWlnaHQgKyAncHgnO1xuICAgICAgICAgIH0sIDEwMCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaXRlbUl0ZXJhdGlvbihpdGVtLCBpdGVtcywgaW5kaXZpZHVhbCk7XG5cbiAgICAgIHN1Ykl0ZW1zLmZvckVhY2goc3ViaXRlbSA9PiB7XG4gICAgICAgIGl0ZW1JdGVyYXRpb24oc3ViaXRlbSwgc3ViSXRlbXMsIGluZGl2aWR1YWwsIHRydWUpXG4gICAgICB9KTtcbiAgICB9KVxuICB9KVxufVxuXG5mdW5jdGlvbiBpdGVtSXRlcmF0aW9uKGl0ZW0sIGl0ZW1zLCBpbmRpdmlkdWFsLCBpc1N1Yml0ZW0pIHtcbiAgbGV0IGluaXQgPSBpdGVtLnF1ZXJ5U2VsZWN0b3IoJy5qcy1hY2NvcmRpb24taW5pdCcpO1xuICBsZXQgY29udGVudCA9IGl0ZW0ucXVlcnlTZWxlY3RvcignLmpzLWFjY29yZGlvbi1jb250ZW50Jyk7XG5cbiAgaWYgKCBpc1N1Yml0ZW0gPT09IHRydWUgKSB7XG4gICAgY29udGVudC5hZGRFdmVudExpc3RlbmVyKCd0cmFuc2l0aW9uZW5kJywgZnVuY3Rpb24oKSB7XG4gICAgICBsZXQgcGFyZW50SXRlbSA9IGl0ZW0uY2xvc2VzdCgnLmpzLWFjY29yZGlvbi1pdGVtJyk7XG4gICAgICBsZXQgcGFyZW50Q29udGVudEhlaWdodCA9IHBhcmVudEl0ZW0uc2Nyb2xsSGVpZ2h0ICsgJ3B4JztcbiAgICAgIGxldCBwYXJlbnRDb250ZW50ID0gcGFyZW50SXRlbS5xdWVyeVNlbGVjdG9yKCcuanMtYWNjb3JkaW9uLWNvbnRlbnQnKTtcblxuICAgICAgcGFyZW50Q29udGVudC5zZXRBdHRyaWJ1dGUoJ3N0eWxlJywgYG1heC1oZWlnaHQ6ICR7cGFyZW50Q29udGVudEhlaWdodH1gKTtcbiAgICB9KTtcbiAgfVxuXG4gIGluaXQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbigpIHtcbiAgICBpZiAoIGl0ZW0uY2xhc3NMaXN0LmNvbnRhaW5zKCdpcy1hY3RpdmUnKSApIHtcbiAgICAgIGl0ZW0uY2xhc3NMaXN0LnJlbW92ZSgnaXMtYWN0aXZlJyk7XG4gICAgICBjb250ZW50LnN0eWxlLm1heEhlaWdodCA9ICcwcHgnO1xuXG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG5cbiAgICBpZiAoIGlzU3ViaXRlbSA9PT0gdHJ1ZSApIHtcbiAgICAgIGxldCBwYXJlbnRJdGVtID0gaXRlbS5jbG9zZXN0KCcuanMtYWNjb3JkaW9uLWl0ZW0nKTtcbiAgICAgIGxldCBwYXJlbnRDb250ZW50ID0gcGFyZW50SXRlbS5xdWVyeVNlbGVjdG9yKCcuanMtYWNjb3JkaW9uLWNvbnRlbnQnKTtcblxuICAgICAgcGFyZW50Q29udGVudC5zZXRBdHRyaWJ1dGUoJ3N0eWxlJywgYG1heC1oZWlnaHQ6IG5vbmVgKTtcbiAgICB9XG5cbiAgICBpZiAoIGluZGl2aWR1YWwgKSB7XG4gICAgICBpdGVtcy5mb3JFYWNoKChlbGVtKSA9PiB7XG4gICAgICAgIGxldCBlbGVtQ29udGVudCA9IGVsZW0ucXVlcnlTZWxlY3RvcignLmpzLWFjY29yZGlvbi1jb250ZW50Jyk7XG4gICAgICAgIGVsZW0uY2xhc3NMaXN0LnJlbW92ZSgnaXMtYWN0aXZlJyk7XG4gICAgICAgIGVsZW1Db250ZW50LnN0eWxlLm1heEhlaWdodCA9IDAgKyAncHgnO1xuICAgICAgfSlcbiAgICB9XG5cbiAgICBpdGVtLmNsYXNzTGlzdC5hZGQoJ2lzLWFjdGl2ZScpO1xuICAgIGNvbnRlbnQuc3R5bGUubWF4SGVpZ2h0ID0gY29udGVudC5zY3JvbGxIZWlnaHQgKyAncHgnO1xuICB9KTtcbn0iXX0=
