(function (window, Autocomplete) {
    'use strict';

    var $searchInput,
        $check;

    Autocomplete.prototype.initialize = function () {
        $searchInput = this.$trigger,//settings.$searchInput,
        $check = this._options.checkbox;
    }


    /**
     * Adds 'last searches' to Autocomplete.
     * @memberof! ch.Autocomplete.prototype
     * @function
     * @returns {Autocomplete}
     * @example
     * // Add last searches
     * Autocomplete.addLastSearches();
     */
    Autocomplete.prototype.addLastSearches = function () {

        var lastSearches;

        lastSearches = this.getLastSearches();

        this.$container.append(lastSearches);

        return this;
    };


    /**
     * Get 'last searches' to Autocomplete.
     * @memberof! ch.Autocomplete.prototype
     * @function
     * @returns {list}
     * @example
     * // Add last searches
     * Autocomplete.getLastSearches();
     */
    Autocomplete.prototype.getLastSearches = function () {

        var searches = '',
            list = '',
            isPMSCookie;

        isPMSCookie = this.getCookieValue("pmsctx");

        if (isPMSCookie) {
            var i,
                len,
                searches = isPMSCookie.replace(/\+/g,' ').split('*')[5].split('|'),
                text;

                // Check if cookie exist and have word
                if (searches != null && searches[0] !=null && searches[0] != '') {
                    searches.pop();

                    list  = '<div class="last-searches">';
                    // list += '<h4 class="last-searches-title">' + settings.suggest.txt.lastSearch +'</h4>';
                    list += '<h4 class="last-searches-title">' + 'ultimas busquedas' +'</h4>';
                    list += '<ul class="last-searches-list">';

                    len = searches.length;
                    for (i = 0; i < len ; i++) {
                        text = searches[i];
                        text = text.substring(1,text.length).toLowerCase();

                        try {
                            text = decodeURI(text);
                        } catch (e) {}

                        list += '<li><a num="'+i+'" href="/'+text+'" class="last-searches-item">'+text+'</a></li>';
                    }

                    list += '</ul></div>';
                }
        }

        return list;
    };

    Autocomplete.prototype.getCookieValue = function (name) {

        var start = document.cookie.indexOf(name+"="),
            len = start + name.length + 1,
            end = document.cookie.indexOf(";",len);

        if (start == -1) {
            return null;
        }

        if (end == -1) {
            end=document.cookie.length;
        }
        return unescape(document.cookie.substring(len,end));
    }


    // Autocomplete.prototype.setCookieValue = function (word) {

    //     if (word != null && word != "") {
    //         setContextCookie("S" + word);
    //     }
    //         Search.cookies.setCookie("ml_list", "",null,null,getUrlSubdomain(window.location.href),null);
    //     }
    // }


    Autocomplete.prototype.setCookie = function (config) {
        console.info('revisar seteo de cookie');
        var domain = '',//meli.domain,
            today,
            expire;

        config.path = config.path || '/';

        if (config.days !== undefined) {
            today = new Date();
            expire = new Date();

            if (config.days === undefined || config.days === 0) {
                config.days = 1;
            }

            expire.setTime(today.getTime() + 3600000 * 24 * config.days);
            document.cookie = config.name + '=' + config.value + ';path=' + config.path + ';domain=.' + domain + ';expires=' + expire.toGMTString();

        } else {
            document.cookie = config.name + '=' + config.value + ';path=' + config.path + ';domain=.' + domain;
        }

    }

    Autocomplete.prototype.setContextCookie = function (val) {
        url = urlPms + "/jm/PmsPixel?ck=" + val;

        var pixelDiv = document.getElementById("pmspxl");

        if (pixelDiv != null) {
            pixelDiv.innerHTML = "<img width=0 height=0 src='" + url + "'>";
        }
    }


    Autocomplete.prototype.setSearchCookies = function (query) {
        try{
            // Only if PMS active
            this.setCookie({
                name: 'ml_list',
                value: 'searching'
            });
            this.setCookie({
                name: 'LAST_SEARCH',
                value: query
            });
        }catch(e){
            // Nothing
        }
    }


    Autocomplete.prototype.naturalization = function (conf) {
       var query = conf.string.toLowerCase(),
           replace = conf.replace,
           replacement = conf.replacement;

       while (query.toString().indexOf(replace) != -1){
           query = query.toString().replace(replace,replacement);
       }
       return query;
   }


    Autocomplete.prototype.doSearch = function (tracking) {

       // Saving querys
       // Use trim to remove white spaces
       var query = $searchInput.val(), //trim($searchInput.val()),
           search = 'http://listado.localhost.com.ar:8080/$query_DisplayType_G'//settings.uri;
           // search = 'http://ipod.localhost.com.ar:8080/reproductores/';

       // Naturalization
       if (query && query.length > 0){
           query = this.naturalization({
               string: query,
               replace: ' ',
               replacement: '-'
           });
       } else {
           // Focus when submit (valid en IE)
           $searchInput.focus();
           return false;
       }

       // Category checked
       if ($check !== null && $check.is(':checked')) {
           if (window.location.href.indexOf('_DisplayType_LF') != -1) {
               search =  "http://listado.localhost.com.ar:8080/$query_DisplayType_G#D[C:'']" + '_DisplayType_LF';
           } else {
               search = "http://listado.localhost.com.ar:8080/$query_DisplayType_G#D[C:'']";
           }
       }

       // Adults setting
       if (this.getCookieValue('pr_categ') === 'AD' && search.indexOf('_PrCategId_AD') === -1) {
           search = search + '_PrCategId_AD';
       }

       // Add query to the URL string
       search = search.replace('$query', encodeURIComponent(query));

       // Tracking
       if(typeof tracking != 'undefined'){
           search = search + '#D[A:' + query + ',B:' + tracking.element + ']';
       }
       // Cookies
       this.setSearchCookies(query);

       // Redirect
       // location.href = search;
       console.info(search);

       return this;
   };




}(this, this.ch.Autocomplete));
