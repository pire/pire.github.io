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

        //////////////////////
        // Contact Form
        //
        var cf = {
            init : function () {
                this.cacheItems();
                this.bindEvents();
            },
            cacheItems : function () {
                this.$triggers  = $('#contact-toggle, #close');
                this.$container = $('#contact');
                this.$feedBk    = $('#contact-feedback');
                this.$form      = $('#contact-form');
                this.$fields    = this.$form.find('input, textarea');
                this.$submit    = this.$form.find('button');
                this.$close     = $('#close');

                this.$submit.data('originalText', this.$submit.text());
            },
            bindEvents : function () {
                this.$triggers.click(this.toggleForm);
                this.$form.submit(this.submitForm);

                this.$fields.keyup(this.updateSubmit);

                $(document).keyup(function(e) {
                    if( e.which === 27 ) cf.$close.click();
                });

                this.$container.on('click', '#try-again', this.retry);
            },
            clearForm : function () {
                var $messages = cf.$feedBk.children();

                if( $messages.length ) {
                    $messages.remove();
                    cf.$form.show();
                }

                cf.$feedBk.hide();

                cf.$fields.val('');
            },
            showForm : function () {
                this.$triggers.addClass('selected');
                this.$submit.text(this.$submit.data('originalText'));
                this.$container.slideDown(300, function() { cf.$fields.eq(0).focus(); cf.$close.fadeIn(200); });
            },
            hideForm : function () {
                this.$triggers.removeClass('selected');
                this.$close.fadeOut(200);
                this.$container.slideUp(300, this.clearForm);
            },
            toggleForm : function (e) {
                e.preventDefault();

                var $this = $(this);

                if( $this.hasClass('selected') || $this.hasClass('force-close') ) {
                    // hide the form
                    cf.hideForm();
                } else {
                    // show the form
                    cf.showForm();
                }
            },
            retry : function (e) {
                e.preventDefault();

                cf.$feedBk.fadeOut(300, function() {
                    cf.$form.delay(200).fadeIn(400);
                    cf.updateSubmit();
                    cf.$submit.text(cf.$submit.data('originalText'));
                });
            },
            updateSubmit : function() {
                var invalid = cf.$fields.filter(':invalid').length ? true : false;
                cf.$submit.attr('disabled', invalid);
            },
            submitForm : function (e) {
                e.preventDefault();

                var $this = $(this);

                cf.$submit.attr('disabled', true)
                          .text('Sending message...');

                $.ajax({
                    url: '/contact',
                    type : 'post',
                    dataType : 'json',
                    data : $this.serialize(),
                    success : function(response) {
                        cf.$container.height(cf.$container.height());

                        $this.fadeOut(400);
                        cf.$feedBk.html(response.message)
                                  .delay(401)
                                  .fadeIn(400);
                    }
                });
            }
        };

        cf.init();

        $('.gallery a').lightbox();
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
                document.title = appending.find('title').text();

                $('a.selected').removeClass('selected');

                var splitUp = url.split('/'),
                    blogPage = ( url === '/' || (splitUp.length > 1 && splitUp[1] === 'blog') ),
                    selection = blogPage ? '[href="/"], a[href="' + url + '"]' : '[href="' + url + '"]',
                    workPage = (splitUp.length > 1 && splitUp[1] === 'work');

                selection = workPage ? '[href="/work/"], a[href="' + url + '"]' : selection;

                $('a'+ selection).addClass('selected');


                if( typeof $.fn.placeholder !== 'undefined' )
                    $('input, textarea').placeholder();

                hideLazyLoadImg();

                $con.find('>div').fadeIn(400, function() {
                    if( hash.length > 1 && $('#' + hash[1]) ) {
                        $('html, body').animate({
                            scrollTop: $('#' + hash[1]).offset().top
                        }, 600);
                    }
                    $con.removeClass('swapping');
                });

                var $gal = $con.find('.gallery a');

                if( $gal.length )
                    $gal.lightbox();

                DISQUS.reset({ reload: true });
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

    /* * * CONFIGURATION VARIABLES: EDIT BEFORE PASTING INTO YOUR WEBPAGE * * */
    var disqus_shortname = 'p1r3'; // required: replace example with your forum shortname

    /* * * DON'T EDIT BELOW THIS LINE * * */
    (function() {
        var dsq = document.createElement('script'); dsq.type = 'text/javascript'; dsq.async = true;
        dsq.src = '//' + disqus_shortname + '.disqus.com/embed.js';
        (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(dsq);
    })();
}(window, window.document, jQuery, jQuery('body'), jQuery('#content')));