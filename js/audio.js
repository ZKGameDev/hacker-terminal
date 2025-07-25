// 打字机音效系统
class TypewriterSound {
    constructor() {
        this.audioContext = null;
        this.isEnabled = true;
        this.volume = 0.1;
        this.isInitialized = false;
        this.initAudioContext();
    }
    
    initAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            // 预创建一些音频节点以减少延迟
            this.preloadAudioNodes();
        } catch (e) {
            console.log('Audio context not supported');
            this.isEnabled = false;
        }
    }
    
    preloadAudioNodes() {
        // 预创建音频节点以减少首次播放的延迟
        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.001);
            this.isInitialized = true;
        } catch (e) {
            console.log('Audio preload failed:', e);
        }
    }
    
    playKeySound() {
        if (!this.isEnabled || !this.audioContext) return;
        
        // 确保音频上下文已恢复（如果被暂停）
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        // 老式电脑音效参数 - 更长更经典
        const now = this.audioContext.currentTime;
        // 使用更低的频率，更像老式电脑
        oscillator.frequency.setValueAtTime(600 + Math.random() * 200, now);
        oscillator.type = 'triangle'; // 使用三角波，更柔和
        
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(this.volume * 0.8, now + 0.02); // 更慢的上升时间
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.15); // 更长的持续时间
        
        oscillator.start(now);
        oscillator.stop(now + 0.15);
    }
    
    playEnterSound() {
        if (!this.isEnabled || !this.audioContext) {
            console.log('Enter sound disabled or no audio context');
            return;
        }
        
        try {
            // 确保音频上下文已恢复（如果被暂停）
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
            
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            // 老式电脑确认音效参数
            const now = this.audioContext.currentTime;
            oscillator.frequency.setValueAtTime(300, now);
            oscillator.type = 'triangle'; // 使用三角波，更柔和
            
            gainNode.gain.setValueAtTime(0, now);
            gainNode.gain.linearRampToValueAtTime(this.volume * 1.5, now + 0.03); // 更慢的上升时间
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.25); // 更长的持续时间
            
            oscillator.start(now);
            oscillator.stop(now + 0.25);
            
            console.log('Enter sound played successfully');
        } catch (error) {
            console.log('Error playing enter sound:', error);
        }
    }
    
    toggleSound() {
        this.isEnabled = !this.isEnabled;
        console.log('Typewriter sound:', this.isEnabled ? 'enabled' : 'disabled');
        return this.isEnabled;
    }
    
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
    }
}

// 创建打字机音效实例
const typewriterSound = new TypewriterSound();

// 在页面加载时显示音效提示
setTimeout(() => {
    console.log('Typewriter sound system initialized. Use "sound" command to toggle.');
    console.log('Audio context state:', typewriterSound.audioContext?.state);
    console.log('Sound enabled:', typewriterSound.isEnabled);
    
    // 如果音频上下文被暂停，提示用户交互
    if (typewriterSound.audioContext && typewriterSound.audioContext.state === 'suspended') {
        console.log('⚠️ Audio system needs user interaction to activate. Click anywhere on the page to enable sound effects.');
    }
}, 2000);

// 预热音频系统 - 在用户第一次交互时
function warmupAudio() {
    console.log('User interaction detected, warming up audio...');
    if (typewriterSound && typewriterSound.audioContext) {
        if (typewriterSound.audioContext.state === 'suspended') {
            typewriterSound.audioContext.resume().then(() => {
                console.log('Audio context resumed successfully');
                // 播放一个静音的音效来预热
                setTimeout(() => {
                    typewriterSound.playKeySound();
                }, 100);
            }).catch(error => {
                console.log('Failed to resume audio context:', error);
            });
        } else {
            console.log('Audio context already running');
            typewriterSound.playKeySound();
        }
    }
}

// 监听用户交互来预热音频
document.addEventListener('click', warmupAudio, { once: true });
document.addEventListener('keydown', warmupAudio, { once: true });
document.addEventListener('touchstart', warmupAudio, { once: true });
document.addEventListener('mousedown', warmupAudio, { once: true });

// 导出音效系统供其他模块使用
window.typewriterSound = typewriterSound; 