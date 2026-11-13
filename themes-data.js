/* ================= 六大主題專屬：三合一健康提醒文案與視覺配置 ================= */
const wellnessThemeCopy = {
    'theme-muji': {
        headerLabel: '🌿 日常健康節奏・三合一提醒',
        water: {
            title: 'MUJI WATER・日常補水',
            taskText: '【溫潤日常】給身體倒一杯溫水吧。',
            quotes: [
                '「水是身體最純粹的留白。忙完這一段，起身喝口水吧。」',
                '「不知道該喝哪間手搖飲嗎？無印良品的建議是：喝白開水就對了。」',
                '「保持簡單的生活節奏，從定時補充水分開始。」'
            ],
            btn: '好，已經喝水了'
        },
        eyes: {
            title: 'MUJI EYES・視線留白',
            taskText: '【遠眺放鬆】暫時離開螢幕，讓雙眼休息一下。',
            quotes: [
                '「雙眼已經連續對焦太久了，把視線移向窗外的遠方吧。」',
                '「閉上眼睛深呼吸三十秒，世界不會因為這半分鐘而停止運轉。」',
                '「適度讓眼睛休息，才能看見生活中更細膩的風景。」'
            ],
            btn: '好，讓眼睛休息一下'
        },
        move: {
            title: 'MUJI MOVE・舒展筋骨',
            taskText: '【起身走動】站起來伸個懶腰、轉動肩膀吧。',
            quotes: [
                '「久坐會讓思緒也跟著僵硬，起身走動兩分鐘吧。」',
                '「離開椅子，拉拉筋骨，讓身體重新找回輕盈的平衡。」',
                '「最好的工作狀態，來自懂得適時停下來活動的身體。」'
            ],
            btn: '好，起來走動一下'
        }
    },
    'theme-gba': {
        headerLabel: '🧪 狀態回復道具箱 (HP/PP)',
        water: {
            bossName: 'BOSS：脫水異常狀態',
            title: '▶ USED FRESH WATER! (補充水分)',
            taskText: '【道具發動】快喝下「美味之水」，回復 50 點 HP！',
            quotes: [
                '警告！訓練家的「水分值」已進入紅血狀態，請立即補充水分！',
                '傑尼龜對你使出了「水槍」！效果拔群！快去裝水喝吧！',
                '不喝水的話，防禦力會大幅下降喔！這是來自大木博士的叮嚀！'
            ],
            btn: '▶ 咕嚕咕嚕喝下 (HP全滿) <span class="gba-arrow">▼</span>'
        },
        eyes: {
            bossName: 'BOSS：螢幕強光攻擊',
            title: '▶ FLASH ATTACK! (眼睛休息)',
            taskText: '【狀態解除】雙眼受到「閃光」攻擊！快閉眼或遠眺解除疲勞！',
            quotes: [
                '你的命中率（視力）正在下降！快使用「護眼休息」回復狀態！',
                '野生的「眼睛痠痛」出現了！快把視線移開螢幕逃跑吧！',
                '再盯著螢幕看，眼睛就要變成圈圈眼（戰鬥不能）啦！'
            ],
            btn: '▶ 閉眼休息回復命中率 <span class="gba-arrow">▼</span>'
        },
        move: {
            bossName: 'BOSS：久坐石化詛咒',
            title: '▶ PARALYSIS CURED! (起來活動)',
            taskText: '【異常解除】久坐觸發「麻痺狀態」！快站起來動一動身體！',
            quotes: [
                '看看你圓滾滾的下巴！再不起來動一動就要進化成卡比獸啦！',
                '訓練家因為久坐陷入了「僵硬狀態」，快使用「伸展體操」解除！',
                '起身走動可獲得移動速度 +100% 與大量健康經驗值！'
            ],
            btn: '▶ 立刻起身解除石化 <span class="gba-arrow">▼</span>'
        }
    },
    'theme-digimon': {
        headerLabel: '🔋 數碼生命維持系統 (BIO-SYNC)',
        water: {
            title: '💧 AQUA EVOLUTION!! (水分補給)',
            taskText: '【數碼冷卻液注入】\n請立即補充純淨水份，維持神聖計畫運作！',
            quotes: [
                '警報！被選召的孩子體內水分不足，散熱系統即將過載！',
                '哥瑪獸緊急呼叫：「喂——！再不喝水就要變成乾巴巴獸囉！」',
                '補水能量充填完畢！喝杯水讓頭腦進化到完全體吧！'
            ],
            btn: '⚡ 注入純水能量（完成補水）'
        },
        eyes: {
            title: '👀 OPTICAL SENSOR RESET!! (護眼模式)',
            taskText: '【視覺感測器過熱】\n請暫時關閉螢幕凝視，執行遠距對焦校正！',
            quotes: [
                '光子郎：「長期盯著數碼螢幕會導致視覺數據損毀，快讓眼睛休息！」',
                '偵測到藍光疲勞病毒！請閉上雙眼或眺望綠色植物進行淨化！',
                '數碼暴龍機提示：現在閉眼休息 30 秒，可大幅提升視覺解析度！'
            ],
            btn: '⚡ 完成視覺校正（已休息）'
        },
        move: {
            title: '🏃 KINETIC MEGA DRIVE!! (起身活動)',
            taskText: '【動能裝甲啟動】\n立刻離開座位伸展四肢，打破久坐休眠模式！',
            quotes: [
                '亞古獸：「只坐著不動的話，肚子會跟我一樣變圓滾滾喔！快起來動一動！」',
                '數碼裝甲崛～起～！站起來拉拉筋，釋放累積的疲勞數碼獸吧！',
                '警告！久坐時間超標，請立即執行「原地伸展」指令！'
            ],
            btn: '⚡ 啟動全身動能（已活動）'
        }
    },
    'theme-naruto': {
        headerLabel: '📜 醫療忍術・養生三秘傳',
        water: {
            title: '🌊 水遁・水分補給之術！',
            taskText: '【醫療卷軸指令】立刻結印去倒杯水喝，補充體內查克拉！',
            quotes: [
                '綱手大人警告：「連水都不好好喝的忍者，小心我一拳把你揍飛去飲水機！」',
                '鬼鮫：「水遁的奧義就是多喝水！別讓身體乾涸了啊！」',
                '公司給的任務已經夠多了，你給身體喝的水可千萬不能少啊！'
            ],
            btn: '🙏 結印・完成補水'
        },
        eyes: {
            title: '👁️ 瞳術冷卻・寫輪眼保養時刻！',
            taskText: '【瞳力恢復指令】過度使用雙眼會耗盡查克拉，快閉眼或遠眺休息！',
            quotes: [
                '鼬：「就算擁有萬花筒寫輪眼，盯著螢幕太久也是會流血淚的……快去休息吧。」',
                '卡卡西：「把護額拉下來遮住眼睛休息一下吧，這可是上忍的保養秘訣。」',
                '日向寧次：「白眼已經看穿你的眼睛疲勞了！立刻移開視線休息！」'
            ],
            btn: '🙏 結印・封印雙眼疲勞'
        },
        move: {
            title: '🍃 體術奧義・青春熱血伸展！',
            taskText: '【阿凱老師指令】離開椅子！繞著房間走動或伸展筋骨吧！',
            quotes: [
                '阿凱老師：「這就是青春啊！！久坐是青春的大敵，現在立刻站起來伸展十下！」',
                '小李：「如果不起來動一動，雙下巴就要比秋道一族的倍化之術還明顯啦！」',
                '鳴人：「一直坐著連影分身都受不了啦，快站起來扭扭腰吧！」'
            ],
            btn: '🙏 燃燒吧青春！（已起身活動）'
        }
    },
    'theme-mermaid': {
        headerLabel: '🐚 人魚公主・海洋水潤保養♪',
        water: {
            title: '💧 水色真珠聲調・補水時間♪',
            taskText: '♪ 人魚公主絕對不能缺水！快去喝杯水保持水潤光澤吧 ♪',
            quotes: [
                '波音：「水色真珠聲調！不乖乖喝水的話，皮膚跟歌聲都會失去光澤喔♪」',
                '露亞：「在陸地上生活最重要的就是補充水分，快去喝杯水水吧～」',
                '「七大海洋的清新水滴，正在呼喚你去飲水機裝滿水杯唷♪」'
            ],
            btn: '🐚 咕嚕咕嚕～變回水潤人魚！'
        },
        eyes: {
            title: '✨ 閃亮耀眼・護眼休息時間♪',
            taskText: '♪ 讓閃耀的雙眸休息一下，看看遠方的風景吧 ♪',
            quotes: [
                '莉娜：「碧色真珠聲調！盯著螢幕太久了，去看看綠色的植物放鬆眼睛吧。」',
                '「想要擁有像真珠一樣閃亮動人的眼睛，現在就閉上雙眼休息一下吧♪」',
                '海斗：「一直盯著螢幕看，眼睛會累壞的喔，聽話去休息一下吧！」'
            ],
            btn: '🎤 眨眨閃亮雙眼（已休息）'
        },
        move: {
            title: '💃 海洋華爾滋・起身伸展時間♪',
            taskText: '♪ 站起來像人魚擺動尾鰭一樣，輕鬆伸展身體吧 ♪',
            quotes: [
                '「安可曲開始前，先從椅子上站起來伸個優雅的懶腰吧♪」',
                '小波：「喂～！再坐下去腰圍就要變粗囉，快起來動一動身體吧！」',
                '「跟著海洋的節奏站起來走動一下，讓身心都煥然一新♪」'
            ],
            btn: '🫧 優雅伸展完成！'
        }
    },
    'theme-tamagotchi': {
        headerLabel: '🥚 電子寵物・生理照顧雷達',
        water: {
            hudLeft: 'THIRSTY: 💧♡♡♡',
            hudRight: 'WATER: NEEDED!',
            title: '💧 BEEP BEEP!! 渴扁了快喝水！',
            taskText: '[餵食指令] 主人跟塔麻可吉都口渴了，快去喝一杯水！',
            quotes: [
                '嗶嗶嗶！水分槽已經見底了！現在去喝水就能獲得 ♥♥♥♥ 滿分好感！',
                '再不喝水的話，你的電子寵物就要枯萎變成乾扁香菇囉！',
                '記得隨時補充水分——這是來自塔麻可吉的可愛威脅！'
            ],
            btn: '🍼 餵食開水（水分 +100）'
        },
        eyes: {
            hudLeft: 'EYES: 😵‍💫 TIRED',
            hudRight: 'LIGHT: OFF',
            title: '👀 BEEP BEEP!! 眼睛冒煙啦！',
            taskText: '[關燈指令] 螢幕看太久囉！快帶雙眼去放風休息！',
            quotes: [
                '嗶嗶！偵測到主人的眼睛已經變成蚊香眼 🌀，快閉眼休息一下！',
                '塔麻可吉幫你把螢幕調暗了，趁現在轉動眼球、看看遠方吧！',
                '眼睛休息一下，才不會進化成「紅眼熬夜獸」喔！'
            ],
            btn: '🕶️ 讓眼睛休息（疲勞歸零）'
        },
        move: {
            hudLeft: 'WEIGHT: 99g ⬆️',
            hudRight: 'SPORT: NOW!',
            title: '🏃 BEEP BEEP!! 起來運動減重！',
            taskText: '[遊戲指令] 坐太久體重上升了！快站起來動一動身體！',
            quotes: [
                '看看你圓滾滾的下巴！再不起來動一動，體重計就要爆表啦！',
                '塔麻可吉邀你一起玩跳繩小遊戲！現在立刻離開椅子伸展一下吧！',
                '久坐會產生惰性便便💩，快站起來甩甩手腳把它清理掉吧！'
            ],
            btn: '👟 起身動一動（體態恢復）'
        }
    }
};

/* ================= 六大主題專屬分類色票庫 ================= */
const themeCategoryPalettes = {
    'theme-muji': [
        { bg: '#7F0019', text: '#FFFFFF' },
        { bg: '#5C6B5E', text: '#FFFFFF' },
        { bg: '#8C7355', text: '#FFFFFF' },
        { bg: '#4A607A', text: '#FFFFFF' },
        { bg: '#A67B5B', text: '#FFFFFF' },
        { bg: '#6E6A63', text: '#FFFFFF' }
    ],
    'theme-gba': [
        { bg: '#E04038', text: '#FFFFFF' },
        { bg: '#3898F8', text: '#FFFFFF' },
        { bg: '#48C058', text: '#FFFFFF' },
        { bg: '#F8B800', text: '#181818' },
        { bg: '#A058D8', text: '#FFFFFF' },
        { bg: '#F07830', text: '#FFFFFF' }
    ],
    'theme-digimon': [
        { bg: '#FF5500', text: '#FFFFFF' },
        { bg: '#00D8FF', text: '#050B1A' },
        { bg: '#FFCC00', text: '#050B1A' },
        { bg: '#2EE59D', text: '#050B1A' },
        { bg: '#FF44AA', text: '#FFFFFF' },
        { bg: '#9D65FF', text: '#FFFFFF' }
    ],
    'theme-naruto': [
        { bg: '#D9381E', text: '#FFFFFF' },
        { bg: '#F37021', text: '#FFFFFF' },
        { bg: '#2B6CB0', text: '#FFFFFF' },
        { bg: '#2F855A', text: '#FFFFFF' },
        { bg: '#805AD5', text: '#FFFFFF' },
        { bg: '#B7791F', text: '#FFFFFF' }
    ],
    'theme-mermaid': [
        { bg: '#FF3385', text: '#FFFFFF' },
        { bg: '#00BFA5', text: '#FFFFFF' },
        { bg: '#388E3C', text: '#FFFFFF' },
        { bg: '#AB47BC', text: '#FFFFFF' },
        { bg: '#FFA000', text: '#FFFFFF' },
        { bg: '#29B6F6', text: '#FFFFFF' }
    ],
    'theme-tamagotchi': [
        { bg: '#FF4D6D', text: '#FFFFFF' },
        { bg: '#3A86FF', text: '#FFFFFF' },
        { bg: '#2EC4B6', text: '#FFFFFF' },
        { bg: '#FF9F1C', text: '#1D2614' },
        { bg: '#8338EC', text: '#FFFFFF' },
        { bg: '#588157', text: '#FFFFFF' }
    ]
};

const themeNames = {
    'theme-muji': '無印極簡',
    'theme-gba': 'GBA 像素',
    'theme-digimon': '數碼寶貝',
    'theme-naruto': '火影忍者',
    'theme-mermaid': '真珠美人魚',
    'theme-tamagotchi': '塔麻可吉'
};

const themeConfigs = {
    'theme-muji': {
        title: '無印待辦・MUJI',
        placeholder: '寫下待辦事項...',
        addText: '＋ 新增',
        mediaText: '附件',
        bullet: '○',
        idleLabel: '日常節奏・無待辦計時',
        idleStatus: 'MUJI・待機',
        svg: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7F0019" stroke-width="2"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3" fill="#7F0019"/></svg>`,
        alarmArt: `<svg width="64" height="64" viewBox="0 0 64 64" fill="none" stroke="#7F0019" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="14" y="24" width="28" height="24" rx="2" fill="#FFF"/>
            <path d="M42 28h6a4 4 0 0 1 0 8h-6"/>
            <path d="M10 52h36"/>
            <path d="M22 16c0-3 3-3 3-6M30 16c0-3 3-3 3-6" stroke="#8C857B"/>
        </svg>`,
        quotes: [
            '「時間到了。雖然發呆也很有美感，但這件事還是得處理一下呢。」',
            '「這不是拖延，這是讓靈感發酵的留白時間。現在發酵完成了。」',
            '「深呼吸，喝口茶，然後用無印良品般的平靜心情解決它吧。」',
            '「把複雜的事情變簡單，最快的方法就是現在立刻把它做完。」'
        ]
    },
    'theme-gba': {
        title: 'GBA QUEST',
        placeholder: '輸入冒險任務...',
        addText: '★ 登錄',
        mediaText: '道具',
        bullet: '▶',
        idleLabel: 'NO ACTIVE TIMER...',
        idleStatus: 'HP 100%',
        svg: `<svg width="16" height="16" viewBox="0 0 16 16"><circle cx="8" cy="8" r="7" fill="#FFF" stroke="#111" stroke-width="1.5"/><path d="M1 8h14a7 7 0 0 0-14 0z" fill="#E04038" stroke="#111" stroke-width="1.5"/><circle cx="8" cy="8" r="2.5" fill="#FFF" stroke="#111" stroke-width="1.5"/></svg>`,
        alarmArt: `<svg class="pokeball-wobble" width="58" height="58" viewBox="0 0 32 32">
            <circle cx="16" cy="16" r="14" fill="#FFF" stroke="#111" stroke-width="2.5"/>
            <path d="M2 16h28a14 14 0 0 0-28 0z" fill="#E04038" stroke="#111" stroke-width="2.5"/>
            <rect x="2" y="14.5" width="28" height="3" fill="#111"/>
            <circle cx="16" cy="16" r="5" fill="#FFF" stroke="#111" stroke-width="2.5"/>
            <circle cx="16" cy="16" r="2" fill="#FFDE00"/>
        </svg>`,
        quotes: [
            '野生的「死線」跳出來了！效果拔群！你的摸魚時間已歸零！',
            '大木博士：「現在還不是偷懶的時候喔！快去完成任務吧！」',
            '你的「專注力」已降至 1 點！快使用「立刻行動」回復狀態！',
            '恭喜觸發隱藏支線任務！完成後可獲得經驗值 +9999！'
        ]
    },
    'theme-digimon': {
        title: 'DIGIVICE',
        placeholder: '輸入數碼任務指令...',
        addText: '⚡ 傳送',
        mediaText: '數據',
        bullet: '◈',
        idleLabel: 'DIGITAL WORLD SCANNING...',
        idleStatus: 'STANDBY',
        svg: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00F0FF" stroke-width="2"><circle cx="12" cy="12" r="5" fill="#FF8800"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1l2.1-2.1M17 7l2.1-2.1"/></svg>`,
        alarmArt: `<svg class="crest-glow" width="66" height="66" viewBox="0 0 64 64" fill="none">
            <circle cx="32" cy="32" r="28" stroke="#00F0FF" stroke-width="2" stroke-dasharray="6 4"/>
            <circle cx="32" cy="32" r="13" fill="#FF8800" stroke="#FFDE00" stroke-width="3"/>
            <path d="M32 6v8M32 50v8M6 32h8M50 32h8M13.6 13.6l5.6 5.6M44.8 44.8l5.6 5.6M13.6 50.4l5.6-5.6M44.8 19.2l5.6-5.6" stroke="#FFDE00" stroke-width="3.5" stroke-linecap="round"/>
        </svg>`,
        quotes: [
            '亞古獸究～極～進化——「再不行動就要完蛋獸」！！',
            '警告！數碼世界偵測到「拖延症病毒」，請立即執行淨化！',
            '你的勇氣徽章正在發光！把這項任務變成進化的養分吧！',
            '神聖計畫緊急通訊：「被選召的孩子啊，時間已經到了！」'
        ]
    },
    'theme-naruto': {
        title: '木葉任務卷軸',
        placeholder: '寫下木葉任務委託...',
        addText: '🍥 接取',
        mediaText: '卷軸',
        bullet: '✦',
        idleLabel: '木葉忍者村・無緊急任務',
        idleStatus: '查克拉充盈',
        svg: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#18202C" stroke-width="2.2" stroke-linecap="round"><path d="M12 12c0-2.5 2-4 4-4 2.5 0 4.5 2 4.5 5 0 4-3.5 7-8 7-5 0-8.5-4-8.5-9 0-3.5 2-6.5 4.5-8L6 2"/><path d="M19 16l3 2"/></svg>`,
        alarmArt: `<svg class="sharingan-spin" width="64" height="64" viewBox="0 0 64 64">
            <circle cx="32" cy="32" r="27" fill="#D9381E" stroke="#111" stroke-width="3.5"/>
            <circle cx="32" cy="32" r="16" fill="none" stroke="#111" stroke-width="2"/>
            <circle cx="32" cy="32" r="5.5" fill="#111"/>
            <circle cx="32" cy="16" r="3.5" fill="#111"/>
            <circle cx="18" cy="40" r="3.5" fill="#111"/>
            <circle cx="46" cy="40" r="3.5" fill="#111"/>
        </svg>`,
        quotes: [
            '卡卡西：「抱歉，我在人生的道路上迷路了……但你可不能迷路啊！」',
            '鳴人：「多重影分身之術！……可惡，分身也都跑去偷懶了，還是自己做吧！」',
            '鹿丸：「真是麻煩死了……不過既然接了任務，就一口氣解決吧。」',
            '「說到做到，準時完成任務，這就是我的忍道！」—— 漩渦鳴人'
        ]
    },
    'theme-mermaid': {
        title: '真珠美人魚♪',
        placeholder: '寫下閃亮的海洋心願...',
        addText: '🐚 許願',
        mediaText: '真珠',
        bullet: '🐚',
        idleLabel: '七大海洋・平靜閃耀中♪',
        idleStatus: '粉色真珠聲調',
        svg: `<svg width="17" height="17" viewBox="0 0 24 24" fill="none">
            <path d="M12 3C7 3 3 7.5 3 13c0 3 2 5 5 6l4 2 4-2c3-1 5-3 5-6 0-5.5-4-10-9-10z" fill="#FFE0EC" stroke="#FFF" stroke-width="1.8"/>
            <circle cx="12" cy="14" r="3.5" fill="#FF3385"/>
        </svg>`,
        alarmArt: `<svg class="pearl-float" width="70" height="66" viewBox="0 0 64 64" fill="none">
            <path d="M32 10C18 10 8 20 8 34c0 8 5 13 12 16l12 4 12-4c7-3 12-8 12-16 0-14-10-24-24-24z" fill="#FF85B3" stroke="#FF1476" stroke-width="2.5"/>
            <path d="M32 10v22M20 13l7 20M44 13l-7 20" stroke="#FFE0EC" stroke-width="1.8"/>
            <circle cx="32" cy="38" r="8" fill="#FFF" stroke="#40E0D0" stroke-width="3"/>
            <circle cx="30" cy="36" r="2.5" fill="#FF66A3"/>
            <text x="8" y="14" fill="#FF1476" font-size="12" font-weight="bold">♪</text>
            <text x="50" y="16" fill="#00ACC1" font-size="13" font-weight="bold">♫</text>
        </svg>`,
        quotes: [
            '「粉色真珠聲調！用閃亮的歌聲開始現場演唱……之前先把這件事做完吧♪」',
            '「七大海洋的七彩夢幻，都比不上你準時完成任務的閃耀喔！」',
            '「安可曲時間到了！再不行動的話，水妖就要把你的摸魚時間偷走囉～」',
            '「只要懷抱著愛與勇氣，再麻煩的任務也能用歌聲化解！」'
        ]
    },
    'theme-tamagotchi': {
        title: 'TAMAGOTCHI',
        placeholder: '輸入電子寵物指令...',
        addText: '🥚 餵食',
        mediaText: '道具',
        bullet: '■',
        idleLabel: 'PET SLEEPING... Zzz',
        idleStatus: 'HAPPY 100%',
        svg: `<svg width="16" height="17" viewBox="0 0 24 24" fill="none">
            <ellipse cx="12" cy="13" rx="8" ry="9.5" fill="#FFD93D" stroke="#1D2614" stroke-width="2"/>
            <rect x="8" y="9" width="8" height="6" fill="#9EAB88" stroke="#1D2614" stroke-width="1.5"/>
            <circle cx="9" cy="18" r="1" fill="#1D2614"/>
            <circle cx="12" cy="18.5" r="1" fill="#1D2614"/>
            <circle cx="15" cy="18" r="1" fill="#1D2614"/>
        </svg>`,
        alarmArt: `<svg class="tama-hop" width="64" height="64" viewBox="0 0 32 32">
            <rect x="7" y="4" width="5" height="6" fill="#1D2614"/>
            <rect x="20" y="4" width="5" height="6" fill="#1D2614"/>
            <rect x="7" y="9" width="18" height="13" fill="#FFF" stroke="#1D2614" stroke-width="2"/>
            <rect x="11" y="13" width="2" height="3" fill="#1D2614"/>
            <rect x="19" y="13" width="2" height="3" fill="#1D2614"/>
            <rect x="14" y="17" width="4" height="2" fill="#FF4D6D"/>
            <rect x="9" y="22" width="14" height="6" fill="#3A86FF" stroke="#1D2614" stroke-width="2"/>
            <rect x="5" y="22" width="4" height="3" fill="#FFF" stroke="#1D2614" stroke-width="1.5"/>
            <rect x="23" y="22" width="4" height="3" fill="#FFF" stroke="#1D2614" stroke-width="1.5"/>
        </svg>`,
        quotes: [
            '嗶嗶嗶！你的電子寵物肚子餓扁了，再不處理任務就要離家出走囉！',
            '警告！螢幕上出現了一坨「拖延便便💩」，快按下清理鍵完成任務吧！',
            '塔麻可吉進化條件達成：只要現在立刻行動，就能進化成「時間管理大師」！',
            '呼叫主人！你的電子寵物正在生氣跺腳，快去把這件事解決吧！'
        ]
    }
};