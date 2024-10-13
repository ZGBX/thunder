let mineArray = null;
let mineArea = getElement(".mineArea");
let tableData = [];
let flagArr = [];
let btns = getElementAll(".level>button");
let flagNum = getElement('.flagNum');
let mineNumber = getElement('.mineNum');

/**
 * 初始化雷区
 * 该函数用于生成一个包含雷区的数组
 *
 * @returns {Array} 返回一个包含雷区的数组
 */
function initMine() {
  const arr = Array.from({ length: curLevel.row * curLevel.col }, (_, i) => i);
  arr.sort(() => Math.random() - 0.5);
  return arr.slice(0, curLevel.mineNum);
}

/**
 * 清除当前场景
 * 该函数用于重置雷区、标志数组和雷数显示
 */
function clearScene() {
  mineArea.innerHTML = "";
  flagArr = [];
  flagNum.innerHTML = 0;
  mineNumber.innerHTML = curLevel.mineNum;
}

/**
 * 初始化游戏
 * 根据当前关卡创建雷区和对应的单元格布局
 */
function init() {
  clearScene();
  mineArray = initMine();
  const table = document.createElement("table");
  let index = 0;

  for (let i = 0; i < curLevel.row; i++) {
    const tr = document.createElement("tr");
    tableData[i] = [];

    for (let j = 0; j < curLevel.col; j++) {
      const td = document.createElement("td");
      const div = document.createElement("div");
      tableData[i][j] = { row: i, col: j, type: "number", value: 0, index, checked: false };

      div.dataset.id = index;
      div.classList.add("canFlag");

      if (mineArray.includes(tableData[i][j].index)) {
        tableData[i][j].type = "mine";
        div.classList.add("mine");
      }

      td.appendChild(div);
      tr.appendChild(td);
      index++;
    }

    table.appendChild(tr);
  }

  mineArea.appendChild(table);
  mineArea.onmousedown = handleMouseDown;
}

/**
 * 鼠标点击事件处理函数
 * 根据点击的按钮类型执行不同操作
 */
function handleMouseDown(e) {
  const target = e.target;
  if (target.classList.contains("canFlag")) {
    if (e.button === 0) searchArea(target);
    if (e.button === 2) flag(target);
  }
}

/**
 * 显示雷区答案
 * 将所有地雷标记并展示
 */
function showAnswer() {
  getElementAll("td>div.mine").forEach(mine => mine.style.opacity = 1);

  let isAllRight = true;
  flagArr.forEach(flag => {
    if (flag.classList.contains("mine")) {
      flag.classList.add("right");
    } else {
      flag.classList.add("error");
      isAllRight = false;
    }
  });

  if (!isAllRight || flagArr.length !== curLevel.mineNum) gameOver(false);
  mineArea.onmousedown = null;
}

/**
 * 获取指定单元格的对象数据
 * @param {Element} target - 单元格元素
 * @returns {Object} 对应的单元格数据
 */
function getTableItem(target) {
  const index = target.dataset.id;
  return tableData.flat().find(item => item.index == index);
}

/**
 * 获取周围的单元格范围
 * @param {Object} obj - 当前单元格数据
 * @returns {Object} 上下左右范围
 */
function getBound(obj) {
  const rowTop = Math.max(0, obj.row - 1);
  const rowBottom = Math.min(curLevel.row - 1, obj.row + 1);
  const colLeft = Math.max(0, obj.col - 1);
  const colRight = Math.min(curLevel.col - 1, obj.col + 1);
  return { rowTop, rowBottom, colLeft, colRight };
}

/**
 * 查找周围地雷的数量
 * @param {Object} obj - 当前单元格数据
 * @returns {number} 周围地雷的数量
 */
function findMineNum(obj) {
  const { rowTop, rowBottom, colLeft, colRight } = getBound(obj);
  let count = 0;

  for (let i = rowTop; i <= rowBottom; i++) {
    for (let j = colLeft; j <= colRight; j++) {
      if (tableData[i][j].type === "mine") count++;
    }
  }

  return count;
}

/**
 * 根据单元格数据返回对应的DOM元素
 * @param {Object} obj - 单元格数据
 * @returns {Element} DOM元素
 */
function getDom(obj) {
  return getElement(`[data-id="${obj.index}"]`);
}

/**
 * 检查未标记的格子是否全为地雷
 * 如果所有未标记的格子都是雷，判定为胜利
 */
function checkIfWinByRemainingCells() {
  const unflaggedCells = tableData.flat().filter(cell => {
    const dom = getDom(cell);
    return !dom.classList.contains("flag") && dom.classList.contains("canFlag");
  });

  if (unflaggedCells.every(cell => cell.type === "mine")) {
    gameOver(true);
  }
}

/**
 * 搜索九宫格区域
 * @param {Element} target - 点击的元素
 */
function getArround(target) {
  if (target.classList.contains("flag")) return;

  target.parentNode.style.border = "none";
  target.classList.remove("canFlag");

  const tableItem = getTableItem(target);
  if (!tableItem) return;

  tableItem.checked = true;
  const mineNum = findMineNum(tableItem);

  if (!mineNum) {
    const { rowTop, rowBottom, colLeft, colRight } = getBound(tableItem);
    for (let i = rowTop; i <= rowBottom; i++) {
      for (let j = colLeft; j <= colRight; j++) {
        if (!tableData[i][j].checked) getArround(getDom(tableData[i][j]));
      }
    }
  } else {
    const cl = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight"];
    target.classList.add(cl[mineNum]);
    target.innerText = mineNum;
  }
}

/**
 * 搜索区域
 * @param {Element} target - 被点击的元素
 */
function searchArea(target) {
  if (target.classList.contains("mine")) {
    target.classList.add("error");
    showAnswer();
    return;
  }

  getArround(target);
  checkIfWinByRemainingCells();
}

/**
 * 判断是否获胜
 * @returns {boolean} 是否获胜
 */
function isWin() {
  return flagArr.every(flag => flag.classList.contains("mine"));
}

/**
 * 游戏结束
 * @param {boolean} isWin - 是否获胜
 */
function gameOver(isWin) {
  const mess = isWin ? "恭喜你，游戏胜利！" : "游戏失败！";
  alert(mess);
}

/**
 * 标记地雷
 * @param {Element} target - 点击的元素
 */
function flag(target) {
  if (!target.classList.contains("canFlag")) return;

  if (!flagArr.includes(target)) {
    flagArr.push(target); // 添加到插旗数组
    target.classList.add("flag"); // 给元素添加插旗标记

    // 如果插满了旗，检查是否所有旗都插在地雷上
    if (flagArr.length === curLevel.mineNum) {
      if (isWin()) {
        gameOver(true); // 全部旗插对，游戏胜利
      } else {
        // 插满了旗，但没有覆盖所有地雷时，不立即结束游戏，只提示用户继续操作
        alert("已插满旗，但未覆盖所有雷，请继续排查。");
      }
    }
  } else {
    // 取消插旗
    const index = flagArr.indexOf(target);
    flagArr.splice(index, 1);
    target.classList.remove("flag");
  }

  flagNum.innerHTML = flagArr.length; // 更新插旗数量显示
  checkIfWinByRemainingCells(); // 检查剩余格子是否全部是地雷
}


/**
 * 绑定环境事件监听器
 * 为游戏区域绑定点击事件监听器，用于处理玩家的点击交互
 */
function bindEnv() {
  mineArea.oncontextmenu = e => e.preventDefault();
  
  getElement(".level").onclick = function (e) {
    btns.forEach(btn => btn.classList.remove("active"));
    e.target.classList.add("active");

    switch (e.target.innerHTML) {
      case "初级": curLevel = config.easy; break;
      case "中级": curLevel = config.normal; break;
      case "高级": curLevel = config.hard; break;
    }

    init();
  };
}

/**
 * 程序入口
 * 初始化程序并绑定环境变量
 */
function main() {
  init();
  bindEnv();
}

main();
