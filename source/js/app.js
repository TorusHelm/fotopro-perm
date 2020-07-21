'use strict';

document.addEventListener('DOMContentLoaded', function() {
  svg4everybody();
  initSwiper();
});

function initSwiper() {
  var mySwiper = new Swiper('.swiper-container', {
    speed: 400,
    spaceBetween: 100
  });

  return mySwiper;
}