(function($) {
  "use strict";

  const API_URL = 'https://api.opensea.io/api/v1/assets';

  function getQueryString(params) {
    return Object.keys(params).map(k => {
      return `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`;
    }).join('&');
  }

  // let getFloorPrice = function(addr) {
  //   const qs = getQueryString({
  //     owner: addr,
  //     offset: 0,
  //     order_direction: 'desc'
  //   });
  //   // maybe use async await here!
  //   $.ajax({
  //     url: API_URL + (qs ? '?' + qs : ''),
  //     type: 'GET',
  //   }).done(function(data) {
  //     if (!data.assets || !data.assets.length > 0) {
  //       return;
  //     }
  //     console.log(data.assets)

  //     let totalFloorPrice = [];

  //     for(var i = 0; i < data.assets.length; i++)
  //     {
  //       console.log(data.assets[i].asset_contract.address)

  //       const getCollectionData = async (contract_addr) => {
  //         return new Promise(resolve => setTimeout(resolve, 125)).then(() => {
  //           const url = 'https://api.opensea.io/api/v1/asset/' + contract_addr + "/1/";
  //           const options = {
  //             method: 'GET',
  //             headers: {
  //               'Content-Type': 'application/json',
  //             }
  //           };
  //           return fetch(url, options)
  //             .then(res => res.json())
  //             .then(data => {

  //               totalFloorPrice.push(data.collection.stats.floor_price)

  //               console.log(totalFloorPrice)

  //               const sum = totalFloorPrice.reduce(add,0);

  //               function add(accumulator, a) {
  //                   return accumulator + a;
  //               }

  //               console.log("Total floor price", sum);

  //               //   1 day vol, change, sales
  //               //   7 day vol, change, sales
  //               //   30 day vol, change, sales
  //               //   count/supply
  //               //   % of owners
  //               //   floor price

  //               // extra details i want to get (from other apis)

  //               //   # of discord members
  //               //   # of twitter followers
  //             })
  //         });
  //       };

  //       getCollectionData(data.assets[i].asset_contract.address)
  //     }
  //   })
  // };

  if (window.location.href.indexOf("dm") > -1) {
    document.getElementById("eth-logo").src = "media/eth2.png"
  }

  if (window.location.href.indexOf("dark") > -1) {
    console.log("eeeee")
    document.getElementById("eth-logo").src = "media/eth.png"
  }

  if (window.location.href.indexOf("darker") > -1) {
    document.getElementById("eth-logo").src = "media/eth2.png"
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

    let makeNoNfts = function(addr) {
      let elem = $(self).find('.nft-content');
        elem.append($(`
          <div class="nft-card" style="width: 100%; height: 200px;">
          <svg viewBox="0 0 36 36" style="font-size: 40px; padding-bottom: 12px; margin-top: 40px; height: 1.25em; position: relative; width: inherit; display: inline-block;" aria-hidden="true" class="r-4qtqp9 r-yyyyoo r-xb2eav r-1xvli5t r-dnmrzs r-kzbkwu r-bnwqim r-1plcrui r-lrvibr"><g><path d="M35.508 15.41l-9.295-3.387L22.438 1.47c-.108-.302-.357-.48-.722-.495-.322.007-.604.22-.698.53l-3.293 10.71-9.132 3.805c-.285.118-.467.4-.46.708.007.308.203.58.492.686L17.92 20.8l3.775 10.552c.107.298.39.496.704.496h.016c.322-.007.604-.22.698-.53l3.293-10.712 9.132-3.803c.284-.118.466-.4.46-.708-.007-.308-.203-.58-.492-.686z" fill="#61BCF6"></path><path d="M9.57 4.715l-2.906.065-.06-2.715C6.585 1.34 5.983.763 5.256.78 4.53.796 3.955 1.4 3.97 2.125l.063 2.715-2.747.062C.56 4.92-.016 5.522 0 6.248c.017.726.62 1.302 1.346 1.285l2.747-.062.062 2.716c.017.726.62 1.302 1.345 1.286.726-.016 1.302-.62 1.286-1.345l-.062-2.715 2.905-.066c.725-.017 1.3-.62 1.285-1.346-.017-.726-.62-1.302-1.346-1.285z" fill="#F16888"></path><path d="M14.205 29.69l-1.65.036-.034-1.518c-.016-.726-.618-1.302-1.344-1.286s-1.302.62-1.286 1.345l.034 1.518-1.54.035c-.726.016-1.302.62-1.286 1.345.017.726.62 1.302 1.345 1.286l1.54-.034.034 1.518c.017.726.62 1.302 1.345 1.286.726-.016 1.302-.62 1.286-1.345l-.034-1.518 1.65-.037c.726-.016 1.302-.62 1.286-1.345-.016-.727-.62-1.303-1.345-1.286z" fill="#FD9E1A"></path></g></svg>
            <a style="text-align: center; display: block; color: #333; font-size: 24px; font-weight: 600;">NOOOOOO</a>
            <a style="text-align: center; display: block; color: rgb(83, 100, 113); margin-top: 8px; font-size: 17px; font-weight: 400;">did you know this mans has 0 nfts?</a>
          </div>
        `));
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

    var totalFloorPrice = [];

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
            let contract_addr   = response.asset_events[i].asset.asset_contract.address

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
          console.log("User has 0 NFTs")
          makeNoNfts()
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
      // getFloorPrice(opts.addr)
      requestAssets(opts.addr, pointer, limit);
    } else {
      console.error('NFTScroller: No target address found.');
      return;
    }
  };

  $.fn.nftScroller.defaults = {
  };
})(jQuery);
