import Document, {
  DocumentContext,
  DocumentInitialProps,
  Html,
  Head,
  Main,
  NextScript,
} from 'next/document';
import getConfig from '../../config';

const siteName = getConfig(
  process.env.NEXT_PUBLIC_VERCEL_URL ?? 'app.getzealthy.com'
).name;

class MyDocument extends Document {
  static async getInitialProps(
    ctx: DocumentContext
  ): Promise<DocumentInitialProps> {
    const initialProps = await Document.getInitialProps(ctx);

    return {
      ...initialProps,
    };
  }
  // You can then use this string wherever you need to inject the script

  render() {
    return (
      <Html style={{ height: '100%' }}>
        <Head>
          {/* VWO app.getzealthy.com smart code */}
          <link
            rel="preconnect"
            href="https://dev.visualwebsiteoptimizer.com"
          />
          <script
            type="text/javascript"
            id="vwoCode"
            dangerouslySetInnerHTML={{
              __html: `window._vwo_code || (function() {
                  var account_id=770224,
                  version=2.1,
                  settings_tolerance=2000,
                  hide_element='body',
                  hide_element_style = 'opacity:0 !important;filter:alpha(opacity=0) !important;background:none !important;transition:none !important;',
                  f=false,w=window,d=document,v=d.querySelector('#vwoCode'),cK='_vwo_'+account_id+'_settings',cc={};try{var c=JSON.parse(localStorage.getItem('_vwo_'+account_id+'_config'));cc=c&&typeof c==='object'?c:{}}catch(e){}var stT=cc.stT==='session'?w.sessionStorage:w.localStorage;code={nonce:v&&v.nonce,use_existing_jquery:function(){return typeof use_existing_jquery!=='undefined'?use_existing_jquery:undefined},library_tolerance:function(){return typeof library_tolerance!=='undefined'?library_tolerance:undefined},settings_tolerance:function(){return cc.sT||settings_tolerance},hide_element_style:function(){return'{'+(cc.hES||hide_element_style)+'}'},hide_element:function(){if(performance.getEntriesByName('first-contentful-paint')[0]){return''}return typeof cc.hE==='string'?cc.hE:hide_element},getVersion:function(){return version},finish:function(e){if(!f){f=true;var t=d.getElementById('_vis_opt_path_hides');if(t)t.parentNode.removeChild(t);if(e)(new Image).src='https://dev.visualwebsiteoptimizer.com/ee.gif?a='+account_id+e}},finished:function(){return f},addScript:function(e){var t=d.createElement('script');t.type='text/javascript';if(e.src){t.src=e.src}else{t.text=e.text}v&&t.setAttribute('nonce',v.nonce);d.getElementsByTagName('head')[0].appendChild(t)},load:function(e,t){var n=this.getSettings(),i=d.createElement('script'),r=this;t=t||{};if(n){i.textContent=n;d.getElementsByTagName('head')[0].appendChild(i);if(!w.VWO||VWO.caE){stT.removeItem(cK);r.load(e)}}else{var o=new XMLHttpRequest;o.open('GET',e,true);o.withCredentials=!t.dSC;o.responseType=t.responseType||'text';o.onload=function(){if(t.onloadCb){return t.onloadCb(o,e)}if(o.status===200||o.status===304){_vwo_code.addScript({text:o.responseText})}else{_vwo_code.finish('&e=loading_failure:'+e)}};o.onerror=function(){if(t.onerrorCb){return t.onerrorCb(e)}_vwo_code.finish('&e=loading_failure:'+e)};o.send()}},getSettings:function(){try{var e=stT.getItem(cK);if(!e){return}e=JSON.parse(e);if(Date.now()>e.e){stT.removeItem(cK);return}return e.s}catch(e){return}},init:function(){if(d.URL.indexOf('__vwo_disable__')>-1)return;var e=this.settings_tolerance();w._vwo_settings_timer=setTimeout(function(){_vwo_code.finish();stT.removeItem(cK)},e);var t;if(this.hide_element()!=='body'){t=d.createElement('style');var n=this.hide_element(),i=n?n+this.hide_element_style():'',r=d.getElementsByTagName('head')[0];t.setAttribute('id','_vis_opt_path_hides');v&&t.setAttribute('nonce',v.nonce);t.setAttribute('type','text/css');if(t.styleSheet)t.styleSheet.cssText=i;else t.appendChild(d.createTextNode(i));r.appendChild(t)}else{t=d.getElementsByTagName('head')[0];var i=d.createElement('div');i.style.cssText='z-index: 2147483647 !important;position: fixed !important;left: 0 !important;top: 0 !important;width: 100% !important;height: 100% !important;background: white !important;';i.setAttribute('id','_vis_opt_path_hides');i.classList.add('_vis_hide_layer');t.parentNode.insertBefore(i,t.nextSibling)}var o=window._vis_opt_url||d.URL,s='https://dev.visualwebsiteoptimizer.com/j.php?a='+account_id+'&u='+encodeURIComponent(o)+'&vn='+version;if(w.location.search.indexOf('_vwo_xhr')!==-1){this.addScript({src:s})}else{this.load(s+'&x=true')}}};w._vwo_code=code;code.init();})();`,
            }}
          />
          <script
            dangerouslySetInnerHTML={{
              __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-WD63L7R2');`,
            }}
          />
          {process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' &&
            siteName === 'Zealthy' && (
              <>
                <script
                  defer
                  id="freshpaint-script"
                  dangerouslySetInnerHTML={{
                    __html: `
              (function(c,a){if(!a.__SV){var b=window;try{var d,m,j,k=b.location,f=k.hash;d=function(a,b){return(m=a.match(RegExp(b+"=([^&]*)")))?m[1]:null};f&&d(f,"fpState")&&(j=JSON.parse(decodeURIComponent(d(f,"fpState"))),"fpeditor"===j.action&&(b.sessionStorage.setItem("_fpcehash",f),history.replaceState(j.desiredHash||"",c.title,k.pathname+k.search)))}catch(n){}var l,h;window.freshpaint=a;a._i=[];a.init=function(b,d,g){function c(b,i){var a=i.split(".");2==a.length&&(b=b[a[0]],i=a[1]);b[i]=function(){b.push([i].concat(Array.prototype.slice.call(arguments,
                0)))}}var e=a;"undefined"!==typeof g?e=a[g]=[]:g="freshpaint";e.people=e.people||[];e.toString=function(b){var a="freshpaint";"freshpaint"!==g&&(a+="."+g);b||(a+=" (stub)");return a};e.people.toString=function(){return e.toString(1)+".people (stub)"};l="disable time_event track track_pageview track_links track_forms track_with_groups add_group set_group remove_group register register_once alias unregister identify name_tag set_config reset opt_in_tracking opt_out_tracking has_opted_in_tracking has_opted_out_tracking clear_opt_in_out_tracking people.set people.set_once people.unset people.increment people.append people.union people.track_charge people.clear_charges people.delete_user people.remove people group page alias ready addEventProperties addInitialEventProperties removeEventProperty addPageviewProperties".split(" ");
                for(h=0;h<l.length;h++)c(e,l[h]);var f="set set_once union unset remove delete".split(" ");e.get_group=function(){function a(c){b[c]=function(){call2_args=arguments;call2=[c].concat(Array.prototype.slice.call(call2_args,0));e.push([d,call2])}}for(var b={},d=["get_group"].concat(Array.prototype.slice.call(arguments,0)),c=0;c<f.length;c++)a(f[c]);return b};a._i.push([b,d,g])};a.__SV=1.4;b=c.createElement("script");b.type="text/javascript";b.async=!0;b.src="undefined"!==typeof FRESHPAINT_CUSTOM_LIB_URL?
                FRESHPAINT_CUSTOM_LIB_URL:"//perfalytics.com/static/js/freshpaint.js";(d=c.getElementsByTagName("script")[0])?d.parentNode.insertBefore(b,d):c.head.appendChild(b)}})(document,window.freshpaint||[]);
                freshpaint.init("79596508-0fe9-4c94-b58f-30e565880d89");
                freshpaint.page();
              `,
                  }}
                />

                <script
                  defer
                  id="snap-pixel-script"
                  dangerouslySetInnerHTML={{
                    __html: `(function(e, t, n){if(e.snaptr)return;var a=e.snaptr=function()
              {a.handleRequest?a.handleRequest.apply(a,arguments):a.queue.push(arguments)};
                a.queue=[];var s="script";r=t.createElement(s);r.async=!0;
                r.src=n;var u=t.getElementsByTagName(s)[0];
                u.parentNode.insertBefore(r,u);})
              (window, document,
                'https://sc-static.net/scevent.min.js'
                )
                ;

                snaptr('init', 'b2e605b9-62f8-4977-ac63-1ad4e13e387f', {})
              ;

                snaptr('track', 'PAGE_VIEW'
              )
              ;`,
                  }}
                />

                <script
                  defer
                  type="text/javascript"
                  id="rudderstack-script"
                  dangerouslySetInnerHTML={{
                    __html: `
                !function(){"use strict";window.RudderSnippetVersion="3.0.25";var e="rudderanalytics";window[e]||(window[e]=[])
  ;var rudderanalytics=window[e];if(Array.isArray(rudderanalytics)){
  if(true===rudderanalytics.snippetExecuted&&window.console&&console.error){
  console.error("RudderStack JavaScript SDK snippet included more than once.")}else{rudderanalytics.snippetExecuted=true,
  window.rudderAnalyticsBuildType="legacy";var sdkBaseUrl="https://cdn.rudderlabs.com/v3";var sdkName="rsa.min.js"
  ;var scriptLoadingMode="async"
  ;var n=["setDefaultInstanceKey","load","ready","page","track","identify","alias","group","reset","setAnonymousId","startSession","endSession","consent"]
  ;for(var r=0;r<n.length;r++){var t=n[r];rudderanalytics[t]=function(n){return function(){var r
  ;Array.isArray(window[e])?rudderanalytics.push([n].concat(Array.prototype.slice.call(arguments))):null===(r=window[e][n])||void 0===r||r.apply(window[e],arguments)
  }}(t)}try{new Function('return import("")'),window.rudderAnalyticsBuildType="modern"}catch(o){}
  var d=document.head||document.getElementsByTagName("head")[0]
  ;var i=document.body||document.getElementsByTagName("body")[0];window.rudderAnalyticsAddScript=function(e,n,r){
  var t=document.createElement("script");t.src=e,t.setAttribute("data-loader","RS_JS_SDK"),n&&r&&t.setAttribute(n,r),
  "async"===scriptLoadingMode?t.async=true:"defer"===scriptLoadingMode&&(t.defer=true),
  d?d.insertBefore(t,d.firstChild):i.insertBefore(t,i.firstChild)},window.rudderAnalyticsMount=function(){!function(){
  if("undefined"==typeof globalThis){var e;var n=function getGlobal(){
  return"undefined"!=typeof self?self:"undefined"!=typeof window?window:null}();n&&Object.defineProperty(n,"globalThis",{
  value:n,configurable:true})}
  }(),window.rudderAnalyticsAddScript("".concat(sdkBaseUrl,"/").concat(window.rudderAnalyticsBuildType,"/").concat(sdkName),"data-rsa-write-key","2mFXilG2ez6IzDaIEETWaqureuy")
  },
  "undefined"==typeof Promise||"undefined"==typeof globalThis?window.rudderAnalyticsAddScript("https://polyfill-fastly.io/v3/polyfill.min.js?version=3.111.0&features=Symbol%2CPromise&callback=rudderAnalyticsMount"):window.rudderAnalyticsMount()
  ;var loadOptions={}
  ;rudderanalytics.load("2mFXilG2ez6IzDaIEETWaqureuy","https://getzealthymfde.dataplane.rudderstack.com",loadOptions)}}
  }();
                  `,
                  }}
                />

                <script
                  defer
                  type="text/javascript"
                  id="squaredance"
                  dangerouslySetInnerHTML={{
                    __html: `
              ;!function(j,u,m,b,l,e){var n="jumbleberry",i="3.2.2",o=function(){o.v==i&&o.e?o.e.apply(o,arguments):o.q.push(arguments)}
              ,a=encodeURIComponent,t=decodeURIComponent,d=j.location;(o.push=o).l=!1,o.q=[],o.v=i,o.duid=function(n){return(
              n=n&&u.cookie.match(RegExp(t("%5Cs*")+n.substr(0,21)+"id=([^;]+)")))?t(n[1].split(".")[0]):""},o.g=function(n,i){return!!(
              i=RegExp("^[^#]*[?&]"+n+"=([^&#]+)").exec(i||d.href))&&t(i[1].replace(/\\+/g," "))},o.s=function(n){for(var i=Math.round((
              new Date).getTime()/1e3),t=d.hostname.split("."),r=t.length-1;0<r--&&/^(([a-z0-9]{4}-?){8}|[0-9]+)$/i.test(n)&&n!=o.duid(
              o.p);)u.cookie=o.p.substr(0,21)+"id="+a(n)+"."+i+".0."+i+".; path=/; max-age=63072000; domain=."+t.slice(r,t.length
              ).join(".")},o.i=function(n,i,t){if("init"==n)return[o.u=o.duid(o.p=i),o.s(o.h=t||o.u)];t=t||{},(n=u.createElement(
              "iframe")).src=o.d+o.p+"?hid="+a(o.h)+"&uid="+a(o.u)+"&event="+a(i||"")+"&transid="+a(t.transaction_id||"")+"&oi="+a(
              t.order_index||"")+"&ctx="+a(JSON.stringify(t)),n.height=n.width=0,n.style="display:none;visibility:hidden",
              n.sandbox="allow-forms allow-same-origin allow-scripts",n.referrerPolicy="unsafe-url",(u.body||u.head).appendChild(n)},
              o.m=o.e=function(){var n,i;!j._RNGSeed&&o.i.apply(o,arguments)&&(n=u.createElement(m),i=u.getElementsByTagName(m)[0],
              n.src=o.d+o.p+"?hid="+a(o.h)+"&uid="+a(o.u)+"&v="+o.v,n.async=!!o.h,o.e=!1,o.q.unshift(arguments),j.addEventListener(
              "beforeunload",n.onerror=function(){o.e=o.i;for(var n=0;n<o.q.length;++n)o.apply(o,o.q[n]);o.q=[]}),
              i.parentNode.insertBefore(n,i))},j[n]=j[n]||o,j[n].d=b}(window,document,"script","https://www.kind-loving-strawberry.com/");

              jumbleberry("init", "Cw-S-00Fn7aBy59nOuhx37RTLQa6lPrRtwfln0Bd-fQRf6j4uoVqltDT1QW9P6KCs3kHws6AivvmnkFxJRhlHw~~", jumbleberry.g("sqdid"));
            `,
                  }}
                />
              </>
            )}
          {/*STZ  */}
          <script
            defer
            type="text/javascript"
            id="stzEventTracker"
            dangerouslySetInnerHTML={{
              __html: `
      (async function() {
        // Configuration
        var API_ENDPOINT = '/api/st/track-event';
        var COOKIE_NAME = '_stz';
        var STORAGE_KEY_PREFIX = 'STZEvent_'; // Prefix for localStorage/sessionStorage keys to track events
        var PROFILE_ID_KEY = 'STZProfileID'; // Key for storing profile_id in localStorage

        // Utility functions
        function getCookie(name) {
          var value = '; ' + document.cookie;
          var parts = value.split('; ' + name + '=');
          if (parts.length === 2) return decodeURIComponent(parts.pop().split(';').shift());
        }

        function eventAlreadyTracked(eventName) {
          // Check if the event has already been tracked in this session or locally
          return sessionStorage.getItem(STORAGE_KEY_PREFIX + eventName) || localStorage.getItem(STORAGE_KEY_PREFIX + eventName);
        }

        function markEventAsTracked(eventName) {
          // Mark the event as tracked in sessionStorage to avoid duplicates during this session
          sessionStorage.setItem(STORAGE_KEY_PREFIX + eventName, 'true');
          localStorage.setItem(STORAGE_KEY_PREFIX + eventName, 'true'); // If you want it to persist across sessions
        }

        function getProfileId() {
          // Retrieve profile_id from localStorage
          return localStorage.getItem(PROFILE_ID_KEY);
        }

        function setProfileId(profileId) {
          // Store profile_id in localStorage
          localStorage.setItem(PROFILE_ID_KEY, profileId);
        }

        // Check if _stz cookie exists
        var stz = getCookie(COOKIE_NAME);
        var stzObject = null;

        try {
          // Parse the _stz cookie if it exists
          if (stz) {
            stzObject = JSON.parse(stz);
          }
        } catch (error) {
          console.error('Error parsing _stz cookie:', error);
        }

        console.log('STZ Object:', stzObject);

        // Only initialize if _stz object exists
        if (stzObject) {
          // Main STZ object
          window.STZ = window.STZ || {};

          // Queue for storing events before the trackEvent function is fully defined
          var eventQueue = [];

          // Initial trackEvent function that queues events
          STZ.trackEvent = function(eventName, eventData = {}) {
            eventQueue.push({ name: eventName, data: eventData });
          };

          // Function to process queued events
          async function processEventQueue() {
            while (eventQueue.length > 0) {
              var event = eventQueue.shift();
              await sendEventToServer(event.name, event.data); // Await each event processing
            }
          }

          // Retry fetch a few times in case of failure
          async function retryFetch(url, options, retries = 3) {
            for (let i = 0; i < retries; i++) {
              try {
                const response = await fetch(url, options);
                if (response.ok) return await response.json();
                throw new Error('Network response was not ok: ' + response.status);
              } catch (error) {
                if (i < retries - 1) {
                  console.warn('Retrying fetch... Attempt:', i + 1);
                } else {
                  throw error; // If all retries fail, throw the error
                }
              }
            }
          }

          // Function to send event to server
          async function sendEventToServer(eventName, eventData = {}) {
            // Check if this event has already been tracked
            if (eventAlreadyTracked(eventName)) {
              console.log('Event already tracked:', eventName);
              return;
            }

            // Get profile_id if stored, otherwise include from eventData
            var profileId = getProfileId();
            if (!profileId && eventData.profile_id) {
              profileId = eventData.profile_id;
              setProfileId(profileId); // Store profile_id when AccountCreated event is tracked
            } else if (!profileId) {
              console.warn('No profile_id available for event:', eventName);
            }

            var data = {
              stz_obj: stzObject,
              eventName: eventName,
              eventData: { ...eventData, profile_id: profileId },
              timestamp: new Date().toISOString(),
              url: window.location.href
            };

            try {
              // Use sendBeacon for asynchronous, non-blocking requests
              if (navigator.sendBeacon) {
                const endpointUrl = new URL(API_ENDPOINT, window.location.origin);
                const payload = JSON.stringify(data);
                const blob = new Blob([payload], { type: 'application/json' });
                navigator.sendBeacon(endpointUrl, blob);
                console.log('STZ Event tracked using sendBeacon:', eventName);
              } else {
                // Use fetch with retry for regular API calls
                await retryFetch(API_ENDPOINT, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(data),
                });
                console.log('STZ Event tracked successfully:', eventName);
              }

              // Mark the event as tracked to prevent duplicates
              markEventAsTracked(eventName);
            } catch (error) {
              console.error('Error tracking STZ event:', eventName, error);
            }
          }

          // Redefine trackEvent to send events directly, with optional eventData
          STZ.trackEvent = async function(eventName, eventData = {}) {
            console.log('Tracking STZ event:', eventName, eventData);
            await sendEventToServer(eventName, eventData);
          };

          // Process any queued events
          await processEventQueue();
        } else {
          // If _stz cookie doesn't exist, create a dummy STZ object
          window.STZ = window.STZ || {
            trackEvent: function(eventName, eventData = {}) {
              // Do nothing if _stz cookie doesn't exist
            }
          };
        }
      })();
    `,
            }}
          />

          {/** Google Recaptcha */}
          {/* eslint-disable-next-line @next/next/no-sync-scripts */}
          <script
            src={`https://www.google.com/recaptcha/enterprise.js?render=${process
              .env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}`}
          ></script>

          {/* Hide reCAPTCHA badge */}
          <style>
            {`.grecaptcha-badge { visibility: hidden !important; }`}
          </style>

          <meta property="og:url" content="https://www.getzealthy.com/" />
          <meta property="og:title" content="Zealthy" />
          <meta
            property="og:description"
            content="High-quality virtual care including primary care, mental health, metabolic health, and more. Get personalized care from anywhere with or without insurance."
          />
          <meta
            property="og:image"
            content="https://api.getzealthy.com/storage/v1/object/public/images/social-share.jpg"
          />
          <meta
            property="og:image_url"
            content="https://api.getzealthy.com/storage/v1/object/public/Zealthy-Mobile.png"
          />
          <meta property="og:image:type" content="image/jpeg"></meta>
          <meta property="og:image:width" content="730" />
          <meta property="og:image:height" content="378" />

          <link rel="manifest" href="/site.webmanifest" />
          <meta name="msapplication-TileColor" content="#00531B" />
          <meta name="theme-color" content="#FFFAF2"></meta>
          <link rel="icon" href="/favicon.ico" />

          <meta name="mobile-web-app-capable" content="yes" />
          <meta name="apple-touch-fullscreen" content="yes" />
          <meta name="apple-mobile-web-app-title" content="Zealthy" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta
            name="apple-mobile-web-app-status-bar-style"
            content="default"
          />

          <link
            rel="apple-touch-icon"
            sizes="180x180"
            href="/apple-touch-icon.png"
          />
          <link
            rel="apple-touch-startup-image"
            media="screen and (device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)"
            href="/splash_screens/iPhone_15_Pro_Max__iPhone_15_Plus__iPhone_14_Pro_Max_landscape.png"
          />
          <link
            rel="apple-touch-startup-image"
            media="screen and (device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)"
            href="/splash_screens/iPhone_15_Pro__iPhone_15__iPhone_14_Pro_landscape.png"
          />
          <link
            rel="apple-touch-startup-image"
            media="screen and (device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)"
            href="/splash_screens/iPhone_14_Plus__iPhone_13_Pro_Max__iPhone_12_Pro_Max_landscape.png"
          />
          <link
            rel="apple-touch-startup-image"
            media="screen and (device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)"
            href="/splash_screens/iPhone_14__iPhone_13_Pro__iPhone_13__iPhone_12_Pro__iPhone_12_landscape.png"
          />
          <link
            rel="apple-touch-startup-image"
            media="screen and (device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)"
            href="/splash_screens/iPhone_13_mini__iPhone_12_mini__iPhone_11_Pro__iPhone_XS__iPhone_X_landscape.png"
          />
          <link
            rel="apple-touch-startup-image"
            media="screen and (device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)"
            href="/splash_screens/iPhone_11_Pro_Max__iPhone_XS_Max_landscape.png"
          />
          <link
            rel="apple-touch-startup-image"
            media="screen and (device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)"
            href="/splash_screens/iPhone_11__iPhone_XR_landscape.png"
          />
          <link
            rel="apple-touch-startup-image"
            media="screen and (device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)"
            href="/splash_screens/iPhone_8_Plus__iPhone_7_Plus__iPhone_6s_Plus__iPhone_6_Plus_landscape.png"
          />
          <link
            rel="apple-touch-startup-image"
            media="screen and (device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)"
            href="/splash_screens/iPhone_8__iPhone_7__iPhone_6s__iPhone_6__4.7__iPhone_SE_landscape.png"
          />
          <link
            rel="apple-touch-startup-image"
            media="screen and (device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)"
            href="/splash_screens/4__iPhone_SE__iPod_touch_5th_generation_and_later_landscape.png"
          />
          <link
            rel="apple-touch-startup-image"
            media="screen and (device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)"
            href="/splash_screens/12.9__iPad_Pro_landscape.png"
          />
          <link
            rel="apple-touch-startup-image"
            media="screen and (device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)"
            href="/splash_screens/11__iPad_Pro__10.5__iPad_Pro_landscape.png"
          />
          <link
            rel="apple-touch-startup-image"
            media="screen and (device-width: 820px) and (device-height: 1180px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)"
            href="/splash_screens/10.9__iPad_Air_landscape.png"
          />
          <link
            rel="apple-touch-startup-image"
            media="screen and (device-width: 834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)"
            href="/splash_screens/10.5__iPad_Air_landscape.png"
          />
          <link
            rel="apple-touch-startup-image"
            media="screen and (device-width: 810px) and (device-height: 1080px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)"
            href="/splash_screens/10.2__iPad_landscape.png"
          />
          <link
            rel="apple-touch-startup-image"
            media="screen and (device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)"
            href="/splash_screens/9.7__iPad_Pro__7.9__iPad_mini__9.7__iPad_Air__9.7__iPad_landscape.png"
          />
          <link
            rel="apple-touch-startup-image"
            media="screen and (device-width: 744px) and (device-height: 1133px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)"
            href="/splash_screens/8.3__iPad_Mini_landscape.png"
          />
          <link
            rel="apple-touch-startup-image"
            media="screen and (device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
            href="/splash_screens/iPhone_15_Pro_Max__iPhone_15_Plus__iPhone_14_Pro_Max_portrait.png"
          />
          <link
            rel="apple-touch-startup-image"
            media="screen and (device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
            href="/splash_screens/iPhone_15_Pro__iPhone_15__iPhone_14_Pro_portrait.png"
          />
          <link
            rel="apple-touch-startup-image"
            media="screen and (device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
            href="/splash_screens/iPhone_14_Plus__iPhone_13_Pro_Max__iPhone_12_Pro_Max_portrait.png"
          />
          <link
            rel="apple-touch-startup-image"
            media="screen and (device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
            href="/splash_screens/iPhone_14__iPhone_13_Pro__iPhone_13__iPhone_12_Pro__iPhone_12_portrait.png"
          />
          <link
            rel="apple-touch-startup-image"
            media="screen and (device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
            href="/splash_screens/iPhone_13_mini__iPhone_12_mini__iPhone_11_Pro__iPhone_XS__iPhone_X_portrait.png"
          />
          <link
            rel="apple-touch-startup-image"
            media="screen and (device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
            href="/splash_screens/iPhone_11_Pro_Max__iPhone_XS_Max_portrait.png"
          />
          <link
            rel="apple-touch-startup-image"
            media="screen and (device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
            href="/splash_screens/iPhone_11__iPhone_XR_portrait.png"
          />
          <link
            rel="apple-touch-startup-image"
            media="screen and (device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
            href="/splash_screens/iPhone_8_Plus__iPhone_7_Plus__iPhone_6s_Plus__iPhone_6_Plus_portrait.png"
          />
          <link
            rel="apple-touch-startup-image"
            media="screen and (device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
            href="/splash_screens/iPhone_8__iPhone_7__iPhone_6s__iPhone_6__4.7__iPhone_SE_portrait.png"
          />
          <link
            rel="apple-touch-startup-image"
            media="screen and (device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
            href="/splash_screens/4__iPhone_SE__iPod_touch_5th_generation_and_later_portrait.png"
          />
          <link
            rel="apple-touch-startup-image"
            media="screen and (device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
            href="/splash_screens/12.9__iPad_Pro_portrait.png"
          />
          <link
            rel="apple-touch-startup-image"
            media="screen and (device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
            href="/splash_screens/11__iPad_Pro__10.5__iPad_Pro_portrait.png"
          />
          <link
            rel="apple-touch-startup-image"
            media="screen and (device-width: 820px) and (device-height: 1180px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
            href="/splash_screens/10.9__iPad_Air_portrait.png"
          />
          <link
            rel="apple-touch-startup-image"
            media="screen and (device-width: 834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
            href="/splash_screens/10.5__iPad_Air_portrait.png"
          />
          <link
            rel="apple-touch-startup-image"
            media="screen and (device-width: 810px) and (device-height: 1080px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
            href="/splash_screens/10.2__iPad_portrait.png"
          />
          <link
            rel="apple-touch-startup-image"
            media="screen and (device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
            href="/splash_screens/9.7__iPad_Pro__7.9__iPad_mini__9.7__iPad_Air__9.7__iPad_portrait.png"
          />
          <link
            rel="apple-touch-startup-image"
            media="screen and (device-width: 744px) and (device-height: 1133px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
            href="/splash_screens/8.3__iPad_Mini_portrait.png"
          />
        </Head>
        <body style={{ height: '100%' }}>
          <noscript
            dangerouslySetInnerHTML={{
              __html: `<iframe src="https://www.googletagmanager.com/ns.html?id=GTM-WD63L7R2"
            height="0" width="0" style="display:none;visibility:hidden"></iframe>`,
            }}
          />
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
