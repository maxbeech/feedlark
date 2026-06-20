import { absoluteUrl } from "@/lib/utils";

// Served at /widget.js, a tiny dependency-free embed. Usage:
//   <script src="https://feedlark.com/widget.js" data-feedlark="your-slug" defer></script>
export async function GET() {
  const origin = absoluteUrl();
  const js = `(function(){
  var s = document.currentScript || (function(){var a=document.getElementsByTagName('script');for(var i=0;i<a.length;i++){if(a[i].src&&a[i].src.indexOf('/widget.js')>-1)return a[i];}})();
  var slug = s && s.getAttribute('data-feedlark');
  if(!slug){ console.warn('[Feedlark] missing data-feedlark slug'); return; }
  var origin = ${JSON.stringify(origin)};
  var label = (s && s.getAttribute('data-label')) || 'Feedback';
  var color = (s && s.getAttribute('data-color')) || '#f26a18';

  var btn = document.createElement('button');
  btn.textContent = label;
  btn.setAttribute('aria-label','Open feedback board');
  btn.style.cssText='position:fixed;bottom:20px;right:20px;z-index:2147483000;background:'+color+';color:#fff;border:none;border-radius:9999px;padding:12px 18px;font:600 14px system-ui,sans-serif;box-shadow:0 6px 20px rgba(0,0,0,.18);cursor:pointer;';

  var overlay = document.createElement('div');
  overlay.style.cssText='position:fixed;inset:0;z-index:2147483001;background:rgba(15,23,41,.5);display:none;align-items:center;justify-content:center;padding:16px;';
  var frameWrap = document.createElement('div');
  frameWrap.style.cssText='width:100%;max-width:760px;height:86vh;background:#fff;border-radius:16px;overflow:hidden;position:relative;box-shadow:0 20px 60px rgba(0,0,0,.3);';
  var close = document.createElement('button');
  close.textContent='✕';
  close.setAttribute('aria-label','Close');
  close.style.cssText='position:absolute;top:8px;right:10px;z-index:2;background:#fff;border:1px solid #e2e8f0;border-radius:9999px;width:30px;height:30px;cursor:pointer;font:600 14px system-ui;';
  var iframe = document.createElement('iframe');
  iframe.style.cssText='width:100%;height:100%;border:0;';
  iframe.loading='lazy';
  frameWrap.appendChild(close); frameWrap.appendChild(iframe); overlay.appendChild(frameWrap);

  function open(){ if(!iframe.src) iframe.src = origin + '/b/' + slug; overlay.style.display='flex'; }
  function shut(){ overlay.style.display='none'; }
  btn.addEventListener('click', open);
  close.addEventListener('click', shut);
  overlay.addEventListener('click', function(e){ if(e.target===overlay) shut(); });

  function mount(){ document.body.appendChild(btn); document.body.appendChild(overlay); }
  if(document.readyState!=='loading') mount(); else document.addEventListener('DOMContentLoaded', mount);
})();`;

  return new Response(js, {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
