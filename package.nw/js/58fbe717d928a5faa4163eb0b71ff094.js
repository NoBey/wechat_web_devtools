'use strict';var _extends=Object.assign||function(a){for(var b,c=1;c<arguments.length;c++)for(var d in b=arguments[c],b)Object.prototype.hasOwnProperty.call(b,d)&&(a[d]=b[d]);return a};!function(require,directRequire){const a=require('react'),b=require('redux'),c=require('./a8c87029da0fa06e986298d447ab0fe2.js'),d=require('./cc2c2970ff81ae4a83123e81ee123da2.js'),e=require('./ba23d8b47b1f4ea08b9fd49939b9443f.js'),f=require('./d3976cc01aeebc5b09e11c4135b6bd8d.js'),g=require('./9fdd4ac31a05c27355910f0d74accd4c.js'),h=require('./3c55dff3626a3ee184d599f076158345.js'),i=require('classnames'),j=require('./3b5f8e2469c474c8d433c1c6926d8999.js'),k=require('./6242f55dbdfe53c2f07b7a51568311f2.js'),l=require('./875171e7b864aa58d026d4fa0999fbd1.js'),m=require('./da7c31daaf542cf1796023d8e344b98a.js'),{connect:n}=require('react-redux');class o extends a.Component{constructor(a){super(a),this.state=this.resetState(a)}componentDidMount(){}componentWillReceiveProps(a){let b={};if(a.show&&(b.lazyLoaded=!0),a.sceneMap!=this.props.sceneMap){let c=this.state.scene;b.sceneWording=`${c}: ${a.sceneMap[c]}`,b.miniProgramOptionsShow=c==k.SCENE_MINI_PROGRAM||c==k.SCENE_MINI_PROGRAM_BACK,b.groupFormShow=c==k.SCENE_SHARE_TICKET}a.id!=this.props.id&&(b=_extends({},b,this.resetState(a))),a.pathName!=this.props.pathName&&(b.pathName=a.data.pathName||a.pathName),a.show!=this.props.show&&(b.show=a.show,b=_extends({},b,this.resetState(a))),a.simulateUpdate!=this.props.simulateUpdate&&(b.simulateUpdate=a.simulateUpdate),this.setState(b)}resetState(a){let b=a.data.scene,c=a.data.shareInfo,d=a.sceneMap[b],e=b==k.SCENE_MINI_PROGRAM||b==k.SCENE_MINI_PROGRAM_BACK,f=b==k.SCENE_SHARE_TICKET;return _extends({lazyLoaded:a.show,pathName:a.pathName,sceneWording:d&&`${b}: ${d}`,groupWording:c&&c.groupName||'',miniProgramOptionsShow:e,groupFormShow:f},a.data)}getSceneWording(){}onInputChange(a){let b=a.currentTarget,c=b.dataset,d=c.type;this.setState({[d]:b.value})}onClose(){this.setState({show:!1})}onConfirm(){if(!this.state.name)return void this.refs.nameInput.focus();let a=this.state.pathName||this.props.pages[0],b=this.state.scene,c={id:this.props.id,name:this.state.name,pathName:a,query:this.state.query,scene:b};b==k.SCENE_SHARE_TICKET&&(c.shareInfo=this.state.shareInfo),this.props.projectActions.setCompileCondiction(c),this.props.simulatorActions.setSimulateUpdate(this.state.simulateUpdate),this.onClose(),m('weapp_add_debugproto',this.props.project.appid)}onDelete(){this.props.projectActions.removeCompileCondiction({id:this.props.id}),this.onClose(),m('weapp_del_debugproto',this.props.project.appid)}onSceneDropDownClick(a){a.stopPropagation();let b=a.currentTarget.getBoundingClientRect(),c=this.refs.sceneInput.value,d=this.props.sceneList.map((a)=>{return`${a.value}: ${a.name}`}),e=d.filter((a)=>{return 0<=a.indexOf(c)});this.setState({dropDownHeight:300,dropDownLeft:b.left,dropDownTop:b.top+b.height,dropDownShow:!0,dropDownType:'scene',dropDownList:e})}onAllSceneDropDownClick(a){a.stopPropagation();let b=a.currentTarget.getBoundingClientRect(),c=this.props.sceneList.map((a)=>{return`${a.value}: ${a.name}`});this.setState({dropDownHeight:300,dropDownLeft:b.left-437,dropDownTop:b.top+b.height,dropDownShow:!0,dropDownType:'scene',dropDownList:c})}onPageSelect(a){this.setState({pathName:this.state.dropDownList[a],dropDownShow:!1})}onSceneSelect(a){let b=this.state.dropDownList[a],c=b.split(': ')[0],d=c==k.SCENE_MINI_PROGRAM||c==k.SCENE_MINI_PROGRAM_BACK,e=c==k.SCENE_SHARE_TICKET;this.setState({scene:c,sceneWording:b,dropDownShow:!1,groupFormShow:e,miniProgramOptionsShow:d})}onGroupDropDownClick(a){a.stopPropagation();let b=a.currentTarget.getBoundingClientRect(),c=this.props.groupList.map((a)=>{return`${a.room_topic}`});this.setState({dropDownHeight:'auto',dropDownLeft:b.left,dropDownTop:b.top,dropDownShow:!0,dropDownType:'group',dropDownList:c})}onGroupSelect(a){let b=this.props.groupList[a],c=b.room_topic;this.setState({shareInfo:{groupName:c,shareName:b.share_name,shareKey:b.share_key},groupWording:c,dropDownShow:!1})}onDropDownSelect(a,b){'group'==a?this.onGroupSelect(b):'scene'==a?this.onSceneSelect(b):'page'==a&&this.onPageSelect(b)}changeExtraData(a){let b=a.target.value,c='';try{JSON.parse(b)}catch(a){c='\u89E3\u6790\u9519\u8BEF\uFF0C'+a}this.setState({extraData:b,extraDataErr:c})}onContainerClick(a){a.stopPropagation(),this.setState({dropDownShow:!1})}onPagePathChange(a){let b=a.currentTarget.value,c=this.props.pages.filter((a)=>{return 0<=a.indexOf(b)});this.setState({pathName:b,dropDownList:c})}onSceneChange(a){let b=a.currentTarget.value,c=this.props.sceneList.map((a)=>{return`${a.value}: ${a.name}`}),d=c.filter((a)=>{return 0<=a.indexOf(b)});this.setState({sceneWording:b,dropDownList:d})}onAnimationOut(){this.props.setCustomCompile({show:!1})}onSimulateUpdateChange(){this.setState({simulateUpdate:!this.state.simulateUpdate})}render(){if(!this.state.lazyLoaded)return null;let b=this.props,c={display:-1==b.id?'none':''};return a.createElement('div',{onClick:this.onContainerClick.bind(this),style:{display:this.props.show?'':'none',height:'100%',width:'100%',position:'absolute',zIndex:1e3}},a.createElement(h,{width:455,left:this.state.dropDownLeft,top:this.state.dropDownTop,show:this.state.dropDownShow,list:this.state.dropDownList,height:this.state.dropDownHeight,onSelectClick:this.onDropDownSelect.bind(this,this.state.dropDownType)}),a.createElement(l,{show:this.state.show,inClassName:'ui-animate-pull-down ui-dialog',outClassName:'ui-animate-pull-up ui-dialog',onAnimationOut:this.onAnimationOut.bind(this),style:{width:600,marginLeft:-300}},a.createElement('div',{className:'ui-dialog-hd'},a.createElement('h3',{className:'ui-dialog-title'},'\u81EA\u5B9A\u4E49\u7F16\u8BD1\u6761\u4EF6')),a.createElement('div',{className:'ui-dialog-bd'},a.createElement('div',{className:'ui-form'},a.createElement('div',{className:'ui-form-item ui-form-item-inline'},a.createElement('label',{className:'ui-form-label'},'\u6A21\u5F0F\u540D\u79F0'),a.createElement('div',{className:'ui-form-controls'},a.createElement('div',{className:'ui-input-box'},a.createElement('input',{type:'text',"data-type":'name',ref:'nameInput',value:this.state.name,onChange:this.onInputChange.bind(this),className:'ui-input'})))),a.createElement('div',{className:'ui-form-item ui-form-item-inline'},a.createElement('label',{className:'ui-form-label'},'\u542F\u52A8\u53C2\u6570'),a.createElement('div',{className:'ui-form-controls'},a.createElement('div',{className:'ui-selector ui-selector-primary'},a.createElement('input',{className:'ui-selector-input',value:this.state.query,"data-type":'query',placeholder:'\u5982\uFF1Aname=vendor&color=black',onChange:this.onInputChange.bind(this)})))),a.createElement('div',{className:'ui-form-item ui-form-item-inline'},a.createElement('label',{className:'ui-form-label'},'\u8FDB\u5165\u573A\u666F'),a.createElement('div',{className:'ui-form-controls',onClick:this.onSceneDropDownClick.bind(this)},a.createElement('div',{className:'ui-selector ui-selector-default'},a.createElement('input',{className:'ui-selector-input',ref:'sceneInput',placeholder:'\u9ED8\u8BA4',value:this.state.sceneWording,onChange:this.onSceneChange.bind(this)}),a.createElement('div',{className:'ui-selector-dropdown',onClick:this.onAllSceneDropDownClick.bind(this)},a.createElement('i',{className:i({"ui-icon-arrow-down-o":!this.state.dropDownShow||'scene'!=this.state.dropDownType,"ui-icon-arrow-up-o":this.state.dropDownShow&&'scene'==this.state.dropDownType})}))))),a.createElement('div',{className:'ui-form-item ui-form-item-inline',style:this.state.groupFormShow?{}:j.displayNone},a.createElement('label',{className:'ui-form-label'},'\u9009\u62E9\u8FDB\u5165\u7684\u7FA4'),a.createElement('div',{className:'ui-form-controls',onClick:this.onGroupDropDownClick.bind(this)},a.createElement('div',{className:'ui-selector ui-selector-primary'},a.createElement('input',{className:'ui-selector-input',placeholder:'\u8BF7\u9009\u62E9',readOnly:!0,value:this.state.groupWording}),a.createElement('div',{className:'ui-selector-dropdown'},a.createElement('i',{className:i({"ui-icon-arrow-down-o":!this.state.dropDownShow||'group'!=this.state.dropDownType,"ui-icon-arrow-up-o":this.state.dropDownShow&&'group'==this.state.dropDownType})}))))),a.createElement('div',{className:'ui-form-item ui-form-item-inline',style:this.state.miniProgramOptionsShow?{}:j.displayNone},a.createElement('label',{className:'ui-form-label'},'\u8BBE\u7F6E appid'),a.createElement('div',{className:'ui-form-controls'},a.createElement('div',{className:'ui-input-box'},a.createElement('input',{type:'text',"data-type":'appId',value:this.state.appId,onChange:this.onInputChange.bind(this),placeholder:'\u542F\u52A8\u7684 appid',className:'ui-input'})))),a.createElement('div',{className:'ui-form-item ui-form-item-inline',style:this.state.miniProgramOptionsShow?{}:j.displayNone},a.createElement('label',{className:'ui-form-label'},'\u8BBE\u7F6E extraData'),a.createElement('div',{className:'ui-form-controls'},a.createElement('div',{className:'ui-input-box'},a.createElement('input',{type:'text',ref:'extraInput',value:this.state.extraData,onChange:this.changeExtraData.bind(this),className:'ui-input'}))),a.createElement('p',{style:this.state.extraDataErr?{}:j.displayNone},' ',this.state.extraDataErr,' ')),a.createElement('div',{className:'ui-form-item ui-form-item-inline'},a.createElement('label',{className:'ui-form-label'},' '),a.createElement('div',{className:'ui-form-controls'},a.createElement('label',{className:'ui-checkbox',onClick:this.onSimulateUpdateChange.bind(this)},a.createElement('i',{className:this.state.simulateUpdate?'ui-icon-checkbox-o':'ui-icon-checkbox'}),a.createElement('span',{className:'ui-checkbox-text'},'\u4E0B\u6B21\u7F16\u8BD1\u65F6\u6A21\u62DF\u66F4\u65B0 (\u9700 1.9.90 \u53CA\u4EE5\u4E0A\u57FA\u7840\u5E93\u7248\u672C)')))))),a.createElement('div',{className:'ui-dialog-ft'},a.createElement('div',{className:'ui-dialog-action'},a.createElement('button',{className:'ui-button ui-button-warn',style:c,onClick:this.onDelete.bind(this)},'\u5220\u9664\u8BE5\u6A21\u5F0F')),a.createElement('div',{className:'ui-dialog-action'},a.createElement('button',{className:'ui-button ui-button-default',onClick:this.onClose.bind(this)},'\u53D6\u6D88'),a.createElement('button',{className:'ui-button ui-button-primary',onClick:this.onConfirm.bind(this)},'\u786E\u5B9A')))))}}module.exports=n((a)=>{let b=a.project.current,c=b.compileType,d=b.condiction&&b.condiction[c]||{},e=a.window.customCompile,f=e.id,h=d.list&&d.list[f]||{},i=a.simulator.appConfig&&a.simulator.appConfig.pages||[],j=b.attr&&b.attr.share_info||[],k=a.simulator.webviewInfos[a.simulator.currentWebviewID]||{},l=k.pathName;return{show:e&&e.show==g.game,project:a.project.current,appConfig:a.simulator.appConfig||{},sceneMap:a.config.sceneMap||{},sceneList:a.config.sceneList||[],pathName:l,groupList:j,pages:i,id:f,data:h,simulateUpdate:a.simulator.simulateUpdate}},(a)=>{return{setCustomCompile:f.bindActionCreators(c.setCustomCompile,a),projectActions:f.bindActionCreators(d,a),simulatorActions:f.bindActionCreators(e,a)}})(o)}(require('lazyload'),require);