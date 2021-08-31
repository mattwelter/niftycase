(function($) {

  const API_URL = 'https://api.opensea.io/api/v1/assets';

  function splitToSlices(arr, length) {
    let i, l, result = [], len = length ? length : 4;
    for (i = 0, l = arr.length; i < l; i += len) {
      result.push(arr.slice(i, i + len));
    }
    return result;
  }

  function getQueryString(params) {
    return Object.keys(params).map(k => {
      return `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`;
    }).join('&');
  }

  $.fn.nftSlider = function(options) {
    let self = this;
    let curr = 0, count = 0, slides = [];
    let opts = $.extend({}, $.fn.nftSlider.defaults, options);

    if (!opts.target) {
      const urlSearchParams = new URLSearchParams(window.location.search);
      const params = Object.fromEntries(urlSearchParams.entries());
      opts = $.extend({}, params, { addr: this.attr('data-addr') }, opts);
    }

    let makeETHAdress = function(addr) {
      let path, node, addrElem = $(self).find('header div');
      path = addr.substring(0,Math.min(6, addr.length)) + '…' +
        addr.substring(addr.length - 4);
      node = $(`<a href="http://opensea.io/${addr}" target="_blank">${path}</a>`)
        .addClass('eth-addr');
      addrElem.append(node);
    }

    let makeNavigation = function(count) {
      let btn, navElem = $(self).find('nav');

      btn = $('<a>←</a>')
        .attr('id', 'btn-prev')
        .click(onPrev);
      navElem.append(btn);

      for (let i=0; i < count; i++) {
        btn = $(`<a>${i+1}</a>`)
          .attr('data-target', `#slide-${i}`)
          .click(onCurr);
        if (i === curr) {
          btn.toggleClass('active');
        }
        navElem.append(btn);
      }

      btn = $('<a>→</a>')
        .attr('id', 'btn-next')
        .click(onNext);
      navElem.append(btn);
    };

    let makeSlides = function(slides) {
      let html = '', slidesElem = $(self).find('.nft-content');
      slides.forEach((item,i) => {
        html += `<div id="slide-${i}" class="slide ${i === 0 ? 'active' : ''}">`;
        html += item.map(asset => {

          let asset_name = asset.name || 'Untitled';
          let collection_name = asset.collection.name || 'Untitled';

          return `<div>
              <a href="${asset.permalink}" target="_blank">
                <div class="nft-card-img" style="background-image: url(${asset.image_url || ''});"></div>
              </a>
              <p class="collection-name">
                <img src="${asset.collection.image_url || ''}" onerror="this.style.display='none'" />
                <a href="https://opensea.io/${asset.collection.slug}">${collection_name}</a>
              </p>
              <p class="asset-name">
                <a href="${asset.permalink}" target="_blank">${asset_name}</a>
              </p>
            </div>`;
        }).join('');
        html += '</div>';
      })
      slidesElem.html(html);
    };

    let onCurr = function(event) {
      let elem = event.target;
      let target = elem.dataset.target;
      let [prefix, ids] = target.split('-');
      let id = parseInt(ids);

      if (curr !== id) {
        $(self).find('.active').toggleClass('active');
        $(self).find(target).toggleClass('active');
        $(self).find(`[data-target="${target}"]`).toggleClass('active');
        curr = id;
      }
    };

    let onNext = function(event) {
      curr = (curr + 1) % count;

      $(self).find('.active').toggleClass('active');
      $(self).find(`#slide-${curr}`).toggleClass('active');
      $(self).find(`[data-target="#slide-${curr}"]`).toggleClass('active');
    };

    let onPrev = function(event) {
      let c = curr - 1;
      while(c < 0) { c += count; }
      curr = c;

      $(self).find('.active').toggleClass('active');
      $(self).find(`#slide-${curr}`).toggleClass('active');
      $(self).find(`[data-target="#slide-${curr}"]`).toggleClass('active');
    };

    let onSuccess = function(data) {
      slides = splitToSlices(data.assets); // maybe private
      count = slides.length;

      makeNavigation(count);
      makeSlides(slides);
    };

    if (opts.addr) {
      makeETHAdress(opts.addr);
      let params = $.extend({}, opts.params, { owner: opts.addr });
      let qs = getQueryString(params);
      $.ajax({
        url: API_URL + (qs ? '?' + qs : ''),
        success: onSuccess
      });
    } else {
      console.error('NFTSlider: No target address found.');
      return;
    }

  };

  $.fn.nftSlider.defaults = {
    params: {
      offset: 0,
      limit: 20,
      order_direction: 'desc'
    }
  };
})(jQuery);
