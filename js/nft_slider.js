(function($) {

  const API_URL = 'https://api.opensea.io/api/v1/assets';

  function splitToSlices(arr, length) {
    let i, l, result = [], len = length ? length : 4;
    for (i = 0, l = arr.length; i < l; i += len) {
      result.push(arr.slice(i, i + len));
    }
    return result;
  }

  $.fn.nftSlider = function(options) {
    let self = this;
    let curr = 0, count = 0, slides = [];
    let opts = $.extend({}, $.fn.nftSlider.defaults, options);

    if (!opts.target) {
      const urlSearchParams = new URLSearchParams(window.location.search);
      const params = Object.fromEntries(urlSearchParams.entries());
      opts = $.extend({}, params, { target: this.attr('data-addr') }, opts);
    }

    let makeETHAdress = function(addr, username) {
      let path, node, addrElem = $(self).find('header div');
      path = addr.substring(0,Math.min(6, addr.length)) + '…' +
        addr.substring(addr.length - 4);
      node = $(`<a href="http://opensea.io/${addr}">${path}</a>`)
        .attr('id', 'ethAddress');
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
      let html = '', slidesElem = $(self).find('#slides');
      slides.forEach((item,i) => {
        html += `<div id="slide-${i}" class="flex-container slide ${i === 0 ? 'active' : ''}">`;
        html += item.map(asset => {

          let asset_name = asset.name || 'Untitled';
          // if (asset_name.length > opts.asset_title_len) { // maybe use css
          //   asset_name = asset_name.substring(
          //     0, Math.min(opts.asset_title_len-1, asset_name.length)) + '…';
          // }

          let collection_name = asset.collection.name || 'Untitled';
          // if (collection_name.length > opts.coll_title_len) { // maybe use css
          //   collection_name = collection_name.substring(
          //     0, Math.min(opts.coll_title_len, collection_name.length)) + '…';
          // }

          return `<div>
<div class="card-img" style="background-image: url(${asset.image_url});"></div>
<!--              <img href="https://opensea.io/${asset.collection.slug}" src="${asset.image_url}" target="_blank"/> -->
              <p class="collection-name">
                <img src="${asset.collection.image_url}" />
                <a href="https://opensea.io/${asset.collection.slug}" target="_blank">${collection_name}</a>
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
        $(target).toggleClass('active');
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
      slides = splitToSlices(data.assets);
      count = slides.length;

      makeNavigation(count);
      makeETHAdress(
        data.assets[0].owner.address,
        data.assets[0].owner.user.username
      );
      makeSlides(slides);
    };

    if (opts.addr) {
      let params = $.extend({}, opts.params, { owner: opts.addr });
      let qs = Object.keys(params).map(key => {
        return `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`;
      }).join('&');
      $.ajax({
        url: API_URL + '?' + qs,
        success: onSuccess
      });
    } else {
      console.error('NFTSlider: No target address found.');
      return;
    }

  };

  $.fn.nftSlider.defaults = {
    // asset_title_len: 18,
    // coll_title_len: 15,
    params: {
      offset: 0,
      limit: 20,
      order_direction: 'desc'
    }
  };
})(jQuery);
