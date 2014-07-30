(function (window, document, $, $body, $content) {
    'use strict';

    if (typeof history.pushState === 'undefined') {
        history.pushState = function(){
            return;
        };
    }

    $(document).ready(function ($) {

        // check img is on Screen
        $.extend($.expr[':'], {
            aboveFold: function (a) {
                var $this = $(a),
                    pos = $this.offset().top;

                return foldLine > pos;
            },
            closeToView: function (a) {
                var $this = $(a),
                    pos = $this.offset().top;

                return preLoadLine > pos;
            }
        });


        $.extend($.expr[':'], {
            invalid: function (a) {
                var $this = $(a),
                    invalid = true;

                try {
                    invalid = $this.is(':invalid');
                } catch (err) {
                    invalid = $.trim($this.val()) === '';
                }

                return invalid;
            }
        });

        if( typeof $.fn.placeholder !== 'undefined' )
            $('input, textarea').placeholder();

        //////////////////////
        // author information slider
        //
        var $header     = $('#author-info'),
            hHeight     = $header.height(),
            st          = $(window).scrollTop(),
            wh          = $(window).height(),
            pad         = 0,
            foldLine    = st + wh,
            preLoadLine = foldLine + pad;

        $(window).scroll(function () {
            st          = $(window).scrollTop();
            wh          = $(window).height();
            foldLine    = st + wh;
            preLoadLine = st + wh + pad;

            // header hiding
            if (!$('.scroller').length) {
                $header.height(Math.max(0, (hHeight - st)));
            }

            // lazy loading
            $('img.hide-until-load:closeToView').each(function () {
                var $img = $(this);

                $img.removeClass('hide-until-load')
                    .attr('src', $img.data('src'));
            });

            // scroll in
            $('.enter:aboveFold').each(function () {
                var $this = $(this);

                $this.removeClass('enter');
            });


        });

        hideLazyLoadImg();
    });

    //////////////////////
    // pushState
    //
    var popped = false,
        initialURL = location.href;

    // we want the default browser functionality while someone is clicking cmd or ctrl
    // to, you know... open links in new tabs
    $body.data('ajaxLinks', true);

    $body.keyup(function(e) {
       if( e.which === 17 || // control
           e.which === 91 )  // cmd
            $body.data('ajaxLinks', true);
    });

    $body.keydown(function(e) {
       if( e.which === 17 || // control
           e.which === 91 )  // cmd
            $body.data('ajaxLinks', false);
    });

    $body.on('click', 'a:not(.njx):not(.fancybox-close):not(.fancybox-nav):not([href^="http"])', function(e) {
        if( $body.data('ajaxLinks') ) {
            e.preventDefault();

            var href = $(this).attr('href');

            loadContent(href);
            history.pushState('', '', href);
        }
    });

    $(window).bind('popstate', function() {
        // Ignore inital popstate that some browsers fire on page load
        if ( !popped && initialURL === location.href ) {
            popped = true;
            return;
        }

        loadContent(location.pathname);
    });

    function loadContent(url) {
        var $con = $('#content'),
            $don = $con.find('>div'),
            hash = url.split('#');

        $con.addClass('swapping');

        if( hash.length < 2 )
            $('html, body').animate({
                scrollTop: 0
            }, 600);

        $don.fadeOut(300, function() {
            if( url !== '/' ) {
                $body.addClass('scroller');
                $('#author-info').slideUp();
            } else {
                $body.removeClass('scroller');
                $('#author-info').css('height', '').slideDown();
            }

            $('#close').click(); // close the contact form

            $.ajax({
                url: url,
                dataType: "html"
            }).done(function( responseText ) {

                var appending = $("<div>").append( $.parseHTML( responseText ) );

                $con.removeClass('loading');

                // append the extra content innit?
                $con.html(appending.find('#content').html());

                $('a.selected').removeClass('selected');
                $('a[href="' + url + '"]').addClass('selected');


                if( typeof $.fn.placeholder !== 'undefined' )
                    $('input, textarea').placeholder();

                hideLazyLoadImg()

                $con.find('>div').fadeIn(400, function() {
                    if( hash.length > 1 && $('#' + hash[1]) ) {
                        $('html, body').animate({
                            scrollTop: $('#' + hash[1]).offset().top
                        }, 600);
                    }
                    $con.removeClass('swapping');
                });
            });
        });
    }

    function hideLazyLoadImg() {

        $('img.lazy-load').each(function() {
            var $img = $(this);
            $img.data('src', $img.attr('src'))
                .removeClass('lazy-load')
                .addClass('hide-until-load')
                .attr('src', '');
        });

        $(window).scroll();
    }
}(window, window.document, jQuery, jQuery('body'), jQuery('#content')));