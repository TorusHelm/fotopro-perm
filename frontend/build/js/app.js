'use strict';

document.addEventListener('DOMContentLoaded', function() {
  let tabHandler = new Event('tabHandler');

  let swipers = initSwiper();
  svg4everybody();
  initMainSwiper();
  tab(tabHandler);

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

function initSwiper() {
  var mySwiper = new Swiper('.js-swiper-container', {
    speed: 400,
    slidesPerView: 6,
    spaceBetween: 40,
    loop: true,
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
          currentTabAccent(underline, menuItem);
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
    let trueStyles = window.getComputedStyle(menuItem);
    let itemPosition = menuItem.offsetLeft;
    let itemWidth = Number(trueStyles.width.split("px")[0]);

    return underline.setAttribute("style", `left: ${itemPosition}px; width: ${itemWidth}px;`);
  }

  function getActiveTab(element) {
    return element.classList.contains("is-active");
  }
}
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG5cbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBmdW5jdGlvbigpIHtcbiAgbGV0IHRhYkhhbmRsZXIgPSBuZXcgRXZlbnQoJ3RhYkhhbmRsZXInKTtcblxuICBsZXQgc3dpcGVycyA9IGluaXRTd2lwZXIoKTtcbiAgc3ZnNGV2ZXJ5Ym9keSgpO1xuICBpbml0TWFpblN3aXBlcigpO1xuICB0YWIodGFiSGFuZGxlcik7XG5cbiAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigndGFiSGFuZGxlcicsIGZ1bmN0aW9uKCkge1xuICAgIGlmICggIXN3aXBlcnMubGVuZ3RoICkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHN3aXBlcnMuZm9yRWFjaChzd2lwZXIgPT4ge1xuICAgICAgc3dpcGVyLnVwZGF0ZSgpO1xuICAgIH0pO1xuXG4gIH0sIGZhbHNlKTtcblxuICBpZiAoIHdpbmRvdy5pbm5lcldpZHRoIDwgNzY4ICkge1xuICAgIGluaXRNYWluQ2FyZHNTbGlkZXIoKTtcbiAgfVxufSk7XG5cbmZ1bmN0aW9uIGluaXRTd2lwZXIoKSB7XG4gIHZhciBteVN3aXBlciA9IG5ldyBTd2lwZXIoJy5qcy1zd2lwZXItY29udGFpbmVyJywge1xuICAgIHNwZWVkOiA0MDAsXG4gICAgc2xpZGVzUGVyVmlldzogNixcbiAgICBzcGFjZUJldHdlZW46IDQwLFxuICAgIGxvb3A6IHRydWUsXG4gICAgbmF2aWdhdGlvbjoge1xuICAgICAgbmV4dEVsOiAnLnN3aXBlci1idXR0b24tbmV4dCcsXG4gICAgICBwcmV2RWw6ICcuc3dpcGVyLWJ1dHRvbi1wcmV2JyxcbiAgICB9LFxuICAgIGJyZWFrcG9pbnRzOiB7XG4gICAgICA0NTk6IHtcbiAgICAgICAgc2xpZGVzUGVyVmlldzogMSxcbiAgICAgIH0sXG4gICAgICA1OTk6IHtcbiAgICAgICAgc2xpZGVzUGVyVmlldzogMixcbiAgICAgIH0sXG4gICAgICA3Njc6IHtcbiAgICAgICAgc2xpZGVzUGVyVmlldzogMyxcbiAgICAgIH0sXG4gICAgICAxMTk5OiB7XG4gICAgICAgIHNsaWRlc1BlclZpZXc6IDQsXG4gICAgICB9LFxuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIG15U3dpcGVyO1xufVxuXG5mdW5jdGlvbiBpbml0TWFpblN3aXBlcigpIHtcbiAgdmFyIG15U3dpcGVyID0gbmV3IFN3aXBlcignLmpzLW1haW4tc3dpcGVyLWNvbnRhaW5lcicsIHtcbiAgICBzcGVlZDogNDAwLFxuICAgIHNsaWRlc1BlclZpZXc6IDEsXG4gICAgbG9vcDogdHJ1ZSxcbiAgICBzcGFjZUJldHdlZW46IDEyLFxuICAgIHBhZ2luYXRpb246IHtcbiAgICAgIGVsOiAnLnN3aXBlci1wYWdpbmF0aW9uJyxcbiAgICAgIHR5cGU6ICdidWxsZXRzJyxcbiAgICAgIGNsaWNrYWJsZTogdHJ1ZVxuICAgIH0sXG4gICAgbmF2aWdhdGlvbjoge1xuICAgICAgbmV4dEVsOiAnLnN3aXBlci1idXR0b24tbmV4dCcsXG4gICAgICBwcmV2RWw6ICcuc3dpcGVyLWJ1dHRvbi1wcmV2JyxcbiAgICB9LFxuICB9KTtcblxuICByZXR1cm4gbXlTd2lwZXI7XG59XG5cbmZ1bmN0aW9uIGluaXRNYWluQ2FyZHNTbGlkZXIoKSB7XG4gIHZhciBteVN3aXBlciA9IG5ldyBTd2lwZXIoJy5qcy1tYWluLWNhcmQtc2xpZGVyJywge1xuICAgIHNwZWVkOiA0MDAsXG4gICAgc2xpZGVzUGVyVmlldzogMSxcbiAgICBsb29wOiB0cnVlLFxuICAgIHNwYWNlQmV0d2VlbjogMTIsXG4gICAgbmF2aWdhdGlvbjoge1xuICAgICAgbmV4dEVsOiAnLnN3aXBlci1idXR0b24tbmV4dCcsXG4gICAgICBwcmV2RWw6ICcuc3dpcGVyLWJ1dHRvbi1wcmV2JyxcbiAgICB9LFxuICB9KTtcblxuICByZXR1cm4gbXlTd2lwZXI7XG59XG5cbmZ1bmN0aW9uIHRhYih0YWJIYW5kbGVyKSB7XG4gICAgbGV0IHRhYnNDb250YWluZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmpzLXRhYi1jb250YWluZXJcIik7XG5cbiAgICBpZiAoIHRhYnNDb250YWluZXIgKSB7XG4gICAgICBsZXQgbWVudUl0ZW1zID0gdGFic0NvbnRhaW5lci5xdWVyeVNlbGVjdG9yQWxsKFwiLmpzLXRhYi1tZW51LWl0ZW1cIik7XG4gICAgICBsZXQgdW5kZXJsaW5lID0gdGFic0NvbnRhaW5lci5xdWVyeVNlbGVjdG9yKFwiLmpzLXRhYi11bmRlcmxpbmVcIik7XG5cbiAgICAgIG1lbnVJdGVtcy5mb3JFYWNoKCAobWVudUl0ZW0pID0+IHtcbiAgICAgICAgaWYgKCB1bmRlcmxpbmUgJiYgbWVudUl0ZW0uY2xhc3NMaXN0LmNvbnRhaW5zKFwiaXMtYWN0aXZlXCIpICkge1xuICAgICAgICAgIGN1cnJlbnRUYWJBY2NlbnQodW5kZXJsaW5lLCBtZW51SXRlbSk7XG4gICAgICAgIH1cblxuICAgICAgICBtZW51SXRlbS5vbmNsaWNrID0gKCkgPT4ge1xuICAgICAgICAgIGxldCBhY3RpdmVNZW51SXRlbSA9IEFycmF5LmZyb20obWVudUl0ZW1zKS5maW5kKGdldEFjdGl2ZVRhYik7XG4gICAgICAgICAgbGV0IGFjdGl2ZUNvbnRlbnRJdGVtID0gdGFic0NvbnRhaW5lci5xdWVyeVNlbGVjdG9yKGFjdGl2ZU1lbnVJdGVtLmRhdGFzZXQudGFyZ2V0KTtcbiAgICAgICAgICBsZXQgY3VycmVudENvbnRlbnRJdGVtID0gdGFic0NvbnRhaW5lci5xdWVyeVNlbGVjdG9yKG1lbnVJdGVtLmRhdGFzZXQudGFyZ2V0KTtcblxuICAgICAgICAgIGFjdGl2ZU1lbnVJdGVtLmNsYXNzTGlzdC5yZW1vdmUoXCJpcy1hY3RpdmVcIik7XG5cbiAgICAgICAgICBpZiAoIGFjdGl2ZUNvbnRlbnRJdGVtICkge1xuICAgICAgICAgICAgYWN0aXZlQ29udGVudEl0ZW0uY2xhc3NMaXN0LnJlbW92ZShcImlzLWFjdGl2ZVwiKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoIGN1cnJlbnRDb250ZW50SXRlbSApIHtcbiAgICAgICAgICAgIGN1cnJlbnRDb250ZW50SXRlbS5jbGFzc0xpc3QuYWRkKFwiaXMtYWN0aXZlXCIpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIG1lbnVJdGVtLmNsYXNzTGlzdC5hZGQoXCJpcy1hY3RpdmVcIik7XG5cbiAgICAgICAgICBpZiAoIHVuZGVybGluZSApIHtcbiAgICAgICAgICAgIGN1cnJlbnRUYWJBY2NlbnQodW5kZXJsaW5lLCBtZW51SXRlbSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKCB0YWJIYW5kbGVyICkge1xuICAgICAgICAgICAgZG9jdW1lbnQuZGlzcGF0Y2hFdmVudCh0YWJIYW5kbGVyKTtcbiAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICB9KTtcbiAgICB9XG5cbiAgZnVuY3Rpb24gY3VycmVudFRhYkFjY2VudCh1bmRlcmxpbmUsIG1lbnVJdGVtKSB7XG4gICAgbGV0IHRydWVTdHlsZXMgPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShtZW51SXRlbSk7XG4gICAgbGV0IGl0ZW1Qb3NpdGlvbiA9IG1lbnVJdGVtLm9mZnNldExlZnQ7XG4gICAgbGV0IGl0ZW1XaWR0aCA9IE51bWJlcih0cnVlU3R5bGVzLndpZHRoLnNwbGl0KFwicHhcIilbMF0pO1xuXG4gICAgcmV0dXJuIHVuZGVybGluZS5zZXRBdHRyaWJ1dGUoXCJzdHlsZVwiLCBgbGVmdDogJHtpdGVtUG9zaXRpb259cHg7IHdpZHRoOiAke2l0ZW1XaWR0aH1weDtgKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGdldEFjdGl2ZVRhYihlbGVtZW50KSB7XG4gICAgcmV0dXJuIGVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKFwiaXMtYWN0aXZlXCIpO1xuICB9XG59Il19
