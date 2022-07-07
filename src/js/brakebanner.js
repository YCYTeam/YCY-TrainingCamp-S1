class BrakeBanner {
	constructor(selector) {
		this.app = new PIXI.Application({ // 这里 application a 大写是个坑
			width: window.innerWidth,
			height: window.innerHeight,
			backgroundColor: 0xffffff, // 颜色只能用16位数值？
			resizeTo: window // 画布跟着窗体自动缩放
		});

		document.querySelector(selector).appendChild(this.app.view);

		this.stage = this.app.stage;

		// 通过 PIXI.Loader 加载资源
		this.loader = new PIXI.Loader();
		this.loader.add('btn.png', 'images/btn.png');
		this.loader.add('btn_circle.png', 'images/btn_circle.png');
		this.loader.add('brake_bike.png', 'images/brake_bike.png');
		this.loader.add('brake_handlerbar.png', 'images/brake_handlerbar.png');
		this.loader.add('brake_lever.png', 'images/brake_lever.png');
		this.loader.load();

		// 资源加载完毕后，将资源添加到场景中
		this.loader.onComplete.add(() => {
			this.show();
		});
	}

	show() {
		let actionButton = this.createActionButton();
		actionButton.x = actionButton.y = 300;// 通过按钮容器将按钮整体移动到坐标(400, 400)的位置

		let bikeContainer = new PIXI.Container();
		this.stage.addChild(bikeContainer);

		bikeContainer.scale.x = bikeContainer.scale.y = 0.3;

		let bikeImage = new PIXI.Sprite(this.loader.resources['brake_bike.png'].texture);
		bikeContainer.addChild(bikeImage);

		let bikeLeverImage = new PIXI.Sprite(this.loader.resources['brake_lever.png'].texture);
		bikeContainer.addChild(bikeLeverImage);
		bikeLeverImage.pivot.x = bikeLeverImage.pivot.y = 455;
		bikeLeverImage.x = 722;
		bikeLeverImage.y = 900;

		// 车把手要显示在刹车上，所以车把手要在刹车后面添加
		let bikeHandlerbarImage = new PIXI.Sprite(this.loader.resources['brake_handlerbar.png'].texture);
		bikeContainer.addChild(bikeHandlerbarImage);

		this.stage.addChild(actionButton);

		// 添加按钮交互事件：按下按刹车，放开松刹车
		actionButton.interactive = true;
		actionButton.buttonMode = true;
		actionButton.on('mousedown', () => {
			gsap.to(bikeLeverImage, { duration: .6, rotation: -30 * Math.PI / 180 });
			pause();
		})
		actionButton.on('mouseup', () => {
			gsap.to(bikeLeverImage, { duration: .6, rotation: 0 });
			start();
		})

		// 将自行车始终保持在画布的右下角位置
		let resize = () => {
			bikeContainer.x = window.innerWidth - bikeContainer.width;
			bikeContainer.y = window.innerHeight - bikeContainer.height;
		};
		window.addEventListener('resize', resize)
		resize();

		let particleContainer = new PIXI.Container();
		this.stage.addChild(particleContainer);

		particleContainer.rotation = 35 * Math.PI / 180;

		// 旋转后，对位置进行适当的调整，不过容器默认宽高都是画布的大小的？
		particleContainer.pivot.x = window.innerWidth / 2;
		particleContainer.pivot.y = window.innerHeight / 2;
		particleContainer.x = window.innerWidth / 2;
		particleContainer.y = window.innerHeight / 2;

		// 生成 10 个随机粒子
		let particles = [];
		let colors = [0xf1cf54, 0xb5cea8, 0xf1cf54, 0x81881, 0x000000];
		for (let i = 0; i < 10; i++) {
			let gr = new PIXI.Graphics();

			gr.beginFill(colors[Math.floor(Math.random() * colors.length)]);
			gr.drawCircle(0, 0, 6);
			gr.endFill();

			let pItem = {
				sx: Math.random() * window.innerWidth,
				sy: Math.random() * window.innerHeight,
				gr
			};

			gr.x = pItem.sx;
			gr.y = pItem.sy;

			particleContainer.addChild(gr);

			particles.push(pItem);

		}

		let speed = 0;
		function loop() {
			speed += .5;
			speed = Math.min(speed, 20);

			for (let i = 0; i < particles.length; i++) {
				let pItem = particles[i];

				pItem.gr.y += speed;

				// 颗粒感原理没搞清楚？
				// 视频里的解释：最终画布上的内容都是按像素画出来的，通过调整大小呈现出颗粒感
				if (speed >= 20) {// 速度达到一定程度后才变成线
					pItem.gr.scale.y = 40;
					pItem.gr.scale.x = 0.03;
				}

				if (pItem.gr.y > window.innerHeight) {
					pItem.gr.y = 0;
				}
			}
		}


		function start() {
			speed = 0;
			gsap.ticker.add(loop);
		}

		function pause() {
			gsap.ticker.remove(loop);

			for (let i = 0; i < particles.length; i++) {
				let pItem = particles[i];

				pItem.gr.scale.y = 1;
				pItem.gr.scale.x = 1;

				gsap.to(pItem.gr, { duration: .6, x: pItem.sx, y: pItem.sy, ease: 'elastic.out' });
			}
		}

		start();

	}

	createActionButton() {
		// 创建一个容器，有助于容器内整体资源的控制
		let actionButton = new PIXI.Container();

		let btnImage = new PIXI.Sprite(this.loader.resources['btn.png'].texture);
		let btnCircle = new PIXI.Sprite(this.loader.resources['btn_circle.png'].texture);
		let btnCircle2 = new PIXI.Sprite(this.loader.resources['btn_circle.png'].texture);

		actionButton.addChild(btnImage);
		actionButton.addChild(btnCircle);
		actionButton.addChild(btnCircle2);

		btnImage.pivot.x = btnImage.pivot.y = btnImage.width / 2;
		btnCircle.pivot.x = btnCircle.pivot.y = btnCircle.width / 2;
		btnCircle2.pivot.x = btnCircle2.pivot.y = btnCircle2.width / 2;

		// 添加按钮圆环动效
		btnCircle.scale.x = btnCircle.scale.y = 0.8;
		gsap.to(btnCircle.scale, { duration: 1, x: 1.3, y: 1.3, repeat: -1 });
		gsap.to(btnCircle, { duration: 1, alpha: 0, repeat: -1 });

		return actionButton;
	}
}

/**
 * 用到的 API:
 * 
 * new PIXI.Application
 * dom.appendChild(pixiApp.view)
 * new PIXI.Loader()
 * pixiLoader.add
 * pixiLoader.load
 * pixiLoader.onComplete.add
 * new PIXI.Sprite
 * pixiLoader.resources[resourceName].texture
 * pixiApp.stage.addChild
 * ……
 * 
 * 分步骤截代码、截图、说明
 * 
 * 解释常用的API，PIXI基操
 * 
 * 代码结构整理一下，独立都抽函数，类似 createActionButton
 * 
 * 按钮位置相对自行车定位
 * 圆点位置固定？
 * 刹车时自行车位置下移，松开刹车时，位置还原
 * 对比原效果调整其他细节……
 */