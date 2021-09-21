(function($) {
  "use strict";

  const API_URL = 'https://api.opensea.io/api/v1/assets';

  function getQueryString(params) {
    return Object.keys(params).map(k => {
      return `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`;
    }).join('&');
  }

  if ((document.getElementById("eth-logo").src = "media/eth.png") && (window.location.href.indexOf("dm") > -1)) {
    console.log("gang gang gang i live a lifestyle")
    document.getElementById("eth-logo").src = "media/eth2.png"
  }

  if ((document.getElementById("eth-logo").src = "media/eth2.png") && (window.location.href.indexOf("dark") > -1)) {
    console.log("nah")
    document.getElementById("eth-logo").src = "media/eth.png"
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
              <div class="nft-card-img" style="background-image: url(${asset.image_url || asset.collection.image_url})"></div>
            </a>
            <section>
              <a href="https://opensea.io/collection/${asset.collection.slug}" target="_blank"><img src="${asset.collection.image_url || asset.image_url}" onerror="this.style.display='none'" /></a>
              <a class="nft-card-title" href="https://opensea.io/collection/${asset.collection.slug}" target="_blank">${asset.collection.name || 'Untitled'}</a>
            </section>
            <a class="nft-card-subtitle" href="${asset.permalink}" target="_blank">${asset.name || "#" + asset.token_id || 'Untitled'}</a>
          </div>
        `));
      });
    };

    let makeETHAddress = function(addr) {
      let path, node, addrElem = $(self).find('header div');
      path = addr.substring(0,Math.min(6, addr.length)) + '…' +
        addr.substring(addr.length - 4);
      node = $(`<a href="http://opensea.io/${addr}" target="_blank">${path}</a>`)
        .addClass('eth-addr');
      addrElem.append(node);
    };

    let makeTabs = function() {
      let tabs, tabElem = $(self).find('header');
      tabs = $(`<section><a id="tabs-nfts" class="activeTab">NFTs</a><a id="tabs-nftactivity">NFT Activity</a></section>`)
        .addClass('tabs');
      tabElem.append(tabs);
    };

    let requestActivity = function(addr) {
      const options = {method: 'GET', headers: {Accept: 'application/json'}};
      fetch(`https://api.opensea.io/api/v1/events?account_address=${addr}&only_opensea=false&offset=0&limit=50`, options)
        .then(response => response.json())
        .then(response => {
          // console.log(response);
          var assets = response.asset_events.length;
          for (var i = 0; i < assets; i++) {
            let eventType       = response.asset_events[i].event_type       /*  Returns "created" for new auctions, "successful" for sales, "cancelled", "bid_entered", "bid_withdrawn", "transfer", or "approve"  */
            let assetName       = response.asset_events[i].asset.name       /*  Asset name  */
            let assetLink       = response.asset_events[i].asset.permalink
            let assetImage      = response.asset_events[i].asset.image_url
            let backupImage     = response.asset_events[i].asset.collection.image_url
            let colllectionName = response.asset_events[i].asset.collection.name
            let assetId         = response.asset_events[i].asset.token_id

            const getPaymentToken = function() {
              if (response.asset_events[i].payment_token.symbol != null) {
                let paymentToken    = response.asset_events[i].payment_token.symbol || "ETH";
                return paymentToken;
              }
            }

            let eventDate       = response.asset_events[i].created_date     /*  Returns "2021-08-28T21:29:01.029737"  */
            const dateTime = moment(eventDate, "YYYY-MM-DDTh:mm:ss").utcOffset(0, true).fromNow();

            const fixPrice = function(assetPrice) {
              if (response.asset_events[i].ending_price != null) {
                let assetPrice = response.asset_events[i].ending_price
                let price;

                if (assetPrice.length == 20) {
                  let price = assetPrice.substring(0, assetPrice.length - 15);
                  price = price.substring(0, 2) + "." + price.substring(3, price.length);
                  return price;
                }

                if (assetPrice.length == 19) {
                  let price = assetPrice.substring(0, assetPrice.length - 15);
                  price = price.substring(0, 1) + "." + price.substring(1, price.length);
                  return price;
                }

                if (assetPrice.length == 18) {
                  let price = assetPrice.substring(0, assetPrice.length - 15);
                  price = "0." + price.substring(0, price.length);
                  return price;
                }

                if (assetPrice.length == 17) {
                  let price = assetPrice.substring(0, assetPrice.length - 15);
                  price = "0.0" + price.substring(0, price.length);
                  return price;
                }

                if (assetPrice.length == 16) {
                  let price = assetPrice.substring(0, assetPrice.length - 15);
                  price = "0.00" + price.substring(0, price.length);
                  return price;
                }
              }
            }

            /*console.log(`
              Event type: ${eventType}\n
              Event date: ${eventDate}\n
              Asset name: ${assetName}\n
              Asset link: ${assetLink}\n
              Image link: ${assetImage}\n
              `);*/
          // Add usernames to array
          let elem = document.body;
          let tabs, tabSection = $(self).find('section.nft-content');


          if ((eventType == "successful") && (response.asset_events[i].winner_account.address != addr.toLowerCase())) {
            let eventType = "Sold";
            let tabs = $(`
            <div>
              <a href="${assetLink}" target="_blank" class="imageAnchor">
                <div class="nft-card-img nftactivity-card-img" style="background-image: url(${assetImage || backupImage})"></div>
                <p class="nameInsideImage">${assetName || colllectionName + " " + assetId}</p>
              </a>
              <a href="${assetLink}" target="_blank" class="nft-card-subtitle sold">${eventType}</a>
              <a class="eventDate">${dateTime}</a>
            </div>
            `).addClass('nftactivity-card hide');
          tabSection.append(tabs);
          };

          if (eventType == "created") {
            let eventType = "Listed";
            let price = fixPrice(response.asset_events[i].ending_price);
            let paymentToken = getPaymentToken();
            let tabs = $(`
              <div>
                <a href="${assetLink}" target="_blank" class="imageAnchor">
                  <div class="nft-card-img nftactivity-card-img" style="background-image: url(${assetImage || backupImage})"></div>
                  <p class="nameInsideImage">${assetName || colllectionName + " " + assetId}</p>
                </a>
                <a href="${assetLink}" target="_blank" class="nft-card-subtitle selling">${eventType}</a>
                <a class="eventDate">${dateTime}</a>
              </div>
              `).addClass('nftactivity-card hide');
            tabSection.append(tabs);
          };


          if ((eventType == "transfer") && (response.asset_events[i].from_account.address != "0x0000000000000000000000000000000000000000") && (response.asset_events[i].asset.num_sales > 0) && (response.asset_events[i].to_account.address == addr.toLowerCase())){
            let eventType = "Purchased";
              let tabs = $(`
              <div>
                <a href="${assetLink}" target="_blank" class="imageAnchor">
                  <div class="nft-card-img nftactivity-card-img" style="background-image: url(${assetImage || backupImage})"></div>
                  <p class="nameInsideImage">${assetName || colllectionName + " " + assetId}</p>
                </a>
                <a href="${assetLink}" target="_blank" class="nft-card-subtitle purchased">${eventType}</a>
                <a class="eventDate">${dateTime}</a>
              </div>
              `).addClass('nftactivity-card hide');
            tabSection.append(tabs);
          };

          try {
            if ((eventType == "transfer") && (response.asset_events[i].from_account.address == "0x0000000000000000000000000000000000000000") && (response.asset_events[i].transaction.from_account.address == response.asset_events[i].to_account.address) && (response.asset_events[i].to_account.address == addr.toLowerCase())){
              let eventType = "Minted";
              console.log("BRO")
                let tabs = $(`
                <div>
                  <a href="${assetLink}" target="_blank" class="imageAnchor">
                    <div class="nft-card-img nftactivity-card-img" style="background-image: url(${assetImage || backupImage})"></div>
                    <p class="nameInsideImage">${assetName || colllectionName + " " + assetId}</p>
                  </a>
                  <a href="${assetLink}" target="_blank" class="nft-card-subtitle minted">${eventType}</a>
                  <a class="eventDate">${dateTime}</a>
                </div>
                `).addClass('nftactivity-card hide');
              tabSection.append(tabs);
            };
          } catch (error) {
            console.error(error)
          }
        
         }
      })
      .catch(err => console.error(err));
    }

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
      requestActivity(opts.addr);
      makeTabs();

      var nftCards =  document.getElementsByClassName('nft-card');
      var tabNFTs = document.querySelector('#tabs-nfts');
      var activityCards =  document.getElementsByClassName('nftactivity-card');
      var tabNftActivity = document.querySelector('#tabs-nftactivity');

      tabNFTs.addEventListener('click', function(event) {
        tabNFTs.classList.add('activeTab');
        tabNftActivity.classList.remove('activeTab');
        for(var i = 0; i < nftCards.length; i++)
        {
            nftCards[i].classList.remove('hide');
        }
        for(var i = 0; i < activityCards.length; i++)
        {
            activityCards[i].classList.add('hide');
        }
      });

      tabNftActivity.addEventListener('click', function(event) {
        tabNftActivity.classList.add('activeTab');
        tabNFTs.classList.remove('activeTab');
        for(var i = 0; i < nftCards.length; i++)
        {
            nftCards[i].classList.add('hide');
        }
        for(var i = 0; i < activityCards.length; i++)
        {
            activityCards[i].classList.remove('hide');
        }
      });


      $(self).find('.nft-content').scroll(function() {
        let elem = $(this);
        let newScrollLeft = elem.scrollLeft(),
            width = elem.width(),
            scrollWidth = elem.get(0).scrollWidth;
        let offset = 72;
        if ((!loading && scrollWidth - newScrollLeft - width <= offset) && tabNFTs.classList.contains('activeTab')) {
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
