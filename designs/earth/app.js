// 初始化 Lucide 图标
lucide.createIcons();

// DOM 元素
const introModal = document.getElementById('introModal');
const startBtn = document.getElementById('startBtn');
const countryPanel = document.getElementById('countryPanel');
const closePanelBtn = document.getElementById('closePanelBtn');
const panelTitle = document.getElementById('panelTitle');
const panelIso = document.getElementById('panelIso');
const panelPop = document.getElementById('panelPop');
const panelLoading = document.getElementById('panelLoading');
const panelData = document.getElementById('panelData');
const aiSummary = document.getElementById('aiSummary');
const aiPop = document.getElementById('aiPop');
const aiDensity = document.getElementById('aiDensity');
const aiCities = document.getElementById('aiCities');
const aiFunFact = document.getElementById('aiFunFact');
const resetBtn = document.getElementById('resetBtn');
const rotateBtn = document.getElementById('rotateBtn');

// 状态
let selectedCountry = null;
let hoverCountry = null;
const INITIAL_VIEW = { lat: 35, lng: 105, altitude: 2.5 }; // 中国坐标

// 国家名称字典 (英文 -> 中文)
const countryNamesCN = {
    "China": "中国",
    "Taiwan": "中国台湾",
    "United States of America": "美国",
    "India": "印度",
    "Indonesia": "印度尼西亚",
    "Pakistan": "巴基斯坦",
    "Brazil": "巴西",
    "Nigeria": "尼日利亚",
    "Bangladesh": "孟加拉国",
    "Russia": "俄罗斯",
    "Mexico": "墨西哥",
    "Japan": "日本",
    "Ethiopia": "埃塞俄比亚",
    "Philippines": "菲律宾",
    "Egypt": "埃及",
    "Vietnam": "越南",
    "DR Congo": "刚果（金）",
    "Turkey": "土耳其",
    "Iran": "伊朗",
    "Germany": "德国",
    "Thailand": "泰国",
    "United Kingdom": "英国",
    "France": "法国",
    "Italy": "意大利",
    "Tanzania": "坦桑尼亚",
    "South Africa": "南非",
    "Myanmar": "缅甸",
    "Kenya": "肯尼亚",
    "South Korea": "韩国",
    "Colombia": "哥伦比亚",
    "Spain": "西班牙",
    "Argentina": "阿根廷",
    "Algeria": "阿尔及利亚",
    "Ukraine": "乌克兰",
    "Sudan": "苏丹",
    "Uganda": "乌干达",
    "Iraq": "伊拉克",
    "Poland": "波兰",
    "Canada": "加拿大",
    "Morocco": "摩洛哥",
    "Saudi Arabia": "沙特阿拉伯",
    "Uzbekistan": "乌兹别克斯坦",
    "Malaysia": "马来西亚",
    "Peru": "秘鲁",
    "Angola": "安哥拉",
    "Ghana": "加纳",
    "Mozambique": "莫桑比克",
    "Yemen": "也门",
    "Nepal": "尼泊尔",
    "Venezuela": "委内瑞拉",
    "Madagascar": "马达加斯加",
    "Cameroon": "喀麦隆",
    "Côte d'Ivoire": "科特迪瓦",
    "North Korea": "朝鲜",
    "Australia": "澳大利亚",
    "Niger": "尼日尔",
    "Sri Lanka": "斯里兰卡",
    "Burkina Faso": "布基纳法索",
    "Mali": "马里",
    "Romania": "罗马尼亚",
    "Malawi": "马拉维",
    "Chile": "智利",
    "Kazakhstan": "哈萨克斯坦",
    "Zambia": "赞比亚",
    "Guatemala": "危地马拉",
    "Ecuador": "厄瓜多尔",
    "Syria": "叙利亚",
    "Netherlands": "荷兰",
    "Senegal": "塞内加尔",
    "Cambodia": "柬埔寨",
    "Chad": "乍得",
    "Somalia": "索马里",
    "Zimbabwe": "津巴布韦",
    "Guinea": "几内亚",
    "Rwanda": "卢旺达",
    "Benin": "贝宁",
    "Burundi": "布隆迪",
    "Tunisia": "突尼斯",
    "Bolivia": "玻利维亚",
    "Belgium": "比利时",
    "Haiti": "海地",
    "Cuba": "古巴",
    "South Sudan": "南苏丹",
    "Dominican Rep.": "多米尼加",
    "Czechia": "捷克",
    "Greece": "希腊",
    "Jordan": "约旦",
    "Portugal": "葡萄牙",
    "Azerbaijan": "阿塞拜疆",
    "Sweden": "瑞典",
    "Honduras": "洪都拉斯",
    "United Arab Emirates": "阿联酋",
    "Hungary": "匈牙利",
    "Tajikistan": "塔吉克斯坦",
    "Belarus": "白俄罗斯",
    "Austria": "奥地利",
    "Papua New Guinea": "巴布亚新几内亚",
    "Serbia": "塞尔维亚",
    "Israel": "以色列",
    "Switzerland": "瑞士",
    "Togo": "多哥",
    "Sierra Leone": "塞拉利昂",
    "Laos": "老挝",
    "Paraguay": "巴拉圭",
    "Bulgaria": "保加利亚",
    "Libya": "利比亚",
    "Lebanon": "黎巴嫩",
    "Nicaragua": "尼加拉瓜",
    "Kyrgyzstan": "吉尔吉斯斯坦",
    "El Salvador": "萨尔瓦多",
    "Turkmenistan": "土库曼斯坦",
    "Singapore": "新加坡",
    "Denmark": "丹麦",
    "Finland": "芬兰",
    "Congo": "刚果（布）",
    "Slovakia": "斯洛伐克",
    "Norway": "挪威",
    "Oman": "阿曼",
    "State of Palestine": "巴勒斯坦",
    "Costa Rica": "哥斯达黎加",
    "Liberia": "利比里亚",
    "Ireland": "爱尔兰",
    "Central African Rep.": "中非",
    "New Zealand": "新西兰",
    "Mauritania": "毛里塔尼亚",
    "Panama": "巴拿马",
    "Kuwait": "科威特",
    "Croatia": "克罗地亚",
    "Moldova": "摩尔多瓦",
    "Georgia": "格鲁吉亚",
    "Eritrea": "厄立特里亚",
    "Uruguay": "乌拉圭",
    "Bosnia and Herz.": "波黑",
    "Mongolia": "蒙古",
    "Armenia": "亚美尼亚",
    "Jamaica": "牙买加",
    "Qatar": "卡塔尔",
    "Albania": "阿尔巴尼亚",
    "Lithuania": "立陶宛",
    "Namibia": "纳米比亚",
    "Gambia": "冈比亚",
    "Botswana": "博茨瓦纳",
    "Gabon": "加蓬",
    "Lesotho": "莱索托",
    "North Macedonia": "北马其顿",
    "Slovenia": "斯洛文尼亚",
    "Guinea-Bissau": "几内亚比绍",
    "Latvia": "拉脱维亚",
    "Bahrain": "巴林",
    "Eq. Guinea": "赤道几内亚",
    "Trinidad and Tobago": "特立尼达和多巴哥",
    "Estonia": "爱沙尼亚",
    "Timor-Leste": "东帝汶",
    "Mauritius": "毛里求斯",
    "Cyprus": "塞浦路斯",
    "Eswatini": "斯威士兰",
    "Djibouti": "吉布提",
    "Fiji": "斐济",
    "Comoros": "科摩罗",
    "Guyana": "圭亚那",
    "Bhutan": "不丹",
    "Solomon Is.": "所罗门群岛",
    "Montenegro": "黑山",
    "Luxembourg": "卢森堡",
    "Suriname": "苏里南",
    "Cabo Verde": "佛得角",
    "Micronesia": "密克罗尼西亚",
    "Malta": "马耳他",
    "Brunei": "文莱",
    "Belize": "伯利兹",
    "Bahamas": "巴哈马",
    "Maldives": "马尔代夫",
    "Iceland": "冰岛",
    "Vanuatu": "瓦努阿图",
    "Barbados": "巴巴多斯",
    "New Caledonia": "新喀里多尼亚",
    "French Polynesia": "法属波利尼西亚",
    "Samoa": "萨摩亚",
    "Saint Lucia": "圣卢西亚",
    "Kiribati": "基里巴斯",
    "Grenada": "格林纳达",
    "Tonga": "汤加",
    "Seychelles": "塞舌尔",
    "St. Vin. and Gren.": "圣文森特和格林纳丁斯",
    "Antigua and Barb.": "安提瓜和巴布达",
    "Andorra": "安道尔",
    "Dominica": "多米尼克",
    "Saint Kitts and Nevis": "圣基茨和尼维斯",
    "Liechtenstein": "列支敦士登",
    "Monaco": "摩纳哥",
    "San Marino": "圣马力诺",
    "Palau": "帕劳",
    "Tuvalu": "图瓦卢",
    "Nauru": "瑙鲁",
    "Vatican": "梵蒂冈"
};

function getCNName(name) {
    return countryNamesCN[name] || name;
}

// UI 处理程序
startBtn.addEventListener('click', () => {
    introModal.style.opacity = '0';
    setTimeout(() => introModal.style.display = 'none', 500);
});

closePanelBtn.addEventListener('click', () => {
    countryPanel.classList.add('translate-x-[120%]');
    document.body.classList.remove('panel-open');
    selectedCountry = null;
    // Resume auto-rotation
    world.controls().autoRotate = true;
    updateRotateBtnState(true);
});

// 视角控制
resetBtn.addEventListener('click', () => {
    world.pointOfView(INITIAL_VIEW, 1500);
});

rotateBtn.addEventListener('click', () => {
    const current = world.controls().autoRotate;
    world.controls().autoRotate = !current;
    updateRotateBtnState(!current);
});

function updateRotateBtnState(isRotating) {
    const icon = rotateBtn.querySelector('i');
    if (isRotating) {
        icon.setAttribute('data-lucide', 'pause');
        icon.classList.remove('text-gray-400');
        icon.classList.add('text-pink-400');
    } else {
        icon.setAttribute('data-lucide', 'play');
        icon.classList.remove('text-pink-400');
        icon.classList.add('text-gray-400');
    }
    lucide.createIcons();
}

// 颜色标尺
const colorScale = d3.scaleSequentialSqrt(d3.interpolateYlOrRd);
const getVal = d => d.properties.POP_EST;
colorScale.domain([0, 1e9]); // 最大人口约 10亿+

// 地球设置
const world = Globe()
    (document.getElementById('globeViz'))
    .globeImageUrl('//unpkg.com/three-globe/example/img/earth-night.jpg')
    .backgroundImageUrl('//unpkg.com/three-globe/example/img/night-sky.png')
    .lineHoverPrecision(0)
    .polygonsData([])
    .polygonAltitude(d => {
        // 高亮逻辑：如果悬停在中国或台湾，两者都抬起
        if (hoverCountry && (isChinaOrTaiwan(hoverCountry) && isChinaOrTaiwan(d))) {
            return 0.12;
        }
        return d === hoverCountry ? 0.12 : 0.06;
    })
    .polygonCapColor(d => {
        // 高亮逻辑：如果悬停在中国或台湾，两者都高亮
        if (hoverCountry && (isChinaOrTaiwan(hoverCountry) && isChinaOrTaiwan(d))) {
            return '#ff3333'; // 悬停时更亮的红色
        }

        // 始终将中国和台湾显示为红色
        if (isChinaOrTaiwan(d)) {
            return '#C00000'; // 中国红
        }

        return d === hoverCountry ? '#06b6d4' : colorScale(getVal(d));
    })
    .polygonSideColor(() => 'rgba(0, 100, 255, 0.15)')
    .polygonStrokeColor(() => '#111')
    .polygonLabel(({ properties: d }) => {
        let name = getCNName(d.NAME);
        let pop = d.POP_EST;

        // 中国/台湾的特殊标签
        if (d.NAME === 'China' || d.NAME === 'Taiwan') {
            // 我们可以尝试显示合并的人口，但对于单独悬停，只显示正确的名称就很好。
            // 让我们保持单独的数据但统一的视觉效果。
            // 或者我们可以将台湾的名称覆盖为“中国台湾”，我们在字典中已经这样做了。
        }

        return `
        <div style="background: rgba(0,0,0,0.8); color: white; padding: 8px 12px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.2); font-family: 'Inter', sans-serif;">
          <b style="font-size: 1.1em; color: #22d3ee;">${name}</b> <br />
          人口: <span style="color: #e879f9;">${(pop / 1e6).toFixed(2)} 百万</span>
        </div>
        `;
    })
    .onPolygonHover(hoverD => {
        hoverCountry = hoverD;
        world.polygonAltitude(world.polygonAltitude()); // 触发更新
        world.polygonCapColor(world.polygonCapColor());
        document.body.style.cursor = hoverD ? 'pointer' : 'default';
    })
    .onPolygonClick(feature => {
        if (feature) {
            showCountryDetails(feature.properties);
            world.controls().autoRotate = false;
            updateRotateBtnState(false);
        }
    })
    .atmosphereColor("#3a228a")
    .atmosphereAltitude(0.2);

// 检查特征是否为中国或台湾的辅助函数
function isChinaOrTaiwan(feature) {
    if (!feature || !feature.properties) return false;
    const name = feature.properties.NAME;
    return name === 'China' || name === 'Taiwan';
}

// 自动旋转配置
world.controls().autoRotate = true;
world.controls().autoRotateSpeed = 0.5;

// 获取数据
fetch('https://raw.githubusercontent.com/vasturiano/react-globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson')
    .then(res => res.json())
    .then(countries => {
        world.polygonsData(countries.features);
        // 设置初始视角
        setTimeout(() => {
            world.pointOfView(INITIAL_VIEW, 1000);
        }, 500);
    });

// 显示国家详情
async function showCountryDetails(properties) {
    selectedCountry = properties;

    let name = getCNName(properties.NAME);
    let iso = properties.ISO_A2;
    let pop = properties.POP_EST;

    // 中国/台湾点击的特殊处理
    if (properties.NAME === 'Taiwan' || properties.NAME === 'China') {
        name = "中国";
        iso = "CN";
        // 理想情况下我们求和人口，但对于这个模拟我们可以只显示“总计”或保持单独
        // 用户要求“中国板块”完整性。
        // 让我们为两者都显示“中国”。
    }

    // 更新标题
    panelTitle.innerText = name;
    panelIso.innerText = iso;
    panelPop.innerText = `人口: ${pop.toLocaleString()}`;

    // 显示面板
    countryPanel.classList.remove('translate-x-[120%]');
    document.body.classList.add('panel-open');

    // 加载状态
    panelLoading.classList.remove('hidden');
    panelData.classList.add('hidden');

    try {
        const analysis = await mockAnalyzeCountry(name, pop);
        updatePanelContent(analysis);
    } catch (err) {
        console.error(err);
    } finally {
        panelLoading.classList.add('hidden');
        panelData.classList.remove('hidden');
    }
}

function updatePanelContent(analysis) {
    aiSummary.innerText = analysis.summary;
    aiPop.innerText = analysis.population;
    aiDensity.innerText = `密度: ${analysis.density}`;
    aiFunFact.innerText = `"${analysis.funFact}"`;

    aiCities.innerHTML = '';
    analysis.majorCities.forEach(city => {
        const span = document.createElement('span');
        span.className = 'text-xs bg-pink-500/20 text-pink-200 px-2 py-1 rounded-full';
        span.innerText = city;
        aiCities.appendChild(span);
    });
}

// 模拟 AI 服务 (中文)
function mockAnalyzeCountry(name, pop) {
    return new Promise(resolve => {
        setTimeout(() => {
            // 生成中文模拟数据
            let summary = `${name} 是一个拥有丰富历史和多元文化的国家。它在地区中扮演着重要角色，拥有约 ${(pop / 1e6).toFixed(1)} 百万人口。`;
            let funFact = `你知道吗？${name} 拥有独特的地理特征，吸引着来自世界各地的游客。`;
            let density = pop > 100000000 ? "高密度" : "中等密度";
            let cities = ["首都", "经济中心", "港口城市"];

            if (name === '中国') {
                summary = "中国是世界上人口最多的国家之一，拥有五千年的悠久历史和灿烂文化。它是全球第二大经济体，在科技、制造和基础设施建设方面处于世界领先地位。";
                funFact = "中国拥有世界上最长的人造建筑——万里长城，以及丰富多样的自然景观。";
                cities = ["北京", "上海", "深圳"];
                density = "东部高密度";
            } else if (name === '美国') {
                summary = "美国是世界第一大经济体，以其多元文化和科技创新而闻名。";
                funFact = "美国拥有世界上最庞大的国家公园系统之一。";
                cities = ["纽约", "洛杉矶", "芝加哥"];
            } else if (name === '日本') {
                summary = "日本是一个位于东亚的岛国，以其独特的传统文化和现代科技的完美融合而著称。";
                funFact = "日本拥有世界上最繁忙的火车站——新宿站。";
                cities = ["东京", "大阪", "京都"];
            }

            resolve({
                summary: summary,
                population: `${(pop / 1e6).toFixed(1)} 百万`,
                majorCities: cities,
                density: density,
                funFact: funFact
            });
        }, 1000);
    });
}

// 处理调整大小
window.addEventListener('resize', () => {
    world.width(window.innerWidth);
    world.height(window.innerHeight);
});
