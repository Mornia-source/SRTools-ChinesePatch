// ==UserScript==
// @name         SRTools 中文化测试 v2.0
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  动态翻译 SRTools 常用术语（精确匹配+正则+Path动态监听+动态加载）
// @author       Mornia
// @match        https://srtools.neonteam.dev/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // ===== 精确匹配文本 =====
    const exactTranslations = {
        "Detail": "详情",
        "Light Cone": "光锥",
        "Trace": "行迹",
        "Relic": "遗器",
        "Eidolon": "星魂",
        "Showcase Card": "信息",
        "Pick Enemy": "设置敌人",
        "Save Image": "保存图片",
        "Connect PS": "连接私服",
        "Import": "导入数据",
        "stats": "属性",
        "ability": "技能",
        "detailStats": "属性详情",
        "Equip": "装备",
        "Unequipped": "未装备",
        "Unequipped Lightcone": "未装备光锥",
        "Max All": "点满全部",
        "Lightcone": "光锥",
        "lightconeAbility": "光锥技能",
        "setEffect": "套装效果",
        "Memory of Chaos": "混沌回忆",
        "Pure Fiction": "虚构叙事",
        "Apocalyptic Shadow": "末日幻影",
        "Anomaly Arbitration": "异相仲裁",
        "Simulated Universe": "差分宇宙",
        "Custom Enemy": "自定义敌人",
        "Use technique?": "使用秘技？",
        "More Stats": "属性详情",
        "Base Stats": "基础属性",
        "Advanced Stats": "进阶属性",
        "Toughness Reduction": "削韧值",
        "Skill Point Cost": "消耗战技点",
        "Energy Cost": "消耗能量",
        "briefDescription": "简略描述",
        "Superimposition": "叠影",
        "Lightcone Picker": "角色光锥",
        "Activate": "激活",
        "Deactivate": "取消激活",
        "Create New Lightcone": "创建新光锥",
        "Create New Lightcone +": "创建新光锥 +",
        "Search": "搜索",
        "Cancel": "取消",
        "Save": "保存",
        "Rarity": "稀有度",
        "Name": "名称",
        "ATK": "攻击力",
        "DEF": "防御力",
        "HP": "生命值",
        "Connect": "连接",
        "Connect to Private Server": "连接至私服",
        "Provider": "提供者",
        "Server URL": "服务器 URL",
        "Username": "用户名",
        "Password": "密码",
        "Additionally, if the server you want to connect to is hosted externally (not on localhost) and does not use HTTPS, you must route the connection through a proxy server, as the Content Security Policy (CSP) will block insecure requests.": "此外，如果您要连接的服务器是外部托管的（非 localhost 本地网络）且未使用 HTTPS，您必须通过代理服务器路由连接，因为内容安全策略（CSP）将阻止不安全的请求。",
        "Current Relics": "当前搭配遗器",
        "Character Stats": "角色属性",
        "Save as Loadout": "保存为装备配置",
        "Equipped": "已装备",
        "Loadout": "配置",
        "Switch": "替换",
        "Enemy Picker": "选择敌人",
        "Use cycle count?": "使用轮次计数？",
        "Use turbulence buff": "使用记忆紊流",
        "upper": "上半",
        "lower": "下半",
        "upper-lower": "整层（先出上半怪）",
        "lower-upper": "整层（先出下半怪）",
        "Pick Challenge": "挑战选择",
        "Floor": "层数",
        "Side": "选择上/下半",
        "Enemy Traits": "敌方特性",
        "Buff": "增益效果",
        "Wave 1": "第一波",
        "Wave 2": "第二波",
        "Wave 3": "第三波",

        // 新增匹配
        "Enable hard mode?": "开启绝境模式？",
        "Character Catalog": "角色列表",
        "Reset": "重置",
        "Set": "选择",
        "Level": "等级",
        "Main Stat": "主属性",
        "Randomize Stats": "随机属性",
        "Randomize Rolls": "随机强化",
        "Head": "头部",
        "HEAD": "头部",
        "Body": "躯干",
        "BODY": "躯干",
        "Hand": "手部",
        "HAND": "手部",
        "Feet": "脚部",
        "FOOT": "脚部",
        "Planar Sphere": "位面球",
        "NECK": "位面球",
        "Link Rope": "连结绳",
        "OBJECT": "连结绳",
        "Relic Maker": "编辑遗器",
        "Relic Picker": "遗器列表",
        "First half enemies": "上半敌人详情",
        "Second half enemies": "下半敌人详情",
        "Connecting": "连接中",
        "Disconnect": "断开连接",
        "Sync": "同步",
        "Connected to Server!": "已连接到服务器！",
        "Sync successful": "同步成功！",
        "Pick Relic Set": "选择遗器",
        "Settings": "设置",
        "Language Settings": "语言设置",
        "EN": "EN（使用前请先关闭本脚本）",
        "Text": "文本",
        "Data Settings": "数据设置",
        "Current Database": "当前数据库",
        "Add Database": "添加数据库",
        "Create New DB": "创建新数据库",
        "Subsidiary Stat": "副属性"
    };

    // ===== 正则匹配文本 =====
    const regexTranslations = [
        { regex: /^Current Ult Energy: (\d+)$/, replace: "设置终结技能量为：$1" },
        { regex: /^Set to (\d+)%$/, replace: "设置为 $1%" },
        { regex: /^Superimposition ([1-5])$/, replace: "叠影 $1" }
    ];

    const processedPathDivs = new WeakSet();

    // ===== 检查特殊Lv.翻译条件 =====
    function shouldTranslateLv(node) {
        // 向上查找包含特定类名的div
        let parent = node.parentElement;
        while (parent) {
            if (parent.tagName === 'DIV' &&
                parent.classList.contains('px-3') &&
                parent.classList.contains('pt-3') &&
                parent.classList.contains('pb-1') &&
                parent.classList.contains('w-full') &&
                parent.classList.contains('flex') &&
                parent.classList.contains('justify-between') &&
                parent.classList.contains('items-center')) {
                return true;
            }
            parent = parent.parentElement;
            // 限制向上查找的层数，避免过度查找
            if (!parent || parent === document.body) break;
        }
        return false;
    }

    // ===== 翻译文本节点 =====
    function translateTextNode(node) {
        const text = node.textContent.trim();
        if (!text) return;

        // 精确匹配翻译
        if (exactTranslations[text]) {
            node.textContent = exactTranslations[text];
            return;
        }

        // 特殊处理：2-Pc: 和 4-Pc:
        if (text.includes("2-Pc:")) {
            node.textContent = text.replace(/2-Pc:/g, "二件套：");
            return;
        }
        if (text.includes("4-Pc:")) {
            node.textContent = text.replace(/4-Pc:/g, "四件套：");
            return;
        }

        // 特殊处理：Rarity:
        if (text.includes("Rarity:")) {
            node.textContent = text.replace(/Rarity:/g, "稀有度：");
            return;
        }

        // 特殊处理：强化次数
        if (text.includes("Total Roll")) {
            node.textContent = text.replace(/Total Roll/g, "强化次数");
            return;
        }

        // 特殊处理：Loading
        if (text.includes("Loading")) {
            node.textContent = text.replace(/Loading/g, "正在加载");
            return;
        }

        // 特殊处理：Upload
        if (text.includes("Upload")) {
            node.textContent = text.replace(/Upload/g, "上传");
            return;
        }

        // 特殊处理：特定div中的Lv.
        if (text === "Lv." && shouldTranslateLv(node)) {
            node.textContent = "等级";
            return;
        }

        // 正则匹配翻译
        for (const { regex, replace } of regexTranslations) {
            if (regex.test(text)) {
                node.textContent = text.replace(regex, replace);
                return;
            }
        }

        // Superimposition 特殊处理
        if (text.includes("Superimposition")) {
            node.textContent = text.replace(/Superimposition/g, "叠影");
        }
    }

    // ===== 遍历节点翻译 =====
    function translateNode(node) {
        if (node.nodeType === Node.TEXT_NODE) {
            translateTextNode(node);
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            if (node.tagName === 'DIV' && !processedPathDivs.has(node)) {
                handlePathDiv(node);
            }
            node.childNodes.forEach(translateNode);
        }
    }

    // ===== 处理 Path div =====
    function handlePathDiv(div) {
        const spans = div.querySelectorAll('span');
        if (spans.length === 3 && spans[0].textContent.includes("The following effects only work on characters of the Path of")) {
            const firstSpan = spans[0];
            const secondSpan = spans[1];
            const thirdSpan = spans[2];

            firstSpan.textContent = "以下效果仅对 ";
            thirdSpan.textContent = " 角色生效";

            const mo = new MutationObserver(() => {
                firstSpan.textContent = "以下效果仅对 ";
                thirdSpan.textContent = " 角色生效";
            });
            mo.observe(secondSpan, { characterData: true, childList: true, subtree: true });

            processedPathDivs.add(div);
        }
    }

    // ===== 扫描特殊文本 =====
    function processSpecialTexts() {
        document.querySelectorAll('body *').forEach(el => {
            el.childNodes.forEach(node => {
                if (node.nodeType === Node.TEXT_NODE) {
                    const text = node.textContent;

                    // 检查是否包含需要特殊处理的文本
                    if (text.includes("Superimposition") ||
                        text.includes("2-Pc:") ||
                        text.includes("4-Pc:") ||
                        text.includes("Rarity:") ||
                        (text.trim() === "Lv." && shouldTranslateLv(node))) {
                        translateTextNode(node);
                    }
                }
            });
        });
    }

    // ===== 初始翻译 =====
    translateNode(document.body);
    processSpecialTexts();

    // ===== 监听 DOM 新增节点 =====
    const observer = new MutationObserver(mutations => {
        for (const mutation of mutations) {
            mutation.addedNodes.forEach(node => {
                translateNode(node);
                processSpecialTexts();
            });
        }
    });

    observer.observe(document.body, { childList: true, subtree: true, characterData: true });

    // ===== 定期全局检查特殊文本 =====
    setInterval(processSpecialTexts, 1000);

})();