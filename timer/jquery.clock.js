(function ($) {
    $.fn.clock = function () {
            var now = new Date();
            var HH = now.getHours();
            var MM = now.getMinutes();
            var SS = now.getSeconds();
        return this.each(function () {
            var str = '<span class="hh"></span>:<span class="mm"></span>:<span class="ss"></span>';
            $(this).html(str);
            if (SS <= 9) $(' span.ss').html('0' + SS);
            else $(' span.ss').html(SS);
            if (MM <= 9) $(' span.mm').html('0' + MM);
            else $(' span.mm').html(MM);
            if (HH <= 9) $(' span.hh').html('0' + HH);
            else $(' span.hh').html(HH);
            setInterval(function () {
                var now = new Date();
                var HH = now.getHours();
                var MM = now.getMinutes();
                var SS = now.getSeconds();
                if (SS <= 9) $('span.ss').html('0' + SS);
                else $('span.ss').html(SS);
                if (MM <= 9) $('span.mm').html('0' + MM);
                else $('span.mm').html(MM);
                if (HH <= 9) $('span.hh').html('0' + HH);
                else $('span.hh').html(HH);
            }, 1000);
        });
    };
    })(jQuery);