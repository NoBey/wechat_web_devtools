"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),require("./hackrequire/index.js");const vm=require("vm"),fs=require("fs"),path=require("path"),inspector=require("inspector"),child_process_1=require("child_process"),WebSocket=require("ws"),nodeSyncIpc=require("node-sync-ipc"),URL=require("url"),childIpc=nodeSyncIpc.child(),noop=()=>{};let networkApiInjected=!1,systemInfoCache=null,usingLocalStorage=!1;const SyncSDKNames={getMenuButtonBoundingClientRect:!0,measureText:!0,getSystemInfo:()=>{return"string"!=typeof systemInfoCache},getSystemInfoSync:()=>{return"string"!=typeof systemInfoCache},getStorage:()=>{return!usingLocalStorage},getStorageSync:()=>{return!usingLocalStorage},setStorage:()=>{return!usingLocalStorage},setStorageSync:()=>{return!usingLocalStorage},removeStorage:!1,removeStorageSync:()=>{return!usingLocalStorage},clearStorage:!1,clearStorageSync:()=>{return!usingLocalStorage},getStorageInfo:!1,getStorageInfoSync:()=>{return!usingLocalStorage},getBackgroundAudioState:!0,setBackgroundAudioState:!0,operateBackgroundAudio:!0,createRequestTask:()=>{return!networkApiInjected},createUploadTask:()=>{return!networkApiInjected},createDownloadTask:()=>{return!networkApiInjected},createSocketTask:()=>{return!networkApiInjected},operateSocketTask:!0,operateDownloadTask:!0,operateUploadTask:!0,operateRequestTask:!0,createAudioInstance:!0,unlink:!0};let managedRequestTaskId=0,managedDownloadTaskId=0,managedUploadTaskId=0,managedSocketTaskId=0;const networkTaskIdRealFakeMap={request:{},download:{},upload:{},socket:{}},networkDatas={request:{},download:{},upload:{},socket:{}};function isSdkSync(a){if(SyncSDKNames.hasOwnProperty(a)){const b=SyncSDKNames[a];return"function"==typeof b?!!b():!!b}return /Sync$/.test(a)}const MAX_SYNC_TIME=60000;let errorsAndWarns=[],isDev="yes"===process.env.isDev;const log=global.log={};let sendLogTimer;isDev?(Object.defineProperty(log,"i",{get(){return console.log.bind(console,"[REMOTE]")}}),Object.defineProperty(log,"w",{get(){return console.warn.bind(console,"[REMOTE]")}}),Object.defineProperty(log,"e",{get(){return console.error.bind(console,"[REMOTE]")}})):(Object.defineProperty(log,"i",{value:noop}),Object.defineProperty(log,"w",{value:function(...a){console.warn(...a),errorsAndWarns.push([...a]),sendLogTimer||(sendLogTimer=setTimeout(()=>{sendLogTimer=void 0;const a={type:"error",data:{error:errorsAndWarns.join("\n")}};errorsAndWarns=[],sendMessageToMaster(a)},0))}}),Object.defineProperty(log,"e",{value:function(...a){console.error(...a),errorsAndWarns.push([...a]),sendLogTimer||(sendLogTimer=setTimeout(()=>{sendLogTimer=void 0;const a={type:"error",data:{error:errorsAndWarns.join("\n")}};errorsAndWarns=[],sendMessageToMaster(a)},0))}})),["dir","tempDir","vendorDir","isDev","files","httpPort","initialInspectPort","dataDir","usingLocalStorage","wsurl"].forEach((a)=>{"string"!=typeof process.env[a]&&(log.e(a,"is not defined in process.env"),process.exit())}),"function"!=typeof process.send&&(log.e("process.send is not available"),process.exit());const{dir,tempDir,vendorDir,dataDir,wsurl}=process.env,files=JSON.parse(process.env.files||"[]");isDev="yes"===process.env.isDev;const httpPort=parseInt(process.env.httpPort,10),initialInspectPort=parseInt(process.env.initialInspectPort,10);usingLocalStorage="yes"===process.env.usingLocalStorage;let debugEnabled=!0;(function(){let a=initialInspectPort;const b=()=>{try{inspector.open(a)}catch(c){++a,b()}};b()})();const timers={};let timerCount=0;const vmGlobal={require:void 0,eval:void 0,process:void 0,setTimeout(...a){const b=global.setTimeout.call(global,...a);if(timers[++timerCount]=b,0==timerCount%5)for(const a in timers){const b=timers[a];b&&!b._repeat&&b._called&&b._destroyed&&delete timers[a]}return timerCount},clearTimeout(a){const b=timers[a];b&&(clearTimeout(b),delete timers[a])},setInterval(...a){const b=global.setInterval.call(global,...a);if(timers[++timerCount]=b,0==timerCount%5)for(const a in timers){const b=timers[a];b&&!b._repeat&&b._called&&b._destroyed&&delete timers[a]}return timerCount},clearInterval(a){const b=timers[a];b&&(clearInterval(b),delete timers[a])},console:(()=>{let a=Object.create(Object.getPrototypeOf(console));const b=Object.getOwnPropertyNames(console);for(const c of b)try{const b=Object.getOwnPropertyDescriptor(console,c);if(b){const d={configurable:!1};b.hasOwnProperty("writable")&&(d.writable=!1),Object.defineProperty(a,c,Object.assign({},b,d))}else a[c]=console[c]}catch(b){a=Object.assign(Object.create(Object.getPrototypeOf(console)),console);break}return a})()},jsVm=vm.createContext(vmGlobal);function sendMessageToMaster(a){ws?ws.send(JSON.stringify(a),(a)=>a&&console.error("[REMOTE] websocket send error",a)):console.warn("[REMOTE] websocket not ready")}function sendDebugMessageToClient(a,b,c,d=!1){const e={type:"sendMessageToClient",data:{category:b,debugObject:a}};return c&&(e.data.extra=c),d?e:sendMessageToMaster(e)}function parseUrl(a){const b=URL.parse(a);return{pathName:(b.pathname||"").replace(/\.html$/,"")}}function updateAppData(){getWXAppDatasTimeout&&clearTimeout(getWXAppDatasTimeout),getWXAppDatasTimeout=setTimeout(handleGetWxAppDatas,200)}function handleRegisterInterface(a){const b={},c=a.obj_methods,d=a.obj_name;for(const e of c){const a=e.method_name,c=e.method_args;b[a]=function(...b){const c=b[0];let e=b[1];const f=parseInt(b[2],10),g=isNaN(f)?0:f,h=(f,g={},h=!1)=>{return sdkResolves[f]={sdkName:c,timeStamp:Date.now(),dataSize:(e||"").length+c.length},sendDebugMessageToClient({name:d,method:a,args:b,call_id:f},"callInterface",g,h)};if(!debugEnabled&&"invokeHandler"===a)return JSON.stringify({errMsg:c+":fail debug invoke no active session"});if("operateSocketTask"===c){const a=JSON.parse(e),c=a.socketTaskId,d=getNetworkRealIdByFakeId(c,"socket");null!==d&&(log.i("operateSocketTask tranform id from",c,"to",d),a.socketTaskId=d,e=JSON.stringify(a),b[1]=e)}else if("operateDownloadTask"===c){const a=JSON.parse(e),c=a.downloadTaskId,d=getNetworkRealIdByFakeId(c,"download");null!==d&&(log.i("operateDownloadTask tranform id from",c,"to",d),a.downloadTaskId=d,e=JSON.stringify(a),b[1]=e)}else if("operateUploadTask"===c){const a=JSON.parse(e),c=a.uploadTaskId,d=getNetworkRealIdByFakeId(c,"upload");null!==d&&(log.i("operateUploadTask tranform id from",c,"to",d),a.uploadTaskId=d,e=JSON.stringify(a),b[1]=e)}else if("operateRequestTask"===c){const a=JSON.parse(e),c=a.requestTaskId,d=getNetworkRealIdByFakeId(c,"request");null!==d&&(log.i("operateRequestTask tranform id from",c,"to",d),a.requestTaskId=d,e=JSON.stringify(a),b[1]=e)}if("invokeHandler"===a&&isSdkSync(c)){const a=h(g,{is_sync:!0,timestamp:Date.now(),sdkName:c,len:(e||"").length+c.length},!0);try{const b=childIpc.sendSync("sdksyncapi",a);if(reportSDKAPI(g,b&&b.result&&b.result.length||0),!b||b.error)throw b&&b.error;if(("getSystemInfo"===c||"getSystemInfoSync"===c)&&b.result){const a=JSON.parse(b.result);/^getSystemInfo(Sync)?\:ok/i.test(a.errMsg)&&(systemInfoCache=b.result,log.i("systemInfoCache cached."))}return b.result}catch(a){return JSON.stringify({errMsg:`${c}:fail ${a}`})}}else{if("invokeHandler"===a&&"createRequestTask"===c){const a=JSON.parse(e)||{},b=++managedRequestTaskId;return networkDatas.request[g]={id:b+"",api:"request",info:{url:a.url,method:a.method||"GET",data:a.data||a.formData||void 0},state:"requestSent",data:null},h(g),JSON.stringify({errMsg:`${c}:ok`,requestTaskId:b+""})}if("invokeHandler"===a&&"createDownloadTask"===c){const a=++managedDownloadTaskId,b=JSON.parse(e)||{};return networkDatas.download[g]={id:a+"",api:"download",info:{url:b.url,method:b.method||"GET",data:b.data||b.formData||void 0},state:"requestSent",data:null},h(g),JSON.stringify({errMsg:`${c}:ok`,downloadTaskId:a+""})}if("invokeHandler"===a&&"createUploadTask"===c){const a=++managedUploadTaskId,b=JSON.parse(e)||{};return networkDatas.upload[g]={id:a+"",api:"upload",info:{url:b.url,method:b.method||"POST",data:b.data||b.formData||void 0},state:"requestSent",data:null},h(g),JSON.stringify({errMsg:`${c}:ok`,uploadTaskId:a+""})}if("invokeHandler"===a&&"createSocketTask"===c){const a=++managedSocketTaskId,b=JSON.parse(e)||{};return networkDatas.socket[g]={id:a+"",api:"socket",info:{url:b.url,data:b.data||b.formData||void 0},state:"requestSent",data:null},h(g),JSON.stringify({errMsg:`${c}:ok`,socketTaskId:a+""})}if("invokeHandler"===a&&"getSystemInfo"===c||"getSystemInfoSync"===c)return systemInfoCache;if(usingLocalStorage&&"invokeHandler"===a&&("getStorage"===c||"getStorageSync"===c||"setStorage"===c||"setStorageSync"===c||"removeStorage"===c||"removeStorageSync"===c||"clearStorage"===c||"clearStorageSync"===c||"getStorageInfo"===c||"getStorageInfoSync"===c)){const a=h(g,{is_sync:!0,timestamp:Date.now(),sdkName:c,len:(e||"").length+c.length},!0);try{const b=childIpc.sendSync("sdkstorageapi",a);if(reportSDKAPI(g,b&&b.result&&b.result.length||0),!b||b.error)throw b&&b.error;return b.result}catch(a){return JSON.stringify({errMsg:`${c}:fail ${a}`})}}else{if("invokeHandler"===a&&"sendAutoMessage"===c){const a=h(g,{is_sync:!0,timestamp:Date.now(),sdkName:c,len:(e||"").length+c.length},!0),b=childIpc.sendSync("sdkautoapi",a);return b.result}if("invokeHandler"===a&&("navigateTo"===c||"redirectTo"===c||"switchTab"===c||"reLaunch"===c)){try{systemInfoCache=null}catch(a){log.e("[REMOTE] load subpackage failed",a)}return void h(g,{len:(e||"").length+c.length})}if("publishHandler"===a){try{if(c.endsWith("invokeWebviewMethod")){const a=JSON.parse(e),b=a.data.name;"appDataChange"===b&&updateAppData()}else(c.endsWith("vdSync")||c.endsWith("vdSyncBatch")||c.endsWith("appDataChange")||c.endsWith("pageInitData")||c.endsWith("__updateAppData"))&&updateAppData()}catch(a){}return void h(g,{len:(e||"").length})}return void h(g,{len:(e||"").length+c.length})}}}}vmGlobal[d]=b}let vmCounter=0;function handleEvaluateJavascript(a){const b=";"+a.script+"\n;",c=parseInt(a.evaluate_id+"",10);let d;try{vmCounter=50<=vmCounter?0:vmCounter+1,d=vm.runInContext(b,jsVm,{filename:"[VM "+vmCounter+"]"})}catch(a){d=void 0,log.e("eval script",`evaluate_id #${c}`,"failed",a)}if("object"==typeof d||"undefined"==typeof d)d="";else try{d=JSON.stringify(d)}catch(a){d="",log.e("stringify ret failed",a)}if(!isNaN(c)){const a={evaluate_id:c,ret:d};sendDebugMessageToClient(a,"evaluateJavascriptResult",{len:(d||"").length})}}let sdkResolves={},sdkReports=[],invokeCounter=0;function reportSDKAPI(a,b){if(sdkResolves[a]){const c=sdkResolves[a],d=Date.now()-c.timeStamp,e={cost_time:d,sdk_name:c.sdkName,data_size:c.dataSize,call_id:a,ret_data_size:b};sdkReports.push(e),++invokeCounter,0==invokeCounter%10&&(invokeCounter=0,sendSDKAPIReport())}}let sdkApiReportTimer;function sendSDKAPIReport(){sdkApiReportTimer||(sdkApiReportTimer=setTimeout(()=>{sdkApiReportTimer=void 0;const a={type:"sdkapireport",data:sdkReports.slice(0,100)};sendMessageToMaster(a),sdkReports=[],sdkResolves={}},3e4))}function handleCallInterfaceResult(a){let b={};const c=a&&a.ret&&a.ret.length||0;try{b=JSON.parse(a.ret)}catch(c){log.e("error parsing call interface result",a),b={}}const d=parseInt(a.call_id+"",10),e=isNaN(d)?0:d;if(reportSDKAPI(e,c),vmGlobal.WeixinJSBridge&&"function"==typeof vmGlobal.WeixinJSBridge.invokeCallbackHandler){if(networkApiInjected&&networkDatas.request[e]&&b.requestTaskId){if(networkTaskIdRealFakeMap.request[b.requestTaskId]=networkDatas.request[e].id,exchangeGetNetworkRequestInfos[b.requestTaskId]){const a=exchangeGetNetworkRequestInfos[b.requestTaskId]||[];handleMasterExchange(a[0],a[1],a[2]),log.i("reinvoke exchange",a),delete exchangeGetNetworkRequestInfos[b.requestTaskId]}}else if(networkApiInjected&&networkDatas.download[e]&&b.downloadTaskId){if(networkTaskIdRealFakeMap.download[b.downloadTaskId]=networkDatas.download[e].id,exchangeGetNetworkRequestInfos[b.downloadTaskId]){const a=exchangeGetNetworkRequestInfos[b.downloadTaskId]||[];handleMasterExchange(a[0],a[1],a[2]),delete exchangeGetNetworkRequestInfos[b.downloadTaskId]}}else if(networkApiInjected&&networkDatas.upload[e]&&b.uploadTaskId){if(networkTaskIdRealFakeMap.upload[b.uploadTaskId]=networkDatas.upload[e].id,exchangeGetNetworkRequestInfos[b.uploadTaskId]){const a=exchangeGetNetworkRequestInfos[b.uploadTaskId]||[];handleMasterExchange(a[0],a[1],a[2]),delete exchangeGetNetworkRequestInfos[b.uploadTaskId]}}else if(networkApiInjected&&networkDatas.socket[e]&&b.socketTaskId&&(networkTaskIdRealFakeMap.socket[b.socketTaskId]=networkDatas.socket[e].id,exchangeGetNetworkRequestInfos[b.socketTaskId])){const a=exchangeGetNetworkRequestInfos[b.socketTaskId]||[];handleMasterExchange(a[0],a[1],a[2]),delete exchangeGetNetworkRequestInfos[b.socketTaskId]}const a=vmGlobal.WeixinJSBridge.invokeCallbackHandler;a.call(vmGlobal.WeixinJSBridge,e,b)}else log.e("vmGlobal.WeixinJSBridge.invokeCallbackHandler is not valid")}function handleDebugEnable(a){debugEnabled=!!a.enabled}function handleInitPubLib(a){const b="WAService.js";let c,d="";try{if(d=path.join(tempDir,b),!fs.existsSync(d)){log.e("publibFilePath not found");const a=JSON.parse(fs.readFileSync(path.join(__dirname,"../vendor/config.json"),"utf-8").toString()).currentLibVersion;d=path.join(__dirname,"../vendor",a,b)}let e=fs.readFileSync(d,"utf-8").toString();if(a){e=fs.readFileSync(path.join(tempDir,"WAAutoService.js"),"utf8").toString()+e}c=vm.runInContext(e,jsVm,{filename:"[publib]"});try{vmGlobal.console=console}catch(a){log.i(a)}loadCode("","[__WXWorkerHelper__]",`
      ;(function () {
        const logNotSupport = function() {
          console.group(new Date(), 'Worker 调试')
          console.error('远程调试暂不支持 Worker 调试，请使用模拟器或真机预览进行调试。')
          console.groupEnd()
        }
        const notSupport = {
          postMessage() {
            logNotSupport()
          },
          onMessage() {
            logNotSupport()
          },
        }
        try {
          Object.defineProperty((typeof wx === 'object' ? wx : {}), 'createWorker', {
            get() {
              return function() {
                logNotSupport()
                return notSupport
              }
            },
          })
        } catch (e) {
          // ignore
        }
      })();
    `)}catch(a){log.e("error run publib",a)}finally{const a=encodeURIComponent(d);loadCode("","[__publibRunErrorHelper__]",`
      ;(function () {
        if (typeof define !== 'function') {
          console.group((new Date()).toLocaleString() + "执行公共库异常");
          console.warn("执行公共库可能发生了错误。请尝试退出所有项目并重新启动计算机，然后再试一次。\\n参考文章： https://developers.weixin.qq.com/community/develop/doc/000cca451006984364d8a94c351808");
          console.log("以下是可能有用的信息:");
          console.log({
            publibFilePath: decodeURIComponent("${a}"),
            __wxConfig: typeof __wxConfig === 'undefined' ? {} : __wxConfig,
          });
          console.groupEnd();
        }
      })();
    `)}return c}function trailing(a,b){return a.endsWith(b)?a:a+b}function leading(a,b){return a.startsWith(b)?a:b+a}let appJson=null;function handleInitUserCode(){let a;try{for(const b of files){if(!b)continue;const c=path.join(dir,b);if("app.json"===b){const a=fs.readFileSync(c,"utf-8").toString();appJson=JSON.parse(a)}else".js"===path.extname(c).toLowerCase()?a=loadCode(c):console.warn("[REMOTE] load invalid file",b)}}catch(a){}return a}function loadCode(a,b,c){let d;try{const e="string"==typeof c?c:fs.readFileSync(a,"utf-8").toString();d=vm.runInContext(e,jsVm,{filename:b})}catch(a){console.error(a)}return d}function getSubpackageRootForPath(a){if(!appJson||!appJson.subPackages)return null;for(const b of appJson.subPackages)if(0===a.indexOf(trailing(b.root,"/")))return b.root;return null}const subpackageLoaded={};function loadSubpackage(a){if(subpackageLoaded[a]||!appJson||!appJson.subPackages)return;let b=null;const c=trailing(a,"/");for(const d of appJson.subPackages)if(trailing(d.root,"/")===c){b=d;break}if(b){subpackageLoaded[a]=!0;for(const a of files)if(a&&".js"===path.extname(a).toLowerCase()&&0===a.indexOf(c)){const b=path.join(dir,a);loadCode(b)}}}function sendNetworkDebug(a,b){const c={type:"networkdebug",data:a,timestamp:b};log.i("sending network debug",c,b),sendMessageToMaster(c)}function plainCopy(a){return JSON.parse(JSON.stringify(a))}function onRequestTaskStateChange(a){const b=a[1]||{},c=(a[3]||{}).nativeTime||Date.now(),d=getNetworkDebugByRealId(b.requestTaskId,"request");if(!d)return void log.w("onRequestTaskStateChange",b.requestTaskId,"not found");if("headersReceived"===b.state){d.responseHeaders=plainCopy(b.header),d.state="headersReceived";const a={id:b.requestTaskId,api:"request",responseHeaders:b.header,state:"headersReceived"};sendNetworkDebug(a,c)}else if("success"===b.state){d.state="success",d.data=b.data,d.statusCode=b.statusCode,d.statusText=b.statusText;const a={id:b.requestTaskId,state:"success",api:"request",statusCode:b.statusCode,statusText:b.statusText,dataLength:(b.data||"").length};sendNetworkDebug(a,c)}else if("fail"===b.state){d.state="fail",d.statusCode=d.statusCode||b.statusCode;const a={id:b.requestTaskId,api:"request",state:"fail"};sendNetworkDebug(a,c)}}function onDownloadTaskStateChange(a){const b=a[1]||{},c=(a[3]||{}).nativeTime||Date.now(),d=getNetworkDebugByRealId(b.downloadTaskId,"download");if(!d)return void log.w("onDownloadTaskStateChange",b.downloadTaskId,"not found");if("headersReceived"===b.state){d.responseHeaders=plainCopy(b.header),d.state="headersReceived";const a={id:b.downloadTaskId,api:"download",responseHeaders:b.header,state:"headersReceived"};sendNetworkDebug(a,c)}else if("progressUpdate"===b.state){d.state="dataReceived",d.dataLength=b.totalBytesWritten;const a={id:b.downloadTaskId,state:"dataReceived",dataLength:b.totalBytesWritten,api:"download"};sendNetworkDebug(a,c)}else if("success"===b.state){d.state="success",d.data="number"==typeof d.dataLength?`Saved ${d.dataLength} Bytes at "${b.tempFilePath}"`:`Saved at ${b.tempFilePath}`,d.statusCode=b.statusCode,d.statusText=b.statusText;const a={id:b.downloadTaskId,state:"success",api:"download",statusCode:b.statusCode,statusText:b.statusText};sendNetworkDebug(a,c)}else if("fail"===b.state){d.state="fail",d.statusCode=d.statusCode||b.statusCode;const a={id:b.downloadTaskId,api:"download",state:"fail"};sendNetworkDebug(a,c)}}function onUploadTaskStateChange(a){const b=a[1]||{},c=(a[3]||{}).nativeTime||Date.now(),d=getNetworkDebugByRealId(b.uploadTaskId,"upload");if(!d)return void log.w("onUploadTaskStateChange",b.uploadTaskId,"not found");if("headersReceived"===b.state){d.responseHeaders=plainCopy(b.header),d.state="headersReceived";const a={id:b.uploadTaskId,api:"upload",responseHeaders:b.header,state:"headersReceived"};sendNetworkDebug(a,c)}else if("progressUpdate"===b.state){d.state="dataSent",d.dataLength=b.totalBytesSent;const a={id:b.uploadTaskId,state:"dataSent",dataLength:b.totalBytesSent,api:"upload"};sendNetworkDebug(a,c)}else if("success"===b.state){d.state="success",d.data=b.data,d.statusCode=b.statusCode,d.statusText=b.statusText;const a={id:b.uploadTaskId,state:"success",api:"upload",statusCode:b.statusCode,statusText:b.statusText,dataLength:(b.data||"").length};sendNetworkDebug(a,c)}else if("fail"===b.state){d.state="fail",d.statusCode=d.statusCode||b.statusCode;const a={id:b.uploadTaskId,api:"upload",state:"fail"};sendNetworkDebug(a,c)}}function onSocketTaskStateChange(a){const b=a[1]||{},c=(a[3]||{}).nativeTime||Date.now(),d=getNetworkDebugByRealId(b.socketTaskId,"socket");if(!d)return void log.w("onSocketTaskStateChange",b.socketTaskId,"not found");if("open"===b.state){d.responseHeaders=plainCopy(b.header),d.state="headersReceived";const a={id:b.socketTaskId,api:"socket",responseHeaders:b.header,state:"headersReceived",websocketState:"open"};sendNetworkDebug(a,c)}else if("close"===b.state){d.state="success",d.statusCode=b.statusCode,d.statusText=b.statusText;const a={id:b.socketTaskId,state:"success",api:"socket",statusCode:b.statusCode,statusText:b.statusText,websocketState:"close"};sendNetworkDebug(a,c)}else if("error"===b.state){d.state="fail",d.statusCode=d.statusCode||b.statusCode;const a={id:b.socketTaskId,api:"socket",websocketState:"error",state:"fail"};sendNetworkDebug(a,c)}}let getCurrentPages=vmGlobal.getCurrentPages||null;const savedWebviewIds=new Set;function handleSetupContext(a){const b=a.register_interface;handleRegisterInterface(b);const c=a.configure_js||"";if(handleEvaluateJavascript({script:c}),loadCode("","[__InitHelper__]",`var __wxAppData = __wxAppData || {};
    var __wxRoute;
    var __wxRouteBegin;
    var __wxAppCode__ = __wxAppCode__ || {};
    var __wxAppCurrentFile__;
    var Component = Component || function() {};
    var Behavior = Behavior || function() {};
    var definePlugin = definePlugin || function() {};
    var requirePlugin = requirePlugin || function() {};
    var global = global || {};
    var __workerVendorCode__ = __workerVendorCode__ || {};
    var __workersCode__ = __workersCode__ || {};
    var WeixinWorker = WeixinWorker || {}
    var __WeixinWorker = WeixinWorker
    var __initHelper = 1;
    var $gwx;`),loadCode("","[__NoIsolateContext__]",`
    var __wxConfig = __wxConfig || {};
    if (__wxConfig.isIsolateContext) {
        delete __wxConfig.isIsolateContext;
        Object.defineProperty(__wxConfig, 'isIsolateContext', {
            get() { return false; },
            set() {},
            enumerable: true,
            configurable: true,
        });
    }
  `),loadCode(path.join(tempDir,"wxmlxcjs.js")),loadCode(path.join(tempDir,"wxappcode.js")),handleInitPubLib(!!a.is_auto_enabled),loadCode(path.join(tempDir,"wxplugincode.js")),vmGlobal.WeixinJSBridge&&"function"==typeof vmGlobal.WeixinJSBridge.subscribeHandler){const a=vmGlobal.WeixinJSBridge.subscribeHandler;getCurrentPages=vmGlobal.getCurrentPages||null,Object.defineProperty(vmGlobal.WeixinJSBridge,"subscribeHandler",{value:function(...b){if("onAppRouteResized"===b[0]||"onViewDidResize"===b[0])systemInfoCache=null;else if("onRequestTaskStateChange"===b[0]&&b[1]&&b[1].requestTaskId){onRequestTaskStateChange(b);const a=b[1].requestTaskId;networkTaskIdRealFakeMap.request[a]&&(b[1].requestTaskId=networkTaskIdRealFakeMap.request[a])}else if("onDownloadTaskStateChange"===b[0]&&b[1]&&b[1].downloadTaskId){onDownloadTaskStateChange(b);const a=b[1].downloadTaskId;networkTaskIdRealFakeMap.download[a]&&(b[1].downloadTaskId=networkTaskIdRealFakeMap.download[a])}else if("onUploadTaskStateChange"===b[0]){onUploadTaskStateChange(b);const a=b[1].uploadTaskId;networkTaskIdRealFakeMap.upload[a]&&(b[1].uploadTaskId=networkTaskIdRealFakeMap.upload[a])}else if("onSocketTaskStateChange"===b[0]){onSocketTaskStateChange(b);const a=b[1].socketTaskId;networkTaskIdRealFakeMap.socket[a]&&(b[1].socketTaskId=networkTaskIdRealFakeMap.socket[a])}else if("onAppRouteDone"===b[0]){const a="function"==typeof(getCurrentPages||vmGlobal.getCurrentPages)?getCurrentPages||vmGlobal.getCurrentPages:noop,b=a.call(vmGlobal);if(Array.isArray(b)&&0<b.length&&b.every((a)=>{return"number"==typeof(a||{}).__wxWebviewId__})){b.forEach((a)=>{savedWebviewIds.add(a.__wxWebviewId__)});const a={type:"wxpagesinfo",data:{currentWebviewId:b[b.length-1].__wxWebviewId__,webviewIds:Array.from(savedWebviewIds)}};sendMessageToMaster(a)}}else if("onAppRoute"===b[0]){const a=b[1];if(a)if("navigateBack"===a.openType){const a=b[2];savedWebviewIds.clear(),savedWebviewIds.add(a),updateAppData()}else"reLaunch"===a.openType||"autoReLaunch"===a.openType||"redirectTo"===a.openType||"appLaunch"===a.openType?(savedWebviewIds.clear(),updateAppData()):"switchTab"===a.openType&&updateAppData()}return a.call(vmGlobal.WeixinJSBridge,...b)}}),log.i("subscribeHandler injected"),networkApiInjected=!0}else log.w("subscribeHandler injected failed");fs.existsSync(path.join(tempDir,"wacloud.js"))&&loadCode(path.join(tempDir,"wacloud.js"));const d=a.three_js_md5;handleInitUserCode(d)}let getWXAppDatasTimeout;function handleProcessMessage(a){return a?void("handleSetupContext"===a.type?handleSetupContext(a.data):"handleEvaluateJavascript"===a.type?handleEvaluateJavascript(a.data):"handleCallInterfaceResult"===a.type?handleCallInterfaceResult(a.data):"debugEnable"===a.type?handleDebugEnable(a.data):"getWXAppDatas"===a.type?updateAppData():"setWXAppDatas"===a.type?handleSetWxAppDatas(a.data):"exchange"===a.type?handleMasterExchange(a.id,a.command,a.data):log.e("unrecognized message from master",a)):void log.e("invalid master message",a)}function getNetworkDebugByRealId(a,b){const c=(b||"").toLowerCase(),d=networkTaskIdRealFakeMap[c],e=networkDatas[c];if(d&&d.hasOwnProperty(""+a)&&e){const b=d[a];return getNetworkDebugByFakeId(b,c)}return null}function getNetworkDebugByFakeId(a,b){let c=null;const d=(b||"").toLowerCase(),e=networkDatas[d];if(!e)return null;for(const d in e)if(e[d].id===a){c=e[d];break}return c}function getNetworkRealIdByFakeId(a,b){const c=(b||"").toLowerCase(),d=networkTaskIdRealFakeMap[c];if(!d)return null;for(const c in d)if(d[c]===a)return c;return null}const exchangeGetNetworkRequestInfos={};function handleMasterExchange(a,b,c){if("getNetworkRequestInfo"===b){if(!c||!a)return void log.w("invalid getNetworkRequestInfo, data =",c);const d=c.id,e=c.api,f=getNetworkDebugByRealId(d,e);if(f){const b={type:"exchange",id:a,result:f.info};sendMessageToMaster(b)}else log.i("exchange",b,d,e,"not found, push to queue."),exchangeGetNetworkRequestInfos[d]=Array.from(arguments)}else if("getNetworkResponseBody"===b){if(!c||!a)return void log.w("invalid getNetworkRequestInfo, data =",c);log.i("obtaining network response body",c);const b=c.id,d=c.api,e=getNetworkDebugByRealId(b,d);if(e){const b={type:"exchange",id:a,result:e.data};sendMessageToMaster(b)}}else if("resetNetworkCache"===b)for(const a in networkDatas){if(!networkDatas.hasOwnProperty(a))continue;const b=networkDatas[a];for(const a in b){if(!b.hasOwnProperty(a))continue;const c=b[a];("success"===c.state||"fail"===c.state)&&(log.i("deleting network cache",c),delete c.data,delete c.info,delete c.responseHeaders)}}else log.w("invalid exchange command",b)}function handleGetWxAppDatas(){getWXAppDatasTimeout&&clearTimeout(getWXAppDatasTimeout),getWXAppDatasTimeout=void 0;const a="function"==typeof(getCurrentPages||vmGlobal.getCurrentPages)?getCurrentPages||vmGlobal.getCurrentPages:null;if(a){const b=a.call(vmGlobal),c={};for(const a of b)a&&(a.__route__||a.route)&&(c[a.__route__||a.route]=Object.assign({},a.data||{},{__webviewId__:a.__wxWebviewId__}));sendMessageToMaster({type:"wxappdatas",data:c})}}function handleSetWxAppDatas(a){const b="function"==typeof(getCurrentPages||vmGlobal.getCurrentPages)?getCurrentPages||vmGlobal.getCurrentPages:null;if(!b)return;const c={},d=b.call(vmGlobal);for(const b in d.forEach((a)=>{c[a.__route__||a.route]=a}),a){const d=a[b],e=d.__webviewId__;c[b]&&"function"==typeof c[b].setData?c[b].setData(d):vmGlobal.wx&&"function"==typeof vmGlobal.wx.invokeWebviewMethod&&vmGlobal.wx.invokeWebviewMethod.call(vmGlobal.wx,{name:"appDataChange",args:{data:d}})}}process.on("uncaughtException",(a)=>{log.e("uncaughtException",a),console.error("uncaughtException",a);sendMessageToMaster({type:"error",data:{error:a}})}),process.on("disconnect",(...a)=>{console.error("[process] disconnect",...a)}),process.on("unhandledRejection",(...a)=>{console.warn("[process] unhandledRejection",...a)}),process.on("beforeExit",(...a)=>{console.warn("[process] beforeExit",...a)}),process.on("exit",(...a)=>{console.warn("[process] exit",...a)});function notifyMaster(){sendMessageToMaster({type:"vmReady",data:{inspectUrl:inspector.url()}})}let ws;function initWs(){if(ws){ws.removeAllListeners();try{ws.close()}catch(a){}}ws=new WebSocket(wsurl,"cp"),ws.on("open",notifyMaster),ws.on("message",(a)=>{if("string"==typeof a)try{const b=JSON.parse(a);handleProcessMessage(b)}catch(b){log.e("error parsing cp ws message",a)}else if(a&&a.data)try{const b=JSON.parse(a.data);handleProcessMessage(b)}catch(b){log.e("error parsing cp ws message",a.data)}else log.w("invalid cp ws message",a)}),ws.on("close",(a,b)=>{"500"===a+""?setTimeout(initWs,100):(console.error("[REMOTE] websocket close",a,b),process.exit())}),ws.on("error",(a)=>{console.error("[REMOTE] websocket error",a),setTimeout(initWs,100)}),global.ws=ws}setTimeout(initWs,0);const isMac="darwin"===process.platform;let descriptors={};isDev?(descriptors={_dir:{get(){child_process_1.exec(`${isMac?"open":"explorer"} "${dir}"`)},enumerable:!1},_tmp:{get(){child_process_1.exec(`${isMac?"open":"explorer"} "${tempDir}"`)},enumerable:!1},_log:{get(){child_process_1.exec(`${isMac?"open":"explorer"} "${dir}/../../log/"`)},enumerable:!1}},global.jsVM=jsVm):descriptors={__dir:{get(){child_process_1.exec(`${isMac?"open":"explorer"} "${path.join(dir,"../../")}"`)},enumerable:!1,configurable:!0}},Object.defineProperties(global,descriptors),Object.defineProperties(vmGlobal,descriptors);