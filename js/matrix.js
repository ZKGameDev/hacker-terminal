// Matrix雨滴效果
class MatrixRain {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.isActive = false; // 初始状态设为false，等待开机完成后再启动
        this.init();
    }
    
    init() {
        // 创建canvas元素
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'matrix-bg';
        this.canvas.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: -1;
        `;
        
        // 添加到body
        document.body.insertBefore(this.canvas, document.body.firstChild);
        
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
        
        // 监听窗口大小变化，添加防抖
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.resizeCanvas();
            }, 100); // 100毫秒防抖
        });
        
        // 不立即开始动画，等待开机完成后再启动
        // this.startAnimation(); // 注释掉，等待initializeMatrixRain()调用
    }
    
    resizeCanvas() {
        const oldColumns = this.columns || 0;
        
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        // 重新计算列数
        this.fontSize = 10;
        this.columns = this.canvas.width / this.fontSize;
        
        // 保持雨滴的连续性，而不是重新初始化
        const newDrops = [];
        
        for (let x = 0; x < this.columns; x++) {
            if (x < oldColumns && this.drops && this.drops[x] !== undefined) {
                // 保持原有雨滴的位置
                newDrops[x] = this.drops[x];
            } else {
                // 新列使用随机起始位置，让雨滴分布更自然
                newDrops[x] = Math.random() * this.canvas.height / this.fontSize;
            }
        }
        
        this.drops = newDrops;
        
        // 清空画布，避免resize时的视觉跳跃
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    startAnimation() {
        const matrix = "ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789@#$%^&*()*&^%+-/~{[|`]}";
        this.matrixArray = matrix.split("");
        
        // 使用setInterval来控制速度，与原始版本保持一致
        this.animationInterval = setInterval(() => {
            if (this.isActive) {
                this.drawMatrix();
            }
        }, 35); // 35毫秒间隔，与原始版本相同
    }
    
    // 整齐初始化Matrix雨滴
    initializeMatrixRain(callback) {
        // 重置所有雨滴到顶部，创造整齐的初始化效果
        for (let x = 0; x < this.columns; x++) {
            this.drops[x] = 1; // 所有雨滴从顶部开始
        }
        
        // 清空画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 启动动画
        this.isActive = true;
        if (!this.animationInterval) {
            this.startAnimation();
        }
        
        console.log('Matrix rain initialized with整齐的初始化效果');
        
        // 如果有回调函数，延迟执行（让Matrix效果有时间展示）
        if (callback && typeof callback === 'function') {
            setTimeout(callback, 1500); // 1.5秒后执行回调
        }
    }
    
    drawMatrix() {
        // 创建半透明黑色遮罩，产生拖尾效果
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.04)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 设置文字颜色和字体
        this.ctx.fillStyle = '#0F0';
        this.ctx.font = this.fontSize + 'px monospace';
        
        // 绘制Matrix字符
        for (let i = 0; i < this.drops.length; i++) {
            const text = this.matrixArray[Math.floor(Math.random() * this.matrixArray.length)];
            this.ctx.fillText(text, i * this.fontSize, this.drops[i] * this.fontSize);
            
            // 当字符到达底部时，随机重置到顶部
            if (this.drops[i] * this.fontSize > this.canvas.height && Math.random() > 0.975) {
                this.drops[i] = 0;
            }
            this.drops[i]++;
        }
    }
    
    toggle() {
        this.isActive = !this.isActive;
        if (this.isActive) {
            // 如果重新激活，重新开始动画
            if (!this.animationInterval) {
                this.startAnimation();
            }
        } else {
            // 如果停用，清除interval
            if (this.animationInterval) {
                clearInterval(this.animationInterval);
                this.animationInterval = null;
            }
        }
        return this.isActive;
    }
    
    setSpeed(speed) {
        // 可以通过修改动画频率来调整速度
        this.animationSpeed = speed;
    }
    
    destroy() {
        // 清理资源
        if (this.animationInterval) {
            clearInterval(this.animationInterval);
            this.animationInterval = null;
        }
        this.isActive = false;
    }
}

// 创建Matrix雨滴实例
const matrixRain = new MatrixRain();

// 页面卸载时清理资源
window.addEventListener('beforeunload', () => {
    matrixRain.destroy();
});

// 导出供其他模块使用
window.matrixRain = matrixRain; 