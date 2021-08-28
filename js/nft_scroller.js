(function($) {
  "use strict";

  const API_URL = 'https://api.opensea.io/api/v1/assets';

  function getQueryString(params) {
    return Object.keys(params).map(k => {
      return `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`;
    }).join('&');
  }

  $.fn.nftScroller = function(options) {
    const limit = 10; // <= 50
    let self = this, loading = false, pointer = 0;
    let opts = $.extend({}, $.fn.nftScroller.defaults, options);

    if (!opts.target) {
      const urlSearchParams = new URLSearchParams(window.location.search);
      const params = Object.fromEntries(urlSearchParams.entries());
      opts = $.extend({}, params, { addr: this.attr('data-addr') }, opts);
    }

    let makeCards = function(assets) {
      let elem = $(self).find('.nft-content');
      assets.forEach((asset, i) => {
        elem.append($(`
          <div class="nft-card">
            <a href="${asset.permalink}" target="_blank">
              <div class="nft-card-img" style="background-image: url(${asset.image_url})"></div>
            </a>
            <section>
              <a href="https://opensea.io/${asset.collection.slug}" target="_blank"><img src="${asset.collection.image_url || ''}" onerror="this.style.display='none'" /></a>
              <a class="nft-card-title" href="https://opensea.io/${asset.collection.slug}" target="_blank">${asset.collection.name || 'Untitled'}</a>
            </section>
            <a class="nft-card-subtitle" href="${asset.permalink}}" target="_blank">${asset.name || 'Untitled'}</a>
          </div>
        `));
      });
    };

    let makeETHAddress = function(addr) {
      let path, node, addrElem = $(self).find('header div');
      path = addr.substring(0,Math.min(6, addr.length)) + '…' +
        addr.substring(addr.length - 4);
      node = $(`<a href="http://opensea.io/${addr}">${path}</a>`)
        .addClass('eth-addr');
      addrElem.append(node);
    };

    let requestAssets = function(addr, offset, limit) {
      loading = true;
      const qs = getQueryString({
        owner: addr,
        offset: offset,
        limit: limit,
        order_direction: 'desc'
      });
      // maybe use async await here!
      $.ajax({
        url: API_URL + (qs ? '?' + qs : ''),
        type: 'GET',
      }).done(function(data) {
        if (!data.assets || !data.assets.length > 0) {
          return;
        }
        makeCards(data.assets);
        pointer += limit;
        loading = false;
      }).fail(function() {
        loading = false;
      });
    };

    if (opts.addr) {
      makeETHAddress(opts.addr);
      $(self).find('.nft-content').scroll(function() {
        let elem = $(this);
        let newScrollLeft = elem.scrollLeft(),
            width = elem.width(),
            scrollWidth = elem.get(0).scrollWidth;
        let offset = 72;
        if (!loading && scrollWidth - newScrollLeft - width <= offset) {
          console.log('load more assets');
          requestAssets(opts.addr, pointer, limit);
        }
      });
      requestAssets(opts.addr, pointer, limit);
    } else {
      console.error('NFTScroller: No target address found.');
      return;
    }
  };

  $.fn.nftScroller.defaults = {
  };
})(jQuery);
