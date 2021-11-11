$(function () {
    let mainSlider = () => {
        $('.js-main-slider').slick({
            fade: true,
            arrows: false,
            dots: true,
            customPaging: function () {
                return '<span class="main-slider__dot"></span>';
            },
            appendDots: '.main-slider__dots',
        });
    }

    let cardsSlider = () => {
        $('.js-cards-slider').each(function (idx) {
            let cardsSliderID = 'cards-slider-' + idx;
            this.closest('.cards-slider').id = cardsSliderID;
            $(this).slick({
                slidesToShow: 4,
                slidesToScroll: 1,
                prevArrow: '#' + cardsSliderID + ' .cards-slider__btn.prev',
                nextArrow: '#' + cardsSliderID + ' .cards-slider__btn.next',
                dots: true,
                appendDots: '#' + cardsSliderID + ' .cards-slider__dots',
                customPaging: function () {
                    return '<span class="cards-slider__dot"></span>';
                },
                responsive: [
                    {
                        breakpoint: 1200,
                        settings: {
                            slidesToShow: 3,

                        }
                    },
                    {
                        breakpoint: 992,
                        settings: {
                            slidesToShow: 2
                        }
                    },
                    {
                        breakpoint: 768,
                        settings: {
                            slidesToShow: 1
                        }
                    }
                ]
            });
        });
    }

    let tabs = () => {
        $(document).on('click', '.tabs-btn', function () {
            let tabName = $(this).attr('data-tab'),
                tabsBody = $(this).closest('.tabs').find('.tabs-body')[0],
                tab = $(tabsBody).find('.' + tabName);

            $(this)
                .addClass('active')
                .siblings()
                .removeClass('active');

            $(tab)
                .addClass('active')
                .siblings()
                .removeClass('active');

            if ($(tabsBody).find('.js-cards-slider').length) {
                $('.js-cards-slider').each(function () {
                    $(this).slick('refresh');
                });
            }
        });
    }

    (function () {
        let timerEnd = "15:30";
        let interval = setInterval(function () {
            let timerStart = timerEnd.split(':'),
                minutes = parseInt(timerStart[0], 10),
                seconds = parseInt(timerStart[1], 10);
            --seconds;
            minutes = (seconds < 0) ? --minutes : minutes;
            seconds = (seconds < 0) ? 59 : seconds;
            seconds = (seconds < 10) ? '0' + seconds : seconds;
            $('.timer').html(minutes + 'мин ' + seconds + 'сек');
            if (minutes < 0) clearInterval(interval);
            if ((seconds <= 0) && (minutes <= 0)) clearInterval(interval);
            timerEnd = minutes + ':' + seconds;
        }, 1000)
    })();

    let scrollTo = () => {
        $(document).on('click', '.js-smooth-scroll', function (e) {
            e.preventDefault();
            smoothScroll($(this).attr('data-target'));
        });
    }

    function smoothScroll(id) {
        $('html, body').animate({
            scrollTop: $(id).offset().top
        }, 1000);
    }

    mainSlider();
    cardsSlider();
    tabs();
    scrollTo();
});