//取消默认事件
$(document).on('touchmove',function(ev){
	ev.preventDefault();
});

$(function(){
	var $main = $('#main');
	var $list = $('#list');
	var $li   = $list.find('>li');
	var desW  = 640;
	var desH  = 960;
	
	//可视区高度，等比例放大高度
	var viewHeight = $(window).height();
	$main.css('height',viewHeight);
	
	
	//加载场景
	showloading();
	
	
	//刮开效果
	slideCanvas();
	//滑屏切换
	slideList();
	
	//等比例放大宽度
	function nowWidth(){
		var w = desW / desH * viewHeight;
		return w;
	}
	
	
	
	//刮开效果
	function slideCanvas(){
		var oC = $('#can').get(0);
		var oGc = oC.getContext('2d');
		
		var bBtn = true;
		
		//绘制遮罩层
		var objImg = new Image();
		objImg.src = 'img/a.png';
		objImg.onload = function(){
			
			oGc.drawImage(objImg,(desW - nowWidth())/2,0,nowWidth(),viewHeight);
			
			//oGc.fillStyle = 'red';
			oGc.globalCompositeOperation = 'destination-out';
			//初始化直线
			oGc.lineWidth = 60;
			oGc.lineCap = 'round';
			
			
			//开始触摸
			$(oC).on('touchstart',function(ev){
				//获取x,y坐标
				var touch = ev.originalEvent.changedTouches[0];
				var x = touch.pageX - $(this).offset().left;
				var y = touch.pageY - $(this).offset().top;
				
				//绘制圆
//				oGc.beginPath();
//				oGc.arc(x,y,100,0,360*Math.PI/180);
//				oGc.closePath();
//				oGc.fill();
				
				//绘制直线
				if(bBtn){
					bBtn = false;
					oGc.moveTo(x,y);
					oGc.lineTo(x+1,y+1);
				}else{
					oGc.lineTo(x,y);
				}
				
				oGc.stroke();
				
				//移动刮开涂层
				$(oC).on('touchmove.move',function(ev){
					//获取x,y坐标
					var touch = ev.originalEvent.changedTouches[0];
					var x = touch.pageX - $(this).offset().left;
					var y = touch.pageY - $(this).offset().top;
					
					oGc.lineTo(x,y);
					oGc.stroke();
				});
				
				$(oC).on('touchend.move',function(ev){
					//获取区域像素点
					var dataImg = oGc.getImageData(0,0,oC.width,oC.height);
					//区域内所有像素
					var allPx = dataImg.width * dataImg.height;
					
					//区域内所有颜色
					//dataImg.data : 存放所有颜色
					//
					var iNum = 0;
					for(var i=0; i<allPx; i++){
						if(dataImg.data[i*4+3] == 0){//获取透明度
							iNum++;
						}
					}
					//console.log(iNum);
					//进入下一个场景
					if(iNum > allPx/2){
						
						$(oC).animate({opacity:0},1000,function(){
							$(this).remove();
							
							//刮开之后调用场景
							cjAnimate[0].inAn();
							showMusic();
							
							
						});
						
					}
					//取消事件
					$(oC).off('.move');
					
				});
				
			});
		}
	}
	
	function slideList(){
		var downY = 0;
		var step = 1/4;
		
		var nowIndex = 0;
		var nextToPrevIndex = 0;
		
		var bBtn = true;
		
		//开始触摸事件
		$li.css('background-position',((desW - nowWidth())/2 + 'px 0'));
		$li.on('touchstart',function(ev){
			if(!bBtn){
				return ;
			}
			bBtn = false;
			
			var touch = ev.originalEvent.changedTouches[0];
			downY = touch.pageY;
			
			nowIndex = $(this).index();
			
			//检测滑屏：向上/向下？
			
			$li.on('touchmove',function(ev){
				var touch = ev.originalEvent.changedTouches[0];
				
				//所有隐藏
				$(this).siblings().hide();
				
				$(this).css('transform','translate(0,'+(touch.pageY-downY)*step+'px) scale('+(1-Math.abs(touch.pageY - downY)/viewHeight*step)+')');
				
				
				//向上/向下？
				if(touch.pageY < downY){//向上
					//$(this).css('transform','translate(0,'+(touch.pageY-downY)*step+'px)');
					
					//下一张图
					nextToPrevIndex = nowIndex==$li.length-1?0:nowIndex+1;
					$li.eq(nextToPrevIndex).css('transform','translate(0,'+(viewHeight + touch.pageY-downY)+'px)');
					
				}else if(touch.pageY > downY){//向下
					//$(this).css('transform','translate(0,'+(touch.pageY-downY)*step+'px)');
					
					//上一张图
					nextToPrevIndex = nowIndex==0?$li.length-1:nowIndex-1;
					$li.eq(nextToPrevIndex).css('transform','translate(0,'+(-viewHeight + touch.pageY-downY)+'px)');
				}else{
					bBtn = true;
				}
				
				$li.eq(nextToPrevIndex).show().addClass('zIndex');
				
			});
			
			//手松开即可滑屏
			$li.on('touchend',function(){
				var touch = ev.originalEvent.changedTouches[0];
				
				//向上/向下？
				if(touch.pageY < downY){//向上
					$(this).css('transform','translate(0,'+(-viewHeight*step)+'px) scale('+(1-step)+')');
					
				}else if(touch.pageY > downY){//向下
					$(this).css('transform','translate(0,'+(viewHeight*step)+'px) scale('+(1-step)+')');
					
				}
				$(this).css('transition','.3s');
				$li.eq(nextToPrevIndex).css('transform','translate(0,0)');
				$li.eq(nextToPrevIndex).css('transition','.3s');
				
				
			});
			
		});
		
		//检测过度结束
		$li.on('transitionend webkitTransitionEnd',function(ev){
			
			//防止冒泡
			if($li.is(ev.target)){
				restFn();
				
				/**********调用入场和出场动画************/
				if(cjAnimate[nowIndex]){
					cjAnimate[nowIndex].outAn();
				}
				if(cjAnimate[nextToPrevIndex]){
					cjAnimate[nextToPrevIndex].inAn();
				}
			}
			
			
		});
		function restFn(){
			$li.css('transition','');
			$li.eq(nextToPrevIndex).removeClass('zIndex').siblings().hide();
			bBtn = true;
		}
	}
	
	/********入场和出场动画*********/
	var cjAnimate = [
		{
			/********第一屏*********/
			//入场动画
			inAn: function(){
				var $liChild = $li.eq(0).find('li');
				$liChild.css('opacity',1);
				$liChild.css('transform','translate(0,0)');
				$liChild.css('transition','1s');
			},
			//出场动画
			outAn: function(){
				var $liChild = $li.eq(0).find('li');
				
				$liChild.css('transition','');
				$liChild.css('opacity',0);
				$liChild.filter(':even').css('transform','translate(-200px,0)');
				$liChild.filter(':odd').css('transform','translate(200px,0)');
			}
		},
		
		{
			/********第二屏*********/
			//入场动画
			inAn: function(){
				var $liChild = $li.eq(1).find('li');
				$liChild.attr('class','');  //散开
				$liChild.css('transform','rotate(720deg)');
				$liChild.css('transition','1s');
			},
			//出场动画
			outAn: function(){
				var $liChild = $li.eq(1).find('li');
				$liChild.css('transform','rotate(0)');
				$liChild.css('transition','');
				$liChild.attr('class','active');
			}
		},
		
		{
			/********第三屏*********/
			//入场动画
			inAn: function(){
				var $liChild = $li.eq(2).find('div');
				$liChild.css('transform','rotate(720deg)');
				$liChild.css('transition','1s');
			},
			//出场动画
			outAn: function(){
				var $liChild = $li.eq(2).find('div');
				$liChild.css('transform','rotate(0)');
				$liChild.css('transition','');
			}
		},
		
		{
			/********第四屏*********/
			//入场动画
			inAn: function(){
				var $liChild = $li.eq(3).find('li');
				$liChild.attr('class','');
				$liChild.css('transition','1s');
			},
			//出场动画
			outAn: function(){
				var $liChild = $li.eq(3).find('li');
				$liChild.css('transition','');
				$liChild.attr('class','active');
			}
		}
	
	
	];
	
//	cjAnimate[0].outAn();
//	setTimeout(function(){
//		cjAnimate[0].inAn();
//	},100);
	
	//遍历出场动画
	$.each(cjAnimate,function(i,obj){
		obj.outAn();
	});
	
	
	//音乐
	function showMusic(){
		var $music = $('#music');
		var $audivo1 = $('#audio1');
		var onoff = true;
		
		$music.on('touchstart',function(){
			
			if(onoff){     //点击播放
				$(this).attr('class','active');
				$audivo1.get(0).play();
			}else{        //点击暂停
				$(this).attr('class','');
				$audivo1.get(0).pause();
			}
			onoff = !onoff;
		});
		$music.trigger('touchstart');
		
	}
	
	//技能加载
	function showloading(){
		var arr = ['a.png','b.png','c.png','d.png','e.png','ad1.png','ad2.png','c1.png','c2.png','c3.png','c4.png','c5.png','c6.png','d1.png'];
		var $loading = $('#loading');
		var iNow = 0;
		
		for(var i=0; i<arr.length; i++){
			var objImg = new Image();
			objImg.src = 'img/'+arr[i];
			
			objImg.onload = function(){
				iNow++;
				if(iNow == arr.length){
					//加载结束之后隐藏
					$loading.animate({opacity:0},1000,function(){
						$(this).remove();
					});
				}
			}
			objImg.onerror = function(){
				$loading.animate({opacity:0},1000,function(){
						$(this).remove();
				});
			}
		}
	}
	
	
	
	
})