// 终端核心功能

// 全局变量
let commands = {};
let commandConfig = {};

// 显示配置
const DISPLAY_CONFIG = {
    initialDelay: 200,        // 开始显示消息前的初始延迟
    messageInterval: 300,     // 消息之间的显示间隔（增加间隔）
    stageDelay: 500,          // 阶段之间的延迟（增加延迟）
    commandLineDelay: 200     // 显示命令行前的延迟
};

// 获取DOM元素
const terminalContent = document.getElementById('terminalContent');
const commandInput = document.getElementById('commandInput');

// 记录页面加载时间
const pageLoadTime = new Date();

// Update time
function updateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString();
    const dateString = now.toLocaleDateString();
    
    // 计算停留时间（毫秒精度）
    const stayTimeMs = now - pageLoadTime;
    const stayTime = Math.floor(stayTimeMs / 1000); // 秒数
    const hours = Math.floor(stayTime / 3600);
    const minutes = Math.floor((stayTime % 3600) / 60);
    const seconds = stayTime % 60;
    const milliseconds = Math.floor((stayTimeMs % 1000) / 10); // 保留两位毫秒
    
    // 格式化停留时间
    let stayTimeString;
    if (hours > 0) {
        stayTimeString = `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
    } else {
        stayTimeString = `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
    }
    
    // 更新状态栏停留时间
    document.getElementById('time').textContent = stayTimeString;
    
    // 更新终端头部时间和日期
    document.getElementById('terminalTime').textContent = timeString;
    document.getElementById('terminalDate').textContent = dateString;
}

setInterval(updateTime, 10); // 每10毫秒更新一次，实现毫秒级精度
updateTime();

// Function to show messages sequentially
function showMessagesSequentially(messages, index, callback) {
    if (index >= messages.length) {
        if (callback) callback();
        return;
    }

    const message = messages[index];
    const text = typeof message === 'string' ? message : message.text;
    const type = typeof message === 'string' ? 'info' : message.type;

    addOutputSequential(text, type, () => {
        // Wait for message to complete, then show next
        setTimeout(() => {
            showMessagesSequentially(messages, index + 1, callback);
        }, DISPLAY_CONFIG.messageInterval);
    });
}

// Sequential output function
function addOutputSequential(text, type, callback) {
    const output = document.createElement('div');
    output.className = `output ${type}`;
    terminalContent.insertBefore(output, terminalContent.lastElementChild);
    
    // 播放系统消息音效 - 仅在用户交互后
    if (window.typewriterSound && window.typewriterSound.isEnabled && 
        window.typewriterSound.audioContext && window.typewriterSound.audioContext.state === 'running') {
        // 立即播放音效
        setTimeout(() => {
            window.typewriterSound.playKeySound();
        }, 0);
    }
    
    // Typewriter effect for all messages
    typewriterEffectSequential(output, text, type, callback);
    
    // Limit to 200 lines, but don't remove during system message display
    const outputs = terminalContent.querySelectorAll('.output');
    if (outputs.length > 200 && systemMessagesCompleted) {
        const toRemove = outputs.length - 200;
        for (let i = 0; i < toRemove; i++) {
            outputs[i].remove();
        }
    }
    
    scrollToBottom();
}

function typewriterEffectSequential(element, text, type, callback) {
    const typeInterval = 50; // 每个字符的显示间隔
    
    // For all text, type character by character
    let index = 0;
    
    function typeCharacter() {
        if (index < text.length) {
            element.textContent = text.substring(0, index + 1);
            index++;
            setTimeout(typeCharacter, typeInterval);
        } else {
            // Text completed, call callback
            if (callback) callback();
        }
    }
    
    // Start typing immediately
    typeCharacter();
}

// 开机动画
function startBootAnimation() {
    console.log('Starting boot animation...');
    
    const bootAnimation = document.getElementById('bootAnimation');
    const bootProgress = document.getElementById('bootProgress');
    const bootStatus = document.getElementById('bootStatus');
    
    if (!bootAnimation || !bootProgress || !bootStatus) {
        console.error('Boot animation elements not found!');
        // 如果开机动画元素不存在，直接启动系统消息
        startSystemMessages();
        return;
    }
    
    // 显示等待按键的提示
    bootStatus.textContent = 'Press any key to start system boot...';
    bootStatus.classList.add('waiting');
    // 隐藏进度条容器
    const bootProgressContainer = bootProgress.parentElement;
    bootProgressContainer.style.display = 'none';
    
    // 等待用户按键
    waitForKeyPress();
    
    function waitForKeyPress() {
        function handleKeyPress() {
            console.log('Key pressed, starting boot sequence...');
            
            // 移除等待状态样式
            bootStatus.classList.remove('waiting');
            
            // 显示进度条并设置初始状态
            const bootProgressContainer = bootProgress.parentElement;
            bootProgressContainer.style.display = 'block';
            bootProgress.style.width = '0%';
            
            // 移除事件监听器
            document.removeEventListener('keydown', handleKeyPress);
            document.removeEventListener('click', handleKeyPress);
            
            // 预热音频系统
            if (window.typewriterSound && window.typewriterSound.audioContext) {
                window.typewriterSound.audioContext.resume().then(() => {
                    console.log('Audio context activated by key press');
                }).catch(error => {
                    console.log('Failed to activate audio context:', error);
                });
            }
            
            // 开始开机步骤
            startBootSequence();
        }
        
        // 监听按键和点击事件
        document.addEventListener('keydown', handleKeyPress);
        document.addEventListener('click', handleKeyPress);
    }
    
    // 开机步骤序列
    function startBootSequence() {
        const bootSteps = [
            { progress: 10, status: 'Initializing BIOS...', delay: 500 },
            { progress: 25, status: 'Loading kernel modules...', delay: 800 },
            { progress: 40, status: 'Mounting filesystems...', delay: 600 },
            { progress: 55, status: 'Starting network services...', delay: 700 },
            { progress: 70, status: 'Loading security protocols...', delay: 900 },
            { progress: 85, status: 'Establishing secure connection...', delay: 800 },
            { progress: 95, status: 'Finalizing system startup...', delay: 600 },
            { progress: 100, status: 'System ready!', delay: 1000 }
        ];
        
        let currentStep = 0;
        
        function updateBootProgress() {
            if (currentStep < bootSteps.length) {
                const step = bootSteps[currentStep];
                bootProgress.style.width = step.progress + '%';
                bootStatus.textContent = step.status;
                console.log(`Boot step ${currentStep + 1}: ${step.status}`);
                
                // 移除开机步骤中的音效，只在最终完成时播放
                
                currentStep++;
                setTimeout(updateBootProgress, step.delay);
            } else {
               // 开机动画完成
               console.log('Boot animation completed, starting system messages...');
               setTimeout(() => {
                   bootAnimation.classList.add('boot-fade-out');
                   setTimeout(() => {
                       bootAnimation.style.display = 'none';
                       // 播放开机完成音效
                       if (window.typewriterSound && window.typewriterSound.isEnabled && 
                           window.typewriterSound.audioContext && window.typewriterSound.audioContext.state === 'running') {
                           setTimeout(() => {
                               console.log('Playing boot completion sound...');
                               window.typewriterSound.playEnterSound();
                           }, 100);
                       }
                       
                       // 初始化Matrix雨滴效果 - 整齐的从上到下初始化
                       if (window.matrixRain) {
                           console.log('Starting Matrix rain initialization...');
                           setTimeout(() => {
                               window.matrixRain.initializeMatrixRain(() => {
                                   // Matrix初始化完成后的回调
                                   console.log('Matrix initialization completed, starting system messages...');
                                   startSystemMessages();
                               });
                           }, 500); // 延迟500毫秒，让开机动画完全消失
                       } else {
                           // 如果没有Matrix效果，直接显示系统消息
                           console.log('No Matrix rain available, starting system messages directly...');
                           startSystemMessages();
                       }
                   }, 1000);
               }, 1000);
            }
        }
        
        updateBootProgress();
    }
    
    // 开始等待按键
    waitForKeyPress();
}

// 启动系统消息显示
let systemMessagesStarted = false; // 防止重复调用
let systemMessagesCompleted = false; // 标记系统消息是否已完成

function startSystemMessages() {
    if (systemMessagesStarted) {
        console.log('System messages already started, skipping...');
        return;
    }
    systemMessagesStarted = true;
    console.log('Starting system messages...', new Error().stack);
    
    // 检查是否已经有系统消息在显示，如果有则跳过
    const existingOutputs = terminalContent.querySelectorAll('.output');
    if (existingOutputs.length > 0) {
        console.log('Found existing outputs, checking if system messages are already displayed...');
        const hasSystemMessages = Array.from(existingOutputs).some(output => 
            output.textContent && output.textContent.includes('System initialized successfully')
        );
        if (hasSystemMessages) {
            console.log('System messages already displayed, skipping...');
            return;
        }
    }
    
    // 确保命令行输入框是隐藏的
    const commandLine = document.getElementById('commandLine');
    if (commandLine) {
        commandLine.style.display = 'none';
    }

    // Initial system startup messages
    const initialMessages = [
        { text: '[*] System initialized successfully...', type: 'success', sound: true },
        { text: '[*] Loading security protocols...', type: 'info', sound: true },
        { text: '[*] Access granted to mainframe', type: 'success', sound: true },
        { text: '[!] Warning: Unauthorized access detected', type: 'warning', sound: true },
        { text: '[ERROR] Firewall bypass required', type: 'error', sound: true },
        { text: '[*] Firewall bypassed successfully', type: 'success', sound: true },
        { text: '[*] Connected to target system', type: 'info', sound: true },
        { text: '[*] Ready for commands', type: 'success', sound: true }
    ];

    // Additional system messages
    const systemMessages = [
        '[*] Monitoring network traffic...',
        '[*] Updating security protocols...',
        '[*] Scanning for vulnerabilities...',
        '[*] Encrypting data transmission...',
        '[*] Bypassing firewall...',
        '[*] Accessing secure database...'
    ];

    // Display initial system messages on startup
    setTimeout(() => {
        // Show initial messages sequentially
        showMessagesSequentially(initialMessages, 0, () => {
            // After initial messages, show additional system messages
            setTimeout(() => {
                showMessagesSequentially(systemMessages, 0, () => {
                    // After all messages, show command line
                    setTimeout(() => {
                        // 标记系统消息已完成
                        systemMessagesCompleted = true;
                        
                        // 显示命令行输入框（包含提示符）
                        const commandLine = document.getElementById('commandLine');
                        commandLine.style.display = 'flex';
                        
                        // 聚焦到输入框
                        document.getElementById('commandInput').focus();
                    }, DISPLAY_CONFIG.commandLineDelay);
                });
            }, DISPLAY_CONFIG.stageDelay);
        });
    }, DISPLAY_CONFIG.initialDelay);
}

// Load commands from config
async function loadCommands() {
    try {
        const response = await fetch('config.json');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const config = await response.json();
        console.log('Config loaded:', config);
        commandConfig = config.commands;
        
        // 根据site配置生成标题和副标题
        if (config.site) {
            const pageTitle = `WELCOME TO ${config.site.toUpperCase()}`; // 页面标题显示WELCOME TO + 大写站点名称
            const htmlTitle = config.site; // HTML title标签显示原始站点名称
            const bootTitle = config.site.toUpperCase(); // 加载界面使用大写
            const subtitle = "SYSTEM ACCESS GRANTED - WELCOME TO THE MATRIX";
            
            // 更新页面标题
            const titleElement = document.getElementById('pageTitle');
            if (titleElement) {
                titleElement.textContent = pageTitle;
            }
            
            // 更新HTML的title标签
            const htmlTitleElement = document.getElementById('htmlTitle');
            if (htmlTitleElement) {
                htmlTitleElement.textContent = htmlTitle;
            }
            
            // 更新加载界面的标题（使用大写）
            const bootLogoElement = document.getElementById('bootLogo');
            if (bootLogoElement) {
                bootLogoElement.textContent = bootTitle;
            }
            
            // 更新副标题
            const subtitleElement = document.getElementById('pageSubtitle');
            if (subtitleElement) {
                subtitleElement.textContent = subtitle;
            }
        }
        
        // Build commands object from config
        Object.keys(commandConfig).forEach(cmd => {
            const cmdData = commandConfig[cmd];
            
            if (cmdData.type === 'function') {
                // Handle special functions
                if (cmd === 'clear') {
                    commands[cmd] = () => {
                        const outputs = terminalContent.querySelectorAll('.output');
                        outputs.forEach(output => output.remove());
                    };
                } else if (cmd === 'exit') {
                    commands[cmd] = () => {
                        addOutput('Logging out...', 'info');
                        addOutput('Goodbye, hacker!', 'success');
                        // Hide command line immediately
                        document.getElementById('commandLine').style.display = 'none';
                        return null;
                    };
                } else if (cmd === 'help') {
                    commands[cmd] = () => {
                        let helpText = 'Available commands:\n\n';
                        
                        Object.keys(commandConfig).forEach(cmdName => {
                            const cmdData = commandConfig[cmdName];
                            helpText += `${cmdName} - ${cmdData.description}\n`;
                        });
                        
                        return helpText;
                    };
                } else if (cmd === 'sound') {
                    commands[cmd] = () => {
                        const isEnabled = window.typewriterSound.toggleSound();
                        return `Typewriter sound ${isEnabled ? 'enabled' : 'disabled'}`;
                    };
                } else if (cmd === 'matrix') {
                    commands[cmd] = () => {
                        const isEnabled = window.matrixRain.toggle();
                        if (isEnabled) {
                            // 如果重新启用，触发整齐的初始化效果
                            window.matrixRain.initializeMatrixRain();
                        }
                        return `Matrix rain effect ${isEnabled ? 'enabled' : 'disabled'}`;
                    };
                }
            } else if (cmdData.type === 'redirect') {
                // Handle redirect commands
                commands[cmd] = () => {
                    addOutput(cmdData.message, 'info');
                    setTimeout(() => {
                        window.open(cmdData.url, '_blank');
                    }, 1000);
                    return cmdData.description;
                };
            } else {
                // Handle info commands
                commands[cmd] = cmdData.description;
            }
        });
        
        console.log('Commands loaded successfully:', Object.keys(commands));
    } catch (error) {
        console.error('Failed to load commands:', error);
        addOutput(`[ERROR] Failed to load config.json: ${error.message}`, 'error');
        addOutput('[INFO] Using fallback commands', 'info');
        // Fallback to default commands
        commands = {
            'help': 'Available commands: help, clear, status, scan, hack, todo, exit',
            'clear': () => {
                const outputs = terminalContent.querySelectorAll('.output');
                outputs.forEach(output => output.remove());
            },
            'status': 'System Status: ONLINE\nFirewall: BYPASSED\nTarget: CONNECTED\nSecurity Level: MAXIMUM',
            'scan': 'Scanning target system...\n[*] Port 22: OPEN (SSH)\n[*] Port 80: OPEN (HTTP)\n[*] Port 443: OPEN (HTTPS)\n[*] Vulnerabilities found: 3',
            'hack': 'Initiating hack sequence...\n[*] Bypassing security...\n[*] Extracting data...\n[*] Hack completed successfully!',
            'exit': () => {
                addOutput('Logging out...', 'info');
                addOutput('Goodbye, hacker!', 'success');
                setTimeout(() => {
                    document.getElementById('commandLine').style.display = 'none';
                }, 1000);
                return null;
            }
        };
    }
}

// Load commands when page loads
loadCommands();

function addOutput(text, type = 'info') {
    console.log(`addOutput called: "${text}" (${type})`);
    
    // 如果系统消息还没完成，且要显示的是提示符，则跳过
    if (!systemMessagesCompleted && type === 'prompt' && text.includes('root@hacker-system')) {
        console.log('Skipping prompt display - system messages not completed yet');
        return Promise.resolve();
    }
    
    const output = document.createElement('div');
    output.className = `output ${type}`;
    terminalContent.insertBefore(output, terminalContent.lastElementChild);
    
    // Handle text with newlines or ellipsis
    if (text.includes('\n') || text.includes('...')) {
        // For text with newlines or ellipsis, use typewriter effect
        return typewriterEffect(output, text, type);
    } else {
        output.textContent = text;
        
        // Limit to 200 lines, but don't remove during system message display
        const outputs = terminalContent.querySelectorAll('.output');
        if (outputs.length > 200 && systemMessagesCompleted) {
            // Remove oldest outputs (keep only the last 200)
            const toRemove = outputs.length - 200;
            for (let i = 0; i < toRemove; i++) {
                outputs[i].remove();
            }
        }
        
        scrollToBottom();
        return Promise.resolve();
    }
}

function typewriterEffect(element, text, type) {
    return new Promise((resolve) => {
        const typeInterval = 50; // 每个字符的显示间隔
        
        // Check if text contains ellipsis
        if (text.includes('...')) {
            // Split text into base and ellipsis parts
            const baseText = text.replace('...', '');
            const ellipsis = '...';
            
            // Show base text immediately
            element.textContent = baseText;
            
            // Then type the ellipsis character by character
            let index = 0;
            
            function typeEllipsis() {
                if (index < ellipsis.length) {
                    element.textContent = baseText + ellipsis.substring(0, index + 1);
                    index++;
                    setTimeout(typeEllipsis, typeInterval);
                } else {
                    // Ellipsis completed, resolve promise
                    resolve();
                }
            }
            
            // Start typing ellipsis after a short delay
            setTimeout(typeEllipsis, 100);
        } else {
            // For text with newlines, type line by line
            const lines = text.split('\n');
            let lineIndex = 0;
            
            function typeLine() {
                if (lineIndex < lines.length) {
                    // Show all lines up to current line
                    const currentText = lines.slice(0, lineIndex + 1).join('<br>');
                    element.innerHTML = currentText;
                    lineIndex++;
                    setTimeout(typeLine, typeInterval * 3); // Slower interval for line-by-line
                } else {
                    // All lines completed, resolve promise
                    resolve();
                }
            }
            
            // Start typing lines immediately
            typeLine();
        }
        
        // Limit to 200 lines, but don't remove during system message display
        const outputs = terminalContent.querySelectorAll('.output');
        if (outputs.length > 200 && systemMessagesCompleted) {
            // Remove oldest outputs (keep only the last 200)
            const toRemove = outputs.length - 200;
            for (let i = 0; i < toRemove; i++) {
                outputs[i].remove();
            }
        }
        
        scrollToBottom();
    });
}

function scrollToBottom() {
    terminalContent.scrollTop = terminalContent.scrollHeight;
}

function forceScrollToBottom() {
    // Disable observer temporarily to avoid infinite loops
    observer.disconnect();
    
    // Force scroll
    scrollToBottom();
    
    // Re-enable observer after a short delay
    setTimeout(() => {
        observer.observe(terminalContent, {
            childList: true,
            subtree: true
        });
    }, 100);
}

// Monitor for new content and auto-scroll
const observer = new MutationObserver(() => {
    forceScrollToBottom();
});

// Start observing the terminal content
observer.observe(terminalContent, {
    childList: true,
    subtree: true
});

// Handle command input
commandInput.addEventListener('keypress', function(e) {
    // 播放按键音效
    if (window.typewriterSound) {
        window.typewriterSound.playKeySound();
    }
    
    if (e.key === 'Enter') {
        // 播放回车音效
        if (window.typewriterSound) {
            window.typewriterSound.playEnterSound();
        }
        
        const command = this.value.trim().toLowerCase();
        this.value = '';

        if (command) {
            // Hide command line during command execution
            const commandLine = document.getElementById('commandLine');
            commandLine.style.display = 'none';
            
            addOutput(`root@hacker-system:~# ${command}`, 'prompt');
            
            if (commands[command]) {
                const result = typeof commands[command] === 'function' ? commands[command]() : commands[command];
                if (result) {
                    // Wait for the result to be fully displayed before showing command line
                    addOutput(result, 'success').then(() => {
                        // Show command line after result is fully displayed
                        setTimeout(() => {
                            commandLine.style.display = 'flex';
                            document.getElementById('commandInput').focus();
                            forceScrollToBottom();
                        }, 200);
                    });
                } else {
                    // Show command line immediately for commands with no output
                    setTimeout(() => {
                        commandLine.style.display = 'flex';
                        document.getElementById('commandInput').focus();
                        forceScrollToBottom();
                    }, 200);
                }
            } else {
                addOutput(`Command not found: ${command}`, 'error');
                addOutput('Type "help" to see available commands', 'info');
                
                // Show command line after error messages
                setTimeout(() => {
                    commandLine.style.display = 'flex';
                    document.getElementById('commandInput').focus();
                    forceScrollToBottom();
                }, 200);
            }
        }
    }
});

// Handle cursor visibility when input is focused
const customCursor = document.querySelector('.cursor');

commandInput.addEventListener('focus', function() {
    customCursor.classList.add('hidden');
    customCursor.classList.remove('no-focus');
});

commandInput.addEventListener('blur', function() {
    customCursor.classList.remove('hidden');
    customCursor.classList.add('no-focus');
});

// 初始状态：光标隐藏
customCursor.classList.add('no-focus');

// 启动开机动画
startBootAnimation();

// 备用启动方法：如果10秒后命令行还没显示，强制显示
setTimeout(() => {
    const commandLine = document.getElementById('commandLine');
    if (commandLine && commandLine.style.display === 'none' && !systemMessagesStarted && !systemMessagesCompleted) {
        console.log('Fallback: Forcing system messages and command line display');
        
        // 标记系统消息已开始，防止重复
        systemMessagesStarted = true;
        
        // 先显示系统消息，然后再显示命令行
        const fallbackMessages = [
            '[*] System initialized successfully...',
            '[*] Loading security protocols...',
            '[*] Access granted to mainframe',
            '[*] Ready for commands'
        ];
        
        // 显示备用系统消息
        showMessagesSequentially(fallbackMessages, 0, () => {
            // 系统消息显示完成后，再标记完成并显示命令行
            setTimeout(() => {
                systemMessagesCompleted = true;
                
                // 显示命令行输入框（包含提示符）
                commandLine.style.display = 'flex';
                document.getElementById('commandInput').focus();
            }, 200);
        });
    }
}, 10000);